# Chat_Online/app/controllers/application.py
import json
from datetime import datetime, timedelta
from bottle import template, request, response, redirect, static_file
import os

from app.models.usuario import Usuario
from app.models.mensagem import Mensagem
from app.models.chat import Chat

class Application():
    def __init__(self):
        self.chat = Chat()
        self.pages = {
            'helper': self.helper_page,
            'chat': self.chat_page,
            'home': self.home_page
        }

    def render(self, page, **kwargs):
        content = self.pages.get(page, self.helper_page)
        return content(**kwargs)

    def helper_page(self, **kwargs):
        return template('app/views/html/helper', **kwargs)

    def chat_page(self, **kwargs):
        return template('app/views/html/chat', **kwargs)

    def chat_get(self):
        return self.render('chat')

    def send_message(self):
        try:
            data = request.json
            name = data.get('name', '').strip()
            content = data.get('content', '').strip()
            message_type = data.get('type', 'texto')
            image_data = data.get('image_data')
            audio_data = data.get('audio_data')
            audio_duration = data.get('audio_duration')

            if message_type == 'imagem':
                if not name or not image_data:
                    response.status = 400
                    return json.dumps({'error': 'Nome e image_data são obrigatórios para imagem'})
                
                if len(image_data) > 7 * 1024 * 1024:
                    response.status = 400
                    return json.dumps({'error': 'Imagem muito grande. Tamanho máximo: 5MB.'})
                
                msg = self.chat.adicionar_mensagem(name, content, message_type, image_data=image_data)
            elif message_type == 'audio':
                if not name or not audio_data:
                    response.status = 400
                    return json.dumps({'error': 'Nome e audio_data são obrigatórios para áudio'})
                
                if len(audio_data) > 14 * 1024 * 1024:
                    response.status = 400
                    return json.dumps({'error': 'Áudio muito grande. Tamanho máximo: 10MB.'})
                
                msg = self.chat.adicionar_mensagem(name, content, message_type, audio_data=audio_data, audio_duration=audio_duration)
            else:
                if not name or not content:
                    response.status = 400
                    return json.dumps({'error': 'Nome e conteúdo são obrigatórios'})
                msg = self.chat.adicionar_mensagem(name, content)

            if msg:
                self.chat.update_online(name)
                return json.dumps(msg.to_dict())
            else:
                response.status = 400
                return json.dumps({'error': 'Falha ao criar mensagem'})
                
        except Exception as e:
            response.status = 500
            return json.dumps({'error': str(e)})

    def get_messages(self):
        name = request.query.get('name', '').strip()
        if name:
            self.chat.update_online(name)
        since = request.query.get('since', '').strip()
        data = self.chat.get_data_desde(since)
        return json.dumps(data)

    def serve_image(self, filename):
        """Serve imagens do diretório de upload"""
        try:
            safe_filename = filename.split('/')[-1]
            return static_file(safe_filename, root=f"{self.chat.upload_folder}/images")
        except Exception as e:
            response.status = 404
            return f"Imagem não encontrada: {e}"

    def serve_audio(self, filename):
        """Serve áudios do diretório de upload"""
        try:
            safe_filename = filename.split('/')[-1]
            return static_file(safe_filename, root=f"{self.chat.upload_folder}/audios")
        except Exception as e:
            response.status = 404
            return f"Áudio não encontrado: {e}"
        
        
    def home_page(self, **kwargs):
        return template('app/views/html/home', **kwargs)

    def home_get(self):
        return self.render('home')

    def chat_get(self):
        # Removemos o redirecionamento para forçar login
        return self.render('chat')