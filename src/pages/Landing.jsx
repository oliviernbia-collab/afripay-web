import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  faArrowUp,
  faBars,
  faBolt,
  faChartLine,
  faCircleCheck,
  faHandBackFist,
  faHistory,
  faLock,
  faPaperPlane,
  faPhone,
  faMobileScreenButton,
  faQrcode,
  faRightLeft,
  faShieldHalved,
  faStore,
  faTimes,
  faUserCheck,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import Icon from '../components/Icon';
import Banner from '../components/Banner';
import { api } from '../api/client';
import logo from '../assets/logo.png';
import '../landing.css';

const OPERATEURS = ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Carte bancaire', 'Carte Djamo'];

const ETAPES_CLIENT = [
  {
    icon: faUserCheck,
    titre: 'Inscription & vérification',
    texte: "Créez votre compte en quelques minutes et validez votre identité (KYC) en toute sécurité.",
  },
  {
    icon: faWallet,
    titre: 'Rechargez votre wallet',
    texte: 'Alimentez votre solde AfriPay via Wave, Orange Money, MTN MoMo ou Moov Money.',
  },
  {
    icon: faHandBackFist,
    titre: 'Enrôlez votre paume',
    texte: "Enregistrez votre empreinte de paume une seule fois, en toute confidentialité.",
  },
  {
    icon: faBolt,
    titre: 'Payez sans contact',
    texte: 'Réglez vos achats chez les marchands AfriPay d\'un simple geste de la main.',
  },
];

const FONCTIONNALITES = [
  {
    icon: faHandBackFist,
    titre: 'Paiement biométrique',
    texte: "Plus besoin de téléphone ni de carte : votre paume est votre moyen de paiement.",
  },
  {
    icon: faWallet,
    titre: 'Recharge multi-opérateurs',
    texte: 'Wave, Orange Money, MTN MoMo, Moov Money — rechargez votre wallet où que vous soyez.',
  },
  {
    icon: faRightLeft,
    titre: 'Transferts instantanés',
    texte: 'Envoyez de l\'argent à vos proches en toute simplicité, avec confirmation par PIN.',
  },
  {
    icon: faQrcode,
    titre: 'QR Code de secours',
    texte: 'Un code QR personnel reste disponible si la caméra ou l\'éclairage posent problème.',
  },
  {
    icon: faHistory,
    titre: 'Historique & notifications',
    texte: 'Suivez toutes vos opérations et recevez des alertes en temps réel.',
  },
  {
    icon: faLock,
    titre: 'Sécurité renforcée',
    texte: 'Code PIN obligatoire pour les transferts et au-delà de 50 000 FCFA en paiement biométrique.',
  },
];

const CLIENT_POINTS = [
  {
    icon: faHandBackFist,
    titre: 'Paiement biométrique',
    texte: "Payez chez les marchands AfriPay d'un simple geste de la main, sans carte ni téléphone à sortir.",
  },
  {
    icon: faWallet,
    titre: 'Recharge multi-opérateurs',
    texte: 'Alimentez votre wallet via Wave, Orange Money, MTN MoMo ou Moov Money, en quelques secondes.',
  },
  {
    icon: faRightLeft,
    titre: 'Transferts instantanés',
    texte: "Envoyez de l'argent à vos proches, confirmé par votre code PIN.",
  },
  {
    icon: faHistory,
    titre: 'Historique & notifications',
    texte: 'Suivez toutes vos opérations et recevez une alerte à chaque mouvement.',
  },
];

const MARCHAND_POINTS = [
  {
    icon: faHandBackFist,
    titre: 'Encaissement par scan de paume',
    texte: 'Encaissez vos clients en un geste, sans terminal de paiement coûteux.',
  },
  {
    icon: faChartLine,
    titre: 'Tableau de bord marchand',
    texte: 'Suivez votre chiffre d\'affaires, vos transactions et votre solde en temps réel.',
  },
  {
    icon: faRightLeft,
    titre: 'Transfert de fonds',
    texte: 'Transférez vos gains vers votre moyen de paiement mobile préféré.',
  },
  {
    icon: faUserCheck,
    titre: 'Vérification KYB',
    texte: 'Un parcours d\'inscription dédié valide votre activité commerciale en toute confiance.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [showAdminGate, setShowAdminGate] = useState(false);

  function requestAdminAccess(e) {
    e.preventDefault();
    setMenuOpen(false);
    setShowAdminGate(true);
  }

  const [contactNom, setContactNom] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTelephone, setContactTelephone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  async function handleContactSubmit(e) {
    e.preventDefault();
    setContactError('');
    if (!contactEmail.trim() && !contactTelephone.trim()) {
      setContactError('Indiquez votre e-mail ou votre téléphone, pour que nous puissions vous répondre.');
      return;
    }
    setContactSending(true);
    try {
      await api.post(
        '/contact',
        { nom: contactNom, email: contactEmail, telephone: contactTelephone, message: contactMessage },
        { auth: false }
      );
      setContactSent(true);
      setContactNom('');
      setContactEmail('');
      setContactTelephone('');
      setContactMessage('');
    } catch (err) {
      setContactError(err.message);
    } finally {
      setContactSending(false);
    }
  }

  useEffect(() => {
    api
      .get('/annonces/active', { auth: false })
      .then(setAnnonces)
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = 'AfriPay — Payez. Envoyez. Progressez.';
  }, []);

  // Un chargement direct sur une URL avec ancre (ex. http://localhost:5173/#contact — lien
  // partagé, favori, rafraîchissement de page) arrive AVANT que React n'ait peint les sections :
  // le défilement natif du navigateur vers #contact se déclenche sur un DOM encore vide et ne se
  // répète pas une fois le contenu monté, donc la page reste en haut. On le refait nous-mêmes une
  // fois le rendu terminé.
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const target = document.getElementById(id);
    target?.scrollIntoView();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || showAdminGate ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, showAdminGate]);

  useEffect(() => {
    if (!showAdminGate) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowAdminGate(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAdminGate]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <div className="lp">
      {annonces.length > 0 && (
        <div className="lp-announce-bar" role="status">
          <div className="lp-announce-track">
            <span className="lp-announce-content">
              {annonces.map((a) => a.message).join('   •   ')}
            </span>
            <span className="lp-announce-content" aria-hidden="true">
              {annonces.map((a) => a.message).join('   •   ')}
            </span>
          </div>
        </div>
      )}

      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="#top" className="lp-brand">
            <img src={logo} alt="AfriPay" />
            <span>AfriPay</span>
          </a>

          <nav className={`lp-nav ${menuOpen ? 'open' : ''}`}>
            <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)}>Fonctionnalités</a>
            <a
              href="#app-client"
              className={selectedApp === 'client' ? 'lp-nav-active' : ''}
              onClick={() => { setMenuOpen(false); setSelectedApp('client'); }}
            >
              Application Client
            </a>
            <a
              href="#marchands"
              className={selectedApp === 'marchand' ? 'lp-nav-active' : ''}
              onClick={() => { setMenuOpen(false); setSelectedApp('marchand'); }}
            >
              Marchands
            </a>
            <a href="#securite" onClick={() => setMenuOpen(false)}>Sécurité</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <Link to="/login" className="lp-nav-login lp-nav-login-admin" onClick={requestAdminAccess}>
              Espace Admin
            </Link>
          </nav>

          <button
            type="button"
            className="lp-menu-toggle"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="lp-hero">
          <div className="lp-hero-bg" aria-hidden="true" />
          <div className="lp-container lp-hero-inner">
            <div className="lp-hero-copy">
              <span className="lp-eyebrow">Paiement mobile par reconnaissance de paume</span>
              <h1>
                Payez. Envoyez. <span className="lp-gradient-text">Progressez.</span>
              </h1>
              <p className="lp-hero-text">
                AfriPay réinvente le paiement du quotidien en Afrique de l'Ouest&nbsp;: rechargez
                votre wallet depuis votre mobile money habituel, puis payez chez vos marchands
                d'un simple geste de la main — sans carte, sans téléphone à sortir.
              </p>
              <div className="lp-hero-cta">
                <a
                  href="#app-client"
                  className={`btn btn-cta lp-btn-lg ${selectedApp === 'client' ? 'lp-btn-selected' : ''}`}
                  onClick={() => setSelectedApp('client')}
                >
                  Je suis client
                </a>
                <a
                  href="#marchands"
                  className={`btn btn-ghost lp-btn-lg ${selectedApp === 'marchand' ? 'lp-btn-selected' : ''}`}
                  onClick={() => setSelectedApp('marchand')}
                >
                  Je suis marchand
                </a>
              </div>
              <div className="lp-hero-operateurs">
                <span>Rechargez via</span>
                <div className="lp-operateurs-list">
                  {OPERATEURS.map((op) => (
                    <span key={op} className="lp-operateur-chip">{op}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lp-hero-visual">
              <div className="lp-phone-mock">
                <div className="lp-phone-notch" />
                <div className="lp-phone-screen">
                  <img src={logo} alt="" className="lp-phone-logo" />
                  <div className="lp-phone-balance">
                    <span className="lp-phone-balance-label">Solde disponible</span>
                    <span className="lp-phone-balance-value">128 500 FCFA</span>
                  </div>
                  <div className="lp-phone-palm">
                    <Icon icon={faHandBackFist} />
                  </div>
                  <span className="lp-phone-hint">Posez votre paume pour payer</span>
                </div>
              </div>
              <div className="lp-float-badge lp-float-badge-1">
                <Icon icon={faShieldHalved} />
                <span>KYC vérifié</span>
              </div>
              <div className="lp-float-badge lp-float-badge-2">
                <Icon icon={faBolt} />
                <span>Paiement instantané</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Bandeau confiance ---------- */}
        <section className="lp-trust">
          <div className="lp-container lp-trust-inner">
            <div className="lp-trust-item">
              <Icon icon={faHandBackFist} />
              <span>Paiement par reconnaissance de paume</span>
            </div>
            <div className="lp-trust-item">
              <Icon icon={faShieldHalved} />
              <span>Comptes vérifiés KYC / KYB</span>
            </div>
            <div className="lp-trust-item">
              <Icon icon={faLock} />
              <span>PIN de sécurité systématique</span>
            </div>
            <div className="lp-trust-item">
              <Icon icon={faWallet} />
              <span>Compatible mobile money</span>
            </div>
          </div>
        </section>

        {/* ---------- Comment ça marche ---------- */}
        <section id="comment-ca-marche" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Comment ça marche</span>
              <h2>Quatre étapes vers un paiement sans contact</h2>
              <p>Un parcours pensé pour être simple, rapide et accessible à tous.</p>
            </div>
            <div className="lp-steps">
              {ETAPES_CLIENT.map((etape, i) => (
                <div className="lp-step" key={etape.titre}>
                  <div className="lp-step-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="lp-step-icon">
                    <Icon icon={etape.icon} />
                  </div>
                  <h3>{etape.titre}</h3>
                  <p>{etape.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Fonctionnalités ---------- */}
        <section id="fonctionnalites" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Fonctionnalités</span>
              <h2>Tout ce qu'il faut pour gérer votre argent au quotidien</h2>
              <p>Une application complète, pensée pour la réalité du terrain ouest-africain.</p>
            </div>
            <div className="lp-feature-grid">
              {FONCTIONNALITES.map((f) => (
                <div className="lp-feature-card" key={f.titre}>
                  <div className="lp-feature-icon">
                    <Icon icon={f.icon} />
                  </div>
                  <h3>{f.titre}</h3>
                  <p>{f.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Nos applications (Client / Marchand côte à côte) ---------- */}
        <section id="applications" className="lp-section lp-apps">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Nos applications</span>
              <h2>Une expérience pensée pour chaque profil</h2>
              <p>Deux applications complémentaires, sécurisées et simples à utiliser.</p>
            </div>

            <div className="lp-apps-grid">
              <div
                id="app-client"
                className={`lp-app-card lp-app-card-client ${selectedApp === 'client' ? 'lp-app-card-selected' : ''}`}
              >
                <div className="lp-app-card-icon">
                  <Icon icon={faWallet} />
                </div>
                <span className="lp-eyebrow">Application Client</span>
                <h3>Gérez votre argent, en toute liberté</h3>
                <p>
                  Avec l'app <strong>AfriPay</strong>, rechargez votre wallet depuis votre mobile
                  money habituel, payez chez vos marchands d'un geste de la main, et envoyez de
                  l'argent à vos proches en quelques secondes.
                </p>
                <ul className="lp-app-feature-list">
                  {CLIENT_POINTS.map((p) => (
                    <li key={p.titre}>
                      <div className="lp-app-feature-icon">
                        <Icon icon={p.icon} />
                      </div>
                      <div>
                        <h4>{p.titre}</h4>
                        <p>{p.texte}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <a href="#telecharger" className="btn btn-cta lp-btn-lg lp-app-card-cta">
                  <Icon icon={faMobileScreenButton} />
                  Télécharger l'app Client
                </a>
              </div>

              <div
                id="marchands"
                className={`lp-app-card lp-app-card-merchant ${selectedApp === 'marchand' ? 'lp-app-card-selected' : ''}`}
              >
                <div className="lp-app-card-icon">
                  <Icon icon={faStore} />
                </div>
                <span className="lp-eyebrow">AfriPay Pro — pour les marchands</span>
                <h3>Encaissez plus vite, sans matériel coûteux</h3>
                <p>
                  Avec l'application <strong>AfriPay Pro</strong>, vos clients vous paient d'un
                  geste — plus besoin de terminal de paiement ni de rendu de monnaie. Suivez votre
                  activité et transférez vos fonds en toute autonomie.
                </p>
                <ul className="lp-app-feature-list">
                  {MARCHAND_POINTS.map((p) => (
                    <li key={p.titre}>
                      <div className="lp-app-feature-icon">
                        <Icon icon={p.icon} />
                      </div>
                      <div>
                        <h4>{p.titre}</h4>
                        <p>{p.texte}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <a href="#telecharger" className="btn btn-cta lp-btn-lg lp-app-card-cta">
                  <Icon icon={faStore} />
                  Télécharger AfriPay Pro
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Sécurité ---------- */}
        <section id="securite" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Sécurité & conformité</span>
              <h2>Votre argent, vos données, protégés</h2>
              <p>La sécurité est au cœur de la conception d'AfriPay, à chaque étape du parcours.</p>
            </div>
            <div className="lp-security-grid">
              <div className="lp-security-card">
                <Icon icon={faUserCheck} />
                <h3>Vérification KYC / KYB</h3>
                <p>Chaque client et chaque marchand passe par une validation d'identité contrôlée par notre équipe conformité.</p>
              </div>
              <div className="lp-security-card">
                <Icon icon={faLock} />
                <h3>PIN obligatoire</h3>
                <p>Un code PIN est systématiquement requis pour les transferts, et au-delà de 50 000 FCFA pour le paiement biométrique.</p>
              </div>
              <div className="lp-security-card">
                <Icon icon={faHandBackFist} />
                <h3>Donnée biométrique protégée</h3>
                <p>Le gabarit de votre paume est traité et stocké de façon sécurisée, jamais partagé avec des tiers.</p>
              </div>
              <div className="lp-security-card">
                <Icon icon={faPhone} />
                <h3>Plafonds de sécurité</h3>
                <p>Un plafond de recharge de 10 000 FCFA limite l'exposition en cas de perte ou de vol de votre téléphone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Téléchargement / CTA ---------- */}
        <section id="telecharger" className="lp-section lp-cta">
          <div className="lp-container lp-cta-inner">
            <h2>Prêt à payer autrement ?</h2>
            <p>AfriPay arrive bientôt. Laissez-nous vos coordonnées pour être informé du lancement.</p>
            <div className="lp-cta-buttons">
              <a href="#contact" className="btn btn-cta lp-btn-lg">Être informé au lancement</a>
              <Link to="/login" className="btn btn-ghost lp-btn-lg" onClick={requestAdminAccess}>Espace Admin</Link>
            </div>
            <p className="lp-cta-note">Application Client et application marchand AfriPay Pro — bientôt disponibles.</p>
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" className="lp-section lp-section-alt">
          <div className="lp-container lp-contact-inner">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Contact</span>
              <h2>Une question ? Écrivez-nous</h2>
              <p>Notre équipe vous répond au plus vite, par e-mail ou par téléphone.</p>
            </div>

            <div className="lp-contact-card">
              {contactSent ? (
                <div className="lp-contact-success">
                  <Icon icon={faCircleCheck} />
                  <h3>Message envoyé</h3>
                  <p>Merci, nous avons bien reçu votre message et reviendrons vers vous rapidement.</p>
                  <button type="button" className="btn btn-ghost" onClick={() => setContactSent(false)}>
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="stack gap-16">
                  <Banner type="error" message={contactError} onClose={() => setContactError('')} />
                  <div className="row gap-16 wrap">
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-nom">Nom</label>
                      <input
                        id="contact-nom"
                        className="input"
                        value={contactNom}
                        onChange={(e) => setContactNom(e.target.value)}
                        required
                        maxLength={150}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  <div className="row gap-16 wrap">
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-email">E-mail</label>
                      <input
                        id="contact-email"
                        className="input"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        maxLength={150}
                        placeholder="vous@exemple.com"
                      />
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-telephone">Téléphone</label>
                      <input
                        id="contact-telephone"
                        className="input"
                        value={contactTelephone}
                        onChange={(e) => setContactTelephone(e.target.value)}
                        maxLength={20}
                        placeholder="+225 07 00 00 00 00"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      className="input"
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                      maxLength={2000}
                      placeholder="Votre question ou votre demande…"
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn btn-cta lp-btn-lg" disabled={contactSending}>
                      <Icon icon={faPaperPlane} />
                      {contactSending ? 'Envoi…' : 'Envoyer le message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-brand">
              <img src={logo} alt="AfriPay" />
              <span>AfriPay</span>
            </div>
            <p>Payez. Envoyez. Progressez.</p>
            <p className="lp-footer-contact">
              <a href="mailto:olivier@africorpgroup.tech">olivier@africorpgroup.tech</a>
            </p>
          </div>
          <div className="lp-footer-col">
            <h4>Produit</h4>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#comment-ca-marche">Comment ça marche</a>
            <a href="#app-client">Application Client</a>
            <a href="#marchands">AfriPay Pro</a>
            <a href="#securite">Sécurité</a>
          </div>
          <div className="lp-footer-col">
            <h4>Entreprise</h4>
            <a href="#contact">Contact</a>
            <Link to="/login" onClick={requestAdminAccess}>Espace Admin</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} AfriPay. Tous droits réservés.</span>
        </div>
      </footer>

      <button
        type="button"
        className={`lp-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Retour en haut de la page"
        tabIndex={showBackToTop ? 0 : -1}
      >
        <Icon icon={faArrowUp} />
      </button>

      {showAdminGate && (
        <div className="lp-modal-overlay" onClick={() => setShowAdminGate(false)}>
          <div
            className="lp-modal-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-gate-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lp-modal-icon">
              <Icon icon={faShieldHalved} />
            </div>
            <h3 id="admin-gate-title">Espace réservé</h3>
            <p>
              Cette partie du site est réservée aux administrateurs d'AfriPay. Continuez
              uniquement si vous disposez d'un compte administrateur.
            </p>
            <div className="lp-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdminGate(false)}>
                Retour
              </button>
              <button type="button" className="btn btn-danger" onClick={() => navigate('/login')}>
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
