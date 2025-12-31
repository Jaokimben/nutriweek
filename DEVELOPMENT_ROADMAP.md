# 📋 PLAN DE DÉVELOPPEMENT NUTRIWEEK - ANALYSE DES 11 PROMPTS

## 🎯 Vue d'ensemble

**Date :** 2025-12-27  
**Application :** NutriWeek - Coach nutrition personnalisé  
**URL Production :** https://nutriweek-es33.vercel.app/  
**Repository :** https://github.com/Jaokimben/nutriweek

---

## 📊 Analyse et Priorisation des Prompts

### Matrice de Priorisation (Impact × Effort)

| # | Fonctionnalité | Impact | Effort | Priorité | Durée Estimée |
|---|----------------|---------|--------|----------|---------------|
| 1 | Corriger page Profil | 🔴 Critique | 🟡 Moyen | **P0 - Urgent** | 2-3h |
| 3 | Feedback "Autre proposition" | 🟢 Élevé | 🟢 Faible | **P1 - Court terme** | 1-2h |
| 7 | Mode sombre | ✅ **FAIT** | - | **Terminé** | - |
| 5 | Système de favoris | 🟢 Élevé | 🟡 Moyen | **P1 - Court terme** | 3-4h |
| 8 | Tracker hydratation | 🟢 Élevé | 🟢 Faible | **P1 - Court terme** | 2-3h |
| 4 | Modal détaillé recettes | 🟡 Moyen | 🟡 Moyen | **P2 - Moyen terme** | 4-5h |
| 2 | Images pour plats | 🟡 Moyen | 🔴 Élevé | **P2 - Moyen terme** | 6-8h |
| 9 | Notes et évaluations | 🟡 Moyen | 🟡 Moyen | **P2 - Moyen terme** | 4-5h |
| 6 | Dashboard progression | 🟢 Élevé | 🔴 Élevé | **P3 - Long terme** | 8-10h |
| 10 | Export liste de courses | 🟡 Moyen | 🔴 Élevé | **P3 - Long terme** | 6-8h |

---

## 🚀 PHASE 1 : CORRECTIONS URGENTES (P0)

### ✅ PROMPT 1 : Corriger la Page Profil

**Statut :** 🔴 **BLOQUANT - À FAIRE EN PRIORITÉ**

**Problème :**  
La page Profil reste bloquée sur "Chargement..." en mode invité.

**Impact :**  
- Empêche utilisateurs d'accéder à leur profil
- Mauvaise expérience utilisateur
- Peut bloquer d'autres fonctionnalités

**Solution Proposée :**

1. **Debug immédiat**
   - Identifier la cause du blocage
   - Vérifier la gestion du mode invité
   - Logs détaillés

2. **Implémentation**
   ```jsx
   // Composant Profile.jsx à créer/corriger
   - Skeleton loader pendant chargement
   - Gestion erreur explicite
   - Fallback pour mode invité
   - Formulaire éditable (photo, infos, objectifs)
   - Historique de progression
   - Actions : modifier, changer mdp, supprimer compte
   ```

3. **Validation**
   - Test mode connecté
   - Test mode invité
   - Test erreurs réseau

**Fichiers à modifier :**
- `src/components/Profile.jsx` (principal)
- `src/utils/storage.js` (gestion données)
- `src/App.jsx` (routing)

**Durée estimée :** 2-3 heures

---

## 🎯 PHASE 2 : AMÉLIORATIONS COURT TERME (P1)

### ✅ PROMPT 3 : Améliorer Feedback "Autre Proposition"

**Statut :** 🟡 **À FAIRE - HAUTE PRIORITÉ**

**Problème :**  
Pas de feedback visuel pendant le changement de plat.

**Impact :**  
- Utilisateur ne sait pas si l'action fonctionne
- Expérience utilisateur frustrante
- Looks "cassé"

**Solution Proposée :**

```jsx
// Améliorer src/components/WeeklyMenu.jsx

1. État de chargement :
   - Bouton désactivé pendant action
   - Spinner + texte "Génération..."
   - Animation transition fade out/in

2. Optimisation :
   - Pré-charger 2-3 alternatives
   - Rotation dans cache (réponse instantanée)
   - Recharger après 3 changements

3. Compteur :
   - "Proposition 2/5"
   - Message fin d'alternatives
   - Bouton reset
```

**Fichiers à modifier :**
- `src/components/WeeklyMenu.jsx`
- `src/utils/menuGeneratorStrict.js`

**Durée estimée :** 1-2 heures

---

### ✅ PROMPT 5 : Système de Favoris

**Statut :** 🟡 **À FAIRE - HAUTE PRIORITÉ**

**Valeur ajoutée :**  
- Personnalisation forte
- Engagement utilisateur
- Améliore recommandations

**Solution Proposée :**

```jsx
1. Base de données :
   - Table/LocalStorage favorites
   - Structure : { userId, recipeId, addedAt, notes }

2. Interface :
   - Bouton cœur sur cartes
   - Animation rempli/vide
   - Toast confirmation

3. Page "Mes Favoris" :
   - Grille de cartes
   - Filtres (type repas)
   - Tri (date, alpha, calories)
   - Recherche

4. Intégration génération :
   - Toggle "Inclure favoris"
   - Slider fréquence 0-100%
   - Badge "⭐ Favori"
```

**Fichiers à créer/modifier :**
- `src/components/Favorites.jsx` (nouveau)
- `src/utils/favoritesStorage.js` (nouveau)
- `src/components/WeeklyMenu.jsx` (bouton cœur)
- `src/utils/menuGeneratorStrict.js` (intégrer favoris)

**Durée estimée :** 3-4 heures

---

### ✅ PROMPT 8 : Tracker d'Hydratation

**Statut :** 🟡 **À FAIRE - HAUTE PRIORITÉ**

**Valeur ajoutée :**  
- Fonctionnalité simple et utile
- Complète aspect nutrition
- Engagement quotidien

**Solution Proposée :**

```jsx
1. Widget persistant :
   - Coin bas droit (desktop)
   - Bottom sheet (mobile)
   - Jauge visuelle
   - % progression

2. Actions rapides :
   - +250ml, +500ml, +1L
   - Saisie manuelle
   - Animation remplissage
   - Son optionnel

3. Historique :
   - Graphique 7 jours
   - Moyenne
   - Streak jours

4. Notifications :
   - Rappels 2h
   - Félicitations objectif
```

**Fichiers à créer :**
- `src/components/HydrationTracker.jsx` (nouveau)
- `src/utils/hydrationStorage.js` (nouveau)
- `src/components/HydrationWidget.jsx` (nouveau)

**Durée estimée :** 2-3 heures

---

## 📈 PHASE 3 : AMÉLIORATIONS MOYEN TERME (P2)

### PROMPT 4 : Modal Détaillé pour Recettes

**Complexité :** 🟡 Moyenne  
**Valeur :** 🟡 Moyenne  
**Durée :** 4-5 heures

**Composants :**
- Modal avec sections (info, ingrédients, instructions, nutrition)
- Mode cuisine
- Minuteur intégré
- Notes personnelles

---

### PROMPT 2 : Ajouter des Images pour les Plats

**Complexité :** 🔴 Élevée  
**Valeur :** 🟡 Moyenne  
**Durée :** 6-8 heures

**Défis :**
- Acquisition/génération 100+ images
- Optimisation formats (WebP)
- Association automatique plat-image
- Performance (lazy loading)

**Solutions :**
- API Unsplash (gratuite)
- DALL-E pour plats spécifiques
- CDN Cloudinary pour optimisation

---

### PROMPT 9 : Système de Notes et Évaluations

**Complexité :** 🟡 Moyenne  
**Valeur :** 🟡 Moyenne  
**Durée :** 4-5 heures

**Composants :**
- Système notation 1-5 étoiles
- Commentaires
- Tags rapides
- Amélioration recommandations

---

## 🎨 PHASE 4 : FONCTIONNALITÉS AVANCÉES (P3)

### PROMPT 6 : Dashboard de Progression

**Complexité :** 🔴 Élevée  
**Valeur :** 🟢 Élevée  
**Durée :** 8-10 heures

**Sections :**
- Vue d'ensemble (poids, objectif)
- Stats nutritionnelles
- Respect du plan
- Avant/après photos
- Gamification (badges, streaks)

**Bibliothèques nécessaires :**
- Chart.js ou Recharts
- Framer Motion
- Date-fns

---

### PROMPT 10 : Export Liste de Courses Avancé

**Complexité :** 🔴 Élevée  
**Valeur :** 🟡 Moyenne  
**Durée :** 6-8 heures

**Formats d'export :**
- Texte, PDF, CSV, JSON
- Intégrations tierces (Carrefour, Auchan)
- Partage SMS/WhatsApp/Email

---

## ✅ DÉJÀ TERMINÉ

### PROMPT 7 : Mode Sombre

**Statut :** ✅ **TERMINÉ**  
**Commit :** 7030869 + 6309c82  
**Date :** 2025-12-27

**Réalisé :**
- Toggle thème clair/sombre
- Variables CSS
- Sauvegarde préférence
- Contraste optimal (WCAG AAA)
- Documentation complète

---

## 📅 PLANNING RECOMMANDÉ

### Semaine 1 : Corrections Critiques
```
Jour 1-2 : PROMPT 1 - Corriger page Profil (2-3h)
           → Test + validation
Jour 3-4 : PROMPT 3 - Feedback "Autre proposition" (1-2h)
           → Test + validation
```

### Semaine 2-3 : Fonctionnalités P1
```
Jour 5-7 : PROMPT 5 - Système de favoris (3-4h)
           → Développement + intégration
Jour 8-9 : PROMPT 8 - Tracker hydratation (2-3h)
           → Développement + tests
```

### Semaine 4-6 : Fonctionnalités P2
```
Semaine 4 : PROMPT 4 - Modal recettes détaillé (4-5h)
Semaine 5 : PROMPT 2 - Images pour plats (6-8h)
Semaine 6 : PROMPT 9 - Notes et évaluations (4-5h)
```

### Mois 2+ : Fonctionnalités P3
```
Sprint 1 : PROMPT 6 - Dashboard progression (8-10h)
Sprint 2 : PROMPT 10 - Export avancé (6-8h)
```

---

## 🎯 ROADMAP VISUELLE

```
AUJOURD'HUI (27/12/2025)
    ↓
[P0] Corriger Profil
    ↓
[P1] Feedback + Favoris + Hydratation
    ↓
[P2] Modal + Images + Notes
    ↓
[P3] Dashboard + Export Avancé
    ↓
VERSION 2.0 COMPLÈTE
```

---

## 💡 RECOMMANDATIONS

### Pour Démarrer MAINTENANT :

1. **PROMPT 1 : Corriger Page Profil** 🔴
   - **URGENT** - Bloque l'expérience utilisateur
   - Démarrer immédiatement
   - Est-ce que je dois commencer ?

2. **PROMPT 3 : Feedback "Autre proposition"** 🟡
   - Impact UX immédiat
   - Rapide à implémenter
   - Petite amélioration, grand effet

3. **PROMPT 5 : Système de Favoris** 🟡
   - Feature attendue
   - Améliore engagement
   - Base pour recommandations

### Stratégie de Développement :

**Approche "Quick Wins" :**
- Prioriser fonctionnalités rapides et impactantes
- Valider chaque feature avant de continuer
- Tester en production sur develop
- Merger vers main après validation

**Workflow Recommandé :**
```bash
# Pour chaque prompt
1. git checkout develop
2. Développer la feature
3. Tester localement
4. git commit + push origin develop
5. Tester sur preview Vercel
6. Demander validation utilisateur
7. Merger vers main
```

---

## 📋 CHECKLIST DE DÉMARRAGE

Avant de commencer chaque prompt :

- [ ] Lire le prompt complet
- [ ] Identifier les fichiers à créer/modifier
- [ ] Estimer la durée
- [ ] Créer une branche dédiée (optionnel)
- [ ] Développer par petits commits
- [ ] Tester en continu
- [ ] Documenter les changements
- [ ] Valider avec utilisateur

---

## 🎯 QUESTION POUR VOUS

**Voulez-vous que je commence par :**

**Option A : PROMPT 1 - Corriger la page Profil (URGENT)** 🔴  
→ Résoudre le bug de chargement  
→ Créer interface complète  
→ Durée : 2-3 heures

**Option B : PROMPT 3 - Améliorer feedback "Autre proposition"** 🟡  
→ Amélioration UX rapide  
→ Visible immédiatement  
→ Durée : 1-2 heures

**Option C : PROMPT 5 - Système de favoris** 🟢  
→ Nouvelle fonctionnalité complète  
→ Fort engagement utilisateur  
→ Durée : 3-4 heures

**Option D : Autre priorité ?**  
→ Dites-moi ce qui est le plus important pour vous

---

## 📊 RÉSUMÉ EXÉCUTIF

**Fonctionnalités à développer :** 10 (1 déjà fait)  
**Durée totale estimée :** 40-50 heures  
**Sprints recommandés :** 6-8 sprints  
**Timeline :** 2-3 mois (développement progressif)

**Prochaine étape immédiate :**  
👉 **Corriger la page Profil (PROMPT 1)** - Bug bloquant

---

**Quelle option choisissez-vous ? Je suis prêt à démarrer immédiatement ! 🚀**
