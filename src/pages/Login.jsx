import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Lock, ArrowRight, ChevronDown, ShieldCheck, Users, GraduationCap } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

/* No mock quick accounts */

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'admin',  label: 'Admin'  }
];

/* ─────────────────────────────────────────────
   LOGIN COMPONENT
───────────────────────────────────────────── */
const Login = () => {
  const { login, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [loginId,    setLoginId]    = useState('');
  const [password,   setPassword]   = useState('');
  const [role,       setRole]       = useState('member');
  const [isLoading,  setIsLoading]  = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (currentUser) navigate('/dashboard');
  }, [currentUser, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) return;
    setIsLoading(true);
    const success = await login(loginId, password);
    setIsLoading(false);
    if (success) navigate('/dashboard');
  };

  const selectedRoleLabel = ROLE_OPTIONS.find(r => r.value === role)?.label || 'Member';

  return (
    <div style={pageStyle}>
      {/* Background decorative orbs */}
      <div style={orb1Style} />
      <div style={orb2Style} />
      <div style={orb3Style} />

      <div style={wrapperStyle}>
        {/* ── SINGLE LOGIN CARD ── */}
        <div style={cardStyle}>
          {/* Card Top Accent Bar */}
          <div style={accentBarStyle} />

          {/* Header */}
          <div style={cardHeaderStyle}>
            <div style={flagEmojiStyle}>🇸🇩</div>
            <div>
              <h1 style={portalTitleStyle}>Sudanese Student Hub</h1>
              <p style={portalSubStyle}>Albukhary International University · AIU</p>
            </div>
          </div>

          {/* Divider */}
          <div style={dividerStyle} />

          {/* Welcome Copy */}
          <div style={welcomeAreaStyle}>
            <h2 style={welcomeHeadingStyle}>Welcome Back</h2>
            <p style={welcomeSubStyle}>Sign in to access your student community portal.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={formStyle}>
            {/* Student ID / Email */}
            <div style={fieldGroupStyle}>
              <label style={fieldLabelStyle}>Student ID or Email</label>
              <div style={inputWrapStyle}>
                <User size={16} color="#9CA3AF" style={inputIconStyle} />
                <input
                  type="text"
                  placeholder="e.g. 2210045 or name@email.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  style={inputStyle}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={fieldGroupStyle}>
              <label style={fieldLabelStyle}>Password</label>
              <div style={inputWrapStyle}>
                <Lock size={16} color="#9CA3AF" style={inputIconStyle} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Role — compact inline dropdown */}
            <div style={fieldGroupStyle} ref={dropRef}>
              <label style={fieldLabelStyle}>Sign in as</label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDropOpen(prev => !prev)}
                  style={roleButtonStyle}
                  aria-haspopup="listbox"
                  aria-expanded={dropOpen}
                >
                  <span style={{ color: 'var(--dark)', fontWeight: '600', fontSize: '14px' }}>
                    {selectedRoleLabel}
                  </span>
                  <ChevronDown
                    size={15}
                    color="#9CA3AF"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {/* Compact dropdown panel */}
                {dropOpen && (
                  <div style={dropPanelStyle} role="listbox">
                    {ROLE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={role === opt.value}
                        onClick={() => { setRole(opt.value); setDropOpen(false); }}
                        style={{
                          ...dropItemStyle,
                          backgroundColor: role === opt.value ? '#FFFBEB' : 'transparent',
                          color: role === opt.value ? '#B45309' : 'var(--dark)',
                          fontWeight: role === opt.value ? '700' : '500'
                        }}
                      >
                        {role === opt.value && <span style={dropCheckStyle}>✓</span>}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...submitBtnStyle,
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={spinnerStyle} />
                  Signing In...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Sign In <ArrowRight size={17} />
                </span>
              )}
            </button>
          </form>

          {/* Register link */}
          <p style={registerPromptStyle}>
            New student?{' '}
            <Link to="/register" style={registerLinkStyle}>Create an account</Link>
          </p>

        </div>

        {/* Footer notice */}
        <p style={footerNoteStyle}>
          For official use by registered SSA members only.
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const pageStyle = {
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 20px',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #111827 0%, #1F2937 45%, #374151 100%)',
  fontFamily: 'var(--font-body)'
};

const orb1Style = {
  position: 'absolute', top: '-15%', left: '-10%',
  width: '55vw', height: '55vw', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
  pointerEvents: 'none'
};
const orb2Style = {
  position: 'absolute', bottom: '-20%', right: '-15%',
  width: '60vw', height: '60vw', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(184,134,11,0.1) 0%, transparent 70%)',
  pointerEvents: 'none'
};
const orb3Style = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40vw', height: '40vw', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)',
  pointerEvents: 'none'
};

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  maxWidth: '440px',
  zIndex: 10,
  animation: 'slide-up 0.4s ease'
};

const cardStyle = {
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.1)'
};

const accentBarStyle = {
  height: '4px',
  background: 'linear-gradient(90deg, #F59E0B 0%, #B8860B 50%, #F59E0B 100%)'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '28px 32px 20px 32px',
  background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFBEB 100%)',
  borderBottom: '1px solid #F3F4F6'
};

const flagEmojiStyle = {
  fontSize: '38px',
  lineHeight: 1,
  flexShrink: 0
};

const portalTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '800',
  color: '#1F2937',
  lineHeight: 1.2
};

const portalSubStyle = {
  fontSize: '11px',
  color: '#B8860B',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginTop: '3px'
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#F3F4F6',
  margin: '0'
};

const welcomeAreaStyle = {
  padding: '24px 32px 0 32px'
};

const welcomeHeadingStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '21px',
  fontWeight: '800',
  color: '#1F2937'
};

const welcomeSubStyle = {
  fontSize: '13px',
  color: '#6B7280',
  marginTop: '4px',
  lineHeight: 1.5
};

const formStyle = {
  padding: '20px 32px 0 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  position: 'relative'
};

const fieldLabelStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const inputWrapStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '14px',
  pointerEvents: 'none',
  flexShrink: 0
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px 11px 42px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: '#1F2937',
  backgroundColor: '#F9FAFB',
  border: '1.5px solid #E5E7EB',
  borderRadius: '12px',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
};

/* Role dropdown trigger */
const roleButtonStyle = {
  width: '180px',  /* Narrower than full width — compact */
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  backgroundColor: '#F9FAFB',
  border: '1.5px solid #E5E7EB',
  borderRadius: '10px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
};

/* Small dropdown panel */
const dropPanelStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: '0',
  width: '180px',
  backgroundColor: '#FFFFFF',
  border: '1.5px solid #E5E7EB',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  zIndex: 50,
  overflow: 'hidden',
  animation: 'slide-down 0.15s ease'
};

const dropItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '10px 14px',
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.1s ease'
};

const dropCheckStyle = {
  fontSize: '12px',
  color: '#B45309',
  fontWeight: '800'
};

const submitBtnStyle = {
  width: '100%',
  padding: '13px',
  marginTop: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  fontWeight: '700',
  color: '#1F2937',
  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
  transition: 'all 0.15s ease',
  letterSpacing: '0.01em'
};

const spinnerStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  border: '2px solid rgba(31,41,55,0.25)',
  borderTopColor: '#1F2937',
  display: 'inline-block',
  animation: 'spin 0.7s linear infinite'
};

const registerPromptStyle = {
  textAlign: 'center',
  fontSize: '13px',
  color: '#9CA3AF',
  padding: '16px 32px 20px 32px'
};

const registerLinkStyle = {
  color: '#D97706',
  textDecoration: 'none',
  fontWeight: '700'
};

/* Quick Fill styles removed */

const footerNoteStyle = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.4)',
  textAlign: 'center',
  fontWeight: '500'
};

/* Input focus styles via global style injection */
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    input[style*="inputStyle"]:focus,
    input[placeholder]:focus {
      border-color: #F59E0B !important;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.12) !important;
      background-color: #fff !important;
    }
    button[style*="roleButtonStyle"]:focus,
    button[style*="roleButtonStyle"]:hover {
      border-color: #F59E0B !important;
      box-shadow: 0 0 0 3px rgba(245,158,11,0.1) !important;
    }
    button[style*="dropItemStyle"]:hover {
      background-color: #FFFBEB !important;
    }
    button[style*="submitBtnStyle"]:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(245,158,11,0.4) !important;
    }
  `;
  document.head.appendChild(s);
}

export default Login;
