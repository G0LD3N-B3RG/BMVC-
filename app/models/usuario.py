# app/models/usuario.py 
import bcrypt
import secrets
from datetime import datetime, timedelta
from app.models.database import Database
import psycopg2

class Usuario:
    def __init__(self, id, username, created_at=None, is_online=False):
        self.id = id
        self.username = username
        self.created_at = created_at
        self.is_online = is_online

    @classmethod
    def criar(cls, username, password):
        db = Database()
        password_hash = cls._hash_password(password)
        
        with db.get_cursor() as cur:
            try:
                cur.execute('''
                    INSERT INTO usuarios (username, password_hash)
                    VALUES (%s, %s) RETURNING id, created_at
                ''', (username, password_hash))
                
                result = cur.fetchone()
                return cls(result['id'], username, result['created_at'])
            except psycopg2.IntegrityError:
                return None  # Usuário já existe
            except Exception as e:
                print(f"Erro ao criar usuário: {e}")
                return None

    @classmethod
    def autenticar(cls, username, password):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT id, username, password_hash, created_at, is_online
                FROM usuarios WHERE username = %s
            ''', (username,))
            
            result = cur.fetchone()
            if result and cls._verify_password(password, result['password_hash']):
                return cls(
                    result['id'], 
                    result['username'],
                    result['created_at'],
                    result['is_online']
                )
        return None

    @classmethod
    def buscar_por_id(cls, user_id):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT id, username, created_at, is_online
                FROM usuarios WHERE id = %s
            ''', (user_id,))
            
            result = cur.fetchone()
            if result:
                return cls(
                    result['id'], 
                    result['username'],
                    result['created_at'],
                    result['is_online']
                )
        return None

    @classmethod
    def buscar_por_username(cls, username):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT id, username, created_at, is_online
                FROM usuarios WHERE username = %s
            ''', (username,))
            
            result = cur.fetchone()
            if result:
                return cls(
                    result['id'], 
                    result['username'],
                    result['created_at'],
                    result['is_online']
                )
        return None

    @staticmethod
    def _hash_password(password):
        # BCRYPT - MUITO MAIS SEGURO!
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def _verify_password(password, password_hash):
        # BCRYPT - Verificação segura
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception:
            return False

    def atualizar_online_status(self, is_online=True):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                UPDATE usuarios 
                SET is_online = %s, last_seen = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (is_online, self.id))

    @classmethod
    def listar_online(cls):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT id, username, created_at, is_online
                FROM usuarios 
                WHERE is_online = TRUE 
                ORDER BY username
            ''')
            
            results = cur.fetchall()
            usuarios = []
            for row in results:
                usuarios.append(cls(
                    row['id'], 
                    row['username'],
                    row['created_at'],
                    row['is_online']
                ))
            return usuarios

    def criar_sessao(self):
        db = Database()
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        with db.get_cursor() as cur:
            cur.execute('''
                INSERT INTO sessoes (usuario_id, session_token, expires_at)
                VALUES (%s, %s, %s)
            ''', (self.id, session_token, expires_at))
            
        return session_token

    @classmethod
    def validar_sessao(cls, session_token):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT u.id, u.username, u.created_at, u.is_online
                FROM usuarios u
                JOIN sessoes s ON u.id = s.usuario_id
                WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP
            ''', (session_token,))
            
            result = cur.fetchone()
            if result:
                return cls(
                    result['id'], 
                    result['username'],
                    result['created_at'],
                    result['is_online']
                )
        return None

    def invalidar_sessao(self, session_token):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('DELETE FROM sessoes WHERE usuario_id = %s AND session_token = %s', 
                       (self.id, session_token))