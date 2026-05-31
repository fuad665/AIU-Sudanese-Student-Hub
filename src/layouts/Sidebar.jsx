import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard,
  Contact,
  Users2,
  Vote,
  Compass,
  Megaphone,
  Calendar,
  GraduationCap,
  Settings,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

const Sidebar = () => {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // All roles that can log in
  const ALL_ROLES = ['member', 'government', 'admin', 'alumni', 'student'];

  const navLinks = [
    { to: '/dashboard',     label: 'Dashboard',         icon: LayoutDashboard, roles: ALL_ROLES },
    { to: '/my-card',       label: 'Digital Student ID', icon: Contact,         roles: ALL_ROLES },
    { to: '/students',      label: 'Student Directory',  icon: Users2,          roles: ALL_ROLES },
    { to: '/elections',     label: 'Elections & Voting', icon: Vote,            roles: ALL_ROLES },
    { to: '/government',    label: 'Student Government', icon: Compass,         roles: ALL_ROLES },
    { to: '/announcements', label: 'Announcements',      icon: Megaphone,       roles: ALL_ROLES },
    { to: '/events',        label: 'Events & RSVPs',     icon: Calendar,        roles: ALL_ROLES },
    { to: '/alumni',        label: 'Alumni Network',     icon: GraduationCap,   roles: ALL_ROLES },
    { to: '/profile',       label: 'My Profile',         icon: Settings,        roles: ALL_ROLES },
    { to: '/admin',         label: 'Administration',     icon: ShieldAlert,     roles: ['admin'] }
  ];

  const visibleLinks = navLinks.filter(
    (link) => currentUser && link.roles.includes(currentUser.role)
  );

  return (
    <aside style={sidebarStyle} className="glassmorphism">
      {/* Brand Header */}
      <div style={brandStyle}>
        <div style={flagAccentStyle}>🇸🇩</div>
        <div style={brandTextContainerStyle}>
          <h2 style={brandTitleStyle}>SSA Hub</h2>
          <span style={brandSubStyle}>AIU Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={navStyle}>
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...linkStyle,
                color: isActive ? '#B45309' : 'var(--dark-light)',
                backgroundColor: isActive ? '#FFFBEB' : 'transparent',
                fontWeight: isActive ? '700' : '500',
                borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent'
              })}
            >
              <Icon size={19} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Summary */}
      {currentUser && (
        <div style={footerStyle}>
          <div style={profileSummaryStyle}>
            <Avatar
              src={currentUser.photo}
              name={currentUser.name}
              size="sm"
              isCommittee={currentUser?.role === 'government' || currentUser?.role === 'admin'}
            />
            <div style={profileTextContainerStyle}>
              <span style={profileNameStyle}>{(currentUser.name || '').split(' ')[0]}</span>
              <Badge role={currentUser.role} style={{ fontSize: '10px', padding: '1px 6px' }} />
            </div>
          </div>
          <button onClick={handleLogout} style={logoutButtonStyle} title="Sign Out">
            <LogOut size={18} color="var(--danger)" />
          </button>
        </div>
      )}
    </aside>
  );
};

const sidebarStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  borderRight: '1.5px solid #E5E7EB',
  padding: '20px 14px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#FFFFFF',
  boxShadow: '2px 0 12px rgba(0,0,0,0.04)'
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px 24px 12px',
  borderBottom: '1.5px solid var(--gray-100)',
  marginBottom: '24px'
};

const flagAccentStyle = {
  fontSize: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const brandTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const brandTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '800',
  color: '#1F2937',
  lineHeight: 1.1
};

const brandSubStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#B8860B',
  textTransform: 'uppercase',
  letterSpacing: '0.1em'
};

const navStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flexGrow: 1,
  overflowY: 'auto'
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  padding: '11px 14px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontSize: '13.5px',
  transition: 'all 0.18s ease',
  fontFamily: 'var(--font-body)',
  borderLeft: '3px solid transparent'
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 8px 0 8px',
  borderTop: '1.5px solid var(--gray-100)',
  marginTop: '16px'
};

const profileSummaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  overflow: 'hidden'
};

const profileTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
  overflow: 'hidden'
};

const profileNameStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--dark)',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
};

const logoutButtonStyle = {
  background: 'rgba(239, 68, 68, 0.06)',
  border: 'none',
  padding: '8px',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s ease'
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    nav a:hover {
      background-color: #FFFBEB !important;
      color: #92400E !important;
    }
    button[title="Sign Out"]:hover {
      background-color: rgba(220, 38, 38, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default Sidebar;
