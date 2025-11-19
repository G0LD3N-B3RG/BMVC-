# reset_database.py - Limpeza segura para demonstração
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import Database

def safe_reset():
    """Limpeza segura - mantém estrutura, remove apenas dados"""
    print("🔄 Iniciando reset seguro do banco...")
    
    db = Database()
    with db.get_cursor() as cur:
        # 1. Mostrar estatísticas atuais
        print("\n📊 ESTATÍSTICAS ATUAIS:")
        
        cur.execute("SELECT COUNT(*) FROM usuarios")
        user_count = cur.fetchone()[0]
        print(f"👤 Usuários: {user_count}")
        
        cur.execute("SELECT COUNT(*) FROM mensagens")
        msg_count = cur.fetchone()[0]
        print(f"💬 Mensagens: {msg_count}")
        
        cur.execute("SELECT COUNT(*) FROM conversas")
        conv_count = cur.fetchone()[0]
        print(f"📁 Conversas: {conv_count}")
        
        # 2. Confirmar
        confirm = input(f"\n❌ Limpar {msg_count} mensagens e {conv_count} conversas? (s/N): ")
        
        if confirm.lower() in ['s', 'sim', 'y', 'yes']:
            # 3. Ordem correta de exclusão
            tables = [
                'mensagens',
                'sessoes',
                'participantes_conversa', 
                'pedidos_amizade',
                'amizades',
                'conversas'
            ]
            
            for table in tables:
                cur.execute(f"DELETE FROM {table}")
                print(f"✅ {table} limpa")
            
            # 4. Manter apenas 2 usuários de exemplo
            cur.execute("""
                DELETE FROM usuarios 
                WHERE username NOT IN ('demo1', 'demo2', 'admin')
            """)
            
            # 5. Verificar resultado
            print("\n🎉 RESET COMPLETO!")
            cur.execute("SELECT username FROM usuarios")
            remaining_users = [row[0] for row in cur.fetchall()]
            print(f"👤 Usuários mantidos: {', '.join(remaining_users)}")
            
        else:
            print("❌ Reset cancelado.")

if __name__ == '__main__':
    safe_reset()
    input("\nPressione Enter para sair...")