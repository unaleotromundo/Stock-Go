// sample-data.js
// Datos de ejemplo para cargar en Danny's Burger

const sampleData = {
    stock: {
        'Pan Brioche': { quantity: 50, unit: 'unidades', pricePerUnit: 120 },
        'Medallón Danny\'s': { quantity: 45, unit: 'unidades', pricePerUnit: 350 },
        'Queso Cheddar': { quantity: 40, unit: 'fetas', pricePerUnit: 80 },
        'Bacon Ahumado': { quantity: 30, unit: 'tiras', pricePerUnit: 150 },
        'Tomate Cherry': { quantity: 25, unit: 'unidades', pricePerUnit: 25 },
        'Lechuga Criolla': { quantity: 35, unit: 'hojas', pricePerUnit: 15 },
        'Cebolla Morada': { quantity: 20, unit: 'rodajas', pricePerUnit: 20 },
        'Salsa Danny\'s': { quantity: 15, unit: 'porciones', pricePerUnit: 50 },
        'Papas Rústicas': { quantity: 40, unit: 'porciones', pricePerUnit: 220 },
        'Aros de Cebolla': { quantity: 25, unit: 'porciones', pricePerUnit: 250 },
        'Coca Cola': { quantity: 48, unit: 'latas', pricePerUnit: 180 },
        'Cerveza Artesanal': { quantity: 24, unit: 'botellas', pricePerUnit: 350 },
        'Agua Saborizada': { quantity: 36, unit: 'botellas', pricePerUnit: 120 }
    },
    recipes: {
        'Danny\'s Classic': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Queso Cheddar': 1, 'Lechuga Criolla': 2, 'Tomate Cherry': 3, 'Salsa Danny\'s': 1 },
            price: 3800
        },
        'Bacon Deluxe': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Bacon Ahumado': 3, 'Queso Cheddar': 2, 'Cebolla Morada': 2, 'Salsa Danny\'s': 1 },
            price: 4500
        },
        'Combo Special': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 1, 'Bacon Ahumado': 2, 'Queso Cheddar': 1, 'Lechuga Criolla': 2, 'Tomate Cherry': 3, 'Salsa Danny\'s': 1, 'Papas Rústicas': 1, 'Coca Cola': 1 },
            price: 5200
        },
        'Combo Premium': {
            ingredients: { 'Pan Brioche': 1, 'Medallón Danny\'s': 2, 'Bacon Ahumado': 3, 'Queso Cheddar': 2, 'Cebolla Morada': 3, 'Salsa Danny\'s': 1, 'Aros de Cebolla': 1, 'Cerveza Artesanal': 1 },
            price: 6800
        }
    }
};