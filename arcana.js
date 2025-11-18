// Mobile-first Arcana roller
(function(){
  const TYPES = [
    {key:'vinculo', label:'VÍNCULO', faces:['❤️','🎁','✉️','📷','🚗', '🛶']},
    {key:'camino', label:'CAMINO', faces:['➡️','🌠','🏛️','🔥','🛋️', '🚲']},
    {key:'desafio', label:'DESAFÍO', faces:['⛰️','🌧️','🌳','🔒','🔨', '🎯']},
    {key:'idea', label:'IDEA', faces:['💡','📎','🍰','🐦','🔭', '☂️']},
    {key:'identidad', label:'IDENTIDAD', faces:['👣','🖌️','🩺','⛺','☎️', '🏆']},
    {key:'impulso', label:'SENSORIAL', faces:['🏠','⤴️','💎','⚽','🎥', '🏖️']},
    {key:'impulso', label:'IMPULSO', faces:['🎵','✈️','⏱️','🔧','✉️', '🎈']},
    {key:'verdad', label:'VERDAD', faces:['🔑','🐈','🔍','🏭','☀️', '📏']},
    {key:'destino', label:'DESTINO', faces:['🔦','🗼','🌍','🐕','🍽️', '⛵']}
  ];

  const INFO = {
    vinculo: 'Relaciones, afecto, memoria, movimiento emocional.',
    camino: 'Destino, decisiones, refugio/peligro, búsqueda interior.',
    desafio: 'Obstáculos, trauma, resistencia, disciplina.',
    idea: 'Inspiración, comunicación, protección, revelaciones.',
    identidad: 'Profesión, rol, propósito, vocación, huella personal.',
    sensorial: 'Entorno físico, hogar, lujo, viaje, ocio, textura del mundo.',
    impulso: 'Acción, tiempo, reparación, comunicación, celebración.',
    verdad: 'Revelación, normas, investigación, producción, autenticidad interior.',
    destino: 'Camino vital, caída, exploración, lealtad, viaje y consecuencias.'
  };

  const MAX = 9;

  const newRollBtn = document.getElementById('newRoll');
  const picker = document.getElementById('picker');
  const typesGrid = document.getElementById('typesGrid');
  const rollBtn = document.getElementById('rollBtn');
  const results = document.getElementById('results');
  const resultsGrid = document.getElementById('resultsGrid');
  const backBtn = document.getElementById('backBtn');
  const againBtn = document.getElementById('againBtn');
  // detail overlay will be created dynamically to avoid any initial DOM blocking

  let selected = new Set();

  function createTypeNode(t){
    const el = document.createElement('button');
    el.className = 'type';
    el.setAttribute('data-key', t.key);
    el.setAttribute('role','listitem');
    el.innerHTML = `<div class="emoji">${t.faces[0]}</div><div class="label">${t.label}</div>`;
    el.addEventListener('click', ()=> toggleSelect(t.key, el));
    return el;
  }

  function toggleSelect(key, el){
    if(selected.has(key)){
      selected.delete(key);
      el.classList.remove('selected');
    }else{
      if(selected.size >= MAX) return flashMax(el);
      selected.add(key);
      el.classList.add('selected');
    }
    updateAction();
  }

  function flashMax(el){
    el.animate([{transform:'scale(1)'},{transform:'scale(.98)'},{transform:'scale(1)'}],{duration:220});
  }

  function updateAction(){
    // no disabling of the always-visible roll button; keep it clickable
    // optionally update a data attribute for styling
    document.body.dataset.selected = selected.size;
  }

  function openPicker(){
    picker.classList.remove('hidden');
    picker.setAttribute('aria-hidden','false');
    picker.querySelector('.panel-inner').style.transform = 'translateY(0)';
    setTimeout(()=> typesGrid.querySelector('.type')?.focus(),220);
  }

  function closePicker(){
    picker.classList.add('hidden');
    picker.setAttribute('aria-hidden','true');
  }

  function openDetail(key, face, label){
    const info = INFO[key] || '';
    // create overlay elements dynamically
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.tabIndex = -1;

    const card = document.createElement('div');
    card.className = 'detail-card';
    card.setAttribute('role','dialog');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn tertiary';
    closeBtn.textContent = 'Cerrar';

    const content = document.createElement('div');
    content.className = 'detail-content';
    content.innerHTML = `<div style="font-size:48px;margin-bottom:8px">${face}</div><div style="font-weight:800;margin-bottom:6px">${label}</div><div>${info}</div>`;

    card.appendChild(closeBtn);
    card.appendChild(content);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    function removeOverlay(){
      if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    // close when background clicked
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) removeOverlay();
    });
    closeBtn.addEventListener('click', ()=> removeOverlay());
  }

  function showResults(rolls){
    resultsGrid.innerHTML = '';
    const n = rolls.length;
    let cols = 2;
    if(n<=2) cols = n;
    else if(n<=4) cols = 2;
    else if(n<=6) cols = 3;
    else cols = 3;
    resultsGrid.style.gridTemplateColumns = `repeat(${cols},1fr)`;

    rolls.forEach((r,i)=>{
      const c = document.createElement('div');
      c.className = 'result-card';
      c.setAttribute('data-key', r.key);
      c.innerHTML = `<div class="emoji">${r.face}</div><div class="label">${r.label}</div>`;
      c.style.opacity = '0';
      resultsGrid.appendChild(c);
      setTimeout(()=>{
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, 80 + i*80);

      // open detail when tapping a result
      c.addEventListener('click', ()=> openDetail(r.key, r.face, r.label));
    });

    results.classList.remove('hidden');
    results.setAttribute('aria-hidden','false');
  }

  function hideResults(){
    results.classList.add('hidden');
    results.setAttribute('aria-hidden','true');
  }

  function roll(){
    const keys = Array.from(selected);
    if(keys.length===0) return openPicker();
    const rolls = keys.map(k=>{
      const t = TYPES.find(x=>x.key===k);
      const face = t.faces[Math.floor(Math.random()*t.faces.length)];
      return {key:t.key,label:t.label,face};
    });

    closePicker();
    setTimeout(()=> showResults(rolls), 260);
  }

  function reset(){
    selected.clear();
    typesGrid.querySelectorAll('.type').forEach(n=>n.classList.remove('selected'));
    updateAction();
    hideResults();
  }

  // build types
  TYPES.forEach(t=> typesGrid.appendChild(createTypeNode(t)));

  newRollBtn.addEventListener('click', ()=>{
    reset();
    openPicker();
  });

  // The visible purple TIRAR button: open picker if nothing selected, otherwise roll
  if(rollBtn){
    rollBtn.addEventListener('click', ()=>{
      if(selected.size===0) openPicker();
      else roll();
    });
  }
  backBtn.addEventListener('click', ()=>{
    hideResults();
    openPicker();
  });
  againBtn.addEventListener('click', ()=>{
    reset();
    openPicker();
  });

  // FAQ toggle (single button)
  const faqToggle = document.getElementById('faqToggle');
  const faqContent = document.getElementById('faqContent');
  if(faqToggle && faqContent){
    faqToggle.addEventListener('click', ()=>{
      const hidden = faqContent.classList.toggle('hidden');
      faqContent.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      faqToggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    });
  }

  // Accessibility: allow Enter/Space on type buttons
  typesGrid.addEventListener('keydown', (e)=>{
    const t = e.target.closest('.type');
    if(!t) return;
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      t.click();
    }
  });

})();
