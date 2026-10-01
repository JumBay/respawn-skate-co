# Respawn Skate Co. — le jeu

Jeu de skate 3D arcade (façon Tony Hawk's Pro Skater) de la boutique WiziShop de démonstration
« Respawn Skate Co. » : on crée son skater au *spawn point*, on ride un skatepark sur un toit de
ville au crépuscule, et on achète ce que porte son perso.

- Moteur : [three.js](https://threejs.org) 0.186, bundle ES module unique (`dist/respawn.js`) construit avec Vite.
- Intégration prévue : chargé depuis jsDelivr épinglé sur un commit,
  `https://cdn.jsdelivr.net/gh/JumBay/respawn-skate-co@<commit>/dist/respawn.js`, puis
  `mount(conteneur, { shopUrl, catalog })`, ou `mount(null, { overlay: true })` pour la couche plein
  écran de l'accueil (voir `src/main.js` et la démo `dev/home.html`).

## Intégration (accueil de la boutique)

```js
import { mount, wasExited, clearExited } from 'https://cdn.jsdelivr.net/gh/JumBay/respawn-skate-co@<commit>/dist/respawn.js';
const game = await mount(null, {
  overlay: true,            // calque fixe plein écran, défilement de la page bloqué pendant le jeu
  shopUrl: '/',
  onEvent(name, data) {},   // ready, runStart, runEnd, tierReached, objectiveUnlocked, dailyDone, shopOpen, exit, destroy
  rewards: {},              // { bronze: { label } … } : affiché à l'écran de fin, rien n'est créé
});
// « Sortir · Mode boutique » démonte le jeu et mémorise le choix : wasExited() / clearExited()
// servent au bouton flottant « Rejouer ». Les mêmes événements partent sur window (« respawn:<nom> »).
```

Panier : `src/shop-bridge.js` poste le formulaire de fiche WiziShop (`POST /panier.php`, `id_prod`,
`nb_prod`, `prodVar[1-<attribut>]`) ; hors du domaine de la boutique il est factice et journalise en
console. Défi d'ami : lien `#rs=…` (score, pseudo, look, somme de contrôle) ; carte de partage PNG
(Web Share sur mobile).

## Lancer en local

```bash
npm install
npm run dev          # http://localhost:5199  (?spawn, ?photo=ride-back|ride-34|bowl|grind, ?quality=low,
                     #  ?touch=1, ?nowebgl, ?pr=1) ; dev/mobile.html (390 px), dev/home.html (accueil)
npm run build        # dist/respawn.js + ressources
```

Outils : `scripts/build-ubc.mjs` reconstruit les personnages (`UBC=<dossier du pack> node …`),
`scripts/build-sky.mjs` compose le ciel, `node scripts/fetch-assets.mjs` retélécharge et recompresse
les textures et les accessoires.

## Crédits (tous CC0, domaine public)

- Personnages : **Quaternius** — « Universal Base Characters » (corps, visages, coiffures)
  ([quaternius.com](https://quaternius.com), [itch.io](https://quaternius.itch.io)), licence CC0.
  Vêtements, baskets, casquette, bonnet, casque et protections : générés en code à partir du corps.
- Textures PBR, ciel et accessoires (glissière béton, poubelle, boîtier électrique, pneus, bombes de
  peinture, banc, table, sacs) : **[Poly Haven](https://polyhaven.com)**, licence CC0. Le ciel compose
  `sunset_jhbcentral` (la ville, enseigne de marque effacée) et `industrial_sunset_02_puresky`
  (le ciel doré, aussi utilisé pour l'éclairage).
- Planche, trucks, roues, rampes, bowl, rails, mâts d'éclairage, herbe et le reste du park : en code.

Code sous licence MIT (voir `LICENSE`).
