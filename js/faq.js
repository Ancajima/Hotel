document.addEventListener("DOMContentLoaded", function () {

    /* ==========================================
       ACORDEÓN: abrir / cerrar preguntas
    ========================================== */

    const filas = document.querySelectorAll(".faq-row");

    filas.forEach((fila) => {
        const boton = fila.querySelector(".faq-row-question");
        const respuesta = fila.querySelector(".faq-row-answer");
        const icono = fila.querySelector(".faq-row-icon");

        boton.addEventListener("click", () => {
            const estaAbierta = fila.classList.contains("open");

            if (estaAbierta) {
                fila.classList.remove("open");
                respuesta.style.maxHeight = null;
                boton.setAttribute("aria-expanded", "false");
                icono.classList.remove("bi-dash");
                icono.classList.add("bi-plus");
            } else {
                fila.classList.add("open");
                respuesta.style.maxHeight = respuesta.scrollHeight + "px";
                boton.setAttribute("aria-expanded", "true");
                icono.classList.remove("bi-plus");
                icono.classList.add("bi-dash");
            }
        });
    });

    // Deja abierta la primera pregunta de la primera categoría (como en el diseño)
    const primeraFila = document.querySelector(".faq-row.open .faq-row-answer");
    if (primeraFila) {
        primeraFila.style.maxHeight = primeraFila.scrollHeight + "px";
    }

    /* ==========================================
       SIDEBAR: navegación entre categorías
    ========================================== */

    const linksCategoria = document.querySelectorAll(".faq-cat-link");
    const secciones = document.querySelectorAll(".faq-category-section");

    linksCategoria.forEach((link) => {
        link.addEventListener("click", () => {
            const destino = document.getElementById(link.getAttribute("data-target"));

            linksCategoria.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");

            if (destino) {
                destino.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Resalta la categoría activa según la sección visible al hacer scroll
    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    const id = entrada.target.id;
                    linksCategoria.forEach((link) => {
                        link.classList.toggle("active", link.getAttribute("data-target") === id);
                    });
                }
            });
        },
        { rootMargin: "-15% 0px -70% 0px" }
    );

    secciones.forEach((seccion) => observador.observe(seccion));

    /* ==========================================
       BUSCADOR EN VIVO
    ========================================== */

    const inputBusqueda = document.getElementById("faq-search-input");
    const mensajeSinResultados = document.getElementById("faq-no-results");

    inputBusqueda.addEventListener("input", () => {
        const termino = inputBusqueda.value.trim().toLowerCase();
        let totalVisibles = 0;

        secciones.forEach((seccion) => {
            let visiblesEnSeccion = 0;
            const filasSeccion = seccion.querySelectorAll(".faq-row");

            filasSeccion.forEach((fila) => {
                const pregunta = fila.querySelector(".faq-row-question span").textContent.toLowerCase();
                const respuesta = fila.querySelector(".faq-row-answer").textContent.toLowerCase();
                const coincide = pregunta.includes(termino) || respuesta.includes(termino);

                fila.classList.toggle("hidden-by-search", !coincide);
                if (coincide) visiblesEnSeccion++;
            });

            seccion.classList.toggle("hidden-by-search", visiblesEnSeccion === 0);
            totalVisibles += visiblesEnSeccion;
        });

        mensajeSinResultados.classList.toggle("show", totalVisibles === 0 && termino !== "");
    });
});