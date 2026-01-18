/**
 * 🩺 PRACTITIONER STORAGE HYBRID - Stockage hybride Backend + LocalStorage
 * 
 * MODE HYBRIDE:
 * 1. PRIORITÉ AU BACKEND (fichiers partagés globalement)
 * 2. FALLBACK SUR LOCALSTORAGE (si backend indisponible)
 * 3. MIGRATION AUTOMATIQUE (localStorage → backend)
 * 
 * AVANTAGES:
 * ✅ Partage global des fichiers entre tous les utilisateurs
 * ✅ Versioning automatique
 * ✅ Pas de limite de taille (vs 5MB localStorage)
 * ✅ Backup et récupération facile
 * ✅ Fallback transparent si backend indisponible
 * ✅ Migration automatique des anciennes données
 */

import * as backendApi from '../services/practitionerApiService.js';

const STORAGE_KEY = 'nutriweek_practitioner_files';
const BACKEND_CHECK_INTERVAL = 30000; // 30 secondes

// État global du backend
let backendAvailable = null;
let lastBackendCheck = 0;

/**
 * Structure de données par défaut
 */
const DEFAULT_FILES = {
  alimentsPetitDej: null,
  alimentsDejeuner: null,
  alimentsDiner: null,
  fodmapList: null,
  reglesGenerales: null,
  pertePoidHomme: null,
  pertePoidFemme: null,
  vitalite: null,
  confortDigestif: null,
  metadata: {
    lastUpdated: null,
    uploadedBy: null,
    useUploadedFiles: false,
    storageMode: 'localStorage' // 'backend' ou 'localStorage'
  }
};

/**
 * Vérifie la disponibilité du backend
 * @returns {Promise<boolean>} true si backend disponible
 */
async function checkBackend() {
  const now = Date.now();
  
  // Cache le résultat pour éviter trop de requêtes
  if (backendAvailable !== null && (now - lastBackendCheck) < BACKEND_CHECK_INTERVAL) {
    return backendAvailable;
  }
  
  const result = await backendApi.checkBackendHealth();
  backendAvailable = result.success;
  lastBackendCheck = now;
  
  if (backendAvailable) {
    console.log('✅ Backend disponible - Mode: BACKEND');
  } else {
    console.warn('⚠️ Backend indisponible - Mode: LOCALSTORAGE (fallback)');
  }
  
  return backendAvailable;
}

/**
 * Obtenir tous les fichiers (backend ou localStorage)
 * @returns {Promise<Object>} Tous les fichiers
 */
export async function getAllFiles() {
  try {
    // Essayer d'abord le backend
    if (await checkBackend()) {
      const result = await backendApi.getAllFiles();
      
      if (result.success && result.data) {
        console.log('📥 Fichiers chargés depuis le BACKEND');
        
        // Convertir le format backend vers le format local
        const files = { ...DEFAULT_FILES };
        
        for (const [fileType, fileData] of Object.entries(result.data)) {
          if (fileData && fileData.currentVersion) {
            const version = fileData.currentVersion;
            files[fileType] = {
              name: version.originalName,
              type: version.mimetype,
              size: version.size,
              uploadedAt: version.uploadedAt,
              path: version.path, // Chemin backend
              version: version.version
            };
          }
        }
        
        files.metadata.storageMode = 'backend';
        files.metadata.lastUpdated = new Date().toISOString();
        
        return files;
      }
    }
    
    // Fallback sur localStorage
    console.log('📥 Fichiers chargés depuis LOCALSTORAGE (fallback)');
    return getAllFilesFromLocalStorage();
    
  } catch (error) {
    console.error('❌ Erreur getAllFiles:', error);
    // En cas d'erreur, utiliser localStorage
    return getAllFilesFromLocalStorage();
  }
}

/**
 * Obtenir tous les fichiers depuis localStorage
 * @returns {Object} Tous les fichiers
 */
function getAllFilesFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      data.metadata = data.metadata || DEFAULT_FILES.metadata;
      data.metadata.storageMode = 'localStorage';
      return data;
    }
    return { ...DEFAULT_FILES };
  } catch (error) {
    console.error('❌ Erreur lecture localStorage:', error);
    return { ...DEFAULT_FILES };
  }
}

/**
 * Sauvegarder un fichier (backend prioritaire)
 * @param {string} fileType - Type de fichier
 * @param {File} file - Fichier à sauvegarder
 * @returns {Promise<Object>} Résultat de la sauvegarde
 */
async function saveFile(fileType, file) {
  try {
    console.log(`💾 Sauvegarde ${fileType}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Essayer d'abord le backend
    if (await checkBackend()) {
      const result = await backendApi.uploadFile(fileType, file);
      
      if (result.success) {
        console.log(`✅ ${fileType} sauvegardé sur le BACKEND`);
        
        // Supprimer de localStorage si présent (migration)
        removeFromLocalStorage(fileType);
        
        return {
          success: true,
          mode: 'backend',
          data: result.data
        };
      }
    }
    
    // Fallback sur localStorage
    console.warn(`⚠️ Sauvegarde ${fileType} sur LOCALSTORAGE (fallback)`);
    return saveFileToLocalStorage(fileType, file);
    
  } catch (error) {
    console.error(`❌ Erreur sauvegarde ${fileType}:`, error);
    // En cas d'erreur, essayer localStorage
    return saveFileToLocalStorage(fileType, file);
  }
}

/**
 * Sauvegarder un fichier dans localStorage
 * @param {string} fileType - Type de fichier
 * @param {File} file - Fichier à sauvegarder
 * @returns {Promise<Object>} Résultat de la sauvegarde
 */
async function saveFileToLocalStorage(fileType, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const allFiles = getAllFilesFromLocalStorage();
        
        allFiles[fileType] = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result, // Base64
          uploadedAt: new Date().toISOString()
        };
        
        allFiles.metadata.lastUpdated = new Date().toISOString();
        allFiles.metadata.storageMode = 'localStorage';
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
        
        console.log(`✅ ${fileType} sauvegardé dans localStorage`);
        resolve({
          success: true,
          mode: 'localStorage',
          data: allFiles[fileType]
        });
      } catch (error) {
        console.error(`❌ Erreur sauvegarde localStorage ${fileType}:`, error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lecture fichier'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Supprimer un fichier de localStorage
 * @param {string} fileType - Type de fichier
 */
function removeFromLocalStorage(fileType) {
  try {
    const allFiles = getAllFilesFromLocalStorage();
    allFiles[fileType] = null;
    allFiles.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
    console.log(`🗑️ ${fileType} supprimé de localStorage`);
  } catch (error) {
    console.error(`❌ Erreur suppression localStorage ${fileType}:`, error);
  }
}

/**
 * Migrer les fichiers de localStorage vers le backend
 * @returns {Promise<Object>} Résultat de la migration
 */
export async function migrateToBackend() {
  try {
    console.log('🔄 Migration localStorage → Backend...');
    
    if (!(await checkBackend())) {
      return {
        success: false,
        error: 'Backend indisponible'
      };
    }
    
    const localFiles = getAllFilesFromLocalStorage();
    const fileTypes = Object.keys(localFiles).filter(key => 
      key !== 'metadata' && localFiles[key] !== null
    );
    
    const results = {
      success: 0,
      failed: 0,
      total: fileTypes.length
    };
    
    for (const fileType of fileTypes) {
      const fileData = localFiles[fileType];
      
      if (!fileData || !fileData.data) continue;
      
      try {
        // Convertir Base64 → Blob → File
        const base64Data = fileData.data.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.type });
        const file = new File([blob], fileData.name, { type: fileData.type });
        
        // Upload vers backend
        const result = await backendApi.uploadFile(fileType, file);
        
        if (result.success) {
          results.success++;
          console.log(`✅ ${fileType} migré`);
          
          // Supprimer de localStorage
          removeFromLocalStorage(fileType);
        } else {
          results.failed++;
          console.error(`❌ Échec migration ${fileType}:`, result.error);
        }
      } catch (error) {
        results.failed++;
        console.error(`❌ Erreur migration ${fileType}:`, error);
      }
    }
    
    console.log(`✅ Migration terminée: ${results.success}/${results.total} réussis`);
    
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Télécharger un fichier
 * @param {string} fileType - Type de fichier
 * @returns {Promise<File|null>} Fichier téléchargé
 */
export async function downloadFile(fileType) {
  try {
    // Essayer le backend d'abord
    if (await checkBackend()) {
      const result = await backendApi.downloadFile(fileType);
      
      if (result.success && result.data) {
        // Récupérer les métadonnées
        const fileInfo = await backendApi.getFile(fileType);
        const fileName = fileInfo.success && fileInfo.data 
          ? fileInfo.data.originalName 
          : `${fileType}.xlsx`;
        
        // Convertir Blob → File
        return backendApi.blobToFile(result.data, fileName, result.data.type);
      }
    }
    
    // Fallback sur localStorage
    const allFiles = getAllFilesFromLocalStorage();
    const fileData = allFiles[fileType];
    
    if (!fileData || !fileData.data) {
      return null;
    }
    
    // Convertir Base64 → File
    const base64Data = fileData.data.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileData.type });
    
    return new File([blob], fileData.name, { type: fileData.type });
    
  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileType}:`, error);
    return null;
  }
}

/**
 * Supprimer un fichier
 * @param {string} fileType - Type de fichier
 * @returns {Promise<boolean>} true si supprimé
 */
export async function deleteFile(fileType) {
  try {
    // Pour le backend, on ne peut pas vraiment supprimer (versioning)
    // Mais on peut supprimer de localStorage
    removeFromLocalStorage(fileType);
    
    console.log(`✅ ${fileType} supprimé`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur suppression ${fileType}:`, error);
    return false;
  }
}

/**
 * Réinitialiser tous les fichiers
 * @returns {Promise<boolean>} true si réinitialisé
 */
export async function resetAllFiles() {
  try {
    // Supprimer de localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Note: On ne supprime pas du backend (versioning)
    console.log('✅ Tous les fichiers réinitialisés (localStorage)');
    return true;
  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    return false;
  }
}

/**
 * Obtenir les statistiques de stockage
 * @returns {Promise<Object>} Statistiques
 */
export async function getStorageStats() {
  try {
    // Essayer le backend
    if (await checkBackend()) {
      const result = await backendApi.getStats();
      
      if (result.success) {
        return {
          mode: 'backend',
          ...result.data
        };
      }
    }
    
    // Fallback sur localStorage
    const allFiles = getAllFilesFromLocalStorage();
    const stats = {
      mode: 'localStorage',
      totalFiles: 0,
      totalSize: 0
    };
    
    for (const [key, value] of Object.entries(allFiles)) {
      if (key !== 'metadata' && value !== null) {
        stats.totalFiles++;
        stats.totalSize += value.size || 0;
      }
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    return { mode: 'error', totalFiles: 0, totalSize: 0 };
  }
}

// === VALIDATIONS ===

/**
 * Valider un fichier Excel
 */
function validateExcelFile(file) {
  const maxSize = 4 * 1024 * 1024; // 4 MB
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier invalide. Formats acceptés: .xls, .xlsx, .csv');
  }
  
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux. Maximum: 4 MB');
  }
}

/**
 * Valider un fichier Word/Text
 */
function validateWordFile(file) {
  const maxSize = 4 * 1024 * 1024; // 4 MB
  const allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier invalide. Formats acceptés: .doc, .docx, .txt');
  }
  
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux. Maximum: 4 MB');
  }
}

// === HELPERS ===

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// === EXPORTS DES FONCTIONS DE SAUVEGARDE ===

export const saveAlimentsPetitDej = async (file) => {
  validateExcelFile(file);
  return await saveFile('alimentsPetitDej', file);
};

export const saveAlimentsDejeuner = async (file) => {
  validateExcelFile(file);
  return await saveFile('alimentsDejeuner', file);
};

export const saveAlimentsDiner = async (file) => {
  validateExcelFile(file);
  return await saveFile('alimentsDiner', file);
};

export const saveFodmapList = async (file) => {
  validateExcelFile(file);
  return await saveFile('fodmapList', file);
};

export const saveReglesGenerales = async (file) => {
  validateWordFile(file);
  return await saveFile('reglesGenerales', file);
};

export const savePertePoidHomme = async (file) => {
  validateWordFile(file);
  return await saveFile('pertePoidHomme', file);
};

export const savePertePoidFemme = async (file) => {
  validateWordFile(file);
  return await saveFile('pertePoidFemme', file);
};

export const saveVitalite = async (file) => {
  validateWordFile(file);
  return await saveFile('vitalite', file);
};

export const saveConfortDigestif = async (file) => {
  validateWordFile(file);
  return await saveFile('confortDigestif', file);
};

export default {
  getAllFiles,
  downloadFile,
  deleteFile,
  resetAllFiles,
  getStorageStats,
  migrateToBackend,
  checkBackend,
  saveAlimentsPetitDej,
  saveAlimentsDejeuner,
  saveAlimentsDiner,
  saveFodmapList,
  saveReglesGenerales,
  savePertePoidHomme,
  savePertePoidFemme,
  saveVitalite,
  saveConfortDigestif
};
