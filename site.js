/* Zafiro Boat — consentimiento de cookies (RGPD/LOPDGDD)
   Cookies técnicas (idioma, decisión) están exentas. Google Maps es de terceros
   y solo se carga tras aceptar. */
(function () {
  var KEY = 'zafiro_cookies';
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadMaps() {
    document.querySelectorAll('iframe[data-src]').forEach(function (f) {
      f.src = f.getAttribute('data-src'); f.removeAttribute('data-src');
    });
    document.querySelectorAll('.map-consent').forEach(function (m) { m.parentNode && m.parentNode.removeChild(m); });
  }

  function blockMaps() {
    document.querySelectorAll('iframe[data-src]').forEach(function (f) {
      var c = f.parentNode;
      if (!c || c.querySelector('.map-consent')) return;
      var d = document.createElement('div');
      d.className = 'map-consent';
      d.innerHTML = '<div>Este mapa usa cookies de Google Maps.</div>' +
        '<button type="button" class="btn btn-dark">Aceptar y ver el mapa</button>';
      d.querySelector('button').addEventListener('click', accept);
      c.appendChild(d);
    });
  }

  function hideBanner() { var b = document.getElementById('cookie-banner'); if (b) b.classList.remove('show'); }
  function accept() { setChoice('accepted'); hideBanner(); loadMaps(); }
  function reject() { setChoice('rejected'); hideBanner(); blockMaps(); }

  function injectBanner() {
    if (document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner'; b.className = 'cookie-banner';
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Aviso de cookies');
    b.innerHTML =
      '<p>Usamos cookies propias (técnicas) y de terceros (Google Maps) para mejorar tu experiencia. ' +
      'Puedes aceptarlas o rechazarlas. Más información en nuestra <a href="cookies.html">Política de cookies</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="btn btn-gold" id="cookie-accept">Aceptar</button>' +
        '<button type="button" class="btn cookie-reject" id="cookie-reject">Rechazar</button>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('#cookie-accept').addEventListener('click', accept);
    b.querySelector('#cookie-reject').addEventListener('click', reject);
  }

  function init() {
    if (choice === 'accepted') { loadMaps(); return; }
    blockMaps();
    if (choice !== 'rejected') {
      injectBanner();
      var b = document.getElementById('cookie-banner');
      if (b) b.classList.add('show');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Autoplay muted videos (class "av") when scrolled into view */
(function () {
  function initAV() {
    var vids = document.querySelectorAll('video.av');
    if (!vids.length) return;
    vids.forEach(function (v) { v.muted = true; v.defaultMuted = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); });
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) play(e.target);
        else { try { e.target.pause(); } catch (x) {} }
      });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { io.observe(v); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAV);
  else initAV();
})();

/* Generic sliding gallery carousel (images + video slides), driven by data-items JSON */
(function () {
  function initGalleries() {
    document.querySelectorAll('.gallery[data-items]').forEach(function (g) {
      var items; try { items = JSON.parse(g.getAttribute('data-items')); } catch (e) { return; }
      if (!items || !items.length) return;
      var prevBtn = g.querySelector('.gal-prev'), nextBtn = g.querySelector('.gal-next'), dotsWrap = g.querySelector('.gal-dots');
      var media = [], dots = [], idx = 0, timer = null;
      items.forEach(function (item, i) {
        var el;
        if (item.t === 'video') {
          el = document.createElement('video');
          el.muted = true; el.loop = true; el.playsInline = true;
          el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.setAttribute('webkit-playsinline', '');
          el.preload = 'none'; if (item.poster) el.poster = item.poster;
          var src = document.createElement('source'); src.src = item.src; src.type = 'video/mp4'; el.appendChild(src);
        } else {
          el = document.createElement('img'); el.src = item.src; el.alt = item.alt || 'Zafiro Boat';
          el.loading = i === 0 ? 'eager' : 'lazy';
        }
        el.className = 'gal-img' + (i === 0 ? ' on' : '') + (item.mirror ? ' flip' : '') + (item.contain ? ' contain' : '');
        g.appendChild(el); media.push(el);
        var d = document.createElement('button');
        d.type = 'button'; d.className = 'gal-dot' + (i === 0 ? ' on' : ''); d.setAttribute('aria-label', 'Foto ' + (i + 1));
        d.addEventListener('click', function () { show(i); restart(); });
        if (dotsWrap) dotsWrap.appendChild(d); dots.push(d);
      });
      function show(n) {
        idx = (n + media.length) % media.length;
        media.forEach(function (m, k) {
          var on = k === idx; m.classList.toggle('on', on);
          if (m.tagName === 'VIDEO') {
            if (on) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
            else { try { m.pause(); } catch (x) {} }
          }
        });
        dots.forEach(function (m, k) { m.classList.toggle('on', k === idx); });
      }
      function next() { show(idx + 1); } function prev() { show(idx - 1); }
      function start() { if (media.length > 1) timer = setInterval(next, 5000); }
      function restart() { clearInterval(timer); start(); }
      if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
      if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
      g.addEventListener('mouseenter', function () { clearInterval(timer); });
      g.addEventListener('mouseleave', start);
      var x0 = null;
      g.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      g.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) { (dx < 0 ? next : prev)(); restart(); }
        x0 = null;
      });
      if (media.length < 2) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsWrap) dotsWrap.style.display = 'none';
      }
      start();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGalleries);
  else initGalleries();
})();

/* Live weather widget (Open-Meteo — no API key, free) for Port de Pollença */
(function () {
  var card = document.getElementById('weather-card');
  if (!card) return;
  var LAT = 39.9035105, LON = 3.0870709;
  var ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>',
    cloudsun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="3.2"/><path d="M8 2.3v1.8M13.5 8h1.8M3.1 8h1.8M4.5 4.5l1.3 1.3M11.5 4.5l-1.3 1.3"/><path d="M8.5 14.5h9a3.2 3.2 0 0 0 .4-6.4 4.6 4.6 0 0 0-8.6-1.6 3.8 3.8 0 0 0-3.3 3.8 3.4 3.4 0 0 0 2.5 4.2z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6.5 18h11a4 4 0 0 0 .5-8 5.6 5.6 0 0 0-10.6-2A4.6 4.6 0 0 0 3.5 12 4.2 4.2 0 0 0 6.5 18z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6.5 13.5h11a4 4 0 0 0 .5-8 5.6 5.6 0 0 0-10.6-2A4.6 4.6 0 0 0 3.5 7.5a4.2 4.2 0 0 0 3 6z"/><path d="M8 18.5l-1 2.2M12.5 18.5l-1 2.2M17 18.5l-1 2.2"/></svg>',
    storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 13h11a4 4 0 0 0 .5-8 5.6 5.6 0 0 0-10.6-2A4.6 4.6 0 0 0 3.5 6.5a4.2 4.2 0 0 0 3 6.5z"/><path d="M12.5 13.5l-2.5 4h3l-2 4.2"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6.5 11h11a4 4 0 0 0 .5-8 5.6 5.6 0 0 0-9.7-1.9M3.5 15h17M3.5 19h17"/></svg>'
  };
  function sky(code) {
    if (code === 0) return { icon: 'sun', text: 'Cielo despejado' };
    if (code <= 2) return { icon: 'cloudsun', text: 'Poco nuboso' };
    if (code === 3) return { icon: 'cloud', text: 'Nublado' };
    if (code === 45 || code === 48) return { icon: 'fog', text: 'Niebla' };
    if (code >= 51 && code <= 67) return { icon: 'rain', text: 'Llovizna' };
    if (code >= 80 && code <= 82) return { icon: 'rain', text: 'Chubascos' };
    if (code >= 95) return { icon: 'storm', text: 'Tormenta' };
    return { icon: 'cloud', text: 'Variable' };
  }
  function compass(deg) { return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(deg / 45) % 8]; }
  function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
  var wUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
    '&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=kn&timezone=Europe%2FMadrid';
  var mUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + LAT + '&longitude=' + LON +
    '&current=wave_height,sea_surface_temperature&timezone=Europe%2FMadrid';
  Promise.all([
    fetch(wUrl).then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch(mUrl).then(function (r) { return r.json(); }).catch(function () { return null; })
  ]).then(function (res) {
    var w = res[0] && res[0].current, m = res[1] && res[1].current;
    if (!w && !m) { card.classList.add('w-error'); return; }
    if (w) {
      set('w-temp', Math.round(w.temperature_2m));
      set('w-feels', Math.round(w.apparent_temperature) + '°');
      set('w-wind', Math.round(w.wind_speed_10m) + ' kt ' + compass(w.wind_direction_10m));
      var arrow = document.getElementById('w-arrow');
      if (arrow) arrow.style.transform = 'rotate(' + ((w.wind_direction_10m + 180) % 360) + 'deg)';
      var s = sky(w.weather_code);
      set('w-sky', s.text);
      var icon = document.getElementById('w-icon'); if (icon) icon.innerHTML = ICONS[s.icon] || ICONS.cloud;
      var d = new Date();
      set('w-updated', 'Actualizado a las ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }
    if (m) {
      set('w-sea', Math.round(m.sea_surface_temperature) + '°');
      set('w-wave', m.wave_height.toFixed(1) + ' m');
    }
  }).catch(function () { card.classList.add('w-error'); });
})();
