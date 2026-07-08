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
  const textPagasHoy = document.getElementById("text-pagas-hoy");
  const textCobroHoy = document.getElementById("text-cobro-hoy");
  const textCobroSaldo = document.getElementById("text-cobro-saldo");
  const textFechaSaldo = document.getElementById("text-fecha-saldo");
  const btnPagar = document.getElementById("btn-pagar");
 
  function formatearHuespedes(reserva) {
    const partes = [];
    if (reserva.adultos) partes.push(`${reserva.adultos} ad`);
    if (reserva.ninos) partes.push(`${reserva.ninos} niño${reserva.ninos > 1 ? "s" : ""}`);
    if (reserva.bebes) partes.push(`${reserva.bebes} bebé${reserva.bebes > 1 ? "s" : ""}`);
    if (reserva.mascotas) partes.push(`${reserva.mascotas} mascota${reserva.mascotas > 1 ? "s" : ""}`);
    return partes.length ? partes.join(" · ") : "Sin huéspedes";
  }
 
  // Convierte "17 de agosto" -> objeto Date (año actual)
  function parseFechaEsp(str) {
    if (!str) return null;
    const meses = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
      noviembre: 10, diciembre: 11,
    };
    const match = str.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)/);
    if (!match) return null;
    const dia = parseInt(match[1]);
    const mes = meses[match[2]];
    if (mes === undefined) return null;
    return new Date(new Date().getFullYear(), mes, dia);
  }
 
  let total = 450;
  let reservaData = {};
 
  function cargarReserva() {
    reservaData = JSON.parse(localStorage.getItem("reserva")) || {};
    const noches = parseInt(reservaData.noches) || 0;
 
    if (reservaData.llegada && reservaData.salida) {
      textFechas.textContent = `${reservaData.llegada} - ${reservaData.salida}`;
    }
    textHuespedes.textContent = formatearHuespedes(reservaData);
    textTipo.textContent = reservaData.tipoViaje || "Familiar";
 
    const subtotal = PRECIO_NOCHE * noches;
    total = subtotal + LIMPIEZA + SERVICIO;
    textNochesPrecio.textContent = `S/ ${PRECIO_NOCHE} × ${noches} Noches`;
    textSubtotal.textContent = `S/${subtotal.toLocaleString("es-PE")}`;
    textTotal.textContent = `S/ ${total.toLocaleString("es-PE")}`;
 
    const mitad = Math.round(total / 2);
    const saldo = total - mitad;
 
    textPagasHoy.textContent = `S/${mitad.toLocaleString("es-PE")}`;
    textCobroHoy.textContent = `S/ ${mitad.toLocaleString("es-PE")}`;
    textCobroSaldo.textContent = `S/ ${saldo.toLocaleString("es-PE")}`;
    btnPagar.textContent = `Pagar S/ ${mitad.toLocaleString("es-PE")} y Reservar`;
 
    // Fecha del cobro del saldo (7 días antes del check-out)
    const salidaDate = parseFechaEsp(reservaData.salida);
    if (salidaDate) {
      const saldoDate = new Date(salidaDate);
      saldoDate.setDate(saldoDate.getDate() - 7);
      const fechaFormateada = saldoDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
      textFechaSaldo.textContent = `${fechaFormateada} · 7 días antes`;
    }
  }
 
  // ---- Selección de método de pago ----
  const tarjetasMetodo = document.querySelectorAll(".metodo_pago_card");
  const camposTarjeta = document.getElementById("campos-tarjeta");
  const mensajeOtroMetodo = document.getElementById("mensaje-otro-metodo");
 
  function actualizarMetodoSeleccionado() {
    const seleccionado = document.querySelector('input[name="metodoPago"]:checked').value;
 
    tarjetasMetodo.forEach((card) => {
      const radio = card.querySelector('input[type="radio"]');
      card.classList.toggle("metodo_pago_active", radio.checked);
    });
 
    // OJO: #campos-tarjeta tiene la clase Bootstrap "d-flex", que aplica
    // "display: flex !important". Un style.display inline no puede ganarle
    // a ese !important, así que hay que alternar las clases directamente.
    const esTarjeta = seleccionado === "tarjeta";
    camposTarjeta.classList.toggle("d-flex", esTarjeta);
    camposTarjeta.classList.toggle("d-none", !esTarjeta);
    mensajeOtroMetodo.classList.toggle("d-none", esTarjeta);
    mensajeOtroMetodo.classList.toggle("d-block", !esTarjeta);
  }
 
  tarjetasMetodo.forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');
    radio.addEventListener("change", actualizarMetodoSeleccionado);
  });
 
  // ---- Formateo de campos de tarjeta ----
  const inputNumeroTarjeta = document.getElementById("input-numero-tarjeta");
  inputNumeroTarjeta.addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = valor.replace(/(.{4})/g, "$1 ").trim();
  });
 
  const inputVencimiento = document.getElementById("input-vencimiento");
  inputVencimiento.addEventListener("input", function () {
    let valor = this.value.replace(/\D/g, "").slice(0, 4);
    if (valor.length > 2) {
      valor = `${valor.slice(0, 2)} / ${valor.slice(2)}`;
    }
    this.value = valor;
  });
 
  const inputCvv = document.getElementById("input-cvv");
  inputCvv.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 4);
  });
 
  // ---- Validación y envío ----
  function limpiarError(el) {
    el.closest(".fecha_input").classList.remove("campo_error");
  }
  [inputNumeroTarjeta, inputVencimiento, inputCvv, document.getElementById("input-titular")].forEach((el) => {
    el.addEventListener("input", () => limpiarError(el));
  });
 
  function validarPago() {
    const seleccionado = document.querySelector('input[name="metodoPago"]:checked').value;
    if (seleccionado !== "tarjeta") return true;
 
    let valido = true;
    const numeroTarjeta = inputNumeroTarjeta.value.replace(/\s/g, "");
    const vencimiento = inputVencimiento.value.trim();
    const cvv = inputCvv.value.trim();
    const titular = document.getElementById("input-titular");
 
    if (numeroTarjeta.length < 15) {
      inputNumeroTarjeta.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }
    if (!/^\d{2}\s\/\s\d{2}$/.test(vencimiento)) {
      inputVencimiento.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }
    if (cvv.length < 3) {
      inputCvv.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }
    if (!titular.value.trim()) {
      titular.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }
 
    return valido;
  }
 
  document.getElementById("btn-volver-datos").addEventListener("click", function () {
    window.location.href = "datos.html";
  });
 
  btnPagar.addEventListener("click", function () {
    if (!validarPago()) return;
 
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    reserva.metodoPago = metodoPago;
    reserva.montoPagadoHoy = Math.round(total / 2);
    reserva.montoTotal = total;
    localStorage.setItem("reserva", JSON.stringify(reserva));
    window.location.href = "confirmacion.html";
  });
 
  // ---- Inicio ----
  cargarReserva();
  actualizarMetodoSeleccionado();
});