import { useState } from 'react';
import { X, ArrowRight, LayoutList, ClipboardList } from 'lucide-react';
import { DemoAppProvider } from '../context/DemoAppContext';
import Step4Inventory from './Step4Inventory';
import Step5Summary from './Step5Summary';
import BottomSheet from '../components/BottomSheet';
import Modal from '../components/Modal';

// Point d'entrée unique du mode démo local. Tout ce qu'il affiche vit dans
// DemoAppProvider (context/DemoAppContext.jsx) : un état 100% en mémoire,
// sans authentification ni appel réseau, alimentant les vrais écrans
// d'inventaire/synthèse (Step4Inventory, Step5Summary) inchangés. Retirer le
// mode démo se résume à ne plus monter ce composant (voir App.jsx) — rien
// ailleurs dans l'app n'y fait référence.
export default function DemoExplorePage({ lang, onClose, onCreateAccount }) {
  const [view, setView] = useState('inventory');
  const isFr = lang === 'fr';

  const tabStyle = (active) => ({
    padding: '6px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
    borderColor: active ? 'var(--accent)' : undefined,
    color: active ? 'var(--accent)' : undefined,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Bandeau démo */}
      <div style={{
        background: '#FCD34D', color: '#1A1917', padding: '10px 16px',
        fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 12, flexWrap: 'wrap', textAlign: 'center',
        lineHeight: 1.5, flexShrink: 0,
      }}>
        <span>
          {isFr
            ? 'Exemple de démonstration — Créez votre compte pour gérer vos propres visites'
            : 'Demo example — Create your account to manage your own visits'}
        </span>
        <button
          onClick={onCreateAccount}
          style={{
            background: '#1A1917', color: 'white', border: 'none', borderRadius: 8,
            padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {isFr ? 'Créer mon compte' : 'Create my account'} <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      <DemoAppProvider lang={lang} onFinishInventory={() => setView('summary')}>
        <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '6px 12px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <X size={14} strokeWidth={2} /> {isFr ? 'Retour à la connexion' : 'Back to login'}
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" style={tabStyle(view === 'inventory')} onClick={() => setView('inventory')}>
                <LayoutList size={14} strokeWidth={2} /> {isFr ? 'Inventaire' : 'Inventory'}
              </button>
              <button className="btn btn-secondary" style={tabStyle(view === 'summary')} onClick={() => setView('summary')}>
                <ClipboardList size={14} strokeWidth={2} /> {isFr ? 'Synthèse' : 'Summary'}
              </button>
            </div>
          </div>

          {view === 'inventory' ? <Step4Inventory /> : <Step5Summary />}
        </div>
        <BottomSheet />
        <Modal />
      </DemoAppProvider>
    </div>
  );
}
