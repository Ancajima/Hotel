document.addEventListener("DOMContentLoaded", function () {
  const reserva = JSON.parse(localStorage.getItem("reserva")) || {};

  const textNombre = document.getElementById("text-nombre-huesped");
  const textRango = document.getElementById("text-rango-fechas");
  const textCodigo = document.getElementById("text-codigo-reserva");

  if (reserva.nombres) {
    textNombre.textContent = reserva.nombres;
  }

  if (reserva.llegada && reserva.salida) {
    const diaLlegada = reserva.llegada.split(" ")[0];
    textRango.textContent = `${diaLlegada} al ${reserva.salida}`;
  }

  // Genera (o reutiliza) un código de reserva único para esta sesión
  function generarCodigo() {
    const anio = new Date().getFullYear();
    const numero = Math.floor(1000 + Math.random() * 9000);
    return `MS-${anio}-${numero}-SIR`;
  }

  if (!reserva.codigoReserva) {
    reserva.codigoReserva = generarCodigo();
    localStorage.setItem("reserva", JSON.stringify(reserva));
  }
  textCodigo.textContent = reserva.codigoReserva;

  document.getElementById("btn-ver-reserva").addEventListener("click", function () {
    window.location.href = "#";
  });

  document.getElementById("btn-descargar-voucher").addEventListener("click", function () {
    window.print();
  });

  document.getElementById("btn-whatsapp").addEventListener("click", function () {
    const mensaje = encodeURIComponent(
      `Hola, tengo una consulta sobre mi reserva ${reserva.codigoReserva || ""} en Casa Sirena.`
    );
    window.open(`https://wa.me/51973208679?text=${mensaje}`, "_blank");
  });
});