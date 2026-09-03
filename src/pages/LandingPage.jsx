import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATALOG, FREQUENT_ITEM_IDS } from '../data/catalog';
import { openProCheckout, isNativeApp } from '../lib/stripe';
import appIcon from '../assets/landing/app-icon.png';
import shotLogement from '../assets/landing/screenshot-logement-acces.jpg';
import shotInventaire from '../assets/landing/screenshot-inventaire.jpg';
import shotSynthese from '../assets/landing/screenshot-synthese-devis.jpg';
import shotTablette from '../assets/landing/screenshot-tablette-terrain.jpg';

// ── Bandeau de la démo — 4 variantes de thème (cf. handoff §3a).
// Exposé en constante (pas de prop parente pour ce réglage) : changer
// cette valeur suffit à basculer de thème.
const DEMO_BANNER_THEME = 'taupe'; // 'taupe' | 'encre' | 'papier' | 'blanc'

// ── Catalogue de la démo : branché sur le vrai catalogue de l'app
// (src/data/catalog.js) et filtré sur FREQUENT_ITEM_IDS — le même
// sous-ensemble "vue simplifiée" que l'app utilise déjà pour proposer
// les objets les plus courants par pièce — plutôt que de recopier la
// liste statique du handoff. Regroupement en 4 onglets pour coller au
// découpage de la maquette (Salon / Chambre / Cuisine / Cartons & divers).
const DEMO_GROUPS = [
  { key: 'salon', label: 'Salon', rooms: ['livingRoom', 'diningRoom'] },
  { key: 'chambre', label: 'Chambre', rooms: ['bedroom'] },
  { key: 'cuisine', label: 'Cuisine', rooms: ['kitchen'] },
  { key: 'cartons', label: 'Cartons & divers', rooms: ['boxes', 'garageBasement'] },
];

function buildDemoCatalog() {
  const byGroup = {};
  const index = {};
  for (const group of DEMO_GROUPS) {
    const items = [];
    for (const roomKey of group.rooms) {
      for (const entry of CATALOG[roomKey] || []) {
        if (!FREQUENT_ITEM_IDS.has(entry.id) || index[entry.id]) continue;
        const item = { key: entry.id, name: entry.name.fr, icon: entry.icon, volume: entry.variants[0].volume_m3 };
        items.push(item);
        index[entry.id] = item;
      }
    }
    byGroup[group.key] = items;
  }
  return { byGroup, index };
}

const { byGroup: DEMO_ITEMS_BY_GROUP, index: DEMO_ITEM_INDEX } = buildDemoCatalog();

// État initial : un inventaire déjà crédible (un salon, une chambre, une
// cuisine meublés + des cartons), sans reprendre les clés du handoff qui
// ne correspondent pas aux identifiants du vrai catalogue.
const DEFAULT_QTY = {
  sofa_corner: 1,
  dining_table: 1,
  dining_chair: 4,
  bed: 1,
  wardrobe: 2,
  nightstand: 1,
  fridge: 1,
  kitchen_table: 1,
  chairs: 4,
  box_standard: 15,
  box_books: 5,
  box_large: 5,
};

const fmtVol = (n) => n.toFixed(n < 10 ? 2 : 1).replace('.', ',');

function truckFor(vol) {
  if (vol > 50) return 'Semi-remorque';
  if (vol > 30) return 'Camion 30 m³ + remorque';
  if (vol > 20) return 'Camion 30 m³';
  if (vol > 12) return 'Camion 20 m³';
  return 'Camion 12 m³';
}

function MinusIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" style={{ stroke: 'var(--ink)', flexShrink: 0, marginTop: 4 }}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function VolumeDemo() {
  const { getRecommendedTeam } = useApp();
  const [group, setGroup] = useState('salon');
  const [qty, setQty] = useState(DEFAULT_QTY);

  const bump = (key, delta) => {
    setQty((prev) => {
      const next = Math.max(0, (prev[key] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[key]; else copy[key] = next;
      return copy;
    });
  };

  const reset = () => setQty(DEFAULT_QTY);

  const { volume, count } = useMemo(() => {
    let vol = 0;
    let n = 0;
    for (const [key, qtyForKey] of Object.entries(qty)) {
      const item = DEMO_ITEM_INDEX[key];
      if (!item) continue;
      vol += item.volume * qtyForKey;
      n += qtyForKey;
    }
    return { volume: vol, count: n };
  }, [qty]);

  const team = getRecommendedTeam(volume).label;
  const truck = truckFor(volume);
  const items = DEMO_ITEMS_BY_GROUP[group];

  return (
    <div className="landing-demo-card">
      <div className={`landing-demo-top theme-${DEMO_BANNER_THEME}`}>
        <div className="landing-demo-toprow">
          <span className="landing-demo-label">ESSAYEZ — VOLUME EN DIRECT</span>
          <button className="landing-demo-reset" onClick={reset}>Réinitialiser</button>
        </div>
        <div className="landing-demo-totals">
          <div className="landing-demo-num">
            <strong>{fmtVol(volume)}</strong>
            <span>m³</span>
          </div>
          <div className="landing-demo-pills">
            <span className="landing-demo-pill strong">{truck}</span>
            <span className="landing-demo-pill">{team}</span>
            <span className="landing-demo-pill">{count} objets</span>
          </div>
        </div>
      </div>

      <div className="landing-demo-body">
        <div className="landing-demo-tabs">
          {DEMO_GROUPS.map((g) => (
            <button
              key={g.key}
              className={`landing-demo-tab${g.key === group ? ' active' : ''}`}
              onClick={() => setGroup(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="landing-demo-grid">
          {items.map((item) => {
            const n = qty[item.key] || 0;
            return (
              <div key={item.key} className={`landing-demo-item${n > 0 ? ' active' : ''}`}>
                <button
                  type="button"
                  className="landing-demo-item-add"
                  onClick={() => bump(item.key, 1)}
                  aria-label={`Ajouter ${item.name.toLowerCase()}`}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="name">{item.name}</span>
                  <span className="vol">{item.volume.toFixed(2).replace('.', ',')} m³</span>
                </button>
                {n > 0 && <span className="count">{n}</span>}
                {n > 0 && (
                  <button
                    type="button"
                    className="sub"
                    aria-label={`Retirer ${item.name.toLowerCase()}`}
                    onClick={() => bump(item.key, -1)}
                  >
                    <MinusIcon />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="landing-demo-hint">Touchez un objet — c'est exactement l'écran que vous aurez chez le client.</div>
      </div>
    </div>
  );
}

function Logo({ footer }) {
  return (
    <div className="landing-logo">
      <img src={appIcon} alt="" className="landing-logo-mark" />
      <span className="landing-logo-word">Move Up{footer ? '' : ' App'}</span>
    </div>
  );
}

export default function LandingPage({ onSignIn, onSignUp }) {
  const native = isNativeApp();

  return (
    <div id="landing">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Onest:wght@300..800&display=swap"
      />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Logo />
          <nav className="landing-nav">
            <a href="#demo">Démo</a>
            <a href="#how">Comment ça marche</a>
            <a href="#report">Rapport</a>
            <a href="#pricing">Tarifs</a>
            <div className="landing-nav-actions">
              <button className="landing-btn landing-btn-text" onClick={onSignIn}>Se connecter</button>
              <button className="landing-btn landing-btn-solid landing-btn-header" onClick={onSignUp}>Essayer</button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-eyebrow">POUR LES DÉMÉNAGEURS PROFESSIONNELS</div>
        <h1 className="landing-h1">Toute la journée, sur l'appareil que vous avez <em>en main</em>.</h1>
        <p className="landing-hero-sub">
          Devis et agenda au bureau. Contact client sur la route. Inventaire en direct pendant la visite.
          Les mêmes fonctionnalités vous suivent sur ordinateur, téléphone et tablette.
        </p>
        <div className="landing-hero-actions">
          <button className="landing-btn landing-btn-solid landing-btn-hero" onClick={onSignUp}>Essayer gratuitement</button>
          <a href="#how" className="landing-hero-link">
            Comment ça marche
            <ChevronIcon />
          </a>
        </div>
        <div className="landing-hero-note">30 jours gratuits · Sans carte bancaire</div>

        <div className="landing-hero-scenarios">
          <div className="landing-scenario-card">
            <div className="landing-scenario-shot">
              <div className="landing-mockup-desktop">
                <div className="landing-mockup-bar">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                  <span className="landing-mockup-bar-title">Move Up App</span>
                </div>
                <div className="landing-mockup-body">
                  <div className="landing-mockup-block">
                    <div className="landing-mockup-block-label">DEVIS EN COURS</div>
                    <div className="landing-mockup-row"><span>Famille Martin</span><strong>1 240 €</strong></div>
                    <div className="landing-mockup-row"><span>SCI Bréhat</span><strong>3 680 €</strong></div>
                  </div>
                  <div className="landing-mockup-block">
                    <div className="landing-mockup-block-label">AGENDA — AUJOURD'HUI</div>
                    <div className="landing-mockup-row"><span className="landing-mockup-time">10h00</span><span>Dupont — Lyon</span></div>
                    <div className="landing-mockup-row"><span className="landing-mockup-time">14h30</span><span>Martin — Villeurbanne</span></div>
                    <div className="landing-mockup-row"><span className="landing-mockup-time">17h00</span><span>SCI Bréhat — Bron</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="landing-scenario-label">AU BUREAU</div>
            <h3 className="landing-scenario-title">Devis &amp; agenda, sur ordinateur</h3>
            <p className="landing-scenario-desc">Préparez vos devis et gérez votre planning sur grand écran, entre deux visites.</p>
          </div>

          <div className="landing-scenario-card">
            <div className="landing-scenario-shot">
              <img src={shotLogement} alt="Fiche client et logement de l'app Move Up sur téléphone" />
            </div>
            <div className="landing-scenario-label">SUR LE TERRAIN</div>
            <h3 className="landing-scenario-title">Contact client, sur téléphone</h3>
            <p className="landing-scenario-desc">Relancez un client ou consultez une visite en cours, où que vous soyez.</p>
          </div>

          <div className="landing-scenario-card">
            <div className="landing-scenario-shot">
              <img src={shotTablette} alt="Inventaire en direct de l'app Move Up sur iPad" />
            </div>
            <div className="landing-scenario-label">PENDANT LA VISITE</div>
            <h3 className="landing-scenario-title">Inventaire en direct, sur iPad</h3>
            <p className="landing-scenario-desc">Ajoutez les meubles pièce par pièce chez le client, le volume se calcule en direct.</p>
          </div>
        </div>
      </section>

      {/* ── Démo interactive ───────────────────────────── */}
      <section id="demo" className="landing-demo-section">
        <VolumeDemo />
      </section>

      {/* ── Comment ça marche ──────────────────────────── */}
      <section id="how" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-head">
            <div className="landing-eyebrow">COMMENT ÇA MARCHE</div>
            <h2 className="landing-h2">Trois écrans, une visite, un devis.</h2>
          </div>
          <div className="landing-steps-grid">
            <div>
              <div className="landing-step-shot"><img src={shotLogement} alt="Écran Client / Logement de l'app Move Up" /></div>
              <div className="landing-step-num">01</div>
              <h3 className="landing-step-title">Le client, le logement</h3>
              <p className="landing-step-desc">Coordonnées, date, étage, ascenseur, stationnement camion, distance de portage. L'app signale les contraintes d'accès au fur et à mesure.</p>
            </div>
            <div>
              <div className="landing-step-shot"><img src={shotInventaire} alt="Écran Inventaire par pièce de l'app Move Up" /></div>
              <div className="landing-step-num">02</div>
              <h3 className="landing-step-title">L'inventaire, pièce par pièce</h3>
              <p className="landing-step-desc">Un catalogue de plus de 100 objets, la recherche pour tout le reste. Chaque tap met à jour le volume, les fragiles, les lourds, les meubles à démonter.</p>
            </div>
            <div>
              <div className="landing-step-shot"><img src={shotSynthese} alt="Écran Synthèse et devis de l'app Move Up" /></div>
              <div className="landing-step-num">03</div>
              <h3 className="landing-step-title">La synthèse, le devis</h3>
              <p className="landing-step-desc">Volume total, camion et équipe recommandés, rapport PDF, lien de suivi client, devis chiffré. Avant même d'être remonté dans la voiture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sur le terrain ─────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner landing-field-grid">
          <div>
            <div className="landing-eyebrow">SUR LE TERRAIN</div>
            <h2 className="landing-h2-sm" style={{ marginBottom: 24 }}>Pensée pour être utilisée debout, dans un couloir.</h2>
            <p className="landing-lead" style={{ marginBottom: 36 }}>Grandes cibles tactiles, une main suffit, et le total reste visible en haut de l'écran en permanence.</p>
            <div className="landing-field-list">
              <div className="landing-field-item"><CheckIcon /><span>Photos de chaque pièce intégrées au rapport</span></div>
              <div className="landing-field-item"><CheckIcon /><span>Français et anglais, y compris les documents client</span></div>
              <div className="landing-field-item"><CheckIcon /><span>Historique complet de toutes vos visites</span></div>
            </div>
          </div>
          <div className="landing-field-visual">
            <img src={shotTablette} alt="Move Up App utilisée sur le terrain pendant une visite" />
          </div>
        </div>
      </section>

      {/* ── Rapport PDF ────────────────────────────────── */}
      <section id="report" className="landing-section">
        <div className="landing-section-inner landing-report-grid">
          <div className="landing-report-mockup-wrap">
            <div className="landing-report-mockup">
              <div className="landing-report-head">
                <div>
                  <div className="title">Rapport de visite</div>
                  <div className="meta">Example Family · 26 août 2026</div>
                </div>
                <div className="vol-wrap">
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
                <div className="landing-report-tag">
                  <div className="label">LOGISTIQUE</div>
                  <div className="value">Camion 30 m³ + remorque</div>
                </div>
                <div className="landing-report-tag">
                  <div className="label">ÉQUIPE</div>
                  <div className="value">4 déménageurs</div>
                </div>
              </div>
            </div>
          </div>
          <div className="landing-report-copy">
            <div className="landing-eyebrow">CE QUE REÇOIT LE CLIENT</div>
            <h2 className="landing-h2-sm" style={{ marginBottom: 24 }}>Un rapport que vous n'avez pas honte d'envoyer.</h2>
            <p className="landing-lead">Inventaire complet, contraintes d'accès, photos, logistique recommandée, votre logo. Généré en un clic à la fin de la visite, dans la langue de votre client.</p>
            <button className="landing-btn landing-btn-solid landing-btn-report" onClick={onSignUp}>Générer mon premier rapport</button>
          </div>
        </div>
      </section>

      {/* ── Tarifs ─────────────────────────────────────── */}
      <section id="pricing" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-pricing-head">
            <h2 className="landing-h2">Un prix, pas de palier surprise.</h2>
            <p>Commencez gratuitement, décidez au bout de 30 jours.</p>
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
              <button className="landing-btn landing-btn-outline landing-btn-block" onClick={onSignUp}>Démarrer l'essai gratuit</button>
            </div>

            <div className="landing-plan pro">
              <div className="landing-plan-headrow">
                <span className="landing-plan-label">PRO</span>
                <span className="landing-plan-badge">LE PLUS POPULAIRE</span>
              </div>
              <div className="landing-plan-price"><strong>19,99 €</strong><span>HT/mois</span></div>
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
                <p style={{ fontSize: 12, textAlign: 'center', color: 'rgba(246,244,239,0.6)' }}>Contactez votre administrateur pour en savoir plus</p>
              ) : (
                <button className="landing-btn landing-btn-light landing-btn-block" onClick={() => openProCheckout()}>S'abonner au plan Pro</button>
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
      <section className="landing-section landing-final">
        <div className="landing-final-inner">
          <h2 className="landing-h1-sm">Votre prochaine visite peut déjà se faire dessus.</h2>
          <p>30 jours gratuits, sans carte bancaire.</p>
          <button className="landing-btn landing-btn-solid landing-btn-final" onClick={onSignUp}>Créer mon compte</button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="landing-section">
        <div className="landing-footer-inner">
          <div className="landing-footer-top">
            <Logo footer />
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
