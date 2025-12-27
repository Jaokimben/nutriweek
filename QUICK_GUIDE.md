# ⚡ Guide Rapide - Workflow Dev/Prod

## 🎯 Principe de Base

**Toutes les modifications passent par `develop` et attendent validation avant `main`**

---

## 📋 Workflow en 3 Étapes

### 1️⃣ Développement (Branche `develop`)

```bash
# Travailler sur develop
git checkout develop
git pull origin develop

# Faire vos modifications...
# Tester localement: npm run dev

# Commiter
git add .
git commit -m "feat/fix: Description"
git push origin develop
```

**Vercel déploie automatiquement → URL Preview générée**

---

### 2️⃣ Validation (Preview URL)

**🧪 TESTS OBLIGATOIRES:**
- ✅ Tester toutes les fonctionnalités
- ✅ Vérifier sur mobile/tablette/desktop
- ✅ Console sans erreurs (F12)
- ✅ Pas de régression

**Preview URL:** Visible sur Vercel Dashboard ou GitHub PR

⏸️ **NE PAS passer en production tant que ce n'est pas validé!**

---

### 3️⃣ Production (Branche `main`) - **APRÈS VALIDATION**

```bash
# Passer develop en production
git checkout main
git pull origin main
git merge develop
git push origin main
```

**Vercel déploie automatiquement → https://nutriweek-es33.vercel.app/**

---

## 🌐 URLs des Environnements

| Environnement | URL | Branche |
|--------------|-----|---------|
| **Production** | https://nutriweek-es33.vercel.app/ | `main` |
| **Preview/Dev** | Auto-générée par Vercel | `develop` |
| **Local** | http://localhost:5173 | N/A |

---

## 🐛 Hotfix Urgent

Si bug critique en production:

```bash
# 1. Corriger sur develop
git checkout develop
# Faire la correction...
git commit -am "fix: Bug critique"
git push origin develop

# 2. Tester sur Preview
# ⏸️ VALIDER

# 3. Merger immédiatement en production
git checkout main
git merge develop
git push origin main
```

---

## 📊 État Actuel du Projet

### Branches Créées
- ✅ `main` → Production
- ✅ `develop` → Preview/Dev

### Vercel
- ✅ Connecté à GitHub
- ✅ Déploiement auto sur `main`
- ✅ Preview auto sur `develop`

### Documentation
- ✅ `DEPLOYMENT_WORKFLOW.md` (guide complet)
- ✅ `QUICK_GUIDE.md` (ce fichier)
- ✅ `.github/PULL_REQUEST_TEMPLATE.md` (template PR)

---

## 🎨 Conventions de Commits

```bash
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: CSS/UI
refactor: Refactoring code
perf: Performance
test: Tests
```

---

## 🚨 En Cas de Problème

### Rollback Rapide (Vercel)
1. Vercel Dashboard → Deployments
2. Trouver le dernier déploiement stable
3. "..." → "Promote to Production"

### Rollback Git
```bash
git checkout main
git revert HEAD
git push origin main
```

---

## ✅ Checklist Avant Production

- [ ] ✅ Testé sur Preview URL
- [ ] ✅ Pas d'erreurs console
- [ ] ✅ Responsive OK
- [ ] ✅ Fonctionnalités OK
- [ ] ✅ Build réussi
- [ ] ✅ Pas de régression

**Une fois tout validé → Merge vers `main` 🚀**

---

## 📞 Aide

- **Workflow complet:** `DEPLOYMENT_WORKFLOW.md`
- **Repository:** https://github.com/Jaokimben/nutriweek

**C'est simple:** `develop` (test) → validation → `main` (prod) ✨
