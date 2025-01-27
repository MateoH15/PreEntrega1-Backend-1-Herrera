const express = require('express')
const fs = require('fs')
const router = express.Router()

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || null
    const products = JSON.parse(fs.readFileSync('./productos.json', 'utf-8'))

    if (limit) {
        return res.json(products.slice(0, limit))
    }
    res.json(products)
})

// Ruta para obtener un producto por su ID
router.get('/:pid', (req, res) => {
    const { pid } = req.params
    const products = JSON.parse(fs.readFileSync('./productos.json', 'utf-8'))
    const product = products.find((p) => p.id === parseInt(pid))

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json(product)
})

// Ruta para agregar un producto nuevo
router.post('/', (req, res) => {
    const products = JSON.parse(fs.readFileSync('./productos.json', 'utf-8'))
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        ...req.body,
        status: req.body.status ?? true,
    }

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    products.push(newProduct)
    fs.writeFileSync('./productos.json', JSON.stringify(products, null, 2))
    res.status(201).json(newProduct)
})

// Ruta para actualizar un producto por su ID
router.put('/:pid', (req, res) => {
    const { pid } = req.params
    const updates = req.body
    const products = JSON.parse(fs.readFileSync('./productos.json', 'utf-8'))
    const index = products.findIndex((p) => p.id === parseInt(pid))

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const updatedProduct = { ...products[index], ...updates, id: products[index].id }
    products[index] = updatedProduct

    fs.writeFileSync('./productos.json', JSON.stringify(products, null, 2))
    res.json(updatedProduct)
})



// Ruta para eliminar un producto por su ID

router.delete('/:pid', (req, res) => {
    const { pid } = req.params
    const products = JSON.parse(fs.readFileSync('./productos.json', 'utf-8'))
    const updatedProducts = products.filter((p) => p.id !== parseInt(pid))

    if (products.length === updatedProducts.length) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    fs.writeFileSync('./productos.json', JSON.stringify(updatedProducts, null, 2))
    res.status(204).send()
})

module.exports = router
