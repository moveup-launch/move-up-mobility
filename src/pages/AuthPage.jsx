import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const { lang } = useApp();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFr = lang === 'fr';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setSuccess(isFr ? 'Compte créé ! Vérifiez votre email pour confirmer.' : 'Account created! Check your email to confirm.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo">📦</div>
        </div>
        <div className="auth-brand">Move Up</div>
        <div className="auth-tagline">
          {isFr ? 'Estimation de déménagement' : 'Moving Volume Estimator'}
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            {isFr ? 'Connexion' : 'Login'}
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          >
            {isFr ? 'Inscription' : 'Sign up'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>{isFr ? 'Mot de passe' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading
              ? '...'
              : mode === 'login'
                ? (isFr ? 'Se connecter' : 'Log in')
                : (isFr ? 'Créer un compte' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  );
}
