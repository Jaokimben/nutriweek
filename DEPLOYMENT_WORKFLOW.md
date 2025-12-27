# 🚀 Workflow de Déploiement NutriWeek

## 📋 Vue d'Ensemble

Ce projet utilise un **workflow Git à deux branches** pour séparer les environnements de développement et production.

### Environnements

| Environnement | Branche | URL Vercel | Utilisation |
|--------------|---------|------------|-------------|
| **Production** | `main` | https://nutriweek-es33.vercel.app/ | Version stable pour les utilisateurs |
| **Preview/Dev** | `develop` | URL Vercel Preview automatique | Tests et validation avant production |

---

## 🔄 Workflow Standard

### 1. Développement de Nouvelles Fonctionnalités

```bash
# 1. Se positionner sur develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature (optionnel mais recommandé)
git checkout -b feature/nom-de-la-feature

# 3. Développer et tester localement
npm run dev
# Faire vos modifications...

# 4. Builder pour vérifier qu'il n'y a pas d'erreurs
npm run build

# 5. Commiter les changements
git add .
git commit -m "feat: Description de la fonctionnalité"

# 6. Pousser vers develop (ou feature branch)
git push origin develop
# OU si vous avez créé une feature branch:
git push origin feature/nom-de-la-feature
```

### 2. Validation sur Preview

Une fois poussé sur `develop`, Vercel déploie automatiquement une **Preview URL**.

**Actions à effectuer:**
1. ✅ Vérifier la Preview URL générée par Vercel
2. ✅ Tester toutes les fonctionnalités modifiées
3. ✅ Vérifier qu'il n'y a pas de régression
4. ✅ Valider visuellement l'interface
5. ✅ Tester sur différents navigateurs si nécessaire

**Preview URL:** Disponible dans le dashboard Vercel ou les commentaires GitHub PR

---

### 3. Passage en Production (Après Validation)

**⚠️ IMPORTANT:** Cette étape ne doit être faite qu'après validation complète sur Preview!

```bash
# 1. Se positionner sur main
git checkout main
git pull origin main

# 2. Merger develop dans main
git merge develop

# OU créer une Pull Request (recommandé)
# Aller sur GitHub → Pull Request → develop → main
# Reviewer les changements et merger

# 3. Pousser vers production
git push origin main
```

**Vercel déploiera automatiquement sur:** https://nutriweek-es33.vercel.app/

---

## 🐛 Correction de Bugs Urgents (Hotfix)

Pour les bugs critiques en production:

```bash
# 1. Créer une branche hotfix depuis main
git checkout main
git checkout -b hotfix/description-bug

# 2. Corriger le bug
# Faire les modifications...

# 3. Tester localement
npm run build
npm run dev

# 4. Commiter
git commit -am "fix: Correction bug critique [description]"

# 5. Merger dans main ET develop
git checkout main
git merge hotfix/description-bug
git push origin main

git checkout develop
git merge hotfix/description-bug
git push origin develop

# 6. Supprimer la branche hotfix
git branch -d hotfix/description-bug
```

---

## 📝 Conventions de Commit

Utilisez les préfixes suivants pour vos commits:

| Préfixe | Usage | Exemple |
|---------|-------|---------|
| `feat:` | Nouvelle fonctionnalité | `feat: Ajout du système de favoris` |
| `fix:` | Correction de bug | `fix: Correction affichage des jours en double` |
| `docs:` | Documentation | `docs: Mise à jour du README` |
| `style:` | Formatage, CSS | `style: Amélioration du responsive mobile` |
| `refactor:` | Refactoring code | `refactor: Optimisation du générateur de menus` |
| `perf:` | Performance | `perf: Réduction du temps de chargement` |
| `test:` | Tests | `test: Ajout tests unitaires pour nutritionCalculator` |
| `chore:` | Maintenance | `chore: Mise à jour dépendances` |

---

## 🔒 Protection des Branches

### Configuration Recommandée sur GitHub

#### Branche `main` (Production)
- ✅ **Require pull request reviews** (au moins 1 approbation)
- ✅ **Require status checks** (build Vercel réussi)
- ✅ **Require branches to be up to date**
- ✅ **Do not allow bypassing** (même pour les admins)
- ❌ **Allow force pushes** (DÉSACTIVÉ)
- ❌ **Allow deletions** (DÉSACTIVÉ)

#### Branche `develop` (Preview)
- ✅ **Require status checks** (build Vercel réussi)
- ⚠️ **Allow force pushes** (avec précaution)
- ⚠️ **Allow bypassing** (pour développement rapide)

### Configuration sur GitHub

1. Aller sur **Settings** → **Branches**
2. Ajouter une règle pour `main`:
   - Branch name pattern: `main`
   - Cocher les options ci-dessus
3. Ajouter une règle pour `develop`:
   - Branch name pattern: `develop`
   - Configuration plus souple

---

## 🌐 Configuration Vercel

### Étapes de Configuration

1. **Connecter le Repository GitHub**
   - Aller sur Vercel Dashboard
   - Importer le projet `nutriweek`
   - Connecter à GitHub

2. **Configuration Production**
   - **Framework:** Vite
   - **Branch:** main
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Configuration Preview**
   - Vercel crée automatiquement des previews pour:
     - Tous les commits sur `develop`
     - Toutes les Pull Requests
   - URL format: `nutriweek-git-[branch]-[project].vercel.app`

4. **Variables d'Environnement** (si nécessaire)
   - Ajouter dans Vercel Dashboard → Settings → Environment Variables
   - Séparer Production / Preview si besoin

---

## 📊 Workflow Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    DÉVELOPPEMENT LOCAL                       │
│  1. Faire les modifications sur branche 'develop'           │
│  2. npm run build (vérifier erreurs)                        │
│  3. npm run dev (tester localement)                         │
│  4. git commit & push origin develop                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            PREVIEW/DÉVELOPPEMENT (Vercel)                    │
│  Branch: develop                                             │
│  URL: Auto-générée par Vercel                               │
│  ✅ Tests complets                                          │
│  ✅ Validation visuelle                                     │
│  ✅ Tests navigateurs                                       │
│  ⏸️  ATTENDRE VALIDATION                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │  ✅ VALIDATION OK
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MERGE VERS PRODUCTION                           │
│  1. Créer Pull Request: develop → main                      │
│  2. Review des changements                                   │
│  3. Merger la PR                                             │
│  OU: git checkout main && git merge develop                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               PRODUCTION (Vercel)                            │
│  Branch: main                                                │
│  URL: https://nutriweek-es33.vercel.app/                    │
│  🎉 DISPONIBLE POUR LES UTILISATEURS                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Checklist de Validation Preview

Avant de passer en production, vérifier:

### Fonctionnalités
- [ ] Toutes les nouvelles fonctionnalités marchent
- [ ] Pas de régression sur les fonctionnalités existantes
- [ ] Les formulaires fonctionnent correctement
- [ ] La navigation est fluide

### Interface
- [ ] Responsive sur mobile (< 640px)
- [ ] Responsive sur tablette (640px - 1024px)
- [ ] Affichage correct sur desktop
- [ ] Pas d'éléments cassés ou mal alignés
- [ ] Icônes et emojis corrects

### Performance
- [ ] Temps de chargement acceptable
- [ ] Pas d'erreurs dans la console (F12)
- [ ] Build sans warnings critiques

### Données
- [ ] Calculs nutritionnels corrects
- [ ] Génération de menus fonctionnelle
- [ ] Sauvegarde/chargement de données OK
- [ ] Liste de courses générée correctement

### Navigateurs (si changements UI)
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (si possible)

---

## 🚨 Rollback en Cas de Problème

Si un bug critique apparaît en production:

### Option 1: Rollback Vercel (Rapide)
1. Aller sur Vercel Dashboard
2. Deployments → Trouver le dernier déploiement stable
3. Cliquer sur "..." → "Promote to Production"

### Option 2: Rollback Git (Permanent)
```bash
# 1. Identifier le commit à rollback
git log --oneline

# 2. Revenir au commit précédent
git checkout main
git revert <commit-hash>
git push origin main

# 3. Mettre à jour develop
git checkout develop
git merge main
git push origin develop
```

---

## 📞 Support & Questions

- **Repository:** https://github.com/Jaokimben/nutriweek
- **Issues:** https://github.com/Jaokimben/nutriweek/issues
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 📚 Commandes Utiles

```bash
# Voir toutes les branches
git branch -a

# Voir l'état actuel
git status

# Voir l'historique
git log --oneline --graph

# Comparer deux branches
git diff develop..main

# Synchroniser avec le remote
git fetch --all
git pull origin develop

# Nettoyer les branches locales obsolètes
git branch --merged | grep -v "main\|develop" | xargs git branch -d
```

---

## 🎯 Résumé pour Usage Quotidien

### Pour Développer
1. `git checkout develop`
2. Faire vos modifications
3. `git commit -am "type: message"`
4. `git push origin develop`
5. Tester sur la Preview URL Vercel

### Pour Déployer en Production
1. Valider sur Preview
2. `git checkout main`
3. `git merge develop`
4. `git push origin main`
5. ✅ C'est en production!

**Simple, sécurisé, efficace!** 🚀

---

**Date de création:** 2025-12-17  
**Dernière mise à jour:** 2025-12-17  
**Version:** 1.0.0
