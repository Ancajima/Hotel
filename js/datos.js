document.addEventListener("DOMContentLoaded", function () {
  const PRECIO_NOCHE = 300;
  const LIMPIEZA = 350;
  const SERVICIO = 100;

  const textFechas = document.getElementById("text-fechas");
  const textHuespedes = document.getElementById("text-huespedes");
  const textTipo = document.getElementById("text-tipo");
  const textNochesPrecio = document.getElementById("text-noches-precio");
  const textSubtotal = document.getElementById("text-subtotal");
  const textTotal = document.getElementById("text-total");

  function formatearHuespedes(reserva) {
    const partes = [];
    if (reserva.adultos) partes.push(`${reserva.adultos} ad`);
    if (reserva.ninos) partes.push(`${reserva.ninos} niño${reserva.ninos > 1 ? "s" : ""}`);
    if (reserva.bebes) partes.push(`${reserva.bebes} bebé${reserva.bebes > 1 ? "s" : ""}`);
    if (reserva.mascotas) partes.push(`${reserva.mascotas} mascota${reserva.mascotas > 1 ? "s" : ""}`);
    return partes.length ? partes.join(" · ") : "Sin huéspedes";
  }

  // ---- Cargar resumen desde el Paso 1 y 2 ----
  function cargarReserva() {
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    const noches = parseInt(reserva.noches) || 0;

    if (reserva.llegada && reserva.salida) {
      textFechas.textContent = `${reserva.llegada} - ${reserva.salida}`;
    }
    textHuespedes.textContent = formatearHuespedes(reserva);
    textTipo.textContent = reserva.tipoViaje || "Familiar";

    const subtotal = PRECIO_NOCHE * noches;
    const total = subtotal + LIMPIEZA + SERVICIO;
    textNochesPrecio.textContent = `S/ ${PRECIO_NOCHE} × ${noches} Noches`;
    textSubtotal.textContent = `S/${subtotal.toLocaleString("es-PE")}`;
    textTotal.textContent = `S/ ${total.toLocaleString("es-PE")}`;
  }

  // ---- Campos del formulario ----
  const campos = {
    nombres: document.getElementById("input-nombres"),
    apellido: document.getElementById("input-apellido"),
    email: document.getElementById("input-email"),
    telefono: document.getElementById("input-telefono"),
    tipoDocumento: document.getElementById("input-tipo-documento"),
    numeroDocumento: document.getElementById("input-numero-documento"),
    pais: document.getElementById("input-pais"),
    conociste: document.getElementById("input-conociste"),
    mensaje: document.getElementById("input-mensaje"),
  };
  const checkTerminos = document.getElementById("input-terminos");
  const checkboxTerms = document.querySelector(".checkbox_terms");

  function limpiarError(el) {
    const contenedor = el.closest(".fecha_input");
    if (contenedor) contenedor.classList.remove("campo_error");
  }

  ["nombres", "apellido", "email", "telefono", "numeroDocumento"].forEach((key) => {
    campos[key].addEventListener("input", () => limpiarError(campos[key]));
  });
  checkTerminos.addEventListener("change", () => checkboxTerms.classList.remove("campo_error"));

  function validarFormulario() {
    let valido = true;

    const requeridos = ["nombres", "apellido", "email", "telefono", "numeroDocumento"];
    requeridos.forEach((key) => {
      const el = campos[key];
      const contenedor = el.closest(".fecha_input");
      if (!el.value.trim()) {
        contenedor.classList.add("campo_error");
        valido = false;
      } else {
        contenedor.classList.remove("campo_error");
      }
    });

    // Validación simple de email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.value.trim());
    if (!emailValido) {
      campos.email.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }

    if (!checkTerminos.checked) {
      checkboxTerms.classList.add("campo_error");
      valido = false;
    }

    return valido;
  }

  // ---- Navegación ----
  document.getElementById("btn-volver-huespedes").addEventListener("click", function () {
    window.location.href = "huespedes.html";
  });

  document.getElementById("btn-continuar-pago").addEventListener("click", function () {
    if (!validarFormulario()) return;

    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    reserva.nombres = campos.nombres.value.trim();
    reserva.apellido = campos.apellido.value.trim();
    reserva.email = campos.email.value.trim();
    reserva.telefono = campos.telefono.value.trim();
    reserva.tipoDocumento = campos.tipoDocumento.value;
    reserva.numeroDocumento = campos.numeroDocumento.value.trim();
    reserva.pais = campos.pais.value;
    reserva.conociste = campos.conociste.value;
    reserva.mensaje = campos.mensaje.value.trim();
    localStorage.setItem("reserva", JSON.stringify(reserva));
    window.location.href = "pago.html";
  });

  // ---- Inicio ----
  cargarReserva();
});