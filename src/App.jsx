import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, clearTokens, getTokens } from './utils/api';
import { ToastProvider, useToast } from './hooks/useToast';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import RecipeModal from './components/RecipeModal';
import FridgeView from './views/FridgeView';
import SearchView from './views/SearchView';
import AllRecipesView from './views/AllRecipesView';
import FavoritesView from './views/FavoritesView';

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const showToast = useToast();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!getTokens().access);
  const [user, setUser] = useState(null);

  // App state
  const [currentView, setCurrentView] = useState('fridge');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared data state
  const [fridgeItems, setFridgeItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recipesReadyCount, setRecipesReadyCount] = useState(0);

  // Modal
  const [modalRecipe, setModalRecipe] = useState(null);

  // ── INIT ──────────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      initApp();
    }
  }, [isLoggedIn]);

  async function initApp() {
    try {
      const res = await apiFetch('/users/me/');
      if (res.ok) setUser(await res.json());
    } catch {}

    try {
      const res = await apiFetch('/products/');
      if (res.ok) setProducts(await res.json());
    } catch {}

    try {
      const res = await apiFetch('/favorites/');
      if (res.ok) setFavorites(await res.json());
    } catch {}
  }

  // ── AUTH ──────────────────────────────────────────────────
  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    clearTokens();
    setIsLoggedIn(false);
    setUser(null);
    setFridgeItems([]);
    setFavorites([]);
    setProducts([]);
    setCurrentView('fridge');
    showToast('Wylogowano pomyślnie.', 'info');
  }

  // ── FAVORITES ─────────────────────────────────────────────
  const toggleFavorite = useCallback(async (recipeId) => {
    const existing = favorites.find(
      (f) => f.recipe === recipeId || f.recipe_details?.id === recipeId
    );
    if (existing) {
      const res = await apiFetch(`/favorites/${existing.id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        showToast('Usunięto z ulubionych', 'info');
      }
    } else {
      const res = await apiFetch('/favorites/', {
        method: 'POST',
        body: JSON.stringify({ recipe: recipeId }),
      });
      if (res.ok) {
        const newFav = await res.json();
        setFavorites((prev) => [...prev, newFav]);
        showToast('Dodano do ulubionych ⭐', 'success');
      } else {
        showToast('Błąd dodawania do ulubionych', 'error');
      }
    }
  }, [favorites, showToast]);

  function isFavorite(recipeId) {
    return favorites.some((f) => f.recipe === recipeId || f.recipe_details?.id === recipeId);
  }

  // ── NAVIGATION ────────────────────────────────────────────
  function navigateTo(view) {
    setCurrentView(view);
    setSidebarOpen(false);
  }

  // ── RENDER ────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-screen">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          aria-label="Menu"
          onClick={() => setSidebarOpen(true)}
        >
          <span></span><span></span><span></span>
        </button>
        <div className="mobile-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">ZeroWaste</span>
        </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'sidebar open' : ''} style={sidebarOpen ? {} : undefined}>
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <main className="main-content">
        {currentView === 'fridge' && (
          <FridgeView
            fridgeItems={fridgeItems}
            setFridgeItems={setFridgeItems}
            products={products}
            setProducts={setProducts}
            recipesReadyCount={recipesReadyCount}
            setRecipesReadyCount={setRecipesReadyCount}
          />
        )}
        {currentView === 'search' && (
          <SearchView
            fridgeItems={fridgeItems}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onOpenRecipe={setModalRecipe}
            setRecipesReadyCount={setRecipesReadyCount}
          />
        )}
        {currentView === 'recipes' && (
          <AllRecipesView
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onOpenRecipe={setModalRecipe}
          />
        )}
        {currentView === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            setFavorites={setFavorites}
            onToggleFavorite={toggleFavorite}
            onOpenRecipe={setModalRecipe}
          />
        )}
      </main>

      {/* Recipe modal */}
      {modalRecipe && (
        <RecipeModal
          recipe={modalRecipe}
          fridgeItems={fridgeItems}
          isFavorite={isFavorite(modalRecipe.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setModalRecipe(null)}
        />
      )}
    </div>
  );
}
