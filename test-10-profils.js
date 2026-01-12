/**
 * TEST COMPLET - 10 PROFILS DIFFÉRENTS
 */

import { genererMenuHebdomadaire } from './src/utils/menuGeneratorCorrige.js';

const profils = [
  { nom: 'Homme - Perte de poids', poids: 85, taille: 180, age: 35, sexe: 'homme', objectif: 'perte', niveauActivite: 'modere' },
  { nom: 'Femme - Perte de poids', poids: 65, taille: 165, age: 28, sexe: 'femme', objectif: 'perte', niveauActivite: 'leger' },
  { nom: 'Homme - Maintien', poids: 75, taille: 175, age: 40, sexe: 'homme', objectif: 'maintien', niveauActivite: 'actif' },
  { nom: 'Femme - Maintien', poids: 60, taille: 168, age: 32, sexe: 'femme', objectif: 'maintien', niveauActivite: 'modere' },
  { nom: 'Homme - Prise de masse', poids: 70, taille: 178, age: 25, sexe: 'homme', objectif: 'prise', niveauActivite: 'tres_actif' },
  { nom: 'Femme - Prise de masse', poids: 55, taille: 162, age: 24, sexe: 'femme', objectif: 'prise', niveauActivite: 'actif' },
  { nom: 'Homme - Sédentaire', poids: 90, taille: 172, age: 50, sexe: 'homme', objectif: 'perte', niveauActivite: 'sedentaire' },
  { nom: 'Femme - Très active', poids: 58, taille: 170, age: 30, sexe: 'femme', objectif: 'maintien', niveauActivite: 'tres_actif' },
  { nom: 'Homme - Jeune', poids: 68, taille: 182, age: 22, sexe: 'homme', objectif: 'prise', niveauActivite: 'actif' },
  { nom: 'Femme - Senior', poids: 70, taille: 160, age: 60, sexe: 'femme', objectif: 'maintien', niveauActivite: 'leger' }
];

console.log('🧪 TEST COMPLET - 10 PROFILS DIFFÉRENTS\n');
console.log('='.repeat(80) + '\n');

let testsReussis = 0;
let testsEchoues = 0;
const resultats = [];

for (const profil of profils) {
  try {
    console.log(`\n📋 Test: ${profil.nom}`);
    console.log(`   ${profil.sexe}, ${profil.age}ans, ${profil.poids}kg, ${profil.taille}cm, ${profil.objectif}, ${profil.niveauActivite}`);
    
    const menuHebdo = await genererMenuHebdomadaire({ ...profil, allergies: [], preferences: [], jeuneIntermittent: false });
    
    const objectif = menuHebdo.metadata.besoins.caloriesJournalieres;
    const moyenne = menuHebdo.metadata.besoins.moyenneRéelle;
    const ecart = ((moyenne - objectif) / objectif) * 100;
    
    const reussi = Math.abs(ecart) <= 5;
    const status = reussi ? '✅' : '❌';
    
    console.log(`${status} Objectif: ${objectif} kcal → Moyenne: ${moyenne} kcal (écart: ${ecart.toFixed(2)}%)`);
    
    if (reussi) {
      testsReussis++;
    } else {
      testsEchoues++;
    }
    
    resultats.push({
      profil: profil.nom,
      objectif,
      moyenne,
      ecart: ecart.toFixed(2),
      reussi
    });
    
  } catch (error) {
    console.error(`❌ ERREUR: ${error.message}`);
    testsEchoues++;
    resultats.push({
      profil: profil.nom,
      erreur: error.message,
      reussi: false
    });
  }
}

console.log('\n' + '='.repeat(80));
console.log('📊 RÉSULTATS FINAUX\n');
console.log(`✅ Tests réussis: ${testsReussis}/${profils.length}`);
console.log(`❌ Tests échoués: ${testsEchoues}/${profils.length}`);
console.log(`📈 Taux de réussite: ${(testsReussis / profils.length * 100).toFixed(1)}%`);

console.log('\n📋 DÉTAILS:\n');
resultats.forEach((r, i) => {
  const status = r.reussi ? '✅' : '❌';
  if (r.erreur) {
    console.log(`${status} ${i + 1}. ${r.profil}: ERREUR - ${r.erreur}`);
  } else {
    console.log(`${status} ${i + 1}. ${r.profil}: ${r.objectif} kcal → ${r.moyenne} kcal (écart: ${r.ecart}%)`);
  }
});

if (testsReussis === profils.length) {
  console.log('\n🎉 TOUS LES TESTS ONT RÉUSSI ! Le générateur est CORRIGÉ !');
} else {
  console.log(`\n⚠️ ${testsEchoues} test(s) ont échoué. Vérifier les logs ci-dessus.`);
}
