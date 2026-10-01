// Copie le catalogue écrit par le chantier catalogue (../catalog.json) dans public/,
// pour qu'il parte avec le jeu. Sans lui, le jeu se rabat sur src/data/catalog.sample.json.
import fs from 'node:fs';
const src = new URL('../../catalog.json', import.meta.url);
const dst = new URL('../public/catalog.json', import.meta.url);
if (fs.existsSync(src)) {
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(dst, JSON.stringify(data));
  console.log(`catalog.json : ${data.products.length} produits copiés`);
} else console.log('catalog.json absent : le jeu utilisera catalog.sample.json');
