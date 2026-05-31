import React, { useContext, useState, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Download,
  RefreshCw,
  FileText,
  ImageIcon,
  Shield,
  Star,
  Award,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

/* ─────────────────────────────────────────────
   QR Code via Google Charts API (no lib needed)
───────────────────────────────────────────── */
const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=ffffff&bgcolor=transparent&data=';

/* ─────────────────────────────────────────────
   Card theme definitions per type
───────────────────────────────────────────── */
const CARD_THEMES = {
  member: {
    label: 'Member Card',
    icon: Users,
    gradient: 'linear-gradient(135deg, #0d5c56 0%, #0f766e 55%, #134e4a 100%)',
    accentColor: '#5eead4',
    borderColor: 'rgba(94,234,212,0.45)',
    badgeColor: '#0d9488',
    badgeText: 'MEMBER',
    foilClass: 'card-foil-member'
  },
  government: {
    label: 'Government Card',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)',
    accentColor: '#D4A017',
    borderColor: 'rgba(212,160,23,0.55)',
    badgeColor: '#D4A017',
    badgeText: 'GOVERNMENT',
    foilClass: 'card-foil-gov'
  },
  alumni: {
    label: 'Alumni Card',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #1c1917 0%, #44403c 55%, #57534e 100%)',
    accentColor: '#fbbf24',
    borderColor: 'rgba(251,191,36,0.45)',
    badgeColor: '#f59e0b',
    badgeText: 'ALUMNI',
    foilClass: 'card-foil-alumni'
  }
};

/* ─────────────────────────────────────────────
   Helper: derive card type from user fields
───────────────────────────────────────────── */
const getCardType = (user) => {
  if (!user) return 'member';
  if (user.status === 'alumni') return 'alumni';
  if (user.role === 'government' || user.role === 'admin') return 'government';
  return 'member';
};

/* ─────────────────────────────────────────────
   The actual card face component (rendered into
   a hidden div for html2canvas capture too)
───────────────────────────────────────────── */
const CardFace = ({ user, theme, side = 'front', size = 'display' }) => {
  const cardType = getCardType(user);
  const scale = size === 'capture' ? 1 : 1;
  const qrData = encodeURIComponent(`SSA-AIU|${user?.studentId}|${user?.name}|${cardType.toUpperCase()}`);
  const memberSince = user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '—';

  if (side === 'back') {
    return (
      <div style={{ ...cardBaseStyle, background: theme.gradient, border: `2px solid ${theme.borderColor}` }}>
        {/* Decorative circles */}
        <div style={{ ...circleDecor, width: 180, height: 180, top: -60, right: -60, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ ...circleDecor, width: 120, height: 120, bottom: -40, left: -40, backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* Back content */}
        <div style={backInnerStyle}>
          {/* Logo */}
          <div style={backLogoRowStyle}>
            <span style={{ fontSize: 28 }}>🇸🇩</span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 800, color: '#fff' }}>SSA AIU</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>Sudanese Student Association</div>
            </div>
          </div>

          {/* QR code */}
          <div style={qrContainerStyle}>
            <img
              src={`${QR_BASE}${qrData}`}
              alt="Member QR"
              style={{ width: 96, height: 96, borderRadius: 8 }}
              crossOrigin="anonymous"
            />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 6, letterSpacing: '0.04em', textAlign: 'center' }}>
              SCAN TO VERIFY
            </div>
          </div>

          {/* Barcode mockup */}
          <div style={barcodeWrapStyle}>
            <div style={barcodeStyle}>
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 2,
                    height: '100%',
                    backgroundColor: '#fff',
                    opacity: i % 7 === 0 ? 0.25 : i % 4 === 0 ? 0.6 : 1
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 4, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              {`SSA-AIU-${user?.studentId || '0000000'}`}
            </div>
          </div>

          {/* Footer rule */}
          <div style={backRuleStyle}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4 }}>
              This card is the property of SSA AIU · Not transferable<br />
              If found, please return to the Student Affairs Office
            </div>
          </div>
        </div>

        {/* Bottom Sudanese flag stripe */}
        <div style={flagStripeStyle}>
          {['#dc2626', '#ffffff', '#000000', '#16a34a'].map((c, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: c, height: '100%' }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── FRONT SIDE ── */
  return (
    <div style={{ ...cardBaseStyle, background: theme.gradient, border: `2px solid ${theme.borderColor}` }}>
      {/* Decorative glow circles */}
      <div style={{ ...circleDecor, width: 200, height: 200, top: -80, right: -80, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      <div style={{ ...circleDecor, width: 100, height: 100, bottom: -30, left: -30, backgroundColor: 'rgba(255,255,255,0.06)' }} />

      {/* Header row */}
      <div style={frontHeaderStyle}>
        <div style={headerLogoGroupStyle}>
          <span style={{ fontSize: 22 }}>🇸🇩</span>
          <div>
            <div style={assocTitleStyle}>SSA · AIU</div>
            <div style={assocSubStyle}>Albukhary International University</div>
          </div>
        </div>
        {/* Badge chip */}
        <div style={{ ...chipStyle, backgroundColor: theme.badgeColor, boxShadow: `0 0 12px ${theme.badgeColor}55` }}>
          {theme.badgeText}
        </div>
      </div>

      {/* Photo + Info Row */}
      <div style={frontBodyStyle}>
        {/* Photo */}
        <div style={{ ...photoFrameStyle, borderColor: theme.accentColor, boxShadow: `0 0 0 3px ${theme.accentColor}33` }}>
          {user?.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              crossOrigin="anonymous"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={photoFallbackStyle}>
              {(user?.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Text Info */}
        <div style={infoBlockStyle}>
          <div style={nameStyle}>{user?.name || '—'}</div>
          <div style={majorStyle}>{user?.major || '—'}</div>

          <div style={infoGridStyle}>
            <div style={infoRowStyle}>
              <span style={infoLblStyle}>ID</span>
              <span style={{ ...infoValStyle, color: theme.accentColor }}>{user?.studentId || '—'}</span>
            </div>
            {(user?.role === 'government' || user?.role === 'admin') && user?.position && (
              <div style={infoRowStyle}>
                <span style={infoLblStyle}>ROLE</span>
                <span style={infoValStyle}>{user.position}</span>
              </div>
            )}
            <div style={infoRowStyle}>
              <span style={infoLblStyle}>MEMBER SINCE</span>
              <span style={infoValStyle}>{memberSince}</span>
            </div>
            {user?.status === 'alumni' && user?.graduationYear && (
              <div style={infoRowStyle}>
                <span style={infoLblStyle}>GRADUATED</span>
                <span style={infoValStyle}>{user.graduationYear}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom flag stripe */}
      <div style={flagStripeStyle}>
        {['#dc2626', '#ffffff', '#000000', '#16a34a'].map((c, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: c, height: '100%' }} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
const MyCard = () => {
  const { currentUser } = useContext(AppContext);
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState(null); // 'png' | 'pdf' | null
  const [downloadDone, setDownloadDone] = useState(false);

  // Hidden capture refs — one for front, one for back
  const frontCaptureRef = useRef(null);
  const backCaptureRef  = useRef(null);

  const cardType  = getCardType(currentUser);
  const theme     = CARD_THEMES[cardType];
  const ThemeIcon = theme.icon;

  /* ── Download PNG ── */
  const handleDownloadPNG = useCallback(async () => {
    setDownloading('png');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = frontCaptureRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `SSA-Card-${currentUser?.studentId || 'member'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch (err) {
      console.error('PNG download failed:', err);
    } finally {
      setDownloading(null);
    }
  }, [currentUser]);

  /* ── Download PDF ── */
  const handleDownloadPDF = useCallback(async () => {
    setDownloading('pdf');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');

      const frontEl = frontCaptureRef.current;
      const backEl  = backCaptureRef.current;
      if (!frontEl || !backEl) return;

      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(frontEl, { scale: 3, useCORS: true, allowTaint: false, backgroundColor: null, logging: false }),
        html2canvas(backEl,  { scale: 3, useCORS: true, allowTaint: false, backgroundColor: null, logging: false })
      ]);

      // Card aspect: 420 × 260 px display → keep ratio
      const W = 150; // mm
      const H = Math.round((260 / 420) * W);

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H * 2 + 10] });

      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, W, H);
      pdf.addPage([W, H * 2 + 10], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, W, H);

      pdf.save(`SSA-MembershipCard-${currentUser?.studentId || 'member'}.pdf`);

      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(null);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={errorPageStyle}>
        <Card padding="lg" style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>Not Logged In</h3>
          <p style={{ fontSize: 14, color: 'var(--dark-light)', marginTop: 8, lineHeight: 1.5 }}>
            Please log in to view and download your membership card.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageWrapStyle}>

      {/* ── Page Header ── */}
      <div style={pageHeaderStyle}>
        <div style={pageHeaderTextStyle}>
          <div style={pageTagStyle}>
            <ThemeIcon size={16} />
            <span>{theme.label}</span>
          </div>
          <h1 style={pageTitleStyle}>SSA Membership Card</h1>
          <p style={pageSubStyle}>
            Your official Sudanese Student Association digital card at Albukhary International University.
            Tap the card to flip, then download.
          </p>
        </div>

        {/* Card type selector pills */}
        <div style={cardTypePillsStyle}>
          {Object.entries(CARD_THEMES).map(([key, t]) => {
            const isActive = key === cardType;
            return (
              <div
                key={key}
                style={{
                  ...typePillStyle,
                  background: isActive ? t.gradient : 'var(--gray-100)',
                  color: isActive ? '#fff' : 'var(--gray-500)',
                  boxShadow: isActive ? `0 4px 16px rgba(0,0,0,0.25)` : 'none',
                  border: isActive ? `1px solid ${t.borderColor}` : '1px solid var(--gray-200)'
                }}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
                {isActive && <CheckCircle2 size={12} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3D Flip Card Display ── */}
      <div style={flipStageStyle}>
        <div
          className={`flip-card ${isFlipped ? 'flipped' : ''}`}
          style={flipCardWrapStyle}
          onClick={() => setIsFlipped(p => !p)}
          title="Click to flip"
        >
          <div className="flip-card-inner" style={flipInnerStyle}>
            <div className="flip-card-front">
              <CardFace user={currentUser} theme={theme} side="front" />
            </div>
            <div className="flip-card-back">
              <CardFace user={currentUser} theme={theme} side="back" />
            </div>
          </div>
        </div>

        <p style={flipHintStyle}>
          <RefreshCw size={12} /> Click card to flip · Download captures both sides
        </p>
      </div>

      {/* ── Download Actions ── */}
      <div style={actionsWrapStyle}>
        {downloadDone && (
          <div style={downloadSuccessBannerStyle}>
            <CheckCircle2 size={16} />
            <span>Card downloaded successfully!</span>
          </div>
        )}

        <div style={actionButtonsRowStyle}>
          <button
            onClick={handleDownloadPNG}
            disabled={!!downloading}
            style={{ ...downloadBtnStyle, ...pngBtnStyle, opacity: downloading ? 0.7 : 1 }}
          >
            {downloading === 'png' ? (
              <span style={btnSpinnerStyle} />
            ) : (
              <ImageIcon size={20} />
            )}
            <div style={btnTextGroupStyle}>
              <span style={btnLabelStyle}>Download PNG</span>
              <span style={btnSubStyle}>Card front · High-res 3×</span>
            </div>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={!!downloading}
            style={{ ...downloadBtnStyle, ...pdfBtnStyle, opacity: downloading ? 0.7 : 1 }}
          >
            {downloading === 'pdf' ? (
              <span style={btnSpinnerStyle} />
            ) : (
              <FileText size={20} />
            )}
            <div style={btnTextGroupStyle}>
              <span style={btnLabelStyle}>Download PDF</span>
              <span style={btnSubStyle}>Front & back · Print-ready</span>
            </div>
          </button>

          <button
            onClick={() => setIsFlipped(p => !p)}
            style={{ ...downloadBtnStyle, ...flipBtnStyle }}
          >
            <RefreshCw size={20} />
            <div style={btnTextGroupStyle}>
              <span style={btnLabelStyle}>Flip Card</span>
              <span style={btnSubStyle}>View {isFlipped ? 'front' : 'back'} side</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Card Meta Info panel ── */}
      <div style={metaPanelGridStyle}>
        {[
          { label: 'Card Type',     value: theme.label,                      icon: ThemeIcon },
          { label: 'Student ID',    value: currentUser?.studentId || '—',    icon: FileText },
          { label: 'Status',        value: (currentUser?.status || 'active').toUpperCase(), icon: CheckCircle2 },
          { label: 'Member Since',  value: currentUser?.joinedAt ? new Date(currentUser.joinedAt).getFullYear() : '—', icon: Award }
        ].map((item) => (
          <div key={item.label} style={metaItemStyle}>
            <div style={metaIconBoxStyle}>
              <item.icon size={18} color="var(--primary)" />
            </div>
            <div style={metaTextsStyle}>
              <span style={metaLabelStyle}>{item.label}</span>
              <span style={metaValueStyle}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Hidden Capture Targets (off-screen but rendered) ── */}
      <div style={hiddenCaptureWrapStyle}>
        <div ref={frontCaptureRef} style={captureCanvasStyle}>
          <CardFace user={currentUser} theme={theme} side="front" size="capture" />
        </div>
        <div ref={backCaptureRef} style={captureCanvasStyle}>
          <CardFace user={currentUser} theme={theme} side="back" size="capture" />
        </div>
      </div>

    </div>
  );
};

/* ─────────────────────────────────────────────
   CardFace internal styles
───────────────────────────────────────────── */
const cardBaseStyle = {
  width: '420px',
  height: '260px',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '20px 22px 0 22px',
  fontFamily: 'var(--font-body)',
  flexShrink: 0
};

const circleDecor = {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none'
};

const flagStripeStyle = {
  height: '6px',
  display: 'flex',
  marginLeft: '-22px',
  marginRight: '-22px',
  borderBottomLeftRadius: '18px',
  borderBottomRightRadius: '18px',
  overflow: 'hidden',
  flexShrink: 0,
  marginTop: 'auto'
};

const frontHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1
};

const headerLogoGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const assocTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '13px',
  fontWeight: '800',
  color: '#fff',
  lineHeight: 1
};

const assocSubStyle = {
  fontSize: '8px',
  color: 'rgba(255,255,255,0.55)',
  letterSpacing: '0.04em',
  marginTop: '2px'
};

const chipStyle = {
  fontSize: '8px',
  fontWeight: '800',
  padding: '4px 10px',
  borderRadius: '999px',
  color: '#fff',
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

const frontBodyStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  zIndex: 1,
  paddingBottom: '14px',
  flexGrow: 1,
  paddingTop: '10px'
};

const photoFrameStyle = {
  width: '76px',
  height: '90px',
  borderRadius: '12px',
  border: '2.5px solid',
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: 'rgba(255,255,255,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const photoFallbackStyle = {
  color: '#fff',
  fontSize: '22px',
  fontWeight: '700',
  fontFamily: 'var(--font-heading)'
};

const infoBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  textAlign: 'left',
  flex: 1
};

const nameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '16px',
  fontWeight: '800',
  color: '#fff',
  lineHeight: 1.2,
  letterSpacing: '-0.01em'
};

const majorStyle = {
  fontSize: '10px',
  color: 'rgba(255,255,255,0.6)',
  fontWeight: '500',
  marginBottom: '6px'
};

const infoGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const infoRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const infoLblStyle = {
  fontSize: '7.5px',
  color: 'rgba(255,255,255,0.45)',
  fontWeight: '700',
  letterSpacing: '0.08em',
  minWidth: '70px'
};

const infoValStyle = {
  fontSize: '10px',
  color: '#fff',
  fontWeight: '600'
};

/* Back side styles */
const backInnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  zIndex: 1,
  flex: 1,
  paddingBottom: '10px'
};

const backLogoRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  alignSelf: 'flex-start'
};

const qrContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '8px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const barcodeWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%'
};

const barcodeStyle = {
  display: 'flex',
  height: '24px',
  width: '100%',
  justifyContent: 'center',
  gap: '1px'
};

const backRuleStyle = {
  marginTop: 'auto',
  width: '100%',
  paddingTop: '6px',
  borderTop: '1px solid rgba(255,255,255,0.1)'
};

/* ─────────────────────────────────────────────
   Page layout styles
───────────────────────────────────────────── */
const pageWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '32px',
  fontFamily: 'var(--font-body)',
  paddingBottom: '40px'
};

const pageHeaderStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '24px',
  flexWrap: 'wrap'
};

const pageHeaderTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const pageTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--primary)',
  backgroundColor: 'var(--primary-light)',
  padding: '4px 12px',
  borderRadius: '999px',
  width: 'fit-content',
  textTransform: 'uppercase',
  letterSpacing: '0.06em'
};

const pageTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '26px',
  fontWeight: '800',
  color: 'var(--dark)',
  lineHeight: 1.2
};

const pageSubStyle = {
  fontSize: '13.5px',
  color: 'var(--gray-500)',
  lineHeight: 1.5,
  maxWidth: '480px'
};

const cardTypePillsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexShrink: 0
};

const typePillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  fontWeight: '600',
  padding: '8px 14px',
  borderRadius: '999px',
  transition: 'all 0.2s ease',
  cursor: 'default',
  whiteSpace: 'nowrap',
  letterSpacing: '0.02em'
};

/* Flip stage */
const flipStageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px'
};

const flipCardWrapStyle = {
  width: '420px',
  height: '260px',
  cursor: 'pointer',
  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))',
  transition: 'filter 0.3s ease',
  flexShrink: 0
};

const flipInnerStyle = {
  width: '100%',
  height: '100%'
};

const flipHintStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: 'var(--gray-400)',
  fontWeight: '500'
};

/* Download actions */
const actionsWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '560px'
};

const downloadSuccessBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'var(--success-light)',
  color: 'var(--success)',
  padding: '10px 20px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '650',
  border: '1.5px solid rgba(16,185,129,0.25)',
  animation: 'slide-up 0.3s ease'
};

const actionButtonsRowStyle = {
  display: 'flex',
  gap: '12px',
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

const downloadBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 24px',
  borderRadius: '16px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  transition: 'all 0.2s ease',
  flexGrow: 1,
  maxWidth: '200px',
  minWidth: '160px',
  boxShadow: 'var(--shadow-md)',
  textAlign: 'left'
};

const pngBtnStyle = {
  background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)',
  color: '#fff'
};

const pdfBtnStyle = {
  background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
  color: '#fff'
};

const flipBtnStyle = {
  backgroundColor: '#fff',
  color: 'var(--dark)',
  border: '1.5px solid var(--gray-200)'
};

const btnTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const btnLabelStyle = {
  fontSize: '14px',
  fontWeight: '700',
  lineHeight: 1.2
};

const btnSubStyle = {
  fontSize: '10.5px',
  opacity: 0.7,
  marginTop: '2px',
  fontWeight: '500'
};

const btnSpinnerStyle = {
  width: '20px',
  height: '20px',
  border: '2.5px solid rgba(255,255,255,0.3)',
  borderTop: '2.5px solid #fff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
  flexShrink: 0
};

/* Meta panel */
const metaPanelGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  width: '100%',
  maxWidth: '620px'
};

const metaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  borderRadius: '14px',
  padding: '14px 16px',
  boxShadow: 'var(--shadow-sm)'
};

const metaIconBoxStyle = {
  backgroundColor: 'var(--primary-light)',
  padding: '8px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const metaTextsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  textAlign: 'left'
};

const metaLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em'
};

const metaValueStyle = {
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--dark)'
};

/* Hidden capture div */
const hiddenCaptureWrapStyle = {
  position: 'fixed',
  top: '-9999px',
  left: '-9999px',
  display: 'flex',
  gap: '16px',
  pointerEvents: 'none',
  zIndex: -1
};

const captureCanvasStyle = {
  width: '420px',
  height: '260px',
  flexShrink: 0
};

const errorPageStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh'
};

export default MyCard;
