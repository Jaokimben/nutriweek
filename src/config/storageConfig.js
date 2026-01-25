/**
 * 🔧 CONFIGURATION DU STOCKAGE
 * 
 * Permet de switcher facilement entre:
 * - LocalStorage (client-side, actuel)
 * - Backend API (server-side, avec versioning)
 */

export const STORAGE_MODE = {
  LOCAL: 'local',      // LocalStorage (actuel)
  BACKEND: 'backend'   // Backend API (nouveau)
}

// 🚀 MODE ACTIF (changer ici pour switcher)
// 'local'   = LocalStorage (pas de serveur requis)
// 'backend' = Backend API (serveur requis)
export const ACTIVE_STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || STORAGE_MODE.LOCAL

// 🌐 URL du Backend
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai'

// 📊 Configuration LocalStorage
export const LOCAL_STORAGE_CONFIG = {
  key: 'nutriweek_practitioner_files',
  maxSize: 5 * 1024 * 1024, // 5 MB
  version: '1.0.0'
}

// 📊 Configuration Backend
export const BACKEND_CONFIG = {
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 seconds
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  retries: 3
}

// 🎯 Mode actif
export const isUsingBackend = () => ACTIVE_STORAGE_MODE === STORAGE_MODE.BACKEND
export const isUsingLocal = () => ACTIVE_STORAGE_MODE === STORAGE_MODE.LOCAL

// 📝 Log mode actif
console.log(`📦 Storage Mode: ${ACTIVE_STORAGE_MODE}`)
console.log(`🌐 Backend URL: ${BACKEND_URL}`)
