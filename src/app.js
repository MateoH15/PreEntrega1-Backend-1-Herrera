const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { engine } = require("express-handlebars");
const connectDB = require("./data/connection");
const productsRouter = require("./routes/productsdb.router");
const cartsRouter = require("./routes/cartsdb.router");
const viewsRouter = require("./routes/views.router");

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8080;

connectDB();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("newProduct", async (product) => {
    const newProduct = new Product(product);
    await newProduct.save();
    const products = await Product.find();
    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", async (productId) => {
    await Product.findByIdAndDelete(productId);
    const products = await Product.find();
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
