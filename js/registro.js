document.addEventListener("DOMContentLoaded", function() {
    const openRegisterModal = document.getElementById("openRegisterModal");
    const registerForm = document.getElementById("registerForm");
    const registerMessage = document.getElementById("registerMessage");

    // Abrir modal al hacer clic en el enlace
    openRegisterModal.addEventListener("click", function(event) {
        event.preventDefault(); // Evita que recargue la página
        const modal = new bootstrap.Modal(document.getElementById("registerModal"));
        modal.show();
    });

    // Manejar el envío del formulario de registro
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault(); // Evita el envío por defecto

        // Capturar datos del formulario
        const formData = {
            nombre: document.getElementById("nombre").value,
            telefono: document.getElementById("telefono").value,
            email: document.getElementById("email").value,
            username: document.getElementById("usernameRegister").value,
            password: document.getElementById("passwordRegister").value,
            confirmPassword: document.getElementById("confirmPassword").value
        };

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            registerMessage.textContent = "Las contraseñas no coinciden";
            registerMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error en el registro");
            }

            registerMessage.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
            registerMessage.style.color = "green";

            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
                modal.hide();
            }, 2000);
        } catch (error) {
            registerMessage.textContent = error.message;
            registerMessage.style.color = "red";
            console.error("Error:", error);
        }
    });
});





















/*async function registrarUsuario() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, nombre, telefono })
        });

        if (!response.ok) {
            throw new Error("Error en el registro");
        }

        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        location.href = "index.html";
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al registrar el usuario");
    }
}

document.getElementById("registerBtn").addEventListener("click", registrarUsuario);*/
