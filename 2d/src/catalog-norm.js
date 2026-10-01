// Même normalisation que le jeu 3D (src/data/catalog.js) : structure attendue par shop-bridge.js
// et pickSize (sizes[].stock, byId).
export function normalizeCatalog(d) {
  const products = (d.products || []).map((p) => ({
    ...p,
    colors: { primary: '#2a2a2e', secondary: '#141416', accent: '#C8FF2E', ...(p.colors || {}) },
    sizes: (p.sizes || []).map((s) => ({ ...s, stock: s.stock == null ? 99 : s.stock })),
    specs: p.specs || {},
    pack_items: p.pack_items || [],
  }));
  return { raw: d, products, byId: new Map(products.map((p) => [p.id, p])), categories: d.categories || [] };
}
