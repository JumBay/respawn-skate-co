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
    '.rsx-demo__actions{display:flex;flex-wrap:wrap;gap:12px}' +
    '.rsx-demo__actions .rs-btn{cursor:pointer;min-height:52px;flex:1 1 220px}' +
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
    '<div class="rsx-demo__actions"><a class="rs-btn" href="' + URL_WZ + '" target="_blank" rel="noopener">Créer ma boutique sur WiziShop</a>' +
    '<button type="button" class="rs-btn rs-btn--ghost" data-close>Retour au panier</button></div></div>';
  d.body.appendChild(box);
  var card = box.firstChild, back = null;
  function open(from) {
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

  // tout ce qui mène au tunnel de commande
  // (« Continuer mes achats » porte aussi .validate-btn : il reste un lien normal vers l'accueil)
  var CHECKOUT = 'button.validate-btn, #cart-validation button, .paypal-checkout-btn, a[href*="/order/"], a[href*="commande.html"], a[href*="validation.html"]';
  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest(CHECKOUT);
    if (!t || box.contains(t) || t.classList.contains('button--continue')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open(t);
  }, true);
  // validation au clavier (Entrée dans le formulaire du panier vers le bouton de validation)
  d.addEventListener('submit', function (e) {
    var s = e.submitter;
    if (s && s.matches && s.matches('button.validate-btn, #cart-validation button')) { e.preventDefault(); e.stopImmediatePropagation(); open(s); }
  }, true);
})();
