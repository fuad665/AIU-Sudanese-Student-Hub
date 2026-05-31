import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  style = {}
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        fontFamily: 'var(--font-body)',
        ...style
      }}
      className={className}
    >
      <div style={searchIconWrapperStyle}>
        <Search size={18} color="var(--gray-400)" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
        style={searchInputStyle}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          type="button"
          style={clearButtonStyle}
        >
          <X size={16} color="var(--gray-400)" />
        </button>
      )}
    </div>
  );
};

const searchIconWrapperStyle = {
  position: 'absolute',
  left: '14px',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const searchInputStyle = {
  paddingLeft: '44px',
  paddingRight: '40px',
  width: '100%',
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)'
};

const clearButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: 'var(--radius-sm)'
};

export default SearchBar;
