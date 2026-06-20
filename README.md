# ChronoCréateur

ChronoCréateur est une application web statique en français pour créer, modifier, sauvegarder et exporter des frises chronologiques interactives.

## Déploiement GitHub Pages

Le projet ne nécessite aucun serveur et aucune étape de compilation.

1. Poussez le dossier sur un dépôt GitHub.
2. Dans GitHub, ouvrez `Settings > Pages`.
3. Choisissez la branche de publication et le dossier racine.
4. Ouvrez l'URL GitHub Pages générée.

## Fichiers

- `index.html` : structure de l'application.
- `styles.css` : interface responsive, mode clair/sombre et styles d'impression.
- `app.js` : moteur de frise, modèles, édition, sauvegarde locale et exports.

## Fonctionnalités

- Timeline horizontale SVG avec déplacement, zoom et échelles automatiques.
- Dates négatives et positives, avec affichage `av. J.-C.`.
- Événements, périodes, textes, images, lignes, flèches et annotations.
- Déplacement, redimensionnement, duplication, suppression et panneau de propriétés.
- Sauvegarde automatique dans `localStorage`.
- Plusieurs projets locaux, import/export `.bin`.
- Export PNG, impression et export PDF via la boîte d'impression du navigateur.
- Modèles prêts à modifier : histoire mondiale, histoire de France, sciences, découvertes et technologie.
- Mode sombre, recherche, raccourcis clavier et glisser-déposer d'images.
