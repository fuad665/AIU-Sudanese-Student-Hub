import React, { useContext, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Bell, Menu, X, Check } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

const Navbar = ({ onMobileMenuToggle }) => {
  const { currentUser, announcements, elections } = useContext(AppContext);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);

  // Generate dynamic title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Portal Dashboard';
    if (path.includes('/my-card')) return 'Digital Student ID';
    if (path.includes('/students')) return 'Student Directory';
    if (path.includes('/elections')) return 'Elections & Voting';
    if (path.includes('/government')) return 'Student Government';
    if (path.includes('/announcements')) return 'Announcements Feed';
    if (path.includes('/events')) return 'Events Calendar';
    if (path.includes('/alumni')) return 'Alumni Network';
    if (path.includes('/profile')) return 'Profile Settings';
    if (path.includes('/admin')) return 'Administration Center';
    return 'Sudanese Student Hub';
  };

  // Prepopulate standard notifications based on loaded data
  const getNotificationsList = () => {
    const list = [
      { id: 'notif-1', title: 'Sudanese Culture Day RSVP', body: 'Your registration for Sudanese Cultural Day has been verified.', time: 'Just now', type: 'info' }
    ];

    const activeElect = elections.find((e) => e.status === 'active');
    if (activeElect) {
      list.push({ id: 'notif-2', title: 'Voting Period Open', body: `Elections for ${activeElect.title} are now live! Cast your vote.`, time: '1 hour ago', type: 'warning' });
    }

    const highAnn = announcements.find((a) => a.importance === 'high');
    if (highAnn) {
      list.push({ id: 'notif-3', title: 'Urgent Announcement', body: highAnn.title, time: '1 day ago', type: 'danger' });
    }

    return list;
  };

  const notifications = getNotificationsList();
  const unreadCount = notifications.filter((n) => !readNotifications.includes(n.id)).length;

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const markAllRead = () => {
    setReadNotifications(notifications.map((n) => n.id));
  };

  const markAsRead = (id) => {
    setReadNotifications((prev) => [...prev, id]);
  };

  return (
    <header style={navbarStyle} className="glassmorphism">
      <div style={leftContainerStyle}>
        <button onClick={onMobileMenuToggle} style={mobileMenuButtonStyle} title="Menu">
          <Menu size={22} color="var(--dark)" />
        </button>
        <h1 style={titleStyle}>{getPageTitle()}</h1>
      </div>

      <div style={rightContainerStyle}>
        {/* Notifications Icon Tray */}
        <div style={{ position: 'relative' }}>
          <button onClick={toggleNotifications} style={iconButtonStyle} title="Notifications">
            <Bell size={20} color="var(--dark-light)" />
            {unreadCount > 0 && (
              <span style={unreadBadgeStyle}>{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div style={dropdownStyle} className="glassmorphism">
              <div style={dropdownHeaderStyle}>
                <h4 style={dropdownTitleStyle}>Bulletins & Alerts</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={markReadButtonStyle}>
                    <Check size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div style={dropdownBodyStyle}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const isRead = readNotifications.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          ...notifItemStyle,
                          backgroundColor: isRead ? 'transparent' : 'var(--primary-light)',
                          opacity: isRead ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={notifTitleStyle}>{notif.title}</span>
                          <span style={notifTimeStyle}>{notif.time}</span>
                        </div>
                        <p style={notifBodyStyle}>{notif.body}</p>
                      </div>
                    );
                  })
                ) : (
                  <div style={emptyNotifStyle}>No notifications available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Link Header */}
        {currentUser && (
          <Link to="/profile" style={profileLinkStyle}>
            <div style={profileInfoStyle}>
              <span style={navProfileNameStyle}>{currentUser.name}</span>
              <span style={navProfileRoleStyle}>{currentUser.major || currentUser.role}</span>
            </div>
            <Avatar
              src={currentUser.photo}
              name={currentUser.name}
              size="sm"
              isCommittee={currentUser?.role === 'government' || currentUser?.role === 'admin'}
            />
          </Link>
        )}
      </div>
    </header>
  );
};

const navbarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 32px',
  height: '70px',
  borderBottom: '1.5px solid var(--gray-200)',
  position: 'sticky',
  top: 0,
  zIndex: 90,
  backgroundColor: 'rgba(255, 255, 255, 0.85)'
};

const leftContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const mobileMenuButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'none',
  padding: '6px',
  borderRadius: 'var(--radius-sm)'
};

const titleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '20px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const rightContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const iconButtonStyle = {
  background: 'var(--gray-100)',
  border: 'none',
  padding: '10px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  transition: 'background-color 0.15s ease'
};

const unreadBadgeStyle = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: 'var(--danger)',
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid var(--light)'
};

const profileLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer'
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'right'
};

const navProfileNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--dark)',
  lineHeight: '1.2'
};

const navProfileRoleStyle = {
  fontSize: '11px',
  color: 'var(--gray-500)',
  fontWeight: '500'
};

const dropdownStyle = {
  position: 'absolute',
  top: '50px',
  right: 0,
  width: '320px',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-premium)',
  border: '1.5px solid var(--gray-200)',
  backgroundColor: 'var(--light)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const dropdownHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid var(--gray-150)',
  backgroundColor: 'var(--gray-50)'
};

const dropdownTitleStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--dark)'
};

const markReadButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: 'var(--primary)',
  fontSize: '11px',
  fontWeight: '600'
};

const dropdownBodyStyle = {
  maxHeight: '260px',
  overflowY: 'auto'
};

const notifItemStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--gray-100)',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease'
};

const notifTitleStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--dark)'
};

const notifTimeStyle = {
  fontSize: '10px',
  color: 'var(--gray-400)'
};

const notifBodyStyle = {
  fontSize: '11px',
  color: 'var(--gray-500)',
  marginTop: '4px',
  lineHeight: '1.3'
};

const emptyNotifStyle = {
  padding: '24px',
  textAlign: 'center',
  color: 'var(--gray-400)',
  fontSize: '13px',
  fontWeight: '500'
};

// Add responsive stylesheet in JS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @media (max-width: 1024px) {
      header button[title="Menu"] {
        display: flex !important;
      }
      .profile-info {
        display: none !important;
      }
    }
    @media (max-width: 640px) {
      header {
        padding: 12px 16px !important;
      }
      .profile-info {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;
