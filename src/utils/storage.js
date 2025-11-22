/**
 * Utilitaires de sauvegarde et chargement via LocalStorage
 */

const CURRENT_MENU_KEY = 'nutriweek-current-menu';
const MENU_HISTORY_KEY = 'nutriweek-menu-history';
const MAX_HISTORY = 5;

/**
 * Sauvegarde le menu et le profil utilisateur
 */
export const saveMenu = (menu, profile) => {
  try {
    console.log('💾 [Storage] Sauvegarde du menu...');
    
    const data = {
      menu,
      profile,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    // Sauvegarder le menu actuel
    localStorage.setItem(CURRENT_MENU_KEY, JSON.stringify(data));
    console.log('✅ [Storage] Menu sauvegardé');
    
    // Ajouter à l'historique
    addToHistory(data);
    
    return true;
  } catch (error) {
    console.error('❌ [Storage] Erreur sauvegarde:', error);
    return false;
  }
};

/**
 * Charge le dernier menu sauvegardé
 */
export const loadMenu = () => {
  try {
    console.log('📂 [Storage] Chargement du menu...');
    
    const saved = localStorage.getItem(CURRENT_MENU_KEY);
    if (!saved) {
      console.log('ℹ️ [Storage] Aucun menu sauvegardé');
      return null;
    }
    
    const data = JSON.parse(saved);
    console.log('✅ [Storage] Menu chargé:', data.savedAt);
    
    return data;
  } catch (error) {
    console.error('❌ [Storage] Erreur chargement:', error);
    return null;
  }
};

/**
 * Vérifie si un menu est sauvegardé
 */
export const hasStoredMenu = () => {
  return localStorage.getItem(CURRENT_MENU_KEY) !== null;
};

/**
 * Supprime le menu actuel
 */
export const clearCurrentMenu = () => {
  try {
    localStorage.removeItem(CURRENT_MENU_KEY);
    console.log('🗑️ [Storage] Menu actuel supprimé');
    return true;
  } catch (error) {
    console.error('❌ [Storage] Erreur suppression:', error);
    return false;
  }
};

/**
 * Ajoute un menu à l'historique
 */
const addToHistory = (menuData) => {
  try {
    let history = getHistory();
    
    // Ajouter au début
    history.unshift({
      ...menuData,
      id: Date.now()
    });
    
    // Garder seulement les 5 derniers
    history = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(MENU_HISTORY_KEY, JSON.stringify(history));
    console.log(`📚 [Storage] Historique: ${history.length} menus`);
  } catch (error) {
    console.error('❌ [Storage] Erreur historique:', error);
  }
};

/**
 * Récupère l'historique des menus
 */
export const getHistory = () => {
  try {
    const saved = localStorage.getItem(MENU_HISTORY_KEY);
    if (!saved) return [];
    
    return JSON.parse(saved);
  } catch (error) {
    console.error('❌ [Storage] Erreur lecture historique:', error);
    return [];
  }
};

/**
 * Charge un menu depuis l'historique
 */
export const loadFromHistory = (menuId) => {
  try {
    const history = getHistory();
    const menu = history.find(m => m.id === menuId);
    
    if (menu) {
      console.log('📂 [Storage] Chargement depuis historique:', menuId);
      return menu;
    }
    
    return null;
  } catch (error) {
    console.error('❌ [Storage] Erreur chargement historique:', error);
    return null;
  }
};

/**
 * Supprime l'historique complet
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(MENU_HISTORY_KEY);
    console.log('🗑️ [Storage] Historique supprimé');
    return true;
  } catch (error) {
    console.error('❌ [Storage] Erreur suppression historique:', error);
    return false;
  }
};

/**
 * Obtient la taille utilisée dans le localStorage
 */
export const getStorageSize = () => {
  let total = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  return {
    bytes: total,
    kb: (total / 1024).toFixed(2),
    mb: (total / 1024 / 1024).toFixed(2)
  };
};

/**
 * Formate la date de sauvegarde
 */
export const formatSavedDate = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};
