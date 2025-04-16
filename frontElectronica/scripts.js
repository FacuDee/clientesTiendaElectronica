document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  let limit = parseInt(document.getElementById("limit").value);
  let searchTerm = '';
  let sortOrder = 'id_asc';

  // Función para mostrar alertas
  const showAlert = (message, type = "success") => {
      const alertContainer = document.getElementById("alert-container");
      const alert = document.createElement("div");
      alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
      alert.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      alertContainer.appendChild(alert);
      setTimeout(() => alert.remove(), 3000);
  };

  // Función para cargar clientes
  const loadClientes = (page, limit, search = '', sort = '') => {
      let url = `http://localhost:3001/api/clientes?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (sort) url += `&sort=${sort}`;

      fetch(url)
          .then((response) => {
              if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
              return response.json();
          })
          .then((data) => {
              const clientes = data.clientes;
              const tableBody = document.getElementById("clientes-table");
              tableBody.innerHTML = "";

              clientes.forEach((cliente) => {
                  const row = `
                      <tr data-id="${cliente.ID}">
                          <td>${cliente.ID}</td>
                          <td>${cliente.Nombre}</td>
                          <td>${cliente.Email || "N/A"}</td>
                          <td>${cliente.Telefono || "N/A"}</td>
                          <td class="text-nowrap">
                              <button class="btn btn-sm btn-secondary me-2 edit-btn">Editar</button>
                              <button class="btn btn-sm btn-danger delete-btn">Eliminar</button>
                          </td>
                      </tr>
                  `;
                  tableBody.innerHTML += row;
              });

              addDeleteEventListeners();
              addEditEventListeners();

              document.getElementById("page-info").textContent = 
                  `Página ${data.paginacion.page} de ${data.paginacion.totalPages}`;
              document.getElementById("prev-page")
                  .classList.toggle("disabled", data.paginacion.page === 1);
              document.getElementById("next-page")
                  .classList.toggle("disabled", data.paginacion.page === data.paginacion.totalPages);
          })
          .catch((error) => {
              console.error("Error:", error);
              showAlert(`Error al cargar clientes: ${error.message}`, "danger");
          });
  };

  // Event listeners
  document.getElementById("search").addEventListener("input", (e) => {
      searchTerm = e.target.value;
      currentPage = 1; // Resetear a primera página al buscar
      loadClientes(currentPage, limit, searchTerm, sortOrder);
  });

  document.getElementById("sort").addEventListener("change", (e) => {
      sortOrder = e.target.value;
      loadClientes(currentPage, limit, searchTerm, sortOrder);
  });

  document.getElementById("limit").addEventListener("change", (e) => {
      limit = parseInt(e.target.value);
      loadClientes(currentPage, limit, searchTerm, sortOrder);
  });

  document.getElementById("prev-page").addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
          currentPage--;
          loadClientes(currentPage, limit, searchTerm, sortOrder);
      }
  });

  document.getElementById("next-page").addEventListener("click", (e) => {
      e.preventDefault();
      currentPage++;
      loadClientes(currentPage, limit, searchTerm, sortOrder);
  });

  // Funciones para editar/eliminar (mantener igual que antes)
  const addDeleteEventListeners = () => {
      document.querySelectorAll(".delete-btn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
              const row = e.target.closest("tr");
              const id = row.dataset.id;
              if (confirm("¿Estás seguro de eliminar este cliente?")) {
                  try {
                      const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
                          method: "DELETE"
                      });
                      if (!response.ok) throw new Error("Error al eliminar");
                      showAlert("Cliente eliminado correctamente");
                      loadClientes(currentPage, limit, searchTerm, sortOrder);
                  } catch (error) {
                      showAlert(error.message, "danger");
                  }
              }
          });
      });
  };

  const addEditEventListeners = () => {
      document.querySelectorAll(".edit-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
              const row = e.target.closest("tr");
              const cliente = {
                  id: row.dataset.id,
                  nombre: row.cells[1].textContent,
                  email: row.cells[2].textContent,
                  telefono: row.cells[3].textContent
              };
              document.getElementById("edit-id").value = cliente.id;
              document.getElementById("edit-nombre").value = cliente.nombre;
              document.getElementById("edit-email").value = cliente.email === "N/A" ? "" : cliente.email;
              document.getElementById("edit-telefono").value = cliente.telefono === "N/A" ? "" : cliente.telefono;
              new bootstrap.Modal(document.getElementById("editModal")).show();
          });
      });
  };

  document.getElementById("edit-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-id").value;
      const cliente = {
          nombre: document.getElementById("edit-nombre").value,
          email: document.getElementById("edit-email").value,
          telefono: document.getElementById("edit-telefono").value
      };
      try {
          const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cliente)
          });
          if (!response.ok) throw new Error("Error al actualizar");
          showAlert("Cliente actualizado correctamente");
          loadClientes(currentPage, limit, searchTerm, sortOrder);
          bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
      } catch (error) {
          showAlert(error.message, "danger");
      }
  });

  document.getElementById("form-cliente").addEventListener("submit", async (e) => {
      e.preventDefault();
      const nuevoCliente = {
          nombre: document.getElementById("nombre").value,
          email: document.getElementById("email").value,
          telefono: document.getElementById("telefono").value
      };
      try {
          const response = await fetch("http://localhost:3001/api/clientes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nuevoCliente)
          });
          if (!response.ok) throw new Error("Error al crear cliente");
          const data = await response.json();
          showAlert(`Cliente creado con ID: ${data.id}`);
          loadClientes(currentPage, limit, searchTerm, sortOrder);
          e.target.reset();
      } catch (error) {
          showAlert(error.message, "danger");
      }
  });

  // Carga inicial
  loadClientes(currentPage, limit, searchTerm, sortOrder);
});