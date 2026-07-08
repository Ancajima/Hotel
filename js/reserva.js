document.addEventListener("DOMContentLoaded", function () {
  const inputLlegada = document.getElementById("input-llegada");
  const inputSalida = document.getElementById("input-salida");
  const textNoches = document.getElementById("text-noches");
  const textSalida = document.getElementById("text-salida");
  const textLlegada = document.getElementById("text-llegada");
  const textNochesPrecio = document.getElementById("text-noches-precio");
  const textSubtotal = document.getElementById("text-subtotal");
  const textTotal = document.getElementById("text-total");
  const PRECIO_NOCHE = 300;
  const LIMPIEZA = 350;
  const SERVICIO = 100;

  // Inicializar Flatpickr
  flatpickr("#flatpickr-inline", {
    inline: true, // Siempre visible
    mode: "range", // Permite seleccionar inicio y fin
    locale: "es", // Idioma español
    minDate: "today", // No permite seleccionar fechas pasadas
    showMonths: window.innerWidth > 768 ? 2 : 1, // 2 meses en PC, 1 en móvil

    // Esta función se ejecuta cada vez que el usuario hace clic en una fecha
    onChange: function (selectedDates, dateStr, instance) {
      const opcionesFormato = { day: "numeric", month: "long" };

      // Si hay al menos una fecha seleccionada (Llegada)
      if (selectedDates.length > 0) {
        inputLlegada.value = selectedDates[0].toLocaleDateString(
          "es-ES",
          opcionesFormato,
        );
        textLlegada.textContent = selectedDates[0].toLocaleDateString(
          "es-ES",
          opcionesFormato,
        );
      } else {
        inputLlegada.value = "";
      }

      // Si se seleccionó el rango completo (Llegada y Salida)
      if (selectedDates.length === 2) {
        inputSalida.value = selectedDates[1].toLocaleDateString(
          "es-ES",
          opcionesFormato,
        );
        textSalida.textContent = selectedDates[1].toLocaleDateString(
          "es-ES",
          opcionesFormato,
        );
        const fechaLlegada = selectedDates[0];
        const fechaSalida = selectedDates[1];
        const milisegundosPorDia = 1000 * 60 * 60 * 24;
        const noches = Math.round(
          Math.abs((fechaSalida - fechaLlegada) / milisegundosPorDia),
        );
        textNoches.textContent = noches;
        const subtotal = PRECIO_NOCHE * noches;
        const total = subtotal + LIMPIEZA + SERVICIO;
        textNochesPrecio.textContent = `S/ ${PRECIO_NOCHE} × ${noches} Noches`;
        textSubtotal.textContent = `S/${subtotal.toLocaleString("es-PE")}`;
        textTotal.textContent = `S/ ${total.toLocaleString("es-PE")}`;
        
      } else {
        inputSalida.value = "";
      }
    },
  });

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

  document.querySelector(".btn-primary").addEventListener("click", function () {
    if (!inputLlegada.value || !inputSalida.value) {
      alert("Selecciona tus fechas de llegada y salida");
      return;
    }
    const reserva = JSON.parse(localStorage.getItem("reserva")) || {};
    reserva.llegada = inputLlegada.value;
    reserva.salida = inputSalida.value;
    reserva.noches = textNoches.textContent;
    localStorage.setItem("reserva", JSON.stringify(reserva));
    window.location.href = "huespedes.html";
  });

  loadSelectedHouse();
});
