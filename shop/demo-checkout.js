// Respawn Skate Co. · boutique de démonstration : sur le panier WiziShop (/p/cart.html), un bandeau
// discret au-dessus du panier et, au clic sur tout bouton qui mène au tunnel de commande, une
// fenêtre qui explique que la boutique est une démo créée par l'IA avec WiziShop. La commande
// n'est pas passée (produits fictifs) : c'est voulu. Le panier lui-même n'est pas modifié.
(function () {
  var d = document;
  if (!d.body || !d.body.classList.contains('page-cart') || d.getElementById('rsx-demo')) return;
  var URL_WZ = 'https://www.wizishop.fr/?utm_source=respawn-skate-co&utm_medium=demo&utm_campaign=checkout';
  var CSS = '.rsx-demo-bar{margin:0 0 16px;padding:10px 14px;background:#141416;color:#f3f0e8;font:500 14px/1.4 "Space Grotesk",system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}' +
    '.rsx-demo-bar a{color:#c8ff2e;font-weight:700;text-decoration:underline;text-underline-offset:3px}' +
    '.rsx-demo{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;padding:16px;background:rgba(20,20,22,.72)}' +
    '.rsx-demo[hidden]{display:none}' +
    '.rsx-demo__card{width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#141416;color:#f3f0e8;padding:28px 24px 24px;border-top:6px solid #c8ff2e;font:16px/1.5 "Space Grotesk",system-ui,sans-serif;clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))}' +
    '.rsx-demo__kicker{margin:0;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#c8ff2e}' +
    '.rsx-demo__title{margin:8px 0 12px;font:400 clamp(30px,6vw,40px)/1 Anton,Impact,sans-serif;text-transform:uppercase;color:#f3f0e8}' +
    '.rsx-demo__text{margin:0 0 22px;color:#d9d5cb}' +
    '.rsx-demo__card{width:min(600px,100%)}' +
    '.rsx-demo__actions{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:stretch}' +
    '@media (max-width:540px){.rsx-demo__actions{grid-template-columns:1fr}}' +
    '.rsx-demo__actions .rs-btn{cursor:pointer;min-height:56px;padding:8px 22px;letter-spacing:.08em;font-size:14px;line-height:1.15;white-space:nowrap;flex-direction:column;gap:2px;text-align:center}' +
    '.rsx-demo__actions .rs-btn small{display:block;font-size:11px;letter-spacing:.06em;text-transform:none;font-weight:500;opacity:.85}' +
    '.rsx-demo__actions .rs-btn--ghost{background:transparent;color:#f3f0e8;border-color:#f3f0e8}' +
    '.rsx-demo__actions .rs-btn:focus-visible{outline:3px solid #c8ff2e;outline-offset:3px}';

  var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);

  // bandeau discret au-dessus du panier
  var detail = d.getElementById('cart-detail');
  if (detail && detail.parentNode) {
    var bar = d.createElement('p');
    bar.className = 'rsx-demo-bar';
    bar.innerHTML = '<span>Boutique de démonstration créée avec WiziShop</span><a href="' + URL_WZ + '" target="_blank" rel="noopener">En savoir plus</a>';
    detail.parentNode.insertBefore(bar, detail);
  }

  // fenêtre « Cette boutique est une démo »
  var box = d.createElement('div');
  box.id = 'rsx-demo'; box.className = 'rsx-demo'; box.hidden = true;
  box.innerHTML = '<div class="rsx-demo__card" role="dialog" aria-modal="true" aria-labelledby="rsx-demo-title" aria-describedby="rsx-demo-text">' +
    '<p class="rsx-demo__kicker">Respawn Skate Co. · démo</p>' +
    '<h2 id="rsx-demo-title" class="rsx-demo__title">Cette boutique est une démo</h2>' +
    '<p id="rsx-demo-text" class="rsx-demo__text">Respawn Skate Co. a été créée par l’IA avec WiziShop en quelques minutes : catalogue, photos, design, jeu… Tu peux faire pareil pour ta marque.</p>' +
    '<div class="rsx-demo__actions"><a class="rs-btn" href="' + URL_WZ + '" target="_blank" rel="noopener" aria-label="Créer ma boutique sur WiziShop (nouvel onglet)">Créer ma boutique<small>sur WiziShop</small></a>' +
    '<button type="button" class="rs-btn rs-btn--ghost" data-close>Retour au panier</button></div></div>';
  d.body.appendChild(box);
  var card = box.firstChild, back = null;
  function open(from) {
    if (!box.hidden) return;
    back = from || d.activeElement;
    box.hidden = false;
    var a = box.querySelector('a.rs-btn'); if (a) a.focus();
    d.addEventListener('keydown', onKey, true);
  }
  function close() {
    box.hidden = true;
    d.removeEventListener('keydown', onKey, true);
    if (back && back.focus) try { back.focus(); } catch (e) {}
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') { // focus gardé dans la fenêtre
      var f = card.querySelectorAll('a[href],button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('[data-close]')) close(); });

  // Tout ce qui mène au tunnel de commande. Cause du départ vers l'accueil (thème, validation-a/cart.js) :
  //   $(document.body).on('mousedown', '#cart-validation button', … setTimeout(() => $('.cart-form').submit(), 1000))
  // Le thème réagit au MOUSEDOWN (pas au clic) et soumet le formulaire du panier 1 s plus tard par
  // jQuery, sans passer par l'événement submit natif. On arrête donc pointerdown / mousedown /
  // touchstart / click / Entrée-Espace en phase de capture sur document (avant la délégation du thème
  // sur body), et, filet de sécurité, form.submit() du formulaire du panier est bloqué pendant que la
  // fenêtre est concernée. « Continuer mes achats » (.button--continue), quantités, suppression et
  // code promo ne sont pas touchés.
  var CHECKOUT = 'button.validate-btn, #cart-validation button, .paypal-checkout-btn, a[href*="/order/"], a[href*="commande.html"], a[href*="validation.html"]';
  var guardUntil = 0;
  function target(e) {
    var t = e.target && e.target.closest && e.target.closest(CHECKOUT);
    if (!t || box.contains(t) || t.classList.contains('button--continue')) return null;
    return t;
  }
  function stop(e) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
  // (touchstart annulé = plus de mousedown ni de click émulés sur mobile : la fenêtre s'ouvre au touchend)
  ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend'].forEach(function (type) {
    d.addEventListener(type, function (e) {
      var t = target(e); if (!t) return;
      stop(e); guardUntil = Date.now() + 2000;
      if (type === 'touchend') open(t);
    }, { capture: true, passive: false });
  });
  d.addEventListener('click', function (e) { var t = target(e); if (!t) return; stop(e); guardUntil = Date.now() + 2000; open(t); }, true);
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = target(e); if (!t) return; stop(e); guardUntil = Date.now() + 2000; open(t);
  }, true);
  d.addEventListener('submit', function (e) {
    var s = e.submitter;
    if ((s && s.matches && s.matches('button.validate-btn, #cart-validation button')) || (!s && Date.now() < guardUntil)) { stop(e); if (box.hidden) open(s); }
  }, true);
  // filet : le thème appelle form.submit() (jQuery) ; refusé pendant la garde, sinon inchangé
  var forms = d.querySelectorAll('form.cart-form');
  for (var i = 0; i < forms.length; i++) (function (f) {
    var native = f.submit;
    f.submit = function () { if (Date.now() < guardUntil) { try { if (window.jQuery) window.jQuery(f).data('submitted', false); } catch (e) {} return; } return native.apply(f, arguments); };
  })(forms[i]);
})();
