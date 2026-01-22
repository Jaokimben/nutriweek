/**
 * 🩺 PRACTITIONER STORAGE V2 - Backend + LocalStorage Hybride
 * 
 * Version hybride qui utilise:
 * 1. Backend API (prioritaire) - Partage global entre tous les utilisateurs
 * 2. LocalStorage (fallback) - Si backend indisponible
 * 
 * Migration: localStorage → Backend serveur
 * Avantages: Fichiers partagés globalement + Versioning automatique
 */

import * as API from './practitionerApiService.js';

const STORAGE_KEY = 'nutriweek_practitioner_files';
const USE_BACKEND = true; // Flag pour activer/désactiver le backend

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
    source: 'none' // 'backend', 'localStorage', or 'none'
  }
};

/**
 * Vérifie la disponibilité du backend
 */
let backendAvailable = null;
export async function checkBackendAvailability() {
  if (backendAvailable !== null) {
    return backendAvailable;
  }
  
  try {
    const health = await API.checkBackendHealth();
    backendAvailable = health.status === 'ok';
    console.log(`🔌 Backend ${backendAvailable ? 'disponible' : 'indisponible'}`);
    return backendAvailable;
  } catch (error) {
    backendAvailable = false;
    console.warn('⚠️ Backend indisponible, utilisation localStorage');
    return false;
  }
}

/**
 * Sauvegarder un fichier (Backend + Fallback localStorage)
 */
export const saveFile = async (fileType, file) => {
  try {
    if (!file) {
      throw new Error('Fichier manquant');
    }

    // Validation taille (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    console.log(`💾 [saveFile] Upload ${fileType}: ${file.name}`);

    // Essayer backend en premier si activé
    if (USE_BACKEND) {
      const isBackendUp = await checkBackendAvailability();
      
      if (isBackendUp) {
        try {
          const result = await API.uploadFile(fileType, file);
          console.log(`✅ [saveFile] Fichier sauvegardé sur backend:`, result);
          return { success: true, fileName: file.name, source: 'backend' };
        } catch (backendError) {
          console.warn('⚠️ [saveFile] Backend échoué, fallback vers localStorage:', backendError.message);
          // Continue vers localStorage fallback
        }
      }
    }

    // Fallback: LocalStorage
    console.log('📦 [saveFile] Utilisation localStorage (fallback)');
    const base64 = await fileToBase64(file);
    const allFiles = getFilesFromLocalStorage();
    
    allFiles[fileType] = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      uploadedAt: new Date().toISOString()
    };
    
    allFiles.metadata.lastUpdated = new Date().toISOString();
    allFiles.metadata.source = 'localStorage';
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
    console.log(`✅ [saveFile] Fichier sauvegardé dans localStorage`);
    
    return { success: true, fileName: file.name, source: 'localStorage' };

  } catch (error) {
    console.error(`❌ Erreur sauvegarde ${fileType}:`, error);
    throw error;
  }
};

/**
 * Obtenir tous les fichiers (Backend prioritaire, localStorage fallback)
 */
export const getAllFiles = async () => {
  try {
    console.log('🔍 [getAllFiles] Récupération des fichiers...');

    // Essayer backend en premier si activé
    if (USE_BACKEND) {
      const isBackendUp = await checkBackendAvailability();
      
      if (isBackendUp) {
        try {
          const backendFiles = await API.getAllFiles();
          
          if (backendFiles.success && backendFiles.files) {
            console.log('✅ [getAllFiles] Fichiers récupérés du backend');
            return convertBackendFilesToFormat(backendFiles.files);
          }
        } catch (backendError) {
          console.warn('⚠️ [getAllFiles] Backend échoué, fallback localStorage:', backendError.message);
          // Continue vers localStorage
        }
      }
    }

    // Fallback: LocalStorage
    console.log('📦 [getAllFiles] Lecture depuis localStorage (fallback)');
    return getFilesFromLocalStorage();

  } catch (error) {
    console.error('❌ [getAllFiles] Erreur:', error);
    return { ...DEFAULT_FILES };
  }
};

/**
 * Convertir le format backend vers le format frontend
 */
function convertBackendFilesToFormat(backendFiles) {
  const result = { ...DEFAULT_FILES };
  
  Object.keys(backendFiles).forEach(fileType => {
    const fileInfo = backendFiles[fileType];
    
    if (fileInfo.current) {
      result[fileType] = {
        name: fileInfo.current.originalName,
        type: fileInfo.current.mimetype || 'application/octet-stream',
        size: fileInfo.current.size,
        data: null, // Les données seront chargées à la demande
        uploadedAt: fileInfo.current.uploadedAt,
        version: fileInfo.current.version,
        path: fileInfo.current.path
      };
    }
  });
  
  result.metadata.source = 'backend';
  result.metadata.useUploadedFiles = true;
  
  return result;
}

/**
 * Lire depuis localStorage
 */
function getFilesFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      console.log('⚠️ localStorage vide, retour valeurs par défaut');
      return { ...DEFAULT_FILES };
    }
    
    const parsed = JSON.parse(data);
    console.log('✅ Fichiers chargés depuis localStorage');
    
    return parsed;
  } catch (error) {
    console.error('❌ Erreur lecture localStorage:', error);
    return { ...DEFAULT_FILES };
  }
}

/**
 * Fonctions de sauvegarde spécifiques (wrapper autour de saveFile)
 */
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

/**
 * Validation des fichiers
 */
export const validateExcelFile = (file) => {
  const allowedExtensions = ['.xls', '.xlsx', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Format non autorisé. Utilisez: ${allowedExtensions.join(', ')}`);
  }
};

export const validateWordFile = (file) => {
  const allowedExtensions = ['.doc', '.docx', '.txt'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Format non autorisé. Utilisez: ${allowedExtensions.join(', ')}`);
  }
};

/**
 * Convertir fichier en Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Obtenir les statistiques de stockage
 */
export const getStorageStats = async () => {
  const files = await getAllFiles();
  
  let totalSize = 0;
  let uploadedCount = 0;
  
  Object.keys(DEFAULT_FILES).forEach(key => {
    if (key !== 'metadata' && files[key]) {
      totalSize += files[key].size || 0;
      uploadedCount++;
    }
  });
  
  return {
    totalFiles: uploadedCount,
    totalSize: totalSize,
    maxSize: 50 * 1024 * 1024, // 50MB max total
    percentUsed: (totalSize / (50 * 1024 * 1024)) * 100,
    source: files.metadata?.source || 'none',
    backendAvailable: await checkBackendAvailability()
  };
};

/**
 * Activer/Désactiver l'utilisation des fichiers uploadés
 */
export const activateUploadedFiles = async () => {
  console.log('✅ Activation des fichiers uploadés');
  
  if (USE_BACKEND && await checkBackendAvailability()) {
    // Backend: les fichiers sont automatiquement actifs
    console.log('📡 Backend mode: fichiers déjà actifs automatiquement');
    return { success: true, source: 'backend', message: 'Fichiers backend déjà actifs' };
  } else {
    // localStorage: mettre à jour le flag
    const allFiles = getFilesFromLocalStorage();
    allFiles.metadata.useUploadedFiles = true;
    allFiles.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
    console.log('💾 localStorage: fichiers activés');
    return { success: true, source: 'localStorage', message: 'Fichiers activés avec succès' };
  }
};

export const deactivateUploadedFiles = async () => {
  console.log('⚠️ Désactivation des fichiers uploadés');
  
  const allFiles = getFilesFromLocalStorage();
  allFiles.metadata.useUploadedFiles = false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
  return { success: true };
};

export const getActivationStatus = async () => {
  try {
    const files = await getAllFiles();
    
    // Avec le backend, les fichiers sont toujours actifs si présents
    const isActive = USE_BACKEND && await checkBackendAvailability() 
      ? true 
      : files.metadata?.useUploadedFiles || false;
    
    // Construire la liste des fichiers uploadés
    const uploadedFiles = [];
    if (files.alimentsPetitDej) uploadedFiles.push('Petit-Déjeuner');
    if (files.alimentsDejeuner) uploadedFiles.push('Déjeuner');
    if (files.alimentsDiner) uploadedFiles.push('Dîner');
    if (files.fodmapList) uploadedFiles.push('FODMAP');
    if (files.reglesGenerales) uploadedFiles.push('Règles Générales');
    if (files.pertePoidHomme) uploadedFiles.push('Perte Poids Homme');
    if (files.pertePoidFemme) uploadedFiles.push('Perte Poids Femme');
    if (files.vitalite) uploadedFiles.push('Vitalité');
    if (files.confortDigestif) uploadedFiles.push('Confort Digestif');
    
    // Au moins un fichier Excel requis
    const hasExcelFiles = !!(files.alimentsPetitDej || files.alimentsDejeuner || files.alimentsDiner);
    
    return {
      isActive,
      uploadedFiles,
      hasExcelFiles,
      lastUpdated: files.metadata?.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erreur getActivationStatus:', error);
    return {
      isActive: false,
      uploadedFiles: [],
      hasExcelFiles: false,
      lastUpdated: null
    };
  }
};

/**
 * Télécharger un fichier
 */
export const downloadFile = async (fileType) => {
  try {
    const files = await getAllFiles();
    const file = files[fileType];

    if (!file) {
      throw new Error('Fichier non trouvé');
    }

    // Si fichier depuis backend, télécharger via API
    if (files.metadata?.source === 'backend' && file.path) {
      const blob = await API.downloadFile(fileType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
      return { success: true };
    }

    // Sinon, depuis localStorage (base64)
    if (file.data) {
      const byteString = atob(file.data.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: file.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
      return { success: true };
    }

    throw new Error('Données du fichier non disponibles');

  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileType}:`, error);
    throw error;
  }
};

/**
 * Supprimer un fichier
 */
export const deleteFile = async (fileType) => {
  try {
    // Note: Suppression non implémentée côté backend pour l'instant
    // On supprime seulement dans localStorage
    
    const allFiles = getFilesFromLocalStorage();
    allFiles[fileType] = null;
    allFiles.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
    
    console.log(`✅ Fichier ${fileType} supprimé (localStorage)`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Erreur suppression ${fileType}:`, error);
    throw error;
  }
};

/**
 * Réinitialiser tous les fichiers
 */
export const resetAllFiles = async () => {
  console.log('🗑️ Réinitialisation de tous les fichiers...');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
  return { success: true };
};

/**
 * Exporter tous les fichiers
 */
export const exportAllFiles = async () => {
  const files = await getAllFiles();
  const dataStr = JSON.stringify(files, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = window.URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutriweek_files_${Date.now()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};

/**
 * Importer tous les fichiers
 */
export const importAllFiles = async (jsonFile) => {
  const text = await jsonFile.text();
  const data = JSON.parse(text);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log('✅ Fichiers importés avec succès');
  
  return { success: true };
};

/**
 * Obtenir un résumé des fichiers
 */
export const getFilesSummary = async () => {
  try {
    const allFiles = await getAllFiles();
    const summary = {};

    const fileTypes = [
      'alimentsPetitDej',
      'alimentsDejeuner',
      'alimentsDiner',
      'fodmapList',
      'reglesGenerales',
      'pertePoidHomme',
      'pertePoidFemme',
      'vitalite',
      'confortDigestif'
    ];

    fileTypes.forEach(type => {
      summary[type] = allFiles[type] ? {
        exists: true,
        name: allFiles[type].name,
        size: formatBytes(allFiles[type].size),
        uploadedAt: allFiles[type].uploadedAt
      } : {
        exists: false
      };
    });

    return summary;
  } catch (error) {
    console.error('❌ Erreur résumé fichiers:', error);
    return {};
  }
};

/**
 * Formater les bytes en format lisible
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Vérifier si des fichiers ont été uploadés
 */
export const isUsingUploadedFiles = async () => {
  try {
    const allFiles = await getAllFiles();
    
    // Vérifier si au moins un des fichiers Excel est uploadé
    const hasFiles = !!(
      allFiles.alimentsPetitDej || 
      allFiles.alimentsDejeuner || 
      allFiles.alimentsDiner
    );
    
    return hasFiles;
  } catch (error) {
    console.error('❌ Erreur vérification fichiers:', error);
    return false;
  }
};
