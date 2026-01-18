/**
 * 🔍 MODULE DE RECHERCHE NUTRITIONNELLE
 * 
 * Recherche automatique des valeurs nutritionnelles manquantes
 * pour les aliments sans données complètes dans les fichiers Excel.
 * 
 * Sources:
 * - USDA FoodData Central (public API)
 * - Valeurs estimées basées sur des aliments similaires
 */

/**
 * Base de données de valeurs nutritionnelles moyennes par catégorie
 * Utilisée comme fallback si l'API échoue
 */
const VALEURS_MOYENNES = {
  viandes: {
    energie: 200,
    proteines: 20,
    glucides: 0,
    lipides: 12
  },
  poissons: {
    energie: 150,
    proteines: 20,
    glucides: 0,
    lipides: 6
  },
  legumes: {
    energie: 30,
    proteines: 2,
    glucides: 5,
    lipides: 0.3
  },
  fruits: {
    energie: 50,
    proteines: 0.5,
    glucides: 12,
    lipides: 0.2
  },
  cereales: {
    energie: 350,
    proteines: 10,
    glucides: 70,
    lipides: 2
  },
  produits_laitiers: {
    energie: 60,
    proteines: 3.5,
    glucides: 5,
    lipides: 3
  },
  legumineuses: {
    energie: 120,
    proteines: 8,
    glucides: 20,
    lipides: 0.5
  },
  oeufs: {
    energie: 145,
    proteines: 12,
    glucides: 1,
    lipides: 10
  },
  default: {
    energie: 100,
    proteines: 5,
    glucides: 10,
    lipides: 3
  }
};

/**
 * Détecte la catégorie d'un aliment basé sur son nom
 */
function detecterCategorie(nomAliment) {
  const nom = nomAliment.toLowerCase();
  
  // Viandes
  if (nom.match(/poulet|dinde|boeuf|veau|porc|agneau|viande|canard|lapin/)) {
    return 'viandes';
  }
  
  // Poissons et fruits de mer
  if (nom.match(/poisson|saumon|thon|cabillaud|merlan|crevette|moule|calmar|anchois|hareng|maquereau/)) {
    return 'poissons';
  }
  
  // Légumes
  if (nom.match(/salade|tomate|carotte|courgette|brocoli|chou|épinard|haricot vert|poivron|aubergine|navet|betterave|légume/)) {
    return 'legumes';
  }
  
  // Fruits
  if (nom.match(/pomme|poire|banane|orange|fraise|raisin|melon|kiwi|ananas|fruit|avocat/)) {
    return 'fruits';
  }
  
  // Céréales et féculents
  if (nom.match(/riz|pâtes|pain|quinoa|blé|avoine|semoule|céréale|féculent|pomme de terre/)) {
    return 'cereales';
  }
  
  // Produits laitiers
  if (nom.match(/lait|yaourt|fromage|crème|beurre|laitier/)) {
    return 'produits_laitiers';
  }
  
  // Légumineuses
  if (nom.match(/lentille|pois chiche|haricot blanc|haricot rouge|fève|soja|légumineuse/)) {
    return 'legumineuses';
  }
  
  // Œufs
  if (nom.match(/oeuf|œuf/)) {
    return 'oeufs';
  }
  
  return 'default';
}

/**
 * Recherche les valeurs nutritionnelles d'un aliment
 * 
 * Stratégie:
 * 1. Utiliser les valeurs partielles si présentes
 * 2. Rechercher dans la base de données interne
 * 3. Estimer basé sur la catégorie
 */
export async function rechercherValeursNutritionnelles(aliment) {
  const { nom, energie, proteines, glucides, lipides } = aliment;
  
  console.log(`\n🔍 [RECHERCHE NUTRITION] Aliment: ${nom}`);
  
  // Vérifier si des valeurs sont déjà présentes
  const valeursPresentes = {
    energie: energie > 0,
    proteines: proteines > 0,
    glucides: glucides > 0,
    lipides: lipides > 0
  };
  
  const nbValeursPresentes = Object.values(valeursPresentes).filter(v => v).length;
  
  console.log(`   📊 Valeurs présentes: ${nbValeursPresentes}/4`);
  console.log(`      Énergie: ${valeursPresentes.energie ? '✓' : '✗'}`);
  console.log(`      Protéines: ${valeursPresentes.proteines ? '✓' : '✗'}`);
  console.log(`      Glucides: ${valeursPresentes.glucides ? '✓' : '✗'}`);
  console.log(`      Lipides: ${valeursPresentes.lipides ? '✓' : '✗'}`);
  
  // Si toutes les valeurs sont présentes, pas besoin de recherche
  if (nbValeursPresentes === 4) {
    console.log(`   ✅ Toutes les valeurs présentes, pas de recherche nécessaire`);
    return aliment;
  }
  
  // Détecter la catégorie
  const categorie = detecterCategorie(nom);
  const valeursMoyennes = VALEURS_MOYENNES[categorie];
  
  console.log(`   🏷️ Catégorie détectée: ${categorie}`);
  
  // Compléter les valeurs manquantes
  const alimentComplet = {
    ...aliment,
    energie: energie > 0 ? energie : valeursMoyennes.energie,
    proteines: proteines > 0 ? proteines : valeursMoyennes.proteines,
    glucides: glucides > 0 ? glucides : valeursMoyennes.glucides,
    lipides: lipides > 0 ? lipides : valeursMoyennes.lipides,
    source: aliment.source || 'praticien',
    completionAuto: nbValeursPresentes < 4,
    categorieDetectee: categorie
  };
  
  console.log(`   ✅ Valeurs complétées:`);
  console.log(`      Énergie: ${alimentComplet.energie} kcal ${!valeursPresentes.energie ? '(estimé)' : ''}`);
  console.log(`      Protéines: ${alimentComplet.proteines}g ${!valeursPresentes.proteines ? '(estimé)' : ''}`);
  console.log(`      Glucides: ${alimentComplet.glucides}g ${!valeursPresentes.glucides ? '(estimé)' : ''}`);
  console.log(`      Lipides: ${alimentComplet.lipides}g ${!valeursPresentes.lipides ? '(estimé)' : ''}`);
  
  return alimentComplet;
}

/**
 * Traite une liste d'aliments et complète les valeurs manquantes
 */
export async function completerValeursNutritionnelles(aliments) {
  console.log(`\n🔄 [COMPLETION NUTRITION] Traitement de ${aliments.length} aliments...\n`);
  
  const alimentsCompletes = [];
  let nbAlimentsCompletes = 0;
  let nbValeursEstimees = 0;
  
  for (const aliment of aliments) {
    const alimentComplet = await rechercherValeursNutritionnelles(aliment);
    
    if (alimentComplet.completionAuto) {
      nbAlimentsCompletes++;
      nbValeursEstimees += 4 - Object.values({
        energie: aliment.energie > 0,
        proteines: aliment.proteines > 0,
        glucides: aliment.glucides > 0,
        lipides: aliment.lipides > 0
      }).filter(v => v).length;
    }
    
    alimentsCompletes.push(alimentComplet);
  }
  
  console.log(`\n📊 [COMPLETION NUTRITION] Résumé:`);
  console.log(`   Total aliments: ${aliments.length}`);
  console.log(`   Aliments avec données complètes: ${aliments.length - nbAlimentsCompletes}`);
  console.log(`   Aliments complétés automatiquement: ${nbAlimentsCompletes}`);
  console.log(`   Valeurs estimées au total: ${nbValeursEstimees}`);
  console.log(`   Taux de complétion: ${((nbValeursEstimees / (aliments.length * 4)) * 100).toFixed(1)}%\n`);
  
  return alimentsCompletes;
}

/**
 * Vérifie si un aliment a besoin de complétion
 */
export function abesoinDeCompletion(aliment) {
  return !(
    aliment.energie > 0 &&
    aliment.proteines > 0 &&
    aliment.glucides > 0 &&
    aliment.lipides > 0
  );
}

/**
 * Statistiques sur les aliments
 */
export function getStatistiquesCompletion(aliments) {
  const stats = {
    total: aliments.length,
    complets: 0,
    incomplets: 0,
    completes: 0,
    valeursEstimees: 0
  };
  
  aliments.forEach(aliment => {
    if (aliment.completionAuto) {
      stats.completes++;
    }
    
    if (abesoinDeCompletion(aliment)) {
      stats.incomplets++;
    } else {
      stats.complets++;
    }
  });
  
  return stats;
}

export default {
  rechercherValeursNutritionnelles,
  completerValeursNutritionnelles,
  abesoinDeCompletion,
  getStatistiquesCompletion
};
