/**
 * Système intelligent de mapping d'aliments
 * Utilise une approche générative pour créer un index entre les noms d'ingrédients
 * dans les recettes et les noms dans la base de données nutritionnelle
 */

/**
 * Normalise un nom d'aliment pour la recherche
 * @param {string} nom - Nom de l'aliment
 * @returns {string} Nom normalisé
 */
export const normalizeAlimentName = (nom) => {
  if (!nom) return '';
  
  return nom.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/\uFFFD/g, "") // Enlever caractères UTF-8 malformés
    .replace(/['']/g, ' ') // Remplacer apostrophes
    .replace(/\b(d|l|de|du|des|la|le|les)\s+/g, ' ') // Enlever articles
    .replace(/[^\w\s]/g, ' ') // Remplacer ponctuation par espaces
    .replace(/\s+/g, ' ') // Consolider espaces
    .trim();
};

/**
 * Extrait les mots-clés principaux d'un nom d'aliment
 * @param {string} nom - Nom de l'aliment
 * @returns {Array<string>} Liste de mots-clés
 */
export const extractKeywords = (nom) => {
  const normalized = normalizeAlimentName(nom);
  
  // Mots à ignorer (stopwords)
  const stopwords = new Set([
    'cru', 'cuit', 'cuite', 'cuites', 'cuits',
    'frais', 'fraiche', 'fraiches',
    'bouillie', 'bouilli', 'bouillis', 'bouillies',
    'appertise', 'appertises',
    'egoutte', 'egouttee', 'egouttees',
    'surgele', 'surgelee', 'surgelees', 'surgeles',
    'seche', 'sechee', 'sechees', 'seches',
    'entier', 'entiere', 'entieres', 'entiers',
    'moyen', 'moyenne', 'moyennes', 'moyens',
    'bio', 'biologique', 'biologiques',
    'eau', 'sans', 'avec', 'nature', 'naturel', 'naturelle',
    'sec', 'seche', 'secs', 'seches',
    'vegetal', 'vegetale', 'vegetaux', 'vegetales',
    'concentre', 'concentree', 'concentres',
    'poudre', 'flocons', 'flocon',
    'rape', 'rapee', 'rapes', 'rapees',
    'emince', 'emincee', 'eminces', 'emincees',
    'coupe', 'coupee', 'coupes', 'coupees',
    'tranche', 'tranchee', 'tranches', 'tranchees'
  ]);
  
  const words = normalized.split(' ').filter(w => w.length > 2 && !stopwords.has(w));
  
  // Retourner les mots par ordre de priorité
  return words;
};

/**
 * Calcule un score de similarité entre deux noms d'aliments
 * @param {string} name1 - Premier nom
 * @param {string} name2 - Deuxième nom
 * @returns {number} Score de 0 à 100
 */
export const calculateSimilarity = (name1, name2) => {
  const keywords1 = extractKeywords(name1);
  const keywords2 = extractKeywords(name2);
  
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  // Vérifier les correspondances exactes de mots-clés
  let exactMatches = 0;
  keywords1.forEach(kw1 => {
    keywords2.forEach(kw2 => {
      if (kw1 === kw2) {
        exactMatches++;
      } else if (kw1.includes(kw2) || kw2.includes(kw1)) {
        exactMatches += 0.5;
      }
    });
  });
  
  // Score basé sur le ratio de correspondances
  const maxPossibleMatches = Math.min(keywords1.length, keywords2.length);
  const score = (exactMatches / maxPossibleMatches) * 100;
  
  return Math.min(100, score);
};

/**
 * Recherche intelligente d'un aliment dans la base de données
 * @param {string} ingredientName - Nom de l'ingrédient recherché
 * @param {Object} alimentsDB - Base de données d'aliments {nom: {...nutritions}}
 * @param {number} threshold - Seuil de similarité minimum (défaut: 40)
 * @returns {Object|null} Aliment trouvé avec son score, ou null
 */
export const findBestMatch = (ingredientName, alimentsDB, threshold = 40) => {
  if (!ingredientName || !alimentsDB) return null;
  
  const alimentsArray = Object.values(alimentsDB);
  if (alimentsArray.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  // Normaliser le nom recherché
  const searchNormalized = normalizeAlimentName(ingredientName);
  const searchKeywords = extractKeywords(ingredientName);
  
  // Parcourir tous les aliments
  alimentsArray.forEach(aliment => {
    const alimentNormalized = normalizeAlimentName(aliment.nom || aliment.alim_nom_fr);
    
    // Correspondance exacte du nom complet
    if (searchNormalized === alimentNormalized) {
      bestMatch = aliment;
      bestScore = 100;
      return;
    }
    
    // Correspondance partielle du nom complet
    if (alimentNormalized.includes(searchNormalized) || searchNormalized.includes(alimentNormalized)) {
      const score = 90;
      if (score > bestScore) {
        bestMatch = aliment;
        bestScore = score;
      }
    }
    
    // Correspondance par mots-clés
    const score = calculateSimilarity(ingredientName, aliment.nom || aliment.alim_nom_fr);
    if (score > bestScore) {
      bestMatch = aliment;
      bestScore = score;
    }
  });
  
  // Retourner le meilleur match si le score dépasse le seuil
  if (bestScore >= threshold) {
    console.log(`✅ Match trouvé: "${ingredientName}" → "${bestMatch.nom || bestMatch.alim_nom_fr}" (score: ${bestScore.toFixed(0)}%)`);
    return { aliment: bestMatch, score: bestScore };
  }
  
  console.warn(`❌ Aucun match: "${ingredientName}" (meilleur score: ${bestScore.toFixed(0)}%)`);
  return null;
};

/**
 * Mapping manuel de secours pour les cas difficiles
 * Priorité sur le mapping automatique
 */
export const manualMapping = {
  // Légumineuses
  'lentilles vertes': ['lentille', 'bouillie', 'cuite'],
  'lentilles corail': ['lentille corail', 'bouillie', 'cuite'],
  'lentille': ['lentille', 'bouillie', 'cuite'],
  'pois chiches': ['pois chiche', 'appertise'],
  'pois chiche': ['pois chiche', 'appertise'],
  'haricots blancs': ['haricot blanc', 'bouilli', 'cuit'],
  'haricot blanc': ['haricot blanc', 'bouilli', 'cuit'],
  'feve': ['feve', 'bouillie', 'cuite'],
  'pois casses': ['pois casse', 'bouilli', 'cuit'],
  
  // Céréales
  'riz complet': ['riz complet', 'cuit'],
  'riz basmati': ['riz blanc', 'cuit'],
  'riz': ['riz blanc', 'cuit'],
  'quinoa': ['quinoa', 'cuit'],
  'flocons avoine': ['flocon avoine'],
  'avoine': ['flocon avoine'],
  'boulgour': ['boulgour', 'cuit'],
  
  // Produits laitiers végétaux
  'lait amande': ['lait soja'],
  'lait vegetal': ['lait soja'],
  'lait coco': ['coco lait'],
  'yaourt vegetal': ['yaourt soja'],
  'creme soja': ['creme soja'],
  
  // Légumes
  'tomate': ['tomate', 'cru'],
  'tomates cerises': ['tomate cerise', 'cru'],
  'concombre': ['concombre', 'pulpe'],
  'courgette': ['courgette', 'pulpe'],
  'carotte': ['carotte', 'cru'],
  'oignon': ['oignon', 'cru'],
  'ail': ['ail', 'cru'],
  'epinards': ['epinard', 'cru'],
  'brocoli': ['brocoli', 'cuit'],
  'champignons': ['champignon', 'paris'],
  
  // Fruits
  'banane': ['banane', 'cru'],
  'pomme': ['pomme', 'cru'],
  'fraise': ['fraise', 'cru'],
  'myrtille': ['myrtille', 'cru'],
  'avocat': ['avocat', 'cru'],
  
  // Huiles et graisses
  'huile olive': ['huile olive'],
  'huile tournesol': ['huile tournesol'],
  
  // Graines et noix
  'amande': ['amande'],
  'noix': ['noix'],
  'graines chia': ['chia', 'graine'],
  'graines lin': ['lin', 'graine'],
  'graines courge': ['courge', 'graine'],
  'graines tournesol': ['tournesol', 'graine'],
  'cajou': ['cajou']
};

/**
 * Recherche avec mapping manuel en priorité
 * @param {string} ingredientName - Nom de l'ingrédient
 * @param {Object} alimentsDB - Base de données
 * @returns {Object|null} Résultat de la recherche
 */
export const findWithManualMapping = (ingredientName, alimentsDB) => {
  const normalized = normalizeAlimentName(ingredientName);
  
  // Chercher dans le mapping manuel
  for (const [key, keywords] of Object.entries(manualMapping)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      // Utiliser les mots-clés du mapping manuel pour chercher
      const searchTerm = keywords.join(' ');
      console.log(`🔍 Mapping manuel: "${ingredientName}" → "${searchTerm}"`);
      
      const result = findBestMatch(searchTerm, alimentsDB, 30);
      if (result) return result;
    }
  }
  
  // Sinon, recherche automatique
  return findBestMatch(ingredientName, alimentsDB);
};
