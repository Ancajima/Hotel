document.addEventListener('DOMContentLoaded', function(){
  const catalogForm = document.querySelector('.catalog-search');
  const zonaChecks = Array.from(document.querySelectorAll('.filtro-zona-check'));
  const pills = Array.from(document.querySelectorAll('.capacity-pills .pill'));
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceRangeValue');
  const resultsCount = document.querySelector('.results-count');
  const limpiarBtn = document.getElementById('limpiarFiltros');
  const houseWrappers = Array.from(document.querySelectorAll('.col-house'));
  const houseCards = Array.from(document.querySelectorAll('.house-card'));
  const paginationContainer = document.querySelector('.pagination');
  let currentPage = 1;
  const itemsPerPage = 6;
  const originalOrder = houseWrappers.slice();
  const sortSelectElement = document.querySelector('.sort-select');

  function parsePrice(card){
    const priceEl = card.querySelector('.house-card-price strong');
    if(!priceEl) return Infinity;
    const txt = priceEl.textContent || '';
    const num = txt.replace(/[^0-9]/g,'');
    return num ? parseInt(num,10) : Infinity;
  }

  function parseGuests(card){
    const info = card.querySelector('.house-card-body p');
    if(!info) return 0;
    const m = info.textContent.match(/(\d+)/);
    return m ? parseInt(m[1],10) : 0;
  }

  function matchesDestination(card, query){
    if(!query) return true;
    query = query.trim().toLowerCase();
    const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const badge = (card.querySelector('.house-card-badge')?.textContent || '').toLowerCase();
    return title.includes(query) || badge.includes(query);
  }

  function getActiveCapacity(){
    const active = pills.find(p => p.classList.contains('active'));
    return active ? active.dataset.value : null;
  }

  function capacityMatches(card, capacityRange){
    if(!capacityRange) return true;
    const info = card.querySelector('.house-card-body p');
    if(!info) return true;
    const m = info.textContent.match(/(\d+)/);
    if(!m) return true;
    const guests = parseInt(m[1],10);
    const [min,max] = capacityRange.split('-').map(n=>parseInt(n,10));
    return guests >= min && guests <= max;
  }

  function updateResults(){
    const zonasActivas = zonaChecks.filter(c=>c.checked).map(c=>c.value);
    const destQuery = document.getElementById('cs-destino')?.value || '';
    const maxPrice = priceRange ? parseInt(priceRange.value,10) : Infinity;
    const guestsFilter = parseInt(document.getElementById('cs-huespedes')?.value || 0,10) || 0;
    const cap = getActiveCapacity();
    const matching = [];

    houseWrappers.forEach(wrapper=>{
      const card = wrapper.querySelector('.house-card');
      if(!card) return;
      const zona = card.dataset.zona || '';
      const price = parsePrice(card);
      const guests = parseGuests(card);
      let ok = true;
      if(zonasActivas.length && !zonasActivas.includes(zona)) ok = false;
      if(price > maxPrice) ok = false;
      if(!matchesDestination(card, destQuery)) ok = false;
      if(guestsFilter && guests < guestsFilter) ok = false;
      if(!capacityMatches(card, cap)) ok = false;
      if(ok) matching.push(wrapper);
    });

    if(sortSelectElement){
      const mode = sortSelectElement.value;
      if(mode === 'Menor precio'){
        matching.sort((a,b)=> parsePrice(a.querySelector('.house-card')) - parsePrice(b.querySelector('.house-card')));
      } else if(mode === 'Mayor precio'){
        matching.sort((a,b)=> parsePrice(b.querySelector('.house-card')) - parsePrice(a.querySelector('.house-card')));
      } else if(mode === 'Recomendados' || mode === 'Mejor calificados'){
        matching.sort((a,b)=> originalOrder.indexOf(a) - originalOrder.indexOf(b));
      }
    }

    houseWrappers.forEach(w=> w.style.display = 'none');
    const total = matching.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    if(currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    matching.forEach((w, idx) => {
      if(idx >= start && idx < end) w.style.display = '';
    });

    if(resultsCount) resultsCount.textContent = total + ' casas encontradas';
    renderPagination(total, totalPages);
  }

  function renderPagination(total, totalPages){
    if(!paginationContainer) return;
    paginationContainer.innerHTML = '';
    for(let i=1;i<=totalPages;i++){
      const li = document.createElement('li');
      li.className = 'page-item' + (i===currentPage ? ' active' : '');
      const a = document.createElement(i===currentPage ? 'span' : 'a');
      a.className = 'page-link';
      a.textContent = i;
      if(i!==currentPage) a.href = '#';
      a.addEventListener('click', function(e){ e.preventDefault(); currentPage = i; updateResults(); });
      li.appendChild(a);
      paginationContainer.appendChild(li);
    }
  }

  updateResults();
  attachCardReservationHandlers();

  zonaChecks.forEach(ch=> ch.addEventListener('change', function(){ currentPage = 1; updateResults(); }));
  if(priceRange){ priceRange.addEventListener('input', function(){ if(priceValue) priceValue.textContent = 'Hasta S/ ' + priceRange.value + ' / noche'; updateRangeBg(); currentPage = 1; updateResults(); }); }
  if(sortSelectElement){ sortSelectElement.addEventListener('change', function(){ currentPage = 1; updateResults(); }); }

  function updateRangeBg(){
    if(!priceRange) return;
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || 100;
    const val = parseFloat(priceRange.value);
    const pct = ((val - min) / (max - min)) * 100;
    priceRange.style.background = `linear-gradient(90deg, var(--color-primary-500) ${pct}%, #dceae4 ${pct}%)`;
    const thumbColor = (val >= max) ? '#ffffff' : getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim() || '#3f7464';
    priceRange.style.setProperty('--range-thumb-color', thumbColor);
  }
  updateRangeBg();

  pills.forEach(p=> p.addEventListener('click', function(){ pills.forEach(x=> x.classList.remove('active')); p.classList.add('active'); currentPage = 1; updateResults(); }));

  if(catalogForm){
    catalogForm.addEventListener('submit', function(e){
      e.preventDefault();
      const llegada = document.getElementById('cs-llegada').value;
      const salida = document.getElementById('cs-salida').value;
      const huespedes = parseInt(document.getElementById('cs-huespedes').value || 0,10);
      if(llegada && salida && new Date(llegada) > new Date(salida)){
        alert('La fecha de llegada debe ser anterior a la de salida.');
        return;
      }
      if(huespedes < 1){ alert('Cantidad de huéspedes inválida'); return; }
      currentPage = 1;
      updateResults();
      const grid = document.querySelector('.catalog-body');
      if(grid) grid.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  if(limpiarBtn){
    limpiarBtn.addEventListener('click', function(){
      zonaChecks.forEach(c=> c.checked = false);
      pills.forEach(p=> p.classList.remove('active'));
      if(priceRange){ priceRange.value = priceRange.max; if(priceValue) priceValue.textContent = 'Hasta S/ ' + priceRange.value + ' / noche'; }
      const dest = document.getElementById('cs-destino'); if(dest) dest.value = '';
      const llegada = document.getElementById('cs-llegada'); if(llegada) llegada.value = '';
      const salida = document.getElementById('cs-salida'); if(salida) salida.value = '';
      const hues = document.getElementById('cs-huespedes'); if(hues) hues.value = 2;
      if(sortSelectElement) sortSelectElement.selectedIndex = 0;
      currentPage = 1;
      updateResults();
    });
  }

  function attachCardReservationHandlers(){
    houseCards.forEach(card => {
      card.addEventListener('click', function(e){
        e.preventDefault();
        const houseName = card.querySelector('h3')?.textContent?.trim() || '';
        const houseZone = card.dataset.zona || '';
        const badgeText = card.querySelector('.house-card-badge')?.textContent?.trim() || houseZone;
        const houseImg = card.querySelector('img');
        const houseImgSrc = houseImg ? houseImg.src : '';
        const houseImgAlt = houseImg ? houseImg.alt : '';
        const housePrice = parsePrice(card);
        const detailsText = card.querySelector('.house-card-body p')?.textContent?.trim() || '';
        const guestsMatch = detailsText.match(/(\d+)\s*hu[eé]spedes?/i);
        const roomsMatch = detailsText.match(/(\d+)\s*habit(?:\.|aciones)?/i);
        const bathsMatch = detailsText.match(/(\d+)\s*baños?/i);
        const guestsCount = guestsMatch ? parseInt(guestsMatch[1], 10) : 0;
        const roomsCount = roomsMatch ? parseInt(roomsMatch[1], 10) : 0;
        const bathsCount = bathsMatch ? parseInt(bathsMatch[1], 10) : 0;
        const houseDescription = `Casa ${houseName} con ${roomsCount} habitaciones, ${bathsCount} baños y capacidad para ${guestsCount} huéspedes en ${houseZone}.`;
        const reserva = JSON.parse(localStorage.getItem('reserva')) || {};
        reserva.house = {
          name: houseName,
          zone: houseZone,
          badge: badgeText,
          price: housePrice,
          image: houseImgSrc,
          images: (card.dataset.images ? card.dataset.images.split(',') : [houseImgSrc, houseImgSrc, houseImgSrc, houseImgSrc, houseImgSrc]),
          imageAlt: houseImgAlt,
          guests: guestsCount,
          rooms: roomsCount,
          baths: bathsCount,
          details: detailsText,
          description: houseDescription,
        };
        localStorage.setItem('reserva', JSON.stringify(reserva));
        window.location.href = 'DetalleHospedaje.html';
      });
    });
  }

  pills.forEach(p=>{ p.setAttribute('tabindex', '0'); p.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); } }); });

  (function(){
    const links = document.querySelectorAll('nav a');
    const current = window.location.pathname.split('/').pop();
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('a_active', href.includes(current));
    });
  })();

});
