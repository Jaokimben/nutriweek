/**
 * 🔌 SERVICE API PRACTITIONER - Communication avec le Backend
 * 
 * Service pour gérer les fichiers praticien via l'API backend.
 * Remplace le stockage localStorage par des appels API serveur.
 * 
 * Backend: http://localhost:3001/api/files
 */

// Configuration API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Upload un fichier vers le backend
 * @param {string} fileType - Type de fichier (alimentsPetitDej, fodmapList, etc.)
 * @param {File} file - Fichier à uploader
 * @returns {Promise<Object>} Résultat de l'upload
 */
export async function uploadFile(fileType, file) {
  console.log(`📤 [API] Upload ${fileType}: ${file.name}`);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ [API] Upload réussi:`, result);
    
    return result;
    
  } catch (error) {
    console.error(`❌ [API] Erreur upload ${fileType}:`, error);
    throw new Error(`Erreur upload ${fileType}: ${error.message}`);
  }
}

/**
 * Récupère tous les fichiers (dernière version de chaque type)
 * @returns {Promise<Object>} Tous les fichiers avec métadonnées
 */
export async function getAllFiles() {
  console.log('📥 [API] Récupération de tous les fichiers...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/files`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ [API] Fichiers récupérés:`, result);
    
    return result;
    
  } catch (error) {
    console.error('❌ [API] Erreur récupération fichiers:', error);
    throw new Error(`Erreur récupération fichiers: ${error.message}`);
  }
}

/**
 * Récupère un fichier spécifique (dernière version)
 * @param {string} fileType - Type de fichier
 * @returns {Promise<Object>} Fichier avec métadonnées
 */
export async function getFile(fileType) {
  console.log(`📥 [API] Récupération ${fileType}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileType}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ [API] Fichier ${fileType} non trouvé`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ [API] Fichier ${fileType} récupéré`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ [API] Erreur récupération ${fileType}:`, error);
    throw new Error(`Erreur récupération ${fileType}: ${error.message}`);
  }
}

/**
 * Récupère l'historique des versions d'un fichier
 * @param {string} fileType - Type de fichier
 * @returns {Promise<Array>} Liste des versions
 */
export async function getFileVersions(fileType) {
  console.log(`📜 [API] Récupération versions ${fileType}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileType}/versions`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ [API] ${result.totalVersions} versions récupérées`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ [API] Erreur récupération versions ${fileType}:`, error);
    throw new Error(`Erreur récupération versions: ${error.message}`);
  }
}

/**
 * Télécharge un fichier spécifique
 * @param {string} fileType - Type de fichier
 * @param {number} version - Numéro de version (optionnel, dernière par défaut)
 * @returns {Promise<Blob>} Contenu du fichier
 */
export async function downloadFile(fileType, version = 'latest') {
  console.log(`⬇️ [API] Téléchargement ${fileType} version ${version}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/download/${fileType}/${version}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`✅ [API] Fichier téléchargé: ${blob.size} bytes`);
    
    return blob;
    
  } catch (error) {
    console.error(`❌ [API] Erreur téléchargement ${fileType}:`, error);
    throw new Error(`Erreur téléchargement: ${error.message}`);
  }
}

/**
 * Vérifie la santé du backend
 * @returns {Promise<Object>} Statut du backend
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend indisponible: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ [API] Backend opérationnel:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ [API] Backend inaccessible:', error);
    return {
      status: 'error',
      message: error.message,
      available: false
    };
  }
}

/**
 * Obtient les statistiques globales des fichiers
 * @returns {Promise<Object>} Statistiques
 */
export async function getStats() {
  console.log('📊 [API] Récupération statistiques...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ [API] Statistiques récupérées:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ [API] Erreur récupération stats:', error);
    throw new Error(`Erreur statistiques: ${error.message}`);
  }
}

/**
 * Convertit un Blob en Base64
 * @param {Blob} blob - Blob à convertir
 * @returns {Promise<string>} Base64 string
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convertit Base64 en Blob
 * @param {string} base64 - Base64 string
 * @param {string} mimeType - Type MIME
 * @returns {Blob} Blob
 */
export function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
}

// Exporter la configuration pour référence
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    upload: '/files/upload',
    getAll: '/files',
    getOne: '/files/:type',
    versions: '/files/:type/versions',
    download: '/files/download/:type/:version',
    health: '/health',
    stats: '/stats'
  }
};

export default {
  uploadFile,
  getAllFiles,
  getFile,
  getFileVersions,
  downloadFile,
  checkBackendHealth,
  getStats,
  blobToBase64,
  base64ToBlob,
  API_CONFIG
};
