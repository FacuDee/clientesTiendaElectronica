const express = require("express");
const cors = require("cors");
const app = express();

// Configuración CORRECTA de CORS
app.use(cors({
  origin: "http://127.0.0.1:5500", // O "http://localhost:5500"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json()); // Elimina el objeto de configuración que estaba aquí

// Rutas
app.use("/api/ventas", require("./routes/ventasRoutes"));
app.use("/api/clientes", require("./routes/clientesRoutes"));

// Cambia el puerto del backend (para evitar conflicto)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});