# 🔧 Configuration Vercel - NutriWeek

## 📋 Prérequis

- Compte Vercel (gratuit): https://vercel.com/signup
- Repository GitHub: https://github.com/Jaokimben/nutriweek

---

## 🚀 Configuration Initiale (Si Pas Encore Fait)

### 1. Importer le Projet

1. Se connecter sur https://vercel.com/
2. Cliquer sur **"Add New..."** → **"Project"**
3. Importer depuis GitHub: `Jaokimben/nutriweek`
4. Autoriser Vercel à accéder au repository

### 2. Configuration du Build

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

**Root Directory:** `.` (racine du projet)

---

## 🌿 Configuration de la Branche `develop` (Preview)

### Option A: Configuration Automatique (Recommandé)

Vercel détecte automatiquement les nouvelles branches et crée des previews.

**Rien à faire!** Vercel va:
- Détecter la branche `develop`
- Créer automatiquement une Preview URL
- Déployer à chaque push sur `develop`

### Option B: Configuration Manuelle

Si vous voulez des paramètres spécifiques pour `develop`:

1. **Dashboard Vercel** → Votre projet → **Settings**
2. **Git** → **Production Branch**
   - Production Branch: `main`
3. **Git** → **Deploy Hooks** (optionnel)
   - Créer un hook pour déclencher manuellement des déploiements

---

## 🎯 Branches et Environnements

### Configuration Actuelle

| Branche | Type | URL | Auto-Deploy |
|---------|------|-----|-------------|
| `main` | Production | https://nutriweek-es33.vercel.app/ | ✅ Oui |
| `develop` | Preview | `nutriweek-git-develop-[project].vercel.app` | ✅ Oui |
| Feature branches | Preview | `nutriweek-git-[branch]-[project].vercel.app` | ✅ Oui |

### Fonctionnement

**Pour `main` (Production):**
- Chaque push sur `main` → Déploiement automatique en production
- URL stable: https://nutriweek-es33.vercel.app/

**Pour `develop` (Preview):**
- Chaque push sur `develop` → Nouvelle Preview URL
- Format: `nutriweek-git-develop-[votre-projet].vercel.app`
- Visible dans: Dashboard → Deployments → Preview

**Pour Pull Requests:**
- Vercel commente automatiquement sur la PR avec l'URL preview
- Parfait pour review avant merge!

---

## 🔍 Où Trouver les Preview URLs?

### Méthode 1: Dashboard Vercel
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet `nutriweek`
3. **Deployments** → Filtre par branche `develop`
4. Copier l'URL de la Preview

### Méthode 2: GitHub PR
1. Créer une Pull Request
2. Vercel commente automatiquement avec l'URL
3. Format: "✅ Preview deployed to: [URL]"

### Méthode 3: Vercel CLI (optionnel)
```bash
npm i -g vercel
vercel login
vercel ls
```

---

## ⚙️ Configuration Avancée (Optionnel)

### Variables d'Environnement

Si vous avez besoin de variables d'environnement différentes entre dev et prod:

1. **Dashboard** → **Settings** → **Environment Variables**
2. Ajouter des variables:
   - **Production:** Seulement pour branche `main`
   - **Preview:** Pour toutes les autres branches
   - **Development:** Pour le développement local

Exemple:
```
Variable: API_URL
Production: https://api.production.com
Preview: https://api.staging.com
```

### Domaines Personnalisés

**Pour Production:**
1. **Settings** → **Domains**
2. Ajouter votre domaine: `www.nutriweek.com`
3. Configurer DNS selon les instructions

**Pour Preview (optionnel):**
- Créer un sous-domaine: `preview.nutriweek.com`
- L'assigner à la branche `develop`

---

## 🚨 Protection des Branches sur GitHub

Pour éviter les pushs directs sur `main`:

1. **GitHub** → Repository → **Settings** → **Branches**
2. **Add rule** pour `main`:
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass: `Vercel`
   - ✅ Require branches to be up to date
   - ❌ Allow force pushes: Désactivé

3. **Add rule** pour `develop` (optionnel):
   - Plus permissif pour développement rapide

---

## 📊 Monitoring et Analytics

### Vercel Analytics (Gratuit)

1. **Dashboard** → **Analytics**
2. Activer **Web Analytics**
3. Voir les stats:
   - Nombre de visites
   - Pages vues
   - Performance (Core Web Vitals)
   - Géolocalisation

### Deployment Logs

Pour debugger les erreurs de build:
1. **Deployments** → Cliquer sur un déploiement
2. **Build Logs** → Voir les erreurs détaillées
3. **Function Logs** (si serverless)

---

## 🎨 Workflow Complet Exemple

### Scénario: Ajouter une Nouvelle Fonctionnalité

```bash
# 1. Créer une branche feature depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Développer
# Faire vos modifications...
npm run dev  # Tester localement

# 3. Commiter et push
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push origin feature/new-feature
```

**Vercel déploie automatiquement → Preview URL générée**

```bash
# 4. Créer une Pull Request sur GitHub
# feature/new-feature → develop

# 5. Review et Test
# Vercel commente sur la PR avec l'URL preview
# Tester la preview URL

# 6. Merger dans develop
git checkout develop
git merge feature/new-feature
git push origin develop
```

**Vercel redéploie develop → Nouvelle preview**

```bash
# 7. Valider sur Preview develop

# 8. Créer PR: develop → main
# Review finale

# 9. Merger en production
git checkout main
git merge develop
git push origin main
```

**Vercel déploie automatiquement en PRODUCTION 🎉**

---

## 🔄 Rollback en Cas de Problème

### Option 1: Via Vercel Dashboard (Rapide)
1. **Deployments** → Trouver le dernier déploiement stable
2. Cliquer sur **"..."** → **"Promote to Production"**
3. La production est restaurée instantanément

### Option 2: Via Git (Permanent)
```bash
git checkout main
git revert HEAD  # Annule le dernier commit
git push origin main
```

---

## 🧪 Test de Configuration

### Vérifier que Tout Fonctionne

1. **Push sur `develop`:**
```bash
git checkout develop
echo "test" >> test.txt
git add test.txt
git commit -m "test: Vérification deploy"
git push origin develop
```

2. **Vérifier Vercel:**
   - Dashboard → Deployments
   - Une nouvelle preview doit apparaître
   - URL format: `nutriweek-git-develop-...`

3. **Nettoyer:**
```bash
git rm test.txt
git commit -m "chore: Cleanup test"
git push origin develop
```

---

## 📞 Support

### Problèmes Courants

**Build échoue:**
- Vérifier les logs dans Vercel Dashboard
- Tester localement: `npm run build`
- Vérifier les dépendances: `npm install`

**Preview URL ne se crée pas:**
- Vérifier que Vercel a accès au repository
- Vérifier les paramètres Git dans Vercel
- Forcer un redéploiement: Dashboard → Redeploy

**Variables d'environnement manquantes:**
- Ajouter dans Settings → Environment Variables
- Redéployer après ajout

### Ressources

- **Documentation Vercel:** https://vercel.com/docs
- **Support Vercel:** https://vercel.com/support
- **GitHub Issues:** https://github.com/Jaokimben/nutriweek/issues

---

## ✅ Checklist Configuration

- [ ] ✅ Compte Vercel créé
- [ ] ✅ Projet importé depuis GitHub
- [ ] ✅ Build configuration correcte (Vite, dist)
- [ ] ✅ Branche `main` configurée pour Production
- [ ] ✅ Branche `develop` pour Preview
- [ ] ✅ Auto-deploy activé sur les deux branches
- [ ] ✅ Protection de branche `main` sur GitHub
- [ ] ✅ Preview URLs testées
- [ ] ✅ Production déployée avec succès

**Une fois tout coché, vous êtes prêt! 🚀**

---

## 🎯 Résumé

**Configuration Simple:**
1. Vercel connecté à GitHub ✅
2. `main` → Production automatique ✅
3. `develop` → Preview automatique ✅
4. Protection des branches sur GitHub ✅

**Workflow:**
- Développer sur `develop`
- Tester sur Preview URL
- Valider
- Merger vers `main`
- ✨ En production!

**C'est tout!** Vercel gère le reste automatiquement. 🎉

---

**Date:** 2025-12-17  
**Version:** 1.0.0
