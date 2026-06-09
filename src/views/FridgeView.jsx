import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, getIngredientEmoji } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function FridgeView({ fridgeItems, setFridgeItems, products, setProducts, recipesReadyCount, setRecipesReadyCount }) {
  const showToast = useToast();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [addError, setAddError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    loadFridge();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.search-input-wrapper')) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function loadFridge() {
    setLoading(true);
    try {
      const res = await apiFetch('/fridge/');
      if (res.ok) {
        const data = await res.json();
        setFridgeItems(data);
        updateReadyStat(data);
      }
    } catch {
      showToast('Błąd ładowania lodówki', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function updateReadyStat(items) {
    try {
      const res = await apiFetch('/recipes/search/');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecipesReadyCount(data.filter((r) => (r.match_percentage || 0) >= 100).length);
        }
      }
    } catch {}
  }

  function filterProducts(q) {
    const lower = q.toLowerCase().trim();
    if (!lower) return [];
    return products.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 8);
  }

  function handleSearchInput(e) {
    const q = e.target.value;
    setSearchQuery(q);
    setSelectedProduct(null);
    clearTimeout(dropdownTimeout.current);
    dropdownTimeout.current = setTimeout(() => {
      setDropdownOpen(q.trim().length > 0);
    }, 150);
  }

  function selectProduct(product) {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setDropdownOpen(false);
    setAddError('');
  }

  function resetAddPanel() {
    setShowAddPanel(false);
    setSearchQuery('');
    setSelectedProduct(null);
    setQuantity('');
    setAddError('');
  }

  async function addToFridge() {
    if (!selectedProduct) {
      setAddError('Wybierz produkt z listy.');
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setAddError('Podaj ilość większą niż 0.');
      return;
    }
    setAddError('');
    try {
      const res = await apiFetch('/fridge/', {
        method: 'POST',
        body: JSON.stringify({ product: selectedProduct.id, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok) {
        setFridgeItems((prev) => [...prev, data]);
        showToast(`${selectedProduct.name} dodano do lodówki ✓`, 'success');
        resetAddPanel();
        updateReadyStat([...fridgeItems, data]);
      } else {
        const msg = data.non_field_errors?.[0] || data.detail || JSON.stringify(data);
        setAddError(msg);
      }
    } catch {
      setAddError('Błąd połączenia z serwerem.');
    }
  }

  async function updateItem(itemId, productId, newQty, divEl) {
    try {
      const res = await apiFetch(`/fridge/${itemId}/`, {
        method: 'PUT',
        body: JSON.stringify({ product: productId, quantity: newQty }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFridgeItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
        showToast('Zaktualizowano ilość', 'success');
      } else {
        showToast('Błąd aktualizacji', 'error');
      }
    } catch {
      showToast('Błąd połączenia', 'error');
    }
  }

  async function deleteItem(itemId) {
    try {
      const res = await apiFetch(`/fridge/${itemId}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        setFridgeItems((prev) => prev.filter((i) => i.id !== itemId));
        showToast('Produkt usunięty z lodówki', 'info');
      }
    } catch {
      showToast('Błąd usuwania', 'error');
    }
  }

  const filteredProducts = filterProducts(searchQuery);

  return (
    <section className="view active">
      <div className="view-header">
        <div>
          <h2 className="view-title">🧊 Moja lodówka</h2>
          <p className="view-subtitle">Zarządzaj swoimi zapasami</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => { setShowAddPanel(true); setTimeout(() => searchRef.current?.focus(), 50); }}
        >
          + Dodaj produkt
        </button>
      </div>

      {/* Add product panel */}
      {showAddPanel && (
        <div className="add-product-panel">
          <div className="add-product-panel__inner">
            <h3 className="panel-title">Dodaj do lodówki</h3>
            {addError && <div className="alert alert--error">{addError}</div>}
            <div className="add-product-form">
              <div className="form-group form-group--grow">
                <label className="form-label">Wybierz produkt</label>
                <div className="search-input-wrapper">
                  <input
                    ref={searchRef}
                    type="text"
                    className="form-input"
                    placeholder="Wpisz nazwę produktu..."
                    autoComplete="off"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredProducts[0]) selectProduct(filteredProducts[0]);
                      if (e.key === 'Escape') setDropdownOpen(false);
                    }}
                  />
                  {dropdownOpen && (
                    <div className="product-dropdown" ref={dropdownRef}>
                      {filteredProducts.length === 0 ? (
                        <div className="dropdown-empty">Brak wyników dla "{searchQuery}"</div>
                      ) : (
                        filteredProducts.map((p) => (
                          <div key={p.id} className="dropdown-item" onClick={() => selectProduct(p)}>
                            <span>{p.name}</span>
                            <span className="dropdown-item__unit">{p.default_unit}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group form-group--fixed">
                <label className="form-label">Ilość</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="np. 500"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="form-group form-group--unit">
                <label className="form-label">Jednostka</label>
                <div className="unit-display">
                  {selectedProduct?.default_unit || '—'}
                </div>
              </div>
              <button className="btn btn--primary" onClick={addToFridge}>Dodaj</button>
              <button className="btn btn--ghost" onClick={resetAddPanel}>Anuluj</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="fridge-stats">
        <div className="stat-card">
          <span className="stat-card__value">{fridgeItems.length}</span>
          <span className="stat-card__label">Produktów</span>
        </div>
        <div className="stat-card stat-card--green">
          <span className="stat-card__value">{recipesReadyCount}</span>
          <span className="stat-card__label">Gotowych przepisów</span>
        </div>
      </div>

      {/* Fridge items */}
      <div className="fridge-list">
        {loading ? (
          <div className="skeleton-loader">
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
          </div>
        ) : fridgeItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🛒</div>
            <h3 className="empty-state__title">Lodówka jest pusta</h3>
            <p className="empty-state__desc">Dodaj pierwsze produkty, aby zacząć wyszukiwać przepisy.</p>
            <button
              className="btn btn--primary"
              onClick={() => { setShowAddPanel(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            >
              + Dodaj pierwszy produkt
            </button>
          </div>
        ) : (
          fridgeItems.map((item) => (
            <FridgeItem
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          ))
        )}
      </div>
    </section>
  );
}

function FridgeItem({ item, onUpdate, onDelete }) {
  const [qty, setQty] = useState(item.quantity);

  return (
    <div className="fridge-item">
      <div className="fridge-item__icon">{getIngredientEmoji(item.product_name)}</div>
      <div className="fridge-item__info">
        <div className="fridge-item__name">{item.product_name}</div>
        <div className="fridge-item__meta">Kategoria: {item.product_category || '—'}</div>
      </div>
      <div className="fridge-item__qty-edit">
        <input
          type="number"
          className="qty-input"
          value={qty}
          min="0"
          step="any"
          aria-label="Ilość"
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onUpdate(item.id, item.product, parseFloat(qty));
          }}
        />
        <span className="qty-unit">{item.product_unit}</span>
      </div>
      <div className="fridge-item__actions">
        <button
          className="btn-save-qty"
          title="Zapisz zmiany"
          onClick={() => onUpdate(item.id, item.product, parseFloat(qty))}
        >
          💾 Zapisz
        </button>
        <button
          className="btn-delete-item"
          title="Usuń"
          onClick={() => onDelete(item.id)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
