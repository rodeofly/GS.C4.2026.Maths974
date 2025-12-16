// src/utils/storage.js
// Gestion localStorage pour favoris et historique

/**
 * Gestion des favoris
 */
export const Favoris = {
  KEY: 'maths974-favoris',
  
  // Récupérer tous les favoris
  getAll() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erreur lecture favoris:', e);
      return [];
    }
  },
  
  // Ajouter un favori
  add(etiquette) {
    const favoris = this.getAll();
    
    // Éviter les doublons
    if (favoris.some(f => f.slug === etiquette.slug)) {
      return false;
    }
    
    favoris.push({
      slug: etiquette.slug,
      title: etiquette.title,
      id: etiquette.id,
      niveau: etiquette.niveau,
      theme: etiquette.theme,
      url: etiquette.url,
      addedAt: new Date().toISOString()
    });
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(favoris));
      return true;
    } catch (e) {
      console.error('Erreur ajout favori:', e);
      return false;
    }
  },
  
  // Retirer un favori
  remove(slug) {
    const favoris = this.getAll();
    const filtered = favoris.filter(f => f.slug !== slug);
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Erreur suppression favori:', e);
      return false;
    }
  },
  
  // Vérifier si c'est un favori
  isFavori(slug) {
    return this.getAll().some(f => f.slug === slug);
  },
  
  // Compter les favoris
  count() {
    return this.getAll().length;
  },
  
  // Vider tous les favoris
  clear() {
    try {
      localStorage.removeItem(this.KEY);
      return true;
    } catch (e) {
      console.error('Erreur clear favoris:', e);
      return false;
    }
  }
};

/**
 * Gestion de l'historique
 */
export const Historique = {
  KEY: 'maths974-historique',
  MAX_ITEMS: 10,
  
  // Récupérer tout l'historique
  getAll() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erreur lecture historique:', e);
      return [];
    }
  },
  
  // Ajouter une entrée
  add(etiquette) {
    let historique = this.getAll();
    
    // Retirer si déjà présent (pour le remettre en tête)
    historique = historique.filter(h => h.slug !== etiquette.slug);
    
    // Ajouter en tête
    historique.unshift({
      slug: etiquette.slug,
      title: etiquette.title,
      id: etiquette.id,
      niveau: etiquette.niveau,
      theme: etiquette.theme,
      url: etiquette.url,
      visitedAt: new Date().toISOString()
    });
    
    // Limiter à MAX_ITEMS
    historique = historique.slice(0, this.MAX_ITEMS);
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(historique));
      return true;
    } catch (e) {
      console.error('Erreur ajout historique:', e);
      return false;
    }
  },
  
  // Vider l'historique
  clear() {
    try {
      localStorage.removeItem(this.KEY);
      return true;
    } catch (e) {
      console.error('Erreur clear historique:', e);
      return false;
    }
  },
  
  // Compter les entrées
  count() {
    return this.getAll().length;
  }
};

/**
 * Hook pour initialiser l'historique sur une page étiquette
 */
export function initEtiquetteTracking(etiquetteData) {
  if (typeof window === 'undefined') return;
  
  // Ajouter à l'historique
  Historique.add(etiquetteData);
  
  // Mettre à jour l'UI des favoris si présente
  updateFavorisUI(etiquetteData.slug);
}

/**
 * Mettre à jour l'UI du bouton favori
 */
function updateFavorisUI(slug) {
  const favBtn = document.querySelector('[data-favori-btn]');
  if (!favBtn) return;
  
  const isFav = Favoris.isFavori(slug);
  favBtn.textContent = isFav ? '⭐' : '☆';
  favBtn.setAttribute('aria-pressed', isFav);
  favBtn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

/**
 * Exporter toutes les données (pour debug/export)
 */
export function exportAllData() {
  return {
    favoris: Favoris.getAll(),
    historique: Historique.getAll(),
    exportedAt: new Date().toISOString()
  };
}

/**
 * Importer des données (pour restore/import)
 */
export function importData(data) {
  try {
    if (data.favoris) {
      localStorage.setItem(Favoris.KEY, JSON.stringify(data.favoris));
    }
    if (data.historique) {
      localStorage.setItem(Historique.KEY, JSON.stringify(data.historique));
    }
    return true;
  } catch (e) {
    console.error('Erreur import données:', e);
    return false;
  }
}