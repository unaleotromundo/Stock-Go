// === script.js (sin cambios, ya incluye partículas) ===
let currentEditingRecipe = null;
let stock = {};
let recipes = {};
let sales = [];
let movements = {};

// === Carrito de ventas con cantidades ===
let selectedSales = {};

// === Referencias al widget flotante ===
let floatingCart, floatingCartItems, floatingTotal, closeFloatingCart, confirmFloatingSale;

// === Cargar datos al iniciar ===
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateReports();
    updateProductSuggestions();
    createParticles(); // ✅ Partículas activadas

    // Inicializar referencias al widget flotante
    floatingCart = document.getElementById('floatingCart');
    floatingCartItems = document.getElementById('floatingCartItems');
    floatingTotal = document.getElementById('floatingTotal');
    closeFloatingCart = document.getElementById('closeFloatingCart');
    confirmFloatingSale = document.getElementById('confirmFloatingSale');

    // Eventos del widget
    if (closeFloatingCart) {
        closeFloatingCart.onclick = () => {
            floatingCart.style.display = 'none';
        };
    }

    if (confirmFloatingSale) {
        confirmFloatingSale.onclick = confirmSelectedSales;
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddStockModal();
            closeEditModal();
            closeEditProductModal();
            if (floatingCart) floatingCart.style.display = 'none';
        }
    });

    // Actualizar carrito inicial
    updateFloatingCart();
});

// === Cargar desde localStorage ===
function loadData() {
    try {
        const saved = localStorage.getItem('dannysBurgerData');
        if (saved) {
            const data = JSON.parse(saved);
            stock = data.stock || {};
            recipes = data.recipes || {};
            sales = data.sales || [];
            movements = data.movements || [];
            showAlert('success', '✅ Datos recuperados automáticamente.');
        }
    } catch (e) {
        console.error('Error al cargar datos:', e);
        resetData();
    }
}

// === Guardar en localStorage antes de salir ===
window.addEventListener('beforeunload', saveData);

// === Guardar datos ===
function saveData() {
    try {
        const data = { stock, recipes, sales, movements };
        localStorage.setItem('dannysBurgerData', JSON.stringify(data));
    } catch (e) {
        console.error('No se pudo guardar:', e);
    }
}

// === Resetear datos ===
function resetData() {
    stock = {};
    recipes = {};
    sales = [];
    movements = [];
}

// === Cambiar tema ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// === Mostrar sección activa ===
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    switch (sectionName) {
        case 'stock': updateStockDisplay(); break;
        case 'recipes': updateRecipesDisplay(); break;
        case 'sales': updateSalesButtons(); break;
        case 'reports': updateReports(); break;
    }
}

// === Escapar HTML para evitar inyección ===
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === Desescapar texto para usarlo en JS ===
function unescapeHtml(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
}

// === Eventos delegados con data-* (seguro con apostrofes) ===
document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    let name = target.dataset.name || target.closest('[data-name]')?.dataset.name;

    if (name) {
        name = unescapeHtml(name);
    }

    switch (action) {
        case 'add-to-sale':
            addToSale(name);
            break;
        case 'remove-one':
            removeOneFromSelection(name);
            break;
        case 'edit-product':
            editProduct(name);
            break;
        case 'delete-product':
            removeProduct(name);
            break;
        case 'edit-recipe':
            editRecipe(name);
            break;
        case 'delete-recipe':
            deleteRecipe(name);
            break;
    }
});

// === Actualizar display de stock ===
function updateStockDisplay() {
    const container = document.getElementById('stockDisplay');
    if (Object.keys(stock).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ccc;">
                <p>No hay productos en stock.</p>
                <button class="btn btn-gold" onclick="loadSampleData()">Cargar Datos de Ejemplo</button>
            </div>
        `;
        return;
    }

    let tableHTML = `<table><thead><tr><th>Producto</th><th>Cantidad</th><th>Acciones</th></tr></thead><tbody>`;
    for (let [name, data] of Object.entries(stock)) {
        const escapedName = escapeHtml(name);
        const quantityClass = data.quantity <= 5 ? 'low' : data.quantity <= 15 ? 'medium' : 'good';
        tableHTML += `
            <tr>
                <td>${escapedName}</td>
                <td class="stock-quantity ${quantityClass}">${data.quantity} ${escapeHtml(data.unit)}</td>
                <td class="actions">
                    <button class="edit-btn" data-action="edit-product" data-name="${escapedName}">✏️</button>
                    <button class="delete-btn" data-action="delete-product" data-name="${escapedName}">🗑️</button>
                </td>
            </tr>
        `;
    }
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

// === Editar producto ===
function editProduct(name) {
    const product = stock[name];
    if (!product) return;
    document.getElementById('editProductName').value = name;
    document.getElementById('editProductQuantity').value = product.quantity;
    document.getElementById('editProductUnit').value = product.unit;
    document.getElementById('editProductModal').classList.add('show');
}

// === Guardar producto editado ===
function saveEditedProduct() {
    const name = document.getElementById('editProductName').value.trim();
    const quantity = parseInt(document.getElementById('editProductQuantity').value);
    const unit = document.getElementById('editProductUnit').value;

    if (!name || isNaN(quantity) || quantity < 0) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }

    stock[name] = { quantity, unit };
    updateStockDisplay();
    showAlert('success', `✅ Producto "${name}" actualizado correctamente`);
    closeEditProductModal();
    saveData();
}

// === Cerrar modal de edición de producto ===
function closeEditProductModal() {
    document.getElementById('editProductModal').classList.remove('show');
}

// === Eliminar producto ===
function removeProduct(name) {
    if (confirm(`¿Estás seguro de eliminar "${name}" del stock?`)) {
        delete stock[name];
        updateStockDisplay();
        updateProductSuggestions();
        showAlert('warning', `⚠️ Se eliminó ${name} del stock`);
        saveData();
    }
}

// === Actualizar recetas (tarjetas) ===
function updateRecipesDisplay() {
    const container = document.getElementById('savedRecipes');
    container.innerHTML = '';

    if (Object.keys(recipes).length === 0) {
        container.innerHTML = '<p>No hay recetas creadas aún. Haz clic en "AGREGAR Combo/Receta" para comenzar.</p>';
        return;
    }

    for (let [name, recipe] of Object.entries(recipes)) {
        const escapedName = escapeHtml(name);
        const ingredientsList = Object.entries(recipe.ingredients)
            .map(([ing, qty]) => `${qty} ${escapeHtml(ing)}`)
            .join(', ');

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="burger-icon">🍔</div>
            <h3>${escapedName}</h3>
            <div class="price">Precio: $${recipe.price}</div>
            <div class="ingredients"><strong>Ingredientes:</strong><span>${escapeHtml(ingredientsList)}</span></div>
            <div class="actions">
                <button class="edit-btn" data-action="edit-recipe" data-name="${escapedName}">✏️ Editar</button>
                <button class="delete-btn" data-action="delete-recipe" data-name="${escapedName}">🗑️ Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    }
}

// === Actualizar sugerencias de productos ===
function updateProductSuggestions() {
    const datalist = document.getElementById('productSuggestions');
    datalist.innerHTML = '';
    Object.keys(stock).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
    });
}

// === Abrir modal para nueva receta ===
function openAddRecipeModal() {
    currentEditingRecipe = null;
    document.getElementById('editRecipeName').value = '';
    document.getElementById('editRecipePrice').value = '';
    document.getElementById('editIngredientsList').innerHTML = '';
    addEditIngredient();
    document.getElementById('editModal').classList.add('show');
}

// === Editar receta ===
function editRecipe(name) {
    currentEditingRecipe = name;
    const recipe = recipes[name];
    document.getElementById('editRecipeName').value = name;
    document.getElementById('editRecipePrice').value = recipe.price;
    document.getElementById('editIngredientsList').innerHTML = '';
    Object.entries(recipe.ingredients).forEach(([ing, qty]) => addEditIngredient(ing, qty));
    document.getElementById('editModal').classList.add('show');
}

// === Agregar ingrediente en modal ===
function addEditIngredient(ingredient = '', quantity = '') {
    const container = document.getElementById('editIngredientsList');
    const div = document.createElement('div');
    div.className = 'modal-ingredient-item';
    const options = Object.keys(stock).map(i => `<option value="${escapeHtml(i)}" ${i === ingredient ? 'selected' : ''}>${escapeHtml(i)}</option>`).join('');
    div.innerHTML = `
        <select class="edit-ingredient-select"><option value="">Seleccionar...</option>${options}</select>
        <input type="number" placeholder="Cantidad" min="1" class="edit-ingredient-quantity" value="${quantity}">
        <button type="button" class="btn btn-danger" style="padding:8px 12px;font-size:0.9em;" onclick="this.parentElement.remove()">❌</button>
    `;
    container.appendChild(div);
}

// === Guardar receta editada ===
function saveEditedRecipe() {
    const name = document.getElementById('editRecipeName').value.trim();
    const price = parseFloat(document.getElementById('editRecipePrice').value);
    const items = document.querySelectorAll('#editIngredientsList .modal-ingredient-item');

    if (!name) {
        alert('El nombre de la receta no puede estar vacío');
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert('El precio debe ser un número mayor a 0');
        return;
    }
    if (items.length === 0) {
        alert('Agrega al menos un ingrediente');
        return;
    }

    const ingredients = {};
    for (const item of items) {
        const select = item.querySelector('.edit-ingredient-select');
        const input = item.querySelector('.edit-ingredient-quantity');
        const qty = parseInt(input.value);
        const ingName = select.value.trim();
        if (ingName && qty > 0) {
            ingredients[ingName] = qty;
        } else {
            alert('Todos los ingredientes deben tener producto y cantidad válida');
            return;
        }
    }

    recipes[name] = { ingredients, price };
    if (currentEditingRecipe && currentEditingRecipe !== name) {
        delete recipes[currentEditingRecipe];
    }
    closeEditModal();
    showAlert('success', `✅ Receta "${name}" guardada`);
    updateRecipesDisplay();
    updateSalesButtons();
    saveData();
}

// === Cerrar modal de receta ===
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingRecipe = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById('editModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeEditModal();
});

// === Eliminar receta ===
function deleteRecipe(name) {
    if (confirm(`¿Eliminar la receta "${name}"?`)) {
        delete recipes[name];
        updateRecipesDisplay();
        updateSalesButtons();
        showAlert('warning', `⚠️ Se eliminó la receta ${name}`);
        saveData();
    }
}

// === Verificar si se puede hacer la receta ===
function checkCanMakeRecipe(name) {
    const recipe = recipes[name];
    for (let [ing, needed] of Object.entries(recipe.ingredients)) {
        if (!stock[ing] || stock[ing].quantity < needed) return false;
    }
    return true;
}

// === Verifica si agregar 1 más excede el stock disponible ===
function wouldExceedStock(name, currentQty) {
    const recipe = recipes[name];
    for (let [ing, neededPerUnit] of Object.entries(recipe.ingredients)) {
        const totalNeeded = neededPerUnit * (currentQty + 1);
        if (!stock[ing] || stock[ing].quantity < totalNeeded) {
            return true;
        }
    }
    return false;
}

// === Agregar un ítem al carrito (puede sumar si ya existe) ===
function addToSale(name) {
    if (!checkCanMakeRecipe(name)) {
        showAlert('warning', `⚠️ No hay stock suficiente para ${name}`);
        return;
    }

    if (selectedSales[name] && wouldExceedStock(name, selectedSales[name])) {
        showAlert('warning', `⚠️ No puedes agregar más: alcanzaste el límite de stock para ${name}`);
        return;
    }

    selectedSales[name] = (selectedSales[name] || 0) + 1;
    updateSalesButtons();
    updateFloatingCart();
}

// === Actualizar botones de venta (versión con acumulación) ===
function updateSalesButtons() {
    const container = document.getElementById('salesButtons');
    container.innerHTML = '';

    if (Object.keys(recipes).length === 0) {
        container.innerHTML = `
            <div class="sale-btn" style="background:#95a5a6;color:white;cursor:not-allowed;height:80px;display:flex;align-items:center;justify-content:center;">
                🍔 No hay recetas disponibles<br><small>Crea recetas primero</small>
            </div>
        `;
        return;
    }

    for (let [name, recipe] of Object.entries(recipes)) {
        const button = document.createElement('button');
        button.className = 'sale-btn';
        button.dataset.name = name;
        button.dataset.action = 'add-to-sale';

        const canMake = checkCanMakeRecipe(name);
        const willExceed = selectedSales[name] && wouldExceedStock(name, selectedSales[name]);

        if (canMake && !willExceed) {
            button.innerHTML = `🍔 ${escapeHtml(name)}<br><strong>$${recipe.price}</strong>`;
            if (selectedSales[name]) {
                button.classList.add('selected');
                const badge = document.createElement('span');
                badge.style.position = 'absolute';
                badge.style.top = '4px';
                badge.style.right = '4px';
                badge.style.background = '#27ae60';
                badge.style.color = 'white';
                badge.style.borderRadius = '50%';
                badge.style.width = '18px';
                badge.style.height = '18px';
                badge.style.fontSize = '0.7em';
                badge.style.display = 'flex';
                badge.style.alignItems = 'center';
                badge.style.justifyContent = 'center';
                badge.textContent = selectedSales[name];
                button.appendChild(badge);
            }
        } else {
            button.disabled = true;
            button.innerHTML = `❌<br><small>Sin stock</small>`;
        }

        container.appendChild(button);
    }
}

// === Actualizar el widget flotante ===
function updateFloatingCart() {
    if (!floatingCartItems) return;
    floatingCartItems.innerHTML = '';

    const items = Object.entries(selectedSales);
    if (items.length === 0) {
        floatingCartItems.innerHTML = '<p style="color:#ccc;text-align:center;">Vacío</p>';
        floatingTotal.textContent = '$0';
        floatingCart.style.display = 'none';
        return;
    }

    let total = 0;
    items.forEach(([name, qty]) => {
        const recipe = recipes[name];
        const itemTotal = recipe.price * qty;
        total += itemTotal;

        const item = document.createElement('div');
        item.style.margin = '6px 0';
        item.style.padding = '8px';
        item.style.background = 'var(--card-bg)';
        item.style.borderRadius = '8px';
        item.style.fontSize = '0.9em';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        item.innerHTML = `
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                🍔 ×${qty} ${escapeHtml(name)}
            </span>
            <span style="color: var(--accent-gold); margin: 0 8px;">$${itemTotal}</span>
            <button class="btn btn-danger"
                    style="padding:4px 8px;font-size:0.8em;"
                    data-action="remove-one"
                    data-name="${escapeHtml(name)}">
                ➖
            </button>
        `;
        floatingCartItems.appendChild(item);
    });

    floatingTotal.textContent = `$${total}`;
    floatingCart.style.display = 'flex';
}

// === Quitar solo una unidad del carrito ===
function removeOneFromSelection(name) {
    if (selectedSales[name] > 1) {
        selectedSales[name]--;
    } else {
        delete selectedSales[name];
    }
    updateSalesButtons();
    updateFloatingCart();
}

// === Confirmar todas las ventas ===
function confirmSelectedSales() {
    if (Object.keys(selectedSales).length === 0) return;

    const totalAmount = Object.entries(selectedSales).reduce((sum, [name, qty]) => {
        return sum + (recipes[name].price * qty);
    }, 0);

    Object.entries(selectedSales).forEach(([name, qty]) => {
        const recipe = recipes[name];
        for (let i = 0; i < qty; i++) {
            for (let [ing, needed] of Object.entries(recipe.ingredients)) {
                stock[ing].quantity -= needed;
                movements.push({
                    date: new Date().toLocaleString('es-AR'),
                    type: 'Salida',
                    product: ing,
                    quantity: needed,
                    description: `Venta: ${name}`
                });
            }
            sales.push({
                date: new Date().toLocaleString('es-AR'),
                product: name,
                price: recipe.price
            });
        }
    });

    const totalItems = Object.values(selectedSales).reduce((a, b) => a + b, 0);
    showAlert('success', `✅ Venta registrada: ${Object.keys(selectedSales).length} productos, ${totalItems} ítems - Total: $${totalAmount}`);

    selectedSales = {};
    updateSalesButtons();
    updateStockDisplay();
    updateReports();
    saveData();
    floatingCart.style.display = 'none';
}

// === Sumar todas las cantidades ===
function sumQuantities(obj) {
    return Object.values(obj).reduce((a, b) => a + b, 0);
}

// === Actualizar reportes ===
function updateReports() {
    const today = new Date().toLocaleDateString('es-AR');
    const todaySales = sales.filter(s => {
        const date = new Date(s.date.split(' ')[0].split('/').reverse().join('-')).toLocaleDateString('es-AR');
        return date === today;
    });

    const todayContainer = document.getElementById('todaySales');
    if (todaySales.length === 0) {
        todayContainer.innerHTML = '<p>No hay ventas hoy 📊</p>';
    } else {
        const total = todaySales.reduce((sum, s) => sum + s.price, 0);
        let html = '<table><tr><th>🍔 Producto</th><th>💰 Precio</th><th>🕒 Hora</th></tr>';
        todaySales.forEach(s => {
            const time = s.date.split(' ')[1];
            html += `<tr><td>${escapeHtml(s.product)}</td><td>$${s.price}</td><td>${time}</td></tr>`;
        });
        html += `</table><p style="text-align:center;font-size:1.3em;margin-top:15px;"><strong>💵 Total: $${total}</strong></p>`;
        todayContainer.innerHTML = html;
    }

    const historyContainer = document.getElementById('movementHistory');
    if (movements.length === 0) {
        historyContainer.innerHTML = '<p>No hay movimientos 📋</p>';
    } else {
        let html = '<table><tr><th>📅 Fecha</th><th>📊 Tipo</th><th>🥪 Producto</th><th>🔢 Cantidad</th><th>📝 Descripción</th></tr>';
        movements.slice(-20).reverse().forEach(mov => {
            const escapedProduct = escapeHtml(mov.product);
            const escapedDesc = escapeHtml(mov.description);
            const color = mov.type === 'Entrada' ? '#27ae60' : '#e74c3c';
            html += `
                <tr>
                    <td style="font-size:0.9em;">${mov.date}</td>
                    <td style="color:${color};font-weight:bold;">${mov.type === 'Entrada' ? '⬆️' : '⬇️'} ${mov.type}</td>
                    <td>${escapedProduct}</td>
                    <td>${mov.quantity}</td>
                    <td style="font-size:0.9em;">${escapedDesc}</td>
                </tr>
            `;
        });
        html += '</table>';
        historyContainer.innerHTML = html;
    }
}

// === Mostrar alertas ===
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const content = document.querySelector('.content');
    content.insertBefore(alert, content.firstChild);
    setTimeout(() => alert.remove(), 4000);
}

// === Cargar datos de ejemplo ===
function loadSampleData() {
    if (Object.keys(stock).length > 0 || Object.keys(recipes).length > 0) {
        const confirmLoad = confirm('¿Estás seguro? Esto sobrescribirá el stock y recetas actuales.');
        if (!confirmLoad) return;
    }

    stock = {
        'Pan Brioche': { quantity: 50, unit: 'unidades' },
        'Medallón Danny\'s': { quantity: 45, unit: 'unidades' },
        'Queso Cheddar': { quantity: 40, unit: 'fetas' },
        'Bacon Ahumado': { quantity: 30, unit: 'tiras' },
        'Tomate Cherry': { quantity: 25, unit: 'unidades' },
        'Lechuga Criolla': { quantity: 35, unit: 'hojas' },
        'Cebolla Morada': { quantity: 20, unit: 'rodajas' },
        'Salsa Danny\'s': { quantity: 15, unit: 'porciones' },
        'Papas Rústicas': { quantity: 40, unit: 'porciones' },
        'Aros de Cebolla': { quantity: 25, unit: 'porciones' },
        'Coca Cola': { quantity: 48, unit: 'latas' },
        'Cerveza Artesanal': { quantity: 24, unit: 'botellas' },
        'Agua Saborizada': { quantity: 36, unit: 'botellas' }
    };

    recipes = {
        'Danny\'s Classic': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Queso Cheddar': 1, 'Lechuga Criolla': 2, 'Tomate Cherry': 3, 'Salsa Danny\'s': 1 },
            price: 3800
        },
        'Bacon Deluxe': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Bacon Ahumado': 3, 'Queso Cheddar': 2, 'Cebolla Morada': 2, 'Salsa Danny\'s': 1 },
            price: 4500
        },
        'Combo Danny\'s Special': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Bacon Ahumado': 2, 'Queso Cheddar': 1, 'Lechuga Criolla': 2, 'Tomate Cherry': 3, 'Salsa Danny\'s': 1, 'Papas Rústicas': 1, 'Coca Cola': 1 },
            price: 5200
        },
        'Combo Premium': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 2, 'Bacon Ahumado': 3, 'Queso Cheddar': 2, 'Cebolla Morada': 3, 'Salsa Danny\'s': 1, 'Aros de Cebolla': 1, 'Cerveza Artesanal': 1 },
            price: 6800
        }
    };

    showAlert('success', '🍔 ¡Datos de ejemplo cargados!');
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateProductSuggestions();
    saveData();
}

// === Confirmar limpieza total ===
function confirmClearAllData() {
    const confirmation = confirm(
        '⚠️ ¿Eliminar TODOS los datos?\n' +
        'Se borrarán:\n' +
        '  • Stock\n' +
        '  • Recetas\n  • Ventas\n  • Historial\n' +
        'Esta acción NO se puede deshacer.\n¿Continuar?'
    );
    if (confirmation) clearAllData();
}

function clearAllData() {
    resetData();
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateReports();
    showAlert('warning', '🗑️ Todos los datos eliminados');
    saveData();
}

// === Exportar XML + PDF ===
function exportDataAndPDF() {
    if (movements.length === 0) {
        alert('No hay movimientos para exportar.');
        return;
    }

    // Crear XML
    const exportedAt = new Date().toLocaleString('es-AR');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<DannysBurgerData exportedAt="${exportedAt}">
    <Stock>\n`;
    
    for (let [name, data] of Object.entries(stock)) {
        const escapedName = escapeHtml(name);
        xml += `        <Producto nombre="${escapedName}" cantidad="${data.quantity}" unidad="${data.unit}"/>\n`;
    }
    xml += `    </Stock>\n    <Recetas>\n`;

    for (let [name, recipe] of Object.entries(recipes)) {
        const escapedName = escapeHtml(name);
        xml += `        <Receta nombre="${escapedName}" precio="${recipe.price}">\n`;
        for (let [ing, qty] of Object.entries(recipe.ingredients)) {
            const escapedIng = escapeHtml(ing);
            xml += `            <Ingrediente nombre="${escapedIng}" cantidad="${qty}"/>\n`;
        }
        xml += `        </Receta>\n`;
    }
    xml += `    </Recetas>\n    <Ventas>\n`;

    sales.forEach(s => {
        const escapedProduct = escapeHtml(s.product);
        xml += `        <Venta fecha="${s.date}" producto="${escapedProduct}" precio="${s.price}"/>\n`;
    });
    xml += `    </Ventas>\n    <Movimientos>\n`;

    movements.forEach(mov => {
        const escapedProduct = escapeHtml(mov.product);
        const escapedDesc = escapeHtml(mov.description);
        xml += `        <Movimiento fecha="${mov.date}" tipo="${mov.type}" producto="${escapedProduct}" cantidad="${mov.quantity}" descripcion="${escapedDesc}"/>\n`;
    });
    xml += `    </Movimientos>\n</DannysBurgerData>`;

    // Descargar XML
    const xmlBlob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(xmlBlob);
    const xmlLink = document.createElement('a');
    xmlLink.href = xmlUrl;
    xmlLink.download = `dannys-burger-datos-${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xml`;
    xmlLink.click();

    // Esperar un momento antes de generar el PDF (para que no bloquee)
    setTimeout(() => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            showAlert('danger', '❌ No se pudo abrir el PDF. Desactiva el bloqueador de pop-ups.');
            return;
        }
        const pdfContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Historial de Movimientos - Danny's Burger</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 50px; background: white; color: #2c3e50; }
                    h1, h2 { text-align: center; color: #1a1a1a; }
                    h1 { font-size: 2.5em; margin-bottom: 10px; }
                    h2 { color: #6c757d; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f4d03f; color: #1a1a1a; font-weight: bold; }
                    tr:hover { background: #f9f9f9; }
                    .footer { text-align: center; margin-top: 50px; color: #999; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 20px; }
                    .burger-icon { font-size: 2em; color: #f4d03f; text-align: center; display: block; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 40px;">
                    <div class="burger-icon">🍔</div>
                    <h1>Danny's Burger</h1>
                    <h2>Historial de Movimientos • 2024</h2>
                    <p><strong>Fecha de exportación:</strong> ${exportedAt}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>📅 Fecha</th>
                            <th>📊 Tipo</th>
                            <th>🥪 Producto</th>
                            <th>🔢 Cantidad</th>
                            <th>📝 Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movements.map(mov => {
                            const escapedProduct = escapeHtml(mov.product);
                            const escapedDesc = escapeHtml(mov.description);
                            const color = mov.type === 'Entrada' ? '#27ae60' : '#e74c3c';
                            return `
                                <tr>
                                    <td style="font-size:0.9em;">${mov.date}</td>
                                    <td style="color:${color};font-weight:bold;">${mov.type === 'Entrada' ? '⬆️' : '⬇️'} ${mov.type}</td>
                                    <td>${escapedProduct}</td>
                                    <td>${mov.quantity}</td>
                                    <td style="font-size:0.9em;">${escapedDesc}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="footer">🍔 Danny's Burger - Sistema de Gestión de Stock</div>
                <script>
                    window.onload = function() {
                        const opt = {
                            margin: 1,
                            filename: 'Historial-Movimientos-DannysBurger-${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.pdf',
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2, backgroundColor: '#fff' },
                            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
                        };
                        html2pdf().set(opt).from(document.body).save();
                    };
                <\/script>
            </body>
            </html>
        `;
        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();
    }, 600);
}

// === Modales: Cargar Stock ===
function openAddStockModal() {
    document.getElementById('addStockModal').classList.add('show');
    document.getElementById('productNameModal').focus();
}

function closeAddStockModal() {
    document.getElementById('addStockModal').classList.remove('show');
    document.getElementById('productNameModal').value = '';
    document.getElementById('productQuantityModal').value = '';
}

function addStockFromModal() {
    const name = document.getElementById('productNameModal').value.trim();
    const quantity = parseInt(document.getElementById('productQuantityModal').value);
    const unit = document.getElementById('editProductUnit').value;

    if (!name || isNaN(quantity) || quantity < 0) {
        alert('Completa todos los campos');
        return;
    }

    if (stock[name]) {
        stock[name].quantity += quantity;
    } else {
        stock[name] = { quantity, unit };
    }

    movements.push({
        date: new Date().toLocaleString('es-AR'),
        type: 'Entrada',
        product: name,
        quantity: quantity,
        description: `Carga de stock: ${quantity} ${unit}`
    });

    showAlert('success', `✅ ${quantity} ${unit} de ${name} agregados`);
    updateStockDisplay();
    updateProductSuggestions();
    saveData();
    closeAddStockModal();
}

// Cerrar modal al hacer clic fuera
document.getElementById('addStockModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('addStockModal')) closeAddStockModal();
});

// === Partículas animadas (fondo decorativo) ===
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth > 768 ? 20 : 8;

    const create = () => {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 6 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.animationDelay = `${Math.random() * 5}s`;
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(p);
        setTimeout(() => {
            if (p.parentElement === container) container.removeChild(p);
        }, 20000);
    };

    for (let i = 0; i < count; i++) {
        setTimeout(create, i * 1000);
    }

    setInterval(() => {
        document.querySelectorAll('#particles .particle').forEach(p => p.remove());
        for (let i = 0; i < count; i++) {
            setTimeout(create, i * 500);
        }
    }, 30000);
}