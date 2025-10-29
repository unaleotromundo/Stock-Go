// === Exportar ventas a Excel ===
function exportSalesToExcel() {
    if (!sales || sales.length === 0) {
        alert('No hay ventas para exportar.');
        return;
    }
    const columns = [
        { key: 'fecha', label: '📅 Fecha', get: s => s.date },
        { key: 'producto', label: '🍔 Producto', get: s => s.product },
        { key: 'precio', label: '💰 Precio', get: s => s.price },
        { key: 'metodo_pago', label: '💳 Método', get: s => s.payment_method || '—' },
        { key: 'usuario', label: '🧑‍💼 Vendido por', get: s => s.users?.username || s.user || '—' }
    ];
    const headers = columns.map(col => col.label);
    const data = sales.map(s => columns.map(col => col.get(s)));
    const wb = XLSX.utils.book_new();
    const aoa = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    columns.forEach((col, idx) => {
        const cell = XLSX.utils.encode_cell({ r:0, c:idx });
        if (!ws[cell]) return;
        ws[cell].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
            fill: { fgColor: { rgb: 'F4D03F' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: "thin", color: { rgb: "B7950B" } }, bottom: { style: "thin", color: { rgb: "B7950B" } } }
        };
    });
    for (let r = 1; r < aoa.length; r++) {
        for (let c = 0; c < columns.length; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (!ws[cell]) continue;
            ws[cell].s = ws[cell].s || {};
            ws[cell].s.fill = { fgColor: { rgb: r % 2 === 0 ? 'F9E79F' : 'FFFFFF' } };
            ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
        }
    }
    ws['!cols'] = columns.map(col => {
        if (col.key === 'fecha') return { wpx: 120 };
        if (col.key === 'producto') return { wpx: 130 };
        if (col.key === 'usuario') return { wpx: 140 };
        return { wch: Math.max(12, col.label.length + 4) };
    });
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r:0, c:0 }, e: { r:aoa.length-1, c:columns.length-1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    const fileName = `Danny's_Burger_Ventas_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showAlert('success', '✅ Ventas exportadas correctamente');
}
// === Exportar stock a Excel ===
function exportStockToExcel() {
    if (!stock || Object.keys(stock).length === 0) {
        alert('No hay stock para exportar.');
        return;
    }
    const columns = [
        { key: 'producto', label: '🥪 Producto', get: (item, name) => name },
        { key: 'cantidad', label: '🔢 Cantidad', get: (item) => item.quantity },
        { key: 'unidad', label: '📏 Unidad', get: (item) => item.unit },
        { key: 'precio', label: '💰 Precio Unit.', get: (item) => item.pricePerUnit !== undefined ? item.pricePerUnit : '—' },
        { key: 'total', label: '💵 Total', get: (item) => item.pricePerUnit !== undefined ? item.pricePerUnit * item.quantity : '—' }
    ];
    const headers = columns.map(col => col.label);
    const data = Object.entries(stock).map(([name, item]) => columns.map(col => col.get(item, name)));
    const wb = XLSX.utils.book_new();
    const aoa = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    columns.forEach((col, idx) => {
        const cell = XLSX.utils.encode_cell({ r:0, c:idx });
        if (!ws[cell]) return;
        ws[cell].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
            fill: { fgColor: { rgb: 'F4D03F' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: "thin", color: { rgb: "B7950B" } }, bottom: { style: "thin", color: { rgb: "B7950B" } } }
        };
    });
    for (let r = 1; r < aoa.length; r++) {
        for (let c = 0; c < columns.length; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (!ws[cell]) continue;
            ws[cell].s = ws[cell].s || {};
            ws[cell].s.fill = { fgColor: { rgb: r % 2 === 0 ? 'F9E79F' : 'FFFFFF' } };
            ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
        }
    }
    ws['!cols'] = columns.map(col => {
        if (col.key === 'producto') return { wpx: 170 };
        return { wch: Math.max(12, col.label.length + 4) };
    });
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r:0, c:0 }, e: { r:aoa.length-1, c:columns.length-1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    const fileName = `Danny's_Burger_Stock_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showAlert('success', '✅ Stock exportado correctamente');
}
// Selección rápida de rango de días para exportar
// Slider para rango de días
function actualizarLabelFiltroDias() {
    const slider = document.getElementById('sliderFiltroDias');
    const label = document.getElementById('labelFiltroDias');
    const hidden = document.getElementById('filtroDias');
    let dias = '';
    switch (slider.value) {
        case '0': dias = 15; label.textContent = '15 días'; break;
        case '1': dias = 30; label.textContent = '30 días'; break;
        case '2': dias = 45; label.textContent = '45 días'; break;
        case '3': dias = 60; label.textContent = '60 días'; break;
        case '4': dias = ''; label.textContent = 'Todos'; break;
    }
    hidden.value = dias;
}
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
let modifiedUnitPrices = {};
let selectedPaymentMethod = null;
let salesChart = null; // ← Para la gráfica integrada
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
            modifiedUnitPrices = {};
            floatingCart.style.display = 'none';
        };
    }
    if (confirmFloatingSale) {
        confirmFloatingSale.onclick = confirmSelectedSales;
    }
    // Eventos del modal de edición de producto
    const closeEditProductModalBtn = document.querySelector('#editProductModal .close-modal');
    if (closeEditProductModalBtn) {
        closeEditProductModalBtn.onclick = closeEditProductModal;
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
            if (floatingCart) {
                modifiedUnitPrices = {};
                floatingCart.style.display = 'none';
            }
        }
    });
    updateFloatingCart();
    // Cerrar sesión
    document.getElementById('logoutButton')?.addEventListener('click', () => {
        const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?\nSerás redirigido a la página principal.');
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
                    id: item.id,
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
                    id: recipe.id,
                    ingredients: recipe.ingredients,
                    price: recipe.price,
                    icon: recipe.icon || '🍔'
                };
            });
        }
        console.log("✅ Recetas cargadas:", recipesData ? recipesData.length : 0, "recetas");
        console.log("💰 Cargando ventas...");
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*, users(username)')
            .eq('eliminado', false); // ← SOLO VENTAS NO ELIMINADAS
        if (salesError) throw salesError;
        sales = [];
        if (salesData) {
            sales = salesData.map(s => {
                const createdAt = new Date(s.created_at);
                const year = createdAt.getFullYear();
                const month = String(createdAt.getMonth() + 1).padStart(2, '0');
                const day = String(createdAt.getDate()).padStart(2, '0');
                const hours = String(createdAt.getHours()).padStart(2, '0');
                const minutes = String(createdAt.getMinutes()).padStart(2, '0');
                const seconds = String(createdAt.getSeconds()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return {
                    id: s.id,
                    date: formattedDate,
                    product: s.product_name,
                    price: s.price,
                    user: s.user_id,
                    payment_method: s.payment_method,
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
            .throwOnError();
        if (movementsError) throw movementsError;
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
    const currentBg = window.getComputedStyle(body).backgroundColor;
    // Detectar si actualmente es oscuro (por color de fondo)
    const isDark = currentBg === 'rgb(18, 18, 18)' || currentBg.includes('#121212') || currentBg === 'black';
    if (isDark) {
        body.style.backgroundColor = '#ffffff'; // Modo claro: blanco
    } else {
        body.style.backgroundColor = '#121212'; // Modo oscuro: negro
    }
    // Opcional: guardar preferencia si quieres que persista
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('simpleTheme', newTheme);
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
        case 'reports':
            loadDataFromSupabase().then(() => updateReports());
            break;
        case 'mySales':
            loadDataFromSupabase().then(() => updateMySales());
            break;
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
                <td class="actions">
                    <button class="edit-btn" data-action="edit-product" data-name="${escapedName}" title="Editar producto">✏️</button>
                    ${isUserAdmin ? `<button class="delete-btn" data-action="delete-product" data-name="${escapedName}" title="Eliminar producto">🗑️</button>` : ''}
                </td>
            </tr>`;
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
async function saveEditedProduct() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }
    const name = document.getElementById('editProductName').value.trim();
    const newQuantity = parseInt(document.getElementById('editProductQuantity').value);
    const unit = document.getElementById('editProductUnit').value;
    const pricePerUnit = parseFloat(document.getElementById('editProductPricePerUnit').value) || 0;
    if (!name || isNaN(newQuantity) || newQuantity < 0) {
        alert('Completa todos los campos correctamente');
        return;
    }
    const userRole = sessionStorage.getItem('userRole');
    const isUserAdmin = userRole === 'admin';
    const currentProduct = stock[name];
    if (!currentProduct) {
        alert('Error: Producto no encontrado.');
        return;
    }
    const currentQuantity = currentProduct.quantity;
    if (!isUserAdmin && newQuantity < currentQuantity) {
        showAlert('danger', '❌ Permiso denegado: No puedes reducir el stock. Solo los administradores pueden hacerlo.');
        alert('Permiso denegado: No puedes reducir el stock. Solo los administradores pueden hacerlo.');
        console.warn(`⚠️ El usuario "${sessionStorage.getItem('userName') || 'Desconocido'}" intentó reducir el stock de "${name}" de ${currentQuantity} a ${newQuantity}`);
        return;
    }
    console.log("💾 Guardando producto editado:", { name, newQuantity, unit, pricePerUnit });
    try {
        let productId = null;
        const { data: existingProduct, error: fetchError } = await supabase
            .from('stock')
            .select('id')
            .eq('name', name)
            .limit(1)
            .single();
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        if (existingProduct) {
            productId = existingProduct.id;
        }
        const upsertData = {
            name: name,
            quantity: newQuantity,
            unit: unit,
            price_per_unit: pricePerUnit > 0 ? pricePerUnit : null
        };
        if (productId !== null) {
            upsertData.id = productId;
        }
        const { error } = await supabase
            .from('stock')
            .upsert(upsertData, { onConflict: 'id' });
        if (error) throw error;
        const difference = newQuantity - currentQuantity;
        if (difference !== 0) {
            try {
                const movementType = difference > 0 ? 'Entrada' : 'Salida';
                const userName = sessionStorage.getItem('userName') || 'Desconocido';
                const movementDescription = difference > 0 ? `Ajuste de stock (aumento) por ${userName}`: `Ajuste de stock (reducción) por ${userName}`;
                const { error: movementError } = await supabase
                    .from('movements')
                    .insert({
                        type: movementType,
                        product_name: name,
                        quantity: Math.abs(difference),
                        description: movementDescription,
                        created_at: new Date().toISOString()
                    });
                if (movementError) throw movementError;
                console.log(`✅ Movimiento de ${movementType} registrado`);
            } catch (e) {
                console.error(`❌ Error al registrar movimiento:`, e);
                showAlert('warning', `⚠️ Producto actualizado, pero no se registró el movimiento.`);
            }
        }
        let finalId = productId;
        if (productId === null) {
            const { data: newProduct, error: fetchNewError } = await supabase
                .from('stock')
                .select('id')
                .eq('name', name)
                .limit(1)
                .single();
            if (fetchNewError) throw fetchNewError;
            if (newProduct) {
                finalId = newProduct.id;
            }
        }
        stock[name] = { 
            id: finalId,
            quantity: newQuantity,
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
    const pricePerUnit = parseFloat(document.getElementById('productPricePerUnitModal').value) || 0;
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
        const cleanName = String(name).trim();
        const { data: currentStock, error: stockError } = await supabase
            .from('stock')
            .select('quantity')
            .eq('name', cleanName)
            .single();
        if (stockError && stockError.code !== 'PGRST116') {
            throw stockError;
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
        try {
            const { error: movementError } = await supabase
                .from('movements')
                .insert({
                    type: 'Entrada',
                    product_name: cleanName,
                    quantity: quantity,
                    description: 'Ingreso de stock',
                    created_at: new Date().toISOString()
                });
            if (movementError) throw movementError;
            console.log('✅ Movimiento de Entrada registrado');
        } catch (e) {
            console.error('❌ Error al registrar movimiento de Entrada:', e);
        }
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
            <div class="burger-icon">${recipe.icon || '🍔'}</div>
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
    // ✅ Seleccionar el ícono guardado
    const iconInputs = document.querySelectorAll('input[name="recipeIcon"]');
    iconInputs.forEach(input => {
        input.checked = (input.value === (recipe.icon || '🍔'));
    });
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
    const icon = document.querySelector('input[name="recipeIcon"]:checked')?.value || '🍔';
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
        let recipeId = null;
        if (currentEditingRecipe) {
            const { data: existingRecipe, error: fetchError } = await supabase
                .from('recipes')
                .select('id')
                .eq('name', currentEditingRecipe)
                .single();
            if (fetchError) throw fetchError;
            recipeId = existingRecipe.id;
        }
        const upsertData = {
            name: name,
            ingredients: ingredients,
            price: price,
            icon: icon
        };
        if (recipeId !== null) {
            upsertData.id = recipeId;
        }
        const { data: savedRecipe, error } = await supabase
            .from('recipes')
            .upsert(upsertData, { onConflict: 'id' })
            .select()
            .single()
            .throwOnError();
        if (error) throw error;
        recipes[name] = { 
            id: savedRecipe.id,
            ingredients, 
            price,
            icon
        };
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
                    ${recipe.icon || '🍔'}<br><strong>$${recipe.price}</strong><br>
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
            button.innerHTML = `
                <div class="button-content">
                    ❌<br><strong>$${recipe.price}</strong><br>
                    <span class="combo-name">${escapeHtml(name)}</span>
                    <small style="color:#e74c3c;display:block;">Sin stock</small>
                </div>
            `;
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
        const originalUnitPrice = recipes[name].price;
        const unitPrice = modifiedUnitPrices[name] !== undefined ? modifiedUnitPrices[name] : originalUnitPrice;
        const itemTotal = unitPrice * qty;
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
            <input type="text" 
                   class="cart-price-input" 
                   value="${itemTotal.toFixed(2)}" 
                   inputmode="decimal"
                   pattern="[0-9]*\.?[0-9]*"
                   data-name="${escapeHtml(name)}"
                   data-qty="${qty}"
                   style="width: 70px; text-align: right; background: transparent; color: var(--accent-gold); border: none; font-weight: bold; font-size: 1em; padding: 0; margin: 0 8px;">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                    data-action="remove-one" data-name="${escapeHtml(name)}">➖</button>
        `;
        floatingCartItems.appendChild(item);
    });
    floatingTotal.textContent = `$${total.toFixed(2)}`;
    floatingCart.style.display = 'flex';
    // Listener para actualizar precios
    document.querySelectorAll('.cart-price-input').forEach(input => {
        input.addEventListener('input', function() {
            let raw = this.value;
            raw = raw.replace(/[^0-9.,]/g, '');
            let dotSeen = false;
            let cleaned = '';
            for (let char of raw) {
                if (char === ',' || char === '.') {
                    if (!dotSeen) {
                        cleaned += '.';
                        dotSeen = true;
                    }
                } else {
                    cleaned += char;
                }
            }
            let val = parseFloat(cleaned);
            if (isNaN(val) || val < 0) val = 0;
            this.value = cleaned || '0';
            const name = this.dataset.name;
            const qty = parseInt(this.dataset.qty) || 1;
            const newUnitPrice = qty > 0 ? val / qty : 0;
            modifiedUnitPrices[name] = newUnitPrice;
            let newTotal = 0;
            document.querySelectorAll('.cart-price-input').forEach(inp => {
                let v = parseFloat(inp.value.replace(/[^0-9.]/g, '')) || 0;
                newTotal += v;
            });
            floatingTotal.textContent = `$${newTotal.toFixed(2)}`;
        });
    });
}
// === Quitar uno del carrito ===
function removeOneFromSelection(name) {
    if (selectedSales[name] > 1) {
        selectedSales[name]--;
    } else {
        delete selectedSales[name];
        delete modifiedUnitPrices[name];
    }
    updateSalesButtons();
    updateFloatingCart();
}
// === Confirmar venta con modal de método de pago ===
async function confirmSelectedSales() {
    if (!supabase) {
        alert('Error: Supabase no está disponible.');
        return;
    }
    if (Object.keys(selectedSales).length === 0) {
        showAlert('warning', '⚠️ El carrito está vacío');
        return;
    }
    // Mostrar el modal de método de pago
    const modal = document.getElementById('paymentMethodModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Si no existe el modal, proceder sin método (fallback)
        await proceedWithSale();
    }
}
// === Proceder con la venta después de seleccionar método de pago ===
async function proceedWithSale() {
    // ✅ Cerrar el modal inmediatamente al hacer clic en un botón
    closePaymentMethodModal();
    if (!selectedPaymentMethod) {
        showAlert('warning', '⚠️ Selecciona un método de pago');
        return;
    }
    const confirmButton = document.getElementById('confirmFloatingSale');
    const originalText = confirmButton.textContent;
    confirmButton.disabled = true;
    confirmButton.innerHTML = '🔄 Procesando...';
    confirmButton.style.opacity = '0.6';
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName') || 'Desconocido';
    try {
        const salesData = [];
        const movementsData = [];
        const stockUpdates = new Map();
        for (const [recipeName, qty] of Object.entries(selectedSales)) {
            const recipe = recipes[recipeName];
            if (!recipe) {
                throw new Error(`Receta "${recipeName}" no encontrada`);
            }
            const unitPrice = modifiedUnitPrices[recipeName] !== undefined 
                ? modifiedUnitPrices[recipeName] 
                : recipe.price;
            for (let i = 0; i < qty; i++) {
                salesData.push({
                    product_name: recipeName,
                    price: unitPrice,
                    user_id: userId,
                    payment_method: selectedPaymentMethod,
                    created_at: new Date().toISOString()
                });
            }
            for (const [ingredientName, neededPerUnit] of Object.entries(recipe.ingredients)) {
                const currentReduction = stockUpdates.get(ingredientName) || 0;
                stockUpdates.set(ingredientName, currentReduction + neededPerUnit);
                movementsData.push({
                    type: 'Salida',
                    product_name: ingredientName,
                    quantity: neededPerUnit,
                    description: `Venta: ${recipeName} (por ${userName})`,
                    created_at: new Date().toISOString()
                });
            }
        }
        console.log('📋 Operaciones preparadas:', {
            ventas: salesData.length,
            movimientos: movementsData.length,
            productos_a_actualizar: stockUpdates.size,
            metodo_pago: selectedPaymentMethod
        });
        for (const [ingredientName, totalNeeded] of stockUpdates) {
            if (!stock[ingredientName] || stock[ingredientName].quantity < totalNeeded) {
                throw new Error(`Stock insuficiente para "${ingredientName}". Disponible: ${stock[ingredientName]?.quantity || 0}, Necesario: ${totalNeeded}`);
            }
        }
        if (salesData.length > 0) {
            const { error: salesError } = await supabase.from('sales').insert(salesData);
            if (salesError) throw salesError;
        }
        if (movementsData.length > 0) {
            const { error: movementsError } = await supabase.from('movements').insert(movementsData);
            if (movementsError) throw movementsError;
        }
        const stockPromises = Array.from(stockUpdates.entries()).map(async ([ingredientName, totalUsed]) => {
            const currentQuantity = stock[ingredientName].quantity;
            const newQuantity = currentQuantity - totalUsed;
            const { error } = await supabase.from('stock').update({ quantity: newQuantity }).eq('name', ingredientName);
            if (error) throw error;
            stock[ingredientName].quantity = newQuantity;
        });
        await Promise.all(stockPromises);
        const totalItems = Object.values(selectedSales).reduce((a, b) => a + b, 0);
        const totalProducts = Object.keys(selectedSales).length;
        selectedSales = {};
        modifiedUnitPrices = {};
        updateSalesButtons();
        updateStockDisplay();
        updateReports(); // ← Esto ahora también actualiza la gráfica
        updateMySales();
        updateFloatingCart();
        if (floatingCart) floatingCart.style.display = 'none';
        showAlert('success', `✅ Venta registrada: ${totalProducts} productos, ${totalItems} ítems`);
        console.log("✅ Venta confirmada con método:", selectedPaymentMethod);
    } catch (e) {
        console.error('❌ Error al confirmar venta:', e);
        showAlert('danger', `❌ Error: ${e.message}`);
    } finally {
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.innerHTML = originalText;
            confirmButton.style.opacity = '1';
        }
        selectedPaymentMethod = null;
    }
}
// === Cerrar modal de método de pago ===
function closePaymentMethodModal() {
    document.getElementById('paymentMethodModal').style.display = 'none';
}
// === SOLUCIÓN: Event listeners para los botones de método de pago ===
const paymentModal = document.getElementById('paymentMethodModal');
if (paymentModal) {
    paymentModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('payment-option')) {
            selectedPaymentMethod = e.target.dataset.method;
            console.log('✅ Método seleccionado:', selectedPaymentMethod);
            proceedWithSale();
        }
        if (e.target.classList.contains('close-modal') || 
            e.target.onclick?.toString().includes('closePaymentMethodModal')) {
            closePaymentMethodModal();
        }
    });
}
// === FUNCIÓN NUEVA: marcar venta como eliminada ===
async function markSaleAsDeleted(saleId) {
    if (!supabase) {
        showAlert('danger', '❌ Supabase no está disponible.');
        return;
    }
    if (!confirm('¿Eliminar esta venta? Se marcará como eliminada y no aparecerá en los reportes.')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('sales')
            .update({ eliminado: true })
            .eq('id', saleId);
        if (error) throw error;
        await loadDataFromSupabase();
        updateReports();
        updateMySales();
        showAlert('success', '✅ Venta marcada como eliminada');
    } catch (e) {
        console.error('❌ Error al marcar venta como eliminada:', e);
        showAlert('danger', `❌ Error: ${e.message || 'No se pudo eliminar la venta'}`);
    }
}
// =============== GRÁFICA DE VENTAS MENSUALES (INTEGRADA) ===============
async function renderSalesChartInReport() {
    const canvas = document.getElementById('salesChartCanvas');
    if (!canvas) return;

    try {
        // Usamos la variable global `sales` que ya tiene los datos procesados
        const monthlySales = {};
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

        sales.forEach(sale => {
            // Parsear la fecha desde el formato ya existente en `sale.date`
            const [datePart] = sale.date.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const saleDate = new Date(year, month - 1, day); // mes es 0-indexado

            if (isNaN(saleDate.getTime()) || saleDate < twelveMonthsAgo) return;

            const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
            monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (parseFloat(sale.price) || 0);
        });

        const labels = [];
        const values = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = `${getMonthShortName(d.getMonth())} ${d.getFullYear().toString().slice(-2)}`;
            labels.push(monthLabel);
            values.push(monthlySales[monthKey] || 0);
        }

        if (salesChart) salesChart.destroy();

        const ctx = canvas.getContext('2d');
        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Totales ($)',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Total: $${parseFloat(context.raw).toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Monto ($)' }
                    },
                    x: {
                        title: { display: true, text: 'Mes' }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                }
            }
        });

    } catch (err) {
        console.error('Error al renderizar gráfica:', err);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#ff6b6b';
        ctx.textAlign = 'center';
        ctx.fillText('❌ Error al cargar datos', canvas.width / 2, canvas.height / 2);
    }
}

function getMonthShortName(monthIndex) {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return months[monthIndex];
}

// === Actualizar reportes ===
function updateReports() {
    const today = new Date();
    const allTodaySales = sales.filter(s => {
        const [datePart, timePart] = s.date.split(' ');
        const [year, month, day] = datePart.split('-');
        const saleDate = new Date(`${year}-${month}-${day}T${timePart}`);
        return (
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
        );
    });
    const container = document.getElementById('todaySales');
    if (!container) return;
    let html = '<div class="sales-report-container">';
    if (allTodaySales.length > 0) {
        const totalGeneral = allTodaySales.reduce((sum, s) => sum + s.price, 0);
        html += `
            <div class="report-section">
                <h3 class="section-title"><span class="icon">🛒</span> Ventas de Hoy</h3>
                <div class="table-wrapper" style="max-height:350px;overflow-y:auto;">
                    <table class="sales-header-table">
                        <thead>
                            <tr>
                                <th><span class="icon">🍔</span> Producto</th>
                                <th><span class="icon">💰</span> Precio</th>
                                <th><span class="icon">💳</span> Método</th>
                                <th><span class="icon">⏱️</span> Hora</th>
                                <th><span class="icon">🧑‍💼</span> Vendido por</th>
                                ${sessionStorage.getItem('userRole') === 'admin' ? '<th>Acciones</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
        `;
        allTodaySales.slice().reverse().forEach(s => {
            const time = s.date.split(' ')[1];
            const actionsCell = sessionStorage.getItem('userRole') === 'admin'
                ? `<td><button class="btn btn-danger btn-sm" onclick="markSaleAsDeleted('${s.id}')">🗑️</button></td>`
                : '';
            html += `
                <tr data-sale-id="${s.id}">
                    <td>${s.product}</td>
                    <td>$${s.price}</td>
                    <td>${s.payment_method || '—'}</td>
                    <td>${time}</td>
                    <td>${s.users.username || ''}</td>
                    ${actionsCell}
                </tr>`;
        });
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="total-row"><strong>💵 Total General: $${totalGeneral}</strong></div>
            </div>
        `;
    } else {
        html += '<p class="no-sales">No hay ventas hoy 📊</p>';
    }
    html += '</div>';
    container.innerHTML = html;
    const historyContainer = document.getElementById('movementHistory');
    if (historyContainer) {
        const totalMovements = movements.length;
        if (totalMovements === 0) {
            historyContainer.innerHTML = '<p>No hay movimientos 📋</p>';
        } else {
            let histHtml = '<div class="movement-scroll"><table class="movement-header-table"><thead><tr><th>📅 Fecha</th><th>📊 Tipo</th><th>🥪 Producto</th><th>🔢 Cantidad</th><th>💰 Precio Unit.</th><th>📝 Descripción</th></tr></thead><tbody>';
            movements.forEach(mov => {
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
            histHtml += '</tbody></table></div>';
            historyContainer.innerHTML = histHtml;
        }
    }

    // ✅ Renderizar la gráfica de ventas mensuales
    renderSalesChartInReport();
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
        console.log("🧹 Limpiando tablas...");
        await supabase.from('movements').delete().not('id', 'is', null).throwOnError();
        await supabase.from('sales').delete().not('id', 'is', null).throwOnError();
        await supabase.from('recipes').delete().not('id', 'is', null).throwOnError();
        await supabase.from('stock').delete().not('id', 'is', null).throwOnError();
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
        console.log("🍽️ Insertando recetas...");
        const recipeEntries = Object.entries(sampleData.recipes).map(([name, data]) => ({
            name: name.trim(),
            ingredients: data.ingredients,
            price: data.price
        }));
        const { error: recipeError } = await supabase.from('recipes').insert(recipeEntries).throwOnError();
        if (recipeError) throw recipeError;
        console.log(`✅ Insertadas ${recipeEntries.length} recetas`);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("🔄 Recargando datos desde Supabase...");
        await loadDataFromSupabase();
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
// === Exportar movimientos a Excel (simple) ===
function exportMovementsToExcel() {
    if (movements.length === 0) {
        alert('No hay movimientos para exportar.');
        return;
    }
    const columns = [
        { key: 'fecha', label: '📅 Fecha', get: mov => mov.date },
        { key: 'tipo', label: '📊 Tipo', get: mov => mov.type },
        { key: 'producto', label: '🥪 Producto', get: mov => mov.product },
        { key: 'cantidad', label: '🔢 Cantidad', get: mov => mov.quantity },
        { key: 'precio', label: '💰 Precio Unit.', get: mov => stock[mov.product]?.pricePerUnit !== undefined ? Number(stock[mov.product].pricePerUnit).toFixed(0) : '—' },
        { key: 'descripcion', label: '📝 Descripción', get: mov => mov.description }
    ];
    const headers = columns.map(col => col.label);
    const data = movements.map(mov => columns.map(col => col.get(mov)));
    const wb = XLSX.utils.book_new();
    const styledData = data.map((row, i) => {
        return row.map((cell, j) => {
            if (columns[j].key === 'tipo') {
                if (cell === 'Entrada') return '⬆️ Entrada';
                if (cell === 'Salida') return '⬇️ Salida';
            }
            return cell;
        });
    });
    const aoa = [headers, ...styledData];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    columns.forEach((col, idx) => {
        const cell = XLSX.utils.encode_cell({ r:0, c:idx });
        if (!ws[cell]) return;
        ws[cell].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
            fill: { fgColor: { rgb: 'F4D03F' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: "thin", color: { rgb: "B7950B" } }, bottom: { style: "thin", color: { rgb: "B7950B" } } }
        };
    });
    for (let r = 1; r < aoa.length; r++) {
        for (let c = 0; c < columns.length; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (!ws[cell]) continue;
            ws[cell].s = ws[cell].s || {};
            if (r % 2 === 0) {
                ws[cell].s.fill = { fgColor: { rgb: 'F9E79F' } };
            } else {
                ws[cell].s.fill = { fgColor: { rgb: 'FFFFFF' } };
            }
            ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
        }
    }
    ws['!cols'] = columns.map(col => {
        if (col.key === 'fecha') return { wpx: 120 };
        if (col.key === 'producto') return { wpx: 170 };
        return { wch: Math.max(12, col.label.length + 4) };
    });
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r:0, c:0 }, e: { r:aoa.length-1, c:columns.length-1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    const fileName = `Danny's_Burger_Movimientos_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showAlert('success', '✅ Historial de movimientos exportado correctamente');
}
function closeExcelColumnsModal() {
    document.getElementById('excelColumnsModal').style.display = 'none';
}
function confirmExcelColumns() {
    const form = document.getElementById('excelColumnsForm');
    const selected = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.name);
    if (selected.length === 0) {
        alert('Selecciona al menos una columna.');
        return;
    }
    const columns = [
        { key: 'fecha', label: '📅 Fecha', get: mov => mov.date },
        { key: 'tipo', label: '📊 Tipo', get: mov => mov.type },
        { key: 'producto', label: '🥪 Producto', get: mov => mov.product },
        { key: 'cantidad', label: '🔢 Cantidad', get: mov => mov.quantity },
        { key: 'precio', label: '💰 Precio Unit.', get: mov => stock[mov.product]?.pricePerUnit !== undefined ? `$${Number(stock[mov.product].pricePerUnit).toFixed(2)}` : '—' },
        { key: 'descripcion', label: '📝 Descripción', get: mov => mov.description }
    ];
    const exportCols = columns.filter(col => selected.includes(col.key));
    const headers = exportCols.map(col => col.label);
    let movimientosFiltrados = movements;
    const filtroDias = document.getElementById('filtroDias').value;
    if (filtroDias) {
        const hoy = new Date();
        movimientosFiltrados = movements.filter(mov => {
            const fechaMov = mov.date.split(' ')[0];
            const partes = fechaMov.split('-');
            const fecha = new Date(Number(partes[0]), Number(partes[1])-1, Number(partes[2]));
            const diff = (hoy - fecha) / (1000*60*60*24);
            return diff <= filtroDias;
        });
    }
    if (movimientosFiltrados.length === 0) {
        alert('No hay movimientos para exportar en ese rango.');
        return;
    }
    const data = movimientosFiltrados.map(mov => exportCols.map(col => col.get(mov)));
    const wb = XLSX.utils.book_new();
    const styledData = data.map((row, i) => {
        return row.map((cell, j) => {
            if (exportCols[j].key === 'tipo') {
                if (cell === 'Entrada') return '⬆️ Entrada';
                if (cell === 'Salida') return '⬇️ Salida';
            }
            return cell;
        });
    });
    const aoa = [headers, ...styledData];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    exportCols.forEach((col, idx) => {
        const cell = XLSX.utils.encode_cell({ r:0, c:idx });
        if (!ws[cell]) return;
        ws[cell].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
            fill: { fgColor: { rgb: 'F4D03F' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: "thin", color: { rgb: "B7950B" } }, bottom: { style: "thin", color: { rgb: "B7950B" } } }
        };
    });
    for (let r = 1; r < aoa.length; r++) {
        for (let c = 0; c < exportCols.length; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (!ws[cell]) continue;
            ws[cell].s = ws[cell].s || {};
            if (r % 2 === 0) {
                ws[cell].s.fill = { fgColor: { rgb: 'F9E79F' } };
            } else {
                ws[cell].s.fill = { fgColor: { rgb: 'FFFFFF' } };
            }
            ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
            if (exportCols[c].key === 'tipo') {
                if (ws[cell].v && ws[cell].v.includes('Entrada')) {
                    ws[cell].s.font = { color: { rgb: '27AE60' }, bold: true };
                }
                if (ws[cell].v && ws[cell].v.includes('Salida')) {
                    ws[cell].s.font = { color: { rgb: 'E74C3C' }, bold: true };
                }
            }
        }
    }
    ws['!cols'] = exportCols.map(col => {
        if (col.key === 'fecha') return { wch: 22 };
        if (col.key === 'producto') return { wpx: 170 };
        return { wch: Math.max(12, col.label.length + 4) };
    });
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r:0, c:0 }, e: { r:aoa.length-1, c:exportCols.length-1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    const fileName = `Danny's_Burger_Movimientos_${new Date().toLocaleDateString('es-AR').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    closeExcelColumnsModal();
    showAlert('success', '✅ Excel PRO exportado correctamente');
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
                    ${movements.map(mov => `
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
        if (!s.date) return false;
        const [datePart, timePart] = s.date.split(' ');
        const [year, month, day] = datePart.split('-');
        const saleDate = new Date(`${year}-${month}-${day}T${timePart}`);
        return s.users && s.users.username === userName &&
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear();
    }).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    if (myTodaySales.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#ccc;">¡Aún no has registrado ventas hoy!<br>¡Vamos, que el día es largo! 💪🍔</p>';
        return;
    }
    let total = myTodaySales.reduce((sum, s) => sum + s.price, 0);
    let html = '<table style="width:100%; border-collapse: collapse; margin: 10px 0;"><tr>';
    html += '<th style="text-align:left; padding:8px; border-bottom:1px solid #333;">🍔 Producto</th>';
    html += '<th style="text-align:right; padding:8px; border-bottom:1px solid #333;">💰 Precio</th>';
    html += '<th style="text-align:right; padding:8px; border-bottom:1px solid #333;">💳 Método</th>';
    html += '<th style="text-align:right; padding:8px; border-bottom:1px solid #333;">🕒 Hora</th></tr>';
    myTodaySales.forEach(s => {
        const time = s.date.split(' ')[1];
        html += `<tr>
            <td style="padding:8px; border-bottom:1px solid #333;">${s.product}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #333;">$${s.price}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #333;">${s.payment_method || '—'}</td>
            <td style="text-align:right; padding:8px; border-bottom:1px solid #333;">${time}</td>
        </tr>`;
    });
    html += `</table>
    <p style="text-align:center; margin-top:15px; font-size:1.2em; color:#f4d03f;">
        <strong>Total: $${total}</strong>
    </p>`;
    container.innerHTML = html;
}
// === Partículas animadas (versión estable y eficiente) ===
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const count = window.innerWidth > 768 ? 30 : 15;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 100}vh`;
        p.style.animationDuration = `${Math.random() * 20 + 10}s`;
        p.style.animationDelay = `${Math.random() * 5}s`;
        p.style.opacity = '0.6';
        container.appendChild(p);
    }
}