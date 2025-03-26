import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SEU_DATABASE_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Criar Sala
document.getElementById("createRoom").addEventListener("click", () => {
    const roomRef = push(ref(db, "rooms"));
    set(roomRef, { players: {}, status: "waiting" })
        .then(() => {
            alert("Sala criada! Código: " + roomRef.key);
            loadRooms(); // Atualiza a lista de salas
        })
        .catch(error => {
            console.error("Erro ao criar sala:", error);
            alert("Erro ao criar sala. Veja o console.");
        });
});

// Entrar na Sala
document.getElementById("joinRoom").addEventListener("click", () => {
    const roomCode = document.getElementById("roomCode").value.trim();
    if (roomCode === "") {
        document.getElementById("statusMessage").textContent = "Digite um código de sala!";
        return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);

    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            const playerId = `player_${Math.floor(Math.random() * 10000)}`;
            set(ref(db, `rooms/${roomCode}/players/${playerId}`), { status: "ready" })
                .then(() => {
                    document.getElementById("statusMessage").textContent = `Entrou na sala: ${roomCode}`;
                })
                .catch(error => {
                    document.getElementById("statusMessage").textContent = "Erro ao entrar na sala.";
                });
        } else {
            document.getElementById("statusMessage").textContent = "Sala não encontrada!";
        }
    });
});

// Carregar salas ao carregar a página
function loadRooms() {
    document.getElementById("loadingScreen").style.display = "block"; // Exibir tela de carregamento

    const roomsRef = ref(db, "rooms");
    onValue(roomsRef, (snapshot) => {
        const rooms = snapshot.val();
        const roomList = document.getElementById("availableRooms");
        roomList.innerHTML = ""; // Limpa a lista de salas

        if (rooms) { // Verifique se há salas
            for (const roomId in rooms) {
                if (rooms.hasOwnProperty(roomId)) {
                    const room = rooms[roomId];
                    const li = document.createElement("li");
                    li.textContent = `Sala: ${roomId} - Status: ${room.status}`;
                    roomList.appendChild(li);
                }
            }
        } else {
            const li = document.createElement("li");
            li.textContent = "Nenhuma sala disponível.";
            roomList.appendChild(li);
        }

        // Remover a tela de carregamento depois de carregar as salas
        document.getElementById("loadingScreen").style.display = "none";
    }, (error) => {
        console.error("Erro ao carregar salas:", error);
        document.getElementById("loadingScreen").style.display = "none"; // Esconde o carregamento em caso de erro
    });
}


// Carregar salas ao carregar a página
loadRooms();
