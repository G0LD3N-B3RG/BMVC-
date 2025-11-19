# init_db.py - VERSÃO CORRIGIDA
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import Database

def main():
    print("🔄 Inicializando banco de dados...")
    try:
        db = Database()
        db.init_db()
        print("✅ Banco de dados inicializado com sucesso!")
        print("📊 Tabelas criadas:")
        print("   - usuarios")
        print("   - mensagens") 
        print("   - sessoes")
        print("   - pedidos_amizade")
        print("   - amizades")
        print("   - conversas")
        print("   - participantes_conversa")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        print("\n🔧 Solução de problemas:")
        print("1. Verifique se o PostgreSQL está rodando")
        print("2. Confirme as credenciais no arquivo .env")
        print("3. Certifique-se que o usuário chat_user existe")
        input("Pressione Enter para sair...")
        sys.exit(1)

if __name__ == '__main__':
    main()