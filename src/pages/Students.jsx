import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Filter, ArrowUpDown, Award, Briefcase, IdCard, Phone, Mail } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const Students = () => {
  const { users } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Filter ONLY status = active and status = government, and DO NOT SHOW status = alumni
  const allowedStudents = useMemo(() => {
    return users.filter(
      (u) => (u.status === 'active' || u.status === 'government') && u.status !== 'alumni'
    );
  }, [users]);

  // Extract unique majors for the filter dropdown dynamically
  const majorsList = useMemo(() => {
    const majors = allowedStudents.map((std) => std.major).filter(Boolean);
    return Array.from(new Set(majors)).sort();
  }, [allowedStudents]);

  // Perform search, filter, and sort
  const processedStudents = useMemo(() => {
    let result = allowedStudents.filter((std) => {
      const matchesSearch = std.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = selectedMajor ? std.major === selectedMajor : true;
      return matchesSearch && matchesMajor;
    });

    // Sort A-Z or Z-A based on sortOrder
    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allowedStudents, searchQuery, selectedMajor, sortOrder]);

  return (
    <div style={pageWrapperStyle}>
      {/* Directory Page Header */}
      <div style={headerSectionStyle}>
        <div style={headerTextGroupStyle}>
          <h1 style={titleStyle}>Students Directory</h1>
          <p style={subtitleStyle}>
            Explore and connect with active Sudanese students and government committee members at Albukhary International University.
          </p>
        </div>
        <div style={countBadgeStyle}>
          <span style={countNumberStyle}>{processedStudents.length}</span>
          <span style={countLabelStyle}>Active Students</span>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <Card hoverable={false} padding="md" style={toolbarCardStyle}>
        <div style={toolbarGridStyle}>
          {/* Search Input wrapper */}
          <div style={searchWrapperStyle}>
            <Search size={18} color="var(--gray-400)" style={searchIconStyle} />
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchFieldStyle}
            />
          </div>

          {/* Major Filter */}
          <div style={filterSelectWrapperStyle}>
            <Filter size={16} color="var(--gray-450)" style={selectIconStyle} />
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              style={selectFieldStyle}
            >
              <option value="">All Majors</option>
              {majorsList.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            style={sortButtonStyle}
            title={`Sort ${sortOrder === 'asc' ? 'Z-A' : 'A-Z'}`}
          >
            <ArrowUpDown size={16} color="var(--primary)" />
            <span style={sortButtonTextStyle}>
              Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </span>
          </button>
        </div>
      </Card>

      {/* Directory Grid */}
      {processedStudents.length > 0 ? (
        <div style={gridLayoutStyle}>
          {processedStudents.map((student) => {
            const isGov = student.role === 'government' || student.role === 'admin';
            return (
              <Card key={student.id} hoverable={true} padding="lg" style={studentCardStyle}>
                {/* Decorative status top border glow for committee members */}
                {isGov && <div style={govCardHeaderGlowStyle} />}

                {/* Card header with avatar and basic details */}
                <div style={cardHeaderRowStyle}>
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      src={student.photo}
                      name={student.name}
                      size="md"
                      isCommittee={isGov}
                    />
                    {isGov && (
                      <div style={govMiniBadgeStyle} title="SSA Committee Officer">
                        <Award size={12} color="#fff" />
                      </div>
                    )}
                  </div>

                  <div style={cardHeaderTextsStyle}>
                    <h3 style={studentNameStyle}>{student.name}</h3>
                    <div style={idRowStyle}>
                      <IdCard size={13} color="var(--gray-450)" />
                      <span style={idTextStyle}>{student.studentId}</span>
                    </div>
                  </div>
                </div>

                <hr style={dividerStyle} />

                {/* Card Body Information */}
                <div style={cardBodyStyle}>
                  {/* Major Details */}
                  <div style={infoGroupStyle}>
                    <Briefcase size={14} color="var(--gray-450)" />
                    <div style={infoTextGroupStyle}>
                      <span style={infoLabelStyle}>Major</span>
                      <span style={infoValueStyle}>{student.major || 'General Study'}</span>
                    </div>
                  </div>

                  {/* Government Position (shown only if role = government or position exists) */}
                  {student.position && (
                    <div style={{ ...infoGroupStyle, marginTop: '8px' }}>
                      <Award size={14} color="var(--secondary)" />
                      <div style={infoTextGroupStyle}>
                        <span style={{ ...infoLabelStyle, color: 'var(--secondary)' }}>Position</span>
                        <span style={govPositionValueStyle}>{student.position}</span>
                      </div>
                    </div>
                  )}
                </div>

                <hr style={dividerStyle} />

                {/* Card Footer: Role Badge and quick contact icons */}
                <div style={cardFooterRowStyle}>
                  <Badge role={student.role} style={badgeStyle} />

                  <div style={contactActionsStyle}>
                    {student.email && (
                      <a
                        href={`mailto:${student.email}`}
                        style={iconLinkStyle}
                        title={`Email ${student.name}`}
                      >
                        <Mail size={15} />
                      </a>
                    )}
                    {student.phone && (
                      <a
                        href={`tel:${student.phone}`}
                        style={iconLinkStyle}
                        title={`Call ${student.name}`}
                      >
                        <Phone size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={noResultsStyle}>
          <div style={noResultsIconBoxStyle}>
            <Search size={32} color="var(--gray-400)" />
          </div>
          <h3 style={noResultsTitleStyle}>No Students Found</h3>
          <p style={noResultsSubStyle}>
            We couldn't find any active students matching "{searchQuery}" in our directory.
          </p>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles Definitions (Modern SaaS Theme)
───────────────────────────────────────────── */
const pageWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)',
  animation: 'fade-in 0.3s ease'
};

const headerSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  textAlign: 'left'
};

const headerTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1
};

const titleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '26px',
  fontWeight: '800',
  color: 'var(--dark)'
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'var(--gray-500)',
  lineHeight: '1.5',
  maxWidth: '640px'
};

const countBadgeStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'var(--primary-light)',
  border: '1.5px solid rgba(15, 118, 110, 0.15)',
  padding: '12px 20px',
  borderRadius: 'var(--radius-lg)'
};

const countNumberStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--primary)',
  lineHeight: 1
};

const countLabelStyle = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginTop: '4px'
};

/* Toolbar */
const toolbarCardStyle = {
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)'
};

const toolbarGridStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr auto',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const searchWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const searchIconStyle = {
  position: 'absolute',
  left: '14px'
};

const searchFieldStyle = {
  width: '100%',
  padding: '12px 16px 12px 42px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--dark)',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const filterSelectWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const selectIconStyle = {
  position: 'absolute',
  left: '14px',
  pointerEvents: 'none'
};

const selectFieldStyle = {
  width: '100%',
  padding: '12px 16px 12px 40px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--dark)',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  backgroundSize: '16px'
};

const sortButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 18px',
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--dark-light)'
};

const sortButtonTextStyle = {
  whiteSpace: 'nowrap'
};

/* Responsive Grid Layout */
const gridLayoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
  gap: '20px',
  marginTop: '8px'
};

const studentCardStyle = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '260px',
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
};

const govCardHeaderGlowStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)'
};

const cardHeaderRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  textAlign: 'left'
};

const cardHeaderTextsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const studentNameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '16px',
  fontWeight: '750',
  color: 'var(--dark)',
  lineHeight: 1.2
};

const idRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const idTextStyle = {
  fontSize: '12.5px',
  fontFamily: 'monospace',
  color: 'var(--gray-500)',
  fontWeight: '550'
};

const govMiniBadgeStyle = {
  position: 'absolute',
  bottom: '-2px',
  right: '-2px',
  backgroundColor: 'var(--secondary)',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  border: '1.5px solid #fff'
};

const dividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-100)',
  margin: '14px 0'
};

const cardBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'left',
  flexGrow: 1
};

const infoGroupStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px'
};

const infoTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const infoLabelStyle = {
  fontSize: '9.5px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const infoValueStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--dark)',
  marginTop: '2px'
};

const govPositionValueStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--secondary)',
  marginTop: '2px'
};

const cardFooterRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto'
};

const badgeStyle = {
  fontSize: '11px',
  padding: '3px 8px'
};

const contactActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const iconLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: 'var(--gray-100)',
  color: 'var(--dark-light)',
  textDecoration: 'none',
  transition: 'all 0.2s ease'
};

/* No results state */
const noResultsStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center'
};

const noResultsIconBoxStyle = {
  backgroundColor: 'var(--gray-100)',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px'
};

const noResultsTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const noResultsSubStyle = {
  fontSize: '14px',
  color: 'var(--gray-450)',
  marginTop: '6px',
  maxWidth: '360px',
  lineHeight: 1.4
};

// CSS Injection for hover highlights and responsive media
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    input[style*="searchFieldStyle"]:focus, select[style*="selectFieldStyle"]:focus {
      border-color: var(--primary) !important;
      background-color: #fff !important;
      box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1) !important;
    }
    button[style*="sortButtonStyle"]:hover {
      background-color: var(--primary-light) !important;
      border-color: var(--primary) !important;
      color: var(--primary) !important;
    }
    a[style*="iconLinkStyle"]:hover {
      background-color: var(--primary) !important;
      color: #fff !important;
      transform: scale(1.05);
    }
    @media (max-width: 768px) {
      div[style*="toolbarGridStyle"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      button[style*="sortButtonStyle"] {
        width: 100% !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Students;
