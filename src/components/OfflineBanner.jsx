import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const { lang } = useApp();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    // navigator.onLine n'est pas fiable à 100% : un évènement "offline" isolé
    // (coupure très brève, bascule wifi/4G) peut se déclencher sans que
    // "online" ne se re-déclenche ensuite de façon fiable selon le
    // navigateur — le bandeau restait alors affiché indéfiniment même une
    // fois la connexion revenue. On revérifie donc aussi l'état réel
    // périodiquement et à chaque retour au premier plan de l'onglet, plutôt
    // que de ne compter que sur les évènements push.
    const resync = () => setOffline(!navigator.onLine);
    const onVisibility = () => { if (document.visibilityState === 'visible') resync(); };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(resync, 5000);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
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
      📵 {lang === 'fr' ? 'Mode hors ligne — données sauvegardées localement' : 'Offline mode — data saved locally'}
    </div>
  );
}
