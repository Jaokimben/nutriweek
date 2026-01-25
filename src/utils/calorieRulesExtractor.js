/**
 * 🔢 EXTRACTEUR DE RÈGLES CALORIQUES
 * 
 * Détecte et extrait les limites caloriques des documents Word praticien
 * Exemples de règles détectées:
 * - "Limite de 1500 kcal/jour pendant les 3 premières semaines"
 * - "Maximum 1800 calories par jour"
 * - "Ne pas dépasser 2000 kcal quotidiennes"
 * - "Entre 1400 et 1600 kcal/jour"
 */

/**
 * Patterns de détection des limites caloriques
 */
const PATTERNS_CALORIES = [
  // Pattern 1: "X kcal/jour" ou "X calories par jour"
  /(\d{3,4})\s*(kcal|calories)\s*(?:par|\/)\s*jour/gi,
  
  // Pattern 2: "limite de X kcal"
  /limite\s*(?:de)?\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 3: "maximum X kcal"
  /maximum\s*(?:de)?\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 4: "ne pas dépasser X kcal"
  /ne\s*pas\s*dépasser\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 5: "entre X et Y kcal"
  /entre\s*(\d{3,4})\s*et\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 6: "X à Y kcal"
  /(\d{3,4})\s*à\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 7: "consommer X kcal"
  /consommer\s*(?:environ)?\s*(\d{3,4})\s*(kcal|calories)/gi,
  
  // Pattern 8: "apport de X kcal"
  /apport\s*(?:de|calorique)?\s*(?:de)?\s*(\d{3,4})\s*(kcal|calories)/gi
];

/**
 * Patterns de détection des durées/périodes
 */
const PATTERNS_DUREE = [
  // "pendant X semaines"
  /pendant\s*(?:les)?\s*(\d+)\s*(?:premières?)?\s*semaines?/gi,
  
  // "durant X semaines"
  /durant\s*(?:les)?\s*(\d+)\s*(?:premières?)?\s*semaines?/gi,
  
  // "les X premières semaines"
  /les\s*(\d+)\s*premières?\s*semaines?/gi,
  
  // "X premières semaines"
  /(\d+)\s*premières?\s*semaines?/gi,
  
  // "pour X jours"
  /pour\s*(\d+)\s*jours?/gi,
  
  // "phase de X semaines"
  /phase\s*de\s*(\d+)\s*semaines?/gi
];

/**
 * Structure d'une règle calorique extraite
 * @typedef {Object} RegleCalorique
 * @property {number} caloriesMin - Calories minimum (ou limite exacte)
 * @property {number|null} caloriesMax - Calories maximum (si plage)
 * @property {number|null} dureeSemaines - Durée en semaines (null si indéfini)
 * @property {string} contexte - Phrase complète d'où la règle est extraite
 * @property {string} type - Type de règle: 'limite_max', 'limite_exacte', 'plage'
 */

/**
 * Extrait les règles caloriques d'un texte
 * @param {string} texte - Texte du document Word
 * @returns {RegleCalorique[]} Liste des règles caloriques détectées
 */
export function extraireReglesCaloriques(texte) {
  if (!texte || texte.trim().length === 0) {
    return [];
  }
  
  const reglesCaloriques = [];
  
  console.log(`\n🔍 Recherche règles caloriques dans le texte...`);
  
  // Découper le texte en phrases
  const phrases = texte.split(/[.!?]+/).filter(p => p.trim().length > 10);
  
  for (const phrase of phrases) {
    const phraseLower = phrase.toLowerCase();
    
    // Vérifier chaque pattern de calories
    for (const pattern of PATTERNS_CALORIES) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(phraseLower);
      
      if (match) {
        const caloriesMin = parseInt(match[1]);
        let caloriesMax = null;
        let type = 'limite_max';
        
        // Vérifier si c'est une plage (entre X et Y)
        if (match[2] && !isNaN(parseInt(match[2]))) {
          caloriesMax = parseInt(match[2]);
          type = 'plage';
        }
        
        // Extraire la durée si mentionnée
        let dureeSemaines = null;
        for (const patternDuree of PATTERNS_DUREE) {
          patternDuree.lastIndex = 0;
          const matchDuree = patternDuree.exec(phraseLower);
          if (matchDuree) {
            dureeSemaines = parseInt(matchDuree[1]);
            break;
          }
        }
        
        const regle = {
          caloriesMin,
          caloriesMax,
          dureeSemaines,
          contexte: phrase.trim(),
          type,
          source: 'document_praticien'
        };
        
        console.log(`  ✅ Règle calorique détectée:`);
        console.log(`     📊 Calories: ${caloriesMin}${caloriesMax ? `-${caloriesMax}` : ''} kcal`);
        console.log(`     ⏱️ Durée: ${dureeSemaines ? `${dureeSemaines} semaines` : 'non spécifiée'}`);
        console.log(`     📝 Contexte: "${phrase.trim()}"`);
        
        reglesCaloriques.push(regle);
        break; // Une seule règle par phrase
      }
    }
  }
  
  console.log(`\n📊 Total règles caloriques trouvées: ${reglesCaloriques.length}`);
  
  return reglesCaloriques;
}

/**
 * Applique les règles caloriques au calcul des besoins
 * @param {number} caloriesCalculees - Calories calculées par BMR/TDEE
 * @param {RegleCalorique[]} reglesCaloriques - Règles caloriques du praticien
 * @param {Object} profil - Profil utilisateur (pour vérifier durée)
 * @returns {{calories: number, regleAppliquee: RegleCalorique|null, ajustement: string}}
 */
export function appliquerReglesCaloriques(caloriesCalculees, reglesCaloriques, profil = {}) {
  if (!reglesCaloriques || reglesCaloriques.length === 0) {
    console.log(`\n⚙️ Aucune règle calorique praticien → Utilisation calcul standard`);
    return {
      calories: caloriesCalculees,
      regleAppliquee: null,
      ajustement: 'Aucune règle praticien - Calcul BMR/TDEE standard'
    };
  }
  
  console.log(`\n⚙️ Application des règles caloriques praticien...`);
  console.log(`  📊 Calories calculées (BMR/TDEE): ${caloriesCalculees} kcal`);
  
  // Trier les règles par priorité:
  // 1. Règles avec durée (plus spécifiques)
  // 2. Règles sans durée (générales)
  const reglesAvecDuree = reglesCaloriques.filter(r => r.dureeSemaines !== null);
  const reglesSansDuree = reglesCaloriques.filter(r => r.dureeSemaines === null);
  
  const reglesPrioritaires = [...reglesAvecDuree, ...reglesSansDuree];
  
  // Appliquer la première règle trouvée
  for (const regle of reglesPrioritaires) {
    console.log(`  🔍 Évaluation règle: ${regle.caloriesMin}${regle.caloriesMax ? `-${regle.caloriesMax}` : ''} kcal`);
    
    // Si la règle a une durée, vérifier qu'on est dans la période
    if (regle.dureeSemaines !== null) {
      // TODO: Ajouter vérification de la semaine actuelle du programme
      // Pour l'instant, on applique toujours si durée spécifiée
      console.log(`  ⏱️ Règle temporelle: ${regle.dureeSemaines} semaines`);
    }
    
    let caloriesFinales;
    let ajustement;
    
    if (regle.type === 'plage') {
      // Plage: choisir la valeur la plus proche dans la plage
      if (caloriesCalculees < regle.caloriesMin) {
        caloriesFinales = regle.caloriesMin;
        ajustement = `Augmenté à ${regle.caloriesMin} kcal (minimum de la plage)`;
      } else if (caloriesCalculees > regle.caloriesMax) {
        caloriesFinales = regle.caloriesMax;
        ajustement = `Réduit à ${regle.caloriesMax} kcal (maximum de la plage)`;
      } else {
        caloriesFinales = caloriesCalculees;
        ajustement = `Maintenu à ${caloriesCalculees} kcal (dans la plage autorisée)`;
      }
    } else {
      // Limite max ou exacte
      if (caloriesCalculees > regle.caloriesMin) {
        caloriesFinales = regle.caloriesMin;
        ajustement = `Réduit à ${regle.caloriesMin} kcal (limite praticien)`;
      } else {
        caloriesFinales = caloriesCalculees;
        ajustement = `Maintenu à ${caloriesCalculees} kcal (sous la limite)`;
      }
    }
    
    console.log(`  ✅ Règle appliquée: ${ajustement}`);
    console.log(`  📝 Contexte: "${regle.contexte}"`);
    
    return {
      calories: Math.round(caloriesFinales),
      regleAppliquee: regle,
      ajustement
    };
  }
  
  // Aucune règle applicable
  return {
    calories: caloriesCalculees,
    regleAppliquee: null,
    ajustement: 'Aucune règle applicable - Calcul BMR/TDEE standard'
  };
}

/**
 * Charge et applique les règles caloriques du praticien
 * @param {string} texteDocument - Texte du document Word
 * @param {number} caloriesCalculees - Calories calculées par BMR/TDEE
 * @param {Object} profil - Profil utilisateur
 * @returns {{calories: number, regles: RegleCalorique[], regleAppliquee: RegleCalorique|null}}
 */
export function chargerEtAppliquerReglesCaloriques(texteDocument, caloriesCalculees, profil = {}) {
  console.log(`\n🔢 ====== TRAITEMENT RÈGLES CALORIQUES PRATICIEN ======`);
  
  // Extraire les règles
  const regles = extraireReglesCaloriques(texteDocument);
  
  // Appliquer les règles
  const resultat = appliquerReglesCaloriques(caloriesCalculees, regles, profil);
  
  return {
    calories: resultat.calories,
    regles,
    regleAppliquee: resultat.regleAppliquee,
    ajustement: resultat.ajustement
  };
}

export default {
  extraireReglesCaloriques,
  appliquerReglesCaloriques,
  chargerEtAppliquerReglesCaloriques
};
