document.addEventListener("DOMContentLoaded", function () {
  // ---- Configuración ----
  const MAX_HUESPEDES = 12; // adultos + niños
  const limites = {
    adultos: { min: 1, max: MAX_HUESPEDES },
    ninos: { min: 0, max: MAX_HUESPEDES },
    bebes: { min: 0, max: 5 },
    mascotas: { min: 0, max: 3 },
  };
  const PRECIO_NOCHE = 300;
  const LIMPIEZA = 350;
  const SERVICIO = 100;
 
  const counts = { adultos: 1, ninos: 0, bebes: 0, mascotas: 0 };
  let tipoSeleccionado = "Familiar";
 
  // ---- Referencias ----
  const valores = {
    adultos: document.getElementById("count-adultos"),
    ninos: document.getElementById("count-ninos"),
    bebes: document.getElementById("count-bebes"),
    mascotas: document.getElementById("count-mascotas"),
  };
 
  const textFechas = document.getElementById("text-fechas");
  const textHuespedes = document.getElementById("text-huespedes");
  const textTipo = document.getElementById("text-tipo");
  const textNochesPrecio = document.getElementById("text-noches-precio");
  const textSubtotal = document.getElementById("text-subtotal");
  const textTotal = document.getElementById("text-total");
 
  // ---- Contadores ----
  function actualizarBotones() {
    document.querySelectorAll(".counter_btn").forEach((btn) => {
      const target = btn.dataset.target;
      const { min, max } = limites[target];
      if (btn.dataset.action === "decrement") {
        btn.disabled = counts[target] <= min;
      } else {
        const esGrupoPrincipal = target === "adultos" || target === "ninos";
        btn.disabled = esGrupoPrincipal
          ? counts.adultos + counts.ninos >= MAX_HUESPEDES
          : counts[target] >= max;
      }
    });
  }
 
  function formatearHuespedes() {
    const partes = [];
    if (counts.adultos > 0) partes.push(`${counts.adultos} ad`);
    if (counts.ninos > 0) partes.push(`${counts.ninos} niño${counts.ninos > 1 ? "s" : ""}`);
    if (counts.bebes > 0) partes.push(`${counts.bebes} bebé${counts.bebes > 1 ? "s" : ""}`);
    if (counts.mascotas > 0) partes.push(`${counts.mascotas} mascota${counts.mascotas > 1 ? "s" : ""}`);
    return partes.length ? partes.join(" · ") : "Sin huéspedes";
  }
 
  function actualizarResumen() {
    textHuespedes.textContent = formatearHuespedes();
    textTipo.textContent = tipoSeleccionado;
  }
 
  function actualizarVista() {
    Object.keys(valores).forEach((key) => {
      valores[key].textContent = counts[key];
    });
    actualizarBotones();
    actualizarResumen();
  }
 
  document.querySelectorAll(".counter_btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = this.dataset.target;
      const { min, max } = limites[target];
      const esGrupoPrincipal = target === "adultos" || target === "ninos";
 
      if (this.dataset.action === "increment") {
        if (esGrupoPrincipal && counts.adultos + counts.ninos < MAX_HUESPEDES) {
          counts[target]++;
        } else if (!esGrupoPrincipal && counts[target] < max) {
          counts[target]++;
        }
      } else if (counts[target] > min) {
        counts[target]--;
      }
 
      actualizarVista();
    });
  });
 
  // ---- Tipo de viaje ----
  const botonesTipo = document.querySelectorAll(".btn_tipo_viaje");
  botonesTipo.forEach((btn) => {
    btn.addEventListener("click", function () {
      botonesTipo.forEach((b) => b.classList.remove("btn_tipo_viaje_active"));
      this.classList.add("btn_tipo_viaje_active");
      tipoSeleccionado = this.dataset.tipo;
      actualizarResumen();
    });
  });
 
  // ---- Cargar datos guardados del Paso 1 (Fechas) ----
  function cargarReserva() {
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    const noches = parseInt(reserva.noches) || 0;

    if (reserva.llegada && reserva.salida) {
      textFechas.textContent = `${reserva.llegada} - ${reserva.salida}`;
    }

    const subtotal = PRECIO_NOCHE * noches;
    const total = subtotal + LIMPIEZA + SERVICIO;
    textNochesPrecio.textContent = `S/ ${PRECIO_NOCHE} × ${noches} Noches`;
    textSubtotal.textContent = `S/${subtotal.toLocaleString("es-PE")}`;
    textTotal.textContent = `S/ ${total.toLocaleString("es-PE")}`;
  }

  function loadSelectedHouse() {
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    if (!reserva.house) return;
    const houseNameEl = document.getElementById("house-name");
    const houseDetailsEl = document.getElementById("house-details");
    const houseImageEl = document.getElementById("house-image");
    if (houseNameEl) houseNameEl.textContent = reserva.house.name || houseNameEl.textContent;
    if (houseDetailsEl) {
      const zoneLabel = reserva.house.zone ? reserva.house.zone.replace(/\b\w/g, l => l.toUpperCase()) : "";
      houseDetailsEl.textContent = `${zoneLabel} - Hasta 12 huéspedes`;
    }
    if (houseImageEl && reserva.house.image) {
      houseImageEl.src = reserva.house.image;
      houseImageEl.alt = reserva.house.imageAlt || reserva.house.name || houseImageEl.alt;
    }
  }

  // ---- Navegación ----
  document.getElementById("btn-volver-fecha").addEventListener("click", function () {
    window.location.href = "fecha.html";
  });
 
  document.getElementById("btn-continuar-datos").addEventListener("click", function () {
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    reserva.adultos = counts.adultos;
    reserva.ninos = counts.ninos;
    reserva.bebes = counts.bebes;
    reserva.mascotas = counts.mascotas;
    reserva.tipoViaje = tipoSeleccionado;
    localStorage.setItem("reserva", JSON.stringify(reserva));
    window.location.href = "datos.html";
  });
 
  // ---- Inicio ----
  cargarReserva();
  actualizarVista();
});