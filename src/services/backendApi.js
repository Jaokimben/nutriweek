/**
 * 🌐 API SERVICE - Communication avec le Backend
 * 
 * Service pour communiquer avec le backend NutriWeek
 * - Upload de fichiers
 * - Récupération de fichiers
 * - Historique des versions
 * - Synchronisation avec LocalStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Vérifier si le backend est disponible
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Backend non disponible');
    const data = await response.json();
    return {
      available: true,
      ...data
    };
  } catch (error) {
    console.warn('⚠️ Backend non disponible:', error.message);
    return {
      available: false,
      error: error.message
    };
  }
};

/**
 * Upload un fichier vers le backend
 */
export const uploadFileToBackend = async (fileType, file, uploadedBy = 'praticien') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('uploadedBy', uploadedBy);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'upload');
    }

    const data = await response.json();
    console.log(`✅ Fichier uploadé vers backend: ${fileType}`);
    return data;
  } catch (error) {
    console.error(`❌ Erreur upload backend ${fileType}:`, error);
    throw error;
  }
};

/**
 * Récupérer la liste de tous les fichiers
 */
export const getAllFilesFromBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des fichiers');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur récupération fichiers:', error);
    throw error;
  }
};

/**
 * Récupérer un fichier spécifique (dernière version)
 */
export const getFileFromBackend = async (fileType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileType}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Aucun fichier de ce type
      }
      throw new Error('Erreur lors de la récupération du fichier');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Erreur récupération ${fileType}:`, error);
    throw error;
  }
};

/**
 * Récupérer l'historique des versions d'un fichier
 */
export const getFileVersionHistory = async (fileType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileType}/versions`);
    if (!response.ok) throw new Error('Erreur lors de la récupération de l\'historique');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Erreur historique ${fileType}:`, error);
    throw error;
  }
};

/**
 * Télécharger un fichier depuis le backend
 */
export const downloadFileFromBackend = async (fileType, version = null) => {
  try {
    const url = version 
      ? `${API_BASE_URL}/files/download/${fileType}/${version}`
      : `${API_BASE_URL}/files/download/${fileType}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur lors du téléchargement');

    // Obtenir le nom du fichier depuis les headers
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Télécharger le fichier
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);

    console.log(`📥 Fichier téléchargé: ${fileType}`);
    return { success: true, filename };
  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileType}:`, error);
    throw error;
  }
};

/**
 * Obtenir les statistiques globales du backend
 */
export const getBackendStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des stats');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur stats backend:', error);
    throw error;
  }
};

/**
 * Synchroniser LocalStorage avec le Backend
 * Upload tous les fichiers du LocalStorage vers le backend
 */
export const syncLocalStorageToBackend = async () => {
  try {
    const STORAGE_KEY = 'nutriweek_practitioner_files';
    const localData = localStorage.getItem(STORAGE_KEY);

    if (!localData) {
      console.log('ℹ️ Aucune donnée locale à synchroniser');
      return { success: true, uploaded: 0 };
    }

    const files = JSON.parse(localData);
    let uploaded = 0;

    const fileTypes = [
      'alimentsPetitDej',
      'alimentsDejeuner',
      'alimentsDiner',
      'fodmapList',
      'reglesGenerales',
      'pertePoidHomme',
      'pertePoidFemme',
      'vitalite'
    ];

    for (const fileType of fileTypes) {
      const fileData = files[fileType];
      if (fileData && fileData.data) {
        try {
          // Convertir Base64 en Blob
          const base64Data = fileData.data.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: fileData.type });
          
          // Créer un File object
          const file = new File([blob], fileData.name, { type: fileData.type });

          // Upload vers backend
          await uploadFileToBackend(fileType, file, 'sync-localStorage');
          uploaded++;
          console.log(`✅ Synchronisé: ${fileType}`);
        } catch (error) {
          console.error(`❌ Erreur sync ${fileType}:`, error);
        }
      }
    }

    console.log(`✅ Synchronisation terminée: ${uploaded} fichiers uploadés`);
    return { success: true, uploaded };
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    throw error;
  }
};

/**
 * Télécharger tous les fichiers du backend
 */
export const downloadAllFilesFromBackend = async () => {
  try {
    const filesData = await getAllFilesFromBackend();
    const files = filesData.files;

    let downloaded = 0;

    for (const [fileType, fileInfo] of Object.entries(files)) {
      if (fileInfo.current) {
        try {
          await downloadFileFromBackend(fileType);
          downloaded++;
        } catch (error) {
          console.error(`❌ Erreur téléchargement ${fileType}:`, error);
        }
      }
    }

    console.log(`✅ Téléchargement terminé: ${downloaded} fichiers`);
    return { success: true, downloaded };
  } catch (error) {
    console.error('❌ Erreur téléchargement global:', error);
    throw error;
  }
};

export default {
  checkBackendHealth,
  uploadFileToBackend,
  getAllFilesFromBackend,
  getFileFromBackend,
  getFileVersionHistory,
  downloadFileFromBackend,
  getBackendStats,
  syncLocalStorageToBackend,
  downloadAllFilesFromBackend
};
