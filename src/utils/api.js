// ── CONFIG ────────────────────────────────────────────────
export const API_BASE = 'http://127.0.0.1:8000/api';

// ── TOKEN STORAGE ─────────────────────────────────────────
export function getTokens() {
  return {
    access: localStorage.getItem('zw_access'),
    refresh: localStorage.getItem('zw_refresh'),
  };
}

export function saveTokens(access, refresh) {
  localStorage.setItem('zw_access', access);
  localStorage.setItem('zw_refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('zw_access');
  localStorage.removeItem('zw_refresh');
}

// ── TOKEN REFRESH ─────────────────────────────────────────
async function tryRefreshToken() {
  const { refresh } = getTokens();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      saveTokens(data.access, getTokens().refresh);
      return true;
    }
  } catch (_) {}
  return false;
}

// ── GENERIC FETCH WITH JWT ────────────────────────────────
export async function apiFetch(endpoint, options = {}) {
  const { access } = getTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (access) headers['Authorization'] = `Bearer ${access}`;

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const { access: newAccess } = getTokens();
      headers['Authorization'] = `Bearer ${newAccess}`;
      res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.reload();
      throw new Error('Session expired');
    }
  }

  return res;
}

// ── EMOJI HELPERS ─────────────────────────────────────────
export function getIngredientEmoji(name) {
  const n = (name || '').toLowerCase();
  const map = [
    [['jaj'], '🥚'],
    [['mleko', 'śmiet', 'jogurt', 'ser', 'masło', 'twaróg'], '🧀'],
    [['mięso', 'kurczak', 'wołowin', 'wieprzow', 'schab', 'kiełbas', 'boczek', 'łosoś', 'ryb', 'indyk', 'szynka'], '🥩'],
    [['pomidor'], '🍅'],
    [['marchew'], '🥕'],
    [['cebul'], '🧅'],
    [['czosnek'], '🧄'],
    [['ziemniak'], '🥔'],
    [['papryka'], '🫑'],
    [['ogórek'], '🥒'],
    [['sałata', 'kapusta', 'szpinak', 'brokuł'], '🥬'],
    [['jabłko'], '🍎'],
    [['banan'], '🍌'],
    [['cytryna', 'pomarańcz', 'limonka'], '🍋'],
    [['mąka', 'cukier', 'sól', 'pieprz', 'ryż', 'makaron', 'kasza', 'płatki'], '🌾'],
    [['olej', 'oliw'], '🫙'],
    [['chleb', 'bułk'], '🍞'],
    [['pieczark', 'grzyb'], '🍄'],
    [['fasola', 'soczewic', 'groch', 'ciecierzyc'], '🫘'],
    [['orzechy', 'migdał'], '🥜'],
  ];
  for (const [keys, emoji] of map) {
    if (keys.some((k) => n.includes(k))) return emoji;
  }
  return '🫙';
}

export function getRecipeEmoji(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('zup')) return '🍲';
  if (t.includes('sałat')) return '🥗';
  if (t.includes('pizza')) return '🍕';
  if (t.includes('makaron') || t.includes('pasta')) return '🍝';
  if (t.includes('ciastk') || t.includes('ciast') || t.includes('tort')) return '🍰';
  if (t.includes('burger')) return '🍔';
  if (t.includes('kurczak') || t.includes('indyk')) return '🍗';
  if (t.includes('ryba') || t.includes('łosoś')) return '🐟';
  if (t.includes('omlet') || t.includes('jajecznic')) return '🍳';
  if (t.includes('naleśnik') || t.includes('placek')) return '🥞';
  if (t.includes('ryż') || t.includes('risotto')) return '🍚';
  if (t.includes('chili') || t.includes('gulasz')) return '🫕';
  if (t.includes('kanapka')) return '🥪';
  return '🍽️';
}

export function getSourceLabel(url) {
  if (!url) return '';
  if (url.includes('aniagotuje')) return 'Ania Gotuje';
  if (url.includes('kwestiasmaku')) return 'Kwestia Smaku';
  if (url.includes('przepisy.pl')) return 'Przepisy.pl';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (_) {
    return '';
  }
}
