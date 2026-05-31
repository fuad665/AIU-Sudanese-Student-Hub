import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={containerStyle} className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ padding: '8px' }}
      >
        <ChevronLeft size={16} />
      </Button>

      <div style={numbersContainerStyle}>
        {getPageNumbers().map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                ...numberButtonStyle,
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--light)' : 'var(--dark-light)',
                borderColor: isActive ? 'var(--primary)' : 'var(--gray-200)'
              }}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ padding: '8px' }}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
  fontFamily: 'var(--font-body)',
  marginTop: '20px'
};

const numbersContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const numberButtonStyle = {
  width: '32px',
  height: '32px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid',
  fontSize: '13px',
  fontWeight: '650',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease'
};

export default Pagination;
