import React, { useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { X } from 'lucide-react';

const MainLayout = () => {
  const { currentUser, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected Auth Gates: Redirect to login if user session is absent
  // Protected Auth Gate
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Show spinner while Supabase resolves the session
  if (loading) {
    return (
      <div style={loadingScreenStyle}>
        <div style={spinnerStyle} />
        <span style={loadingTextStyle}>Loading SSA Portal...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={loadingScreenStyle}>
        <div style={spinnerStyle} />
        <span style={loadingTextStyle}>Redirecting...</span>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <div style={outerWrapperStyle}>
      <div className="main-grid" style={gridStyle}>
        {/* Desktop Sidebar (Hidden on mobile via CSS) */}
        <div style={desktopSidebarWrapperStyle}>
          <Sidebar />
        </div>

        {/* Sliding Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div style={drawerBackdropStyle} onClick={toggleMobileMenu}>
            <div style={drawerContentStyle} onClick={(e) => e.stopPropagation()}>
              <div style={drawerHeaderStyle}>
                <span style={drawerTitleStyle}>Navigation</span>
                <button onClick={toggleMobileMenu} style={drawerCloseStyle}>
                  <X size={20} />
                </button>
              </div>
              {/* Reuse Sidebar component directly in drawer */}
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div style={mainContentStyle}>
          <Navbar onMobileMenuToggle={toggleMobileMenu} />
          
          <main style={mainWrapperStyle}>
            <div className="content-container">
              <Outlet />
            </div>
          </main>

          {/* Sticky Mobile Nav Bottom-Bar */}
          <MobileNav />
        </div>
      </div>
    </div>
  );
};

const loadingScreenStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100vw',
  backgroundColor: 'var(--gray-50)',
  gap: '16px',
  fontFamily: 'var(--font-body)'
};

const spinnerStyle = {
  width: '36px',
  height: '36px',
  border: '3px dashed var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1.2s linear infinite'
};

const loadingTextStyle = {
  fontSize: '14px',
  fontWeight: '550',
  color: 'var(--primary)'
};

const outerWrapperStyle = {
  minHeight: '100vh',
  width: '100vw',
  overflowX: 'hidden'
};

const gridStyle = {
  minHeight: '100vh',
  width: '100%'
};

const desktopSidebarWrapperStyle = {
  display: 'block'
};

const drawerBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(30, 41, 59, 0.45)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-start'
};

const drawerContentStyle = {
  width: '280px',
  height: '100%',
  backgroundColor: 'var(--light)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slide-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const drawerHeaderStyle = {
  padding: '16px 20px 0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(255, 255, 255, 0.85)'
};

const drawerTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const drawerCloseStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const mainContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden'
};

const mainWrapperStyle = {
  flexGrow: 1,
  width: '100%',
  backgroundColor: 'var(--gray-50)'
};

// Add styles via document write
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @keyframes slide-right {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @media (max-width: 1024px) {
      div[style*="desktopSidebarWrapperStyle"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default MainLayout;
