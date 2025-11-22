# 🚀 Guide de Déploiement Vercel - NutriWeek

## 📋 Prérequis

- ✅ Code poussé sur GitHub : https://github.com/Jaokimben/nutriweek
- ✅ Fichiers de configuration Vercel en place
- ✅ Application fonctionnelle localement
- 🔑 Compte Vercel (gratuit)

---

## 🎯 Méthode Recommandée : Import depuis GitHub

### Étape 1 : Connexion à Vercel

1. Allez sur **https://vercel.com**
2. Cliquez sur **"Sign Up"** ou **"Log In"**
3. Choisissez **"Continue with GitHub"** pour lier votre compte GitHub

### Étape 2 : Importer le Projet

1. Une fois connecté, cliquez sur **"Add New..."** → **"Project"**
2. Autorisez Vercel à accéder à vos repositories GitHub
3. Trouvez **"Jaokimben/nutriweek"** dans la liste
4. Cliquez sur **"Import"**

### Étape 3 : Configuration du Projet

Vercel va détecter automatiquement :
- ✅ Framework : **Vite**
- ✅ Build Command : `npm run build`
- ✅ Output Directory : `dist`
- ✅ Install Command : `npm install`

**⚠️ Vous n'avez RIEN à modifier !** La configuration est déjà optimale.

### Étape 4 : Déploiement

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes pendant le build
3. 🎉 Votre application est en ligne !

### Étape 5 : Obtenir l'URL

Après le déploiement, vous obtiendrez :
- **URL de production** : `https://nutriweek-[hash].vercel.app`
- **URL personnalisée possible** : Configurable dans les paramètres

---

## 🔄 Déploiement Automatique

Maintenant, **chaque fois que vous pushez sur GitHub** :
- ✨ Vercel détecte automatiquement les changements
- 🔨 Lance un nouveau build
- 🚀 Déploie la nouvelle version
- 📧 Vous envoie une notification par email

**C'est du CI/CD automatique ! 🎯**

---

## 🛠️ Méthode Alternative : Vercel CLI

Si vous préférez déployer depuis la ligne de commande :

```bash
# 1. Installer Vercel CLI (déjà installé dans le projet)
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod

# 4. Suivre les instructions interactives
```

---

## 📊 Vérifications Post-Déploiement

### ✅ Checklist

- [ ] L'application se charge correctement
- [ ] Les 7 étapes du questionnaire fonctionnent
- [ ] L'auto-avancement fonctionne (étapes 1, 3, 6, 7)
- [ ] Les inputs affichent le texte correctement
- [ ] Les morphotypes affichent les descriptions
- [ ] La génération de menu fonctionne
- [ ] Le design responsive fonctionne sur mobile

### 🐛 Problèmes Courants

**1. Build échoue avec erreur Node version**
- Solution : Vercel utilise Node 18+ par défaut, compatible avec notre projet

**2. Page blanche après déploiement**
- Vérifiez la console du navigateur (F12)
- Vérifiez les logs Vercel dans le dashboard

**3. Routes ne fonctionnent pas**
- Le fichier `vercel.json` gère déjà les rewrites
- Toutes les routes pointent vers `/index.html`

---

## 🎨 Personnalisation du Domaine

### Option 1 : Sous-domaine Vercel (Gratuit)
1. Allez dans **Settings** → **Domains**
2. Ajoutez un alias : `nutriweek.vercel.app`

### Option 2 : Domaine personnalisé
1. Achetez un domaine (ex: nutriweek.com)
2. Dans Vercel : **Settings** → **Domains**
3. Ajoutez votre domaine
4. Suivez les instructions DNS

---

## 📈 Monitoring et Analytics

### Métriques disponibles dans Vercel :

- **Performance** : Core Web Vitals
- **Trafic** : Nombre de visiteurs
- **Builds** : Historique des déploiements
- **Logs** : Erreurs et warnings

Accédez-y dans : **Dashboard** → **Analytics**

---

## 🔐 Variables d'Environnement

Si vous ajoutez des APIs externes plus tard :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez vos variables (ex: `VITE_API_KEY`)
3. Redéployez pour appliquer

---

## 📱 Test Multi-Appareils

Après déploiement, testez sur :
- 📱 iPhone (Safari)
- 📱 Android (Chrome)
- 💻 Desktop (Chrome, Firefox, Safari)
- 📲 Tablette (iPad)

URL de test : Votre URL Vercel

---

## 🚀 Prochaines Étapes

Une fois déployé :

1. ✅ Testez l'application sur tous les appareils
2. 📊 Activez Vercel Analytics (gratuit)
3. 🔍 Configurez un domaine personnalisé (optionnel)
4. 📧 Partagez l'URL avec vos utilisateurs
5. 🎯 Collectez les retours utilisateurs

---

## 🆘 Support

**Documentation Vercel :**
- https://vercel.com/docs

**Notre Repository GitHub :**
- https://github.com/Jaokimben/nutriweek

**Statut Actuel :**
- ✅ Code prêt pour production
- ✅ Configuration optimisée
- ✅ Build testé localement
- 🟢 Prêt à déployer !

---

## 🎉 Félicitations !

Votre application **NutriWeek** est maintenant prête pour le monde ! 🌍

Après le déploiement, vous aurez :
- 🌐 Une URL publique et sécurisée (HTTPS)
- 🚀 Des performances optimales (CDN mondial)
- 🔄 Des mises à jour automatiques
- 📊 Des analytics détaillés
- ⚡ Un temps de chargement ultra-rapide

**Bonne chance avec votre lancement ! 🎯**
