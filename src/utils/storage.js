const STORAGE_KEYS = {
  FAVORITES: 'gidax_favorites',
  HISTORY: 'gidax_history',
  PROFILE: 'gidax_profile'
};

// Favorileri getir
export const getFavorites = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Favori yükleme hatası:', error);
    return [];
  }
};

// Favori ekle
export const addFavorite = (product) => {
  try {
    const favorites = getFavorites();
    const exists = favorites.some(fav => fav.name === product.name && fav.brand === product.brand);
    
    if (!exists) {
      favorites.unshift({
        ...product,
        savedAt: new Date().toISOString()
      });
      
      // Max 100 favori koru
      if (favorites.length > 100) {
        favorites.pop();
      }
      
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Favori kaydetme hatası:', error);
  }
};

// Favoriden sil
export const removeFavorite = (productName, brand) => {
  try {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => !(fav.name === productName && fav.brand === brand));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('Favori silme hatası:', error);
  }
};

// Favori mi?
export const isFavorite = (productName, brand) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.name === productName && fav.brand === brand);
};

// Geçmişi getir
export const getHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Geçmiş yükleme hatası:', error);
    return [];
  }
};

// Geçmişe ekle
export const addToHistory = (product) => {
  try {
    const history = getHistory();
    
    // Duplikatı kaldır
    const filtered = history.filter(item => !(item.name === product.name && item.brand === product.brand));
    
    filtered.unshift({
      ...product,
      analyzedAt: new Date().toISOString()
    });

    // Max 50 geçmiş tut
    if (filtered.length > 50) {
      filtered.pop();
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Geçmiş kaydetme hatası:', error);
  }
};

// Geçmişi temizle
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Geçmiş temizleme hatası:', error);
  }
};

// Profil getir
export const getUserProfile = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : {
      diseases: [],
      allergies: [],
      sensitivities: [],
      goals: []
    };
  } catch (error) {
    console.error('Profil yükleme hatası:', error);
    return {
      diseases: [],
      allergies: [],
      sensitivities: [],
      goals: []
    };
  }
};

// Profil kaydet
export const saveUserProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Profil kaydetme hatası:', error);
  }
};

// Profili güncelle
export const updateUserProfile = (updates) => {
  try {
    const profile = getUserProfile();
    const updated = { ...profile, ...updates };
    saveUserProfile(updated);
    return updated;
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return null;
  }
};

// Tümünü sil (reset)
export const clearAllStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (error) {
    console.error('Depolama temizleme hatası:', error);
  }
};
