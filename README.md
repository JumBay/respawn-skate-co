# Respawn Skate Co. — le jeu

Jeu de skate 3D arcade (façon Tony Hawk's Pro Skater) de la boutique WiziShop de démonstration
« Respawn Skate Co. » : on crée son skater au *spawn point*, on ride un skatepark sur un toit de
ville au crépuscule, et on achète ce que porte son perso.

- Moteur : [three.js](https://threejs.org) 0.186, bundle ES module unique (`dist/respawn.js`) construit avec Vite.
- Intégration prévue : chargé depuis jsDelivr épinglé sur un commit,
  `https://cdn.jsdelivr.net/gh/JumBay/respawn-skate-co@<commit>/dist/respawn.js`, puis
  `mount(conteneur, { shopUrl, catalog })` (voir `src/main.js`).

## Lancer en local

```bash
npm install
npm run dev          # http://localhost:5199  (?spawn, ?photo=ride-back|ride-34|bowl|ollie, ?quality=low)
npm run build        # dist/respawn.js + ressources
```

Outils : `npm run models` reconstruit les personnages (`raw/` → `public/models/`),
`node scripts/fetch-assets.mjs` retélécharge et recompresse les textures, le ciel et les accessoires.

## Crédits (tous CC0, domaine public)

- Personnages : **Quaternius** — packs « Ultimate Modular Women » et « Ultimate Modular Men »
  ([quaternius.com](https://quaternius.com), distribués aussi par [poly.pizza](https://poly.pizza)), licence CC0.
- Textures PBR, ciel HDRI (`sunset_jhbcentral`) et accessoires (lampadaire, glissière béton,
  poubelle, boîtier électrique, pneus, bombes de peinture, sacs, table) : **[Poly Haven](https://polyhaven.com)**, licence CC0.
- Planche, trucks, roues, protections, rampes, bowl, rails et le reste du park : construits en code.

Code sous licence MIT (voir `LICENSE`).
