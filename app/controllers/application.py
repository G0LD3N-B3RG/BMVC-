# app/controllers/application.py 
import json
from datetime import datetime, timedelta
from bottle import template, request, response, redirect, static_file

from app.models.usuario import Usuario
from app.models.mensagem import Mensagem
from app.models.chat import Chat
from app.models.database import Database
from app.models.conversa import Conversa

class Application():
    def __init__(self):
        self.chat = Chat()
        self.pages = {
            'portal': self.portal_page,
            'chat': self.chat_page,
            'home': self.home_page
        }

    def get_usuario_autenticado(self):
        session_token = request.get_cookie('session_token')
        if session_token:
            return Usuario.validar_sessao(session_token)
        return None

    def render(self, page, **kwargs):
        content = self.pages.get(page, self.portal_page)
        return content(**kwargs)

    def portal_page(self, **kwargs):
        return template('app/views/html/portal', **kwargs)

    def chat_page(self, **kwargs):
        return template('app/views/html/chat', **kwargs)

    def home_page(self, **kwargs):
        return template('app/views/html/home', **kwargs)

    # Rotas do Portal
    def portal_get(self):
        usuario = self.get_usuario_autenticado()
        if usuario:
            return redirect('/home')
        return self.render('portal')

    def cadastrar_post(self):
        try:
            data = request.json
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()

            if not username or not password:
                response.status = 400
                return json.dumps({'error': 'Nome de usuário e senha são obrigatórios'})

            if len(username) < 3:
                response.status = 400
                return json.dumps({'error': 'Nome de usuário deve ter pelo menos 3 caracteres'})

            # ✅ VALIDAÇÃO DE SENHA NO BACKEND TAMBÉM
            if len(password) < 8:
                response.status = 400
                return json.dumps({'error': 'Senha deve ter pelo menos 8 caracteres'})
            
            if not any(c.isupper() for c in password):
                response.status = 400
                return json.dumps({'error': 'Senha deve conter pelo menos uma letra maiúscula'})
                
            if not any(c.islower() for c in password):
                response.status = 400
                return json.dumps({'error': 'Senha deve conter pelo menos uma letra minúscula'})
                
            if not any(c.isdigit() for c in password):
                response.status = 400
                return json.dumps({'error': 'Senha deve conter pelo menos um número'})

            usuario = Usuario.criar(username, password)
            if usuario:
                session_token = usuario.criar_sessao()
                response.set_cookie('session_token', session_token, path='/')
                return json.dumps({'success': True, 'message': 'Cadastro realizado com sucesso!'})
            else:
                response.status = 400
                return json.dumps({'error': 'Nome de usuário já existe'})

        except Exception as e:
            response.status = 500
            return json.dumps({'error': str(e)})

    def login_post(self):
        try:
            data = request.json
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()

            if not username or not password:
                response.status = 400
                return json.dumps({'error': 'Nome de usuário e senha são obrigatórios'})

            usuario = Usuario.autenticar(username, password)
            if usuario:
                usuario.atualizar_online_status(True)
                session_token = usuario.criar_sessao()
                response.set_cookie('session_token', session_token, path='/')
                return json.dumps({'success': True, 'message': 'Login realizado com sucesso!'})
            else:
                response.status = 401
                return json.dumps({'error': 'Credenciais inválidas'})

        except Exception as e:
            response.status = 500
            return json.dumps({'error': str(e)})

    def logout_post(self):
        usuario = self.get_usuario_autenticado()
        if usuario:
            session_token = request.get_cookie('session_token')
            if session_token:
                usuario.invalidar_sessao(session_token)
            usuario.atualizar_online_status(False)
        
        response.delete_cookie('session_token')
        return json.dumps({'success': True, 'message': 'Logout realizado'})

    def send_friend_request(self):
        """Enviar pedido de amizade para outro usuário"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            target_username = data.get('username', '').strip()

            if not target_username:
                response.status = 400
                return json.dumps({'error': 'Nome de usuário é obrigatório'})

            if target_username == usuario.username:
                response.status = 400
                return json.dumps({'error': 'Você não pode adicionar a si mesmo'})

            # Buscar usuário alvo
            target_user = Usuario.buscar_por_username(target_username)
            if not target_user:
                response.status = 404
                return json.dumps({'error': 'Usuário não encontrado'})

            db = Database()  # ← AGORA ESTÁ DEFINIDO!
            with db.get_cursor() as cur:
                # Verificar se já existe pedido pendente
                cur.execute('''
                    SELECT id FROM pedidos_amizade 
                    WHERE de_usuario_id = %s AND para_usuario_id = %s AND status = 'pending'
                ''', (usuario.id, target_user.id))
                
                if cur.fetchone():
                    response.status = 400
                    return json.dumps({'error': 'Pedido de amizade já enviado para este usuário'})

                # Verificar se já são amigos
                cur.execute('''
                    SELECT id FROM amizades 
                    WHERE (usuario_id1 = %s AND usuario_id2 = %s) 
                    OR (usuario_id1 = %s AND usuario_id2 = %s)
                ''', (usuario.id, target_user.id, target_user.id, usuario.id))
                
                if cur.fetchone():
                    response.status = 400
                    return json.dumps({'error': 'Vocês já são amigos'})

                # Inserir pedido de amizade
                cur.execute('''
                    INSERT INTO pedidos_amizade (de_usuario_id, para_usuario_id, status)
                    VALUES (%s, %s, 'pending')
                    RETURNING id
                ''', (usuario.id, target_user.id))

            return json.dumps({
                'success': True, 
                'message': f'Pedido de amizade enviado para {target_username}'
            })

        except Exception as e:
            print(f"❌ Erro ao enviar pedido de amizade: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def get_friends(self):
        """Obter lista de amigos do usuário"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            print(f"🔍 [BACKEND] Buscando amigos para: {usuario.username} (ID: {usuario.id})")
            
            db = Database()
            with db.get_cursor() as cur:
                # Buscar amigos do usuário
                cur.execute('''
                    SELECT u.id, u.username, u.is_online
                    FROM usuarios u
                    INNER JOIN amizades a ON (
                        (a.usuario_id1 = %s AND a.usuario_id2 = u.id) OR 
                        (a.usuario_id1 = u.id AND a.usuario_id2 = %s)
                    )
                    WHERE u.id != %s
                    ORDER BY u.is_online DESC, u.username
                ''', (usuario.id, usuario.id, usuario.id))
                
                friends = []
                rows = cur.fetchall()
                print(f"📊 [BACKEND] Amigos encontrados no banco: {len(rows)}")
                
                for row in rows:
                    # ✅ GARANTIR que todos os campos necessários existem
                    friend_data = {
                        'id': row['id'],
                        'username': row['username'] or 'Usuário Desconhecido',  # Fallback se for NULL
                        'online': bool(row['is_online'])  # Garantir que é booleano
                    }
                    print(f"👥 [BACKEND] Amigo: {friend_data['username']} (ID: {friend_data['id']}, Online: {friend_data['online']})")
                    friends.append(friend_data)
                
                print(f"✅ [BACKEND] Retornando {len(friends)} amigos")
                
                # ✅ SEMPRE retornar no formato correto
                return json.dumps({
                    'friends': friends  # Garantir que é um array, mesmo que vazio
                })

        except Exception as e:
            print(f"❌ [BACKEND] Erro ao buscar amigos: {e}")
            import traceback
            traceback.print_exc()
            # ✅ Retornar array vazio em caso de erro, não undefined
            return json.dumps({'friends': []})

    def get_friend_requests(self):
        """Obter pedidos de amizade pendentes"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            db = Database()
            with db.get_cursor() as cur:
                # Buscar pedidos pendentes para o usuário
                cur.execute('''
                    SELECT p.id, u.username, p.created_at
                    FROM pedidos_amizade p
                    JOIN usuarios u ON p.de_usuario_id = u.id
                    WHERE p.para_usuario_id = %s AND p.status = 'pending'
                    ORDER BY p.created_at DESC
                ''', (usuario.id,))
                
                requests = []
                for row in cur.fetchall():
                    # Calcular tempo relativo
                    time_ago = self._get_time_ago(row['created_at'])
                    requests.append({
                        'id': row['id'],
                        'from_username': row['username'],
                        'time': time_ago
                    })
                
                return json.dumps({'requests': requests})

        except Exception as e:
            print(f"❌ Erro ao buscar pedidos de amizade: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def accept_friend_request(self):
        """Aceitar um pedido de amizade"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            request_id = data.get('request_id')

            db = Database()
            with db.get_cursor() as cur:
                # Buscar pedido
                cur.execute('''
                    SELECT p.*, u.username as from_username 
                    FROM pedidos_amizade p
                    JOIN usuarios u ON p.de_usuario_id = u.id
                    WHERE p.id = %s AND p.para_usuario_id = %s AND p.status = 'pending'
                ''', (request_id, usuario.id))
                
                pedido = cur.fetchone()
                if not pedido:
                    response.status = 404
                    return json.dumps({'error': 'Pedido não encontrado'})

                # ✅ AGORA COM updated_at (que você adicionou)
                cur.execute('''
                    UPDATE pedidos_amizade 
                    SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (request_id,))

                # Criar amizade (em ambas as direções)
                cur.execute('''
                    INSERT INTO amizades (usuario_id1, usuario_id2)
                    VALUES (%s, %s)
                ''', (pedido['de_usuario_id'], pedido['para_usuario_id']))

            return json.dumps({
                'success': True,
                'message': f'Você e {pedido["from_username"]} agora são amigos!'
            })

        except Exception as e:
            print(f"❌ Erro ao aceitar pedido de amizade: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def reject_friend_request(self):
        """Rejeitar um pedido de amizade"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            request_id = data.get('request_id')

            db = Database()
            with db.get_cursor() as cur:
                # Buscar pedido
                cur.execute('''
                    SELECT p.*, u.username as from_username 
                    FROM pedidos_amizade p
                    JOIN usuarios u ON p.de_usuario_id = u.id
                    WHERE p.id = %s AND p.para_usuario_id = %s AND p.status = 'pending'
                ''', (request_id, usuario.id))
                
                pedido = cur.fetchone()
                if not pedido:
                    response.status = 404
                    return json.dumps({'error': 'Pedido não encontrado'})

                # ✅ AGORA COM updated_at (que você adicionou)
                cur.execute('''
                    UPDATE pedidos_amizade 
                    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (request_id,))

            return json.dumps({
                'success': True,
                'message': f'Pedido de amizade de {pedido["from_username"]} rejeitado'
            })

        except Exception as e:
            print(f"❌ Erro ao rejeitar pedido de amizade: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def remove_friend(self):
        """Remover um amigo da lista"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            friend_id = data.get('friend_id')
            friend_username = data.get('friend_username')

            print(f"🗑️ [BACKEND] Removendo amigo: ID {friend_id}, Username {friend_username}")
            print(f"👤 [BACKEND] Usuário autenticado: {usuario.username} (ID: {usuario.id})")

            if not friend_id:
                response.status = 400
                return json.dumps({'error': 'ID do amigo é obrigatório'})

            db = Database()
            with db.get_cursor() as cur:
                # ✅ Verificar se a amizade existe
                cur.execute('''
                    SELECT id FROM amizades 
                    WHERE (usuario_id1 = %s AND usuario_id2 = %s) 
                    OR (usuario_id1 = %s AND usuario_id2 = %s)
                ''', (usuario.id, friend_id, friend_id, usuario.id))
                
                amizade = cur.fetchone()
                print(f"🔍 [BACKEND] Amizade encontrada: {amizade}")

                if not amizade:
                    response.status = 404
                    return json.dumps({'error': 'Amizade não encontrada'})

                # ✅ Remover amizade
                cur.execute('''
                    DELETE FROM amizades 
                    WHERE (usuario_id1 = %s AND usuario_id2 = %s) 
                    OR (usuario_id1 = %s AND usuario_id2 = %s)
                ''', (usuario.id, friend_id, friend_id, usuario.id))
                
                linhas_afetadas = cur.rowcount
                print(f"✅ [BACKEND] Amizade removida. Linhas afetadas: {linhas_afetadas}")

                # ✅ Também remover qualquer pedido relacionado
                cur.execute('''
                    DELETE FROM pedidos_amizade 
                    WHERE ((de_usuario_id = %s AND para_usuario_id = %s) 
                    OR (de_usuario_id = %s AND para_usuario_id = %s))
                ''', (usuario.id, friend_id, friend_id, usuario.id))

            return json.dumps({
                'success': True,
                'message': f'{friend_username} foi removido da sua lista de amigos'
            })

        except Exception as e:
            print(f"❌ [BACKEND] Erro ao remover amigo: {e}")
            import traceback
            traceback.print_exc()
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def search_users(self):
        """Buscar usuários pelo nome"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            query = request.query.get('q', '').strip()
            
            if len(query) < 2:
                return json.dumps({'users': []})

            db = Database()
            with db.get_cursor() as cur:
                # Buscar usuários que correspondem à query
                cur.execute('''
                    SELECT id, username, is_online 
                    FROM usuarios 
                    WHERE username ILIKE %s AND id != %s
                    ORDER BY is_online DESC, username
                    LIMIT 10
                ''', (f'%{query}%', usuario.id))
                
                users = []
                for row in cur.fetchall():
                    users.append({
                        'username': row['username'],
                        'online': row['is_online']
                    })
                
                return json.dumps({'users': users})

        except Exception as e:
            print(f"❌ Erro na busca de usuários: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def _get_time_ago(self, dt):
        """Função auxiliar para calcular tempo relativo"""
        from datetime import datetime, timezone
        
        if isinstance(dt, str):
            # Se for string, converter para datetime
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        diff = now - dt
        minutes = diff.total_seconds() / 60
        
        if minutes < 1:
            return "Agora"
        elif minutes < 60:
            return f"{int(minutes)} min atrás"
        elif minutes < 1440:
            hours = int(minutes / 60)
            return f"{hours} h atrás"
        else:
            days = int(minutes / 1440)
            return f"{days} dias atrás"
    
    # Rotas protegidas
    def home_get(self):
        usuario = self.get_usuario_autenticado()
        if not usuario:
            return redirect('/portal')
        return self.render('home', usuario=usuario)

    def send_message(self):
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            content = data.get('content', '').strip()
            message_type = data.get('type', 'texto')
            image_data = data.get('image_data')
            audio_data = data.get('audio_data')
            audio_duration = data.get('audio_duration')
            chat_id = data.get('chat_id', 'general')
            chat_type = data.get('chat_type', 'group')
            conversa_id = data.get('conversa_id')  # ✅ NOVO: Receber conversa_id

            print(f"📨 [SEND_MESSAGE] Enviando mensagem: usuario_id={usuario.id}, chat_id={chat_id}, conversa_id={conversa_id}")

            # ✅ PROCESSAR MENSAGEM (código existente)
            kwargs = {
                'chat_id': chat_id,
                'chat_type': chat_type,
                'participants': data.get('participants', [])
            }

            if conversa_id:
                kwargs['conversa_id'] = conversa_id

            if message_type == 'imagem':
                if not image_data:
                    response.status = 400
                    return json.dumps({'error': 'image_data é obrigatório para imagem'})
                
                kwargs['image_data'] = image_data
                msg = self.chat.adicionar_mensagem(usuario.id, content, 'imagem', **kwargs)
                
            elif message_type == 'audio':
                if not audio_data:
                    response.status = 400
                    return json.dumps({'error': 'audio_data é obrigatório para áudio'})
                
                kwargs['audio_data'] = audio_data
                kwargs['audio_duration'] = audio_duration
                msg = self.chat.adicionar_mensagem(usuario.id, content, 'audio', **kwargs)
                
            else:
                if not content:
                    response.status = 400
                    return json.dumps({'error': 'Conteúdo é obrigatório'})
                msg = self.chat.adicionar_mensagem(usuario.id, content, 'texto', **kwargs)

            if msg:
                # ✅ ATUALIZAR ÚLTIMA MENSAGEM NA CONVERSA
                self._atualizar_ultima_mensagem_conversa(msg, conversa_id)
                
                usuario.atualizar_online_status(True)
                return json.dumps(msg.to_dict())
            else:
                response.status = 400
                return json.dumps({'error': 'Falha ao criar mensagem'})
                
        except Exception as e:
            response.status = 500
            return json.dumps({'error': str(e)})

    def _atualizar_ultima_mensagem_conversa(self, mensagem, conversa_id):
        """Atualiza a última mensagem da conversa - VERSÃO CORRIGIDA"""
        if not conversa_id:
            print("⚠️ [ULTIMA_MENSAGEM] conversa_id não fornecido - pulando atualização")
            return
            
        try:
            print(f"🔄 [ULTIMA_MENSAGEM] Atualizando conversa {conversa_id} com nova mensagem")
            
            from app.models.conversa import Conversa
            conversa = Conversa.buscar_por_id(conversa_id)
            
            if conversa:
                # Criar preview da mensagem
                preview = self._criar_preview_mensagem(mensagem)
                
                # Atualizar no banco
                conversa.atualizar_ultima_mensagem(preview)
                print(f"✅ [ULTIMA_MENSAGEM] Conversa {conversa_id} atualizada: '{preview}'")
            else:
                print(f"❌ [ULTIMA_MENSAGEM] Conversa {conversa_id} não encontrada")
                
        except Exception as e:
            print(f"❌ [ULTIMA_MENSAGEM] Erro ao atualizar conversa {conversa_id}: {e}")
            import traceback
            traceback.print_exc()

    def _criar_preview_mensagem(self, mensagem):
        """Cria um preview resumido da mensagem"""
        if mensagem.tipo == 'imagem':
            return '📷 Imagem'
        elif mensagem.tipo == 'audio':
            return '🎤 Áudio'
        else:
            # Texto - limitar a 30 caracteres
            conteudo = mensagem.conteudo or ''
            if len(conteudo) > 30:
                return conteudo[:30] + '...'
            return conteudo

    def get_messages(self):
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        usuario.atualizar_online_status(True)
        
        since = request.query.get('since', '').strip()
        chat_id = request.query.get('chat', 'general')
        chat_type = request.query.get('type', 'group')
        conversa_id = request.query.get('conversa_id')  # ✅ NOVO PARÂMETRO
        
        # ✅ USAR O NOVO MÉTODO UNIFICADO
        data = self.chat.get_data_desde(since, chat_id, conversa_id)
        return json.dumps(data)

    def edit_message(self):
        """UPDATE - Editar uma mensagem existente"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            message_id = data.get('message_id')
            new_content = data.get('content', '').strip()

            if not message_id or not new_content:
                response.status = 400
                return json.dumps({'error': 'ID e conteúdo são obrigatórios'})

            db = Database()
            with db.get_cursor() as cur:
                # Verificar se a mensagem pertence ao usuário
                cur.execute('''
                    SELECT id, usuario_id, tipo FROM mensagens 
                    WHERE id = %s AND usuario_id = %s
                ''', (message_id, usuario.id))
                
                mensagem = cur.fetchone()
                if not mensagem:
                    response.status = 403
                    return json.dumps({'error': 'Você só pode editar suas próprias mensagens'})

                # Não permitir editar mensagens de mídia
                if mensagem['tipo'] != 'texto':
                    response.status = 400
                    return json.dumps({'error': 'Só é possível editar mensagens de texto'})

                # UPDATE da mensagem
                cur.execute('''
                    UPDATE mensagens 
                    SET conteudo = %s, edited_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, conteudo, created_at, edited_at
                ''', (new_content, message_id))
                
                updated_msg = cur.fetchone()
                
                return json.dumps({
                    'success': True,
                    'message': 'Mensagem editada com sucesso',
                    'data': {
                        'id': updated_msg['id'],
                        'conteudo': updated_msg['conteudo'],
                        'edited_at': updated_msg['edited_at'].isoformat() if updated_msg['edited_at'] else None
                    }
                })

        except Exception as e:
            response.status = 500
            return json.dumps({'error': f'Erro ao editar mensagem: {str(e)}'})

    def delete_message(self):
        """DELETE - Excluir uma mensagem"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            message_id = data.get('message_id')

            if not message_id:
                response.status = 400
                return json.dumps({'error': 'ID da mensagem é obrigatório'})

            db = Database()
            with db.get_cursor() as cur:
                # Verificar se a mensagem pertence ao usuário
                cur.execute('''
                    SELECT usuario_id FROM mensagens 
                    WHERE id = %s AND usuario_id = %s
                ''', (message_id, usuario.id))
                
                if not cur.fetchone():
                    response.status = 403
                    return json.dumps({'error': 'Você só pode excluir suas próprias mensagens'})

                # DELETE da mensagem
                cur.execute('DELETE FROM mensagens WHERE id = %s', (message_id,))
                
                return json.dumps({
                    'success': True,
                    'message': 'Mensagem excluída com sucesso'
                })

        except Exception as e:
            response.status = 500
            return json.dumps({'error': f'Erro ao excluir mensagem: {str(e)}'})

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
        
    def user_info(self):
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})
        
        return json.dumps({
            'username': usuario.username,
            'id': usuario.id
        })
        
    def get_conversas(self):
        """Obter lista de conversas do usuário - VERSÃO COM LOGS DETALHADOS"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            print(f"🔍 [API CONVERSAS] Buscando conversas para: {usuario.username} (ID: {usuario.id})")
            
            from app.models.conversa import Conversa
            conversas = Conversa.buscar_por_usuario(usuario.id)
            
            print(f"✅ [API CONVERSAS] {len(conversas)} conversas encontradas no modelo")

            conversas_data = []
            for conversa in conversas:
                # Determinar nome de exibição
                if conversa.tipo == 'private':
                    participantes = conversa.obter_participantes()
                    outro_usuario = next((p for p in participantes if p['id'] != usuario.id), None)
                    nome_exibicao = outro_usuario['username'] if outro_usuario else 'Usuário'
                else:
                    nome_exibicao = conversa.nome or 'Grupo sem nome'
                
                conversa_data = {
                    'id': conversa.id,
                    'nome': nome_exibicao,
                    'tipo': conversa.tipo,
                    'ultima_mensagem': conversa.ultima_mensagem,
                    'ultima_mensagem_em': conversa.ultima_mensagem_em.isoformat() if conversa.ultima_mensagem_em else None
                }
                
                print(f"📋 [API CONVERSAS] Adicionando: ID={conversa.id}, Nome='{nome_exibicao}'")
                conversas_data.append(conversa_data)

            print(f"🎯 [API CONVERSAS] Retornando {len(conversas_data)} conversas para o frontend")
            return json.dumps({'conversas': conversas_data})

        except Exception as e:
            print(f"❌ [API CONVERSAS] Erro ao buscar conversas: {e}")
            import traceback
            traceback.print_exc()
            return json.dumps({'conversas': []})

    def user_list(self):
        """Retorna lista completa de usuários com IDs - VERSÃO CORRIGIDA"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            from app.models.usuario import Usuario
            
            # Buscar todos os usuários (não apenas online)
            db = Database()
            with db.get_cursor() as cur:
                cur.execute('''
                    SELECT id, username, is_online 
                    FROM usuarios 
                    WHERE id != %s
                    ORDER BY is_online DESC, username
                ''', (usuario.id,))
                
                users_data = []
                for row in cur.fetchall():
                    users_data.append({
                        'id': row['id'],
                        'username': row['username'],
                        'online': row['is_online']
                    })
                
                print(f"📋 Retornando {len(users_data)} usuários para a lista")
                return json.dumps({'users': users_data})
                
        except Exception as e:
            print(f"❌ Erro ao buscar lista de usuários: {e}")
            return json.dumps({'users': []})
        
    def delete_account(self):
        """DELETE - Excluir permanentemente a conta do usuário"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            confirmation = data.get('confirmation', '').strip()
            
            # Verificação extra de segurança
            if confirmation != 'CONFIRMAR EXCLUSÃO':
                response.status = 400
                return json.dumps({'error': 'Confirmação incorreta. Digite exatamente: CONFIRMAR EXCLUSÃO'})

            db = Database()
            with db.get_cursor() as cur:
                print(f"🗑️ Iniciando exclusão da conta do usuário: {usuario.username} (ID: {usuario.id})")
                
                # 1. Primeiro, excluir todas as mensagens do usuário
                cur.execute('DELETE FROM mensagens WHERE usuario_id = %s', (usuario.id,))
                mensagens_excluidas = cur.rowcount
                print(f"✅ Mensagens excluídas: {mensagens_excluidas}")
                
                # 2. Excluir sessões do usuário
                cur.execute('DELETE FROM sessoes WHERE usuario_id = %s', (usuario.id,))
                sessoes_excluidas = cur.rowcount
                print(f"✅ Sessões excluídas: {sessoes_excluidas}")
                
                # 3. Excluir pedidos de amizade relacionados
                cur.execute('''
                    DELETE FROM pedidos_amizade 
                    WHERE de_usuario_id = %s OR para_usuario_id = %s
                ''', (usuario.id, usuario.id))
                pedidos_excluidos = cur.rowcount
                print(f"✅ Pedidos de amizade excluídos: {pedidos_excluidos}")
                
                # 4. Excluir amizades
                cur.execute('''
                    DELETE FROM amizades 
                    WHERE usuario_id1 = %s OR usuario_id2 = %s
                ''', (usuario.id, usuario.id))
                amizades_excluidas = cur.rowcount
                print(f"✅ Amizades excluídas: {amizades_excluidas}")
                
                # 5. Excluir participação em conversas
                cur.execute('DELETE FROM participantes_conversa WHERE usuario_id = %s', (usuario.id,))
                participantes_excluidos = cur.rowcount
                print(f"✅ Participações em conversas excluídas: {participantes_excluidos}")
                
                # 6. Excluir conversas criadas pelo usuário (se for o criador)
                cur.execute('''
                    DELETE FROM conversas 
                    WHERE criado_por = %s AND tipo = 'group'
                ''', (usuario.id,))
                conversas_excluidas = cur.rowcount
                print(f"✅ Conversas/grupos excluídos: {conversas_excluidas}")
                
                # 7. FINALMENTE: Excluir o usuário
                cur.execute('DELETE FROM usuarios WHERE id = %s', (usuario.id,))
                usuario_excluido = cur.rowcount
                
                if usuario_excluido == 1:
                    print(f"🎉 Conta do usuário {usuario.username} excluída com sucesso!")
                    
                    # Limpar cookie de sessão
                    response.delete_cookie('session_token')
                    
                    return json.dumps({
                        'success': True,
                        'message': 'Sua conta foi excluída permanentemente. Todos os seus dados foram removidos do sistema.',
                        'stats': {
                            'mensagens': mensagens_excluidas,
                            'sessoes': sessoes_excluidas,
                            'pedidos_amizade': pedidos_excluidos,
                            'amizades': amizades_excluidas,
                            'conversas': conversas_excluidas
                        }
                    })
                else:
                    response.status = 500
                    return json.dumps({'error': 'Erro ao excluir conta do usuário'})

        except Exception as e:
            print(f"❌ Erro crítico ao excluir conta: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno ao excluir conta: {str(e)}'})
      
    def criar_grupo(self):
        """Criar um novo grupo - VERSÃO CORRIGIDA COM TRATAMENTO DE ERRO"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            # ✅ VERIFICAR SE request.json É NONE
            if request.json is None:
                print("❌ [CRIAR-GRUPO] request.json é None - corpo da requisição vazio ou inválido")
                
                # Tentar ler o corpo manualmente
                try:
                    body = request.body.read().decode('utf-8')
                    print(f"📨 [CRIAR-GRUPO] Corpo bruto: {body}")
                    if body:
                        data = json.loads(body)
                    else:
                        response.status = 400
                        return json.dumps({'error': 'Corpo da requisição vazio'})
                except Exception as e:
                    print(f"❌ [CRIAR-GRUPO] Erro ao parsear corpo: {e}")
                    response.status = 400
                    return json.dumps({'error': 'Formato JSON inválido'})
            else:
                data = request.json

            print(f"📦 [CRIAR-GRUPO] Dados recebidos: {data}")

            nome_grupo = data.get('nome', '').strip()
            participantes = data.get('participantes', [])  # Lista de IDs

            print(f"🎯 [CRIAR-GRUPO] Processando: nome='{nome_grupo}', participantes={participantes}")

            if not nome_grupo:
                response.status = 400
                return json.dumps({'error': 'Nome do grupo é obrigatório'})

            if not participantes or not isinstance(participantes, list):
                response.status = 400
                return json.dumps({'error': 'Selecione pelo menos um participante'})

            # Converter para inteiros
            participantes_ids = []
            for p in participantes:
                try:
                    participantes_ids.append(int(p))
                except (ValueError, TypeError):
                    print(f"⚠️ [CRIAR-GRUPO] ID de participante inválido ignorado: {p}")

            print(f"🔢 [CRIAR-GRUPO] IDs convertidos: {participantes_ids}")

            if not participantes_ids:
                response.status = 400
                return json.dumps({'error': 'Nenhum participante válido selecionado'})

            from app.models.conversa import Conversa
            conversa = Conversa.criar_grupo(nome_grupo, usuario.id, participantes_ids)

            if conversa:
                print(f"✅ [CRIAR-GRUPO] Grupo criado com sucesso: {conversa.id}")
                return json.dumps({
                    'success': True,
                    'conversa': {
                        'id': conversa.id,
                        'nome': conversa.nome,
                        'tipo': conversa.tipo
                    },
                    'message': f'Grupo "{nome_grupo}" criado com sucesso!'
                })
            else:
                print("❌ [CRIAR-GRUPO] Falha ao criar grupo no modelo")
                response.status = 500
                return json.dumps({'error': 'Falha ao criar grupo'})

        except Exception as e:
            print(f"💥 [CRIAR-GRUPO] Erro inesperado: {e}")
            import traceback
            traceback.print_exc()
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})

    def debug_request(self):
        """Método temporário para debug da requisição"""
        print("🔍 [DEBUG] Headers da requisição:")
        for key, value in request.headers.items():
            print(f"   {key}: {value}")
        
        print("🔍 [DEBUG] request.json:", request.json)
        
        try:
            body = request.body.read().decode('utf-8')
            print("🔍 [DEBUG] Corpo bruto:", body)
            request.body.seek(0)  # Reset para poder ler novamente
        except Exception as e:
            print("🔍 [DEBUG] Erro ao ler corpo:", e)
        
        return json.dumps({'debug': 'ok'})

    def abrir_conversa(self):
        """Abrir uma conversa específica"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            conversa_id = request.query.get('id')
            if not conversa_id:
                response.status = 400
                return json.dumps({'error': 'ID da conversa é obrigatório'})

            conversa = Conversa.buscar_por_id(conversa_id)
            if not conversa:
                response.status = 404
                return json.dumps({'error': 'Conversa não encontrada'})

            # Buscar participantes
            participantes = conversa.obter_participantes()
            
            # Determinar nome de exibição
            if conversa.tipo == 'private':
                outro_usuario = next((p for p in participantes if p['id'] != usuario.id), None)
                nome_exibicao = outro_usuario['username'] if outro_usuario else 'Usuário'
            else:
                nome_exibicao = conversa.nome or 'Grupo'

            return json.dumps({
                'id': conversa.id,
                'nome': nome_exibicao,
                'tipo': conversa.tipo,
                'participantes': participantes
            })

        except Exception as e:
            print(f"❌ Erro ao abrir conversa: {e}")
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})
        
    def excluir_grupo(self):
        """Excluir um grupo permanentemente"""
        usuario = self.get_usuario_autenticado()
        if not usuario:
            response.status = 401
            return json.dumps({'error': 'Não autenticado'})

        try:
            data = request.json
            grupo_id = data.get('grupo_id')
            
            print(f"🗑️ [EXCLUIR-GRUPO] Iniciando exclusão do grupo: {grupo_id}")
            print(f"👤 [EXCLUIR-GRUPO] Usuário solicitante: {usuario.username} (ID: {usuario.id})")

            if not grupo_id:
                response.status = 400
                return json.dumps({'error': 'ID do grupo é obrigatório'})

            # Buscar informações do grupo
            from app.models.conversa import Conversa
            conversa = Conversa.buscar_por_id(grupo_id)
            
            if not conversa:
                response.status = 404
                return json.dumps({'error': 'Grupo não encontrado'})

            # Verificar se o grupo é realmente um grupo
            if conversa.tipo != 'group':
                response.status = 400
                return json.dumps({'error': 'Esta conversa não é um grupo'})

            # Verificar se o usuário é o criador do grupo
            if conversa.criado_por != usuario.id:
                response.status = 403
                return json.dumps({'error': 'Apenas o criador do grupo pode excluí-lo'})

            # Excluir o grupo
            resultado = Conversa.excluir_grupo(grupo_id, usuario.id)
            
            if resultado:
                print(f"✅ [EXCLUIR-GRUPO] Grupo {grupo_id} excluído com sucesso")
                return json.dumps({
                    'success': True,
                    'message': f'Grupo "{conversa.nome}" foi excluído permanentemente'
                })
            else:
                response.status = 500
                return json.dumps({'error': 'Erro ao excluir grupo'})

        except Exception as e:
            print(f"💥 [EXCLUIR-GRUPO] Erro inesperado: {e}")
            import traceback
            traceback.print_exc()
            response.status = 500
            return json.dumps({'error': f'Erro interno: {str(e)}'})
