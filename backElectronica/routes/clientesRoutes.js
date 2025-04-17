const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/clientes
router.post("/", async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const [result] = await db.query(
      "INSERT INTO Clientes (Nombre, Email, Telefono) VALUES (?, ?, ?)",
      [nombre, email, telefono]
    );
    res.status(201).json({ message: "Cliente creado", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes (con búsqueda y ordenamiento)
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, search = "", sort = "id_asc" } = req.query;
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM Clientes";
  let countQuery = "SELECT COUNT(*) AS total FROM Clientes";
  const params = [];

  if (search) {
    query += " WHERE Nombre LIKE ? OR Email LIKE ? OR Telefono LIKE ?";
    countQuery += " WHERE Nombre LIKE ? OR Email LIKE ? OR Telefono LIKE ?";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Ordenamiento
  switch (sort) {
    case "nombre_asc":
      query += " ORDER BY Nombre ASC";
      break;
    case "nombre_desc":
      query += " ORDER BY Nombre DESC";
      break;
    case "email_asc":
      query += " ORDER BY Email ASC";
      break;
    case "email_desc":
      query += " ORDER BY Email DESC";
      break;
    case "id_asc":
      query += " ORDER BY ID ASC";
      break;
    case "id_desc":
      query += " ORDER BY ID DESC";
      break;
    default:
      query += " ORDER BY ID ASC";
  }

  query += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [clientes] = await db.query(query, params);
    const [total] = await db.query(countQuery, params.slice(0, search ? 3 : 0));

    res.json({
      clientes,
      paginacion: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: total[0].total,
        totalPages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM Clientes WHERE ID = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id
router.put("/:id", async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const [result] = await db.query(
      "UPDATE Clientes SET Nombre = ?, Email = ?, Telefono = ? WHERE ID = ?",
      [nombre, email, telefono, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id/ventas
router.get("/:id/ventas", async (req, res) => {
  console.log(`Solicitud recibida para ventas del cliente ${req.params.id}`);
  try {
    const [ventas] = await db.query(
      `
            SELECT v.ID, v.Fecha, e.Nombre AS EmpleadoNombre, 
                   SUM(dv.Cantidad * dv.Precio_Unitario) AS Total
            FROM Ventas v
            JOIN Empleados e ON v.ID_Empleado = e.ID
            JOIN Detalle_Ventas dv ON v.ID = dv.ID_Venta
            WHERE v.ID_Cliente = ?
            GROUP BY v.ID
            ORDER BY v.Fecha DESC
        `,
      [req.params.id]
    );

    console.log("Resultado de la consulta:", ventas); // Debug

    // Asegurarnos que Total es un número
    const ventasFormateadas = ventas.map((venta) => ({
      ...venta,
      Total: Number(venta.Total) || 0,
    }));

    res.json(ventasFormateadas);
  } catch (err) {
    console.error("Error en /api/clientes/:id/ventas:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get("/:id", async (req, res) => {
  try {
    const [clientes] = await db.query("SELECT * FROM Clientes WHERE ID = ?", [
      req.params.id,
    ]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(clientes[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
