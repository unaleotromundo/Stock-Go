// sample-data.js
// Datos de ejemplo basados en "Dannysburger_Costos_Detallados.pdf"
// Cantidades iniciales generosas para permitir múltiples ventas

const sampleData = {
    stock: {
        'Pan de queso': { quantity: 150, unit: 'unidades', pricePerUnit: 18 },
        'Carne simple 130g': { quantity: 120, unit: 'unidades', pricePerUnit: 36.4 },
        'Carne doble 80g': { quantity: 100, unit: 'unidades', pricePerUnit: 22.4 },
        'Hamburguesa vegana': { quantity: 80, unit: 'unidades', pricePerUnit: 145 },
        'Cheddar feta': { quantity: 200, unit: 'unidades', pricePerUnit: 15.8 },
        'Cheddar cremoso cda': { quantity: 250, unit: 'cucharadas', pricePerUnit: 5 },
        'Mozzarella feta': { quantity: 180, unit: 'unidades', pricePerUnit: 7.88 },
        'Dambo feta grillado': { quantity: 90, unit: 'unidades', pricePerUnit: 7.88 },
        'Tomate rodaja': { quantity: 300, unit: 'unidades', pricePerUnit: 5 },
        'Lechuga 20g': { quantity: 250, unit: 'unidades', pricePerUnit: 3 },
        'Cebolla fina 1 cda': { quantity: 200, unit: 'cucharadas', pricePerUnit: 2 },
        'Cebolla caramelizada cda': { quantity: 150, unit: 'cucharadas', pricePerUnit: 3 },
        'Huevo frito': { quantity: 120, unit: 'unidades', pricePerUnit: 12 },
        'Mayonesa cda': { quantity: 300, unit: 'cucharadas', pricePerUnit: 3 },
        'Ketchup cda': { quantity: 200, unit: 'cucharadas', pricePerUnit: 2 },
        'Alioli cda': { quantity: 150, unit: 'cucharadas', pricePerUnit: 4 },
        'Salsa Dannys cda': { quantity: 200, unit: 'cucharadas', pricePerUnit: 4 },
        'Salsa tártara cda': { quantity: 150, unit: 'cucharadas', pricePerUnit: 4 },
        'Salsa BBQ cda': { quantity: 150, unit: 'cucharadas', pricePerUnit: 4 },
        'Pepinillos 15g': { quantity: 180, unit: 'unidades', pricePerUnit: 4 },
        'Panceta feta': { quantity: 150, unit: 'unidades', pricePerUnit: 11.1 },
        'Aros de cebolla 30g': { quantity: 120, unit: 'unidades', pricePerUnit: 7.65 },
        'Papas fritas porción': { quantity: 200, unit: 'unidades', pricePerUnit: 12.48 },
        'Papel aluminio': { quantity: 500, unit: 'unidades', pricePerUnit: 3 },
        'Caja papas': { quantity: 200, unit: 'unidades', pricePerUnit: 5 },
        'Bolsa papel': { quantity: 300, unit: 'unidades', pricePerUnit: 5 },
        'Papas Pie': { quantity: 300, unit: 'gramos', pricePerUnit: 0.5 },
        'Cerveza 1L': { quantity: 300, unit: 'unidades', pricePerUnit: 230 },
        'Refresco 1.5L': { quantity: 300, unit: 'unidades', pricePerUnit: 180 },
        'Refresco 600ml': { quantity: 300, unit: 'unidades', pricePerUnit: 100 },
        'Corona 330ml': { quantity: 300, unit: 'unidades', pricePerUnit: 180 },  
    },
    recipes: {
        'Refresco 600ml': {
            ingredients: {
                'Refresco 600ml':  1
            },
            price: 120 
        },
        'Corona 330ml': {
            ingredients: {
                'Corona 330ml':  1
            },
            price: 120 
        },
         'Cerveza 1L': {
            ingredients: {
                'Cerveza 1L':  1
            },
            price: 280 
        },
         'Refresco 1.5L': {
            ingredients: {
                'Refresco 1.5L':  1
            },
            price: 220
        },
        
        'Pollo Crispy Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne simple 130g': 1,
                'Mozzarella feta': 1,
                'Tomate rodaja': 1,
                'Lechuga 20g': 1,
                'Cebolla fina 1 cda': 1,
                'Huevo frito': 1,
                'Mayonesa cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 550 
        },
        'Cheese Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne simple 130g': 1,
                'Cheddar feta': 1,
                'Cheddar cremoso cda': 1,
                'Dambo feta grillado': 1,
                'Mozzarella feta': 1,
                'Aros de cebolla 30g': 1,
                'Salsa Dannys cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 480 
        },
        'Clasic Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne simple 130g': 1,
                'Cheddar feta': 1,
                'Cheddar cremoso cda': 1,
                'Tomate rodaja': 1,
                'Lechuga 20g': 1,
                'Mayonesa cda': 1,
                'Cebolla fina 1 cda': 1,
                'Ketchup cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 400
        },
        'Veggie Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Hamburguesa vegana': 1,
                'Cheddar feta': 1,
                'Cheddar cremoso cda': 1,
                'Tomate rodaja': 1,
                'Lechuga 20g': 1,
                'Alioli cda': 1,
                'Aros de cebolla 30g': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 400
        },
        'Tártara Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne simple 130g': 1,
                'Cheddar feta': 1,
                'Cheddar cremoso cda': 1,
                'Mozzarella feta': 1,
                'Tomate rodaja': 1,
                'Lechuga 20g': 1,
                'Pepinillos 15g': 1,
                'Panceta feta': 1,
                'Huevo frito': 1,
                'Salsa tártara cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 450
        },
        'American Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne simple 130g': 1,
                'Cheddar feta': 1,
                'Cheddar cremoso cda': 1,
                'Panceta feta': 1,
                'Cebolla caramelizada cda': 1,
                'Salsa BBQ cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 550
        },
        'Triple Bacon Burger': {
            ingredients: {
                'Pan de queso': 1,
                'Carne doble 80g': 3,
                'Cheddar feta': 2,
                'Cheddar cremoso cda': 1,
                'Mozzarella feta': 1,
                'Panceta feta': 3,
                'Cebolla caramelizada cda': 1,
                'Salsa BBQ cda': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 650
        },
        'Doble XL': {
            ingredients: {
                'Pan de queso': 1,
                'Carne doble 80g': 2,
                'Cheddar feta': 2,
                'Cheddar cremoso cda': 2,
                'Panceta feta': 2,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 310 // ≈ 200% sobre costo (152.08)
        },
        'Doble Queso': {
            ingredients: {
                'Pan de queso': 1,
                'Carne doble 80g': 2,
                'Mozzarella feta': 4,
                'Cheddar feta': 2,
                'Cheddar cremoso cda': 2,
                'Huevo frito': 1,
                'Papas fritas porción': 1,
                'Papel aluminio': 1,
                'Caja papas': 1,
                'Bolsa papel': 1
            },
            price: 350 // ≈ 200% sobre costo (173.38)
        }
    }
};
