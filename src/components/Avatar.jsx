import React, { useState } from 'react';

const Avatar = ({
  src,
  name = '',
  size = 'md', // sm, md, lg, xl
  isCommittee = false,
  className = '',
  style = {}
}) => {
  const [hasError, setHasError] = useState(false);

  const getDimensions = () => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 64;
      case 'xl': return 96;
      default: return 48; // md
    }
  };

  const getInitials = () => {
    if (!name) return 'S';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const dim = getDimensions();

  const borderStyle = isCommittee
    ? `3px solid var(--secondary)` // Premium gold ring for committee
    : `2px solid var(--gray-200)`;

  return (
    <div
      className={className}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: '50%',
        border: borderStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--primary-light)',
        flexShrink: 0,
        boxShadow: isCommittee ? '0 0 10px rgba(212, 160, 23, 0.25)' : 'none',
        ...style
      }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <span
          style={{
            color: 'var(--primary)',
            fontSize: `${dim * 0.4}px`,
            fontWeight: '600',
            fontFamily: 'var(--font-heading)',
            userSelect: 'none'
          }}
        >
          {getInitials()}
        </span>
      )}
    </div>
  );
};

export default Avatar;
