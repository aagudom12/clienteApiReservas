////////////// MANEJADORES DE EVENTOS //////////////

// Cargar reservas
document.getElementById("cargarReservasBtn")
    .addEventListener("click", obtenerReservasUsuario);

// Abrir el diálogo de nueva reserva
const addReservaDialog = document.getElementById("nuevaReservaDialog");
document.getElementById("openDialogAddReservaBtn").addEventListener("click", () => {
    cargarMesasDisponibles(); // Llamar a la función para cargar mesas disponibles
    addReservaDialog.showModal();
});

// Cerrar el diálogo de nueva reserva
document.getElementById('cancelReservaBtn').addEventListener("click", () => {
    addReservaDialog.close();
});

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
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el JWT
    return payload ? payload.username : null; // Obtener el nombre de usuario (si existe en el token)
}

// Cargar mesas disponibles
async function cargarMesasDisponibles() {
    try {
        const response = await fetch("http://localhost:8080/mesas", {
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

        mesas.forEach(mesa => {
            const option = document.createElement("option");
            option.value = mesa.id;
            option.textContent = `Mesa ${mesa.id}`;
            mesaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar las mesas:", error);
    }
}

// Función para añadir una nueva reserva
async function nuevaReserva() {
    const nombreCliente = document.getElementById("nombreCliente").value;
    const mesaId = parseInt(document.getElementById("mesaSelect").value, 10);
    if (!mesaId) {
        alert("Por favor, selecciona una mesa válida.");
        return;
    }
    const fecha = document.getElementById("fechaReserva").value;
    const hora = document.getElementById("horaReserva").value;
    const numPersonas = document.getElementById("numPersonas").value;

    if (!nombreCliente || !mesaId || !fecha || !hora || !numPersonas) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const reserva = {
        cliente: { nombre: nombreCliente },
        mesa: { id: parseInt(mesaId) }, // Convertir a número
        fecha: fecha,
        hora: hora,
        numeroPersonas: parseInt(numPersonas), // Convertir a número
        usuario: { username: obtenerUsuarioDesdeToken() }
    };

    console.log("Datos a enviar:", reserva); // Verifica los datos antes de enviarlos

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
        console.log("Reserva creada:", nuevaReserva);

        // Agregar la nueva reserva a la tabla
        agregarReservaATabla(nuevaReserva);

        // Cerrar el diálogo
        addReservaDialog.close();

        // Limpiar los campos del formulario
        document.getElementById("nombreCliente").value = "";
        document.getElementById("mesaSelect").value = "";
        document.getElementById("fechaReserva").value = "";
        document.getElementById("horaReserva").value = "";
        document.getElementById("numPersonas").value = "";

    } catch (error) {
        console.error("Error al crear la reserva:", error);
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
        <td>${reserva.cliente.nombre}</td>
        <td>Mesa ${reserva.mesa.id}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.hora}</td>
        <td>${reserva.numeroPersonas}</td>
        <td><button class="btn btn-warning btn-sm" onclick="editarReserva(${reserva.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="borrarReserva(${reserva.id}, this)">Borrar</button></td>`;
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
