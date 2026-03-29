import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCx1ydeZ1HvunA2iedzJqLZDDwUOnXUL1c",
    authDomain: "bloxchatting.firebaseapp.com",
    databaseURL: "https://bloxchatting-default-rtdb.firebaseio.com",
    projectId: "bloxchatting",
    storageBucket: "bloxchatting.firebasestorage.app",
    messagingSenderId: "600333968159",
    appId: "1:600333968159:web:7a57e0e8ae2eed30a6062a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// Função para gerar o ID de 10 caracteres
function gerarID10() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// 1. Iniciar Login com Google
window.loginGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Verifica se o usuário já tem perfil no Realtime Database
        const snapshot = await get(ref(db, `users/${user.uid}`));
        
        if (snapshot.exists()) {
            // Se já existe, vai direto pro Home
            window.location.href = "home.html";
        } else {
            // Se não existe, mostra a tela de Setup
            document.getElementById('step-login').classList.add('hidden');
            document.getElementById('step-setup').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Falha ao conectar com Google.");
    }
};

// 2. Criar Perfil Final
window.finalizarPerfil = async () => {
    const nick = document.getElementById('setup-nick').value.trim();
    const pass = document.getElementById('setup-pass').value.trim();
    const btn = document.getElementById('btn-create');

    if (nick.length < 3 || pass.length < 6) {
        alert("Nick (min 3 chars) e Senha (min 6 chars) obrigatórios!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "GENERATING ID...";

    const uid = auth.currentUser.uid;
    const tag10 = gerarID10();

    try {
        await set(ref(db, `users/${uid}`), {
            username: nick,
            password: pass, // Senha para chats privados/acesso
            tag: tag10,
            fullID: `${nick}#${tag10}`,
            email: auth.currentUser.email,
            createdAt: Date.now()
        });

        // Redireciona para o Home
        window.location.href = "home.html";
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao criar perfil.");
        btn.disabled = false;
        btn.innerText = "CREATE & ENTER";
    }
};
