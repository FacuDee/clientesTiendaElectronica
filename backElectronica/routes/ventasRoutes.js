const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/ventas/:id/detalle
router.get('/:id/detalle', async (req, res) => {
    console.log(`Accediendo a detalle de venta ID: ${req.params.id}`);
    try {
        const [venta] = await db.query(`
            SELECT v.*, e.Nombre AS EmpleadoNombre 
            FROM Ventas v
            JOIN Empleados e ON v.ID_Empleado = e.ID
            WHERE v.ID = ?`, [req.params.id]);
        
        if (venta.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        const [detalle] = await db.query(`
            SELECT 
                dv.*, 
                p.Nombre AS ProductoNombre,
                CAST(dv.Precio_Unitario AS DECIMAL(10,2)) AS Precio_Unitario,
                CAST(dv.Cantidad AS UNSIGNED) AS Cantidad
            FROM Detalle_Ventas dv
            JOIN Productos p ON dv.ID_Producto = p.ID
            WHERE dv.ID_Venta = ?`, [req.params.id]);

        // Formatear los datos numéricos
        const detalleFormateado = detalle.map(item => ({
            ...item,
            Precio_Unitario: Number(item.Precio_Unitario),
            Cantidad: Number(item.Cantidad)
        }));

        res.json({
            venta: venta[0],
            detalle: detalleFormateado
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
