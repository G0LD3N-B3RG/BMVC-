# Chat_Online/app/models/chat.py
from datetime import datetime, timedelta, timezone
import os
import base64
from .mensagem import Mensagem
from .usuario import Usuario

class Chat:
    def __init__(self):
        self.mensagens = []
        self.online = {}
        self.upload_folder = "app/static/uploads"
        # Criar diretórios se não existirem
        os.makedirs(f"{self.upload_folder}/images", exist_ok=True)
        os.makedirs(f"{self.upload_folder}/audios", exist_ok=True)

    def adicionar_mensagem(self, nome: str, conteudo: str, tipo='texto', image_data=None, audio_data=None, audio_duration=None):
        if not nome or (tipo == 'texto' and not conteudo) or (tipo == 'imagem' and not image_data) or (tipo == 'audio' and not audio_data):
            return None
            
        usuario = Usuario(nome)
        
        if tipo == 'imagem':
            msg = self._processar_imagem(usuario, conteudo, image_data)
        elif tipo == 'audio':
            msg = self._processar_audio(usuario, conteudo, audio_data, audio_duration)
        else:
            msg = Mensagem(conteudo, usuario, tipo)
            
        if msg:
            self.mensagens.append(msg)
        return msg

    def _processar_imagem(self, usuario, conteudo, image_data):
        """Processa e salva imagem"""
        try:
            if ',' in image_data:
                format_info, image_data = image_data.split(',', 1)
            
            image_bytes = base64.b64decode(image_data)
            
            file_extension = self._get_image_extension(conteudo)
            filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{usuario.nome}{file_extension}"
            filepath = os.path.join(f"{self.upload_folder}/images", filename)
            
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            return Mensagem(
                conteudo=conteudo,
                remetente=usuario,
                tipo='imagem',
                image_data=f"data:image/{file_extension[1:]};base64,{image_data}",
                image_filename=filename
            )
            
        except Exception as e:
            print(f"Erro ao processar imagem: {e}")
            return Mensagem(
                conteudo=f"❌ Erro ao enviar imagem: {str(e)}",
                remetente=usuario,
                tipo='texto'
            )

    def _processar_audio(self, usuario, conteudo, audio_data, audio_duration):
        """Processa mensagem de áudio"""
        try:
            if ',' in audio_data:
                format_info, audio_data = audio_data.split(',', 1)
            
            audio_bytes = base64.b64decode(audio_data)
            
            filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{usuario.nome}.wav"
            filepath = os.path.join(f"{self.upload_folder}/audios", filename)
            
            with open(filepath, 'wb') as f:
                f.write(audio_bytes)
            
            return Mensagem(
                conteudo=conteudo,
                remetente=usuario,
                tipo='audio',
                audio_data=f"data:audio/wav;base64,{audio_data}",
                audio_duration=audio_duration
            )
            
        except Exception as e:
            print(f"Erro ao processar áudio: {e}")
            return Mensagem(
                conteudo=f"❌ Erro ao enviar áudio: {str(e)}",
                remetente=usuario,
                tipo='texto'
            )

    def _get_image_extension(self, conteudo):
        if 'jpeg' in conteudo.lower() or 'jpg' in conteudo.lower():
            return '.jpg'
        elif 'png' in conteudo.lower():
            return '.png'
        elif 'gif' in conteudo.lower():
            return '.gif'
        elif 'webp' in conteudo.lower():
            return '.webp'
        else:
            return '.jpg'

    def update_online(self, username: str):
        self.online[username] = datetime.now(timezone.utc)

    def _limpar_online(self):
        now = datetime.now(timezone.utc)
        timeout = timedelta(seconds=30)
        self.online = {n: t for n, t in self.online.items() if now - t < timeout}

    def get_data_desde(self, since_str: str):
        self._limpar_online()
        online_list = sorted(self.online.keys())

        msgs = self.mensagens
        if since_str:
            try:
                since = datetime.fromisoformat(since_str)
                msgs = [m for m in self.mensagens if m.timestamp > since]
            except ValueError:
                msgs = []
        
        return {
            'messages': [m.to_dict() for m in msgs],
            'online': online_list
        }

    def serve_audio(self, filename):
        """Serve áudios do diretório de upload"""
        try:
            safe_filename = filename.split('/')[-1]
            filepath = os.path.join(f"{self.upload_folder}/audios", safe_filename)
            if os.path.exists(filepath):
                return filepath
            return None
        except Exception:
            return None