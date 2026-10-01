// Textes du jeu en français et en anglais (langue du navigateur, bascule manuelle gardée).
import { load, save } from './core/storage.js';

const FR = {
  'title.tagline': 'Concept store skate. Ride, score, habille ton skater.',
  'title.press': 'Appuie sur Espace pour rider',
  'title.tap': 'Touche l’écran pour rider',
  'title.loading': 'Chargement du park…',
  'shopmode': 'Mode boutique',
  'shopmode.exit': 'Sortir · Mode boutique',
  'sound.on': 'Son activé', 'sound.off': 'Son coupé',
  'lang': 'EN',
  'spawn.title': 'Spawn point',
  'spawn.sub': 'Crée ton skater. Tes tailles servent à tout ajout au panier depuis le jeu.',
  'tab.rider': 'Perso', 'tab.outfit': 'Tenue', 'tab.sizes': 'Tailles',
  'rider.name': 'Pseudo', 'rider.gender': 'Silhouette', 'rider.women': 'Femme', 'rider.men': 'Homme',
  'rider.skin': 'Peau', 'rider.hair': 'Coiffure', 'rider.hairColor': 'Couleur', 'rider.stance': 'Position',
  'stance.regular': 'Regular', 'stance.goofy': 'Goofy',
  'outfit.head': 'Tête', 'outfit.top': 'Haut', 'outfit.bottom': 'Bas', 'outfit.feet': 'Chaussures', 'outfit.deck': 'Planche', 'outfit.wheels': 'Roues',
  'outfit.none': 'Rien', 'outfit.looks': 'Looks complets',
  'sizes.top': 'Haut', 'sizes.bottom': 'Bas', 'sizes.shoe': 'Pointure', 'sizes.protect': 'Protections', 'sizes.deck': 'Largeur de planche',
  'sizes.hint': 'Modifiables à tout moment (pause > Spawn point, ou au shop).',
  'dropin': 'Drop in',
  'skip': 'Passer',
  'hud.score': 'Score', 'hud.time': 'Temps', 'hud.special': 'Spécial', 'hud.free': 'Session libre',
  'hud.shop': 'Shop', 'hud.pause': 'Pause',
  'hud.enterShop': 'Entrer au shop',
  'pause.title': 'Pause', 'pause.resume': 'Reprendre', 'pause.restart': 'Recommencer le run', 'pause.free': 'Session libre',
  'pause.run': 'Run chronométré (2 min)', 'pause.spawn': 'Spawn point', 'pause.controls': 'Commandes', 'pause.shop': 'Shop',
  'controls.title': 'Commandes',
  'objectives': 'Objectifs',
  'bail': 'Bail !', 'respawn': 'Respawn',
  'combo.lost': 'Combo perdu',
  'gap': 'Gap',
  'perfect': 'Réception parfaite', 'sketchy': 'Limite…',
  'run.ready': 'Prêt ?', 'run.go': 'Go !', 'run.timeup': 'Temps écoulé',
  'results.title': 'Fin du run', 'results.score': 'Score', 'results.best': 'Record', 'results.combo': 'Meilleur combo',
  'results.objectives': 'Objectifs réussis', 'results.again': 'Rejouer', 'results.shop': 'Voir le shop', 'results.share': 'Partager mon score',
  'results.challenge': 'Défier un pote', 'results.copied': 'Lien copié', 'results.newbest': 'Nouveau record !',
  'results.unlocked': 'Débloqué', 'results.tier': 'Palier atteint',
  'shop.title': 'Le shop', 'shop.try': 'Essayer', 'shop.wear': 'Porté', 'shop.add': 'Ajouter au panier', 'shop.added': 'Ajouté au panier',
  'shop.lookAdd': 'Acheter le look', 'shop.outOfStock': 'Épuisé', 'shop.sizeSwap': 'Taille {want} épuisée : {got} à la place',
  'shop.yourSize': 'Ta taille', 'shop.locked': 'À débloquer : {goal}', 'shop.view': 'Voir la fiche', 'shop.close': 'Retour au park',
  'shop.all': 'Tout', 'shop.clothes': 'Vêtements', 'shop.shoes': 'Chaussures', 'shop.protection': 'Protections', 'shop.hardware': 'Matériel', 'shop.looksTab': 'Looks',
  'shop.stats': 'Stats de jeu (pour le fun)', 'shop.cart': 'Panier', 'shop.inCart': 'au panier',
  'stat.pop': 'Pop', 'stat.grip': 'Grip', 'stat.glisse': 'Glisse',
  'daily.title': 'Défi du jour',
  'challenge.from': '{name} te défie : {score} points. À toi !',
  'tuto.push': 'Avance avec ↑ (ou Z/W) — tourne avec ← →',
  'tuto.ollie': 'Maintiens puis relâche Espace pour un ollie',
  'tuto.flip': 'En l’air : J (ou X) + direction = flip',
  'tuto.grab': 'En l’air : K (ou C) + direction = grab',
  'tuto.grind': 'Près d’un rail : L (ou V) pour grinder',
  'tuto.manual': 'Au sol : U (ou N) pour un manual et garder le combo',
  'tuto.push.touch': 'Joystick : avance et tourne',
  'tuto.ollie.touch': 'Bouton OLLIE : maintiens puis relâche',
  'tuto.flip.touch': 'En l’air : FLIP + direction',
  'tuto.grab.touch': 'En l’air : GRAB + direction',
  'tuto.grind.touch': 'Près d’un rail : GRIND',
  'tuto.manual.touch': 'Au sol : MANUAL pour garder le combo',
  'webgl.title': 'Le skatepark a besoin de WebGL',
  'webgl.text': 'Ton navigateur ne peut pas afficher le jeu. La boutique reste complète : tout le catalogue t’attend.',
  'reduced.title': 'Animations réduites',
  'reduced.text': 'Tu as demandé moins d’animations : le jeu reste disponible, il démarre seulement si tu le lances.',
  'reduced.play': 'Lancer le jeu quand même',
  'replay': 'Rejouer',
};

const EN = {
  'title.tagline': 'Skate concept store. Ride, score, dress your skater.',
  'title.press': 'Press Space to ride',
  'title.tap': 'Tap to ride',
  'title.loading': 'Loading the park…',
  'shopmode': 'Shop mode',
  'shopmode.exit': 'Exit · Shop mode',
  'sound.on': 'Sound on', 'sound.off': 'Sound off',
  'lang': 'FR',
  'spawn.title': 'Spawn point',
  'spawn.sub': 'Build your skater. Your sizes are used for every add-to-cart from the game.',
  'tab.rider': 'Rider', 'tab.outfit': 'Outfit', 'tab.sizes': 'Sizes',
  'rider.name': 'Name', 'rider.gender': 'Body', 'rider.women': 'Woman', 'rider.men': 'Man',
  'rider.skin': 'Skin', 'rider.hair': 'Hair', 'rider.hairColor': 'Colour', 'rider.stance': 'Stance',
  'stance.regular': 'Regular', 'stance.goofy': 'Goofy',
  'outfit.head': 'Head', 'outfit.top': 'Top', 'outfit.bottom': 'Bottom', 'outfit.feet': 'Shoes', 'outfit.deck': 'Deck', 'outfit.wheels': 'Wheels',
  'outfit.none': 'None', 'outfit.looks': 'Full looks',
  'sizes.top': 'Top', 'sizes.bottom': 'Bottom', 'sizes.shoe': 'Shoe size (EU)', 'sizes.protect': 'Pads', 'sizes.deck': 'Deck width',
  'sizes.hint': 'Change them anytime (pause > Spawn point, or in the shop).',
  'dropin': 'Drop in',
  'skip': 'Skip',
  'hud.score': 'Score', 'hud.time': 'Time', 'hud.special': 'Special', 'hud.free': 'Free skate',
  'hud.shop': 'Shop', 'hud.pause': 'Pause',
  'hud.enterShop': 'Enter the shop',
  'pause.title': 'Paused', 'pause.resume': 'Resume', 'pause.restart': 'Restart run', 'pause.free': 'Free skate',
  'pause.run': 'Timed run (2 min)', 'pause.spawn': 'Spawn point', 'pause.controls': 'Controls', 'pause.shop': 'Shop',
  'controls.title': 'Controls',
  'objectives': 'Goals',
  'bail': 'Bail!', 'respawn': 'Respawn',
  'combo.lost': 'Combo lost',
  'gap': 'Gap',
  'perfect': 'Perfect landing', 'sketchy': 'Sketchy…',
  'run.ready': 'Ready?', 'run.go': 'Go!', 'run.timeup': 'Time up',
  'results.title': 'Run over', 'results.score': 'Score', 'results.best': 'Best', 'results.combo': 'Best combo',
  'results.objectives': 'Goals cleared', 'results.again': 'Ride again', 'results.shop': 'Visit the shop', 'results.share': 'Share my score',
  'results.challenge': 'Challenge a friend', 'results.copied': 'Link copied', 'results.newbest': 'New record!',
  'results.unlocked': 'Unlocked', 'results.tier': 'Tier reached',
  'shop.title': 'The shop', 'shop.try': 'Try on', 'shop.wear': 'Wearing', 'shop.add': 'Add to cart', 'shop.added': 'Added to cart',
  'shop.lookAdd': 'Buy the look', 'shop.outOfStock': 'Sold out', 'shop.sizeSwap': 'Size {want} sold out: {got} instead',
  'shop.yourSize': 'Your size', 'shop.locked': 'Unlock: {goal}', 'shop.view': 'Product page', 'shop.close': 'Back to the park',
  'shop.all': 'All', 'shop.clothes': 'Clothes', 'shop.shoes': 'Shoes', 'shop.protection': 'Pads', 'shop.hardware': 'Hardware', 'shop.looksTab': 'Looks',
  'shop.stats': 'Game stats (just for fun)', 'shop.cart': 'Cart', 'shop.inCart': 'in cart',
  'stat.pop': 'Pop', 'stat.grip': 'Grip', 'stat.glisse': 'Slide',
  'daily.title': 'Daily challenge',
  'challenge.from': '{name} challenges you: {score} points. Your turn!',
  'tuto.push': 'Push with ↑ (or W) — steer with ← →',
  'tuto.ollie': 'Hold then release Space to ollie',
  'tuto.flip': 'In the air: J (or X) + direction = flip',
  'tuto.grab': 'In the air: K (or C) + direction = grab',
  'tuto.grind': 'Near a rail: L (or V) to grind',
  'tuto.manual': 'On the ground: U (or N) to manual and keep the combo',
  'tuto.push.touch': 'Joystick: push and steer',
  'tuto.ollie.touch': 'OLLIE button: hold then release',
  'tuto.flip.touch': 'In the air: FLIP + direction',
  'tuto.grab.touch': 'In the air: GRAB + direction',
  'tuto.grind.touch': 'Near a rail: GRIND',
  'tuto.manual.touch': 'On the ground: MANUAL to keep the combo',
  'webgl.title': 'The skatepark needs WebGL',
  'webgl.text': 'Your browser can’t show the game. The full shop is still here.',
  'reduced.title': 'Reduced motion',
  'reduced.text': 'You asked for less motion: the game only starts if you launch it.',
  'reduced.play': 'Launch the game anyway',
  'replay': 'Play',
};

// noms des objectifs (affichage) — les ids restent stables
export const OBJECTIVE_LABELS = {
  fr: {
    'score-amateur': 'Faire 15 000 points', 'score-pro': 'Faire 50 000 points', 'score-sick': 'Faire 120 000 points',
    skate: 'Collecter les lettres S-K-A-T-E', cassette: 'Trouver la cassette cachée', gap: 'Passer un gap nommé',
    'combo-10k': 'Un combo à 10 000 points', 'gaps-3': 'Passer 3 gaps différents',
  },
  en: {
    'score-amateur': 'Score 15,000', 'score-pro': 'Score 50,000', 'score-sick': 'Score 120,000',
    skate: 'Collect S-K-A-T-E', cassette: 'Find the hidden tape', gap: 'Clear a named gap',
    'combo-10k': 'Land a 10,000 combo', 'gaps-3': 'Clear 3 different gaps',
  },
};

let lang = (() => {
  const saved = load('lang', null);
  if (saved === 'fr' || saved === 'en') return saved;
  const nav = (navigator.language || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
})();

const listeners = new Set();
export const getLang = () => lang;
export function setLang(l) { lang = l === 'en' ? 'en' : 'fr'; save('lang', lang); listeners.forEach((f) => f(lang)); }
export function onLang(f) { listeners.add(f); return () => listeners.delete(f); }

export function t(key, vars) {
  let s = (lang === 'en' ? EN : FR)[key] ?? FR[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

export function fmt(n) { return Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR'); }
export function price(n) { return n.toLocaleString(lang === 'en' ? 'en-IE' : 'fr-FR', { style: 'currency', currency: 'EUR' }); }
