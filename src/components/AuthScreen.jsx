import React, { useState } from 'react';
import { API_BASE, saveTokens } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function AuthScreen({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' | 'register'
  return (
    <div className="auth-screen">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="auth-container">
        <div className="auth-logo">
          <span className="logo-icon">🌿</span>
          <h1 className="logo-text">ZeroWaste</h1>
          <p className="logo-tagline">Gotuj mądrze. Marnuj mniej.</p>
        </div>
        {view === 'login' ? (
          <LoginForm onLogin={onLogin} onSwitch={() => setView('register')} />
        ) : (
          <RegisterForm onSwitch={() => setView('login')} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onLogin, onSwitch }) {
  const showToast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setError('Wypełnij wszystkie pola.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.access, data.refresh);
        onLogin(data.access, data.refresh);
      } else {
        setError(data.detail || 'Nieprawidłowy login lub hasło.');
      }
    } catch {
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div className="auth-card">
      <h2 className="auth-card__title">Witaj z powrotem</h2>
      <p className="auth-card__subtitle">Zaloguj się do swojego konta</p>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="form-group">
        <label className="form-label" htmlFor="login-username">Login</label>
        <input
          id="login-username"
          type="text"
          className="form-input"
          placeholder="Twój login"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="login-password">Hasło</label>
        <input
          id="login-password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>
      <button className="btn btn--primary btn--full" onClick={handleLogin} disabled={loading}>
        {loading ? <span className="btn-spinner"></span> : <span className="btn-text">Zaloguj się</span>}
      </button>
      <p className="auth-switch">
        Nie masz konta?{' '}
        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onSwitch(); }}>
          Zarejestruj się
        </a>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const showToast = useToast();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleRegister() {
    if (!form.username || !form.password) {
      setError('Login i hasło są wymagane.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Konto utworzone! Zaloguj się teraz.', 'success');
        onSwitch();
      } else {
        const msgs = Object.entries(data)
          .map(([, v]) => (Array.isArray(v) ? v.join(', ') : v))
          .join(' | ');
        setError(msgs);
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2 className="auth-card__title">Stwórz konto</h2>
      <p className="auth-card__subtitle">Dołącz do Zero Waste</p>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="reg-first-name">Imię</label>
          <input id="reg-first-name" type="text" className="form-input" placeholder="Jan" value={form.first_name} onChange={handleChange('first_name')} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-last-name">Nazwisko</label>
          <input id="reg-last-name" type="text" className="form-input" placeholder="Kowalski" value={form.last_name} onChange={handleChange('last_name')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="reg-username">Login</label>
        <input id="reg-username" type="text" className="form-input" placeholder="jan_kowalski" autoComplete="username" value={form.username} onChange={handleChange('username')} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="reg-email">E-mail (opcjonalnie)</label>
        <input id="reg-email" type="email" className="form-input" placeholder="jan@example.com" value={form.email} onChange={handleChange('email')} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="reg-password">Hasło</label>
        <input id="reg-password" type="password" className="form-input" placeholder="Min. 8 znaków" autoComplete="new-password" value={form.password} onChange={handleChange('password')} />
      </div>
      <button className="btn btn--primary btn--full" onClick={handleRegister} disabled={loading}>
        {loading ? <span className="btn-spinner"></span> : <span className="btn-text">Zarejestruj się</span>}
      </button>
      <p className="auth-switch">
        Masz już konto?{' '}
        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onSwitch(); }}>
          Zaloguj się
        </a>
      </p>
    </div>
  );
}
