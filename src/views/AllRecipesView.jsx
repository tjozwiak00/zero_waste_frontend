import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';
import RecipeCard from '../components/RecipeCard';

export default function AllRecipesView({ favorites, onToggleFavorite, onOpenRecipe }) {
  const showToast = useToast();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    setLoading(true);
    try {
      const res = await apiFetch('/recipes/');
      if (res.ok) {
        setRecipes(await res.json());
      }
    } catch {
      showToast('Błąd ładowania przepisów', 'error');
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
          <h2 className="view-title">📖 Wszystkie przepisy</h2>
          <p className="view-subtitle">Przeglądaj pełną bazę przepisów</p>
        </div>
      </div>

      {loading ? (
        <div className="recipes-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <h3 className="empty-state__title">Brak przepisów</h3>
          <p className="empty-state__desc">Baza przepisów jest pusta. Skontaktuj się z administratorem.</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showMatch={false}
              isFavorite={isFav(recipe.id)}
              onToggleFavorite={onToggleFavorite}
              onClick={onOpenRecipe}
            />
          ))}
        </div>
      )}
    </section>
  );
}
