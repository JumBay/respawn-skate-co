// Pont jeu -> panier WiziShop. Seul contrat utilisé : celui du formulaire de la fiche produit
// (notes/catalogue.md) — POST /panier.php avec id_prod, nb_prod et, pour un produit à
// déclinaison, le champ `cart_field` (ex. prodVar[1-2]) valant `variation_id`.
// Aucune autre API du panier n'est supposée : getCartContents() renvoie ce que le JEU a ajouté
// pendant la visite (journal local), pas le panier réel.
//
// Modes : 'live' (sur la boutique), 'mock' (journalisé en console, rien n'est envoyé).
// Par défaut : live seulement hors localhost et hors serveur de dev.
import { pickSize } from './data/catalog.js';
import { load, save } from './core/storage.js';

export function createShopBridge({ catalog, shopUrl = '/', mode } = {}) {
  const host = location.hostname;
  const dev = (import.meta.env && import.meta.env.DEV) || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host) || host.endsWith('.local');
  const live = mode ? mode === 'live' : !dev;
  const base = new URL(shopUrl, location.href);
  const endpoint = new URL('/panier.php', base).href;
  const journal = load('cart-journal', []);
  let queue = Promise.resolve();

  function log(...a) { console.info('[respawn:panier]', ...a); }

  async function post(p, size, qty = 1) {
    const fd = new FormData();
    fd.append('id_prod', String(p.id));
    fd.append('nb_prod', String(qty));
    if (p.cart_field && size && size.variation_id != null) fd.append(p.cart_field, String(size.variation_id));
    if (!live) {
      log('(factice)', 'POST', endpoint, Object.fromEntries(fd.entries()));
      await new Promise((r) => setTimeout(r, 250));
      return true;
    }
    const r = await fetch(endpoint, { method: 'POST', body: fd, credentials: 'same-origin', redirect: 'follow' });
    return r.ok || r.type === 'opaqueredirect';
  }

  // Ajoute un produit, dans la taille demandée (libellé) ou celle du profil. Les envois sont mis
  // en file : le panier WiziShop est une session serveur, pas de requêtes concurrentes.
  function addToCart(productId, sizeLabel, profile) {
    const p = catalog.byId.get(Number(productId));
    if (!p) return Promise.resolve({ ok: false, reason: 'unknown' });
    let size = null, swapped = null;
    if (p.sizes.length) {
      if (sizeLabel != null) size = p.sizes.find((s) => String(s.label) === String(sizeLabel)) || null;
      if (!size || size.stock <= 0) {
        const pick = pickSize(p, profile || { sizes: {} });
        if (!pick.available) return Promise.resolve({ ok: false, reason: 'out_of_stock', product: p });
        if (size && size.label !== pick.size.label) swapped = { want: size.label, got: pick.size.label };
        else if (!pick.exact && pick.wanted) swapped = { want: pick.wanted, got: pick.size.label };
        size = pick.size;
      }
    }
    const job = queue.then(async () => {
      try {
        const ok = await post(p, size);
        if (ok) {
          journal.push({ id: p.id, name: p.name, size: size ? size.label : null, price: p.price_ttc, at: Date.now() });
          save('cart-journal', journal.slice(-50));
        }
        return { ok, product: p, size: size && size.label, swapped, mock: !live };
      } catch (e) {
        return { ok: false, reason: 'network', product: p, error: String(e) };
      }
    });
    queue = job.catch(() => {});
    return job;
  }

  // Le look complet : chaque pièce dans la taille du profil (ou la plus proche en stock).
  async function addLookToCart(items, profile) {
    const out = [];
    for (const it of items) {
      const id = typeof it === 'object' ? it.id : it;
      const label = typeof it === 'object' ? it.size : null;
      out.push(await addToCart(id, label, profile));
    }
    return out;
  }

  function getCartContents() { return journal.slice(); }
  const cartUrl = () => new URL('/panier.php', base).href;

  return { addToCart, addLookToCart, getCartContents, cartUrl, live };
}
