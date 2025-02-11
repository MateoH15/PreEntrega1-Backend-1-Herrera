const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carritos.json');
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
    const newCart = {
        id: carts.length ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };

    carts.push(newCart);
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
    res.status(201).json(newCart);

    // Emitir evento de Socket.io
    req.app.get('io').emit('updateCarts', carts);
});

// Ruta para obtener un carrito por su ID
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
    const cart = carts.find((c) => c.id === parseInt(cid));

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart);
});

// Ruta para agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

    const cart = carts.find((c) => c.id === parseInt(cid));
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productExists = products.find((p) => p.id === parseInt(pid));
    if (!productExists) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const existingProduct = cart.products.find((p) => p.product === parseInt(pid));
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: parseInt(pid), quantity: 1 });
    }

    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
    res.status(201).json(cart);

    // Emitir evento de Socket.io
    req.app.get('io').emit('updateCarts', carts);
});

module.exports = router;