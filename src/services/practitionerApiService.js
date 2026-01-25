/**
 * Service API pour la communication avec le backend des fichiers praticien
 * Gère l'upload, le téléchargement et la gestion des fichiers praticien
 * Tous les fichiers sont partagés globalement entre tous les utilisateurs
 */

// Configuration de l'API backend
// FONCTION DYNAMIQUE: Calcule l'URL à chaque appel (pour éviter problèmes de cache/timing)
function getApiBaseUrl() {
  const viteUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (viteUrl) {
    console.log('🔧 [getApiBaseUrl] Utilisation VITE_BACKEND_URL:', viteUrl);
    return viteUrl;
  }
  
  // Détection automatique sandbox
  if (typeof window !== 'undefined' && window.location.hostname.includes('sandbox.novita.ai')) {
    const sandboxUrl = 'https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai';
    console.log('🔧 [getApiBaseUrl] Détection sandbox:', sandboxUrl);
    return sandboxUrl;
  }
  
  // Fallback localhost
  console.log('🔧 [getApiBaseUrl] Fallback localhost');
  return 'http://localhost:3001';
}

// Getters dynamiques
const getApiFilesEndpoint = () => `${getApiBaseUrl()}/api/files`;

// Log au chargement du module
console.log('🔧 [API Config] Module chargé');
console.log('🔧 [API Config] VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('🔧 [API Config] Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('🔧 [API Config] Backend URL initial:', getApiBaseUrl());

/**
 * Types de fichiers supportés
 */
export const FILE_TYPES = {
  ALIMENTS_PETIT_DEJ: 'alimentsPetitDej',
  ALIMENTS_DEJEUNER: 'alimentsDejeuner',
  ALIMENTS_DINER: 'alimentsDiner',
  FODMAP_LIST: 'fodmapList',
  REGLES_GENERALES: 'reglesGenerales',
  PERTE_POID_HOMME: 'pertePoidHomme',
  PERTE_POID_FEMME: 'pertePoidFemme',
  VITALITE: 'vitalite',
  CONFORT_DIGESTIF: 'confortDigestif'
};

/**
 * Vérifie la santé du backend
 * @returns {Promise<Object>} État du backend
 */
export async function checkBackendHealth() {
  try {
    // Cache busting: ajouter timestamp pour forcer le rechargement
    const baseUrl = getApiBaseUrl();
    const healthUrl = `${baseUrl}/api/health?t=${Date.now()}`;
    console.log('🏥 [Health Check] URL utilisée:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-cache' // Force pas de cache
    });
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend santé:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Backend indisponible:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Upload un fichier vers le backend
 * @param {string} fileType - Type de fichier (ex: 'alimentsPetitDej')
 * @param {File} file - Fichier à uploader
 * @returns {Promise<Object>} Résultat de l'upload
 */
export async function uploadFile(fileType, file) {
  try {
    console.log(`📤 Upload ${fileType}:`, file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    
    // Créer FormData pour l'upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    const response = await fetch(`${getApiFilesEndpoint()}/upload`, {
      method: 'POST',
      body: formData
      // Pas de Content-Type header - laissé automatique pour FormData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Upload ${fileType} réussi:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erreur upload ${fileType}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère tous les fichiers disponibles
 * @returns {Promise<Object>} Liste de tous les fichiers avec leurs métadonnées
 */
export async function getAllFiles() {
  try {
    console.log('📥 Récupération de tous les fichiers...');
    
    const response = await fetch(`${getApiFilesEndpoint()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fichiers récupérés:`, Object.keys(data.files).length, 'types');
    return { success: true, data: data.files };
  } catch (error) {
    console.error('❌ Erreur récupération fichiers:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère un fichier spécifique
 * @param {string} fileType - Type de fichier
 * @returns {Promise<Object>} Fichier et ses métadonnées
 */
export async function getFile(fileType) {
  try {
    console.log(`📥 Récupération ${fileType}...`);
    
    const response = await fetch(`${getApiFilesEndpoint()}/${fileType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 404) {
      console.log(`ℹ️ Fichier ${fileType} non trouvé`);
      return { success: true, data: null };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fichier ${fileType} récupéré:`, data.currentVersion.originalName);
    return { success: true, data: data.currentVersion };
  } catch (error) {
    console.error(`❌ Erreur récupération ${fileType}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Télécharge un fichier depuis le backend
 * @param {string} fileType - Type de fichier
 * @param {string} version - Version du fichier (optionnel, prend la dernière par défaut)
 * @returns {Promise<Blob>} Contenu du fichier
 */
export async function downloadFile(fileType, version = 'latest') {
  try {
    console.log(`⬇️ Téléchargement ${fileType} (version: ${version})...`);
    
    const filesEndpoint = getApiFilesEndpoint();
    const url = version === 'latest' 
      ? `${filesEndpoint}/download/${fileType}`
      : `${filesEndpoint}/download/${fileType}/${version}`;
    
    const response = await fetch(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log(`✅ Téléchargement ${fileType} réussi:`, (blob.size / 1024).toFixed(2), 'KB');
    return { success: true, data: blob };
  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileType}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère l'historique des versions d'un fichier
 * @param {string} fileType - Type de fichier
 * @returns {Promise<Object>} Historique des versions
 */
export async function getFileVersions(fileType) {
  try {
    console.log(`📋 Récupération historique ${fileType}...`);
    
    const response = await fetch(`${getApiFilesEndpoint()}/${fileType}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Historique ${fileType}:`, data.totalVersions, 'versions');
    return { success: true, data: data.versions };
  } catch (error) {
    console.error(`❌ Erreur historique ${fileType}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les statistiques globales
 * @returns {Promise<Object>} Statistiques du backend
 */
export async function getStats() {
  try {
    console.log('📊 Récupération statistiques...');
    
    const response = await fetch(`${getApiBaseUrl()}/api/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Statistiques récupérées:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur statistiques:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Convertit un Blob en File
 * @param {Blob} blob - Blob à convertir
 * @param {string} fileName - Nom du fichier
 * @param {string} mimeType - Type MIME du fichier
 * @returns {File} Fichier créé
 */
export function blobToFile(blob, fileName, mimeType) {
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Lit un fichier Blob comme ArrayBuffer
 * @param {Blob} blob - Blob à lire
 * @returns {Promise<ArrayBuffer>} Contenu du fichier
 */
export async function readBlobAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Lit un fichier Blob comme texte
 * @param {Blob} blob - Blob à lire
 * @returns {Promise<string>} Contenu du fichier
 */
export async function readBlobAsText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

export default {
  FILE_TYPES,
  checkBackendHealth,
  uploadFile,
  getAllFiles,
  getFile,
  downloadFile,
  getFileVersions,
  getStats,
  blobToFile,
  readBlobAsArrayBuffer,
  readBlobAsText
};
