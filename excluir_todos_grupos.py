# excluir_todos_grupos.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.database import Database

def excluir_todos_grupos():
    print("🗑️ EXCLUINDO TODOS OS GRUPOS DO BANCO DE DADOS")
    print("=" * 50)
    
    db = Database()
    with db.get_cursor() as cur:
        # 1. Contar grupos antes
        cur.execute("SELECT COUNT(*) as total FROM conversas WHERE tipo = 'group'")
        total_grupos = cur.fetchone()['total']
        
        # 2. Listar grupos que serão excluídos
        cur.execute("SELECT id, nome FROM conversas WHERE tipo = 'group'")
        grupos = cur.fetchall()
        
        print(f"📋 GRUPOS QUE SERÃO EXCLUÍDOS ({total_grupos}):")
        for grupo in grupos:
            print(f"   - ID: {grupo['id']}, Nome: '{grupo['nome']}'")
        
        # 3. CONFIRMAÇÃO
        confirmacao = input(f"\n❌ TEM CERTEZA que deseja excluir {total_grupos} grupos? (digite 'SIM' para confirmar): ")
        
        if confirmacao.upper() == 'SIM':
            # 4. Excluir participantes dos grupos primeiro (devido à chave estrangeira)
            print("🧹 Excluindo participantes dos grupos...")
            cur.execute('''
                DELETE FROM participantes_conversa 
                WHERE conversa_id IN (SELECT id FROM conversas WHERE tipo = 'group')
            ''')
            participantes_excluidos = cur.rowcount
            print(f"✅ {participantes_excluidos} participantes removidos")
            
            # 5. Excluir os grupos
            print("🧹 Excluindo grupos...")
            cur.execute("DELETE FROM conversas WHERE tipo = 'group'")
            grupos_excluidos = cur.rowcount
            
            # 6. Verificar resultado
            cur.execute("SELECT COUNT(*) as restantes FROM conversas WHERE tipo = 'group'")
            grupos_restantes = cur.fetchone()['restantes']
            
            print(f"\n🎯 RESULTADO:")
            print(f"   ✅ {grupos_excluidos} grupos excluídos")
            print(f"   📊 Grupos restantes: {grupos_restantes}")
            
        else:
            print("🚫 Operação cancelada")

if __name__ == "__main__":
    excluir_todos_grupos()