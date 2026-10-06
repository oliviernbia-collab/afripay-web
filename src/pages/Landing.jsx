import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  faArrowUp,
  faBars,
  faBolt,
  faChartLine,
  faChevronDown,
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
import Reveal from '../components/Reveal';
import { api } from '../api/client';
import logo from '../assets/logo.png';
import { LANDING_I18N, LANGUAGES } from '../i18n/landing';
import '../landing.css';

// Icônes des listes à puces — stables quelle que soit la langue, voir i18n/landing.js pour les
// libellés (même ordre que ces tableaux, zippés par index au rendu).
const ETAPES_ICONS = [faUserCheck, faWallet, faHandBackFist, faBolt];
const FONCTIONNALITES_ICONS = [faHandBackFist, faWallet, faRightLeft, faQrcode, faHistory, faLock];
const CLIENT_POINTS_ICONS = [faHandBackFist, faWallet, faRightLeft, faHistory];
const MARCHAND_POINTS_ICONS = [faHandBackFist, faChartLine, faRightLeft, faUserCheck];
const TRUST_ICONS = [faHandBackFist, faShieldHalved, faLock, faWallet];
const SECURITE_ICONS = [faUserCheck, faLock, faHandBackFist, faPhone, faLock];

const LANG_STORAGE_KEY = 'afripay_landing_lang';

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) || 'fr';
    } catch {
      return 'fr';
    }
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const t = LANDING_I18N[lang];
  const currentLanguage = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const etapes = t.comment.etapes.map((e, i) => ({ ...e, icon: ETAPES_ICONS[i] }));
  const fonctionnalites = t.fonctionnalites.items.map((f, i) => ({ ...f, icon: FONCTIONNALITES_ICONS[i] }));
  const clientPoints = t.apps.client.points.map((p, i) => ({ ...p, icon: CLIENT_POINTS_ICONS[i] }));
  const marchandPoints = t.apps.marchand.points.map((p, i) => ({ ...p, icon: MARCHAND_POINTS_ICONS[i] }));
  const securiteCards = t.securite.cards.map((c, i) => ({ ...c, icon: SECURITE_ICONS[i] }));

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
      setContactError(t.contact.errorNoContact);
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
    document.title = t.documentTitle;
  }, [lang, t.documentTitle]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // stockage indisponible (navigation privée, etc.) — la langue reste active pour la session en cours
    }
  }, [lang]);

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
    if (!langMenuOpen) return;
    function onPointerDown(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setLangMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [langMenuOpen]);

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
            <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)}>{t.nav.commentCaMarche}</a>
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)}>{t.nav.fonctionnalites}</a>
            <a
              href="#app-client"
              className={selectedApp === 'client' ? 'lp-nav-active' : ''}
              onClick={() => { setMenuOpen(false); setSelectedApp('client'); }}
            >
              {t.nav.applicationClient}
            </a>
            <a
              href="#marchands"
              className={selectedApp === 'marchand' ? 'lp-nav-active' : ''}
              onClick={() => { setMenuOpen(false); setSelectedApp('marchand'); }}
            >
              {t.nav.marchands}
            </a>
            <a href="#securite" onClick={() => setMenuOpen(false)}>{t.nav.securite}</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav.contact}</a>
            <Link to="/login" className="lp-nav-login lp-nav-login-admin" onClick={requestAdminAccess}>
              {t.nav.espaceAdmin}
            </Link>
            <div className="lp-lang-switcher" ref={langMenuRef}>
              <button
                type="button"
                className="lp-lang-current"
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                aria-label={t.langSwitcherLabel}
                onClick={() => setLangMenuOpen((v) => !v)}
              >
                <span className="lp-lang-flag">{currentLanguage.flag}</span>
                <Icon icon={faChevronDown} size="xs" />
              </button>
              {langMenuOpen && (
                <ul className="lp-lang-options" role="listbox" aria-label={t.langSwitcherLabel}>
                  {LANGUAGES.map((l) => (
                    <li key={l.code} role="option" aria-selected={lang === l.code}>
                      <button
                        type="button"
                        className={`lp-lang-option ${lang === l.code ? 'active' : ''}`}
                        onClick={() => { setMenuOpen(false); setLangMenuOpen(false); setLang(l.code); }}
                      >
                        <span className="lp-lang-flag">{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          <button
            type="button"
            className="lp-menu-toggle"
            aria-label={menuOpen ? t.menu.close : t.menu.open}
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
            <Reveal as="div" className="lp-hero-copy">
              <span className="lp-eyebrow">{t.hero.eyebrow}</span>
              <h1>
                {t.hero.titlePart1}<span className="lp-gradient-text">{t.hero.titlePart2}</span>
              </h1>
              <p className="lp-hero-text">{t.hero.text}</p>
              <div className="lp-hero-cta">
                <a
                  href="#app-client"
                  className={`btn btn-cta lp-btn-lg ${selectedApp === 'client' ? 'lp-btn-selected' : ''}`}
                  onClick={() => setSelectedApp('client')}
                >
                  {t.hero.ctaClient}
                </a>
                <a
                  href="#marchands"
                  className={`btn btn-ghost lp-btn-lg ${selectedApp === 'marchand' ? 'lp-btn-selected' : ''}`}
                  onClick={() => setSelectedApp('marchand')}
                >
                  {t.hero.ctaMarchand}
                </a>
              </div>
              <div className="lp-hero-operateurs">
                <span>{t.hero.rechargeVia}</span>
                <div className="lp-operateurs-list">
                  {t.operateurs.map((op) => (
                    <span key={op} className="lp-operateur-chip">{op}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal as="div" className="lp-hero-visual" variant="scale" delay={150}>
              <div className="lp-phone-mock">
                <div className="lp-phone-notch" />
                <div className="lp-phone-screen">
                  <img src={logo} alt="" className="lp-phone-logo" />
                  <div className="lp-phone-balance">
                    <span className="lp-phone-balance-label">{t.hero.balanceLabel}</span>
                    <span className="lp-phone-balance-value">{t.hero.balanceValue}</span>
                  </div>
                  <div className="lp-phone-palm">
                    <Icon icon={faHandBackFist} />
                  </div>
                  <span className="lp-phone-hint">{t.hero.phoneHint}</span>
                </div>
              </div>
              <div className="lp-float-badge lp-float-badge-1">
                <Icon icon={faShieldHalved} />
                <span>{t.hero.badgeKyc}</span>
              </div>
              <div className="lp-float-badge lp-float-badge-2">
                <Icon icon={faBolt} />
                <span>{t.hero.badgeInstant}</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Bandeau confiance ---------- */}
        <section className="lp-trust">
          <div className="lp-container lp-trust-inner">
            {t.trust.map((label, i) => (
              <Reveal as="div" className="lp-trust-item" key={label} delay={i * 70}>
                <Icon icon={TRUST_ICONS[i]} />
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Comment ça marche ---------- */}
        <section id="comment-ca-marche" className="lp-section">
          <div className="lp-container">
            <Reveal as="div" className="lp-section-head">
              <span className="lp-eyebrow">{t.comment.eyebrow}</span>
              <h2>{t.comment.title}</h2>
              <p>{t.comment.subtitle}</p>
            </Reveal>
            <div className="lp-steps">
              {etapes.map((etape, i) => (
                <Reveal as="div" className="lp-step" key={etape.titre} delay={i * 110}>
                  <div className="lp-step-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="lp-step-icon">
                    <Icon icon={etape.icon} />
                  </div>
                  <h3>{etape.titre}</h3>
                  <p>{etape.texte}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Fonctionnalités ---------- */}
        <section id="fonctionnalites" className="lp-section lp-section-alt">
          <div className="lp-container">
            <Reveal as="div" className="lp-section-head">
              <span className="lp-eyebrow">{t.fonctionnalites.eyebrow}</span>
              <h2>{t.fonctionnalites.title}</h2>
              <p>{t.fonctionnalites.subtitle}</p>
            </Reveal>
            <div className="lp-feature-grid">
              {fonctionnalites.map((f, i) => (
                <Reveal as="div" className="lp-feature-card" key={f.titre} delay={(i % 3) * 100}>
                  <div className="lp-feature-icon">
                    <Icon icon={f.icon} />
                  </div>
                  <h3>{f.titre}</h3>
                  <p>{f.texte}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Nos applications (Client / Marchand côte à côte) ---------- */}
        <section id="applications" className="lp-section lp-apps">
          <div className="lp-container">
            <Reveal as="div" className="lp-section-head">
              <span className="lp-eyebrow">{t.apps.eyebrow}</span>
              <h2>{t.apps.title}</h2>
              <p>{t.apps.subtitle}</p>
            </Reveal>

            <div className="lp-apps-grid">
              <Reveal
                as="div"
                variant="left"
                id="app-client"
                className={`lp-app-card lp-app-card-client ${selectedApp === 'client' ? 'lp-app-card-selected' : ''}`}
              >
                <div className="lp-app-card-icon">
                  <Icon icon={faWallet} />
                </div>
                <span className="lp-eyebrow">{t.apps.client.eyebrow}</span>
                <h3>{t.apps.client.title}</h3>
                <p>
                  {t.apps.client.introBefore}<strong>{t.apps.client.introBrand}</strong>{t.apps.client.introAfter}
                </p>
                <ul className="lp-app-feature-list">
                  {clientPoints.map((p) => (
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
                  {t.apps.client.cta}
                </a>
              </Reveal>

              <Reveal
                as="div"
                variant="right"
                id="marchands"
                className={`lp-app-card lp-app-card-merchant ${selectedApp === 'marchand' ? 'lp-app-card-selected' : ''}`}
              >
                <div className="lp-app-card-icon">
                  <Icon icon={faStore} />
                </div>
                <span className="lp-eyebrow">{t.apps.marchand.eyebrow}</span>
                <h3>{t.apps.marchand.title}</h3>
                <p>
                  {t.apps.marchand.introBefore}<strong>{t.apps.marchand.introBrand}</strong>{t.apps.marchand.introAfter}
                </p>
                <ul className="lp-app-feature-list">
                  {marchandPoints.map((p) => (
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
                  {t.apps.marchand.cta}
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Sécurité ---------- */}
        <section id="securite" className="lp-section lp-section-alt">
          <div className="lp-container">
            <Reveal as="div" className="lp-section-head">
              <span className="lp-eyebrow">{t.securite.eyebrow}</span>
              <h2>{t.securite.title}</h2>
              <p>{t.securite.subtitle}</p>
            </Reveal>
            <div className="lp-security-grid">
              {securiteCards.map((card, i) => (
                <Reveal as="div" className="lp-security-card" key={card.titre} delay={(i % 4) * 90}>
                  <Icon icon={card.icon} />
                  <h3>{card.titre}</h3>
                  <p>{card.texte}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Téléchargement / CTA ---------- */}
        <section id="telecharger" className="lp-section lp-cta">
          <Reveal as="div" variant="scale" className="lp-container lp-cta-inner">
            <h2>{t.telecharger.title}</h2>
            <p>{t.telecharger.subtitle}</p>
            <div className="lp-cta-buttons">
              <a href="#contact" className="btn btn-cta lp-btn-lg">{t.telecharger.ctaInformed}</a>
              <Link to="/login" className="btn btn-ghost lp-btn-lg" onClick={requestAdminAccess}>{t.telecharger.espaceAdmin}</Link>
            </div>
            <p className="lp-cta-note">{t.telecharger.note}</p>
          </Reveal>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" className="lp-section lp-section-alt">
          <div className="lp-container lp-contact-inner">
            <Reveal as="div" className="lp-section-head">
              <span className="lp-eyebrow">{t.contact.eyebrow}</span>
              <h2>{t.contact.title}</h2>
              <p>{t.contact.subtitle}</p>
            </Reveal>

            <Reveal as="div" delay={100} className="lp-contact-card">
              {contactSent ? (
                <div className="lp-contact-success">
                  <Icon icon={faCircleCheck} />
                  <h3>{t.contact.successTitle}</h3>
                  <p>{t.contact.successText}</p>
                  <button type="button" className="btn btn-ghost" onClick={() => setContactSent(false)}>
                    {t.contact.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="stack gap-16">
                  <Banner type="error" message={contactError} onClose={() => setContactError('')} />
                  <div className="row gap-16 wrap">
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-nom">{t.contact.labelNom}</label>
                      <input
                        id="contact-nom"
                        className="input"
                        value={contactNom}
                        onChange={(e) => setContactNom(e.target.value)}
                        required
                        maxLength={150}
                        placeholder={t.contact.placeholderNom}
                      />
                    </div>
                  </div>
                  <div className="row gap-16 wrap">
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-email">{t.contact.labelEmail}</label>
                      <input
                        id="contact-email"
                        className="input"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        maxLength={150}
                        placeholder={t.contact.placeholderEmail}
                      />
                    </div>
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <label htmlFor="contact-telephone">{t.contact.labelTelephone}</label>
                      <input
                        id="contact-telephone"
                        className="input"
                        value={contactTelephone}
                        onChange={(e) => setContactTelephone(e.target.value)}
                        maxLength={20}
                        placeholder={t.contact.placeholderTelephone}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="contact-message">{t.contact.labelMessage}</label>
                    <textarea
                      id="contact-message"
                      className="input"
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                      maxLength={2000}
                      placeholder={t.contact.placeholderMessage}
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn btn-cta lp-btn-lg" disabled={contactSending}>
                      <Icon icon={faPaperPlane} />
                      {contactSending ? t.contact.sending : t.contact.send}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
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
            <p>{t.footer.tagline}</p>
            <p className="lp-footer-contact">
              <a href="mailto:olivier@africorpgroup.tech">olivier@africorpgroup.tech</a>
            </p>
          </div>
          <div className="lp-footer-col">
            <h4>{t.footer.produitTitle}</h4>
            <a href="#fonctionnalites">{t.footer.produitFonctionnalites}</a>
            <a href="#comment-ca-marche">{t.footer.produitComment}</a>
            <a href="#app-client">{t.footer.produitClient}</a>
            <a href="#marchands">{t.footer.produitPro}</a>
            <a href="#securite">{t.footer.produitSecurite}</a>
          </div>
          <div className="lp-footer-col">
            <h4>{t.footer.entrepriseTitle}</h4>
            <a href="#contact">{t.footer.entrepriseContact}</a>
            <Link to="/login" onClick={requestAdminAccess}>{t.footer.entrepriseAdmin}</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} AfriPay. {t.footer.rights}</span>
        </div>
      </footer>

      <button
        type="button"
        className={`lp-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label={t.backToTopLabel}
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
            <h3 id="admin-gate-title">{t.adminGate.title}</h3>
            <p>{t.adminGate.text}</p>
            <div className="lp-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdminGate(false)}>
                {t.adminGate.back}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => navigate('/login')}>
                {t.adminGate.continueBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
