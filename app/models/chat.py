# app/models/chat.py - VERSÃO CORRIGIDA
from datetime import datetime, timezone
import os
import base64
from app.models.mensagem import Mensagem
from app.models.conversa import Conversa
from app.models.database import Database  

class Chat:
    def __init__(self):
        self.upload_folder = "app/static/uploads"
        os.makedirs(f"{self.upload_folder}/images", exist_ok=True)
        os.makedirs(f"{self.upload_folder}/audios", exist_ok=True)

    def adicionar_mensagem(self, usuario_id, conteudo, tipo='texto', **kwargs):
        """Processa e cria mensagens"""
        try:
            chat_id = kwargs.get('chat_id', 'general')
            chat_type = kwargs.get('chat_type', 'group')
            participants = kwargs.get('participants', [])
            conversa_id = kwargs.get('conversa_id') 
            
            print(f"🎯 [CHAT] Criando mensagem - usuario: {usuario_id}, chat: {chat_id}, conversa: {conversa_id}")
            
            # Determinar conversa_id
            conversa_id = self._obter_conversa_id(chat_id, chat_type, usuario_id, participants)
            
            message_data = {
                'chat_id': chat_id,
                'chat_type': chat_type,
                'conversa_id': conversa_id
            }
            
            print(f"📦 [CHAT] Dados da mensagem: {message_data}")
            
            # Adicionar parâmetros específicos por tipo
            if tipo == 'imagem':
                image_data = kwargs.get('image_data')
                if not image_data:
                    return None
                    
                message_data['image_filename'] = self._processar_imagem_upload(usuario_id, image_data, conteudo)
                
            elif tipo == 'audio':
                audio_data = kwargs.get('audio_data')
                if not audio_data:
                    return None
                    
                message_data['audio_filename'] = self._processar_audio_upload(usuario_id, audio_data)
                message_data['audio_duration'] = kwargs.get('audio_duration')
            
            # CRIAR MENSAGEM
            mensagem = Mensagem.criar(conteudo, usuario_id, tipo, **message_data)
            
            if mensagem:
                print(f"✅ [CHAT] Mensagem criada: ID {mensagem.id}, Conversa: {mensagem.conversa_id}")
                return mensagem
            else:
                print("❌ [CHAT] Falha ao criar mensagem")
                return None
                
        except Exception as e:
            print(f"💥 [CHAT] Erro em adicionar_mensagem: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _obter_conversa_id(self, chat_id, chat_type, usuario_id, participantes):
        """Obtém ID da conversa"""
        try:
            if not chat_id or not chat_type:
                return None
                
            print(f"🔍 Buscando conversa_id: chat_id={chat_id}, chat_type={chat_type}, usuario_id={usuario_id}")
            
            if chat_type == 'private':
                # Para chats privados: private-user1-user2
                if chat_id.startswith('private-'):
                    partes = chat_id.replace('private-', '').split('-')
                    if len(partes) == 2:
                        from app.models.usuario import Usuario
                        
                        usuario1 = Usuario.buscar_por_username(partes[0])
                        usuario2 = Usuario.buscar_por_username(partes[1])
                        
                        if usuario1 and usuario2:
                            conversa = Conversa.buscar_ou_criar_privada(usuario1.id, usuario2.id)
                            return conversa.id if conversa else None
            
            elif chat_type == 'group':
                if chat_id == 'general':
                    return None  # Chat geral não tem conversa_id
                else:
                    # Para grupos: o chat_id já é o ID da conversa
                    try:
                        return int(chat_id)
                    except ValueError:
                        print(f"⚠️ chat_id não é um ID válido: {chat_id}")
                        return None
            
            return None
        except Exception as e:
            print(f"❌ Erro ao obter conversa_id: {e}")
            return None

    def _processar_imagem_upload(self, usuario_id, image_data, conteudo):
        """Processa upload de imagem e retorna filename"""
        try:
            if ',' in image_data:
                format_info, image_data = image_data.split(',', 1)
            
            image_bytes = base64.b64decode(image_data)
            
            file_extension = self._get_image_extension(conteudo)
            filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{usuario_id}{file_extension}"
            filepath = os.path.join(f"{self.upload_folder}/images", filename)
            
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            return filename
            
        except Exception as e:
            print(f"❌ Erro ao processar imagem: {e}")
            raise

    def _processar_audio_upload(self, usuario_id, audio_data):
        """Processa upload de áudio e retorna filename"""
        try:
            if ',' in audio_data:
                format_info, audio_data = audio_data.split(',', 1)
            
            audio_bytes = base64.b64decode(audio_data)
            
            filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{usuario_id}.wav"
            filepath = os.path.join(f"{self.upload_folder}/audios", filename)
            
            with open(filepath, 'wb') as f:
                f.write(audio_bytes)
            
            return filename
            
        except Exception as e:
            print(f"❌ Erro ao processar áudio: {e}")
            raise

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

    def get_data_desde(self, since_str: str, chat_id=None, conversa_id=None):
        """Método unificado para buscar mensagens"""
        since = None
        if since_str:
            try:
                since = datetime.fromisoformat(since_str.replace('Z', '+00:00'))
            except ValueError:
                since = None
        
        # PRIORIDADE PARA CONVERSAS
        if conversa_id:
            mensagens = Mensagem.buscar_por_conversa(conversa_id, since)
        else:
            mensagens = Mensagem.buscar_por_chat(chat_id or 'general', since)
        
        from app.models.usuario import Usuario
        usuarios_online = [user.username for user in Usuario.listar_online()]
        
        return {
            'messages': [m.to_dict() for m in mensagens],
            'online': usuarios_online
        }