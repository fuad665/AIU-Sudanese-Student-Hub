import React from 'react';

const Table = ({
  headers = [], // ['Name', 'Role', 'Status'] or [{ label: 'Name', key: 'name' }]
  data = [], // [{ name: 'Ahmed', role: 'Student' }]
  renderRow, // Function: (item, index) => <tr>...</tr>
  emptyMessage = 'No data available',
  className = ''
}) => {
  return (
    <div style={tableContainerStyle} className={className}>
      <table style={tableStyle}>
        <thead>
          <tr style={headerRowStyle}>
            {headers.map((header, idx) => {
              const label = typeof header === 'object' ? header.label : header;
              const style = typeof header === 'object' ? header.style || {} : {};
              return (
                <th key={idx} style={{ ...thStyle, ...style }}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => {
              if (renderRow) {
                return renderRow(item, idx);
              }
              // Fallback simple rendering if no renderRow provided
              return (
                <tr key={idx} style={rowStyle}>
                  {headers.map((header, colIdx) => {
                    const key = typeof header === 'object' ? header.key : header.toLowerCase();
                    return (
                      <td key={colIdx} style={tdStyle}>
                        {item[key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={headers.length} style={emptyTdStyle}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const tableContainerStyle = {
  width: '100%',
  overflowX: 'auto',
  borderRadius: 'var(--radius-lg)',
  border: '1.5px solid var(--gray-200)',
  backgroundColor: 'var(--light)',
  boxShadow: 'var(--shadow-sm)'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  fontSize: '14px'
};

const headerRowStyle = {
  backgroundColor: 'var(--gray-50)',
  borderBottom: '1.5px solid var(--gray-200)'
};

const thStyle = {
  padding: '16px 20px',
  fontWeight: '600',
  color: 'var(--dark-light)',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--gray-100)',
  color: 'var(--dark)'
};

const rowStyle = {
  transition: 'background-color 0.15s ease'
};

// Add CSS hover style in JS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    table tbody tr:hover {
      background-color: var(--gray-50);
    }
  `;
  document.head.appendChild(style);
}

const emptyTdStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  color: 'var(--gray-400)',
  fontWeight: '500'
};

export default Table;
export { tdStyle }; // Export row td styles for page reuse
