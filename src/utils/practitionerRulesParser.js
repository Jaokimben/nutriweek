/**
 * 📝 PARSER DE RÈGLES PRATICIEN
 * 
 * Parse et applique les règles des documents Word uploadés par le praticien:
 * - reglesGenerales.docx : Règles générales pour tous les menus
 * - pertePoidHomme.docx : Règles spécifiques perte de poids homme
 * - pertePoidFemme.docx : Règles spécifiques perte de poids femme
 * - vitalite.docx : Règles pour l'objectif vitalité
 */

import { getAllFiles } from './practitionerStorageV2.js';
import mammoth from 'mammoth';

/**
 * Parse un fichier Word (.docx) depuis base64
 */
async function parseWordFromBase64(base64Data) {
  try {
    // Extraire le base64 pur (sans le préfixe data:)
    const base64 = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    // Convertir base64 en buffer
    const buffer = Buffer.from(base64, 'base64');
    
    // Utiliser mammoth pour extraire le texte
    const result = await mammoth.extractRawText({ buffer });
    
    return result.value; // Texte brut du document
  } catch (error) {
    console.error('❌ Erreur parsing Word:', error);
    throw new Error(`Impossible de parser le fichier Word: ${error.message}`);
  }
}

/**
 * Parse les règles d'un texte
 * Détecte automatiquement les patterns de règles
 */
function parseRegles(texte) {
  if (!texte || texte.trim().length === 0) {
    return [];
  }
  
  const regles = [];
  
  // Pattern 1: Lignes commençant par - ou * ou •
  const lignesAvecPuces = texte.match(/^[\-\*•]\s*(.+)$/gm);
  if (lignesAvecPuces) {
    lignesAvecPuces.forEach(ligne => {
      const regle = ligne.replace(/^[\-\*•]\s*/, '').trim();
      if (regle.length > 5) { // Ignorer les lignes trop courtes
        regles.push({
          type: 'contrainte',
          texte: regle,
          source: 'document_praticien'
        });
      }
    });
  }
  
  // Pattern 2: Lignes avec des chiffres (1. 2. 3. ou 1) 2) 3))
  const lignesNumerotees = texte.match(/^\d+[\.\)]\s*(.+)$/gm);
  if (lignesNumerotees) {
    lignesNumerotees.forEach(ligne => {
      const regle = ligne.replace(/^\d+[\.\)]\s*/, '').trim();
      if (regle.length > 5) {
        regles.push({
          type: 'contrainte',
          texte: regle,
          source: 'document_praticien'
        });
      }
    });
  }
  
  // Pattern 3: Mots-clés spéciaux
  const motsClesToInterdit = [
    'interdit', 'interdire', 'ne pas', 'éviter', 'exclure',
    'bannir', 'supprimer', 'enlever', 'retirer'
  ];
  
  const motsClesTobliger = [
    'obligatoire', 'nécessaire', 'essentiel', 'impératif',
    'doit', 'doivent', 'il faut', 'toujours'
  ];
  
  // Détecter les interdictions
  motsClesToInterdit.forEach(motCle => {
    const regex = new RegExp(`${motCle}[^.!?]*[.!?]`, 'gi');
    const matches = texte.match(regex);
    if (matches) {
      matches.forEach(match => {
        regles.push({
          type: 'interdiction',
          texte: match.trim(),
          source: 'document_praticien'
        });
      });
    }
  });
  
  // Détecter les obligations
  motsClesTobliger.forEach(motCle => {
    const regex = new RegExp(`${motCle}[^.!?]*[.!?]`, 'gi');
    const matches = texte.match(regex);
    if (matches) {
      matches.forEach(match => {
        regles.push({
          type: 'obligation',
          texte: match.trim(),
          source: 'document_praticien'
        });
      });
    }
  });
  
  // Si aucune règle structurée n'est trouvée, découper par phrases
  if (regles.length === 0) {
    const phrases = texte.split(/[.!?]+/).filter(p => p.trim().length > 10);
    phrases.forEach(phrase => {
      regles.push({
        type: 'recommandation',
        texte: phrase.trim(),
        source: 'document_praticien'
      });
    });
  }
  
  return regles;
}

/**
 * Charge toutes les règles praticien
 */
export async function chargerReglesPraticien(profil) {
  try {
    const files = getAllFiles();
    const reglesChargees = {
      generales: [],
      specifiques: [],
      toutesLesRegles: [],
      texteComplet: {
        generales: '',
        specifiques: ''
      },
      requireFODMAP: false  // 🆕 Flag pour filtrage FODMAP
    };
    
    console.log('📋 Chargement des règles praticien...');
    
    // 1. Charger les règles générales (pour tous)
    if (files.reglesGenerales && files.reglesGenerales.data) {
      console.log('  📄 Chargement règles générales...');
      const texte = await parseWordFromBase64(files.reglesGenerales.data);
      reglesChargees.texteComplet.generales = texte;
      reglesChargees.generales = parseRegles(texte);
      console.log(`  ✅ ${reglesChargees.generales.length} règles générales chargées`);
    }
    
    // 2. Charger les règles spécifiques selon profil
    if (profil.objectif === 'perte') {
      const fichierPerte = profil.sexe === 'homme' 
        ? files.pertePoidHomme 
        : files.pertePoidFemme;
      
      if (fichierPerte && fichierPerte.data) {
        console.log(`  📄 Chargement règles perte de poids ${profil.sexe}...`);
        const texte = await parseWordFromBase64(fichierPerte.data);
        reglesChargees.texteComplet.specifiques = texte;
        reglesChargees.specifiques = parseRegles(texte);
        console.log(`  ✅ ${reglesChargees.specifiques.length} règles spécifiques chargées`);
      }
    } else if (profil.objectif === 'maintien') {
      // Pour l'objectif maintien/vitalité
      if (files.vitalite && files.vitalite.data) {
        console.log('  📄 Chargement règles vitalité...');
        const texte = await parseWordFromBase64(files.vitalite.data);
        reglesChargees.texteComplet.specifiques = texte;
        reglesChargees.specifiques = parseRegles(texte);
        console.log(`  ✅ ${reglesChargees.specifiques.length} règles vitalité chargées`);
      }
    } else if (profil.objectif === 'confort_digestif' || profil.objectif === 'confort') {
      // 🆕 Pour l'objectif confort digestif
      if (files.confortDigestif && files.confortDigestif.data) {
        console.log('  📄 Chargement règles confort digestif...');
        const texte = await parseWordFromBase64(files.confortDigestif.data);
        reglesChargees.texteComplet.specifiques = texte;
        reglesChargees.specifiques = parseRegles(texte);
        console.log(`  ✅ ${reglesChargees.specifiques.length} règles confort digestif chargées`);
        
        // 🆕 Détecter si FODMAP est mentionné dans les règles
        const requireFODMAP = detecterMentionFODMAP(texte);
        if (requireFODMAP) {
          console.log('  🚫 Mention FODMAP détectée → Filtrage FODMAP sera appliqué');
          reglesChargees.requireFODMAP = true;
        }
      }
    }
    
    // Combiner toutes les règles
    reglesChargees.toutesLesRegles = [
      ...reglesChargees.generales,
      ...reglesChargees.specifiques
    ];
    
    console.log(`✅ Total: ${reglesChargees.toutesLesRegles.length} règles chargées`);
    
    return reglesChargees;
    
  } catch (error) {
    console.error('❌ Erreur chargement règles praticien:', error);
    return {
      generales: [],
      specifiques: [],
      toutesLesRegles: [],
      texteComplet: { generales: '', specifiques: '' }
    };
  }
}

/**
 * Détecte si le texte mentionne FODMAP
 */
function detecterMentionFODMAP(texte) {
  const motsClesFODMAP = [
    'fodmap',
    'pauvre en fodmap',
    'pauvres en fodmap',
    'éviter fodmap',
    'aliments fodmap',
    'sans fodmap',
    'low fodmap',
    'ballonnement',
    'ballonnements'
  ];
  
  const texteLower = texte.toLowerCase();
  const mentionTrouvee = motsClesFODMAP.some(mc => texteLower.includes(mc));
  
  if (mentionTrouvee) {
    console.log(`  🔍 Mention FODMAP détectée dans le document`);
  }
  
  return mentionTrouvee;
}

/**
 * Extrait les aliments interdits des règles
 */
export function extraireAlimentsInterdits(regles) {
  const interdits = new Set();
  
  regles.forEach(regle => {
    if (regle.type === 'interdiction') {
      const texte = regle.texte.toLowerCase();
      
      // Liste d'aliments communs à détecter
      const alimentsCommuns = [
        'pain', 'pâtes', 'riz', 'pomme de terre', 'patate',
        'sucre', 'sel', 'huile', 'beurre', 'fromage',
        'lait', 'yaourt', 'œuf', 'poulet', 'viande',
        'poisson', 'légume', 'fruit', 'céréale',
        'chocolat', 'gâteau', 'biscuit', 'soda',
        'alcool', 'café', 'thé', 'glace'
      ];
      
      alimentsCommuns.forEach(aliment => {
        if (texte.includes(aliment)) {
          interdits.add(aliment);
        }
      });
    }
  });
  
  return Array.from(interdits);
}

/**
 * Extrait les aliments obligatoires des règles
 */
export function extraireAlimentsObligatoires(regles) {
  const obligatoires = new Set();
  
  regles.forEach(regle => {
    if (regle.type === 'obligation') {
      const texte = regle.texte.toLowerCase();
      
      // Détecter les mentions d'aliments dans les obligations
      const alimentsCommuns = [
        'légume', 'fruit', 'protéine', 'eau',
        'fibre', 'vitamine', 'minéral'
      ];
      
      alimentsCommuns.forEach(aliment => {
        if (texte.includes(aliment)) {
          obligatoires.add(aliment);
        }
      });
    }
  });
  
  return Array.from(obligatoires);
}

/**
 * Extrait les quantités maximales/minimales des règles
 */
export function extraireQuantites(regles) {
  const quantites = {
    max: {},
    min: {}
  };
  
  regles.forEach(regle => {
    const texte = regle.texte;
    
    // Pattern: "maximum X g/ml de Y"
    const maxMatch = texte.match(/maximum\s+(\d+)\s*(g|ml|grammes?|kg)\s+de\s+(\w+)/i);
    if (maxMatch) {
      const [, quantite, unite, aliment] = maxMatch;
      quantites.max[aliment.toLowerCase()] = {
        quantite: parseInt(quantite),
        unite: unite.toLowerCase()
      };
    }
    
    // Pattern: "minimum X g/ml de Y"
    const minMatch = texte.match(/minimum\s+(\d+)\s*(g|ml|grammes?|kg)\s+de\s+(\w+)/i);
    if (minMatch) {
      const [, quantite, unite, aliment] = minMatch;
      quantites.min[aliment.toLowerCase()] = {
        quantite: parseInt(quantite),
        unite: unite.toLowerCase()
      };
    }
  });
  
  return quantites;
}

/**
 * Vérifie si un aliment est autorisé selon les règles
 */
export function verifierAlimentAutorise(aliment, regles) {
  const alimentsInterdits = extraireAlimentsInterdits(regles);
  const nomAliment = aliment.nom.toLowerCase();
  
  // Vérifier si l'aliment est dans la liste des interdits
  return !alimentsInterdits.some(interdit => 
    nomAliment.includes(interdit) || interdit.includes(nomAliment)
  );
}

/**
 * Applique les règles à un menu généré
 */
export function appliquerReglesAuMenu(menu, regles, profil) {
  console.log('🔍 Application des règles praticien au menu...');
  
  const alimentsInterdits = extraireAlimentsInterdits(regles);
  const alimentsObligatoires = extraireAlimentsObligatoires(regles);
  const quantites = extraireQuantites(regles);
  
  console.log('  📋 Aliments interdits:', alimentsInterdits);
  console.log('  ✅ Aliments obligatoires:', alimentsObligatoires);
  console.log('  📏 Quantités:', quantites);
  
  let menuValide = true;
  const violations = [];
  
  // Vérifier chaque jour
  menu.semaine.forEach(jour => {
    Object.values(jour.menu).forEach(repas => {
      if (repas && repas.ingredients) {
        repas.ingredients.forEach(ingredient => {
          const nomIng = ingredient.nom.toLowerCase();
          
          // Vérifier les interdictions
          alimentsInterdits.forEach(interdit => {
            if (nomIng.includes(interdit)) {
              menuValide = false;
              violations.push({
                jour: jour.jour,
                repas: repas.type,
                aliment: ingredient.nom,
                raison: `Aliment interdit: ${interdit}`,
                regle: 'interdiction'
              });
            }
          });
          
          // Vérifier les quantités max
          Object.entries(quantites.max).forEach(([aliment, limite]) => {
            if (nomIng.includes(aliment)) {
              const quantiteIng = ingredient.quantite;
              if (quantiteIng > limite.quantite) {
                violations.push({
                  jour: jour.jour,
                  repas: repas.type,
                  aliment: ingredient.nom,
                  raison: `Quantité excessive: ${quantiteIng}${ingredient.unite} (max: ${limite.quantite}${limite.unite})`,
                  regle: 'quantite_max'
                });
              }
            }
          });
          
          // Vérifier les quantités min
          Object.entries(quantites.min).forEach(([aliment, limite]) => {
            if (nomIng.includes(aliment)) {
              const quantiteIng = ingredient.quantite;
              if (quantiteIng < limite.quantite) {
                violations.push({
                  jour: jour.jour,
                  repas: repas.type,
                  aliment: ingredient.nom,
                  raison: `Quantité insuffisante: ${quantiteIng}${ingredient.unite} (min: ${limite.quantite}${limite.unite})`,
                  regle: 'quantite_min'
                });
              }
            }
          });
        });
      }
    });
  });
  
  if (violations.length > 0) {
    console.log('⚠️ Violations détectées:', violations.length);
    violations.forEach(v => {
      console.log(`  - ${v.jour} ${v.repas}: ${v.aliment} → ${v.raison}`);
    });
  } else {
    console.log('✅ Aucune violation des règles praticien');
  }
  
  return {
    valide: menuValide && violations.length === 0,
    violations
  };
}

/**
 * Obtient un résumé des règles pour affichage
 */
export function obtenirResumRegles(regles) {
  const resume = {
    total: regles.length,
    parType: {
      interdiction: regles.filter(r => r.type === 'interdiction').length,
      obligation: regles.filter(r => r.type === 'obligation').length,
      recommandation: regles.filter(r => r.type === 'recommandation').length,
      contrainte: regles.filter(r => r.type === 'contrainte').length
    },
    alimentsInterdits: extraireAlimentsInterdits(regles),
    alimentsObligatoires: extraireAlimentsObligatoires(regles),
    quantites: extraireQuantites(regles)
  };
  
  return resume;
}

export default {
  chargerReglesPraticien,
  extraireAlimentsInterdits,
  extraireAlimentsObligatoires,
  extraireQuantites,
  verifierAlimentAutorise,
  appliquerReglesAuMenu,
  obtenirResumRegles
};
