const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();

// Ruta para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = new Cart();
    await newCart.save();
    res.status(201).json(newCart);
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para obtener un carrito por su ID
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const existingProduct = cart.products.find((p) =>
      p.product.equals(product._id)
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }

    await cart.save();
    res.status(201).json(cart);
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(
      (p) => !p.product.equals(req.params.pid)
    );
    await cart.save();
    res.status(204).send();
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para actualizar el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = req.body.products;
    await cart.save();
    res.json(cart);
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const product = cart.products.find((p) => p.product.equals(req.params.pid));
    if (!product) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    }

    product.quantity = req.body.quantity;
    await cart.save();
    res.json(cart);
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Ruta para eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();
    res.status(204).send();
    req.io.emit("updateCarts", await Cart.find().populate("products.product"));
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
