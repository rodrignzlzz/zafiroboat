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
