import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Fonction helper pour parser
function isRowEmpty(row) {
  if (!row || row.length === 0) return true;
  return row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
}

const files = [
  '/home/user/uploaded_files/Aliments Petit Dejeuner.xlsx',
  '/home/user/uploaded_files/Aliments Dejeuner.xlsx',
  '/home/user/uploaded_files/Aliments Diner.xlsx'
];

for (const filepath of files) {
  const filename = filepath.split('/').pop();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST PARSING: ${filename}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    const buffer = readFileSync(filepath);
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Total lignes: ${jsonData.length}`);
    
    // Ligne 1 = en-têtes
    const headers = jsonData[0];
    console.log(`✅ En-têtes (ligne 1): ${headers[0]}, ${headers[1]}, ${headers[2]}...`);
    
    // Parser à partir de ligne 2
    let aliments = 0;
    let lignesVides = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (isRowEmpty(row)) {
        lignesVides++;
        continue;
      }
      
      const nom = row[0];
      if (nom && String(nom).trim().length > 0) {
        aliments++;
        if (aliments <= 5) {
          console.log(`   ✓ Aliment ${aliments}: ${nom}`);
        }
      }
    }
    
    console.log(`\n📊 Résultat:`);
    console.log(`   Aliments trouvés: ${aliments}`);
    console.log(`   Lignes vides ignorées: ${lignesVides}`);
    console.log(`   Status: ${aliments > 0 ? '✅ OK' : '❌ ÉCHEC'}`);
    
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

console.log(`\n${'='.repeat(80)}\n`);
