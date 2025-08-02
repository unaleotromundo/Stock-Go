css
body {
font-family: sans-serif;
display: flex;
flex-direction: column;
align-items: center;
gap: 20px;
padding: 20px;
}

textarea {
width: 80%;
padding: 10px;
font-size: 16px;
}

button {
padding: 10px 20px;
font-size: 16px;
cursor: pointer;
}

#imageResult img {
max-width: 500px;
height: auto;
border: 1px solid #ccc;
margin-top: 20px;
}

#promptResult {
width: 80%;
padding: 10px;
border: 1px solid #eee;
background-color: #f9f9f9;
white-space: pre-wrap;
}

script.js (la lógica del frontend)
Crea un archivo llamado script.js en la misma carpeta y pega este contenido:

javascript
document.addEventListener('DOMContentLoaded', () => {
const imagePromptInput = document.getElementById('imagePrompt');
const generateImageBtn = document.getElementById('generateImageBtn');
const magicPromptBtn = document.getElementById('magicPromptBtn');
const imageResultDiv = document.getElementById('imageResult');
const promptResultDiv = document.getElementById('promptResult');

generateImageBtn.addEventListener('click', async () => {
    const prompt = imagePromptInput.value;
    if (prompt) {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        if (data?.imageUrl) {
            imageResultDiv.innerHTML = `<img src="${data.imageUrl}" alt="Imagen generada">`;
        } else {
            imageResultDiv.innerHTML = `<p>Error al generar la imagen: ${data?.error || 'Inténtalo de nuevo.'}</p>`;
        }
    } else {
        alert('Por favor, escribe un prompt para la imagen.');
    }
});

magicPromptBtn.addEventListener('click', async () => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Genera un prompt creativo y divertido para la creación de una imagen.' }),
    });

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        imagePromptInput.value = data.candidates?.[0]?.content?.parts?.[0]?.text;
        promptResultDiv.textContent = `Prompt generado: ${imagePromptInput.value}`;
    } else {
        promptResultDiv.textContent = 'Error al generar el prompt.';
    }
});
});