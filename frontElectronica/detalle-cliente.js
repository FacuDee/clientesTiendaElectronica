document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    if (!clienteId) {
        window.location.href = 'index.html';
        return;
    }

    // Función para mostrar alertas
    const showAlert = (message, type = "danger") => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.container').prepend(alert);
    };

    // Cargar datos del cliente
    const cargarCliente = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/clientes/${clienteId}`);
            if (!response.ok) throw new Error('Error al cargar cliente');
            const cliente = await response.json();
            
            document.getElementById('cliente-nombre').textContent = cliente.Nombre;
            document.getElementById('cliente-email').textContent = cliente.Email || 'N/A';
            document.getElementById('cliente-telefono').textContent = cliente.Telefono || 'N/A';
        } catch (error) {
            console.error('Error cargando cliente:', error);
            showAlert('Error al cargar datos del cliente');
        }
    };

    // Cargar ventas del cliente
    const cargarVentas = async () => {
        try {
            console.log(`Intentando cargar ventas para cliente ${clienteId}`); // Debug
            const response = await fetch(`http://localhost:3001/api/clientes/${clienteId}/ventas`);
            
            console.log('Respuesta recibida:', response); // Debug
            
            if (!response.ok) {
                if (response.status === 404) {
                    document.getElementById('ventas-table').innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">El cliente no tiene ventas registradas</td>
                        </tr>
                    `;
                    return;
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const ventas = await response.json();
            console.log('Datos de ventas recibidos:', ventas); // Debug
            
            const tableBody = document.getElementById('ventas-table');
            tableBody.innerHTML = '';
            
            if (!ventas || ventas.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">El cliente no tiene ventas registradas</td>
                    </tr>
                `;
                return;
            }
            
            ventas.forEach(venta => {
                // Asegurarnos que Total es un número
                const total = Number(venta.Total) || 0;
                const row = `
                    <tr>
                        <td>${venta.ID}</td>
                        <td>${new Date(venta.Fecha).toLocaleDateString()}</td>
                        <td>${venta.EmpleadoNombre}</td>
                        <td>$${total.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-info ver-detalle" data-id="${venta.ID}">
                                Ver Detalle
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            
            document.querySelectorAll('.ver-detalle').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const ventaId = e.target.dataset.id;
                    await mostrarDetalleVenta(ventaId);
                });
            });
        } catch (error) {
            console.error('Error cargando ventas:', error);
            document.getElementById('ventas-table').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">Error al cargar las ventas: ${error.message}</td>
                </tr>
            `;
        }
    };

    // Mostrar detalle de una venta específica
    const mostrarDetalleVenta = async (ventaId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/ventas/${ventaId}/detalle`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const { venta, detalle } = await response.json();
            console.log('Datos detalle crudos:', { venta, detalle }); // Debug adicional
    
            // Actualizar el modal
            document.getElementById('venta-id').textContent = venta.ID;
            document.getElementById('venta-fecha').textContent = new Date(venta.Fecha).toLocaleDateString();
            document.getElementById('venta-empleado').textContent = venta.EmpleadoNombre;
            
            const detalleBody = document.getElementById('detalle-venta-body');
            detalleBody.innerHTML = '';
            
            let total = 0;
            detalle.forEach(item => {
                // Asegurarnos que los valores numéricos sean tratados como números
                const precioUnitario = Number(item.Precio_Unitario) || 0;
                const cantidad = Number(item.Cantidad) || 0;
                const subtotal = cantidad * precioUnitario;
                total += subtotal;
                
                detalleBody.innerHTML += `
                    <tr>
                        <td>${item.ProductoNombre || 'N/A'}</td>
                        <td>${cantidad}</td>
                        <td>$${precioUnitario.toFixed(2)}</td>
                        <td>$${subtotal.toFixed(2)}</td>
                    </tr>
                `;
            });
            
            document.getElementById('venta-total').textContent = `$${total.toFixed(2)}`;
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('detalleVentaModal'));
            modal.show();
        } catch (error) {
            console.error('Error completo en mostrarDetalleVenta:', error);
            showAlert(`Error al cargar el detalle: ${error.message}`);
        }
    };

    // Inicializar
    cargarCliente();
    cargarVentas();
});