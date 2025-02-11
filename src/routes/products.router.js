const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/productos.json');

const readProductsFile = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading products file:', error);
        return [];
    }
};

const writeProductsFile = (products) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error writing products file:', error);
    }
};

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || null;
    const products = readProductsFile();

    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

// Ruta para obtener un producto por su ID
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProductsFile();
    const product = products.find((p) => p.id === parseInt(pid));

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
});

// Ruta para agregar un producto nuevo
router.post('/', (req, res) => {
    const products = readProductsFile();
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        ...req.body,
        status: req.body.status ?? true,
    };

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    products.push(newProduct);
    writeProductsFile(products);
    res.status(201).json(newProduct);

    // Emitir evento de Socket.io
    req.app.get('io').emit('updateProducts', products);
});

// Ruta para actualizar un producto por su ID
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const updates = req.body;
    const products = readProductsFile();
    const index = products.findIndex((p) => p.id === parseInt(pid));

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[index], ...updates, id: products[index].id };
    products[index] = updatedProduct;

    writeProductsFile(products);
    res.json(updatedProduct);

    // Emitir evento de Socket.io
    req.app.get('io').emit('updateProducts', products);
});

// Ruta para eliminar un producto por su ID
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProductsFile();
    const updatedProducts = products.filter((p) => p.id !== parseInt(pid));

    if (products.length === updatedProducts.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    writeProductsFile(updatedProducts);
    res.status(204).send();

    // Emitir evento de Socket.io
    req.app.get('io').emit('updateProducts', updatedProducts);
});

module.exports = router;