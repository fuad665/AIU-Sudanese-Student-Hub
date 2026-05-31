import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'lg', // sm, md, lg, none
  style = {},
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'sm': return '12px';
      case 'md': return '18px';
      case 'lg': return '24px';
      case 'none': return '0';
      default: return '24px';
    }
  };

  const cursorStyle = onClick || hoverable ? 'pointer' : 'default';

  return (
    <div
      onClick={onClick}
      className={`glassmorphism ${hoverable ? 'hover-elevate' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: getPaddingStyle(),
        boxShadow: hoverable ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
        cursor: cursorStyle,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
