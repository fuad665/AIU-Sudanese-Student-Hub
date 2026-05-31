import React from 'react';

const Select = ({
  label,
  value,
  onChange,
  options = [], // [{ value: 'x', label: 'X' }] or ['Option 1', 'Option 2']
  error,
  name,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div style={wrapperStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={requiredStyle}>*</span>}
        </label>
      )}
      <div style={selectContainerStyle}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`input-field ${error ? 'error' : ''}`}
          style={selectStyle}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, index) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={index} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
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

const selectContainerStyle = {
  position: 'relative',
  width: '100%'
};

const selectStyle = {
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  backgroundSize: '16px',
  paddingRight: '40px',
  cursor: 'pointer'
};

const errorTextStyle = {
  fontSize: '12px',
  color: 'var(--danger)',
  fontWeight: '500',
  marginTop: '2px'
};

export default Select;
