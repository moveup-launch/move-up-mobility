import { useMemo, useState } from 'react';
import { openProCheckout, isNativeApp } from '../lib/stripe';
import appIcon from '../assets/landing/app-icon.png';
import shotLogement from '../assets/landing/screenshot-logement-acces.jpg';
import shotInventaire from '../assets/landing/screenshot-inventaire.jpg';
import shotSynthese from '../assets/landing/screenshot-synthese-devis.jpg';
import shotTablette from '../assets/landing/screenshot-tablette-terrain.jpg';

// ── Catalogue de démo (hero) — un sous-ensemble réaliste par pièce ──
const DEMO_ROOMS = [
  {
    id: 'salon',
    label: 'Salon',
    items: [
      { id: 'canape-angle', icon: '🛋️', name: "Canapé d'angle", vol: 3.0, qty: 1 },
      { id: 'fauteuil', icon: '💺', name: 'Fauteuil', vol: 0.5, qty: 0 },
      { id: 'table-basse', icon: '🪑', name: 'Table basse', vol: 0.35, qty: 0 },
      { id: 'meuble-tv', icon: '🗄️', name: 'Meuble TV', vol: 0.6, qty: 0 },
      { id: 'tv', icon: '📺', name: 'TV 50"', vol: 0.3, qty: 0 },
      { id: 'bibliotheque', icon: '📚', name: 'Bibliothèque', vol: 0.7, qty: 0 },
      { id: 'table-manger', icon: '🍽️', name: 'Table à manger', vol: 1.0, qty: 1 },
      { id: 'chaises', icon: '🪑', name: 'Chaises', vol: 0.15, qty: 4 },
    ],
  },
  {
    id: 'chambre',
    label: 'Chambre',
    items: [
      { id: 'lit', icon: '🛏️', name: 'Lit double', vol: 1.2, qty: 1 },
      { id: 'matelas', icon: '🧷', name: 'Matelas', vol: 0.4, qty: 1 },
      { id: 'armoire', icon: '🚪', name: 'Armoire', vol: 1.5, qty: 1 },
      { id: 'commode', icon: '🗃️', name: 'Commode', vol: 0.6, qty: 0 },
      { id: 'chevet', icon: '🕯️', name: 'Table de chevet', vol: 0.15, qty: 2 },
      { id: 'miroir', icon: '🪞', name: 'Miroir', vol: 0.1, qty: 0 },
      { id: 'bureau', icon: '🪑', name: 'Bureau', vol: 0.5, qty: 0 },
      { id: 'penderie', icon: '👕', name: 'Penderie', vol: 0.4, qty: 0 },
    ],
  },
  {
    id: 'cuisine',
    label: 'Cuisine',
    items: [
      { id: 'table-cuisine', icon: '🍽️', name: 'Table cuisine', vol: 0.8, qty: 0 },
      { id: 'frigo', icon: '🧊', name: 'Réfrigérateur', vol: 0.9, qty: 1 },
      { id: 'lave-linge', icon: '🌀', name: 'Lave-linge', vol: 0.5, qty: 0 },
      { id: 'micro-ondes', icon: '📦', name: 'Micro-ondes', vol: 0.1, qty: 0 },
      { id: 'vaisselle', icon: '🍽️', name: 'Vaisselle (carton)', vol: 0.08, qty: 2 },
      { id: 'placard-cuisine', icon: '🗄️', name: 'Placard bas', vol: 0.35, qty: 0 },
    ],
  },
  {
    id: 'cartons',
    label: 'Cartons',
    items: [
      { id: 'carton-standard', icon: '📦', name: 'Carton standard', vol: 0.1, qty: 6, isCarton: true },
      { id: 'carton-livres', icon: '📚', name: 'Carton livres', vol: 0.08, qty: 4, isCarton: true },
      { id: 'carton-vetements', icon: '👕', name: 'Carton vêtements', vol: 0.12, qty: 3, isCarton: true },
      { id: 'housse-penderie', icon: '🧥', name: 'Housse penderie', vol: 0.3, qty: 1, isCarton: true },
    ],
  },
];

const DEFAULT_QTY = Object.fromEntries(
  DEMO_ROOMS.flatMap((room) => room.items.map((item) => [item.id, item.qty]))
);

const ITEM_INDEX = Object.fromEntries(
  DEMO_ROOMS.flatMap((room) => room.items.map((item) => [item.id, item]))
);

const MAX_QTY = 5;

function truckFor(volume) {
  if (volume <= 12) return 'Camion 12 m³';
  if (volume <= 20) return 'Camion 20 m³';
  if (volume <= 30) return 'Camion 30 m³';
  return 'Camion 30 m³ + remorque';
}

function teamFor(volume) {
  if (volume <= 15) return '2 déménageurs';
  if (volume <= 30) return '3 déménageurs';
  return '4 déménageurs';
}

const fmtVolume = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function VolumeDemo() {
  const [activeRoom, setActiveRoom] = useState('salon');
  const [qty, setQty] = useState(DEFAULT_QTY);

  const { totalVolume, totalItems, totalCartons } = useMemo(() => {
    let volume = 0;
    let items = 0;
    let cartons = 0;
    for (const [id, n] of Object.entries(qty)) {
      if (!n) continue;
      const item = ITEM_INDEX[id];
      volume += item.vol * n;
      items += n;
      if (item.isCarton) cartons += n;
    }
    return { totalVolume: volume, totalItems: items, totalCartons: cartons };
  }, [qty]);

  const room = DEMO_ROOMS.find((r) => r.id === activeRoom);

  const bump = (id) => {
    setQty((prev) => {
      const next = (prev[id] ?? 0) + 1;
      return { ...prev, [id]: next > MAX_QTY ? 0 : next };
    });
  };

  const reset = () => setQty(DEFAULT_QTY);

  return (
    <div className="landing-demo-card">
      <div className="landing-demo-top">
        <div className="landing-demo-toprow">
          <span className="landing-demo-label">ESSAYEZ — VOLUME EN DIRECT</span>
          <button className="landing-demo-reset" onClick={reset}>Réinitialiser</button>
        </div>
        <div className="landing-demo-totals">
          <div className="landing-demo-num">
            <strong>{fmtVolume.format(totalVolume)}</strong>
            <span>m³</span>
          </div>
          <div className="landing-demo-meta">
            <div className="primary">{totalItems} objets</div>
            <div className="secondary">{totalCartons} cartons</div>
          </div>
        </div>
        <div className="landing-demo-chips">
          <div className="landing-demo-chip mint">
            <div className="label">CAMION</div>
            <div className="value">{truckFor(totalVolume)}</div>
          </div>
          <div className="landing-demo-chip">
            <div className="label">ÉQUIPE</div>
            <div className="value">{teamFor(totalVolume)}</div>
          </div>
        </div>
      </div>

      <div className="landing-demo-body">
        <div className="landing-demo-tabs">
          {DEMO_ROOMS.map((r) => (
            <button
              key={r.id}
              className={`landing-demo-tab${r.id === activeRoom ? ' active' : ''}`}
              onClick={() => setActiveRoom(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="landing-demo-grid">
          {room.items.map((item) => {
            const n = qty[item.id] ?? 0;
            return (
              <button
                key={item.id}
                className={`landing-demo-item${n > 0 ? ' active' : ''}`}
                onClick={() => bump(item.id)}
              >
                <span className="icon">{item.icon}</span>
                <span className="name">{item.name}</span>
                <span className="vol">{fmtVolume.format(item.vol)} m³</span>
                {n > 0 && <span className="count">{n}</span>}
              </button>
            );
          })}
        </div>
        <div className="landing-demo-hint">Touchez un objet pour l'ajouter — c'est exactement l'écran que vous aurez chez le client.</div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4FD1A5" strokeWidth="2.6" strokeLinecap="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default function LandingPage({ onSignIn, onSignUp, onDemo, demoLoading }) {
  const native = isNativeApp();

  return (
    <div id="landing">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400;1,500&family=Public+Sans:wght@400;500;600;650;700&display=swap"
      />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <div className="landing-brand">
            <img src={appIcon} alt="" className="landing-logo-mark" />
            <span className="landing-wordmark">Move Up App</span>
          </div>
          <nav className="landing-nav-links">
            <a href="#demo">Démo</a>
            <a href="#how">Comment ça marche</a>
            <a href="#report">Le rapport</a>
            <a href="#pricing">Tarifs</a>
          </nav>
          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={onSignIn}>Se connecter</button>
            <button className="landing-btn-primary" onClick={onSignUp}>Essayer 30 jours</button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section id="demo" className="landing-hero">
        <div className="landing-hero-grid">
          <div>
            <div className="landing-kicker">
              <span className="landing-kicker-dot" />
              <span className="landing-kicker-label">POUR LES DÉMÉNAGEURS PROFESSIONNELS</span>
            </div>
            <h1 className="landing-h1">
              Le <em>compagnon</em> du déménageur, de la visite au devis.
            </h1>
            <p className="landing-hero-sub">
              Estimez le volume pendant la visite, organisez votre agenda, envoyez SMS et email en un clic,
              générez devis et rapport PDF en quelques clics — sur téléphone, tablette ou ordinateur.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-btn-primary landing-btn-lg" onClick={onSignUp}>Essayer gratuitement</button>
              <button className="landing-btn-ghost landing-btn-lg" onClick={onDemo} disabled={demoLoading}>
                {demoLoading ? 'Connexion…' : 'Voir une démo'}
              </button>
              <a href="#how" className="landing-hero-link">
                Voir comment ça marche
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
              </a>
            </div>
            <div className="landing-hero-note">30 jours gratuits · Sans carte bancaire</div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-hero-glow" />
            <div className="landing-hero-badge">
              <img src={appIcon} alt="Move Up App" />
            </div>
            <div className="landing-devices-tag">MULTI-SUPPORT — MOBILE, TABLETTE, ORDINATEUR</div>
            <div className="landing-devices-stage">
              <div className="landing-device laptop">
                <div className="landing-device-bezel landing-device-frame">
                  <div className="landing-device-cam" />
                  <div className="landing-device-screen"><img src={shotLogement} alt="Move Up App sur ordinateur" /></div>
                </div>
                <div className="landing-device-base" />
              </div>
              <div className="landing-device landing-device-frame tablet">
                <div className="landing-device-cam" />
                <div className="landing-device-screen"><img src={shotTablette} alt="Move Up App sur tablette" /></div>
              </div>
              <div className="landing-device landing-device-frame phone">
                <div className="landing-device-cam" />
                <div className="landing-device-screen"><img src={shotSynthese} alt="Move Up App sur mobile" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-hero-demo-secondary">
          <VolumeDemo />
        </div>
      </section>

      {/* ── Comment ça marche ──────────────────────────── */}
      <section id="how" className="landing-section alt">
        <div className="landing-container">
          <div className="landing-steps-head">
            <div className="landing-eyebrow">COMMENT ÇA MARCHE</div>
            <h2 className="landing-h2">Trois écrans, une visite, un devis.</h2>
          </div>
          <div className="landing-steps-grid">
            <div>
              <div className="landing-step-shot"><img src={shotLogement} alt="Écran Logement & accès de l'app Move Up" /></div>
              <div className="landing-step-head">
                <span className="landing-step-num">1</span>
                <h3 className="landing-step-title">Le client, le logement</h3>
              </div>
              <p className="landing-step-desc">Coordonnées, date, étage, ascenseur, stationnement camion, distance de portage. L'app signale les contraintes d'accès au fur et à mesure.</p>
            </div>
            <div>
              <div className="landing-step-shot"><img src={shotInventaire} alt="Écran Inventaire par pièce de l'app Move Up" /></div>
              <div className="landing-step-head">
                <span className="landing-step-num">2</span>
                <h3 className="landing-step-title">L'inventaire, pièce par pièce</h3>
              </div>
              <p className="landing-step-desc">Un catalogue de plus de 100 objets, la recherche pour tout le reste. Chaque tap met à jour le volume, les fragiles, les lourds, les meubles à démonter.</p>
            </div>
            <div>
              <div className="landing-step-shot"><img src={shotSynthese} alt="Écran Synthèse et devis de l'app Move Up" /></div>
              <div className="landing-step-head">
                <span className="landing-step-num">3</span>
                <h3 className="landing-step-title">La synthèse, le devis</h3>
              </div>
              <p className="landing-step-desc">Volume total, camion et équipe recommandés, rapport PDF, lien de suivi client, devis chiffré. Avant même d'être remonté dans la voiture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Agenda, messages, devis ────────────────────── */}
      <section className="landing-section">
        <div className="landing-container landing-field-grid">
          <div>
            <div className="landing-eyebrow">AU-DELÀ DU VOLUME</div>
            <h2 className="landing-h2" style={{ marginBottom: 22 }}>Un agenda à jour, un client prévenu, un devis prêt.</h2>
            <p className="landing-lead">Move Up App ne s'arrête pas au calcul du volume : c'est aussi l'outil qui organise vos visites, prévient vos clients et transforme chaque visite terminée en devis chiffré.</p>
            <div className="landing-field-list">
              <div className="landing-field-item"><CheckIcon /><span>Agenda centralisé : toutes vos visites et relances au même endroit</span></div>
              <div className="landing-field-item"><CheckIcon /><span>SMS et email en un tap, sans changer d'application</span></div>
              <div className="landing-field-item"><CheckIcon /><span>Devis chiffré généré à la fin de la visite, prêt à envoyer</span></div>
            </div>
          </div>
          <div className="landing-field-visual sidebar">
            <img src={shotTablette} alt="Menu Agenda et Devis de Move Up App" />
          </div>
        </div>
      </section>

      {/* ── Sur le terrain ─────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-container landing-field-grid">
          <div>
            <div className="landing-eyebrow">SUR LE TERRAIN</div>
            <h2 className="landing-h2" style={{ marginBottom: 22 }}>Pensée pour être utilisée debout, dans un couloir.</h2>
            <p className="landing-lead">Grandes cibles tactiles, une main suffit, et le total reste visible en haut de l'écran en permanence. Ça fonctionne aussi sans réseau : la visite se synchronise quand vous ressortez.</p>
            <div className="landing-field-list">
              <div className="landing-field-item"><CheckIcon /><span>Fonctionne hors ligne</span></div>
              <div className="landing-field-item"><CheckIcon /><span>Photos de chaque pièce intégrées au rapport</span></div>
              <div className="landing-field-item"><CheckIcon /><span>Français et anglais, y compris les documents client</span></div>
            </div>
          </div>
          <div className="landing-field-visual">
            <img src={shotTablette} alt="Move Up App utilisée sur tablette pendant une visite" />
          </div>
        </div>
      </section>

      {/* ── Rapport PDF ────────────────────────────────── */}
      <section id="report" className="landing-section alt">
        <div className="landing-container landing-report-grid">
          <div className="landing-report-mockup-wrap">
            <div className="landing-report-mockup">
              <div className="landing-report-head">
                <div>
                  <div className="title">Rapport de visite</div>
                  <div className="meta">Example Family · 26 août 2026</div>
                </div>
                <div>
                  <div className="vol-label">VOLUME</div>
                  <div className="vol-num">42,5 m³</div>
                </div>
              </div>
              <div className="landing-report-addr">
                <div>
                  <div className="label">DÉPART</div>
                  <div className="value">12 rue de la Paix, Paris<br /><small>3e étage · avec ascenseur</small></div>
                </div>
                <div>
                  <div className="label">ARRIVÉE</div>
                  <div className="value">5 avenue des Fleurs, Lyon<br /><small>Rez-de-chaussée</small></div>
                </div>
              </div>
              <div className="landing-report-rooms">
                <div className="label">DÉTAIL PAR PIÈCE</div>
                <div className="landing-report-row">
                  <span className="name">Salon</span>
                  <span className="landing-report-bar"><span style={{ width: '68%' }} /></span>
                  <span className="num">14,2 m³</span>
                </div>
                <div className="landing-report-row">
                  <span className="name">Chambre</span>
                  <span className="landing-report-bar"><span style={{ width: '100%' }} /></span>
                  <span className="num">20,8 m³</span>
                </div>
                <div className="landing-report-row">
                  <span className="name">Cuisine</span>
                  <span className="landing-report-bar"><span style={{ width: '36%' }} /></span>
                  <span className="num">7,5 m³</span>
                </div>
              </div>
              <div className="landing-report-footer">
                <div className="landing-report-tag mint">
                  <div className="label">LOGISTIQUE</div>
                  <div className="value">Camion 30 m³ + remorque</div>
                </div>
                <div className="landing-report-tag neutral">
                  <div className="label">ÉQUIPE</div>
                  <div className="value">4 déménageurs</div>
                </div>
              </div>
            </div>
          </div>
          <div className="landing-report-copy">
            <div className="landing-eyebrow">CE QUE REÇOIT LE CLIENT</div>
            <h2 className="landing-h2" style={{ marginBottom: 22 }}>Un rapport que vous n'avez pas honte d'envoyer.</h2>
            <p className="landing-lead">Inventaire complet, contraintes d'accès, photos, logistique recommandée, votre logo. Généré en un clic à la fin de la visite, dans la langue de votre client.</p>
            <button className="landing-btn-primary landing-btn-lg" onClick={onSignUp}>Générer mon premier rapport</button>
          </div>
        </div>
      </section>

      {/* ── Tarifs ─────────────────────────────────────── */}
      <section id="pricing" className="landing-section">
        <div className="landing-container">
          <div className="landing-pricing-head">
            <h2 className="landing-h2 center" style={{ marginBottom: 16 }}>Un prix, pas de palier surprise.</h2>
            <p className="landing-lead">Commencez gratuitement, décidez au bout de 30 jours.</p>
          </div>
          <div className="landing-pricing-grid">
            <div className="landing-plan free">
              <div className="landing-plan-label">ESSAI GRATUIT</div>
              <div className="landing-plan-price"><strong>0 €</strong><span>/ 30 jours</span></div>
              <p className="landing-plan-desc">Pour découvrir l'outil, sans carte bancaire</p>
              <ul className="landing-plan-list">
                <li>Visites illimitées pendant 30 jours</li>
                <li>Photos illimitées pendant 30 jours</li>
                <li>PDF complet avec photos</li>
                <li>Inventaire complet</li>
                <li className="off">Création de visites après 30 jours</li>
                <li className="off">Multi-utilisateurs</li>
              </ul>
              <button className="landing-plan-btn ghost" onClick={onSignUp}>Démarrer l'essai gratuit</button>
            </div>

            <div className="landing-plan pro">
              <div className="landing-plan-badge">LE PLUS POPULAIRE</div>
              <div className="landing-plan-label">PRO</div>
              <div className="landing-plan-price"><strong className="mint">19,99 € HT/mois</strong></div>
              <div className="landing-plan-price-ttc">(23,99 € TTC)</div>
              <p className="landing-plan-desc">Pour les professionnels actifs</p>
              <ul className="landing-plan-list">
                <li>Visites illimitées</li>
                <li>PDF complet avec photos</li>
                <li>Photos illimitées</li>
                <li>Historique complet</li>
                <li>Support email prioritaire</li>
                <li className="off">Multi-utilisateurs</li>
              </ul>
              {native ? (
                <p className="landing-plan-note-native">Contactez votre administrateur pour en savoir plus</p>
              ) : (
                <button className="landing-plan-btn solid" onClick={() => openProCheckout()}>S'abonner au plan Pro</button>
              )}
            </div>
          </div>
          <p className="landing-pricing-footer">
            Plusieurs utilisateurs ou une offre sur-mesure pour votre équipe ?{' '}
            <a href="mailto:contact@moveupapp.com?subject=Demande%20offre%20Entreprise">Contactez-nous</a>
          </p>
        </div>
      </section>

      {/* ── CTA finale ─────────────────────────────────── */}
      <section className="landing-section alt landing-final">
        <div className="landing-container">
          <h2 className="landing-h2 center">Votre prochaine visite peut déjà se faire dessus.</h2>
          <p>30 jours gratuits, sans carte bancaire.</p>
          <button className="landing-btn-primary landing-btn-lg" onClick={onSignUp}>Créer mon compte</button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-top">
            <div className="landing-footer-brand">
              <img src={appIcon} alt="" />
              <span>Move Up App</span>
            </div>
            <div className="landing-footer-copy">moveupapp.com · © 2026 Move Up</div>
          </div>
          <div className="landing-footer-legal">
            <a href="/cgu" target="_blank" rel="noopener noreferrer">Conditions Générales d'Utilisation</a>
            <a href="/confidentialite" target="_blank" rel="noopener noreferrer">Politique de confidentialité</a>
            <a href="mailto:contact@moveupapp.com">contact@moveupapp.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
