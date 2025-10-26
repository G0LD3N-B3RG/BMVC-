# Chat_Online/route.py
from app.controllers.application import Application
from bottle import Bottle, route, run, request, static_file
from bottle import redirect, template, response, post, get

app = Bottle()
ctl = Application()

#-----------------------------------------------------------------------------
# Rotas:

@app.route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./app/static')

@app.route('/')
def index():
    return redirect('/home')

@app.route('/helper')
def action_helper(info= None):
    return ctl.render('helper')

#-----------------------------------------------------------------------------
# Rotas do Chat:

@app.get('/home')
def action_home():
    return ctl.home_get()

@app.get('/chat')
def action_chat():
    return ctl.chat_get()

@app.post('/send')
def action_send():
    return ctl.send_message()

@app.get('/messages')
def action_messages():
    return ctl.get_messages()

# Rotas para servir mídia
@app.route('/uploads/images/<filename:path>')
def serve_image(filename):
    return ctl.serve_image(filename)

@app.route('/uploads/audios/<filename:path>')
def serve_audio(filename):
    return ctl.serve_audio(filename)

#-----------------------------------------------------------------------------

if __name__ == '__main__':
    run(app, host='localhost', port=8080, debug=True)