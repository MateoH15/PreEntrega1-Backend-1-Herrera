const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { engine } = require("express-handlebars");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const { readProductsFile } = require("./utils/fileUtils");

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8080;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta para la vista home
app.get("/", (req, res) => {
  res.render("home", { products: readProductsFile() });
});

// Ruta para la vista realTimeProducts
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products: readProductsFile() });
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("newProduct", (product) => {
    const products = readProductsFile();
    products.push(product);
    writeProductsFile(products);
    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (productId) => {
    let products = readProductsFile();
    products = products.filter((p) => p.id !== productId);
    writeProductsFile(products);
    io.emit("updateProducts", products);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
