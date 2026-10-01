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
  rewards: {},              // { bronze: { label, code, url } … } : code révélé au palier, copiable
  tiers: {},                // { bronze: 25000, silver: 60000, gold: 120000 } : seuils des paliers
  // tryOn: 12              // fiche produit : le shop s'ouvre, ce produit porté
  // vestiaire: { items }   // page panier : [{ id, size, qty }], doublons dans le sac à dos
  // remember: false        // « Sortir » ne mémorise pas le choix (hors accueil)
});
// « Sortir · Mode boutique » démonte le jeu et mémorise le choix : wasExited() / clearExited()
// servent au bouton flottant « Rejouer ». Les mêmes événements partent sur window (« respawn:<nom> »).
```

Panier : `src/shop-bridge.js` poste le formulaire de fiche WiziShop comme le thème
(`POST /panier.php?ajax`, `id_prod`, `nb_prod`, `prodVar[1-<attribut>]`, succès = réponse `1`) ; hors du domaine de la boutique il est factice et journalise en
console. Défi d'ami : lien `#rs=…` (score, pseudo, look, somme de contrôle) ; carte de partage PNG
(Web Share sur mobile).

## Jeu 2D : Respawn Street Run (`2d/`, direction retenue)

Skate 2D vue de côté façon OlliOlli : run de 60 s où la vitesse monte avec les figures et les
PERFECT, objets du catalogue à attraper (butin), jetons promo bronze / argent / or, exclusifs,
garde-robe avec profil de tailles, vestiaire du panier. Canvas 2D, aucune ressource externe hors
polices, bundle unique `dist/respawn-2d.js` (~200 Ko, ~59 Ko gzip). **Même API que le 3D** :

```js
import { mount, wasExited, clearExited } from 'https://cdn.jsdelivr.net/gh/JumBay/respawn-skate-co@<commit>/dist/respawn-2d.js';
const game = await mount(null, {
  overlay: true, shopUrl: '/', onEvent(name, data) {},
  rewards: provider,         // { session(ctx), claim(req) } asynchrones, voir 2d/src/rewards.js ; absent = mode démo « CODE-DEMO »
  // tryOn: 12               // fiche produit : garde-robe ouverte, produit porté (« Retour à la fiche »)
  // vestiaire: { items }    // page panier : [{ id, size, qty }], doublons dans le sac à dos (« Retour au panier »)
  // remember: false         // « Sortir » ne mémorise pas le choix (hors accueil)
});
```

Aucun code promo n'est dans le bundle : la page injecte un fournisseur `rewards`
(`session()` au début du run → `{ runId, seed }` ; `claim({ type, tier, id, ids, runProof })` →
`{ ok, code, label, url, message }`). `runProof` contient la graine, la durée, le score, la
distance, les objets attrapés horodatés et le journal des entrées. Adaptateur Supabase prêt mais
non branché : `2d/src/rewards-supabase.js` (schéma proposé en tête de fichier).
Événements (`onEvent` et `window` « respawn:<nom> ») : ready, shopOpen, runStart, runEnd,
lootCaught, tierReached, codeRevealed, exclusiveUnlocked, objectiveUnlocked, cartAdd, buyOutfit,
share, pause, exit, destroy. Panier : `src/shop-bridge.js` du 3D, réutilisé tel quel. Défi :
`?play=1#rs=…` (graine, score à battre, parrain). FR / EN.

```bash
npm run dev:2d       # http://localhost:5198 (2d/index.html : ?try=6, ?vest, ?provider=local, ?auto, ?bundle)
npm run build:2d     # resynchronise ../catalog.json puis construit dist/respawn-2d.js
```

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
