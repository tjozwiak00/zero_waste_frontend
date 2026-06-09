import React from 'react';

const NAV_ITEMS = [
  { view: 'fridge',    icon: '🧊', label: 'Moja lodówka' },
  { view: 'search',   icon: '🔍', label: 'Wyszukaj przepis' },
  { view: 'recipes',  icon: '📖', label: 'Wszystkie przepisy' },
  { view: 'favorites',icon: '⭐', label: 'Ulubione' },
];

export default function Sidebar({ currentView, onNavigate, user, onLogout }) {
  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user.username
    : 'Ładowanie...';

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar__header">
        <span className="logo-icon">🌿</span>
        <span className="logo-text">ZeroWaste</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ view, icon, label }) => (
          <a
            key={view}
            href="#"
            className={`nav-item${currentView === view ? ' active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate(view); }}
          >
            <span className="nav-item__icon">{icon}</span>
            <span className="nav-item__label">{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="user-badge">
          <div className="user-badge__avatar">{initials || '?'}</div>
          <div className="user-badge__info">
            <span className="user-badge__name">{displayName}</span>
            <span className="user-badge__role">Kucharz Zero Waste</span>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm btn--full" onClick={onLogout}>
          Wyloguj się
        </button>
      </div>
    </aside>
  );
}
