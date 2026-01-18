/**
 * 🔍 DIAGNOSTIC DES FICHIERS EXCEL PRATICIEN
 * 
 * Analyse les fichiers Excel uploadés et génère un rapport détaillé
 * pour aider le praticien à comprendre pourquoi la génération échoue
 * et comment améliorer ses fichiers.
 */

import { parseExcelFile } from './practitionerExcelParser.js';
import { getAllFiles } from './practitionerStorage.js';

/**
 * Analyse un fichier Excel et génère un diagnostic
 */
export async function diagnostiquerFichierExcel(fileKey, fileName) {
  const files = getAllFiles();
  const file = files[fileKey];
  
  if (!file) {
    return {
      present: false,
      nom: fileName,
      problemes: ['Fichier non uploadé'],
      suggestions: [`Uploadez le fichier ${fileName} dans le Portail Praticien`]
    };
  }

  try {
    const aliments = await parseExcelFile(file);
    
    const diagnostic = {
      present: true,
      nom: file.name,
      nombreAliments: aliments.length,
      problemes: [],
      suggestions: [],
      details: {
        caloriesMin: Infinity,
        caloriesMax: -Infinity,
        caloriesMoyenne: 0,
        alimentsSansCalories: 0,
        alimentsComplets: 0,
        categoriesPresentes: new Set()
      }
    };

    // Analyse des aliments
    let totalCalories = 0;
    aliments.forEach(aliment => {
      const calories = aliment.energie || 0;
      
      if (calories === 0) {
        diagnostic.details.alimentsSansCalories++;
      } else {
        if (calories < diagnostic.details.caloriesMin) diagnostic.details.caloriesMin = calories;
        if (calories > diagnostic.details.caloriesMax) diagnostic.details.caloriesMax = calories;
        totalCalories += calories;
      }

      if (aliment.proteines > 0 && aliment.glucides > 0 && aliment.lipides > 0) {
        diagnostic.details.alimentsComplets++;
      }

      if (aliment.categorie) {
        diagnostic.details.categoriesPresentes.add(aliment.categorie);
      }
    });

    diagnostic.details.caloriesMoyenne = aliments.length > 0 ? Math.round(totalCalories / aliments.length) : 0;
    diagnostic.details.categoriesPresentes = Array.from(diagnostic.details.categoriesPresentes);

    // Détection des problèmes
    if (aliments.length === 0) {
      diagnostic.problemes.push('❌ Aucun aliment trouvé dans le fichier');
      diagnostic.suggestions.push('Vérifiez que le fichier contient des lignes de données avec au moins une colonne "nom" ou "aliment"');
    }

    if (aliments.length < 5) {
      diagnostic.problemes.push(`⚠️ Seulement ${aliments.length} aliments (recommandé: minimum 10 pour diversité)`);
      diagnostic.suggestions.push('Ajoutez plus d\'aliments pour permettre une meilleure diversité des menus');
    }

    if (diagnostic.details.alimentsSansCalories > 0) {
      diagnostic.problemes.push(`⚠️ ${diagnostic.details.alimentsSansCalories} aliments sans valeur calorique`);
      diagnostic.suggestions.push('Vérifiez que tous les aliments ont une valeur de "calories" ou "energie" > 0');
    }

    const tauxComplets = (diagnostic.details.alimentsComplets / aliments.length) * 100;
    if (tauxComplets < 50) {
      diagnostic.problemes.push(`⚠️ Seulement ${Math.round(tauxComplets)}% des aliments ont des valeurs complètes (protéines, glucides, lipides)`);
      diagnostic.suggestions.push('Ajoutez les valeurs nutritionnelles complètes pour chaque aliment');
    }

    if (diagnostic.details.caloriesMoyenne < 50) {
      diagnostic.problemes.push(`⚠️ Calories moyennes très faibles (${diagnostic.details.caloriesMoyenne} kcal/100g)`);
      diagnostic.suggestions.push('Vérifiez que les valeurs caloriques sont bien en kcal pour 100g');
    }

    if (diagnostic.details.caloriesMoyenne > 600) {
      diagnostic.problemes.push(`⚠️ Calories moyennes très élevées (${diagnostic.details.caloriesMoyenne} kcal/100g)`);
      diagnostic.suggestions.push('Vérifiez que les valeurs caloriques ne sont pas pour 1kg ou une portion entière');
    }

    return diagnostic;
  } catch (error) {
    return {
      present: true,
      nom: file.name,
      nombreAliments: 0,
      problemes: [`❌ Erreur lors de la lecture: ${error.message}`],
      suggestions: [
        'Vérifiez le format du fichier (.xlsx, .xls ou .csv)',
        'Assurez-vous que le fichier a une colonne "nom" ou "aliment"',
        'Vérifiez qu\'il n\'y a pas de cellules fusionnées',
        'Essayez de réenregistrer le fichier au format Excel'
      ],
      details: null
    };
  }
}

/**
 * Génère un diagnostic complet de tous les fichiers Excel
 */
export async function diagnostiquerFichiersExcel() {
  console.log('🔍 [Diagnostic] Analyse des fichiers Excel...');

  const diagnostics = {
    petitDejeuner: await diagnostiquerFichierExcel('alimentsPetitDej', 'Petit-Déjeuner'),
    dejeuner: await diagnostiquerFichierExcel('alimentsDejeuner', 'Déjeuner'),
    diner: await diagnostiquerFichierExcel('alimentsDiner', 'Dîner')
  };

  // Analyse globale
  const analyse = {
    fichiersPresents: 0,
    totalAliments: 0,
    problemesGlobaux: [],
    suggestionsGlobales: [],
    diagnostics
  };

  Object.values(diagnostics).forEach(diag => {
    if (diag.present) {
      analyse.fichiersPresents++;
      analyse.totalAliments += diag.nombreAliments;
    }
  });

  // Problèmes globaux
  if (analyse.fichiersPresents === 0) {
    analyse.problemesGlobaux.push('❌ CRITIQUE: Aucun fichier Excel uploadé');
    analyse.suggestionsGlobales.push('Uploadez au moins un fichier Excel (Petit-Déjeuner, Déjeuner ou Dîner) dans le Portail Praticien');
  }

  if (analyse.totalAliments < 15) {
    analyse.problemesGlobaux.push(`⚠️ Seulement ${analyse.totalAliments} aliments au total (recommandé: minimum 30)`);
    analyse.suggestionsGlobales.push('Ajoutez plus d\'aliments pour permettre une diversité suffisante sur 7 jours');
  }

  // Vérifier l'équilibre entre les repas
  const counts = {
    petitDejeuner: diagnostics.petitDejeuner.nombreAliments || 0,
    dejeuner: diagnostics.dejeuner.nombreAliments || 0,
    diner: diagnostics.diner.nombreAliments || 0
  };

  if (counts.petitDejeuner > 0 && counts.petitDejeuner < 5) {
    analyse.problemesGlobaux.push('⚠️ Pas assez d\'aliments pour le Petit-Déjeuner (minimum 5 recommandé)');
  }
  if (counts.dejeuner > 0 && counts.dejeuner < 10) {
    analyse.problemesGlobaux.push('⚠️ Pas assez d\'aliments pour le Déjeuner (minimum 10 recommandé)');
  }
  if (counts.diner > 0 && counts.diner < 10) {
    analyse.problemesGlobaux.push('⚠️ Pas assez d\'aliments pour le Dîner (minimum 10 recommandé)');
  }

  console.log('✅ [Diagnostic] Analyse terminée:', analyse);
  return analyse;
}

/**
 * Formate le diagnostic en message d'erreur explicite pour l'utilisateur
 */
export function formaterMessageErreur(jour, diagnostic) {
  let message = `❌ Impossible de générer un menu valide pour ${jour}\n\n`;

  // Résumé
  message += `📊 État des fichiers:\n`;
  message += `• Petit-Déjeuner: ${diagnostic.diagnostics.petitDejeuner.present ? `✅ ${diagnostic.diagnostics.petitDejeuner.nombreAliments} aliments` : '❌ Non uploadé'}\n`;
  message += `• Déjeuner: ${diagnostic.diagnostics.dejeuner.present ? `✅ ${diagnostic.diagnostics.dejeuner.nombreAliments} aliments` : '❌ Non uploadé'}\n`;
  message += `• Dîner: ${diagnostic.diagnostics.diner.present ? `✅ ${diagnostic.diagnostics.diner.nombreAliments} aliments` : '❌ Non uploadé'}\n`;
  message += `• Total: ${diagnostic.totalAliments} aliments\n\n`;

  // Problèmes globaux
  if (diagnostic.problemesGlobaux.length > 0) {
    message += `🚨 Problèmes détectés:\n`;
    diagnostic.problemesGlobaux.forEach(pb => {
      message += `  ${pb}\n`;
    });
    message += '\n';
  }

  // Problèmes par fichier
  let hasFileProblems = false;
  ['petitDejeuner', 'dejeuner', 'diner'].forEach(repas => {
    const diag = diagnostic.diagnostics[repas];
    if (diag.problemes.length > 0) {
      if (!hasFileProblems) {
        message += `📋 Détails par fichier:\n`;
        hasFileProblems = true;
      }
      const labels = { petitDejeuner: 'Petit-Déjeuner', dejeuner: 'Déjeuner', diner: 'Dîner' };
      message += `\n${labels[repas]}:\n`;
      diag.problemes.forEach(pb => {
        message += `  ${pb}\n`;
      });
    }
  });

  if (hasFileProblems) message += '\n';

  // Suggestions globales
  if (diagnostic.suggestionsGlobales.length > 0) {
    message += `💡 Suggestions pour améliorer:\n`;
    diagnostic.suggestionsGlobales.forEach((sug, index) => {
      message += `  ${index + 1}. ${sug}\n`;
    });
    message += '\n';
  }

  // Suggestions par fichier
  let hasFileSuggestions = false;
  ['petitDejeuner', 'dejeuner', 'diner'].forEach(repas => {
    const diag = diagnostic.diagnostics[repas];
    if (diag.suggestions.length > 0) {
      if (!hasFileSuggestions) {
        message += `🔧 Actions recommandées par fichier:\n`;
        hasFileSuggestions = true;
      }
      const labels = { petitDejeuner: 'Petit-Déjeuner', dejeuner: 'Déjeuner', diner: 'Dîner' };
      message += `\n${labels[repas]}:\n`;
      diag.suggestions.forEach((sug, index) => {
        message += `  ${index + 1}. ${sug}\n`;
      });
    }
  });

  if (hasFileSuggestions) message += '\n';

  // Message de fin
  message += `\n📍 Pour corriger ces problèmes:\n`;
  message += `1. Allez dans le Portail Praticien\n`;
  message += `2. Uploadez/modifiez vos fichiers Excel\n`;
  message += `3. Assurez-vous d'avoir au moins 10 aliments par repas\n`;
  message += `4. Vérifiez que chaque aliment a des valeurs nutritionnelles complètes\n`;
  message += `5. Réessayez la génération du menu\n`;

  return message;
}

/**
 * Recommandations de contenu pour les fichiers Excel
 */
export const RECOMMANDATIONS_FICHIERS = {
  petitDejeuner: {
    minimum: 5,
    recommande: 15,
    exemples: [
      'Pain complet, Biscottes, Céréales complètes',
      'Œufs, Jambon blanc, Fromage blanc',
      'Fruits frais, Compote sans sucre, Fruits secs',
      'Lait demi-écrémé, Yaourt nature, Fromage',
      'Beurre, Huile d\'olive, Purée d\'amandes',
      'Miel, Confiture, Chocolat noir'
    ],
    calories: { min: 50, max: 400, moyenne: 180 }
  },
  dejeuner: {
    minimum: 10,
    recommande: 25,
    exemples: [
      'Viandes: Poulet, Bœuf, Porc, Dinde',
      'Poissons: Saumon, Cabillaud, Thon, Sardines',
      'Féculents: Riz, Pâtes, Quinoa, Pommes de terre',
      'Légumes: Brocoli, Carottes, Courgettes, Tomates',
      'Légumineuses: Lentilles, Pois chiches, Haricots',
      'Produits laitiers: Yaourt, Fromage, Lait'
    ],
    calories: { min: 80, max: 500, moyenne: 200 }
  },
  diner: {
    minimum: 10,
    recommande: 25,
    exemples: [
      'Protéines: Poisson blanc, Œufs, Tofu',
      'Légumes variés: Épinards, Champignons, Poivrons',
      'Féculents légers: Riz basmati, Semoule, Patates douces',
      'Soupes: Bouillon de légumes, Velouté',
      'Salades: Salade verte, Crudités',
      'Desserts légers: Compote, Yaourt, Fruit'
    ],
    calories: { min: 50, max: 400, moyenne: 180 }
  }
};

/**
 * Génère un template Excel pour le praticien
 */
export function genererTemplateExcel(typeRepas) {
  const reco = RECOMMANDATIONS_FICHIERS[typeRepas];
  
  return {
    nom: `Template_${typeRepas}.xlsx`,
    colonnes: ['nom', 'calories', 'proteines', 'glucides', 'lipides', 'categorie'],
    exemples: reco.exemples,
    notes: [
      `Minimum ${reco.minimum} aliments, recommandé: ${reco.recommande}`,
      `Calories par aliment: ${reco.calories.min}-${reco.calories.max} kcal/100g`,
      `Moyenne attendue: ~${reco.calories.moyenne} kcal/100g`,
      'Toutes les valeurs sont pour 100g d\'aliment',
      'Assurez-vous que chaque aliment a des valeurs nutritionnelles complètes'
    ]
  };
}
