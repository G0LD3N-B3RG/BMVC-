# app/models/mensagem.py - VERSÃO CORRIGIDA
from datetime import datetime, timezone
from app.models.database import Database

class Mensagem:
    def __init__(self, id, conteudo, usuario_id, tipo='texto', 
                 image_filename=None, audio_filename=None, audio_duration=None,
                 conversa_id=None, chat_id=None, chat_type=None, created_at=None, **kwargs):
        self.id = id
        self.conteudo = conteudo
        self.usuario_id = usuario_id
        self.tipo = tipo
        self.image_filename = image_filename
        self.audio_filename = audio_filename
        self.audio_duration = audio_duration
        self.conversa_id = conversa_id
        self.chat_id = chat_id
        self.chat_type = chat_type
        self.created_at = created_at or datetime.now(timezone.utc)
        
        # Obter username de forma segura
        if hasattr(self, 'username') and self.username:
            self.nome = self.username
        else:
            from app.models.usuario import Usuario
            usuario = Usuario.buscar_por_id(self.usuario_id)
            self.nome = usuario.username if usuario else 'Usuário Desconhecido'

    @classmethod
    def criar(cls, conteudo, usuario_id, tipo='texto', **kwargs):
        """Cria uma nova mensagem - VERSÃO 100% CORRIGIDA"""
        db = Database()
        with db.get_cursor() as cur:
            # EXTRAIR TODOS OS PARÂMETROS CORRETAMENTE
            image_filename = kwargs.get('image_filename')
            audio_filename = kwargs.get('audio_filename')
            audio_duration = kwargs.get('audio_duration')
            conversa_id = kwargs.get('conversa_id')  # ✅ AGORA ESTÁ SENDO USADO
            chat_id = kwargs.get('chat_id', 'general')
            chat_type = kwargs.get('chat_type', 'group')

            print(f"🎯 [MENSAGEM-CRIAR] Criando mensagem:")
            print(f"   📝 Conteúdo: '{conteudo}'")
            print(f"   👤 Usuário: {usuario_id}")
            print(f"   💬 Conversa: {conversa_id}")
            print(f"   🆔 Chat: {chat_id}")

            # INCLUIR conversa_id
            cur.execute('''
                INSERT INTO mensagens 
                (usuario_id, conteudo, tipo, image_filename, audio_filename, 
                audio_duration, conversa_id, chat_id, chat_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            ''', (
                usuario_id, conteudo, tipo, 
                image_filename, audio_filename, audio_duration,
                conversa_id, chat_id, chat_type  # ✅ conversa_id INCLUÍDO
            ))
            
            result = cur.fetchone()
            
            print(f"✅ [MENSAGEM-CRIAR] Mensagem criada: ID {result['id']}, Conversa: {conversa_id}")

            # ATUALIZAR ÚLTIMA MENSAGEM DA CONVERSA (se tiver conversa_id)
            if conversa_id:
                try:
                    from app.models.conversa import Conversa
                    conversa = Conversa.buscar_por_id(conversa_id)
                    if conversa:
                        # Criar preview
                        preview = conteudo
                        if tipo == 'imagem':
                            preview = '📷 Imagem'
                        elif tipo == 'audio':
                            preview = '🎤 Áudio'
                        elif len(conteudo) > 30:
                            preview = conteudo[:30] + '...'
                        
                        conversa.atualizar_ultima_mensagem(preview)
                        print(f"✅ [MENSAGEM-CRIAR] Preview atualizado: '{preview}'")
                except Exception as e:
                    print(f"⚠️ [MENSAGEM-CRIAR] Erro ao atualizar preview: {e}")
            
            # RETORNAR INSTÂNCIA
            return cls(
                result['id'], conteudo, usuario_id, tipo,
                image_filename, audio_filename, audio_duration,
                conversa_id, chat_id, chat_type, result['created_at']
            )

    def to_dict(self):
        data = {
            'id': self.id,
            'nome': self.nome,
            'conteudo': self.conteudo,
            'timestamp': self.created_at.isoformat(),
            'type': self.tipo,
            'chat_id': self.chat_id,
            'chat_type': self.chat_type
        }
        
        if self.conversa_id:
            data['conversa_id'] = self.conversa_id
            
        if self.tipo == 'imagem' and self.image_filename:
            data['image_filename'] = self.image_filename
        elif self.tipo == 'audio' and self.audio_filename:
            data['audio_filename'] = self.audio_filename
            data['audio_duration'] = self.audio_duration
        
        if hasattr(self, 'edited_at') and self.edited_at:
            data['edited_at'] = self.edited_at.isoformat()
            data['is_edited'] = True
        else:
            data['is_edited'] = False
           
        return data

    @classmethod
    def buscar_por_conversa(cls, conversa_id, since=None):
        db = Database()
        with db.get_cursor() as cur:
            query = '''
                SELECT m.*, u.username 
                FROM mensagens m
                JOIN usuarios u ON m.usuario_id = u.id
                WHERE m.conversa_id = %s
            '''
            params = [conversa_id]
            
            if since:
                query += ' AND m.created_at > %s'
                params.append(since)
                
            query += ' ORDER BY m.created_at ASC'
            
            cur.execute(query, params)
            
            mensagens = []
            for row in cur.fetchall():
                mensagem_data = {
                    'id': row['id'],
                    'conteudo': row['conteudo'],
                    'usuario_id': row['usuario_id'],
                    'tipo': row['tipo'],
                    'image_filename': row['image_filename'],
                    'audio_filename': row['audio_filename'],
                    'audio_duration': row['audio_duration'],
                    'conversa_id': row['conversa_id'],
                    'chat_id': row['chat_id'],
                    'chat_type': row['chat_type'],
                    'created_at': row['created_at'],
                    'username': row['username']
                }
                
                mensagem_data = {k: v for k, v in mensagem_data.items() if v is not None}
                mensagens.append(cls(**mensagem_data))
                
            return mensagens

    @classmethod
    def buscar_por_chat(cls, chat_id, since=None):
        db = Database()
        with db.get_cursor() as cur:
            query = '''
                SELECT m.*, u.username 
                FROM mensagens m
                JOIN usuarios u ON m.usuario_id = u.id
                WHERE m.chat_id = %s
            '''
            params = [chat_id]
            
            if since:
                query += ' AND m.created_at > %s'
                params.append(since)
                
            query += ' ORDER BY m.created_at ASC'
            
            cur.execute(query, params)
            
            mensagens = []
            for row in cur.fetchall():
                mensagem_data = {
                    'id': row['id'],
                    'conteudo': row['conteudo'],
                    'usuario_id': row['usuario_id'],
                    'tipo': row['tipo'],
                    'image_filename': row['image_filename'],
                    'audio_filename': row['audio_filename'],
                    'audio_duration': row['audio_duration'],
                    'conversa_id': row['conversa_id'],
                    'chat_id': row['chat_id'],
                    'chat_type': row['chat_type'],
                    'created_at': row['created_at'],
                    'username': row['username']
                }
                
                mensagem_data = {k: v for k, v in mensagem_data.items() if v is not None}
                mensagens.append(cls(**mensagem_data))
                
            return mensagens