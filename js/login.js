document.addEventListener("DOMContentLoaded", function () {

    /* ==========================================
       CAMBIO DE PESTAÑAS: Iniciar Sesión / Crear Cuenta
    ========================================== */

    const tabs = document.querySelectorAll(".login-tab");
    const panels = document.querySelectorAll(".login-tab-panel");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");

            tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
            tab.setAttribute("aria-selected", "true");

            panels.forEach((panel) => {
                panel.classList.toggle("active", panel.id === target);
            });
        });
    });

    /* ==========================================
       VALIDACIÓN: Iniciar Sesión
    ========================================== */

    const loginForm = document.getElementById("form-login");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const loginSuccess = document.getElementById("login-success");

    function validarEmail(valor) {
        const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return patron.test(valor.trim());
    }

    function mostrarError(input, mensaje) {
        const grupo = input.closest(".form-group");
        const errorSpan = grupo.querySelector(".error-message");
        input.classList.add("is-invalid");
        errorSpan.textContent = mensaje;
    }

    function limpiarError(input) {
        const grupo = input.closest(".form-group");
        const errorSpan = grupo.querySelector(".error-message");
        input.classList.remove("is-invalid");
        errorSpan.textContent = "";
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let esValido = true;

            if (!validarEmail(loginEmail.value)) {
                mostrarError(loginEmail, "Ingresa un correo electrónico válido.");
                esValido = false;
            } else {
                limpiarError(loginEmail);
            }

            if (loginPassword.value.trim().length < 6) {
                mostrarError(loginPassword, "La contraseña debe tener al menos 6 caracteres.");
                esValido = false;
            } else {
                limpiarError(loginPassword);
            }

            if (!esValido) {
                loginForm.classList.add("shake");
                setTimeout(() => loginForm.classList.remove("shake"), 350);
                loginSuccess.classList.remove("show");
                return;
            }

            loginSuccess.classList.add("show");
            loginForm.reset();
        });

        [loginEmail, loginPassword].forEach((input) => {
            input.addEventListener("input", () => limpiarError(input));
        });
    }

    /* ==========================================
       VALIDACIÓN: Crear Cuenta
    ========================================== */

    const registerForm = document.getElementById("form-register");
    const regNombre = document.getElementById("reg-nombre");
    const regEmail = document.getElementById("reg-email");
    const regPassword = document.getElementById("reg-password");
    const regPasswordConfirm = document.getElementById("reg-password-confirm");
    const regTerms = document.getElementById("reg-terms");
    const registerSuccess = document.getElementById("register-success");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let esValido = true;

            if (regNombre.value.trim().length < 2) {
                mostrarError(regNombre, "Ingresa tu nombre completo.");
                esValido = false;
            } else {
                limpiarError(regNombre);
            }

            if (!validarEmail(regEmail.value)) {
                mostrarError(regEmail, "Ingresa un correo electrónico válido.");
                esValido = false;
            } else {
                limpiarError(regEmail);
            }

            if (regPassword.value.trim().length < 6) {
                mostrarError(regPassword, "La contraseña debe tener al menos 6 caracteres.");
                esValido = false;
            } else {
                limpiarError(regPassword);
            }

            if (regPasswordConfirm.value !== regPassword.value || regPasswordConfirm.value === "") {
                mostrarError(regPasswordConfirm, "Las contraseñas no coinciden.");
                esValido = false;
            } else {
                limpiarError(regPasswordConfirm);
            }

            if (!regTerms.checked) {
                const errorSpan = document.getElementById("reg-terms-error");
                errorSpan.textContent = "Debes aceptar los términos para continuar.";
                esValido = false;
            } else {
                document.getElementById("reg-terms-error").textContent = "";
            }

            if (!esValido) {
                registerForm.classList.add("shake");
                setTimeout(() => registerForm.classList.remove("shake"), 350);
                registerSuccess.classList.remove("show");
                return;
            }

            registerSuccess.classList.add("show");
            registerForm.reset();
        });

        [regNombre, regEmail, regPassword, regPasswordConfirm].forEach((input) => {
            input.addEventListener("input", () => limpiarError(input));
        });

        regTerms.addEventListener("change", () => {
            document.getElementById("reg-terms-error").textContent = "";
        });
    }
});