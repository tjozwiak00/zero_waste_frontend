import React, { useEffect } from 'react';
import { getRecipeEmoji, getSourceLabel } from '../utils/api';

export default function RecipeModal({ recipe, fridgeItems, isFavorite, onToggleFavorite, onClose }) {
  const emoji = getRecipeEmoji(recipe?.title);
  const sourceLabel = getSourceLabel(recipe?.source_url);
  const fridgeProductIds = fridgeItems.map((fi) => fi.product);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!recipe) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-recipe-title">
        <button className="modal__close" onClick={onClose} aria-label="Zamknij">✕</button>

        <div className="modal__hero">
          <div className="modal__hero-img-wrapper">
            {recipe.image_url && (
              <img
                className="modal__hero-img"
                src={recipe.image_url}
                alt={recipe.title}
                onError={(e) => e.target.classList.add('hidden')}
              />
            )}
            <div className="modal__hero-emoji" style={{ opacity: recipe.image_url ? 0.15 : 0.4 }}>
              {emoji}
            </div>
          </div>
          <div className="modal__hero-overlay">
            <div className="modal__meta">
              {sourceLabel && (
                <span className="modal__source-badge">{sourceLabel}</span>
              )}
              {recipe.prep_time_minutes && (
                <span className="modal__time">⏱ {recipe.prep_time_minutes} min</span>
              )}
            </div>
            <h2 className="modal__title" id="modal-recipe-title">{recipe.title}</h2>
          </div>
        </div>

        <div className="modal__body">
          <div className="modal__cols">
            <div className="modal__col-ingredients">
              <h3 className="modal__section-title">🥬 Składniki</h3>
              <ul className="ingredients-list">
                {(recipe.ingredients || []).map((ing) => {
                  const inFridge = fridgeProductIds.includes(ing.product);
                  return (
                    <li key={ing.id || ing.product} className={`ingredient-item${inFridge ? ' in-fridge' : ''}`}>
                      <div className="ingredient-item__check">{inFridge ? '✓' : '·'}</div>
                      <span className="ingredient-item__name">{ing.product_name}</span>
                      <span className="ingredient-item__qty">{ing.quantity} {ing.unit || ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="modal__col-instructions">
              <h3 className="modal__section-title">👨‍🍳 Przygotowanie</h3>
              <div className="instructions-text">{recipe.instructions || 'Brak instrukcji.'}</div>
            </div>
          </div>

          <div className="modal__actions">
            <button
              className={`btn btn--favorite${isFavorite ? ' is-favorite' : ''}`}
              onClick={() => onToggleFavorite(recipe.id)}
            >
              <span>{isFavorite ? '❤️' : '🤍'}</span>
              <span>{isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}</span>
            </button>
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline"
              >
                🔗 Otwórz przepis
              </a>
            )}
          </div>

          {recipe.match_percentage != null && (
            <div className="modal__match" style={{ display: 'flex' }}>
              <span className="match-label">Dopasowanie składników:</span>
              <div className="match-bar-wrapper" style={{ flex: 1 }}>
                <div className="match-bar" style={{ width: `${recipe.match_percentage}%` }}></div>
              </div>
              <span className="match-pct">{recipe.match_percentage}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
