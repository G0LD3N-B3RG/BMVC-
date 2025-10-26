# Chat_Online/app/models/mensagem.py
from datetime import datetime, timezone
import uuid

class Mensagem:
    def __init__(self, conteudo: str, remetente, tipo='texto', image_data=None, image_filename=None, audio_data=None, audio_duration=None):
        self.conteudo = conteudo.strip()
        self.remetente = remetente
        self.timestamp = datetime.now(timezone.utc)
        self.id = str(uuid.uuid4())
        self.tipo = tipo
        self.image_data = image_data
        self.image_filename = image_filename
        self.audio_data = audio_data
        self.audio_duration = audio_duration

    def to_dict(self):
        data = {
            'id': self.id,
            'nome': self.remetente.nome,
            'conteudo': self.conteudo,
            'timestamp': self.timestamp.isoformat(),
            'type': self.tipo
        }
        if self.tipo == 'imagem' and self.image_data:
            data['image_data'] = self.image_data
            data['image_filename'] = self.image_filename
        elif self.tipo == 'audio' and self.audio_data:
            data['audio_data'] = self.audio_data
            data['audio_duration'] = self.audio_duration
        return data