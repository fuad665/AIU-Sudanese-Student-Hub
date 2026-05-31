import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutDashboard, Contact, Calendar, Settings, ShieldAlert } from 'lucide-react';

const MobileNav = () => {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'admin', 'alumni'] },
    { to: '/my-card', label: 'ID Card', icon: Contact, roles: ['student', 'admin'] },
    { to: '/events', label: 'Events', icon: Calendar, roles: ['student', 'admin', 'alumni'] },
    { to: '/profile', label: 'Profile', icon: Settings, roles: ['student', 'admin', 'alumni'] },
    { to: '/admin', label: 'Admin', icon: ShieldAlert, roles: ['admin'] }
  ];

  const visibleLinks = links.filter((l) => l.roles.includes(currentUser.role));

  return (
    <div style={bottomBarStyle} className="glassmorphism">
      {visibleLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? 'var(--primary)' : 'var(--gray-500)',
              fontWeight: isActive ? '600' : '500'
            })}
          >
            <Icon size={20} />
            <span style={labelStyle}>{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

const bottomBarStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '64px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderTop: '1.5px solid var(--gray-200)',
  display: 'none', // Default hidden, shown via media query
  justifyContent: 'space-around',
  alignItems: 'center',
  zIndex: 95,
  paddingBottom: 'safe-area-inset-bottom'
};

const linkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  textDecoration: 'none',
  fontSize: '11px',
  fontFamily: 'var(--font-body)',
  transition: 'color 0.15s ease',
  flex: 1,
  height: '100%'
};

const labelStyle = {
  fontSize: '10px'
};

// Toggle visibility on mobile using stylesheet
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @media (max-width: 1024px) {
      div[style*="bottomBarStyle"] {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default MobileNav;
