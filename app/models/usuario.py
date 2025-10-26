# BMVC_chat/app/models/usuario.py
class Usuario:
    def __init__(self, nome: str):
        self.nome = nome.strip()