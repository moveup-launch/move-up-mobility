import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const { lang } = useApp();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#92400E', color: '#FEF3C7',
      padding: '7px 16px', textAlign: 'center',
      fontSize: '12px', fontWeight: '600', letterSpacing: '0.03em',
    }}>
      📡 {lang === 'fr' ? 'Mode hors ligne — données locales uniquement' : 'Offline mode — local data only'}
    </div>
  );
}
