import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl
  footer = null,
  closeOnOutsideClick = true
}) => {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  const getWidth = () => {
    switch (size) {
      case 'sm': return '400px';
      case 'lg': return '700px';
      case 'xl': return '900px';
      default: return '520px'; // md
    }
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleOutsideClick}
      style={backdropStyle}
    >
      <div
        style={{
          ...modalStyle,
          width: '100%',
          maxWidth: getWidth()
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} color="var(--gray-500)" />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(30, 41, 59, 0.45)', // Sleek backdrop slate
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
  animation: 'fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};

const modalStyle = {
  backgroundColor: 'var(--light)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
  overflow: 'hidden',
  animation: 'slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  border: '1px solid var(--gray-100)'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  borderBottom: '1.5px solid var(--gray-100)'
};

const titleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: 'var(--dark)'
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s ease'
};

const contentStyle = {
  padding: '24px',
  overflowY: 'auto',
  fontSize: '14px',
  color: 'var(--dark-light)',
  fontFamily: 'var(--font-body)'
};

const footerStyle = {
  padding: '16px 24px',
  backgroundColor: 'var(--gray-50)',
  borderTop: '1.5px solid var(--gray-100)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '12px'
};

// Add standard keyframe classes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slide-up {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export default Modal;
