# test_db.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import Database

def test_connection():
    print("🧪 Testando conexão com o banco...")
    try:
        db = Database()
        with db.get_cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()
            print(f"✅ Conectado ao PostgreSQL: {version[0]}")
            
            # Testar se o usuário tem permissões
            cur.execute("SELECT current_user, current_database();")
            user, database = cur.fetchone()
            print(f"👤 Usuário: {user}, Banco: {database}")
            
        return True
    except Exception as e:
        print(f"❌ Falha na conexão: {e}")
        print("\n🔧 Verifique:")
        print("1. PostgreSQL está rodando?")
        print("2. As credenciais no .env estão corretas?")
        print("3. O usuário chat_user existe e tem permissões?")
        return False

if __name__ == '__main__':
    if test_connection():
        print("\n🎉 Conexão bem-sucedida! Agora execute: python init_db.py")
    else:
        input("\nPressione Enter para sair...")