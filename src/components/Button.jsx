import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, outline, danger, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'outline': return 'btn-outline';
      case 'danger': return 'btn-danger';
      case 'ghost': return 'btn-ghost';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      style={{ opacity: disabled || loading ? 0.65 : 1, pointerEvents: disabled || loading ? 'none' : 'auto' }}
      {...props}
    >
      {loading && (
        <span style={spinnerStyle} />
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      <span>{children}</span>
    </button>
  );
};

const spinnerStyle = {
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid #ffffff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block'
};

// Ensure spinning keyframe is added to DOM if not already present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Button;
