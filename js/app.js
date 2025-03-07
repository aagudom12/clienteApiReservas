////////////// MANEJADORES DE EVENTOS //////////////

// Cargar reservas
document.getElementById("cargarReservasBtn")
    .addEventListener("click", obtenerReservasUsuario);

// Abrir el diálogo de nueva reserva
const addReservaDialog = document.getElementById("nuevaReservaDialog");
document.getElementById("openDialogAddReservaBtn").addEventListener("click", () => {
    addReservaDialog.showModal();
});

// Cerrar el diálogo de nueva reserva
document.getElementById('cancelReservaBtn').addEventListener("click", () => {
    addReservaDialog.close();
});

// Cargar mesas disponibles al seleccionar fecha y hora
document.getElementById("fechaReserva").addEventListener("change", cargarMesasDisponibles);
document.getElementById("horaReserva").addEventListener("change", cargarMesasDisponibles);


// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", cerrarSesion);

// Mostrar el usuario al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    obtenerReservasUsuario();
    mostrarUsuario();
});

document.getElementById("addReservaBtn").addEventListener("click", nuevaReserva);


// Funciones para cargar reservas y mostrar datos de usuario
async function obtenerReservasUsuario() {
    try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        const response = await fetch("http://localhost:8080/mis-reservas", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error("Error al obtener las reservas");
        }

        const reservas = await response.json();
        console.log("Reservas obtenidas:", reservas);
        // Aquí puedes actualizar el HTML para mostrar las reservas del usuario
        actualizarTablaReservas(reservas);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function mostrarUsuario() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            document.getElementById("usernameHeader").innerHTML = `Bienvenido, <strong>Usuario</strong>`;
            return;
        }

        const response = await fetch("http://localhost:8080/auth/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el usuario");
        }

        const data = await response.json();
        document.getElementById("usernameHeader").innerHTML = `Bienvenido, <strong>${data.username}</strong>`;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        document.getElementById("usernameHeader").innerHTML = `Bienvenido, <strong>Usuario</strong>`;
    }
}

/////////////////// MÉTODOS ASINCRONOS. CONEXIÓN CON EL SERVIDOR (AJAX) ////////////////

// Obtener el usuario desde el token
function obtenerUsuarioDesdeToken() {
    const token = localStorage.getItem("token");
    console.log("Token en localStorage:", token);

    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        console.log("Payload codificado:", payloadBase64);

        const payload = JSON.parse(atob(payloadBase64));
        console.log("Payload decodificado:", payload);

        return payload ? payload.username : null;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
}


// Cargar mesas disponibles
async function cargarMesasDisponibles() {
    const fecha = document.getElementById("fechaReserva").value;
    const hora = document.getElementById("horaReserva").value;

    if (!fecha || !hora) return;

    try {
        const response = await fetch(`http://localhost:8080/mesas-disponibles?fecha=${fecha}&hora=${hora}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener las mesas disponibles");
        }

        const mesas = await response.json();
        const mesaSelect = document.getElementById("mesaSelect");

        // Limpiar opciones anteriores
        mesaSelect.innerHTML = "";

        if (mesas.length === 0) {
            const option = document.createElement("option");
            option.textContent = "No hay mesas disponibles para esta fecha y hora.";
            mesaSelect.appendChild(option);
        } else {
            // Añadir opciones de mesas disponibles
            mesas.forEach(mesa => {
                const option = document.createElement("option");
                option.value = mesa.id;
                option.textContent = `Mesa ${mesa.id}`;
                mesaSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Error al cargar las mesas:", error);
    }
}

async function obtenerClienteId() {
    const token = localStorage.getItem("token");
    console.log("Token enviado en la solicitud:", token);

    if (!token) return null;

    try {
        const response = await fetch("http://localhost:8080/clientes/mi-cliente", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Estado de la respuesta:", response.status); //
        const data = await response.json();
        console.log("Respuesta del servidor:", data); //

        if (!response.ok) throw new Error(data);

        return data;
    } catch (error) {
        console.error("Error al obtener el cliente:", error);
        return null;
    }
}



// Función para añadir una nueva reserva
async function nuevaReserva() {
    const mesaId = document.getElementById("mesaSelect").value;
    const fecha = document.getElementById("fechaReserva").value;
    const hora = document.getElementById("horaReserva").value;
    const numPersonas = document.getElementById("numPersonas").value;

    let clienteNombre = localStorage.getItem("clienteNombre"); // Obtenemos el nombre del cliente desde localStorage

    if (!clienteNombre || clienteNombre === "undefined") { // Validamos si es nulo o "undefined"
        console.error("❌ Error: clienteNombre no está definido en localStorage");
        alert("Error: No se pudo obtener el nombre del cliente. Intenta iniciar sesión nuevamente.");
        return;
    }

    if (!mesaId || !fecha || !hora || !numPersonas) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const reserva = {
        mesa: { id: mesaId },
        fecha: fecha,
        hora: hora,
        numeroPersonas: numPersonas,
        usuario: { username: obtenerUsuarioDesdeToken() },
        cliente: { nombre: clienteNombre } // Usamos el nombre del cliente
    };

    try {
        const response = await fetch("http://localhost:8080/reservas", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reserva)
        });

        if (!response.ok) {
            throw new Error("Error al crear la reserva");
        }

        const nuevaReserva = await response.json();
        console.log("🟢 Reserva creada:", nuevaReserva);
        agregarReservaATabla(nuevaReserva);
        addReservaDialog.close();
    } catch (error) {
        console.error("❌ Error al crear la reserva:", error);
    }
}





async function borrarReserva(id, boton) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return; // Confirmación antes de borrar

    try {
        const response = await fetch(`http://localhost:8080/reservas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al eliminar la reserva");
        }

        console.log(`Reserva con ID ${id} eliminada`);

        // Eliminar la fila de la tabla visualmente
        const fila = boton.closest("tr");
        fila.remove();
    } catch (error) {
        console.error("Error al eliminar la reserva:", error);
    }
}


// Agregar la nueva reserva a la tabla
function agregarReservaATabla(reserva) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>Mesa ${reserva.mesa.id}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.hora}</td>
        <td>${reserva.numeroPersonas}</td>
        <td><button class="btn btn-danger btn-sm" onclick="borrarReserva(${reserva.id}, this)">Borrar</button></td>
    `;
    document.getElementById("tableBody").appendChild(fila);
}

function actualizarTablaReservas(reservas) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de agregar las reservas

    reservas.forEach(reserva => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${reserva.cliente ? reserva.cliente.nombre : "Desconocido"}</td>
            <td>Mesa ${reserva.mesa ? reserva.mesa.id : "N/A"}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.hora}</td>
            <td>${reserva.numeroPersonas}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="borrarReserva(${reserva.id}, this)">Borrar</button>
            </td>`;
        tableBody.appendChild(fila);
    });
}


// Manejar el cierre de sesión
function cerrarSesion() {
    localStorage.removeItem("token");  // Eliminar el token del localStorage
    location.href = "index.html";  // Redirigir al login
}
