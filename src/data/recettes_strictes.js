/**
 * Base de données de recettes utilisant UNIQUEMENT les aliments autorisés
 * du fichier Excel "Composition Aliments version simplifiee"
 * 
 * Liste des 18 aliments autorisés :
 * - Fève, bouillie/cuite à l'eau
 * - Haricot blanc, bouilli/cuit à l'eau
 * - Lentille, bouillie/cuite à l'eau
 * - Pois cassé, bouilli/cuit à l'eau
 * - Pois chiche, appertisé, égoutté
 * - Fève, pelée, surgelée, cuite à l'eau
 * - Lentille corail, bouillie/cuite à l'eau
 * - Légume sec, cuit (aliment moyen)
 * - Riz complet, cuit, non salé
 * - Riz blanc, cuit, non salé
 * - Riz thaï, cuit, non salé
 * - Riz basmati, cuit, non salé
 * - Flocons d'avoine, bouillis/cuits à l'eau
 * - Orge perlée, bouilli/cuite à l'eau, non salée
 * - Quinoa, bouilli/cuit à l'eau, non salé
 * - Boulgour de blé, cuit, non salé
 * - Pâtes sèches standard, cuites, non salées
 * - Baguette céréales
 */

export const recettesStrictesDatabase = {
  // ========== PETIT-DÉJEUNER ==========
  petitDejeuner: [
    {
      nom: "Porridge d'avoine",
      type: "dejeuner",
      ingredients: {
        "Flocons d'avoine, bouillis/cuits à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les flocons d'avoine cuits chauds."
    },
    {
      nom: "Tartines de baguette céréales",
      type: "dejeuner",
      ingredients: {
        "Baguette céréales": { quantite: 60, unite: "g" }
      },
      preparation: "Couper la baguette en tranches et servir."
    }
  ],

  // ========== DÉJEUNER - LÉGUMINEUSES ==========
  legumineuses: [
    {
      nom: "Salade de lentilles",
      type: "diner",
      ingredients: {
        "Lentille, bouillie/cuite à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les lentilles cuites en salade."
    },
    {
      nom: "Lentilles corail",
      type: "diner",
      ingredients: {
        "Lentille corail, bouillie/cuite à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les lentilles corail cuites."
    },
    {
      nom: "Haricots blancs",
      type: "diner",
      ingredients: {
        "Haricot blanc, bouilli/cuit à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les haricots blancs cuits."
    },
    {
      nom: "Pois chiches",
      type: "diner",
      ingredients: {
        "Pois chiche, appertisé, égoutté": { quantite: 200, unite: "g" }
      },
      preparation: "Égoutter et servir les pois chiches."
    },
    {
      nom: "Pois cassés",
      type: "diner",
      ingredients: {
        "Pois cassé, bouilli/cuit à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les pois cassés cuits."
    },
    {
      nom: "Fèves cuites",
      type: "diner",
      ingredients: {
        "Fève, bouillie/cuite à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les fèves cuites."
    },
    {
      nom: "Fèves surgelées",
      type: "diner",
      ingredients: {
        "Fève, pelée, surgelée, cuite à l'eau": { quantite: 200, unite: "g" }
      },
      preparation: "Cuire les fèves surgelées et servir."
    },
    {
      nom: "Mélange de légumes secs",
      type: "diner",
      ingredients: {
        "Légume sec, cuit (aliment moyen)": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le mélange de légumes secs cuits."
    }
  ],

  // ========== DÉJEUNER - CÉRÉALES ==========
  cereales: [
    {
      nom: "Riz complet nature",
      type: "diner",
      ingredients: {
        "Riz complet, cuit, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le riz complet cuit."
    },
    {
      nom: "Riz blanc nature",
      type: "diner",
      ingredients: {
        "Riz blanc, cuit, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le riz blanc cuit."
    },
    {
      nom: "Riz thaï",
      type: "diner",
      ingredients: {
        "Riz thaï, cuit, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le riz thaï cuit."
    },
    {
      nom: "Riz basmati",
      type: "diner",
      ingredients: {
        "Riz basmati, cuit, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le riz basmati cuit."
    },
    {
      nom: "Quinoa nature",
      type: "diner",
      ingredients: {
        "Quinoa, bouilli/cuit à l'eau, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le quinoa cuit."
    },
    {
      nom: "Boulgour",
      type: "diner",
      ingredients: {
        "Boulgour de blé, cuit, non salé": { quantite: 200, unite: "g" }
      },
      preparation: "Servir le boulgour cuit."
    },
    {
      nom: "Orge perlée",
      type: "diner",
      ingredients: {
        "Orge perlée, bouilli/cuite à l'eau, non salée": { quantite: 200, unite: "g" }
      },
      preparation: "Servir l'orge perlée cuite."
    },
    {
      nom: "Pâtes nature",
      type: "diner",
      ingredients: {
        "Pâtes sèches standard, cuites, non salées": { quantite: 200, unite: "g" }
      },
      preparation: "Servir les pâtes cuites."
    }
  ],

  // ========== RECETTES COMPOSÉES ==========
  recettesComposees: [
    {
      nom: "Riz aux lentilles",
      type: "diner",
      ingredients: {
        "Riz complet, cuit, non salé": { quantite: 100, unite: "g" },
        "Lentille, bouillie/cuite à l'eau": { quantite: 100, unite: "g" }
      },
      preparation: "Mélanger le riz et les lentilles cuits."
    },
    {
      nom: "Quinoa aux pois chiches",
      type: "diner",
      ingredients: {
        "Quinoa, bouilli/cuit à l'eau, non salé": { quantite: 100, unite: "g" },
        "Pois chiche, appertisé, égoutté": { quantite: 100, unite: "g" }
      },
      preparation: "Mélanger le quinoa et les pois chiches."
    },
    {
      nom: "Boulgour aux fèves",
      type: "diner",
      ingredients: {
        "Boulgour de blé, cuit, non salé": { quantite: 100, unite: "g" },
        "Fève, bouillie/cuite à l'eau": { quantite: 100, unite: "g" }
      },
      preparation: "Mélanger le boulgour et les fèves."
    },
    {
      nom: "Pâtes aux haricots blancs",
      type: "diner",
      ingredients: {
        "Pâtes sèches standard, cuites, non salées": { quantite: 100, unite: "g" },
        "Haricot blanc, bouilli/cuit à l'eau": { quantite: 100, unite: "g" }
      },
      preparation: "Mélanger les pâtes et les haricots blancs."
    },
    {
      nom: "Riz basmati aux lentilles corail",
      type: "diner",
      ingredients: {
        "Riz basmati, cuit, non salé": { quantite: 100, unite: "g" },
        "Lentille corail, bouillie/cuite à l'eau": { quantite: 100, unite: "g" }
      },
      preparation: "Mélanger le riz basmati et les lentilles corail."
    }
  ],

  // ========== DÎNER LÉGER ==========
  dinerLeger: [
    {
      nom: "Porridge d'avoine du soir",
      type: "diner",
      ingredients: {
        "Flocons d'avoine, bouillis/cuits à l'eau": { quantite: 150, unite: "g" }
      },
      preparation: "Servir les flocons d'avoine cuits."
    },
    {
      nom: "Lentilles légères",
      type: "diner",
      ingredients: {
        "Lentille corail, bouillie/cuite à l'eau": { quantite: 150, unite: "g" }
      },
      preparation: "Servir les lentilles corail cuites."
    },
    {
      nom: "Riz blanc léger",
      type: "diner",
      ingredients: {
        "Riz blanc, cuit, non salé": { quantite: 150, unite: "g" }
      },
      preparation: "Servir le riz blanc cuit."
    },
    {
      nom: "Quinoa léger",
      type: "diner",
      ingredients: {
        "Quinoa, bouilli/cuit à l'eau, non salé": { quantite: 150, unite: "g" }
      },
      preparation: "Servir le quinoa cuit."
    }
  ]
}

// Fonction pour obtenir toutes les recettes
export const getToutesLesRecettes = () => {
  return [
    ...recettesStrictesDatabase.petitDejeuner,
    ...recettesStrictesDatabase.legumineuses,
    ...recettesStrictesDatabase.cereales,
    ...recettesStrictesDatabase.recettesComposees,
    ...recettesStrictesDatabase.dinerLeger
  ]
}

// Fonction pour obtenir les recettes par type de repas
export const getRecettesParType = (type) => {
  const toutesRecettes = getToutesLesRecettes()
  return toutesRecettes.filter(r => r.type === type)
}

// Fonction pour obtenir une recette aléatoire
export const getRecetteAleatoire = (type = null, excludeNames = []) => {
  let recettes = type ? getRecettesParType(type) : getToutesLesRecettes()
  
  // Exclure les recettes déjà utilisées
  if (excludeNames.length > 0) {
    recettes = recettes.filter(r => !excludeNames.includes(r.nom))
  }
  
  if (recettes.length === 0) {
    // Si toutes les recettes ont été utilisées, réinitialiser
    recettes = type ? getRecettesParType(type) : getToutesLesRecettes()
  }
  
  const randomIndex = Math.floor(Math.random() * recettes.length)
  return recettes[randomIndex]
}
