import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  name,
  icon: Icon = null,
  required = false,
  className = '',
  rows = 3, // For textarea
  ...props
}) => {
  const isTextArea = type === 'textarea';

  return (
    <div style={wrapperStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={requiredStyle}>*</span>}
        </label>
      )}
      <div style={inputContainerStyle}>
        {Icon && (
          <div style={iconWrapperStyle}>
            <Icon size={18} color="var(--gray-400)" />
          </div>
        )}
        {isTextArea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className={`input-field ${error ? 'error' : ''}`}
            style={{
              paddingLeft: Icon ? '40px' : '16px',
              resize: 'vertical',
              minHeight: '100px'
            }}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`input-field ${error ? 'error' : ''}`}
            style={{
              paddingLeft: Icon ? '40px' : '16px'
            }}
            {...props}
          />
        )}
      </div>
      {error && <span style={errorTextStyle}>{error}</span>}
    </div>
  );
};

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: '100%',
  fontFamily: 'var(--font-body)'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const requiredStyle = {
  color: 'var(--danger)'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const iconWrapperStyle = {
  position: 'absolute',
  left: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none'
};

const errorTextStyle = {
  fontSize: '12px',
  color: 'var(--danger)',
  fontWeight: '500',
  marginTop: '2px'
};

export default Input;
