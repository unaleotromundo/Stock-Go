document.addEventListener('DOMContentLoaded', () => {
    const storeForm = document.getElementById('store-form');
    const sloganInput = document.getElementById('store-slogan');
    const logoUploadArea = document.getElementById('logo-upload');
    const bannerUploadArea = document.getElementById('banner-upload');
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const qrCodeDiv = document.getElementById('qr-code');

    // Manejar la subida y previsualización de imágenes
    const handleImageUpload = (input, area) => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                area.style.backgroundImage = `url(${e.target.result})`;
                area.style.backgroundSize = 'cover';
                area.style.backgroundPosition = 'center';
                area.innerHTML = ''; // Limpiar el icono de cámara
            };
            reader.readAsDataURL(file);
        }
    };

    logoUploadArea.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', () => handleImageUpload(input, logoUploadArea));
        input.click();
    });

    bannerUploadArea.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', () => handleImageUpload(input, bannerUploadArea));
        input.click();
    });
    
    // URL del servidor para la generación de imágenes
    const IMAGE_GEN_URL = "https://tucatalogo.vercel.app/api/generate-image";

    // Manejar la generación de contenido con IA
    const handleAIButtonClick = async (targetElement, action) => {
        targetElement.textContent = 'Generando...';
        
        try {
            if (action === 'slogan') {
                // Lógica de IA para el eslogan (podría ir a otro endpoint)
                setTimeout(() => {
                    sloganInput.value = 'Tu Eslogan Generado por IA';
                    targetElement.textContent = 'Generar con IA';
                }, 1500);

            } else if (action === 'logo' || action === 'banner') {
                // Se ha cambiado el nombre de la variable para evitar el error
                const userPrompt = prompt("Ingresa una descripción para tu imagen:");
                if (!userPrompt) {
                    targetElement.textContent = 'Generar con IA';
                    return;
                }

                // Llamada a tu servidor para generar la imagen
                const response = await fetch(IMAGE_GEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: userPrompt }) // Usamos la nueva variable aquí
                });

                const result = await response.json();
                
                if (result.imageUrl) {
                    const area = action === 'logo' ? logoUploadArea : bannerUploadArea;
                    area.style.backgroundImage = `url(${result.imageUrl})`;
                    area.style.backgroundSize = 'cover';
                    area.style.backgroundPosition = 'center';
                    area.innerHTML = ''; // Limpiar el icono de cámara
                } else {
                    alert(result.error || 'Error al generar la imagen.');
                }
            }
        } catch (error) {
            console.error('Error al generar con IA:', error);
            alert('Hubo un error al conectar con el servidor.');
        }

        targetElement.textContent = 'Generar con IA';
    };

    document.querySelectorAll('.ai-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.slogan-container') || e.target.closest('.image-box');
            if (container.querySelector('input')) {
                handleAIButtonClick(e.target, 'slogan');
            } else if (container.querySelector('#logo-upload')) {
                handleAIButtonClick(e.target, 'logo');
            } else if (container.querySelector('#banner-upload')) {
                handleAIButtonClick(e.target, 'banner');
            }
        });
    });

    // Generar Código QR (usando una API o librería externa)
    generateQrBtn.addEventListener('click', () => {
        const websiteUrl = document.getElementById('store-website').value;
        if (websiteUrl) {
            qrCodeDiv.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(websiteUrl)}" alt="Código QR">`;
        } else {
            alert('Por favor, ingresa una dirección de página web para generar el QR.');
        }
    });

    // Manejar el envío del formulario
    storeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const storeData = new FormData(storeForm);
        console.log('Datos de la tienda guardados:', storeData);
        alert('¡Tienda guardada con éxito! Ahora puedes crear tu catálogo.');
        // Redirigir a la página de creación de catálogo
        // window.location.href = 'crear_catalogo.html'; 
    });
});