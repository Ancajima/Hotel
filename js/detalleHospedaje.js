document.addEventListener('DOMContentLoaded', function () {
  const stored = JSON.parse(localStorage.getItem('reserva') || '{}');
  const house = stored.house || {};

  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el && typeof text !== 'undefined' && text !== null) el.textContent = text;
  };

  const setAttr = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el && typeof value !== 'undefined') el.setAttribute(attr, value);
  };

  const formatMoney = (n) =>
    'S/ ' + Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });

  /* ---------------------------------------------------------------- */
  /* Datos generales del hospedaje                                     */
  /* ---------------------------------------------------------------- */
  setText('#detail-zone', house.badge || house.zone || 'Las Pocitas');
  setText('#detail-guests-count', house.guests || 12);
  setText('#detail-description', house.description);

  // Nombre: separa la última palabra para mantener el resaltado
  if (house.name) {
    const words = String(house.name).trim().split(' ');
    const last = words.pop();
    setText('#detail-name-main', words.join(' '));
    setText('#detail-name-highlight', last);
  }

  const nightlyPrice = Number(house.price) || 300;
  setText('#booking-price-amount', formatMoney(nightlyPrice));

  /* ---------------------------------------------------------------- */
  /* Galería: imagen principal + 2 miniaturas                          */
  /* ---------------------------------------------------------------- */
  if (house.image || house.images) {
    const main = document.querySelector('#detail-img-main');
    const top = document.querySelector('#detail-thumb-top');
    const bottom = document.querySelector('#detail-thumb-bottom');

    const imgs =
      Array.isArray(house.images) && house.images.length
        ? house.images
        : [house.image, house.image, house.image];

    if (main) {
      main.src = imgs[0];
      main.alt = house.imageAlt || house.name || 'Imagen principal';
    }
    if (top) {
      top.src = imgs[1] || imgs[0];
      top.alt = house.imageAlt || house.name || 'Miniatura superior';
    }
    if (bottom) {
      bottom.src = imgs[2] || imgs[0];
      bottom.alt = house.imageAlt || house.name || 'Miniatura inferior';
    }

    [top, bottom].forEach((thumb) => {
      if (!thumb || !main) return;
      thumb.style.cursor = 'pointer';
      thumb.addEventListener('click', function (e) {
        e.preventDefault();
        const tmpSrc = main.src;
        const tmpAlt = main.alt;
        main.src = thumb.src;
        main.alt = thumb.alt;
        thumb.src = tmpSrc;
        thumb.alt = tmpAlt;
      });
    });
  }

  // Modal "Ver 5 fotos"
  const overlay = document.querySelector('.gallery-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      e.preventDefault();
      const modalBody = document.querySelector('#galleryModalBody');
      if (!modalBody) return;

      let imgs = Array.isArray(house.images) && house.images.length ? house.images.slice() : [];

      if (!imgs.length) {
        const main = document.querySelector('#detail-img-main');
        const top = document.querySelector('#detail-thumb-top');
        const bottom = document.querySelector('#detail-thumb-bottom');
        [main, top, bottom].forEach((el) => el && imgs.push(el.src));
      }

      modalBody.innerHTML = '';
      imgs.forEach((src) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';
        const img = document.createElement('img');
        img.src = src;
        img.alt = house.name || 'Foto del hospedaje';
        img.className = 'img-fluid rounded';
        col.appendChild(img);
        modalBody.appendChild(col);
      });

      const modalEl = document.getElementById('galleryModal');
      if (modalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Formulario de reserva: cálculo dinámico + validaciones             */
  /* ---------------------------------------------------------------- */
  const form = document.querySelector('#booking-form');
  const checkinInput = document.querySelector('#checkin');
  const checkoutInput = document.querySelector('#checkout');
  const guestsSelect = document.querySelector('#guests');
  const errorBox = document.querySelector('#booking-error');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const summaryEl = document.querySelector('.booking-summary');

  const cleaningFee = summaryEl ? Number(summaryEl.dataset.cleaningFee) || 100 : 100;
  const serviceFee = summaryEl ? Number(summaryEl.dataset.serviceFee) || 50 : 50;

  const todayISO = () => new Date().toISOString().split('T')[0];

  if (checkinInput) checkinInput.min = todayISO();

  const showError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
  };

  const clearError = () => {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.classList.remove('is-visible');
  };

  const markInvalid = (input, invalid) => {
    if (!input) return;
    input.classList.toggle('is-invalid', !!invalid);
  };

  // Devuelve { valid, nights, checkin, checkout } sin bloquear la escritura,
  // solo usado para actualizar el resumen de precio en vivo.
  const getDatesInfo = () => {
    if (!checkinInput || !checkoutInput) return { valid: false, nights: 0 };

    const checkinVal = checkinInput.value;
    const checkoutVal = checkoutInput.value;

    if (!checkinVal || !checkoutVal) return { valid: false, nights: 0 };

    const checkin = new Date(checkinVal + 'T00:00:00');
    const checkout = new Date(checkoutVal + 'T00:00:00');
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkout - checkin) / msPerDay);

    if (Number.isNaN(nights) || nights <= 0) return { valid: false, nights: 0 };

    return { valid: true, nights, checkin, checkout };
  };

  const updateSummary = () => {
    const { valid, nights } = getDatesInfo();
    const effectiveNights = valid ? nights : 1;

    const subtotal = nightlyPrice * effectiveNights;
    const total = subtotal + cleaningFee + serviceFee;

    setText(
      '#summary-rate-label',
      `${formatMoney(nightlyPrice)} x ${effectiveNights} ${effectiveNights === 1 ? 'noche' : 'noches'}`
    );
    setText('#summary-rate-total', formatMoney(subtotal));
    setText('#summary-cleaning', formatMoney(cleaningFee));
    setText('#summary-service', formatMoney(serviceFee));
    setText('#summary-total', formatMoney(total));

    return { valid, nights: effectiveNights, total };
  };

  // Validación: salida no puede ser antes/igual que llegada,
  // y actualiza el mínimo permitido de la fecha de salida.
  const validateDates = ({ silent } = {}) => {
    markInvalid(checkinInput, false);
    markInvalid(checkoutInput, false);
    if (!silent) clearError();

    if (!checkinInput || !checkoutInput) return true;

    if (checkinInput.value) {
      const nextDay = new Date(checkinInput.value + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.min = nextDay.toISOString().split('T')[0];
    }

    if (!checkinInput.value || !checkoutInput.value) return true; // aún no completan, no marcar error

    const { valid } = getDatesInfo();
    if (!valid) {
      markInvalid(checkoutInput, true);
      if (!silent) showError('La fecha de salida debe ser posterior a la de llegada.');
      return false;
    }

    return true;
  };

  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', () => {
      validateDates();
      updateSummary();
    });
    checkoutInput.addEventListener('change', () => {
      validateDates();
      updateSummary();
    });
  }

  if (guestsSelect) {
    guestsSelect.addEventListener('change', updateSummary);
  }

  // Cálculo inicial (fechas vacías -> muestra 1 noche de referencia)
  updateSummary();

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();
      markInvalid(checkinInput, false);
      markInvalid(checkoutInput, false);

      if (!checkinInput.value) {
        markInvalid(checkinInput, true);
        showError('Selecciona una fecha de llegada.');
        checkinInput.focus();
        return;
      }

      if (!checkoutInput.value) {
        markInvalid(checkoutInput, true);
        showError('Selecciona una fecha de salida.');
        checkoutInput.focus();
        return;
      }

      if (!validateDates()) {
        checkoutInput.focus();
        return;
      }

      const { nights, total } = updateSummary();

      const reserva = {
        house: Object.assign({}, house, { price: nightlyPrice }),
        checkin: checkinInput.value,
        checkout: checkoutInput.value,
        nights,
        guests: guestsSelect ? guestsSelect.value : null,
        total,
      };

      try {
        localStorage.setItem('reserva', JSON.stringify(reserva));
      } catch (err) {
        console.error('No se pudo guardar la reserva en localStorage:', err);
      }

      if (submitBtn) submitBtn.disabled = true;
      window.location.href = '../pag/procesoReserva/fecha.html';
    });
  }
});