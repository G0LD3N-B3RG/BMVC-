# app/models/database.py - VERSÃO COMPLETA E CORRIGIDA
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.conn_params = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'chat_online'),
            'user': os.getenv('DB_USER', 'chat_user'),
            'password': os.getenv('DB_PASSWORD', 'chat_password'),
            'port': os.getenv('DB_PORT', '5432')
        }

    @contextmanager
    def get_connection(self):
        """Context manager para conexão"""
        conn = None
        try:
            conn = psycopg2.connect(**self.conn_params)
            yield conn
        except Exception as e:
            print(f"❌ Erro de conexão: {e}")
            raise
        finally:
            if conn:
                conn.close()

    @contextmanager
    def get_cursor(self):
        """Context manager para cursor"""
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            try:
                yield cursor
                conn.commit()  # Commit se não houve erro
            except Exception as e:
                conn.rollback()  # Rollback em caso de erro
                print(f"❌ Erro no cursor: {e}")
                raise

    def init_db(self):
        """Inicialização completa do banco de dados"""
        print("🔄 Criando tabelas...")
        
        try:
            with self.get_cursor() as cur:
                # TABELA USUARIOS (base de tudo)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS usuarios (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_online BOOLEAN DEFAULT FALSE,
                        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                print("✅ Tabela 'usuarios' criada/verificada")
                
                # TABELA SESSOES (depende de usuarios)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS sessoes (
                        id SERIAL PRIMARY KEY,
                        usuario_id INTEGER REFERENCES usuarios(id),
                        session_token VARCHAR(255) UNIQUE NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                print("✅ Tabela 'sessoes' criada/verificada")
                
                # TABELA CONVERSAS (depende de usuarios)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS conversas (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(255),
                        tipo VARCHAR(20) NOT NULL,
                        criado_por INTEGER REFERENCES usuarios(id),
                        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ultima_mensagem TEXT,
                        ultima_mensagem_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                print("✅ Tabela 'conversas' criada/verificada")
                
                # TABELA PARTICIPANTES_CONVERSA (depende de conversas e usuarios)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS participantes_conversa (
                        id SERIAL PRIMARY KEY,
                        conversa_id INTEGER REFERENCES conversas(id) ON DELETE CASCADE,
                        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                        entrou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ultima_mensagem_vista INTEGER DEFAULT 0,
                        UNIQUE(conversa_id, usuario_id)
                    )
                ''')
                print("✅ Tabela 'participantes_conversa' criada/verificada")
                
                # TABELA MENSAGENS (depende de usuarios e conversas)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS mensagens (
                        id SERIAL PRIMARY KEY,
                        usuario_id INTEGER REFERENCES usuarios(id),
                        conteudo TEXT,
                        tipo VARCHAR(20) DEFAULT 'texto',
                        image_filename VARCHAR(255),
                        audio_filename VARCHAR(255),
                        audio_duration INTEGER,
                        chat_id VARCHAR(100) DEFAULT 'general',
                        chat_type VARCHAR(20) DEFAULT 'group',
                        conversa_id INTEGER REFERENCES conversas(id) ON DELETE SET NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                print("✅ Tabela 'mensagens' criada/verificada")
                
                # TABELA PEDIDOS_AMIZADE (depende de usuarios)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS pedidos_amizade (
                        id SERIAL PRIMARY KEY,
                        de_usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                        para_usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                        status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                print("✅ Tabela 'pedidos_amizade' criada/verificada")
                
                # TABELA AMIZADES (depende de usuarios)
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS amizades (
                        id SERIAL PRIMARY KEY,
                        usuario_id1 INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                        usuario_id2 INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(usuario_id1, usuario_id2)
                    )
                ''')
                print("✅ Tabela 'amizades' criada/verificada")
                
                # ADICIONAR COLUNAS FALTANTES SE NECESSÁRIO
                try:
                    # Garantir que a coluna conversa_id existe em mensagens
                    cur.execute('''
                        ALTER TABLE mensagens 
                        ADD COLUMN IF NOT EXISTS conversa_id INTEGER REFERENCES conversas(id) ON DELETE SET NULL
                    ''')
                    print("✅ Coluna 'conversa_id' em mensagens verificada")
                except Exception as e:
                    print(f"⚠️ Aviso na coluna conversa_id: {e}")
                
                try:
                    # Garantir que a coluna ultima_mensagem_vista existe em participantes_conversa
                    cur.execute('''
                        ALTER TABLE participantes_conversa 
                        ADD COLUMN IF NOT EXISTS ultima_mensagem_vista INTEGER DEFAULT 0
                    ''')
                    print("✅ Coluna 'ultima_mensagem_vista' em participantes_conversa verificada")
                except Exception as e:
                    print(f"⚠️ Aviso na coluna ultima_mensagem_vista: {e}")

            print("🎉 Todas as tabelas foram criadas/verificadas com sucesso!")
            
        except Exception as e:
            print(f"❌ Erro fatal ao inicializar banco: {e}")
            raise

    def test_connection(self):
        """Testa a conexão com o banco"""
        try:
            with self.get_cursor() as cur:
                cur.execute("SELECT version();")
                version = cur.fetchone()
                print(f"✅ Conectado ao PostgreSQL: {version[0]}")
                return True
        except Exception as e:
            print(f"❌ Falha na conexão: {e}")
            return False

# SCRIPT DE VERIFICAÇÃO RÁPIDA
if __name__ == '__main__':
    db = Database()
    if db.test_connection():
        print("✅ Conexão com banco OK!")
        try:
            db.init_db()
            print("🎉 Banco inicializado com sucesso!")
        except Exception as e:
            print(f"❌ Erro na inicialização: {e}")
    else:
        print("❌ Problemas na conexão com o banco")