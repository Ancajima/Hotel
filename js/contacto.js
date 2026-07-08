document.addEventListener("DOMContentLoaded", function () {
  const campos = {
    nombres: document.getElementById("input-nombres"),
    email: document.getElementById("input-email"),
    telefono: document.getElementById("input-telefono"),
    tema: document.getElementById("input-tema"),
    duda: document.getElementById("input-duda"),
  };
  const checkAcepto = document.getElementById("input-acepto-contacto");
  const checkboxTerms = document.querySelector(".checkbox_terms");
  const btnEnviar = document.getElementById("btn-enviar-mensaje");

  function limpiarError(el) {
    const contenedor = el.closest(".fecha_input");
    if (contenedor) contenedor.classList.remove("campo_error");
  }

  [campos.nombres, campos.email, campos.telefono, campos.duda].forEach((el) => {
    el.addEventListener("input", () => limpiarError(el));
  });
  checkAcepto.addEventListener("change", () => checkboxTerms.classList.remove("campo_error"));

  function validar() {
    let valido = true;

    [campos.nombres, campos.email, campos.telefono, campos.duda].forEach((el) => {
      const contenedor = el.closest(".fecha_input");
      if (!el.value.trim()) {
        contenedor.classList.add("campo_error");
        valido = false;
      } else {
        contenedor.classList.remove("campo_error");
      }
    });

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.value.trim());
    if (!emailValido) {
      campos.email.closest(".fecha_input").classList.add("campo_error");
      valido = false;
    }

    if (!checkAcepto.checked) {
      checkboxTerms.classList.add("campo_error");
      valido = false;
    }

    return valido;
  }

  btnEnviar.addEventListener("click", function () {
    if (!validar()) return;

    // Aquí se conectaría con el backend / servicio de email real
    console.log("Mensaje de contacto:", {
      nombres: campos.nombres.value.trim(),
      email: campos.email.value.trim(),
      telefono: campos.telefono.value.trim(),
      tema: campos.tema.value,
      duda: campos.duda.value.trim(),
    });

    btnEnviar.textContent = "¡Mensaje enviado!";
    btnEnviar.disabled = true;
  });
});