import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Lock, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { login, currentUser, authSession, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const [loginId,    setLoginId]    = useState('');
  const [password,   setPassword]   = useState('');
  const [isLoading,  setIsLoading]  = useState(false);

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } else if (authSession) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [currentUser, authSession, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) return;
    setIsLoading(true);
    await login(loginId, password);
    setIsLoading(false);
  };

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
              <div style={pwdLabelRowStyle}>
                <label style={fieldLabelStyle}>Password</label>
                <a href="#" style={forgotPwdLinkStyle}>Forgot?</a>
              </div>
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

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              icon={ArrowRight}
              style={{ marginTop: '8px' }}
            >
              Sign In to Portal
            </Button>
          </form>
          
          {/* Sign Up Link */}
          <div style={signupWrapperStyle}>
            <span style={signupTextStyle}>Don't have an account? </span>
            <Link to="/register" style={signupLinkStyle}>Create one now</Link>
          </div>
        </div>

        {/* Footer Text */}
        <div style={footerStyle}>
          <p>Secure Portal • AIU Sudanese Students Association</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const pageStyle = {
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#f1f5f9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Inter', sans-serif"
};

// Decorative background orbs
const orb1Style = {
  position: 'absolute',
  top: '-10%',
  left: '-10%',
  width: '500px',
  height: '500px',
  background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0) 70%)',
  borderRadius: '50%',
  zIndex: 0
};
const orb2Style = {
  position: 'absolute',
  bottom: '-20%',
  right: '-10%',
  width: '600px',
  height: '600px',
  background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0) 70%)',
  borderRadius: '50%',
  zIndex: 0
};
const orb3Style = {
  position: 'absolute',
  top: '20%',
  right: '15%',
  width: '300px',
  height: '300px',
  background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0) 70%)',
  borderRadius: '50%',
  zIndex: 0
};

const wrapperStyle = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: '440px',
  padding: '0 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05), 0 0 10px rgba(0,0,0,0.01)',
  overflow: 'hidden',
  position: 'relative'
};

const accentBarStyle = {
  height: '6px',
  width: '100%',
  background: 'linear-gradient(90deg, #b45309, #d97706, #f59e0b)'
};

const cardHeaderStyle = {
  padding: '32px 32px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const flagEmojiStyle = {
  fontSize: '32px',
  lineHeight: 1,
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
};

const portalTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 4px 0',
  letterSpacing: '-0.3px'
};

const portalSubStyle = {
  fontSize: '13px',
  color: '#64748b',
  margin: 0,
  fontWeight: '500'
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#f1f5f9',
  margin: '0 32px'
};

const welcomeAreaStyle = {
  padding: '24px 32px 8px',
  textAlign: 'center'
};

const welcomeHeadingStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px'
};

const welcomeSubStyle = {
  fontSize: '15px',
  color: '#64748b',
  margin: 0,
  lineHeight: 1.5
};

const formStyle = {
  padding: '24px 32px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const pwdLabelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const fieldLabelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155'
};

const forgotPwdLinkStyle = {
  fontSize: '13px',
  color: '#d97706',
  fontWeight: '500',
  textDecoration: 'none'
};

const inputWrapStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '16px'
};

const inputStyle = {
  width: '100%',
  height: '48px',
  padding: '0 16px 0 44px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '15px',
  color: '#1e293b',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
};

const submitBtnStyle = {
  marginTop: '8px',
  height: '52px',
  borderRadius: '14px',
  backgroundColor: '#1d4ed8',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
  width: '100%'
};

const signupWrapperStyle = {
  padding: '0 32px 32px',
  textAlign: 'center',
  borderTop: '1px solid #f1f5f9',
  paddingTop: '24px',
};

const signupTextStyle = {
  color: '#64748b',
  fontSize: '14px',
};

const signupLinkStyle = {
  color: '#f59e0b',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '14px',
};

const spinnerInnerStyle = {
  width: '24px',
  height: '24px',
  border: '3px solid rgba(255,255,255,0.3)',
  borderTop: '3px solid #ffffff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const footerStyle = {
  textAlign: 'center',
  fontSize: '13px',
  color: '#94a3b8',
  fontWeight: '500'
};

export default Login;
