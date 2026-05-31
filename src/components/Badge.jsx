import React from 'react';

const Badge = ({
  children,
  role = null, // student, admin, alumni, pending (if role, matches custom colors)
  variant = 'primary', // primary, secondary, success, warning, danger, info (used if role is null)
  className = '',
  style = {}
}) => {
  const getBadgeClass = () => {
    if (role) {
      switch (role.toLowerCase()) {
        case 'student':
        case 'member': return 'badge-member';
        case 'admin': return 'badge-admin';
        case 'government': return 'badge-government';
        case 'alumni': return 'badge-alumni';
        case 'pending': return 'badge-pending';
        default: return 'badge-member';
      }
    }

    // Fallback standard variants
    switch (variant) {
      case 'primary': return 'badge-member'; // matches primary light
      case 'secondary': return 'badge-alumni'; // matches secondary light
      case 'success': return 'badge-success';
      case 'warning': return 'badge-pending'; // matches warning amber
      case 'danger': return 'badge-danger';
      case 'info': return 'badge-info';
      default: return 'badge-member';
    }
  };

  return (
    <span
      className={`badge ${getBadgeClass()} ${className}`}
      style={{
        ...style
      }}
    >
      {children || role}
    </span>
  );
};

// Insert custom non-role badges into document styles if not already present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .badge-success {
      background-color: var(--success-light);
      color: var(--success);
    }
    .badge-danger {
      background-color: var(--danger-light);
      color: var(--danger);
    }
    .badge-info {
      background-color: var(--info-light);
      color: var(--info);
    }
  `;
  document.head.appendChild(style);
}

export default Badge;
