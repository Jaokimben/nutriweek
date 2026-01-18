/**
 * 🩺 PRACTITIONER STORAGE - Gestion des fichiers praticien
 * 
 * Ce module gère le stockage des fichiers uploadés par les praticiens:
 * - Fichiers Excel (aliments autorisés)
 * - Liste FODMAP
 * - Fichiers Word (règles générales, perte de poids H/F, vitalité)
 * 
 * 🔒 PERSISTANCE:
 * - Stockage: LocalStorage (persistant)
 * - Partagé entre toutes les sessions/connexions du navigateur
 * - Survit aux rechargements de page
 * - Survit aux déconnexions/reconnexions
 * - NE S'EFFACE QUE SI:
 *   1. Le praticien clique "Réinitialiser tout"
 *   2. Le praticien supprime un fichier individuellement
 *   3. Le praticien remplace un fichier
 *   4. Le cache du navigateur est vidé manuellement
 * 
 * Format: Base64 pour compatibilité
 * Limitation: 5MB total
 */

const STORAGE_KEY = 'nutriweek_practitioner_files'

/**
 * Structure de données
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
  metadata: {
    lastUpdated: null,
    uploadedBy: null,
    useUploadedFiles: false  // Par défaut, utiliser les données de l'app
  }
}

/**
 * Obtenir un résumé des fichiers
 */
export const getFilesSummary = () => {
  try {
    const allFiles = getAllFiles()
    const summary = {}

    const fileTypes = [
      'alimentsPetitDej',
      'alimentsDejeuner',
      'alimentsDiner',
      'fodmapList',
      'reglesGenerales',
      'pertePoidHomme',
      'pertePoidFemme',
      'vitalite'
    ]

    fileTypes.forEach(type => {
      summary[type] = allFiles[type] ? {
        exists: true,
        name: allFiles[type].name,
        size: formatBytes(allFiles[type].size),
        uploadedAt: allFiles[type].uploadedAt
      } : {
        exists: false
      }
    })

    return summary
  } catch (error) {
    console.error('❌ Erreur résumé fichiers:', error)
    return {}
  }
}

/**
 * Sauvegarder le fichier Excel petit-déjeuner
 */
export const saveAlimentsPetitDej = async (file) => {
  validateExcelFile(file)
  return await saveFile('alimentsPetitDej', file)
}

/**
 * Sauvegarder le fichier Excel déjeuner
 */
export const saveAlimentsDejeuner = async (file) => {
  validateExcelFile(file)
  return await saveFile('alimentsDejeuner', file)
}

/**
 * Sauvegarder le fichier Excel dîner
 */
export const saveAlimentsDiner = async (file) => {
  validateExcelFile(file)
  return await saveFile('alimentsDiner', file)
}

/**
 * Sauvegarder la liste FODMAP
 */
export const saveFodmapList = async (file) => {
  validateExcelFile(file)
  return await saveFile('fodmapList', file)
}

/**
 * Sauvegarder le fichier Word règles générales
 */
export const saveReglesGenerales = async (file) => {
  validateWordFile(file)
  return await saveFile('reglesGenerales', file)
}

/**
 * Sauvegarder le fichier Word perte de poids homme
 */
export const savePertePoidHomme = async (file) => {
  validateWordFile(file)
  return await saveFile('pertePoidHomme', file)
}

/**
 * Sauvegarder le fichier Word perte de poids femme
 */
export const savePertePoidFemme = async (file) => {
  validateWordFile(file)
  return await saveFile('pertePoidFemme', file)
}

/**
 * Sauvegarder le fichier Word vitalité
 */
export const saveVitalite = async (file) => {
  validateWordFile(file)
  return await saveFile('vitalite', file)
}

/**
 * Obtenir tous les fichiers stockés
 */
export const getAllFiles = () => {
  try {
    console.log('🔍 [getAllFiles] Lecture depuis localStorage...')
    const data = localStorage.getItem(STORAGE_KEY)
    
    if (!data) {
      console.log('⚠️ [getAllFiles] Aucune donnée trouvée, retour DEFAULT_FILES')
      return { ...DEFAULT_FILES }
    }
    
    const parsed = JSON.parse(data)
    console.log('✅ [getAllFiles] Données chargées:', {
      alimentsPetitDej: !!parsed.alimentsPetitDej,
      alimentsDejeuner: !!parsed.alimentsDejeuner,
      alimentsDiner: !!parsed.alimentsDiner,
      fodmapList: !!parsed.fodmapList,
      reglesGenerales: !!parsed.reglesGenerales,
      pertePoidHomme: !!parsed.pertePoidHomme,
      pertePoidFemme: !!parsed.pertePoidFemme,
      vitalite: !!parsed.vitalite,
      useUploadedFiles: parsed.metadata?.useUploadedFiles
    })
    
    return parsed
  } catch (error) {
    console.error('❌ [getAllFiles] Erreur lecture fichiers:', error)
    console.error('❌ [getAllFiles] Stack:', error.stack)
    return { ...DEFAULT_FILES }
  }
}

/**
 * Sauvegarder un fichier
 */
export const saveFile = async (fileType, file) => {
  try {
    // Validation
    if (!file) {
      throw new Error('Fichier manquant')
    }

    // Vérifier la taille (max 4MB par fichier)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
    }

    // Lire le fichier en Base64
    console.log(`📄 [saveFile] Conversion ${fileType} en Base64...`, file.name)
    const base64 = await fileToBase64(file)
    console.log(`✓ [saveFile] Base64 créé: ${base64.substring(0, 50)}...`)

    // Charger les données existantes
    console.log(`🔄 [saveFile] Chargement données existantes...`)
    const allFiles = getAllFiles()

    // Mettre à jour le fichier spécifique
    allFiles[fileType] = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      uploadedAt: new Date().toISOString()
    }

    // Mettre à jour les métadonnées
    allFiles.metadata.lastUpdated = new Date().toISOString()

    // Sauvegarder
    console.log(`💾 [saveFile] Sauvegarde dans localStorage...`)
    const stringified = JSON.stringify(allFiles)
    console.log(`💾 [saveFile] Taille totale: ${(stringified.length / 1024).toFixed(2)} KB`)
    localStorage.setItem(STORAGE_KEY, stringified)

    // Vérifier que la sauvegarde a réussi
    const verification = localStorage.getItem(STORAGE_KEY)
    if (!verification) {
      throw new Error('Échec de la sauvegarde dans localStorage')
    }

    console.log(`✅ [saveFile] Fichier ${fileType} sauvegardé avec succès:`, file.name)
    console.log(`✅ [saveFile] Vérification: présent dans localStorage`)
    
    return { success: true, fileName: file.name }

  } catch (error) {
    console.error(`❌ Erreur sauvegarde ${fileType}:`, error)
    throw error
  }
}

/**
 * Supprimer un fichier
 */
export const deleteFile = (fileType) => {
  try {
    const allFiles = getAllFiles()
    allFiles[fileType] = null
    allFiles.metadata.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles))
    console.log(`✅ Fichier ${fileType} supprimé`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Erreur suppression ${fileType}:`, error)
    throw error
  }
}

/**
 * Télécharger un fichier
 */
export const downloadFile = (fileType) => {
  try {
    const allFiles = getAllFiles()
    const file = allFiles[fileType]

    if (!file) {
      throw new Error('Fichier non trouvé')
    }

    // Convertir Base64 en Blob
    const blob = base64ToBlob(file.data, file.type)

    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log(`✅ Fichier ${fileType} téléchargé`)
    return { success: true }

  } catch (error) {
    console.error(`❌ Erreur téléchargement ${fileType}:`, error)
    throw error
  }
}

/**
 * Obtenir les statistiques de stockage
 */
export const getStorageStats = () => {
  try {
    const allFiles = getAllFiles()
    let totalSize = 0
    let fileCount = 0

    Object.keys(allFiles).forEach(key => {
      if (key !== 'metadata' && allFiles[key]) {
        totalSize += allFiles[key].size
        fileCount++
      }
    })

    // Taille max LocalStorage (approximation)
    const maxStorage = 5 * 1024 * 1024 // 5MB
    const usedPercent = (totalSize / maxStorage) * 100

    return {
      totalSize,
      fileCount,
      maxStorage,
      usedPercent: Math.round(usedPercent),
      formattedSize: formatBytes(totalSize),
      formattedMax: formatBytes(maxStorage)
    }

  } catch (error) {
    console.error('❌ Erreur stats stockage:', error)
    return {
      totalSize: 0,
      fileCount: 0,
      maxStorage: 0,
      usedPercent: 0,
      formattedSize: '0 B',
      formattedMax: '0 B'
    }
  }
}

/**
 * Réinitialiser tous les fichiers
 */
export const resetAllFiles = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('✅ Tous les fichiers supprimés')
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error)
    throw error
  }
}

/**
 * Activer l'utilisation des fichiers uploadés
 */
export const activateUploadedFiles = () => {
  try {
    const allFiles = getAllFiles()
    
    // Vérifier qu'au moins un fichier Excel est uploadé
    const hasExcelFiles = allFiles.alimentsPetitDej || 
                          allFiles.alimentsDejeuner || 
                          allFiles.alimentsDiner
    
    if (!hasExcelFiles) {
      throw new Error('Aucun fichier Excel uploadé. Veuillez uploader au moins un fichier Excel avant d\'activer.')
    }
    
    allFiles.metadata.useUploadedFiles = true
    allFiles.metadata.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles))
    
    console.log('✅ Fichiers uploadés activés - L\'application utilisera vos fichiers')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erreur activation:', error)
    throw error
  }
}

/**
 * Désactiver l'utilisation des fichiers uploadés
 */
export const deactivateUploadedFiles = () => {
  try {
    const allFiles = getAllFiles()
    allFiles.metadata.useUploadedFiles = false
    allFiles.metadata.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles))
    
    console.log('✅ Fichiers uploadés désactivés - L\'application utilisera les données par défaut')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erreur désactivation:', error)
    throw error
  }
}

/**
 * Vérifier si les fichiers uploadés sont activés
 */
export const isUsingUploadedFiles = () => {
  try {
    const allFiles = getAllFiles()
    return allFiles.metadata.useUploadedFiles === true
  } catch (error) {
    console.error('❌ Erreur vérification:', error)
    return false
  }
}

/**
 * Obtenir le statut d'activation avec détails
 */
export const getActivationStatus = () => {
  try {
    const allFiles = getAllFiles()
    const isActive = allFiles.metadata.useUploadedFiles === true
    
    const uploadedFiles = []
    if (allFiles.alimentsPetitDej) uploadedFiles.push('Petit-Déjeuner')
    if (allFiles.alimentsDejeuner) uploadedFiles.push('Déjeuner')
    if (allFiles.alimentsDiner) uploadedFiles.push('Dîner')
    if (allFiles.fodmapList) uploadedFiles.push('FODMAP')
    
    return {
      isActive,
      uploadedFiles,
      hasExcelFiles: allFiles.alimentsPetitDej || allFiles.alimentsDejeuner || allFiles.alimentsDiner,
      lastUpdated: allFiles.metadata.lastUpdated
    }
  } catch (error) {
    console.error('❌ Erreur statut:', error)
    return {
      isActive: false,
      uploadedFiles: [],
      hasExcelFiles: false,
      lastUpdated: null
    }
  }
}

/**
 * Obtenir les informations de persistance
 */
export const getPersistenceInfo = () => {
  return {
    storageType: 'LocalStorage',
    isPersistent: true,
    isSharedAcrossSessions: true,
    survivesPageReload: true,
    survivesLogout: true,
    onlyDeletedBy: [
      'Bouton "Réinitialiser tout"',
      'Suppression individuelle de fichier',
      'Remplacement de fichier',
      'Vidage manuel du cache navigateur'
    ],
    maxSize: '5 MB',
    storageKey: STORAGE_KEY
  }
}

/**
 * Exporter tous les fichiers en JSON
 */
export const exportAllFiles = () => {
  try {
    const allFiles = getAllFiles()
    const json = JSON.stringify(allFiles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutriweek_practitioner_files_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('✅ Fichiers exportés')
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur export:', error)
    throw error
  }
}

/**
 * Importer des fichiers depuis JSON
 */
export const importAllFiles = async (file) => {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // Validation basique
    if (!data.metadata) {
      throw new Error('Format de fichier invalide')
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('✅ Fichiers importés')
    return { success: true }

  } catch (error) {
    console.error('❌ Erreur import:', error)
    throw error
  }
}

/**
 * HELPERS
 */

// Convertir File en Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Convertir Base64 en Blob
const base64ToBlob = (base64, type) => {
  const byteString = atob(base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type })
}

// Formater les bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Valider un fichier Excel
 */
export const validateExcelFile = (file) => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
  const validExtensions = ['.xls', '.xlsx', '.csv']
  
  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!hasValidType && !hasValidExtension) {
    throw new Error('Format de fichier invalide. Formats acceptés: .xls, .xlsx, .csv')
  }
  
  return true
}

/**
 * Valider un fichier Word
 */
export const validateWordFile = (file) => {
  const validTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  const validExtensions = ['.doc', '.docx', '.txt']
  
  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!hasValidType && !hasValidExtension) {
    throw new Error('Format de fichier invalide. Formats acceptés: .doc, .docx, .txt')
  }
  
  return true
}

/**
 * Valider un fichier texte (FODMAP)
 */
export const validateTextFile = (file) => {
  const validTypes = ['text/plain', 'text/csv', 'application/json']
  const validExtensions = ['.txt', '.csv', '.json']
  
  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!hasValidType && !hasValidExtension) {
    throw new Error('Format de fichier invalide. Formats acceptés: .txt, .csv, .json')
  }
  
  return true
}
