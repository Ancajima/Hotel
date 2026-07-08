document.addEventListener('DOMContentLoaded', function(){
  const pillGroup = document.querySelector('.category-filter-pills');
  if(!pillGroup) return;
  const pills = Array.from(pillGroup.querySelectorAll('.pill'));
  const cards = Array.from(document.querySelectorAll('.experience-card'));

  // compute counts per category
  const counts = {};
  cards.forEach(c=>{ const cat = c.dataset.categoria || 'otros'; counts[cat] = (counts[cat]||0) + 1; });

  // update pill labels to include counts when available
  pills.forEach(p=>{
    const val = p.dataset.value;
    if(!val) return;
    if(val === 'todos'){
      // total
      const total = cards.length;
      p.textContent = 'Todos';
      const span = document.createElement('span'); span.style.marginLeft='6px'; span.style.opacity='.9'; span.textContent = '';
      p.appendChild(span);
    } else {
      const n = counts[val] || 0;
      p.textContent = p.textContent.split('·')[0].trim();
      p.textContent = p.textContent + ' · ' + n;
    }
  });

  function filterBy(value){
    const wrappers = Array.from(document.querySelectorAll('.col-house'));
    if(value === 'todos'){
      wrappers.forEach(w=> w.style.display = '');
      return;
    }
    wrappers.forEach(w=>{
      const card = w.querySelector('.experience-card');
      if(!card) return;
      const cat = card.dataset.categoria || '';
      w.style.display = (cat === value) ? '' : 'none';
    });
  }

  // ensure single-select behavior
  pills.forEach(p=>{
    p.setAttribute('tabindex','0');
    p.addEventListener('click', function(){
      pills.forEach(x=> x.classList.remove('active'));
      p.classList.add('active');
      filterBy(p.dataset.value);
    });
    p.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); } });
  });

  // initial state: active pill = first with class active or 'todos'
  const active = pills.find(p=> p.classList.contains('active')) || pills[0];
  if(active){ active.classList.add('active'); filterBy(active.dataset.value); }

});
