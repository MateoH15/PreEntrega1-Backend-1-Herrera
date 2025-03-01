const express = require("express");
const { readProductsFile } = require("../utils/fileUtils");
const router = express.Router();

// Ruta para la vista home
router.get("/", (req, res) => {
  res.render("home", { products: readProductsFile() });
});

// Ruta para la vista realTimeProducts
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products: readProductsFile() });
});

module.exports = router;
