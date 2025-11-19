# test_bcrypt.py
import bcrypt

def test_bcrypt():
    print("🧪 Testando bcrypt...")
    
    # Teste de hash
    password = "minhasenha123"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    print(f"✅ Hash gerado: {hashed.decode('utf-8')}")
    
    # Teste de verificação
    check = bcrypt.checkpw(password.encode('utf-8'), hashed)
    print(f"✅ Verificação: {check}")
    
    # Teste com senha errada
    wrong_check = bcrypt.checkpw("senhaerrada".encode('utf-8'), hashed)
    print(f"✅ Verificação com senha errada: {wrong_check}")

if __name__ == '__main__':
    test_bcrypt()