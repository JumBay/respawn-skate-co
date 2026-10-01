// Respawn Skate Co. · vestiaire du panier WiziShop (/p/cart.html).
// À côté du panier intact : un encart « ton skater porte ton panier » (pièces portées, doublons
// dans le sac à dos), et à la demande le jeu en mode vestiaire. Chargé par un petit script de la
// boutique sur la page panier seulement. Lit les lignes du panier sans jamais les modifier.
(function () {
  // servi par jsDelivr depuis le même commit que le jeu : le bundle et le catalogue se déduisent de l'adresse de ce fichier
  var SELF = (document.currentScript && document.currentScript.src) || '';
  var BASE = SELF.replace(/\/shop\/vestiaire\.js.*$/, '');
  // le jeu retenu est le 2D (Respawn Street Run) ; le 3D (dist/respawn.js) n'est plus chargé
  var BUNDLE = BASE + '/dist/respawn-2d.js';
  // le catalogue du jeu (même commit que le bundle), chargé sur la page panier seulement
  var CATALOG = BASE + '/public/catalog.json';
  var CAT = {}, BYID = {};
  var d = document;
  var CSS = '.rsx-vest{margin:24px 0 8px;padding:20px;background:#141416;color:#f3f0e8;font-family:"Space Grotesk",system-ui,sans-serif;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))}\n.rsx-vest__kicker{margin:0;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#c8ff2e}\n.rsx-vest__title{margin:6px 0 4px;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(24px,3vw,32px);line-height:1.05;text-transform:uppercase;color:#f3f0e8}\n.rsx-vest__text{margin:0 0 14px;font-size:14px;line-height:1.45;color:#b9b5ab}\n.rsx-vest__fig{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px;padding:0;list-style:none}\n.rsx-vest__fig li{position:relative;width:64px;height:64px;background:#2a2a2e;border:2px solid #2a2a2e}\n.rsx-vest__fig img{width:100%;height:100%;object-fit:cover;display:block}\n.rsx-vest__fig b{position:absolute;left:0;right:0;bottom:0;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(20,20,22,.82);color:#c8ff2e;text-align:center;line-height:16px}\n.rsx-vest__bag{margin:0 0 14px;border:2px solid #c8ff2e;padding:8px 12px}\n.rsx-vest__bag summary{cursor:pointer;font-weight:700;color:#c8ff2e;min-height:28px;display:flex;align-items:center;gap:8px}\n.rsx-vest__bag ul{margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.5}\n.rsx-vest .rs-btn{cursor:pointer;width:100%}\n.rsx-vest .rs-btn svg{width:20px;height:20px;flex:none}\n.rsx-vest__note{margin:10px 0 0;font-size:12px;color:#b9b5ab}\n';
  var SLOTS = { top: 1, bottom: 1, head: 1, feet: 1, helmet: 1, knees: 1, elbows: 1, wrists: 1, deck: 1, wheels: 1, trucks: 1, griptape: 1, bearings: 1 };
  var LABEL = { top: 'Haut', bottom: 'Bas', head: 'Tête', feet: 'Pieds', helmet: 'Casque', knees: 'Genoux', elbows: 'Coudes', wrists: 'Poignets', deck: 'Plateau', wheels: 'Roues', trucks: 'Trucks', griptape: 'Grip', bearings: 'Roulements' };
  function index(cat) {
    (cat.products || []).forEach(function (p) {
      var path = String(p.url || '').replace(/\/$/, '');
      var row = [p.id, p.slot, p.pack_items || [], (p.images || [])[0] || '', String(p.name).split(/[,:]/)[0].trim()];
      CAT[path] = row;
      BYID[p.id] = { path: path, slot: row[1], parts: row[2], img: row[3], name: row[4] };
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // le panier tel que la page l'affiche (lignes du panier WiziShop, lues sans les modifier)
  function readCart() {
    var items = [];
    var rows = d.querySelectorAll('#cart-detail .cart__prod');
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i].querySelector('.cart__prod__name');
      if (!a) continue;
      var path;
      try { path = new URL(a.getAttribute('href'), location.href).pathname.replace(/\/$/, ''); } catch (e) { continue; }
      var c = CAT[path];
      if (!c) continue;
      var v = rows[i].querySelector('.cart__prod__vars'), size = null;
      if (v) { var t = v.textContent.replace(/\s+/g, ' ').trim(); size = t.indexOf(':') >= 0 ? t.split(':').pop().trim() : t; }
      var q = rows[i].querySelector('.cart__prod__qty__input');
      var qty = Math.max(1, parseInt(q && q.value, 10) || 1);
      items.push({ id: c[0], size: size, qty: qty });
    }
    return items;
  }

  // même règle que le jeu : une pièce par emplacement portée, le reste au sac à dos
  function dress(items) {
    var worn = {}, bag = [];
    items.forEach(function (it) {
      var p = BYID[it.id]; if (!p) return;
      var parts = p.slot === 'pack' && p.parts.length ? p.parts : [it.id];
      for (var n = 0; n < Math.min(it.qty, 20); n++) parts.forEach(function (pid) {
        var q = BYID[pid]; if (!q) return;
        if (SLOTS[q.slot] && !worn[q.slot]) worn[q.slot] = q; else bag.push(q);
      });
    });
    return { worn: worn, bag: bag };
  }

  function render() {
    var detail = d.getElementById('cart-detail');
    if (!detail) return;
    var items = readCart();
    var old = d.querySelector('.rsx-vest');
    if (!items.length) { if (old) old.remove(); return; }
    var r = dress(items);
    var slots = Object.keys(r.worn);
    var box = old || d.createElement('section');
    box.className = 'rsx-vest';
    box.setAttribute('aria-labelledby', 'rsx-vest-title');
    var fig = slots.map(function (s) {
      var p = r.worn[s];
      return '<li><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" width="64" height="64" loading="lazy" decoding="async"><b>' + LABEL[s] + '</b></li>';
    }).join('');
    var bag = r.bag.length
      ? '<details class="rsx-vest__bag"><summary>Sac à dos · ' + r.bag.length + (r.bag.length > 1 ? ' pièces' : ' pièce') + ' en double</summary><ul>' +
        r.bag.map(function (p) { return '<li>' + esc(p.name) + '</li>'; }).join('') + '</ul></details>'
      : '';
    box.innerHTML = '<p class="rsx-vest__kicker">Vestiaire</p>' +
      '<h2 id="rsx-vest-title" class="rsx-vest__title">Ton skater porte ton panier</h2>' +
      '<p class="rsx-vest__text">' + (slots.length ? slots.length + (slots.length > 1 ? ' pièces portées' : ' pièce portée') : 'Rien à enfiler') +
      (r.bag.length ? ', le reste dans son sac à dos.' : '.') + '</p>' +
      (fig ? '<ul class="rsx-vest__fig">' + fig + '</ul>' : '') + bag +
      '<button type="button" class="rs-btn" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.6"/><path d="M8 21l1.4-7.5L7 11l3-3h4l3 3-2.4 2.5L16 21"/><path d="M4 22h16"/></svg><span>Voir mon skater en tenue</span></button>' +
      '<p class="rsx-vest__note">Le jeu ne se charge qu’à ta demande. Ton panier ci-dessus reste le seul qui compte.</p>';
    if (!old) detail.parentNode.insertBefore(box, detail.nextSibling);
    var btn = box.querySelector('button');
    btn.addEventListener('pointerenter', function () { try { var l = d.createElement('link'); l.rel = 'modulepreload'; l.href = BUNDLE; l.crossOrigin = 'anonymous'; d.head.appendChild(l); } catch (e) {} }, { once: true });
    btn.addEventListener('click', function () {
      btn.disabled = true;
      import(BUNDLE).then(function (m) {
        m.mount(null, { overlay: true, shopUrl: '/', vestiaire: { items: readCart() }, remember: false });
      }).catch(function () {}).then(function () { btn.disabled = false; });
    });
  }
  function init() {
    if (!d.body || !d.body.classList.contains('page-cart') || !d.querySelector('#cart-detail .cart__prod')) return;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    fetch(CATALOG).then(function (r) { return r.json(); }).then(function (cat) { index(cat); render(); }, function () {});
    window.addEventListener('respawn:destroy', function () { var b = d.querySelector('.rsx-vest button'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
