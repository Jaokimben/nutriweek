#!/usr/bin/env node

/**
 * Script de Migration Séquentielle des Fichiers vers le Backend
 * 
 * Upload un fichier à la fois avec délai entre les uploads
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const DELAY_MS = 500; // Délai entre les uploads

// Fichiers de démonstration
const DEMO_FILES = {
  alimentsPetitDej: { name: 'aliments_petit_dejeuner.xlsx', description: 'Liste des aliments autorisés pour le petit-déjeuner' },
  alimentsDejeuner: { name: 'aliments_dejeuner.xlsx', description: 'Liste des aliments autorisés pour le déjeuner' },
  alimentsDiner: { name: 'aliments_diner.xlsx', description: 'Liste des aliments autorisés pour le dîner' },
  fodmapList: { name: 'liste_fodmap.xlsx', description: 'Liste des aliments avec niveaux FODMAP' },
  reglesGenerales: { name: 'regles_generales.docx', description: 'Règles nutritionnelles générales' },
  pertePoidHomme: { name: 'perte_poids_homme.docx', description: 'Programme perte de poids pour homme' },
  pertePoidFemme: { name: 'perte_poids_femme.docx', description: 'Programme perte de poids pour femme' },
  vitalite: { name: 'programme_vitalite.docx', description: 'Programme vitalité' },
  confortDigestif: { name: 'confort_digestif.docx', description: 'Programme confort digestif avec FODMAP' }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createDemoFile(fileType, config) {
  const content = `Fichier de démonstration: ${config.description}\n\nCe fichier sera remplacé par les vrais fichiers du praticien.`;
  const buffer = Buffer.from(content, 'utf8');
  const base64 = buffer.toString('base64');
  
  const ext = path.extname(config.name);
  let mimeType = 'application/octet-stream';
  
  if (ext === '.xlsx' || ext === '.xls') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (ext === '.docx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  
  return { buffer, name: config.name, mimeType };
}

async function uploadFileToBackend(fileType, buffer, filename, mimeType) {
  try {
    console.log(`📤 Upload de ${fileType}...`);
    
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mimeType });
    form.append('fileType', fileType);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/files/upload`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 10000
      }
    );
    
    if (response.data.success) {
      console.log(`✅ ${fileType} uploadé avec succès`);
      return true;
    } else {
      console.error(`❌ Échec upload ${fileType}:`, response.data.error);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erreur upload ${fileType}:`, error.message);
    return false;
  }
}

async function checkBackendConnection() {
  try {
    console.log('🔍 Vérification de la connexion au backend...');
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    
    if (response.data.status === 'ok') {
      console.log('✅ Backend connecté\n');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Backend non accessible:', error.message);
    return false;
  }
}

async function migrate() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MIGRATION SÉQUENTIELLE - FICHIERS → BACKEND         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (!await checkBackendConnection()) {
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [fileType, config] of Object.entries(DEMO_FILES)) {
    const { buffer, name, mimeType } = createDemoFile(fileType, config);
    const success = await uploadFileToBackend(fileType, buffer, name, mimeType);
    
    if (success) successCount++;
    else failCount++;
    
    // Attendre avant le prochain upload
    await delay(DELAY_MS);
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  RÉSUMÉ DE LA MIGRATION                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Fichiers uploadés: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  console.log(`📊 Total: ${successCount + failCount}\n`);
  
  // Vérifier les fichiers sur le serveur
  try {
    console.log('🔍 Vérification des fichiers sur le serveur...\n');
    const response = await axios.get(`${BACKEND_URL}/api/files`);
    
    if (response.data.success) {
      const serverFiles = response.data.files;
      const filesList = Object.entries(serverFiles).filter(([_, data]) => data.current);
      console.log(`📁 Fichiers disponibles: ${filesList.length}\n`);
      
      filesList.forEach(([type, data]) => {
        console.log(`   ✓ ${type}: ${data.current.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur vérification:', error.message);
  }
  
  console.log('\n✅ Migration terminée !\n');
}

if (require.main === module) {
  migrate().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { migrate };
