import React from 'react';
import { getRecipeEmoji, getSourceLabel } from '../utils/api';

export default function RecipeCard({ recipe, showMatch = false, isFavorite, onToggleFavorite, onClick }) {
  const emoji = getRecipeEmoji(recipe.title);
  const source = getSourceLabel(recipe.source_url);
  const timeStr = recipe.prep_time_minutes ? `⏱ ${recipe.prep_time_minutes} min` : '';
  const matchPct = recipe.match_percentage;

  function getMatchBarClass(pct) {
    if (pct >= 80) return 'match-bar match-med';
    if (pct >= 40) return 'match-bar';
    return 'match-bar match-low';
  }

  return (
    <div
      className="recipe-card"
      data-recipe-id={recipe.id}
      onClick={() => onClick(recipe)}
    >
      <div className="recipe-card__img-wrapper">
        {recipe.image_url && (
          <img
            className="recipe-card__img"
            src={recipe.image_url}
            alt={recipe.title}
            loading="lazy"
            onError={(e) => e.target.classList.add('hidden')}
          />
        )}
        <div className="recipe-card__emoji">{emoji}</div>
        <button
          className={`recipe-card__fav-btn${isFavorite ? ' is-favorite' : ''}`}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        <div className="recipe-card__meta">
          {timeStr && <span>{timeStr}</span>}
          {source && <span className="source-chip">🔗 {source}</span>}
          <span>🥬 {recipe.ingredients?.length || 0} skł.</span>
        </div>
        {recipe.description && (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {recipe.description}
          </p>
        )}
        {showMatch && matchPct != null && (
          <div className="recipe-card__match">
            <div className="match-label">
              <span>Dopasowanie</span>
              <strong style={{ color: 'var(--green-400)' }}>{matchPct}%</strong>
            </div>
            <div className="match-bar-wrapper">
              <div className={getMatchBarClass(matchPct)} style={{ width: `${matchPct}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
