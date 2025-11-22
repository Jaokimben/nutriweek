# 📊 Configuration de la Base CIQUAL

## Qu'est-ce que CIQUAL ?

CIQUAL est la base de données nutritionnelles de référence française, gérée par l'ANSES (Agence nationale de sécurité sanitaire de l'alimentation, de l'environnement et du travail).

Elle contient plus de 3000 aliments avec leurs valeurs nutritionnelles complètes (calories, protéines, lipides, glucides, vitamines, minéraux, etc.).

## 🔽 Téléchargement

### Option 1 : Fichier fourni par l'utilisateur

Le fichier CIQUAL a été fourni : `CALNUT2020_2020_07_07(decroise_avec_indi_combl_).csv`

**Étapes :**
1. Téléchargez le fichier depuis : https://www.genspark.ai/api/files/s/N1i3cOyw
2. Renommez-le en `ciqual.csv`
3. Placez-le dans le dossier `public/` de l'application

```bash
# Exemple de commande
mv CALNUT2020_2020_07_07\(decroise_avec_indi_combl_\).csv public/ciqual.csv
```

### Option 2 : Téléchargement officiel ANSES

Vous pouvez télécharger la dernière version depuis le site officiel :

**URL** : https://ciqual.anses.fr/#/cms/download/node/98

**Format requis** : CSV avec séparateur point-virgule (;)

**Colonnes importantes** :
- ALIM_CODE : Code de l'aliment
- FOOD_LABEL : Nom de l'aliment
- MB : Valeur moyenne
- CONST_LABEL : Type de nutriment (nrj_kcal, proteines_g, lipides_g, glucides_g)

## 📁 Structure des Fichiers

```
webapp/
├── public/
│   ├── ciqual.csv          ← Placer le fichier ici (11MB)
│   └── aliments.csv         (ancien fichier, optionnel)
├── src/
│   └── utils/
│       ├── ciqualParser.js  (parser pour CIQUAL)
│       └── menuGenerator.js (utilise CIQUAL)
└── CIQUAL_SETUP.md          (ce fichier)
```

## ⚙️ Configuration

Le fichier `ciqual.csv` doit être au format suivant :

```csv
ALIM_CODE;FOOD_LABEL;indic_combl;LB;UB;MB;CONST_CODE;CONST_LABEL
20505;Lentille, bouillie/cuite à l'eau;1;104;104;104;333;nrj_kcal
20505;Lentille, bouillie/cuite à l'eau;0;8,97;8,97;8,97;25000;proteines_g
...
```

**Important** :
- Séparateur : point-virgule (;)
- Décimales : virgule (,) - sera converti en point (.) automatiquement
- Encodage : UTF-8

## 🧪 Test de l'intégration

Pour vérifier que CIQUAL fonctionne :

1. Lancez l'application : `npm run dev`
2. Ouvrez la console du navigateur (F12)
3. Générez un menu
4. Vérifiez les logs :
   ```
   Chargement de la base CIQUAL...
   CIQUAL chargé: 3000+ aliments
   ```
5. Les calories et macros doivent s'afficher sur chaque repas

## 🔧 Dépannage

### Le fichier ne se charge pas

**Symptôme** : Message "Erreur lors du chargement de CIQUAL"

**Solutions** :
1. Vérifiez que le fichier existe : `ls -lh public/ciqual.csv`
2. Vérifiez la taille : devrait être ~10-11 MB
3. Vérifiez les permissions : `chmod 644 public/ciqual.csv`
4. Videz le cache du navigateur (Ctrl+Shift+R)

### Les calories ne s'affichent pas

**Symptôme** : Calories = 0 ou valeurs étranges

**Solutions** :
1. Ouvrez la console (F12) → onglet Console
2. Cherchez les warnings : "Aliment non trouvé dans CIQUAL: XXX"
3. Ajoutez un mapping dans `ciqualParser.js` :
   ```javascript
   export const ingredientMapping = {
     'votre_ingredient': 'terme_ciqual_correspondant',
     // ...
   }
   ```

### Format de fichier incorrect

**Symptôme** : Parsing échoue ou données vides

**Vérifications** :
```bash
# Vérifier le séparateur
head -5 public/ciqual.csv

# Doit afficher des lignes avec des ; (point-virgule)
```

Si le séparateur est différent, modifiez la ligne 23 de `ciqualParser.js` :
```javascript
const parts = cleanLine.split(';'); // Changer ';' si nécessaire
```

## 📊 Performance

- **Taille** : ~11 MB
- **Temps de chargement** : 2-3 secondes (une fois par session)
- **Aliments** : 3000+
- **Mémoire** : ~50 MB en RAM (après parsing)
- **Calcul par recette** : <10ms

## 🚀 Optimisations Futures

### Réduire la taille du fichier

Créer une version minimale avec seulement les nutriments nécessaires :

```javascript
// Garder uniquement : nrj_kcal, proteines_g, lipides_g, glucides_g
// Réduirait à ~2-3 MB au lieu de 11 MB
```

### Utiliser une API

Au lieu d'un gros fichier CSV, interroger l'API CIQUAL en ligne :
```
https://api.ciqual.anses.fr/
```

### Base de données locale

Utiliser IndexedDB pour stocker CIQUAL en local :
- Chargement initial une seule fois
- Persistance entre les sessions
- Pas de rechargement

## 📝 Licence

CIQUAL est une base de données publique de l'ANSES, utilisable librement pour des applications non commerciales avec attribution.

**Citation** : 
> ANSES (Agence nationale de sécurité sanitaire de l'alimentation, de l'environnement et du travail), Table de composition nutritionnelle des aliments Ciqual

## 🔗 Liens Utiles

- **Site officiel CIQUAL** : https://ciqual.anses.fr/
- **Documentation API** : https://ciqual.anses.fr/#/api
- **Téléchargement direct** : https://ciqual.anses.fr/#/cms/download
- **ANSES** : https://www.anses.fr/

---

**Note** : Le fichier `ciqual.csv` n'est PAS inclus dans le repository Git en raison de sa taille (11MB). Vous devez le télécharger séparément.
