import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';
import RecipeCard from '../components/RecipeCard';

export default function SearchView({ fridgeItems, favorites, onToggleFavorite, onOpenRecipe, setRecipesReadyCount }) {
  const showToast = useToast();
  const [state, setState] = useState('hint'); // 'hint' | 'loading' | 'results' | 'empty'
  const [results, setResults] = useState([]);

  async function doSearch() {
    setState('loading');
    try {
      const res = await apiFetch('/recipes/search/');
      if (res.ok) {
        const data = await res.json();
        if (data.detail) {
          setState('empty');
          return;
        }
        const recipes = Array.isArray(data) ? data : [];
        if (!recipes.length) {
          setState('empty');
          return;
        }
        setResults(recipes);
        const fullMatches = recipes.filter((r) => (r.match_percentage || 0) >= 100).length;
        setRecipesReadyCount(fullMatches);
        setState('results');
      } else {
        showToast('Błąd wyszukiwania', 'error');
        setState('hint');
      }
    } catch {
      showToast('Błąd połączenia z serwerem', 'error');
      setState('hint');
    }
  }

  function isFav(recipeId) {
    return favorites.some((f) => f.recipe === recipeId || f.recipe_details?.id === recipeId);
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h2 className="view-title">🔍 Wyszukaj przepis</h2>
          <p className="view-subtitle">Przepisy dopasowane do Twojej lodówki</p>
        </div>
        <button className="btn btn--primary" onClick={doSearch}>
          🔮 Znajdź przepisy
        </button>
      </div>

      {state === 'hint' && (
        <div className="search-hint">
          <div className="search-hint__icon">✨</div>
          <p>Kliknij przycisk powyżej, aby zobaczyć przepisy, które możesz ugotować z produktów w Twojej lodówce.</p>
        </div>
      )}

      {state === 'loading' && (
        <div className="loading-overlay">
          <div className="spinner-large"></div>
          <p>Szukam przepisów dla Ciebie...</p>
        </div>
      )}

      {state === 'empty' && (
        <div className="empty-state">
          <div className="empty-state__icon">😔</div>
          <h3 className="empty-state__title">Brak dopasowań</h3>
          <p className="empty-state__desc">Dodaj więcej produktów do lodówki lub sprawdź wszystkie przepisy.</p>
        </div>
      )}

      {state === 'results' && (
        <div className="recipes-grid">
          {results.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              showMatch
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
