document.addEventListener('DOMContentLoaded', () => {
    const storesGrid = document.getElementById('stores-grid');
    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');

    // **Nota:** En un proyecto real, estas tiendas vendrían de una base de datos.
    // Aquí usamos datos de ejemplo para simular la funcionalidad.
    const mockStores = [
        {
            id: 1,
            name: "Moda Urbana",
            slogan: "Estilo que te define",
            logo: "https://via.placeholder.com/80x80.png?text=MU",
            banner: "https://via.placeholder.com/300x120.png?text=Moda+Urbana"
        },
        {
            id: 2,
            name: "Artesanías El Sol",
            slogan: "Hecho a mano con amor",
            logo: "https://via.placeholder.com/80x80.png?text=AS",
            banner: "https://via.placeholder.com/300x120.png?text=Artesanias+El+Sol"
        },
        {
            id: 3,
            name: "Tecno Gadgets",
            slogan: "Innovación en tus manos",
            logo: "https://via.placeholder.com/80x80.png?text=TG",
            banner: "https://via.placeholder.com/300x120.png?text=Tecno+Gadgets"
        }
    ];

    // 1. Función para renderizar las tiendas en la cuadrícula
    const renderStores = (stores) => {
        storesGrid.innerHTML = ''; // Limpia la cuadrícula
        if (stores.length === 0) {
            storesGrid.innerHTML = `<div class="no-stores-msg"><p>No se encontraron tiendas que coincidan con la búsqueda.</p></div>`;
            return;
        }

        stores.forEach(store => {
            const storeCard = document.createElement('div');
            storeCard.className = 'store-card';
            storeCard.innerHTML = `
                <div class="store-banner" style="background-image: url('${store.banner}')"></div>
                <div class="store-content">
                    <div class="store-logo" style="background-image: url('${store.logo}')"></div>
                    <h3>${store.name}</h3>
                    <p>${store.slogan}</p>
                </div>
            `;
            storeCard.addEventListener('click', () => {
                // Redirige al catálogo de la tienda
                alert(`Redirigiendo al catálogo de ${store.name}`);
                // window.location.href = `catalogo.html?storeId=${store.id}`;
            });
            storesGrid.appendChild(storeCard);
        });
    };

    // Renderizar todas las tiendas al cargar la página
    renderStores(mockStores);

    // 2. Lógica de la barra de búsqueda
    const handleSearch = () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredStores = mockStores.filter(store => 
            store.name.toLowerCase().includes(searchTerm) ||
            store.slogan.toLowerCase().includes(searchTerm)
        );
        renderStores(filteredStores);
    };

    searchBtn.addEventListener('click', handleSearch);
    searchBar.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});