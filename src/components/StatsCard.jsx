import React from 'react';

const StatsCard = ({
  title,
  value,
  icon: Icon = null,
  description,
  trend = null, // { label: '+12%', type: 'up'/'down' }
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`glassmorphism ${className}`}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.8) 100%)',
        ...style
      }}
    >
      {/* Decorative accent circle inside the card */}
      <div style={glowCircleStyle} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
        <span style={titleStyle}>{title}</span>
        <span style={valueStyle}>{value}</span>
        
        {(description || trend) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            {trend && (
              <span
                style={{
                  ...trendStyle,
                  color: trend.type === 'up' ? 'var(--success)' : 'var(--danger)',
                  backgroundColor: trend.type === 'up' ? 'var(--success-light)' : 'var(--danger-light)'
                }}
              >
                {trend.label}
              </span>
            )}
            {description && <span style={descStyle}>{description}</span>}
          </div>
        )}
      </div>

      {Icon && (
        <div style={iconContainerStyle}>
          <Icon size={24} color="var(--primary)" />
        </div>
      )}
    </div>
  );
};

const glowCircleStyle = {
  position: 'absolute',
  top: '-20px',
  right: '-20px',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(15, 118, 110, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
  pointerEvents: 'none',
  zIndex: 0
};

const titleStyle = {
  fontSize: '14px',
  fontWeight: '550',
  color: 'var(--gray-500)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const valueStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '28px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const trendStyle = {
  fontSize: '11px',
  fontWeight: '600',
  padding: '2px 6px',
  borderRadius: 'var(--radius-sm)'
};

const descStyle = {
  fontSize: '12px',
  color: 'var(--gray-400)'
};

const iconContainerStyle = {
  backgroundColor: 'var(--primary-light)',
  padding: '12px',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  boxShadow: 'inset 0 2px 4px 0 rgba(15, 118, 110, 0.04)'
};

export default StatsCard;
