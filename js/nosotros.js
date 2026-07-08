document.addEventListener("DOMContentLoaded", function () {
  const track = document.getElementById("equipo-track");
  const btnPrev = document.getElementById("btn-equipo-prev");
  const btnNext = document.getElementById("btn-equipo-next");
  if (!track) return;

  const tarjetas = Array.from(track.children);
  let indice = 0;

  function tarjetasPorVista() {
    if (window.innerWidth <= 575.98) return 1;
    if (window.innerWidth <= 991.98) return 2;
    return 3;
  }

  function actualizarCarrusel() {
    const porVista = tarjetasPorVista();
    const maxIndice = Math.max(0, tarjetas.length - porVista);

    // Si la ventana creció y el índice actual ya no es válido, lo ajustamos
    if (indice > maxIndice) indice = maxIndice;

    const porcentaje = (100 / porVista) * indice;
    track.style.transform = `translateX(-${porcentaje}%)`;

    btnPrev.disabled = indice === 0;
    btnNext.disabled = indice >= maxIndice;
  }

  btnPrev.addEventListener("click", function () {
    if (indice > 0) {
      indice--;
      actualizarCarrusel();
    }
  });

  btnNext.addEventListener("click", function () {
    const maxIndice = Math.max(0, tarjetas.length - tarjetasPorVista());
    if (indice < maxIndice) {
      indice++;
      actualizarCarrusel();
    }
  });

  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(actualizarCarrusel, 150);
  });

  actualizarCarrusel();
});