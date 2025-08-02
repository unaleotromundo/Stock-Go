document.addEventListener('DOMContentLoaded', () => {
    // Escuchar clics en los botones principales
    const tiendaBtn = document.querySelector('.btn-tienda');
    const catalogoBtn = document.querySelector('.btn-catalogo');
    
    tiendaBtn.addEventListener('click', () => {
        window.location.href = 'crear_tienda.html'; 
    });
    
    catalogoBtn.addEventListener('click', () => {
        window.location.href = 'crear_catalogo.html';
    });

    // Lógica para el chat con IA
    const aiChatIcon = document.getElementById('ai-chat-icon');
    const chatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    
    // **NUEVA URL PARA CONECTAR AL SERVIDOR BACKEND**
    // ⚠️ ESTA ES LA LÍNEA QUE DEBES BUSCAR Y CAMBIAR ⚠️
    const CHAT_API_URL = "https://tucatalogo.vercel.app/api/chat";

    // Muestra/oculta el chat
    aiChatIcon.addEventListener('click', () => {
        chatModal.classList.toggle('visible');
    });

    closeChatBtn.addEventListener('click', () => {
        chatModal.classList.remove('visible');
    });

    const sendMessage = async () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'user-message';
        userMessageElement.textContent = userMessage;
        chatBody.appendChild(userMessageElement);
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
        
        const aiTypingElement = document.createElement('div');
        aiTypingElement.className = 'ai-message';
        aiTypingElement.textContent = 'Escribiendo...';
        chatBody.appendChild(aiTypingElement);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            // Envía la petición a tu propio servidor
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                aiTypingElement.textContent = aiResponse;
            } else {
                aiTypingElement.textContent = 'Lo siento, no pude generar una respuesta.';
            }

        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            aiTypingElement.textContent = 'Hubo un error al conectar con el asistente.';
        }
        
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});