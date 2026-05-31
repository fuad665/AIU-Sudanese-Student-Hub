import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { GraduationCap, Search, Briefcase, MapPin, Mail, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import Select from '../components/Select';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';

const Alumni = () => {
  const { alumni, showToast } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [mentorOnly, setMentorOnly] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [mentorshipNote, setMentorshipNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Match search and filters
  const filteredAlumni = alumni.filter((alum) => {
    const matchesSearch =
      alum.fullName.toLowerCase().includes(search.toLowerCase()) ||
      alum.major.toLowerCase().includes(search.toLowerCase()) ||
      alum.currentJob.toLowerCase().includes(search.toLowerCase()) ||
      alum.company.toLowerCase().includes(search.toLowerCase()) ||
      alum.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase()));

    const matchesIndustry = industryFilter ? alum.industry === industryFilter : true;
    const matchesMentor = mentorOnly ? alum.mentorStatus === true : true;

    return matchesSearch && matchesIndustry && matchesMentor;
  });

  const industries = Array.from(new Set(alumni.map((a) => a.industry)));

  const handleMentorshipRequest = (e) => {
    e.preventDefault();
    if (!mentorshipNote.trim()) return;

    setIsSubmittingNote(true);
    setTimeout(() => {
      showToast(`Mentorship request sent to ${selectedAlumni.fullName}!`, 'success');
      setIsSubmittingNote(false);
      setMentorshipNote('');
      setSelectedAlumni(null);
    }, 1200);
  };

  return (
    <div style={containerStyle}>
      {/* 1. Filtering header */}
      <Card hoverable={false} padding="md" style={controlsCardStyle}>
        <div style={controlsRowStyle}>
          <div style={rowGridStyle}>
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skills, major, or company..."
              onClear={() => setSearch('')}
            />

            <Select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              options={industries}
              placeholder="All Industries"
            />
          </div>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={mentorOnly}
              onChange={(e) => setMentorOnly(e.target.checked)}
              style={checkboxStyle}
            />
            <span style={checkboxTextStyle}>Show only alumni willing to Mentor students (SSA Mentors)</span>
          </label>
        </div>
      </Card>

      {/* 2. Alumni Grid */}
      <div style={alumniGridStyle}>
        {filteredAlumni.length > 0 ? (
          filteredAlumni.map((alum) => (
            <Card key={alum.id} hoverable={true} padding="lg" style={alumniCardStyle}>
              {/* Profile Card Header */}
              <div style={alumniHeaderStyle}>
                <Avatar name={alum.fullName} size="lg" />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <h4 style={alumniNameStyle}>{alum.fullName}</h4>
                  <span style={graduationClassStyle}>AIU Class of {alum.graduationYear}</span>
                </div>
              </div>

              {/* Career details */}
              <div style={careerBoxStyle}>
                <div style={careerDetailRowStyle}>
                  <Briefcase size={14} color="var(--primary)" />
                  <span><strong>{alum.currentJob}</strong> at <strong>{alum.company}</strong></span>
                </div>
                
                <div style={careerDetailRowStyle}>
                  <MapPin size={14} color="var(--primary)" />
                  <span style={locationSpanStyle}>{alum.location}</span>
                </div>
              </div>

              {/* Skills Tag Cloud */}
              <div style={skillsContainerStyle}>
                {alum.skills.map((skill, idx) => (
                  <span key={idx} style={skillTagStyle}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action and mentorship badges */}
              <div style={alumniCardFooterStyle}>
                {alum.mentorStatus ? (
                  <div style={mentorActionBlockStyle}>
                    <span style={mentorBadgeStyle}>
                      <Award size={12} /> Mentor
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setSelectedAlumni(alum)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Request Mentorship
                    </Button>
                  </div>
                ) : (
                  <div style={noMentorBlockStyle}>
                    <span style={nonMentorLabelStyle}>Mentorship Unavailable</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div style={emptyBoxStyle}>No alumni found matching those parameters.</div>
        )}
      </div>

      {/* Mentorship Request Dialog Modal */}
      <Modal
        isOpen={!!selectedAlumni}
        onClose={() => {
          setSelectedAlumni(null);
          setMentorshipNote('');
        }}
        title={`Request Mentorship: ${selectedAlumni?.fullName}`}
        footer={
          <div style={modalFooterStyle}>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAlumni(null);
                setMentorshipNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSubmittingNote}
              onClick={handleMentorshipRequest}
              disabled={!mentorshipNote.trim()}
            >
              Send Request
            </Button>
          </div>
        }
      >
        {selectedAlumni && (
          <div style={modalBodyStyle}>
            <div style={modalHeaderRowStyle}>
              <Avatar name={selectedAlumni.fullName} size="md" />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={modalAlumniNameStyle}>{selectedAlumni.fullName}</span>
                <span style={modalAlumniRoleStyle}>{selectedAlumni.currentJob} at {selectedAlumni.company}</span>
              </div>
            </div>

            <hr style={modalDividerStyle} />

            <form onSubmit={handleMentorshipRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={mentorFoilStyle}>
                <CheckCircle2 size={16} color="var(--secondary)" />
                <span>
                  You are requesting mentorship. An email notification with your message details will be dispatched to <strong>{selectedAlumni.email}</strong>.
                </span>
              </div>

              <Input
                label="Mentorship Statement / Introduction"
                name="mentorshipNote"
                type="textarea"
                placeholder="Briefly introduce yourself (major, academic interests) and specify what advice/guidance you seek from this alumnus..."
                value={mentorshipNote}
                onChange={(e) => setMentorshipNote(e.target.value)}
                required
                rows={5}
              />
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)'
};

const controlsCardStyle = {
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)'
};

const controlsRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const rowGridStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '16px',
  alignItems: 'center'
};

const checkboxLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  userSelect: 'none',
  width: 'fit-content'
};

const checkboxStyle = {
  accentColor: 'var(--primary)',
  width: '16px',
  height: '16px',
  cursor: 'pointer'
};

const checkboxTextStyle = {
  fontSize: '13px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const alumniGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px'
};

const alumniCardStyle = {
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  textAlign: 'left'
};

const alumniHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '14px'
};

const alumniNameStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--dark)',
  lineHeight: '1.2'
};

const graduationClassStyle = {
  fontSize: '11px',
  color: 'var(--gray-450)',
  fontWeight: '600',
  marginTop: '2px'
};

const careerBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  backgroundColor: 'var(--gray-50)',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--gray-150)'
};

const careerDetailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: 'var(--dark-light)'
};

const locationSpanStyle = {
  color: 'var(--gray-500)',
  fontWeight: '500'
};

const skillsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  margin: '14px 0'
};

const skillTagStyle = {
  fontSize: '10.5px',
  backgroundColor: 'var(--primary-light)',
  color: 'var(--primary)',
  fontWeight: '600',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid rgba(15, 118, 110, 0.1)'
};

const alumniCardFooterStyle = {
  paddingTop: '12px',
  borderTop: '1px solid var(--gray-150)',
  marginTop: 'auto'
};

const mentorActionBlockStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const mentorBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: '750',
  backgroundColor: 'var(--secondary-light)',
  color: '#b88a10',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid rgba(212, 160, 23, 0.2)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const noMentorBlockStyle = {
  display: 'flex',
  justifyContent: 'flex-start'
};

const nonMentorLabelStyle = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--gray-400)',
  fontStyle: 'italic'
};

const emptyBoxStyle = {
  gridColumn: '1 / -1',
  padding: '40px',
  textAlign: 'center',
  color: 'var(--gray-400)',
  border: '1.5px dashed var(--gray-200)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '500'
};

const modalFooterStyle = {
  display: 'flex',
  gap: '12px',
  width: '100%',
  justifyContent: 'flex-end'
};

const modalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const modalHeaderRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const modalAlumniNameStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const modalAlumniRoleStyle = {
  fontSize: '12px',
  color: 'var(--gray-500)',
  fontWeight: '500'
};

const modalDividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '16px 0'
};

const mentorFoilStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: 'var(--secondary-light)',
  border: '1.5px solid rgba(212, 160, 23, 0.25)',
  padding: '12px',
  borderRadius: 'var(--radius-sm)',
  color: '#b88a10',
  fontSize: '12px',
  lineHeight: 1.4
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @media (max-width: 640px) {
      div[style*="rowGridStyle"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Alumni;
