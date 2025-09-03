let currentEditingRecipe = null;
let stock = {};
let recipes = {};
let sales = [];
let movements = [];

// === Cargar datos desde localStorage al iniciar ===
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateReports();
    updateProductSuggestions();
});

// === Cargar datos guardados ===
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
        stock = {};
        recipes = {};
        sales = [];
        movements = [];
    }
}

// === Guardar datos antes de salir ===
window.addEventListener('beforeunload', function() {
    saveData();
});

// === Función para guardar datos ===
function saveData() {
    try {
        const data = { stock, recipes, sales, movements };
        localStorage.setItem('dannysBurgerData', JSON.stringify(data));
    } catch (e) {
        console.error('No se pudo guardar en localStorage:', e);
    }
}

// === Cambiar tema ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeIcon = document.getElementById('themeIcon');
    body.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// === Mostrar sección activa ===
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');

    if (sectionName === 'stock') updateStockDisplay();
    if (sectionName === 'recipes') updateRecipesDisplay();
    if (sectionName === 'sales') updateSalesButtons();
    if (sectionName === 'reports') updateReports();
}

// === Actualizar display de stock (tabla) ===
function updateStockDisplay() {
    const container = document.getElementById('stockTableBody');
    if (Object.keys(stock).length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    <p>No hay productos en el stock</p>
                    <button class="btn btn-gold" onclick="openAddStockModal()">Agregar primero un producto</button>
                </td>
            </tr>
        `;
        return;
    }

    let tableHTML = '';
    for (let [name, data] of Object.entries(stock)) {
        let quantityClass = 'good';
        if (data.quantity <= 5) quantityClass = 'low';
        else if (data.quantity <= 15) quantityClass = 'medium';

        tableHTML += `
            <tr>
                <td>${name}</td>
                <td class="stock-quantity ${quantityClass}">${data.quantity} ${data.unit}</td>
                <td>
                    <button class="edit-btn" onclick="editProduct('${name}')">✏️</button>
                    <button class="delete-btn" onclick="removeProduct('${name}')">🗑️</button>
                </td>
            </tr>
        `;
    }
    container.innerHTML = tableHTML;
}

// === Editar producto ===
function editProduct(productName) {
    const product = stock[productName];
    const modal = document.getElementById('addStockModal');
    const nameInput = document.getElementById('productNameModal');
    const quantityInput = document.getElementById('productQuantityModal');
    const unitSelect = document.getElementById('productUnitModal');

    nameInput.value = productName;
    quantityInput.value = product.quantity;
    unitSelect.value = product.unit;

    // Cambiar texto del botón
    document.querySelector('#addStockModal .btn.btn-gold').textContent = '💾 Guardar Cambios';
    document.querySelector('#addStockModal .btn.btn-gold').onclick = () => saveEditedProduct();

    modal.classList.add('show');
}

// === Guardar producto editado ===
function saveEditedProduct() {
    const name = document.getElementById('productNameModal').value.trim();
    const quantity = parseInt(document.getElementById('productQuantityModal').value);
    const unit = document.getElementById('productUnitModal').value;

    if (!name || isNaN(quantity) || quantity < 0) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }

    // Guardar cambios
    stock[name].quantity = quantity;
    stock[name].unit = unit;

    // Registrar movimiento
    movements.push({
        date: new Date().toLocaleString('es-AR'),
        type: 'Entrada',
        product: name,
        quantity: quantity,
        description: `Edición de stock: ${quantity} ${unit}`
    });

    showAlert('success', `✅ Se actualizó el stock de "${name}"`);
    updateStockDisplay();
    updateProductSuggestions();
    saveData();

    // Restaurar botón original
    document.querySelector('#addStockModal .btn.btn-gold').textContent = 'Agregar Producto';
    document.querySelector('#addStockModal .btn.btn-gold').onclick = addStockFromModal;

    closeAddStockModal();
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

// === Agregar ingrediente a receta ===
function addIngredient() {
    const container = document.getElementById('ingredientsList');
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'recipe-item';
    const stockOptions = Object.keys(stock).map(item => 
        `<option value="${item}">${item}</option>`
    ).join('');
    ingredientDiv.innerHTML = `
        <select class="ingredient-select" style="margin-right: 10px;">
            <option value="">Seleccionar producto...</option>
            ${stockOptions}
        </select>
        <input type="number" placeholder="Cantidad" min="1" class="ingredient-quantity" style="width: 100px; margin: 0 10px;">
        <button class="btn btn-danger" onclick="this.parentElement.remove()">Quitar</button>
    `;
    container.appendChild(ingredientDiv);
}

// === Guardar receta ===
function saveRecipe() {
    const name = document.getElementById('recipeName').value.trim();
    const price = parseFloat(document.getElementById('recipePrice').value);
    const ingredientItems = document.querySelectorAll('#ingredientsList .recipe-item');
    if (!name || !price || ingredientItems.length === 0) {
        alert('Por favor completa todos los campos de la receta');
        return;
    }
    const ingredients = {};
    let validRecipe = true;
    ingredientItems.forEach(item => {
        const select = item.querySelector('.ingredient-select');
        const quantity = item.querySelector('.ingredient-quantity');
        if (select.value && quantity.value) {
            ingredients[select.value] = parseInt(quantity.value);
        } else {
            validRecipe = false;
        }
    });
    if (!validRecipe) {
        alert('Todos los ingredientes deben tener producto y cantidad');
        return;
    }
    recipes[name] = { ingredients, price };
    document.getElementById('recipeName').value = '';
    document.getElementById('recipePrice').value = '';
    document.getElementById('ingredientsList').innerHTML = '';
    showAlert('success', `✅ Receta "${name}" guardada correctamente`);
    updateRecipesDisplay();
    updateSalesButtons();
    saveData();
}

// === Actualizar display de recetas ===
function updateRecipesDisplay() {
    const container = document.getElementById('savedRecipes');
    container.innerHTML = '<h3>🍔 Recetas Guardadas:</h3>';
    for (let [name, recipe] of Object.entries(recipes)) {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe-item';
        const ingredientsList = Object.entries(recipe.ingredients)
            .map(([ingredient, quantity]) => `${quantity} ${ingredient}`)
            .join(', ');
        recipeDiv.innerHTML = `
            <div>
                <strong>${name}</strong> - $${recipe.price}<br>
                <small>Ingredientes: ${ingredientsList}</small>
            </div>
            <div>
                <button class="btn edit-btn" style="margin-right: 5px;">Editar</button>
                <button class="btn btn-danger delete-btn">Eliminar</button>
            </div>
        `;
        const editBtn = recipeDiv.querySelector('.edit-btn');
        const deleteBtn = recipeDiv.querySelector('.delete-btn');
        editBtn.addEventListener('click', () => editRecipe(name));
        deleteBtn.addEventListener('click', () => deleteRecipe(name));
        container.appendChild(recipeDiv);
    }
}

// === Actualizar sugerencias de productos ===
function updateProductSuggestions() {
    const datalist = document.getElementById('productSuggestions');
    datalist.innerHTML = '';
    Object.keys(stock).forEach(productName => {
        const option = document.createElement('option');
        option.value = productName;
        datalist.appendChild(option);
    });
}

// === Editar receta ===
function editRecipe(recipeName) {
    currentEditingRecipe = recipeName;
    const recipe = recipes[recipeName];
    document.getElementById('editRecipeName').value = recipeName;
    document.getElementById('editRecipePrice').value = recipe.price;
    const ingredientsList = document.getElementById('editIngredientsList');
    ingredientsList.innerHTML = '';
    Object.entries(recipe.ingredients).forEach(([ingredient, quantity]) => {
        addEditIngredient(ingredient, quantity);
    });
    document.getElementById('editModal').classList.add('show');
}

// === Agregar ingrediente en modal de edición ===
function addEditIngredient(selectedIngredient = '', selectedQuantity = '') {
    const container = document.getElementById('editIngredientsList');
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'modal-ingredient-item';
    const stockOptions = Object.keys(stock).map(item => 
        `<option value="${item}" ${item === selectedIngredient ? 'selected' : ''}>${item}</option>`
    ).join('');
    ingredientDiv.innerHTML = `
        <select class="edit-ingredient-select">
            <option value="">Seleccionar producto...</option>
            ${stockOptions}
        </select>
        <input type="number" placeholder="Cantidad" min="1" class="edit-ingredient-quantity" value="${selectedQuantity}">
        <button type="button" class="btn btn-danger" style="padding: 8px 12px; font-size: 0.9em;" onclick="this.parentElement.remove()">❌</button>
    `;
    container.appendChild(ingredientDiv);
}

// === Guardar receta editada ===
function saveEditedRecipe() {
    const newName = document.getElementById('editRecipeName').value.trim();
    const newPrice = parseFloat(document.getElementById('editRecipePrice').value);
    const ingredientItems = document.querySelectorAll('#editIngredientsList .modal-ingredient-item');
    if (!newName || !newPrice || ingredientItems.length === 0) {
        alert('Por favor completa todos los campos de la receta');
        return;
    }
    const ingredients = {};
    let validRecipe = true;
    ingredientItems.forEach(item => {
        const select = item.querySelector('.edit-ingredient-select');
        const quantity = item.querySelector('.edit-ingredient-quantity');
        if (select.value && quantity.value && parseInt(quantity.value) > 0) {
            ingredients[select.value] = parseInt(quantity.value);
        } else {
            validRecipe = false;
        }
    });
    if (!validRecipe) {
        alert('Todos los ingredientes deben tener producto y cantidad válida');
        return;
    }
    if (currentEditingRecipe && currentEditingRecipe !== newName) {
        delete recipes[currentEditingRecipe];
    }
    recipes[newName] = { ingredients, price: newPrice };
    closeEditModal();
    showAlert('success', `✅ Receta "${newName}" actualizada correctamente`);
    updateRecipesDisplay();
    updateSalesButtons();
    saveData();
}

// === Cerrar modal de edición ===
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingRecipe = null;
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
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

// === Actualizar botones de venta ===
function updateSalesButtons() {
    const container = document.getElementById('salesButtons');
    container.innerHTML = '';
    if (Object.keys(recipes).length === 0) {
        container.innerHTML = `
            <div class="sale-btn" style="background: #95a5a6; cursor: not-allowed; color: white;">
                🍔 No hay recetas disponibles<br>
                <small>Crea recetas en la sección correspondiente</small>
            </div>
        `;
        return;
    }
    for (let [name, recipe] of Object.entries(recipes)) {
        const canMake = checkCanMakeRecipe(name);
        const button = document.createElement('button');
        button.className = 'sale-btn';
        if (canMake) {
            button.onclick = () => makeSale(name);
            button.innerHTML = `
                🍔 ${name}<br>
                <strong>$${recipe.price}</strong>
            `;
        } else {
            button.disabled = true;
            button.innerHTML = `
                ❌ ${name}<br>
                <small>Sin stock suficiente</small>
            `;
        }
        container.appendChild(button);
    }
}

// === Verificar si se puede hacer la receta ===
function checkCanMakeRecipe(recipeName) {
    const recipe = recipes[recipeName];
    for (let [ingredient, needed] of Object.entries(recipe.ingredients)) {
        if (!stock[ingredient] || stock[ingredient].quantity < needed) {
            return false;
        }
    }
    return true;
}

// === Realizar venta ===
function makeSale(recipeName) {
    if (!checkCanMakeRecipe(recipeName)) {
        alert('No hay stock suficiente para esta receta');
        return;
    }
    const recipe = recipes[recipeName];
    for (let [ingredient, needed] of Object.entries(recipe.ingredients)) {
        stock[ingredient].quantity -= needed;
        movements.push({
            date: new Date().toLocaleString('es-AR'),
            type: 'Salida',
            product: ingredient,
            quantity: needed,
            description: `Venta: ${recipeName}`
        });
    }
    sales.push({
        date: new Date().toLocaleString('es-AR'),
        product: recipeName,
        price: recipe.price
    });
    showAlert('success', `✅ Venta registrada: ${recipeName} - $${recipe.price}`);
    updateSalesButtons();
    updateStockDisplay();
    saveData();
}

// === Actualizar reportes ===
function updateReports() {
    const today = new Date().toLocaleDateString('es-AR');
    const todaySales = sales.filter(sale => {
        const saleDate = new Date(sale.date.split(' ')[0].split('/').reverse().join('-')).toLocaleDateString('es-AR');
        return saleDate === today;
    });
    let todayTotal = 0;
    const todayContainer = document.getElementById('todaySales');
    if (todaySales.length === 0) {
        todayContainer.innerHTML = '<p>No hay ventas registradas hoy 📊</p>';
    } else {
        let salesHTML = '<table>';
        salesHTML += '<tr><th>🍔 Producto</th><th>💰 Precio</th><th>🕒 Hora</th></tr>';
        todaySales.forEach(sale => {
            todayTotal += sale.price;
            const time = sale.date.split(' ')[1];
            salesHTML += `<tr><td>${sale.product}</td><td>$${sale.price}</td><td>${time}</td></tr>`;
        });
        salesHTML += '</table>';
        salesHTML += `<p style="text-align: center; font-size: 1.3em; margin-top: 15px;"><strong>💵 Total del día: $${todayTotal}</strong></p>`;
        todayContainer.innerHTML = salesHTML;
    }

    const historyContainer = document.getElementById('movementHistory');
    if (movements.length === 0) {
        historyContainer.innerHTML = '<p>No hay movimientos registrados 📋</p>';
    } else {
        let historyHTML = '<table>';
        historyHTML += '<tr><th>📅 Fecha</th><th>📊 Tipo</th><th>🥪 Producto</th><th>🔢 Cantidad</th><th>📝 Descripción</th></tr>';
        movements.slice(-20).reverse().forEach(mov => {
            const typeIcon = mov.type === 'Entrada' ? '⬆️' : '⬇️';
            const typeColor = mov.type === 'Entrada' ? 'var(--success)' : 'var(--danger)';
            historyHTML += `
                <tr>
                    <td style="font-size: 0.9em;">${mov.date}</td>
                    <td style="color: ${typeColor}; font-weight: bold;">${typeIcon} ${mov.type}</td>
                    <td>${mov.product}</td>
                    <td>${mov.quantity}</td>
                    <td style="font-size: 0.9em;">${mov.description}</td>
                </tr>
            `;
        });
        historyHTML += '</table>';
        historyContainer.innerHTML = historyHTML;
    }
}

// === Mostrar alertas ===
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    const content = document.querySelector('.content');
    content.insertBefore(alertDiv, content.firstChild);
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

// === Cargar datos de ejemplo ===
function loadSampleData() {
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
            ingredients: {
                'Pan Brioche': 1,
                'Medallón Danny\'s': 1,
                'Queso Cheddar': 1,
                'Lechuga Criolla': 2,
                'Tomate Cherry': 3,
                'Salsa Danny\'s': 1
            },
            price: 3800
        },
        'Bacon Deluxe': {
            ingredients: {
                'Pan Brioche': 1,
                'Medallón Danny\'s': 1,
                'Bacon Ahumado': 3,
                'Queso Cheddar': 2,
                'Cebolla Morada': 2,
                'Salsa Danny\'s': 1
            },
            price: 4500
        },
        'Combo Danny\'s Special': {
            ingredients: {
                'Pan Brioche': 1,
                'Medallón Danny\'s': 1,
                'Bacon Ahumado': 2,
                'Queso Cheddar': 1,
                'Lechuga Criolla': 2,
                'Tomate Cherry': 3,
                'Salsa Danny\'s': 1,
                'Papas Rústicas': 1,
                'Coca Cola': 1
            },
            price: 5200
        },
        'Combo Premium': {
            ingredients: {
                'Pan Brioche': 1,
                'Medallón Danny\'s': 2,
                'Bacon Ahumado': 3,
                'Queso Cheddar': 2,
                'Cebolla Morada': 3,
                'Salsa Danny\'s': 1,
                'Aros de Cebolla': 1,
                'Cerveza Artesanal': 1
            },
            price: 6800
        }
    };
    showAlert('success', '🍔 ¡Datos de Danny\'s Burger cargados! Listos para cocinar.');
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateProductSuggestions();
    saveData();
}

// === Confirmar limpieza total ===
function confirmClearAllData() {
    const confirmation = confirm(
        '⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos?\n' +
        'Se borrarán:\n' +
        '  • Stock actual (productos y cantidades)\n' +
        '  • Recetas y combos\n' +
        '  • Ventas registradas\n' +
        '  • Historial de movimientos\n' +
        'Esta acción NO se puede deshacer.\n' +
        '¿Deseas continuar?'
    );
    if (confirmation) {
        clearAllData();
    }
}

// === Limpiar todos los datos ===
function clearAllData() {
    stock = {};
    recipes = {};
    sales = [];
    movements = [];
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateReports();
    showAlert('warning', '🗑️ Todos los datos han sido eliminados');
    saveData();
}

// === Exportar JSON + PDF ===
function exportDataAndPDF() {
    if (movements.length === 0) {
        alert('No hay movimientos para exportar.');
        return;
    }
    const exportData = {
        stock,
        recipes,
        sales,
        movements,
        exportedAt: new Date().toLocaleString('es-AR')
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `dannys-burger-datos-${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.json`;
    jsonLink.click();

    setTimeout(() => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            alert('Bloqueador de pop-ups activado. Por favor, habilítalo.');
            return;
        }
        const pdfContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Historial de Movimientos - Danny's Burger</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
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
                    <p><strong>Fecha de exportación:</strong> ${new Date().toLocaleString('es-AR')}</p>
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
                            const typeColor = mov.type === 'Entrada' ? '#27ae60' : '#e74c3c';
                            return `
                                <tr>
                                    <td style="font-size: 0.9em;">${mov.date}</td>
                                    <td style="color: ${typeColor}; font-weight: bold;">
                                        ${mov.type === 'Entrada' ? '⬆️' : '⬇️'} ${mov.type}
                                    </td>
                                    <td>${mov.product}</td>
                                    <td>${mov.quantity}</td>
                                    <td style="font-size: 0.9em;">${mov.description}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="footer">
                    🍔 Danny's Burger - Sistema de Gestión de Stock
                </div>
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

// === Modal: Cargar Stock ===
function openAddStockModal() {
    document.getElementById('addStockModal').classList.add('show');
    document.getElementById('productNameModal').focus();
    document.querySelector('#addStockModal .btn.btn-gold').textContent = 'Agregar Producto';
    document.querySelector('#addStockModal .btn.btn-gold').onclick = addStockFromModal;
}
function closeAddStockModal() {
    document.getElementById('addStockModal').classList.remove('show');
    document.getElementById('productNameModal').value = '';
    document.getElementById('productQuantityModal').value = '';
}
function addStockFromModal() {
    const name = document.getElementById('productNameModal').value.trim();
    const quantity = parseInt(document.getElementById('productQuantityModal').value);
    const unit = document.getElementById('productUnitModal').value;
    if (!name || isNaN(quantity) || quantity < 0) {
        alert('Por favor completa todos los campos correctamente');
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
    showAlert('success', `✅ Se agregaron ${quantity} ${unit} de ${name}`);
    updateStockDisplay();
    updateProductSuggestions();
    saveData();
    closeAddStockModal();
}

// Cerrar modal al hacer clic fuera
document.getElementById('addStockModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeAddStockModal();
    }
});