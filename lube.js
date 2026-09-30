/* LUBE — capa visual. Reorganiza la navbar en menús y añade el brillo que sigue al mouse.
   Se carga DESPUÉS de app.js: mueve los enlaces existentes (con sus eventos) sin duplicarlos. */
(function () {
  function buildNav() {
    var ul = document.getElementById('navLinks');
    if (!ul || ul.getAttribute('data-lube')) return;
    ul.setAttribute('data-lube', '1');
    var byView = {};
    ul.querySelectorAll('a[data-view]').forEach(function (a) { byView[a.getAttribute('data-view')] = a.parentNode; });
    var groups = [
      ['Tarot', ['signal', 'tirada', 'cards']],
      ['Astrolog\u00eda', ['zodiac', 'houses', 'planets', 'elements', 'modalidades']],
      ['Mi carta', ['natal', 'horoscope', 'compatibility']]
    ];
    groups.forEach(function (g) {
      var li = document.createElement('li'); li.className = 'lube-group';
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'lube-gbtn';
      btn.innerHTML = g[0] + ' <i>\u25BC</i>';
      var drop = document.createElement('ul'); drop.className = 'lube-drop';
      g[1].forEach(function (k) { if (byView[k]) drop.appendChild(byView[k]); });
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var was = li.classList.contains('open');
        document.querySelectorAll('.lube-group.open').forEach(function (x) { x.classList.remove('open'); });
        if (!was) li.classList.add('open');
      });
      li.appendChild(btn); li.appendChild(drop); ul.appendChild(li);
    });
    var right = document.createElement('div'); right.className = 'lube-right';
    var nav = document.getElementById('navbar');
    var acc = document.getElementById('accountBtn');
    var prof = document.getElementById('navProfile');
    var tog = document.getElementById('navToggle');
    if (acc) { var accLi = acc.parentNode; right.appendChild(acc); if (accLi && accLi.tagName === 'LI' && !accLi.children.length) accLi.parentNode.removeChild(accLi); }
    if (prof) right.appendChild(prof);
    if (tog) right.appendChild(tog);
    nav.appendChild(right);
  }
  function syncActive() {
    document.querySelectorAll('.lube-group').forEach(function (li) { li.classList.toggle('has-active', !!li.querySelector('a.active')); });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lube-group')) document.querySelectorAll('.lube-group.open').forEach(function (x) { x.classList.remove('open'); });
    if (e.target.closest('.nav-links a')) { document.querySelectorAll('.lube-group.open').forEach(function (x) { x.classList.remove('open'); }); setTimeout(syncActive, 0); }
  });
  var GLASS = '.astro-form-card,.house-card,.planet-card,.element-card,.modalidad-card,.rec-card,.transit-card,.signal-card,.paywall-card,.tirada-premium,.categoria-btn,.reading-card,.natal-reading,.horo-result,.horo-love,.intro,.history-section,.hero p,footer';
  document.addEventListener('mousemove', function (e) {
    var el = e.target.closest && e.target.closest(GLASS);
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  buildNav(); syncActive();
})();
