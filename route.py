# Chat_Online/route.py
from app.controllers.application import Application
from bottle import Bottle, route, run, request, static_file
from bottle import redirect, template, response, post, get

app = Bottle()
ctl = Application()

#-----------------------------------------------------------------------------
# ROTAS PÚBLICAS (Não requerem autenticação)
#-----------------------------------------------------------------------------

@app.route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./app/static')

@app.route('/')
def index():
    return redirect('/portal')

@app.route('/portal')
def portal():
    return ctl.portal_get()

#-----------------------------------------------------------------------------
# CRUD DE AUTENTICAÇÃO (Login/Logout/Cadastro)
#-----------------------------------------------------------------------------

@app.post('/cadastrar')
def cadastrar():
    return ctl.cadastrar_post()

@app.post('/login')
def login():
    return ctl.login_post()

@app.post('/logout')
def logout():
    return ctl.logout_post()

#-----------------------------------------------------------------------------
# CRUD DE USUÁRIOS
#-----------------------------------------------------------------------------

@app.get('/user-info')
def user_info():
    return ctl.user_info()

@app.get('/user-list')
def user_list():
    return ctl.user_list()

@app.get('/search-users')
def search_users():
    return ctl.search_users()

@app.post('/delete-account')
def delete_account():
    return ctl.delete_account()

#-----------------------------------------------------------------------------
# CRUD DE MENSAGENS (CREATE, READ, UPDATE, DELETE)
#-----------------------------------------------------------------------------

@app.post('/send')
def send_message():
    return ctl.send_message()

@app.get('/messages')
def get_messages():
    return ctl.get_messages()

@app.post('/edit-message')
def edit_message():
    return ctl.edit_message()

@app.post('/delete-message') 
def delete_message():
    return ctl.delete_message()

#-----------------------------------------------------------------------------
# CRUD DE AMIZADES (Sistema Social)
#-----------------------------------------------------------------------------

@app.post('/send-friend-request')
def send_friend_request():
    return ctl.send_friend_request()

@app.post('/accept-friend-request')
def accept_friend_request():
    return ctl.accept_friend_request()

@app.post('/reject-friend-request')
def reject_friend_request():
    return ctl.reject_friend_request()

@app.get('/friends')
def get_friends():
    return ctl.get_friends()

@app.get('/friend-requests')
def get_friend_requests():
    return ctl.get_friend_requests()

@app.post('/remove-friend')
def remove_friend():
    return ctl.remove_friend()

#-----------------------------------------------------------------------------
# CRUD DE CONVERSAS E GRUPOS
#-----------------------------------------------------------------------------

@app.get('/conversas')
def get_conversas():
    return ctl.get_conversas()

@app.post('/criar-grupo')
def criar_grupo():
    return ctl.criar_grupo()

@app.get('/abrir-conversa')
def abrir_conversa():
    return ctl.abrir_conversa()

@app.post('/excluir-grupo')
def excluir_grupo():
    return ctl.excluir_grupo()
#-----------------------------------------------------------------------------
# SERVIÇOS DE MÍDIA (Uploads)
#-----------------------------------------------------------------------------

@app.route('/uploads/images/<filename:path>')
def serve_image(filename):
    return ctl.serve_image(filename)

@app.route('/uploads/audios/<filename:path>')
def serve_audio(filename):
    return ctl.serve_audio(filename)

#-----------------------------------------------------------------------------
# ROTAS DE PÁGINAS (Views)
#-----------------------------------------------------------------------------

@app.get('/home')
def home_page():
    return ctl.home_get()

#-----------------------------------------------------------------------------
# ROTAS DE DEBUG (Desenvolvimento)
#-----------------------------------------------------------------------------

@app.post('/debug-request')
def debug_request():
    return ctl.debug_request()

#-----------------------------------------------------------------------------

if __name__ == '__main__':
    # Inicializar banco de dados
    from app.models.database import Database
    db = Database()
    db.init_db()
    
    run(app, host='localhost', port=8080, debug=True)