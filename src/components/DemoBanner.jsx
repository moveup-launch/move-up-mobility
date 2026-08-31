import { useApp } from '../context/AppContext';
import { isNativeApp, openExternalUrl } from '../lib/platform';

const DEMO_EMAIL = 'demo@moveupapp.com';
const SIGNUP_URL = 'https://moveupapp.com';

export default function DemoBanner() {
  const { user, signOut } = useApp();

  if (user?.email !== DEMO_EMAIL) return null;

  const handleCreateAccount = async () => {
    // Natif : pas d'inscription in-app (App Store 3.1.1) — direction le site,
    // dans le navigateur externe, sans déconnecter la session démo en cours.
    if (isNativeApp()) {
      await openExternalUrl(SIGNUP_URL);
      return;
    }
    sessionStorage.setItem('moveup_after_signout', 'signup');
    await signOut();
  };

  return (
    <div style={{
      background: '#FCD34D',
      color: '#1A1917',
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      flexWrap: 'wrap',
      textAlign: 'center',
      lineHeight: 1.5,
      flexShrink: 0,
    }}>
      <span>🎯 Mode démo — Vous explorez Move Up App en tant que <strong>Jean Dupont</strong></span>
      <button
        onClick={handleCreateAccount}
        style={{
          background: '#1A1917',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '5px 14px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Créer mon compte →
      </button>
    </div>
  );
}
