/**
 * Service d'authentification et gestion des utilisateurs
 * Utilise LocalStorage pour la persistence (en production, utiliser une vraie API)
 */

const USERS_KEY = 'nutriweek_users';
const CURRENT_USER_KEY = 'nutriweek_current_user';
const USER_SESSIONS_KEY = 'nutriweek_sessions';

/**
 * Structure d'un utilisateur
 * {
 *   id: string,
 *   email: string,
 *   password: string (hashé en production),
 *   firstName: string,
 *   lastName: string,
 *   provider: 'email' | 'google',
 *   profile: {
 *     objectif, taille, poids, age, genre, tourDeTaille,
 *     nombreRepas, capaciteDigestive, intolerances,
 *     morphotype, activitePhysique
 *   },
 *   menus: [],
 *   createdAt: timestamp,
 *   lastLogin: timestamp
 * }
 */

// ========== Gestion des utilisateurs ==========

/**
 * Récupère tous les utilisateurs
 */
const getAllUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Erreur lecture utilisateurs:', error);
    return [];
  }
};

/**
 * Sauvegarde les utilisateurs
 */
const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde utilisateurs:', error);
    return false;
  }
};

/**
 * Trouve un utilisateur par email
 */
const findUserByEmail = (email) => {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Trouve un utilisateur par ID
 */
const findUserById = (id) => {
  const users = getAllUsers();
  return users.find(u => u.id === id);
};

// ========== Authentification ==========

/**
 * Initialise un compte de démo si aucun utilisateur n'existe
 */
export const initializeDemoAccount = () => {
  const users = getAllUsers();
  if (users.length === 0) {
    const demoUser = {
      id: 'user_demo_001',
      email: 'demo@test.com',
      password: 'demo123',
      firstName: 'Utilisateur',
      lastName: 'Démo',
      provider: 'email',
      profile: {
        objectif: 'perte',
        taille: '170',
        poids: '75',
        age: '30',
        genre: 'homme',
        tourDeTaille: '85',
        nombreRepas: '3',
        morphotype: 'mesomorphe',
        activitePhysique: 'moderee',
        capaciteDigestive: [],
        intolerances: []
      },
      menus: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    users.push(demoUser);
    saveUsers(users);
    console.log('✅ Compte démo initialisé: demo@test.com / demo123');
  }
};

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = (email, password, firstName = '', lastName = '') => {
  try {
    // Vérifier si l'email existe déjà
    if (findUserByEmail(email)) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }

    // Créer le nouvel utilisateur
    const users = getAllUsers();
    const newUser = {
      id: generateUserId(),
      email: email.toLowerCase(),
      password: password, // En production: hashPassword(password)
      firstName,
      lastName,
      provider: 'email',
      profile: null,
      menus: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Connecter automatiquement l'utilisateur
    setCurrentUser(newUser);

    console.log('✅ Utilisateur créé:', email);
    return { success: true, user: sanitizeUser(newUser) };
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    return { success: false, error: 'Erreur lors de l\'inscription' };
  }
};

/**
 * Connexion avec email/password
 */
export const login = (email, password) => {
  try {
    const user = findUserByEmail(email);

    if (!user) {
      return { success: false, error: 'Email non trouvé' };
    }

    // En production: comparePassword(password, user.password)
    if (user.password !== password) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date().toISOString();
    updateUser(user);

    // Sauvegarder la session
    setCurrentUser(user);

    console.log('✅ Connexion réussie:', email);
    return { success: true, user: sanitizeUser(user) };
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    return { success: false, error: 'Erreur lors de la connexion' };
  }
};

/**
 * Connexion avec Google (simulée)
 */
export const loginWithGoogle = () => {
  // En production, utiliser Google OAuth
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockGoogleUser = {
        email: 'demo@gmail.com',
        firstName: 'Utilisateur',
        lastName: 'Démo',
        provider: 'google'
      };

      // Vérifier si l'utilisateur existe déjà
      let user = findUserByEmail(mockGoogleUser.email);

      if (!user) {
        // Créer un nouvel utilisateur Google
        const users = getAllUsers();
        user = {
          id: generateUserId(),
          email: mockGoogleUser.email,
          password: null,
          firstName: mockGoogleUser.firstName,
          lastName: mockGoogleUser.lastName,
          provider: 'google',
          profile: null,
          menus: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        users.push(user);
        saveUsers(users);
      } else {
        user.lastLogin = new Date().toISOString();
        updateUser(user);
      }

      setCurrentUser(user);
      console.log('✅ Connexion Google réussie:', user.email);
      resolve({ success: true, user: sanitizeUser(user) });
    }, 1000);
  });
};

/**
 * Déconnexion
 */
export const logout = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ Déconnexion réussie');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    return { success: false, error: 'Erreur lors de la déconnexion' };
  }
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;

    const userData = JSON.parse(userJson);
    // Vérifier que l'utilisateur existe toujours
    const user = findUserById(userData.id);
    return user ? sanitizeUser(user) : null;
  } catch (error) {
    console.error('Erreur récupération utilisateur courant:', error);
    return null;
  }
};

/**
 * Sauvegarde l'utilisateur courant
 */
const setCurrentUser = (user) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erreur sauvegarde utilisateur courant:', error);
  }
};

/**
 * Vérifie si un utilisateur est connecté
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// ========== Gestion du profil ==========

/**
 * Met à jour le profil de l'utilisateur
 */
export const updateUserProfile = (profileData) => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const user = findUserById(currentUserData.id);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // Mettre à jour le profil
    user.profile = {
      ...user.profile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    updateUser(user);
    console.log('✅ Profil mis à jour');
    return { success: true, user: sanitizeUser(user) };
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
};

/**
 * Met à jour les informations personnelles
 */
export const updatePersonalInfo = (firstName, lastName) => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const user = findUserById(currentUserData.id);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    user.firstName = firstName;
    user.lastName = lastName;
    updateUser(user);

    console.log('✅ Informations personnelles mises à jour');
    return { success: true, user: sanitizeUser(user) };
  } catch (error) {
    console.error('❌ Erreur mise à jour infos:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
};

/**
 * Sauvegarde un menu pour l'utilisateur
 */
export const saveUserMenu = (menu) => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const user = findUserById(currentUserData.id);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // Ajouter le menu à l'historique
    if (!user.menus) user.menus = [];
    user.menus.unshift({
      menu,
      savedAt: new Date().toISOString(),
      id: Date.now()
    });

    // Garder seulement les 10 derniers menus
    user.menus = user.menus.slice(0, 10);

    updateUser(user);
    console.log('✅ Menu sauvegardé pour l\'utilisateur');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur sauvegarde menu:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
};

/**
 * Récupère l'historique des menus de l'utilisateur
 */
export const getUserMenus = () => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) return [];

    const user = findUserById(currentUserData.id);
    return user?.menus || [];
  } catch (error) {
    console.error('Erreur récupération menus:', error);
    return [];
  }
};

// ========== Utilitaires ==========

/**
 * Met à jour un utilisateur dans la base
 */
const updateUser = (updatedUser) => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
};

/**
 * Génère un ID unique
 */
const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Retire les données sensibles avant de retourner l'utilisateur
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Change le mot de passe
 */
export const changePassword = (currentPassword, newPassword) => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const user = findUserById(currentUserData.id);
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    if (user.provider === 'google') {
      return { success: false, error: 'Impossible de changer le mot de passe d\'un compte Google' };
    }

    if (user.password !== currentPassword) {
      return { success: false, error: 'Mot de passe actuel incorrect' };
    }

    user.password = newPassword;
    updateUser(user);

    console.log('✅ Mot de passe changé');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    return { success: false, error: 'Erreur lors du changement' };
  }
};

/**
 * Supprime le compte utilisateur
 */
export const deleteAccount = () => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id !== currentUserData.id);
    saveUsers(filteredUsers);
    logout();

    console.log('✅ Compte supprimé');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur suppression compte:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
};

/**
 * Obtient les statistiques utilisateur
 */
export const getUserStats = () => {
  try {
    const currentUserData = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUserData) return null;

    const user = findUserById(currentUserData.id);
    if (!user) return null;

    return {
      totalMenus: user.menus?.length || 0,
      memberSince: new Date(user.createdAt).toLocaleDateString('fr-FR'),
      lastLogin: new Date(user.lastLogin).toLocaleDateString('fr-FR'),
      hasProfile: user.profile !== null
    };
  } catch (error) {
    console.error('Erreur stats utilisateur:', error);
    return null;
  }
};
