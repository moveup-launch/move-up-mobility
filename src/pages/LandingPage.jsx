export default function LandingPage({ onSignIn, onSignUp }) {
  const ACCENT = '#2B6BE6';
  const GOLD = '#D4A017';

  return (
    <div id="landing">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#1A1917', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1917', letterSpacing: -0.4 }}>Move Up</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="landing-btn-ghost" onClick={onSignIn}>Se connecter</button>
            <button className="landing-btn-primary" onClick={onSignUp}>Essayer gratuitement</button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <div className="landing-badge">🚀 Plan Pro à 9,99€/mois · Visites illimitées</div>
          <h1 className="landing-h1">
            L'assistant de visite pour les<br />
            <span style={{ color: ACCENT }}>professionnels du déménagement</span>
          </h1>
          <p className="landing-sub">
            Estimez les volumes, gérez vos visites, générez vos rapports en quelques minutes.
            Fini les tableurs, fini les oublis.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
            <button className="landing-btn-primary landing-btn-lg" onClick={onSignUp}>
              Essayer gratuitement →
            </button>
            <button className="landing-btn-ghost landing-btn-lg" onClick={onSignIn}>
              Voir une démo
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9E9C94', marginTop: 14 }}>3 visites gratuites · Sans carte bancaire</p>
        </div>

        {/* App preview */}
        <div className="landing-container" style={{ marginTop: 48 }}>
          <div className="landing-preview">
            <div className="landing-preview-bar">
              <span /><span /><span />
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {['📦 42.5 m³', '🛋️ 12 pièces', '📷 8 photos'].map(t => (
                  <div key={t} style={{ background: '#F0EFE9', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#1A1917' }}>{t}</div>
                ))}
              </div>
              {[
                { icon: '🛋️', name: 'Salon', vol: '8.2 m³', items: 6 },
                { icon: '🛏️', name: 'Chambre principale', vol: '12.4 m³', items: 9 },
                { icon: '🍳', name: 'Cuisine', vol: '6.8 m³', items: 11 },
              ].map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #E4E2DB' }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1917' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#9E9C94' }}>{r.items} objets</div>
                  </div>
                  <div style={{ fontWeight: 700, color: ACCENT }}>{r.vol}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ────────────────────────────── */}
      <section className="landing-section landing-section-light">
        <div className="landing-container">
          <h2 className="landing-h2">Tout ce dont vous avez besoin</h2>
          <p className="landing-section-sub">Une solution complète de A à Z pour vos visites de déménagement</p>
          <div className="landing-grid-3">
            {[
              { icon: '📋', title: 'Inventaire intelligent', desc: 'Catalogue de 100+ objets, calcul automatique du volume m³. Ajoutez des objets en un tap, générez une estimation précise en quelques minutes.' },
              { icon: '📅', title: 'Agenda des visites', desc: 'Planifiez et gérez toutes vos visites client. Statuts, rappels, historique complet. Ne ratez plus aucune visite.' },
              { icon: '📄', title: 'Rapports PDF', desc: 'Générez des rapports professionnels en un clic. Inventaire, accès, équipe recommandée — tout est inclus.' },
              { icon: '📷', title: 'Photos de visite', desc: "Photographiez chaque pièce directement depuis l'app. Les photos s'intègrent au rapport PDF automatiquement." },
              { icon: '🏠', title: 'Gestion des accès', desc: "Ascenseur, monte-meubles, stationnement camion — documentez chaque contrainte d'accès pour un devis précis." },
              { icon: '📱', title: 'Mobile-first', desc: "Conçue pour être utilisée sur le terrain avec votre téléphone. Fonctionne aussi hors ligne." },
            ].map(f => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pour qui ───────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-h2">Pour qui ?</h2>
          <div className="landing-grid-2">
            <div className="landing-audience-card" style={{ borderTop: `4px solid ${ACCENT}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#1A1917' }}>Professionnels du déménagement</h3>
              <p style={{ color: '#6B6860', lineHeight: 1.6, marginBottom: 16 }}>
                Gagnez du temps sur vos visites terrain. Produisez des devis professionnels immédiatement après chaque visite, sans ressaisie.
              </p>
              <ul className="landing-check-list">
                {['Catalogue objets professionnel', 'Rapports PDF avec logo', 'Historique toutes vos visites', 'Multi-utilisateurs (plan Entreprise)'].map(i => (
                  <li key={i}><span style={{ color: ACCENT }}>✓</span> {i}</li>
                ))}
              </ul>
            </div>
            <div className="landing-audience-card" style={{ borderTop: '4px solid #2A9D5C' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#1A1917' }}>Particuliers</h3>
              <p style={{ color: '#6B6860', lineHeight: 1.6, marginBottom: 16 }}>
                Estimez votre volume avant de demander des devis. Comparez les offres sur une base objective et évitez les mauvaises surprises.
              </p>
              <ul className="landing-check-list">
                {['3 visites gratuites', 'Calcul volume automatique', 'PDF récapitulatif', 'Aucune inscription requise pour tester'].map(i => (
                  <li key={i}><span style={{ color: '#2A9D5C' }}>✓</span> {i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tarifs ─────────────────────────────────────── */}
      <section className="landing-section landing-section-dark" id="pricing">
        <div className="landing-container">
          <h2 className="landing-h2" style={{ color: 'white' }}>Tarifs simples et transparents</h2>
          <p className="landing-section-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>Commencez gratuitement, évoluez selon vos besoins</p>
          <div className="landing-grid-3" style={{ marginTop: 40 }}>
            {/* Gratuit */}
            <div className="landing-plan-card">
              <div className="landing-plan-name">Gratuit</div>
              <div className="landing-plan-price">0 €<span>/mois</span></div>
              <p className="landing-plan-desc">Pour découvrir l'outil</p>
              <ul className="landing-plan-features">
                <li>✓ 3 visites par mois</li>
                <li>✓ PDF basique</li>
                <li>✓ 5 photos par visite</li>
                <li>✓ Inventaire complet</li>
                <li style={{ color: '#9E9C94' }}>✗ Historique illimité</li>
                <li style={{ color: '#9E9C94' }}>✗ Multi-utilisateurs</li>
              </ul>
              <button className="landing-plan-btn landing-plan-btn-ghost" onClick={onSignUp}>
                Commencer gratuitement
              </button>
            </div>

            {/* Pro */}
            <div className="landing-plan-card landing-plan-card-featured">
              <div className="landing-plan-badge">Le plus populaire</div>
              <div className="landing-plan-name" style={{ color: 'white' }}>Pro</div>
              <div className="landing-plan-price" style={{ color: 'white' }}>9,99 €<span>/mois</span></div>
              <p className="landing-plan-desc" style={{ color: 'rgba(255,255,255,0.7)' }}>Pour les professionnels actifs</p>
              <ul className="landing-plan-features" style={{ color: 'rgba(255,255,255,0.9)' }}>
                <li>✓ Visites illimitées</li>
                <li>✓ PDF complet avec photos</li>
                <li>✓ Photos illimitées</li>
                <li>✓ Historique complet</li>
                <li>✓ Support email prioritaire</li>
                <li style={{ color: 'rgba(255,255,255,0.4)' }}>✗ Multi-utilisateurs</li>
              </ul>
              <button className="landing-plan-btn landing-plan-btn-white" onClick={onSignUp}>
                Démarrer l'essai Pro
              </button>
            </div>

            {/* Entreprise */}
            <div className="landing-plan-card">
              <div className="landing-plan-name">Entreprise</div>
              <div className="landing-plan-price" style={{ color: GOLD }}>79 €<span>/mois</span></div>
              <p className="landing-plan-desc">Pour les équipes et agences</p>
              <ul className="landing-plan-features">
                <li>✓ Tout le plan Pro</li>
                <li>✓ Multi-utilisateurs</li>
                <li>✓ Marque blanche PDF</li>
                <li>✓ Support prioritaire</li>
                <li>✓ Onboarding personnalisé</li>
                <li>✓ Facturation annuelle dispo.</li>
              </ul>
              <button className="landing-plan-btn landing-plan-btn-gold" onClick={onSignUp}>
                Contacter l'équipe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────── */}
      <section className="landing-section" style={{ textAlign: 'center' }}>
        <div className="landing-container">
          <h2 className="landing-h2">Prêt à gagner du temps sur vos visites ?</h2>
          <p className="landing-section-sub">Rejoignez les professionnels qui font confiance à Move Up Mobility</p>
          <button className="landing-btn-primary landing-btn-lg" style={{ marginTop: 24 }} onClick={onSignUp}>
            Créer mon compte gratuitement →
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#3A3835', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: 'white' }}>Move Up Mobility</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            moveupapp.com · © 2026 Move Up Mobility
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={onSignIn} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Connexion</button>
            <button onClick={onSignUp} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Inscription</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
