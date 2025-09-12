// === Supabase Client ===
const SUPABASE_URL = 'https://uknsqhlejuxpbnakebdp.supabase.co';
// ✅ SERVICE ROLE KEY — REAL, SIN ESPACIOS, VERIFICADA
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbnNxaGxlanV4cGJuYWtlYmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzg2MDgsImV4cCI6MjA3MzAxNDYwOH0.6QBdfVyZjuGmnSarZ3dvyCnEM06kJfjR7bkvwdoeYEU';

let supabase;

// Verificar si el SDK está cargado
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase SDK cargado correctamente");
} else {
    console.error("❌ ERROR: Supabase SDK no está cargado. Verifica el orden de los scripts en tu HTML.");
    alert("Error crítico: Supabase no está disponible. Recarga la página o verifica la conexión.");
}

// === Variables globales ===
let currentEditingRecipe = null;
let stock = {};
let recipes = {};
let sales = [];
let movements = [];
let selectedSales = {};

// === Referencias al carrito flotante ===
let floatingCart, floatingCartItems, floatingTotal, closeFloatingCart, confirmFloatingSale;

// === Cargar datos al iniciar ===
document.addEventListener('DOMContentLoaded', async () => {
    if (!supabase) {
        console.error("⛔ Supabase no está inicializado. Abortando.");
        return;
    }

    console.log("🚀 Iniciando carga de datos desde Supabase...");
    await loadDataFromSupabase();
    updateStockDisplay();
    updateRecipesDisplay();
    updateSalesButtons();
    updateReports();
    updateProductSuggestions();
    createParticles();

    // Inicializar referencias al carrito
    floatingCart = document.getElementById('floatingCart');
    floatingCartItems = document.getElementById('floatingCartItems');
    floatingTotal = document.getElementById('floatingTotal');
    closeFloatingCart = document.getElementById('closeFloatingCart');
    confirmFloatingSale = document.getElementById('confirmFloatingSale');

    // Eventos del carrito
    if (closeFloatingCart) {
        closeFloatingCart.onclick = () => {
            floatingCart.style.display = 'none';
        };
    }

    if (confirmFloatingSale) {
        confirmFloatingSale.onclick = confirmSelectedSales;
    }

    // Asignar evento al botón de agregar stock
    const addStockButton = document.getElementById('addStockButton');
    if (addStockButton) {
        addStockButton.addEventListener('click', openAddStockModal);
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

    updateFloatingCart();

    // Cerrar sesión
    document.getElementById('logoutButton')?.addEventListener('click', () => {
        const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?\n\nSerás redirigido a la página principal.');
        if (confirmLogout) {
            sessionStorage.clear();
            showAlert('success', '👋 Sesión cerrada. Hasta luego!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        }
    });
});

// === Cargar datos desde Supabase ===
async function loadDataFromSupabase() {
    if (!supabase) return;

    try {
        console.log("📦 Cargando stock...");
        const { data: stockData, error: stockError } = await supabase
            .from('stock')
            .select('*')
            .throwOnError();
        if (stockError) throw stockError;
        stock = {};
        if (stockData) {
            stockData.forEach(item => {
                stock[item.name] = {
                    quantity: item.quantity,
                    unit: item.unit,
                    pricePerUnit: item.price_per_unit
                };
            });
        }
        console.log("✅ Stock cargado:", stockData ? stockData.length : 0, "productos");

        console.log("🍽️ Cargando recetas...");
        const { data: recipesData, error: recipesError } = await supabase
            .from('recipes')
            .select('*')
            .throwOnError();
        if (recipesError) throw recipesError;
        recipes = {};
        if (recipesData) {
            recipesData.forEach(recipe => {
                recipes[recipe.name] = {
                    ingredients: recipe.ingredients,
                    price: recipe.price
                };
            });
        }
        console.log("✅ Recetas cargadas:", recipesData ? recipesData.length : 0, "recetas");

        console.log("💰 Cargando ventas...");
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*, users(username)'); // Incluye el username del usuario
        if (salesError) throw salesError;
        sales = [];
        if (salesData) {
            sales = salesData.map(s => {
                // Formato: 'YYYY-MM-DD HH:MM:SS'
                const createdAt = new Date(s.created_at);
                const year = createdAt.getFullYear();
                const month = String(createdAt.getMonth() + 1).padStart(2, '0');
                const day = String(createdAt.getDate()).padStart(2, '0');
                const hours = String(createdAt.getHours()).padStart(2, '0');
                const minutes = String(createdAt.getMinutes()).padStart(2, '0');
                const seconds = String(createdAt.getSeconds()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return {
                    date: formattedDate,
                    product: s.product_name,
                    price: s.price,
                    user: s.user_id,
                    users: s.users || { username: '' }
                };
            });
        }
        console.log("✅ Ventas cargadas:", sales.length);

        console.log("📋 Cargando movimientos...");
        const { data: movementsData, error: movementsError } = await supabase
            .from('movements')
            .select('*')
            .order('created_at', { ascending: false })
            // .limit(100) <-- Eliminamos el límite para cargar TODO el historial
            .throwOnError();        if (movementsError) throw movementsError;
        movements = [];
        if (movementsData) {
            movements = movementsData.map(m => ({
                date: new Date(m.created_at).toLocaleString('es-AR'),
                type: m.type,
                product: m.product_name,
                quantity: m.quantity,
                description: m.description
            }));
        }
        console.log("✅ Movimientos cargados:", movements.length);

        showAlert('success', '✅ Datos cargados desde Supabase');
    } catch (e) {
        console.error('❌ Error al cargar desde Supabase:', e);
        showAlert('danger', '❌ Error al cargar datos. Verifica conexión o permisos.');
    }
}

// === Cambiar tema ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
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
        case 'mySales': updateMySales(); break;
    }
}

// === Escapar HTML ===
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function unescapeHtml(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
}

// === Eventos delegados ===
document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    let name = target.dataset.name || target.closest('[data-name]')?.dataset.name;

    if (name) name = unescapeHtml(name);

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

// === Actualizar stock ===
function updateStockDisplay() {
    const container = document.getElementById('stockDisplay');
    if (!container) return;

    if (Object.keys(stock).length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#ccc;">No hay productos</p>';
        return;
    }

    const isUserAdmin = sessionStorage.getItem('userRole') === 'admin';

    let html = `<table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Total</th>`;
    if (isUserAdmin) html += `<th>Acciones</th>`;
    html += `</tr></thead><tbody>`;

    for (let [name, data] of Object.entries(stock)) {
        const escapedName = escapeHtml(name);
        const cls = data.quantity <= 5 ? 'low' : data.quantity <= 15 ? 'medium' : 'good';
        const pricePerUnit = data.pricePerUnit || 0;
        const totalPrice = pricePerUnit * data.quantity;

        html += `
            <tr>
                <td>${escapedName}</td>
                <td class="stock-quantity ${cls}">${data.quantity} ${escapeHtml(data.unit)}</td>
                <td>$${pricePerUnit > 0 ? pricePerUnit.toFixed(2) : '—'}</td>
                <td>$${totalPrice > 0 ? totalPrice.toFixed(2) : '—'}</td>
        `;

        if (isUserAdmin) {
            html += `
                <td class="actions">
                    <button class="edit-btn" data-action="edit-product" data-name="${escapedName}">✏️</button>
                    <button class="delete-btn" data-action="delete-product" data-name="${escapedName}">🗑️</button>
                </td>
            `;
        }
        html += `</tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

// === Editar producto ===
function editProduct(name) {
    const product = stock[name];
    if (!product) return;

    const nameInput = document.getElementById('editProductName');
    const qtyInput = document.getElementById('editProductQuantity');
    const unitSelect = document.getElementById('editProductUnit');
    const priceInput = document.getElementById('editProductPricePerUnit');

    if (!nameInput || !qtyInput || !unitSelect || !priceInput) {
        console.error('❌ No se encontraron los elementos del modal');
        return;
    }

    nameInput.value = name;
    qtyInput.value = product.quantity;
    unitSelect.value = product.unit;
    priceInput.value = product.pricePerUnit || '';

    document.getElementById('editProductModal').classList.add('show');
}

// === Guardar producto editado ===
async function saveEditedProduct() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    const name = document.getElementById('editProductName').value.trim();
    const quantity = parseInt(document.getElementById('editProductQuantity').value);
    const unit = document.getElementById('editProductUnit').value;
    const pricePerUnit = parseFloat(document.getElementById('editProductPricePerUnit').value) || 0;

    if (!name || isNaN(quantity) || quantity < 0) {
        alert('Completa todos los campos correctamente');
        return;
    }

    console.log("💾 Guardando producto editado:", { name, quantity, unit, pricePerUnit });

    try {
        const { error } = await supabase
            .from('stock')
            .upsert({
                name: name,
                quantity: quantity,
                unit: unit,
                price_per_unit: pricePerUnit > 0 ? pricePerUnit : null
            }, { onConflict: 'name' });

        if (error) throw error;

        stock[name] = { 
            quantity, 
            unit, 
            pricePerUnit: pricePerUnit > 0 ? pricePerUnit : undefined 
        };

        updateStockDisplay();
        closeEditProductModal();
        showAlert('success', `✅ Producto "${name}" actualizado`);
        updateProductSuggestions();
        console.log("✅ Producto guardado correctamente");
    } catch (e) {
        console.error('❌ Error al guardar producto:', e);
        alert('Error al guardar. Verifica conexión.');
    }
}

// === Cerrar modal de producto ===
function closeEditProductModal() {
    document.getElementById('editProductModal').classList.remove('show');
}

// === Eliminar producto ===
async function removeProduct(name) {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    if (confirm(`¿Eliminar "${name}" del stock?`)) {
        console.log("🗑️ Eliminando producto:", name);
        try {
            const { error } = await supabase
                .from('stock')
                .delete()
                .eq('name', name);

            if (error) throw error;

            delete stock[name];
            updateStockDisplay();
            updateProductSuggestions();
            showAlert('warning', `⚠️ Se eliminó ${name}`);
            console.log("✅ Producto eliminado correctamente");
        } catch (e) {
            console.error('❌ Error al eliminar producto:', e);
            alert('Error al eliminar. Verifica conexión.');
        }
    }
}

// === Abrir modal para agregar stock ===
function openAddStockModal() {
    document.getElementById('productNameModal').value = '';
    document.getElementById('productQuantityModal').value = '';
    document.getElementById('productUnitModal').value = 'unidades';
    const priceInput = document.getElementById('productPricePerUnitModal');
    if (priceInput) priceInput.value = '';
    document.getElementById('addStockModal').classList.add('show');
}

// === Cerrar modal de agregar stock ===
function closeAddStockModal() {
    document.getElementById('addStockModal').classList.remove('show');
}

// === Agregar stock desde el modal ===
async function addStockFromModal() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    const name = document.getElementById('productNameModal').value.trim();
    const quantity = parseInt(document.getElementById('productQuantityModal').value);
    const unit = document.getElementById('productUnitModal').value;
    const priceInput = document.getElementById('productPricePerUnitModal');
    const pricePerUnit = priceInput ? parseFloat(priceInput.value) || 0 : 0;

    if (!name) {
        alert('Por favor, ingresa el nombre del producto.');
        return;
    }
    if (isNaN(quantity) || quantity < 0) {
        alert('Por favor, ingresa una cantidad válida.');
        return;
    }

    console.log("➕ Agregando stock:", { name, quantity, unit, pricePerUnit });

    try {
        // Sanitizar y codificar nombre
        const cleanName = String(name).trim();
        const encodedName = encodeURIComponent(cleanName);

const { data: currentStock, error: stockError } = await supabase
    .from('stock')
    .select('quantity')
    .eq('name', ing)
    .single();


        if (error && error.code !== 'PGRST116') { // no rows
            throw error;
        }

        let newQuantity = quantity;
        if (currentStock) {
            newQuantity = currentStock.quantity + quantity;
        }

        const { error: upsertError } = await supabase
            .from('stock')
            .upsert({
                name: cleanName,
                quantity: newQuantity,
                unit: unit,
                price_per_unit: pricePerUnit > 0 ? pricePerUnit : null
            }, { onConflict: 'name' })
            .throwOnError();

        if (upsertError) throw upsertError;

        stock[cleanName] = {
            quantity: newQuantity,
            unit: unit,
            pricePerUnit: pricePerUnit > 0 ? pricePerUnit : undefined
        };

        updateStockDisplay();
        updateProductSuggestions();
        closeAddStockModal();
        showAlert('success', `✅ Producto "${cleanName}" actualizado`);
        console.log("✅ Stock agregado/actualizado correctamente");

    } catch (e) {
        console.error('❌ Error al agregar stock:', e);
        alert('Error al guardar. Verifica conexión.');
    }
}

// === Actualizar recetas ===
function updateRecipesDisplay() {
    const container = document.getElementById('savedRecipes');
    if (!container) return;

    container.innerHTML = '';

    if (Object.keys(recipes).length === 0) {
        container.innerHTML = '<p>No hay recetas creadas aún.</p>';
        return;
    }

    const isUserAdmin = sessionStorage.getItem('userRole') === 'admin';

    for (let [name, recipe] of Object.entries(recipes)) {
        const escapedName = escapeHtml(name);
        const ingredientsList = Object.entries(recipe.ingredients)
            .map(([ing, qty]) => `${qty} ${escapeHtml(ing)}`)
            .join(', ');

        const actionsHTML = isUserAdmin
            ? `<div class="actions">
                <button class="edit-btn" data-action="edit-recipe" data-name="${escapedName}">✏️ Editar</button>
                <button class="delete-btn" data-action="delete-recipe" data-name="${escapedName}">🗑️ Eliminar</button>
              </div>`
            : '';

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="burger-icon">🍔</div>
            <h3>${escapedName}</h3>
            <div class="price">Precio: $${recipe.price}</div>
            <div class="ingredients"><strong>Ingredientes:</strong><span>${escapeHtml(ingredientsList)}</span></div>
            ${actionsHTML}
        `;
        container.appendChild(card);
    }
}

// === Actualizar sugerencias ===
function updateProductSuggestions() {
    const datalist = document.getElementById('productSuggestions');
    if (!datalist) return;
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

// === Guardar receta ===
async function saveEditedRecipe() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    const name = document.getElementById('editRecipeName').value.trim();
    const price = parseFloat(document.getElementById('editRecipePrice').value);
    const items = document.querySelectorAll('#editIngredientsList .modal-ingredient-item');

    if (!name) return alert('Nombre requerido');
    if (isNaN(price) || price <= 0) return alert('Precio inválido');
    if (items.length === 0) return alert('Agrega al menos un ingrediente');

    const ingredients = {};
    for (const item of items) {
        const select = item.querySelector('.edit-ingredient-select');
        const input = item.querySelector('.edit-ingredient-quantity');
        const qty = parseInt(input.value);
        const ingName = select.value.trim();
        if (ingName && qty > 0) {
            ingredients[ingName] = qty;
        } else {
            return alert('Ingrediente o cantidad inválida');
        }
    }

    try {
        const { error } = await supabase
            .from('recipes')
            .upsert({
                name: name,
                ingredients: ingredients,
                price: price
            }, { onConflict: 'name' })
            .throwOnError();

        if (error) throw error;

        recipes[name] = { ingredients, price };
        if (currentEditingRecipe && currentEditingRecipe !== name) {
            delete recipes[currentEditingRecipe];
        }
        closeEditModal();
        showAlert('success', `✅ Receta "${name}" guardada`);
        updateRecipesDisplay();
        updateSalesButtons();
        console.log("✅ Receta guardada correctamente");
    } catch (e) {
        console.error('❌ Error al guardar receta:', e);
        alert('Error al guardar. Verifica conexión.');
    }
}

// === Cerrar modal de receta ===
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingRecipe = null;
}

// === Eliminar receta ===
async function deleteRecipe(name) {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    if (confirm(`¿Eliminar la receta "${name}"?`)) {
        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('name', name)
                .throwOnError();

            if (error) throw error;

            delete recipes[name];
            updateRecipesDisplay();
            updateSalesButtons();
            showAlert('warning', `⚠️ Se eliminó la receta ${name}`);
            console.log("✅ Receta eliminada correctamente");
        } catch (e) {
            console.error('❌ Error al eliminar receta:', e);
            alert('Error al eliminar. Verifica conexión.');
        }
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

// === Verifica si agregar 1 más excede el stock ===
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

// === Agregar al carrito ===
function addToSale(name) {
    if (!checkCanMakeRecipe(name)) {
        showAlert('warning', `⚠️ No hay stock suficiente para ${name}`);
        return;
    }

    if (selectedSales[name] && wouldExceedStock(name, selectedSales[name])) {
        showAlert('warning', `⚠️ Alcanzaste el límite de stock para ${name}`);
        return;
    }

    const wasSelected = selectedSales[name] > 0;
    selectedSales[name] = (selectedSales[name] || 0) + 1;

    updateSalesButtons();
    updateFloatingCart();
}

// === Actualizar botones de venta ===
function updateSalesButtons() {
    const container = document.getElementById('salesButtons');
    if (!container) return;
    container.innerHTML = '';

    if (Object.keys(recipes).length === 0) {
        container.innerHTML = '<div class="sale-btn" style="background:#95a5a6;cursor:not-allowed;">🍔 No hay recetas</div>';
        return;
    }

    for (let [name, recipe] of Object.entries(recipes)) {
        const button = document.createElement('button');
        button.className = 'sale-btn';
        button.dataset.name = name;
        button.dataset.action = 'add-to-sale';
        button.title = name;

        const canMake = checkCanMakeRecipe(name);
        const willExceed = selectedSales[name] && wouldExceedStock(name, selectedSales[name]);

        if (canMake && !willExceed) {
            button.innerHTML = `
                <div class="button-content">
                    🍔<br><strong>$${recipe.price}</strong><br>
                    <span class="combo-name">${escapeHtml(name)}</span>
                </div>
                <span class="quantity-badge" style="display: none;"></span>
            `;
            button.style.position = 'relative';

            if (selectedSales[name] > 1) {
                const badge = button.querySelector('.quantity-badge');
                badge.textContent = `×${selectedSales[name]}`;
                badge.style.display = 'flex';
                badge.classList.add('flash');
                setTimeout(() => badge.classList.remove('flash'), 500);
            }

        } else {
            button.disabled = true;
            button.innerHTML = `❌<br><small>Sin stock</small>`;
        }

        container.appendChild(button);
    }
}

// === Actualizar carrito flotante ===
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
        item.style.margin = '6px 0'; item.style.padding = '8px';
        item.style.background = 'var(--card-bg)'; item.style.borderRadius = '8px';
        item.style.fontSize = '0.9em'; item.style.display = 'flex'; item.style.justifyContent = 'space-between';
        item.innerHTML = `
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                🍔 ×${qty} ${escapeHtml(name)}
            </span>
            <span style="color: var(--accent-gold); margin: 0 8px;">$${itemTotal}</span>
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                    data-action="remove-one" data-name="${escapeHtml(name)}">➖</button>
        `;
        floatingCartItems.appendChild(item);
    });

    floatingTotal.textContent = `$${total}`;
    floatingCart.style.display = 'flex';
}

// === Quitar uno del carrito ===
function removeOneFromSelection(name) {
    if (selectedSales[name] > 1) {
        selectedSales[name]--;
    } else {
        delete selectedSales[name];
    }
    updateSalesButtons();
    updateFloatingCart();
}

// === Confirmar venta optimizada ===
async function confirmSelectedSales() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    if (Object.keys(selectedSales).length === 0) {
        showAlert('warning', '⚠️ El carrito está vacío');
        return;
    }

    // 🔄 MOSTRAR LOADING STATE
    const confirmButton = document.getElementById('confirmFloatingSale');
    const originalText = confirmButton.textContent;
    confirmButton.disabled = true;
    confirmButton.innerHTML = '🔄 Procesando...';
    confirmButton.style.opacity = '0.6';

    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName') || 'Desconocido';

    try {
        // 📊 PREPARAR DATOS EN LOTES
        const salesData = [];
        const movementsData = [];
        const stockUpdates = new Map(); // Para agrupar actualizaciones de stock

        // 1️⃣ PREPARAR TODAS LAS OPERACIONES
        for (const [recipeName, qty] of Object.entries(selectedSales)) {
            const recipe = recipes[recipeName];
            if (!recipe) {
                throw new Error(`Receta "${recipeName}" no encontrada`);
            }

            // Preparar ventas (una por cada unidad vendida)
            for (let i = 0; i < qty; i++) {
                salesData.push({
                    product_name: recipeName,
                    price: recipe.price,
                    user_id: userId,
                    created_at: new Date().toISOString()
                });

                // Preparar movimientos y actualizaciones de stock
                for (const [ingredientName, neededPerUnit] of Object.entries(recipe.ingredients)) {
                    // Acumular cambios de stock
                    const currentReduction = stockUpdates.get(ingredientName) || 0;
                    stockUpdates.set(ingredientName, currentReduction + neededPerUnit);

                    // Preparar movimientos
                    movementsData.push({
                        type: 'Salida',
                        product_name: ingredientName,
                        quantity: neededPerUnit,
                        description: `Venta: ${recipeName} (por ${userName})`,
                        user_id: userId || 'Empleado', // <-- Esta es la línea clave
                        created_at: new Date().toISOString()
                    });
                }
            }
        }

        console.log('📋 Operaciones preparadas:', {
            ventas: salesData.length,
            movimientos: movementsData.length,
            productos_a_actualizar: stockUpdates.size
        });

        // 2️⃣ VERIFICAR STOCK DISPONIBLE
        for (const [ingredientName, totalNeeded] of stockUpdates) {
            if (!stock[ingredientName] || stock[ingredientName].quantity < totalNeeded) {
                throw new Error(`Stock insuficiente para "${ingredientName}". Disponible: ${stock[ingredientName]?.quantity || 0}, Necesario: ${totalNeeded}`);
            }
        }

        // 3️⃣ EJECUTAR OPERACIONES EN LOTES (más rápido)
        
        // Insertar todas las ventas de una vez
        if (salesData.length > 0) {
            const { error: salesError } = await supabase
                .from('sales')
                .insert(salesData);
            if (salesError) throw salesError;
        }

        // Insertar todos los movimientos de una vez
        if (movementsData.length > 0) {
            const { error: movementsError } = await supabase
                .from('movements')
                .insert(movementsData);
            if (movementsError) throw movementsError;
        }

        // Actualizar stock (una operación por producto)
        const stockPromises = Array.from(stockUpdates.entries()).map(async ([ingredientName, totalUsed]) => {
            const currentQuantity = stock[ingredientName].quantity;
            const newQuantity = currentQuantity - totalUsed;

            const { error } = await supabase
                .from('stock')
                .update({ quantity: newQuantity })
                .eq('name', ingredientName);

            if (error) throw error;

            // Actualizar variable local
            stock[ingredientName].quantity = newQuantity;
            
            return { ingredientName, oldQty: currentQuantity, newQty: newQuantity };
        });

        // Esperar todas las actualizaciones de stock
        await Promise.all(stockPromises);

        // 4️⃣ FEEDBACK Y CLEANUP
        const totalItems = Object.values(selectedSales).reduce((a, b) => a + b, 0);
        const totalProducts = Object.keys(selectedSales).length;

        // Limpiar carrito
        selectedSales = {};
        
        // Actualizar UI
        updateSalesButtons();
        updateStockDisplay();
        updateReports();
        updateMySales();
        updateFloatingCart();
        
        // Cerrar modal inmediatamente
        if (floatingCart) {
            floatingCart.style.display = 'none';
        }

        // Mostrar confirmación
        showAlert('success', `✅ Venta registrada: ${totalProducts} productos, ${totalItems} ítems`);
        
        console.log("✅ Venta confirmada y registrada en Supabase");

    } catch (e) {
        console.error('❌ Error al confirmar venta:', e);
        showAlert('danger', `❌ Error: ${e.message}`);
        
    } finally {
        // 🔄 RESTAURAR BOTÓN
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.innerHTML = originalText;
            confirmButton.style.opacity = '1';
        }
    }
}

// === Función auxiliar para mostrar progreso (opcional) ===
function updateConfirmButtonProgress(step, total) {
    const confirmButton = document.getElementById('confirmFloatingSale');
    if (confirmButton) {
        const percentage = Math.round((step / total) * 100);
        confirmButton.innerHTML = `🔄 ${percentage}%`;
    }
}

// === Actualizar reportes ===
function updateReports() {
    const today = new Date();
    const allTodaySales = sales.filter(s => {
        // ✅ Las fechas vienen desde Supabase como: "2025-04-05 10:30:22.123"
        const [datePart, timePart] = s.date.split(' '); // Separa fecha y hora
        const [year, month, day] = datePart.split('-'); // ✅ Ahora usamos guiones, no barras

        // Crear objeto Date válido
        const saleDate = new Date(`${year}-${month}-${day}T${timePart}`);

        // Comparar solo día, mes, año
        return (
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
        );
    });

    const adminSales = allTodaySales.filter(s => s.users.username  === 'Administrador');
    const userSales = allTodaySales.filter(s => s.users.username   === 'Empleado');
    const container = document.getElementById('todaySales');
    if (!container) return;

    // ✅ Estilo mejorado con clases CSS
    let html = '<div class="sales-report-container">';

    // ✅ Tabla de ventas del administrador
    if (adminSales.length > 0) {
        const totalAdmin = adminSales.reduce((sum, s) => sum + s.price, 0);
        html += `
            <div class="report-section">
                <h3 class="section-title"><span class="icon">💼</span> Ventas del Administrador</h3>
                <div class="table-wrapper">
                    <table class="sales-table">
                        <thead>
                            <tr>
                                <th><span class="icon">🍔</span> Producto</th>
                                <th><span class="icon">💰</span> Precio</th>
                                <th><span class="icon">⏱️</span> Hora</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        adminSales.forEach(s => {
            const time = s.date.split(' ')[1];
            html += `<tr><td>${s.product}</td><td>$${s.price}</td><td>${time}</td></tr>`;
        });
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="total-row"><strong>Total: $${totalAdmin}</strong></div>
            </div>
        `;
    }

    // ✅ Tabla de ventas del empleado
    if (userSales.length > 0) {
        const totalUser = userSales.reduce((sum, s) => sum + s.price, 0);
        html += `
            <div class="report-section">
                <h3 class="section-title"><span class="icon">👷</span> Ventas del Empleado</h3>
                <div class="table-wrapper">
                    <table class="sales-table">
                        <thead>
                            <tr>
                                <th><span class="icon">🍔</span> Producto</th>
                                <th><span class="icon">💰</span> Precio</th>
                                <th><span class="icon">⏱️</span> Hora</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        userSales.forEach(s => {
            const time = s.date.split(' ')[1];
            html += `<tr><td>${s.product}</td><td>$${s.price}</td><td>${time}</td></tr>`;
        });
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="total-row"><strong>Total: $${totalUser}</strong></div>
            </div>
        `;
    }

    // ✅ Total general
    const totalGeneral = allTodaySales.reduce((sum, s) => sum + s.price, 0);
    if (allTodaySales.length === 0) {
        html += '<p class="no-sales">No hay ventas hoy 📊</p>';
    } else {
        html += `<p class="total-general"><strong>💵 Total General: $${totalGeneral}</strong></p>`;
    }

    html += '</div>';
    container.innerHTML = html;

// Historial de movimientos con paginación
const historyContainer = document.getElementById('movementHistory');
if (historyContainer) {
    const totalMovements = movements.length;
    if (totalMovements === 0) {
        historyContainer.innerHTML = '<p>No hay movimientos 📋</p>';
    } else {
        let histHtml = '<div class="movement-scroll"><table><tr><th>📅 Fecha</th><th>📊 Tipo</th><th>🥪 Producto</th><th>🔢 Cantidad</th><th>💰 Precio Unit.</th><th>📝 Descripción</th></tr>';
        movements.slice().reverse().forEach(mov => {
            const escapedProduct = escapeHtml(mov.product);
            const escapedDesc = escapeHtml(mov.description);
            const color = mov.type === 'Entrada' ? '#27ae60' : '#e74c3c';
            const productPrice = stock[mov.product]?.pricePerUnit || 0;
            histHtml += `
                <tr>
                    <td style="font-size:0.9em;">${mov.date}</td>
                    <td style="color:${color};font-weight:bold;">${mov.type === 'Entrada' ? '⬆️' : '⬇️'} ${mov.type}</td>
                    <td>${escapedProduct}</td>
                    <td>${mov.quantity}</td>
                    <td class="price-cell">$${productPrice.toFixed(2)}</td>
                    <td style="font-size:0.9em;">${escapedDesc}</td>
                </tr>
            `;
        });
        histHtml += '</table></div>';
        historyContainer.innerHTML = histHtml;
    }
}
}

// === Mostrar alertas ===
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const content = document.querySelector('.content');
    if (content) {
        content.insertBefore(alert, content.firstChild);
        setTimeout(() => alert.remove(), 4000);
    }
}

// === Cargar datos de ejemplo ===
async function loadSampleData() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    if (typeof sampleData === 'undefined') {
        showAlert('danger', '❌ No se encontraron los datos de ejemplo. Verifica que sample-data.js esté cargado.');
        return;
    }

    if (Object.keys(stock).length > 0 || Object.keys(recipes).length > 0) {
        if (!confirm('¿Sobrescribir datos actuales?')) return;
    }

    console.log("🍔 Cargando datos de ejemplo...");

    try {
        // Limpiar tablas
        console.log("🧹 Limpiando tablas...");
        await supabase.from('movements').delete().not('id', 'is', null).throwOnError();
        await supabase.from('sales').delete().not('id', 'is', null).throwOnError();
        await supabase.from('recipes').delete().not('id', 'is', null).throwOnError();
        await supabase.from('stock').delete().not('id', 'is', null).throwOnError();

        // Insertar stock
        console.log("📦 Insertando stock...");
        const stockEntries = Object.entries(sampleData.stock).map(([name, data]) => ({
            name: name.trim(),
            quantity: data.quantity,
            unit: data.unit,
            price_per_unit: data.pricePerUnit || null
        }));
        const { error: stockError } = await supabase.from('stock').insert(stockEntries).throwOnError();
        if (stockError) throw stockError;
        console.log(`✅ Insertados ${stockEntries.length} productos en stock`);

        // Insertar recetas
        console.log("🍽️ Insertando recetas...");
        const recipeEntries = Object.entries(sampleData.recipes).map(([name, data]) => ({
            name: name.trim(),
            ingredients: data.ingredients,
            price: data.price
        }));
        const { error: recipeError } = await supabase.from('recipes').insert(recipeEntries).throwOnError();
        if (recipeError) throw recipeError;
        console.log(`✅ Insertadas ${recipeEntries.length} recetas`);

        // Pequeño retraso
        await new Promise(resolve => setTimeout(resolve, 100));

        // Recargar datos
        console.log("🔄 Recargando datos desde Supabase...");
        await loadDataFromSupabase();

        // Verificar
        console.log("📊 Stock local después de recargar:", Object.keys(stock).length, "productos");
        console.log("📊 Recetas locales después de recargar:", Object.keys(recipes).length, "recetas");

        if (Object.keys(stock).length === 0) {
            showAlert('warning', '⚠️ Los datos se insertaron, pero no se cargaron. Intenta recargar la página.');
            console.warn("⚠️ Stock sigue vacío después de loadDataFromSupabase");
        } else {
            showAlert('success', '🍔 ¡Datos de ejemplo cargados!');
            updateStockDisplay();
            updateRecipesDisplay();
            updateSalesButtons();
            updateProductSuggestions();
            console.log("✅ Datos de ejemplo cargados correctamente en la UI");
        }
    } catch (e) {
        console.error('❌ Error al cargar datos de ejemplo:', e);
        showAlert('danger', '❌ Error al cargar datos de ejemplo: ' + (e.message || 'Error desconocido'));
    }
}

// === Limpiar todos los datos ===
async function clearAllData() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }

    try {
        await supabase.from('movements').delete().not('id', 'is', null).throwOnError();
        await supabase.from('sales').delete().not('id', 'is', null).throwOnError();
        await supabase.from('recipes').delete().not('id', 'is', null).throwOnError();
        await supabase.from('stock').delete().not('id', 'is', null).throwOnError();

        stock = {};
        recipes = {};
        sales = [];
        movements = [];

        updateStockDisplay();
        updateRecipesDisplay();
        updateSalesButtons();
        updateReports();
        showAlert('warning', '🗑️ Todos los datos eliminados');
        console.log("✅ Todos los datos limpiados");
    } catch (e) {
        console.error('❌ Error al limpiar datos:', e);
        alert('Error al limpiar datos. Verifica conexión.');
    }
}

function confirmClearAllData() {
    if (confirm('¿Eliminar TODOS los datos? Esta acción NO se puede deshacer.')) {
        clearAllData();
    }
}

// === Exportar a Excel ===
function exportToExcel() {
    if (movements.length === 0) {
        alert('No hay movimientos para exportar.');
        return;
    }

    const wb = XLSX.utils.book_new();

    const stockData = [["Producto", "Cantidad", "Unidad", "Precio Unitario"]];
    for (let [name, data] of Object.entries(stock)) {
        stockData.push([name, data.quantity, data.unit, data.pricePerUnit || 0]);
    }
    const wsStock = XLSX.utils.aoa_to_sheet(stockData);
    XLSX.utils.book_append_sheet(wb, wsStock, "Stock");

    const recipesData = [["Receta", "Precio", "Ingredientes"]];
    for (let [name, recipe] of Object.entries(recipes)) {
        const ingredients = Object.entries(recipe.ingredients).map(([ing, qty]) => `${qty} ${ing}`).join(", ");
        recipesData.push([name, recipe.price, ingredients]);
    }
    const wsRecipes = XLSX.utils.aoa_to_sheet(recipesData);
    XLSX.utils.book_append_sheet(wb, wsRecipes, "Recetas");

    const today = new Date();
    const todaySales = sales.filter(s => {
        const [datePart] = s.date.split(' ');
        const [day, month, year] = datePart.split('/');
        const saleDate = new Date(`${year.length === 2 ? '20' + year : year}-${month}-${day}`);
        return (
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
        );
    });
    const salesData = [["Fecha", "Hora", "Producto", "Precio", "Usuario"]];
    todaySales.forEach(s => {
        const [date, time] = s.date.split(' ');
        salesData.push([date, time, s.product, s.price, s.user]);
    });
    const wsSales = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, "Ventas Hoy");

    const historyData = [["Fecha", "Tipo", "Producto", "Cantidad", "Descripción"]];
    movements.slice(-100).forEach(mov => {
        historyData.push([mov.date, mov.type, mov.product, mov.quantity, mov.description]);
    });
    const wsHistory = XLSX.utils.aoa_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, wsHistory, "Movimientos");

    const fileName = `Danny's_Burger_Reporte_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showAlert('success', '✅ Excel exportado correctamente');
}

// === Exportar a PDF ===
function exportToPDF() {
    if (movements.length === 0) {
        alert('No hay movimientos para exportar.');
        return;
    }

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
        showAlert('danger', '❌ No se pudo abrir el PDF. Desactiva el bloqueador de pop-ups.');
        return;
    }

    const exportedAt = new Date().toLocaleString('es-AR');

    const pdfContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte - Danny's Burger</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 50px; background: white; color: #2c3e50; }
                .header { text-align: center; margin-bottom: 40px; }
                .burger-icon { font-size: 2.5em; color: #f4d03f; display: block; }
                h1 { color: #1a1a1a; margin: 10px 0; }
                h2 { color: #6c757d; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f4d03f; color: #1a1a1a; font-weight: bold; }
                tr:hover { background: #f9f9f9; }
                .footer { text-align: center; margin-top: 50px; color: #999; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="burger-icon">🍔</div>
                <h1>Danny's Burger</h1>
                <h2>Reporte de Movimientos • 2024</h2>
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
                    ${movements.slice(-50).map(mov => `
                        <tr>
                            <td>${mov.date}</td>
                            <td style="color:${mov.type === 'Entrada' ? '#27ae60' : '#e74c3c'}; font-weight:bold;">
                                ${mov.type === 'Entrada' ? '⬆️' : '⬇️'} ${mov.type}
                            </td>
                            <td>${mov.product}</td>
                            <td>${mov.quantity}</td>
                            <td>${mov.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">🍔 Danny's Burger - Sistema de Gestión de Stock</div>
            <script>
                window.onload = function() {
                    html2pdf().from(document.body).save();
                };
            <\/script>
        </body>
        </html>
    `;

    pdfWindow.document.write(pdfContent);
    pdfWindow.document.close();
}

// === Actualizar mis ventas ===
function updateMySales() {
    const container = document.getElementById('liveSalesList');
    if (!container) return;

    const userName = sessionStorage.getItem('userName') || 'Desconocido';
    const today = new Date();
    const myTodaySales = sales.filter(s => {
        // s.date: 'YYYY-MM-DD HH:MM:SS'
        if (!s.date) return false;
        const [datePart, timePart] = s.date.split(' ');
        const [year, month, day] = datePart.split('-');
        const saleDate = new Date(`${year}-${month}-${day}T${timePart}`);
        return s.users && s.users.username === userName &&
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear();
    });

    if (myTodaySales.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#ccc;">¡Aún no has registrado ventas hoy!<br>¡Vamos, que el día es largo! 💪🍔</p>';
        return;
    }

    let total = myTodaySales.reduce((sum, s) => sum + s.price, 0);
    let html = '<table style="width:100%; border-collapse: collapse; margin: 10px 0;"><tr>';
    html += '<th style="text-align:left; padding:8px; border-bottom:1px solid #333;">🍔 Producto</th>';
    html += '<th style="text-align:right; padding:8px; border-bottom:1px solid #333;">💰 Precio</th>';
    html += '<th style="text-align:right; padding:8px; border-bottom:1px solid #333;">🕒 Hora</th></tr>';

    myTodaySales.forEach(s => {
        const time = s.date.split(' ')[1];
        html += `<tr>
            <td style="padding:8px; border-bottom:1px solid #333;">${s.product}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #333;">$${s.price}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #333;">${time}</td>
        </tr>`;
    });

    html += `</table>
    <p style="text-align:center; margin-top:15px; font-size:1.2em; color:#f4d03f;">
        <strong>Total: $${total}</strong>
    </p>`;

    container.innerHTML = html;
}

// === Partículas animadas ===
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

    for (let i = 0; i < count; i++) setTimeout(create, i * 1000);
    setInterval(() => {
        document.querySelectorAll('#particles .particle').forEach(p => p.remove());
        for (let i = 0; i < count; i++) setTimeout(create, i * 500);
    }, 30000);
}