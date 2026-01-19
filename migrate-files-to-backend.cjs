#!/usr/bin/env node

/**
 * Script de Migration des Fichiers vers le Backend
 * 
 * Ce script migre tous les fichiers stockés dans localStorage
 * vers le backend serveur pour permettre le partage global.
 * 
 * Usage: node migrate-files-to-backend.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const STORAGE_KEY = 'nutriweek_practitioner_files';

// Fichiers de démonstration à créer
const DEMO_FILES = {
  alimentsPetitDej: {
    name: 'aliments_petit_dejeuner.xlsx',
    description: 'Liste des aliments autorisés pour le petit-déjeuner'
  },
  alimentsDejeuner: {
    name: 'aliments_dejeuner.xlsx',
    description: 'Liste des aliments autorisés pour le déjeuner'
  },
  alimentsDiner: {
    name: 'aliments_diner.xlsx',
    description: 'Liste des aliments autorisés pour le dîner'
  },
  fodmapList: {
    name: 'liste_fodmap.xlsx',
    description: 'Liste des aliments avec niveaux FODMAP'
  },
  reglesGenerales: {
    name: 'regles_generales.docx',
    description: 'Règles nutritionnelles générales'
  },
  pertePoidHomme: {
    name: 'perte_poids_homme.docx',
    description: 'Programme perte de poids pour homme'
  },
  pertePoidFemme: {
    name: 'perte_poids_femme.docx',
    description: 'Programme perte de poids pour femme'
  },
  vitalite: {
    name: 'programme_vitalite.docx',
    description: 'Programme vitalité'
  },
  confortDigestif: {
    name: 'confort_digestif.docx',
    description: 'Programme confort digestif avec FODMAP'
  }
};

/**
 * Convertit Base64 en Buffer
 */
function base64ToBuffer(base64String) {
  const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Upload un fichier vers le backend
 */
async function uploadFileToBackend(fileType, fileData) {
  try {
    console.log(`📤 Upload de ${fileType}...`);
    
    const form = new FormData();
    
    // Créer un buffer à partir des données Base64
    const buffer = base64ToBuffer(fileData.data);
    
    // Ajouter le fichier au formulaire
    form.append('file', buffer, {
      filename: fileData.name,
      contentType: fileData.type
    });
    
    // Ajouter le type de fichier
    form.append('fileType', fileType);
    
    // Envoyer la requête
    const response = await axios.post(
      `${BACKEND_URL}/api/files/upload`,
      form,
      {
        headers: {
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    if (response.data.success) {
      console.log(`✅ ${fileType} uploadé avec succès`);
      console.log(`   Version: ${response.data.version}`);
      console.log(`   Fichier: ${response.data.filename}`);
      return true;
    } else {
      console.error(`❌ Échec upload ${fileType}:`, response.data.error);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erreur upload ${fileType}:`, error.message);
    if (error.response) {
      console.error(`   Statut: ${error.response.status}`);
      console.error(`   Erreur: ${error.response.data?.error || 'Inconnue'}`);
    }
    return false;
  }
}

/**
 * Charge les fichiers depuis localStorage (simulé)
 */
function loadFilesFromStorage() {
  try {
    // Dans un navigateur, on utiliserait localStorage.getItem(STORAGE_KEY)
    // Ici on simule avec un fichier JSON
    const storageFile = path.join(__dirname, 'practitioner-files-backup.json');
    
    if (fs.existsSync(storageFile)) {
      console.log('📂 Chargement des fichiers depuis le backup...');
      const data = fs.readFileSync(storageFile, 'utf8');
      return JSON.parse(data);
    } else {
      console.log('⚠️  Aucun fichier de backup trouvé');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error.message);
    return null;
  }
}

/**
 * Crée un fichier de démonstration simple
 */
function createDemoFile(fileType, config) {
  const content = `Fichier de démonstration: ${config.description}\n\nCe fichier sera remplacé par les vrais fichiers du praticien.`;
  const buffer = Buffer.from(content, 'utf8');
  const base64 = buffer.toString('base64');
  
  // Détecter l'extension
  const ext = path.extname(config.name);
  let mimeType = 'application/octet-stream';
  
  if (ext === '.xlsx' || ext === '.xls') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (ext === '.docx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (ext === '.doc') {
    mimeType = 'application/msword';
  } else if (ext === '.csv') {
    mimeType = 'text/csv';
  } else if (ext === '.txt') {
    mimeType = 'text/plain';
  }
  
  return {
    name: config.name,
    type: mimeType,
    size: buffer.length,
    data: `data:${mimeType};base64,${base64}`,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Vérifier la connexion au backend
 */
async function checkBackendConnection() {
  try {
    console.log('🔍 Vérification de la connexion au backend...');
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 5000
    });
    
    if (response.data.status === 'ok') {
      console.log('✅ Backend connecté');
      console.log(`   Version: ${response.data.version}`);
      console.log(`   Uptime: ${Math.floor(response.data.uptime / 60)} minutes`);
      return true;
    } else {
      console.error('❌ Backend ne répond pas correctement');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Impossible de se connecter au backend:', error.message);
    console.log('💡 Assurez-vous que le backend est démarré sur', BACKEND_URL);
    return false;
  }
}

/**
 * Migration principale
 */
async function migrate() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MIGRATION DES FICHIERS VERS LE BACKEND SERVEUR      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // Vérifier la connexion
  const isConnected = await checkBackendConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  console.log('');
  
  // Charger les fichiers depuis localStorage (ou backup)
  let files = loadFilesFromStorage();
  
  // Si aucun fichier trouvé, créer des fichiers de démonstration
  if (!files) {
    console.log('📝 Création de fichiers de démonstration...\n');
    files = {};
    
    for (const [fileType, config] of Object.entries(DEMO_FILES)) {
      files[fileType] = createDemoFile(fileType, config);
      console.log(`   ✓ ${config.name} créé`);
    }
    
    console.log('');
  }
  
  // Upload des fichiers
  console.log('📤 Début de l\'upload des fichiers...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [fileType, fileData] of Object.entries(files)) {
    if (fileData && fileData.data) {
      const success = await uploadFileToBackend(fileType, fileData);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      console.log(`⏭️  ${fileType}: pas de données à uploader`);
    }
  }
  
  // Résumé
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  RÉSUMÉ DE LA MIGRATION                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Fichiers uploadés avec succès: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
  console.log(`📊 Total traité: ${successCount + failCount}`);
  console.log('');
  
  // Vérifier les fichiers sur le serveur
  try {
    console.log('🔍 Vérification des fichiers sur le serveur...\n');
    const response = await axios.get(`${BACKEND_URL}/api/files`);
    
    if (response.data.success) {
      const serverFiles = response.data.files;
      console.log(`📁 Fichiers disponibles sur le serveur: ${serverFiles.length}`);
      
      serverFiles.forEach(file => {
        if (file.currentVersion) {
          console.log(`   ✓ ${file.fileType}: v${file.currentVersion.version} (${file.currentVersion.name})`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
  
  console.log('\n✅ Migration terminée !');
  console.log('💡 Les fichiers sont maintenant disponibles pour tous les utilisateurs\n');
}

// Exécution
if (require.main === module) {
  migrate().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { migrate, uploadFileToBackend };
