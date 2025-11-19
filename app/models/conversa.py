# app/models/conversa.py - VERSÃO CORRIGIDA
from app.models.database import Database
from datetime import datetime

class Conversa:
    def __init__(self, id, nome, tipo, criado_por=None, criado_em=None, 
                 ultima_mensagem=None, ultima_mensagem_em=None):
        self.id = id
        self.nome = nome
        self.tipo = tipo
        self.criado_por = criado_por
        self.criado_em = criado_em
        self.ultima_mensagem = ultima_mensagem
        self.ultima_mensagem_em = ultima_mensagem_em

    @classmethod
    def criar_grupo(cls, nome, criado_por_id, participantes_ids):
        """Cria um grupo e adiciona TODOS os participantes"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                print(f"👥 [GRUPO] Iniciando criação do grupo: '{nome}'")
                print(f"👤 [GRUPO] Criado por: {criado_por_id}")
                print(f"👥 [GRUPO] Participantes recebidos: {participantes_ids}")
                
                # CRIAR A CONVERSA
                cur.execute('''
                    INSERT INTO conversas (nome, tipo, criado_por)
                    VALUES (%s, 'group', %s)
                    RETURNING id, nome, tipo, criado_por, criado_em
                ''', (nome, criado_por_id))
                
                result = cur.fetchone()
                if not result:
                    print("❌ [GRUPO] Falha ao criar conversa no banco")
                    return None
                    
                conversa_id = result['id']
                print(f"✅ [GRUPO] Conversa criada: ID={conversa_id}")
                
                # ADICIONAR TODOS OS PARTICIPANTES (INCLUINDO O CRIADOR)
                todos_participantes = [criado_por_id] + participantes_ids
                print(f"👥 [GRUPO] Adicionando {len(todos_participantes)} participantes: {todos_participantes}")
                
                participantes_adicionados = 0
                for usuario_id in todos_participantes:
                    try:
                        # VERIFICAR SE O USUÁRIO EXISTE
                        cur.execute('SELECT id FROM usuarios WHERE id = %s', (usuario_id,))
                        usuario_existe = cur.fetchone()
                        
                        if usuario_existe:
                            cur.execute('''
                                INSERT INTO participantes_conversa (conversa_id, usuario_id)
                                VALUES (%s, %s)
                                ON CONFLICT (conversa_id, usuario_id) DO NOTHING
                                RETURNING id
                            ''', (conversa_id, usuario_id))
                            
                            if cur.fetchone():
                                participantes_adicionados += 1
                                print(f"  ✅ [GRUPO] Participante {usuario_id} adicionado com sucesso")
                            else:
                                print(f"  ⚠️ [GRUPO] Participante {usuario_id} já estava no grupo")
                        else:
                            print(f"  ❌ [GRUPO] Usuário ID {usuario_id} não existe!")
                            
                    except Exception as e:
                        print(f"  💥 [GRUPO] Erro ao adicionar participante {usuario_id}: {e}")
                
                # VERIFICAR SE OS PARTICIPANTES FORAM REALMENTE ADICIONADOS
                cur.execute('''
                    SELECT COUNT(*) as total, string_agg(usuario_id::text, ', ') as ids
                    FROM participantes_conversa 
                    WHERE conversa_id = %s
                ''', (conversa_id,))
                
                verificacao = cur.fetchone()
                print(f"✅ [GRUPO] VERIFICAÇÃO: {verificacao['total']} participantes no grupo: {verificacao['ids']}")
                
                # RETORNAR CONVERSA COMPLETA
                conversa = cls(
                    conversa_id, 
                    result['nome'], 
                    result['tipo'],
                    result['criado_por'], 
                    result['criado_em']
                )
                
                print(f"🎉 [GRUPO] Grupo '{nome}' criado com sucesso! ID: {conversa_id}, {participantes_adicionados} participantes")
                return conversa
                
            except Exception as e:
                print(f"❌ [GRUPO] Erro crítico ao criar grupo: {e}")
                import traceback
                traceback.print_exc()
                return None

    @classmethod
    def excluir_grupo(cls, conversa_id, usuario_id):
        """Exclui um grupo permanentemente com verificações de segurança"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                print(f"🗑️ [MODELO] Iniciando exclusão do grupo {conversa_id} pelo usuário {usuario_id}")
                
                # Verificar se o grupo existe e se o usuário é o criador
                cur.execute('''
                    SELECT id, nome, criado_por, tipo
                    FROM conversas 
                    WHERE id = %s AND tipo = 'group' AND criado_por = %s
                ''', (conversa_id, usuario_id))
                
                grupo = cur.fetchone()
                if not grupo:
                    print(f"❌ [MODELO] Grupo não encontrado ou usuário não é o criador")
                    return False

                print(f"✅ [MODELO] Grupo encontrado: {grupo['nome']} (Tipo: {grupo['tipo']})")

                # Contar quantas mensagens serão excluídas (apenas para log)
                cur.execute('SELECT COUNT(*) as total FROM mensagens WHERE conversa_id = %s', (conversa_id,))
                total_mensagens = cur.fetchone()['total']
                print(f"📊 [MODELO] Total de mensagens no grupo: {total_mensagens}")

                # Contar quantos participantes serão removidos (apenas para log)
                cur.execute('SELECT COUNT(*) as total FROM participantes_conversa WHERE conversa_id = %s', (conversa_id,))
                total_participantes = cur.fetchone()['total']
                print(f"📊 [MODELO] Total de participantes no grupo: {total_participantes}")

                # Excluir todas as mensagens do grupo
                cur.execute('DELETE FROM mensagens WHERE conversa_id = %s', (conversa_id,))
                mensagens_excluidas = cur.rowcount
                print(f"✅ [MODELO] Mensagens excluídas: {mensagens_excluidas}")

                # Excluir todos os participantes do grupo
                cur.execute('DELETE FROM participantes_conversa WHERE conversa_id = %s', (conversa_id,))
                participantes_excluidos = cur.rowcount
                print(f"✅ [MODELO] Participantes removidos: {participantes_excluidos}")

                # Excluir o grupo
                cur.execute('DELETE FROM conversas WHERE id = %s', (conversa_id,))
                grupo_excluido = cur.rowcount
                
                if grupo_excluido == 1:
                    print(f"🎉 [MODELO] Grupo {conversa_id} excluído com sucesso!")
                    print(f"📋 [MODELO] Resumo: {mensagens_excluidas} mensagens e {participantes_excluidos} participantes removidos")
                    return True
                else:
                    print(f"❌ [MODELO] Falha ao excluir grupo")
                    return False

            except Exception as e:
                print(f"💥 [MODELO] Erro ao excluir grupo: {e}")
                raise
    
    @classmethod
    def _adicionar_participante_db(cls, conversa_id, usuario_id):
        """Método auxiliar para adicionar participante"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                cur.execute('''
                    INSERT INTO participantes_conversa (conversa_id, usuario_id)
                    VALUES (%s, %s)
                    ON CONFLICT (conversa_id, usuario_id) DO NOTHING
                    RETURNING id
                ''', (conversa_id, usuario_id))
                
                return cur.fetchone() is not None
            except Exception as e:
                print(f"❌ [GRUPO] Erro ao adicionar participante {usuario_id}: {e}")
                return False

    @classmethod
    def criar_privada(cls, usuario1_id, usuario2_id):
        # Ordena os IDs para garantir que a conversa seja única
        ids_ordenados = sorted([usuario1_id, usuario2_id])
        nome_conversa = f"private_{ids_ordenados[0]}_{ids_ordenados[1]}"
        
        db = Database()
        with db.get_cursor() as cur:
            # Verifica se já existe conversa privada
            cur.execute('''
                SELECT c.id, c.nome, c.tipo, c.criado_em
                FROM conversas c
                WHERE c.tipo = 'private' AND c.nome = %s
            ''', (nome_conversa,))
            
            existing = cur.fetchone()
            
            if existing:
                return cls(existing['id'], existing['nome'], existing['tipo'], 
                          None, existing['criado_em'])
            
            # Cria nova conversa privada
            cur.execute('''
                INSERT INTO conversas (nome, tipo)
                VALUES (%s, 'private')
                RETURNING id, criado_em
            ''', (nome_conversa,))
            
            result = cur.fetchone()
            conversa = cls(result['id'], nome_conversa, 'private', None, result['criado_em'])
            
            # Adiciona ambos os usuários como participantes
            conversa.adicionar_participante(usuario1_id)
            conversa.adicionar_participante(usuario2_id)
            
            return conversa

    def adicionar_participante(self, usuario_id):
        """Adiciona um usuário como participante da conversa"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                cur.execute('''
                    INSERT INTO participantes_conversa (conversa_id, usuario_id)
                    VALUES (%s, %s)
                    ON CONFLICT (conversa_id, usuario_id) DO NOTHING
                ''', (self.id, usuario_id))
                return True
            except Exception as e:
                print(f"❌ Erro ao adicionar participante {usuario_id}: {e}")
                return False

    @classmethod
    def buscar_por_id(cls, conversa_id):
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT id, nome, tipo, criado_por, criado_em, 
                       ultima_mensagem, ultima_mensagem_em
                FROM conversas 
                WHERE id = %s
            ''', (conversa_id,))
            
            result = cur.fetchone()
            if result:
                return cls(
                    result['id'], result['nome'], result['tipo'],
                    result['criado_por'], result['criado_em'],
                    result['ultima_mensagem'], result['ultima_mensagem_em']
                )
        return None

    @classmethod
    def buscar_por_usuario(cls, usuario_id):
        """Busca todas as conversas de um usuário"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                print(f"🔍 [CONVERSA] Buscando conversas para usuário ID: {usuario_id}")
                
                cur.execute('''
                    SELECT 
                        c.id, c.nome, c.tipo, c.criado_por, c.criado_em,
                        c.ultima_mensagem, c.ultima_mensagem_em
                    FROM conversas c
                    INNER JOIN participantes_conversa pc ON c.id = pc.conversa_id
                    WHERE pc.usuario_id = %s
                    ORDER BY 
                        COALESCE(c.ultima_mensagem_em, c.criado_em) DESC,
                        c.criado_em DESC
                ''', (usuario_id,))
                
                rows = cur.fetchall()
                print(f"✅ [CONVERSA] Encontradas {len(rows)} conversas no banco para usuário {usuario_id}")
                
                conversas = []
                for row in rows:
                    print(f"📋 [CONVERSA] Conversa: ID={row['id']}, Nome='{row['nome']}', ÚltimaMsg='{row['ultima_mensagem']}'")
                    
                    conversa = cls(
                        row['id'], 
                        row['nome'], 
                        row['tipo'],
                        row['criado_por'], 
                        row['criado_em'],
                        row['ultima_mensagem'], 
                        row['ultima_mensagem_em']
                    )
                    conversas.append(conversa)
                
                return conversas
                
            except Exception as e:
                print(f"❌ [CONVERSA] Erro ao buscar conversas: {e}")
                import traceback
                traceback.print_exc()
                return []

    def atualizar_ultima_mensagem(self, mensagem_conteudo):
        """Atualiza a última mensagem da conversa"""
        db = Database()
        with db.get_cursor() as cur:
            try:
                cur.execute('''
                    UPDATE conversas 
                    SET ultima_mensagem = %s, ultima_mensagem_em = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (mensagem_conteudo, self.id))
                
                print(f"✅ [CONVERSA] Última mensagem atualizada: '{mensagem_conteudo}' para conversa {self.id}")
            except Exception as e:
                print(f"❌ [CONVERSA] Erro ao atualizar última mensagem: {e}")

    def obter_participantes(self):
        """Retorna todos os participantes da conversa"""
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT u.id, u.username
                FROM participantes_conversa pc
                JOIN usuarios u ON pc.usuario_id = u.id
                WHERE pc.conversa_id = %s
            ''', (self.id,))
            
            return [dict(row) for row in cur.fetchall()]

    @classmethod
    def buscar_ou_criar_privada(cls, usuario1_id, usuario2_id):
        return cls.criar_privada(usuario1_id, usuario2_id)

    def usuario_eh_participante(self, usuario_id):
        """Verifica se um usuário é participante da conversa"""
        db = Database()
        with db.get_cursor() as cur:
            cur.execute('''
                SELECT 1 FROM participantes_conversa 
                WHERE conversa_id = %s AND usuario_id = %s
            ''', (self.id, usuario_id))
            
            return cur.fetchone() is not None