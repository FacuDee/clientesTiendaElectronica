const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/ventas?page=1&limit=10
router.get('/ventas', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Página actual (default: 1)
        const limit = parseInt(req.query.limit) || 10; // Items por página (default: 10)
        const offset = (page - 1) * limit; // Cálculo del offset

        // Consulta con paginación
        const [ventas] = await db.query(`
            SELECT v.ID, c.Nombre AS Cliente, e.Nombre AS Empleado, v.Fecha
            FROM Ventas v
            JOIN Clientes c ON v.ID_Cliente = c.ID
            JOIN Empleados e ON v.ID_Empleado = e.ID
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        // Contar total de ventas (para calcular total de páginas)
        const [total] = await db.query('SELECT COUNT(*) AS total FROM Ventas');
        const totalVentas = total[0].total;

        res.json({
            ventas,
            paginacion: {
                page,
                limit,
                totalItems: totalVentas,
                totalPages: Math.ceil(totalVentas / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;