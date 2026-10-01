// Copie le catalogue de la boutique (../../../catalog.json, contrat de PROJECT.md) dans le bundle
// 2D, allégé des champs inutiles au jeu (photos, URL d'images).
import fs from 'node:fs';
const src = new URL('../../../catalog.json', import.meta.url);
const dst = new URL('../src/catalog.json', import.meta.url);
const d = JSON.parse(fs.readFileSync(src, 'utf8'));
const keep = ['id', 'name', 'url', 'price_ttc', 'slot', 'gabarit', 'gender', 'colors', 'sizes', 'specs', 'badge', 'pack_items', 'exclusive_unlock', 'cart_field'];
const products = d.products.map((p) => Object.fromEntries(keep.filter((k) => k in p).map((k) => [k, k === 'sizes' ? p.sizes.map(({ label, variation_id, stock }) => ({ label, variation_id, stock })) : p[k]])));
fs.writeFileSync(dst, JSON.stringify({ shop_id: d.shop_id, generated_at: d.generated_at, products }));
console.log(`catalog.json (2D) : ${products.length} produits`);
