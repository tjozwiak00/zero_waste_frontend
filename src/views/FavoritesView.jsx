import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';
import RecipeCard from '../components/RecipeCard';

export default function FavoritesView({ favorites, setFavorites, onToggleFavorite, onOpenRecipe }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const res = await apiFetch('/favorites/');
      if (res.ok) {
        setFavorites(await res.json());
      }
    } catch {
      showToast('Błąd ładowania ulubionych', 'error');
    } finally {
      setLoading(false);
    }
  }

  function isFav(recipeId) {
    return favorites.some((f) => f.recipe === recipeId || f.recipe_details?.id === recipeId);
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h2 className="view-title">⭐ Ulubione przepisy</h2>
          <p className="view-subtitle">Twoje zapisane przepisy</p>
        </div>
      </div>

      {loading ? (
        <div className="recipes-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💔</div>
          <h3 className="empty-state__title">Brak ulubionych</h3>
          <p className="empty-state__desc">Nie masz jeszcze żadnych ulubionych przepisów. Kliknij ❤️ na karcie przepisu, aby go zapisać.</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {favorites.map((fav) => (
            <RecipeCard
              key={fav.id}
              recipe={fav.recipe_details}
              showMatch={false}
              isFavorite={isFav(fav.recipe_details?.id)}
              onToggleFavorite={onToggleFavorite}
              onClick={onOpenRecipe}
            />
          ))}
        </div>
      )}
    </section>
  );
}
