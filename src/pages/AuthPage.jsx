import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function AuthPage({ initialMode = 'login', onBack }) {
  const { lang } = useApp();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isFr = lang === 'fr';

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (err) setError(err.message);
    else setSuccess(isFr
      ? 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.'
      : 'A reset email has been sent. Check your inbox.');
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(err.message);
      } else {
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
            company_name: company.trim() || null,
          });
        }
        setSuccess(isFr
          ? 'Compte créé ! Vérifiez votre email pour confirmer.'
          : 'Account created! Check your email to confirm.');
      }
    }
    setLoading(false);
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); setTermsAccepted(false); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, padding: 0 }}
          >
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        )}
        <div className="auth-logo-wrap">
          <div className="auth-logo">📦</div>
        </div>
        <div className="auth-brand">Move Up</div>
        <div className="auth-tagline">
          {isFr ? 'Estimation de déménagement' : 'Moving Volume Estimator'}
        </div>

        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
              {isFr ? 'Connexion' : 'Login'}
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>
              {isFr ? 'Inscription' : 'Sign up'}
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <div style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '12px' }}>
              {isFr ? 'Entrez votre email pour recevoir un lien de réinitialisation.' : 'Enter your email to receive a reset link.'}
            </div>
            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                required
                autoComplete="email"
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? '...' : (isFr ? 'Envoyer le lien' : 'Send reset link')}
            </button>
            <button type="button" onClick={() => switchMode('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, marginTop: 8, width: '100%' }}>
              ← {isFr ? 'Retour à la connexion' : 'Back to login'}
            </button>
          </form>
        )}

        {mode !== 'forgot' && (
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="field">
                  <label>{isFr ? 'Prénom' : 'First name'} *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jean"
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="field">
                  <label>{isFr ? 'Nom' : 'Last name'} *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Dupont"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="field">
                <label>{isFr ? 'Entreprise' : 'Company'}</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Move Up SAS"
                  autoComplete="organization"
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Email *</label>
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
            <label>{isFr ? 'Mot de passe' : 'Password'} *</label>
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

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '4px' }}>
              <button type="button" onClick={() => switchMode('forgot')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, padding: 0 }}>
                {isFr ? 'Mot de passe oublié ?' : 'Forgot password?'}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'var(--text2)', cursor: 'pointer', marginTop: 4 }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)', width: 15, height: 15 }}
              />
              <span>
                {isFr ? "J'accepte les " : 'I accept the '}
                <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                  {isFr ? 'CGU' : 'Terms of Service'}
                </a>
                {isFr ? ' et la ' : ' and the '}
                <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                  {isFr ? 'politique de confidentialité' : 'Privacy Policy'}
                </a>
              </span>
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading || (mode === 'signup' && !termsAccepted)}
          >
            {loading
              ? '...'
              : mode === 'login'
                ? (isFr ? 'Se connecter' : 'Log in')
                : (isFr ? 'Créer mon compte' : 'Create account')}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
