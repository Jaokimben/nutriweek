import { calculateCalories, isAlimentAllowed, calculateGI } from './nutritionCalculator';

/**
 * Base de données de recettes par type d'aliment
 * Sera enrichie avec les aliments du CSV
 */
const recettesDatabase = {
  legumineuses: [
    { 
      nom: 'Salade de lentilles aux légumes', 
      type: 'dejeuner',
      ingredients: ['Lentille', 'Tomate', 'Concombre', 'Oignon', 'Huile d\'olive'],
      preparation: 'Mélanger les lentilles cuites avec les légumes coupés en dés. Assaisonner avec huile d\'olive, citron, sel et poivre.'
    },
    {
      nom: 'Curry de pois chiches',
      type: 'dejeuner',
      ingredients: ['Pois chiche', 'Lait de coco', 'Curry', 'Tomate', 'Oignon'],
      preparation: 'Faire revenir l\'oignon, ajouter les pois chiches, tomates et lait de coco. Laisser mijoter 20 min.'
    },
    {
      nom: 'Soupe de lentilles corail',
      type: 'diner',
      ingredients: ['Lentille corail', 'Carotte', 'Oignon', 'Cumin', 'Bouillon'],
      preparation: 'Faire revenir oignon et carotte, ajouter lentilles et bouillon. Cuire 15 min et mixer.'
    },
    {
      nom: 'Houmous de haricots blancs',
      type: 'snack',
      ingredients: ['Haricot blanc', 'Tahini', 'Citron', 'Ail', 'Huile d\'olive'],
      preparation: 'Mixer tous les ingrédients jusqu\'à obtenir une texture crémeuse.'
    },
    {
      nom: 'Dhal de lentilles',
      type: 'dejeuner',
      ingredients: ['Lentille', 'Curcuma', 'Gingembre', 'Ail', 'Tomate'],
      preparation: 'Cuire les lentilles avec les épices et tomates jusqu\'à obtenir une texture fondante.'
    }
  ],
  cereales: [
    {
      nom: 'Riz complet aux légumes',
      type: 'dejeuner',
      ingredients: ['Riz complet', 'Courgette', 'Poivron', 'Carotte'],
      preparation: 'Cuire le riz. Faire sauter les légumes et mélanger avec le riz.'
    },
    {
      nom: 'Quinoa bowl méditerranéen',
      type: 'dejeuner',
      ingredients: ['Quinoa', 'Tomate', 'Concombre', 'Feta', 'Olives'],
      preparation: 'Cuire le quinoa et servir avec les légumes frais et la feta émiettée.'
    },
    {
      nom: 'Porridge d\'avoine aux fruits',
      type: 'petitDejeuner',
      ingredients: ['Flocons d\'avoine', 'Lait d\'amande', 'Banane', 'Myrtilles', 'Cannelle'],
      preparation: 'Cuire les flocons dans le lait, ajouter fruits et cannelle.'
    },
    {
      nom: 'Salade de quinoa et légumes grillés',
      type: 'dejeuner',
      ingredients: ['Quinoa', 'Aubergine', 'Courgette', 'Poivron', 'Citron'],
      preparation: 'Griller les légumes, mélanger avec quinoa cuit et assaisonner.'
    },
    {
      nom: 'Riz basmati pilaf',
      type: 'dejeuner',
      ingredients: ['Riz basmati', 'Oignon', 'Épices', 'Raisins secs', 'Amandes'],
      preparation: 'Faire dorer l\'oignon, ajouter le riz et cuire avec bouillon et épices.'
    }
  ],
  petitDejeuner: [
    {
      nom: 'Porridge protéiné',
      type: 'petitDejeuner',
      ingredients: ['Flocons d\'avoine', 'Lait végétal', 'Graines de chia', 'Fruits rouges'],
      preparation: 'Cuire les flocons avec le lait, ajouter chia et fruits.'
    },
    {
      nom: 'Bowl d\'avoine overnight',
      type: 'petitDejeuner',
      ingredients: ['Flocons d\'avoine', 'Yaourt végétal', 'Fruits', 'Noix'],
      preparation: 'Mélanger tous les ingrédients la veille et laisser au frigo.'
    },
    {
      nom: 'Smoothie bowl énergisant',
      type: 'petitDejeuner',
      ingredients: ['Banane', 'Fruits rouges', 'Lait d\'amande', 'Granola', 'Graines'],
      preparation: 'Mixer les fruits avec le lait, servir dans un bol avec toppings.'
    }
  ],
  diner: [
    {
      nom: 'Soupe de légumes verts',
      type: 'diner',
      ingredients: ['Brocoli', 'Épinards', 'Courgette', 'Oignon', 'Bouillon'],
      preparation: 'Cuire tous les légumes dans le bouillon et mixer.'
    },
    {
      nom: 'Salade composée légère',
      type: 'diner',
      ingredients: ['Salade verte', 'Tomate', 'Concombre', 'Radis', 'Vinaigrette légère'],
      preparation: 'Laver et couper tous les légumes, assaisonner légèrement.'
    },
    {
      nom: 'Velouté de champignons',
      type: 'diner',
      ingredients: ['Champignons', 'Oignon', 'Ail', 'Bouillon', 'Herbes'],
      preparation: 'Faire revenir champignons et oignon, ajouter bouillon et mixer.'
    },
    {
      nom: 'Gaspacho de tomates',
      type: 'diner',
      ingredients: ['Tomate', 'Concombre', 'Poivron', 'Ail', 'Huile d\'olive'],
      preparation: 'Mixer tous les légumes crus avec huile d\'olive et vinaigre.'
    },
    {
      nom: 'Salade d\'épinards et avocat',
      type: 'diner',
      ingredients: ['Épinards', 'Avocat', 'Graines de courge', 'Citron'],
      preparation: 'Mélanger les épinards frais avec avocat tranché et graines.'
    }
  ]
};

/**
 * Génère un menu pour une journée
 * @param {Object} profile - Profil utilisateur
 * @param {Array} alimentsDisponibles - Liste des aliments disponibles
 * @param {Object} nutritionNeeds - Besoins nutritionnels
 * @returns {Object} - Menu de la journée
 */
const generateDayMenu = (profile, alimentsDisponibles, nutritionNeeds) => {
  const { objectif, nombreRepas, capaciteDigestive } = profile;
  const { mealDistribution } = nutritionNeeds;
  
  const menu = {};
  
  // Petit déjeuner (si 3 repas)
  if (nombreRepas === '3') {
    const petitDejRecettes = recettesDatabase.petitDejeuner;
    const recette = petitDejRecettes[Math.floor(Math.random() * petitDejRecettes.length)];
    menu.petitDejeuner = {
      ...recette,
      calories: mealDistribution.petitDejeuner,
      moment: 'Petit-déjeuner (8h-10h)'
    };
  }
  
  // Déjeuner - repas principal
  const dejeunerTypes = [...recettesDatabase.legumineuses, ...recettesDatabase.cereales]
    .filter(r => r.type === 'dejeuner');
  const recetteDejeuner = dejeunerTypes[Math.floor(Math.random() * dejeunerTypes.length)];
  menu.dejeuner = {
    ...recetteDejeuner,
    calories: mealDistribution.dejeuner,
    moment: 'Déjeuner (12h-14h)',
    note: 'Repas principal de la journée - Prenez votre temps pour mastiquer (minimum 20 secondes par bouchée)'
  };
  
  // Dîner - hypocalorique
  let dinerRecettes = recettesDatabase.diner;
  
  // Si reflux/rôt/nausée, privilégier les soupes et plats cuits
  if (capaciteDigestive.includes('Reflux gastrique') || 
      capaciteDigestive.includes('Rôt') || 
      capaciteDigestive.includes('Nausée')) {
    dinerRecettes = dinerRecettes.filter(r => 
      r.nom.includes('Soupe') || r.nom.includes('Velouté')
    );
  }
  
  const recetteDiner = dinerRecettes[Math.floor(Math.random() * dinerRecettes.length)];
  menu.diner = {
    ...recetteDiner,
    calories: mealDistribution.diner,
    moment: 'Dîner (18h-20h)',
    note: 'Repas léger - Pas de protéines animales, pas d\'amidon, pas de graisses'
  };
  
  return menu;
};

/**
 * Génère un menu hebdomadaire complet
 * @param {Object} profile - Profil utilisateur
 * @param {Array} alimentsDisponibles - Liste des aliments du CSV
 * @returns {Object} - Menu hebdomadaire avec conseils
 */
export const generateWeeklyMenu = (profile, alimentsDisponibles) => {
  const nutritionNeeds = calculateCalories(profile);
  const weekMenu = [];
  
  const joursIntermittent = [1, 3, 5, 6]; // Lundi, Mercredi, Vendredi, Samedi pour jeûne intermittent
  
  for (let day = 1; day <= 7; day++) {
    const dayMenu = generateDayMenu(profile, alimentsDisponibles, nutritionNeeds);
    
    // Appliquer le jeûne intermittent si objectif perte de poids
    const isJeuneIntermittent = profile.objectif === 'perte' && joursIntermittent.includes(day);
    
    if (isJeuneIntermittent) {
      delete dayMenu.diner;
      dayMenu.jeune = {
        type: 'Jeûne intermittent',
        message: 'Pas de dîner ce soir - Éviction du repas du soir',
        conseil: 'Buvez beaucoup d\'eau et des tisanes'
      };
    }
    
    weekMenu.push({
      jour: getDayName(day),
      date: getDateForDay(day),
      menu: dayMenu,
      jeune: isJeuneIntermittent
    });
  }
  
  return {
    semaine: weekMenu,
    nutritionNeeds,
    conseils: generateTips(profile)
  };
};

/**
 * Obtenir le nom du jour
 */
const getDayName = (dayNumber) => {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayNumber - 1));
  return jours[targetDate.getDay()];
};

/**
 * Obtenir la date pour un jour
 */
const getDateForDay = (dayNumber) => {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayNumber - 1));
  return targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

/**
 * Génère les conseils personnalisés
 */
const generateTips = (profile) => {
  const { objectif, capaciteDigestive, intolerances } = profile;
  const tips = [
    '💤 Respectez un sommeil de 8h minimum',
    '🚶 Faites 10 000 pas par jour',
    '⏱️ Tous les repas doivent être pris dans une plage de 8h',
    '🥄 Mastiquez chaque bouchée pendant minimum 20 secondes',
  ];
  
  if (objectif === 'perte') {
    tips.push('🚫 Évitez le pain, préférez les craquantes de sarrasin');
    tips.push('📊 Limitez les glucides à 100g par jour');
    tips.push('🥗 50% des légumes doivent être crus, 50% cuits');
    tips.push('🍫 Un carré de chocolat à 85% autorisé 3 fois par semaine');
    tips.push('⏰ Le repas du soir doit être le plus léger');
    tips.push('💧 Buvez 1,5 à 2L d\'eau par jour');
  }
  
  if (capaciteDigestive.includes('Reflux gastrique') || 
      capaciteDigestive.includes('Rôt') || 
      capaciteDigestive.includes('Nausée')) {
    tips.push('🫚 Buvez eau tiède + ¼ citron + gingembre avant chaque repas');
    tips.push('🍽️ Privilégiez les aliments cuits');
    tips.push('⏰ Dînez le plus tôt possible');
  }
  
  if (capaciteDigestive.includes('Ballonnement')) {
    tips.push('🌾 Alimentation pauvre en FODMAP recommandée');
    tips.push('🥛 Évitez les produits laitiers');
    
    if (capaciteDigestive.includes('Transit lent')) {
      tips.push('🌰 2 cuillères à café de graines de lin broyées le matin');
      tips.push('🍇 Ajoutez des pruneaux le matin ou le soir');
      tips.push('💧 Buvez 1,5 à 3L d\'eau par jour');
    }
  }
  
  if (intolerances.length > 0) {
    tips.push(`⚠️ Éviction complète de : ${intolerances.join(', ')}`);
  }
  
  return tips;
};

/**
 * Parse le fichier CSV des aliments
 */
export const parseAlimentsCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const aliments = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',');
    const aliment = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      // Convertir les valeurs numériques
      if (index > 0 && value && value !== '-' && value !== 'NaN') {
        aliment[header] = parseFloat(value) || value;
      } else {
        aliment[header] = value;
      }
    });
    
    if (aliment.alim_nom_fr && aliment.alim_nom_fr !== 'NaN') {
      aliments.push(aliment);
    }
  }
  
  return aliments;
};
