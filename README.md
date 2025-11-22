# 🥗 Application de Nutrition Personnalisée

Une application web mobile-first qui génère des menus hebdomadaires personnalisés basés sur vos objectifs nutritionnels et votre profil.

## 🌟 Fonctionnalités

### Questionnaire Personnalisé
- **Objectifs** : Perte de poids, Confort digestif, ou Vitalité
- **Informations personnelles** : Taille, poids, âge, genre, tour de taille
- **Préférences alimentaires** : Nombre de repas, intolérances connues
- **Santé digestive** : Symptômes et capacités digestives
- **Style de vie** : Morphotype et niveau d'activité physique

### Génération de Menus Intelligente
- **Menus hebdomadaires** adaptés à votre profil
- **Calcul automatique** des calories et macronutriments
- **Recettes détaillées** avec ingrédients et préparation
- **Règles nutritionnelles** spécifiques selon objectif :
  - Perte de poids : Jeûne intermittent, restriction calorique progressive
  - Confort digestif : Aliments pauvres en FODMAP, éviction selon symptômes
  - Vitalité : Équilibre nutritionnel optimal

### Interface Mobile Optimisée
- **Design responsive** adapté iPhone et tous mobiles
- **Navigation intuitive** entre les jours de la semaine
- **Affichage détaillé** de chaque repas
- **Fonction d'impression** et de partage
- **Visualisation des macros** (protéines, lipides, glucides)

## 🚀 Technologies Utilisées

- **React 18** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **CSS3** - Styles responsive mobile-first
- **JavaScript ES6+** - Logique métier et calculs

## 📊 Base de Données

L'application utilise une base de données d'aliments (fichier CSV) contenant :
- Nom des aliments
- Valeurs nutritionnelles (calories, protéines, glucides, lipides)
- Vitamines et minéraux
- Composition détaillée

## 🎯 Règles Nutritionnelles Implémentées

### Perte de Poids
- **Restriction calorique progressive** :
  - Semaines 1-3 : 1200-1600 kcal selon activité
  - Semaine 4 : 1000-1400 kcal
  - Après : 1600-2300 kcal selon genre et activité
- **Répartition macro** : 40% protéines, 40% lipides, 20% glucides
- **Jeûne intermittent** : 4 jours par semaine sans dîner
- **Éviction** : Pain, sucres industriels, sodas, produits laitiers de vache
- **Limitation** : Glucides max 100g/jour, IG < 60 pendant 6 semaines
- **Végétaux** : 50% crus, 50% cuits

### Confort Digestif
- **Reflux/Rôt/Nausée** :
  - Alimentation cuite privilégiée
  - Limitation des lipides
  - Eau tiède + citron + gingembre avant repas
  - Dîner tôt
- **Ballonnements** :
  - Aliments pauvres en FODMAP
  - Éviction gluten et produits laitiers
- **Constipation** :
  - Graines de lin le matin
  - Pruneaux
  - Hydratation 1,5-3L/jour

### Conseils Généraux
- 🥄 Mastication minimum 20 secondes
- 💤 Sommeil 8h minimum
- 🚶 10 000 pas par jour
- ⏱️ Repas dans une plage de 8h
- 🍽️ Repas principal à midi, dîner léger

## 📱 Installation et Utilisation

### Développement Local
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### Build Production
```bash
# Créer le build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

## 🌐 URL de l'Application

**Application en ligne** : https://5173-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai

Accessible depuis n'importe quel navigateur mobile (optimisé pour iPhone).

## 📖 Guide d'Utilisation

1. **Remplir le questionnaire** (7 étapes) avec vos informations personnelles
2. **Générer votre menu** hebdomadaire personnalisé
3. **Navigator entre les jours** pour voir vos repas
4. **Consulter les détails** des recettes (ingrédients, préparation)
5. **Suivre les conseils** nutritionnels personnalisés
6. **Imprimer ou partager** votre menu

## 🔍 Calcul des Besoins Nutritionnels

L'application calcule automatiquement :
- **Calories quotidiennes** selon objectif, activité, genre
- **Macronutriments** (grammes de protéines, lipides, glucides)
- **Répartition des repas** (petit-déjeuner, déjeuner, dîner)
- **IMC** (Indice de Masse Corporelle)

## 🍽️ Types de Recettes

- **Légumineuses** : Salades, currys, soupes, houmous
- **Céréales** : Riz complet, quinoa, porridge d'avoine
- **Petit-déjeuner** : Porridges, smoothie bowls, overnight oats
- **Dîner** : Soupes, salades légères, veloutés

## 📋 Fonctionnalités Avancées

- ✅ Validation des données en temps réel
- ✅ Interface multi-étapes avec progression
- ✅ Adaptation mobile (touch-friendly)
- ✅ Thème visuel moderne et coloré
- ✅ Animations et transitions fluides
- ✅ Gestion des intolérances alimentaires
- ✅ Jeûne intermittent programmé
- ✅ Conseils contextuels personnalisés

## 🔐 Données et Confidentialité

- Toutes les données restent **locales** dans votre navigateur
- Aucune donnée n'est envoyée à un serveur
- Les menus sont générés côté client

## 🛠️ Structure du Projet

```
/home/user/webapp/
├── public/
│   ├── aliments.csv         # Base de données des aliments
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Questionnaire.jsx     # Composant du questionnaire
│   │   ├── Questionnaire.css
│   │   ├── WeeklyMenu.jsx        # Composant du menu hebdomadaire
│   │   └── WeeklyMenu.css
│   ├── utils/
│   │   ├── nutritionCalculator.js # Calculs nutritionnels
│   │   └── menuGenerator.js       # Génération des menus
│   ├── App.jsx              # Composant principal
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Design Mobile-First

- Interface optimisée pour iPhone et smartphones
- Boutons de taille tactile (min 44px)
- Prévention du zoom sur iOS (font-size 16px)
- Scrolling fluide avec momentum
- Gradients colorés et animations

## 📈 Évolutions Futures

- [ ] Ajout de plus de recettes
- [ ] Intégration d'images de plats
- [ ] Liste de courses générée automatiquement
- [ ] Historique des menus
- [ ] Synchronisation multi-appareils
- [ ] Mode hors-ligne (PWA)
- [ ] Notifications de rappel

## 👨‍💻 Développement

Ce projet a été créé avec :
- React + Vite pour des performances optimales
- Design mobile-first pour une expérience utilisateur fluide
- Calculs nutritionnels basés sur les recommandations officielles

## 📝 Licence

Ce projet est destiné à un usage personnel et éducatif.

## 🤝 Contribution

Les suggestions et améliorations sont les bienvenues !

---

**Développé avec ❤️ pour une nutrition personnalisée et accessible**
