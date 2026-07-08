document.addEventListener("DOMContentLoaded", function () {

  // ---- Filtro por pills (selección única): zona, capacidad, categoría ----
  document.querySelectorAll("[data-pill-group]").forEach(function (group) {
    const pills = group.querySelectorAll(".pill");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        filtrarTarjetas(group);
      });
    });
  });

  function filtrarTarjetas(group) {
    const filtro = group.dataset.pillGroup; // "zona" | "categoria" | "capacidad"
    const activo = group.querySelector(".pill.active");
    const valor = activo ? activo.dataset.value : "todos";

    // Ocultar el contenedor columna (ej. .col-md-6) para evitar huecos en la rejilla
    document.querySelectorAll("[data-" + filtro + "]").forEach(function (card) {
      const cardValor = card.dataset[filtro];
      const mostrar = valor === "todos" || cardValor === valor;
      const wrapper = card.closest('[class*="col-"]') || card;
      wrapper.style.display = mostrar ? "" : "none";
    });
  }

  // ---- Checkboxes de zona (Hospedajes) ----
  // Nota: la gestión de checkboxes, slider y limpiar filtros se mueve a js/Hospedaje.js
});