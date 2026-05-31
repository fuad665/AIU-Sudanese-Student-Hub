import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Compass, Users2, History, Mail, PhoneCall, ExternalLink, Award, FileText, Briefcase } from 'lucide-react';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Government = () => {
  const { governmentHistory, users } = useContext(AppContext);
  const [selectedExec, setSelectedExec] = useState(null);

  const executives = governmentHistory?.executives || [];
  const historyList = governmentHistory?.history || [];

  // Helper: Find studentId and other details from users state dynamically to show correct Student ID
  const getStudentDetails = (name) => {
    const matched = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
    return {
      studentId: matched ? matched.studentId : 'N/A',
      major: matched ? matched.major : null
    };
  };

  return (
    <div style={containerStyle}>
      {/* 1. Current Executive Committee Portfolios */}
      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Users2 size={24} color="var(--primary)" />
          <h2 style={sectionTitleStyle}>Current Government Cabinet ({governmentHistory?.currentTenure})</h2>
        </div>
        
        <p style={sectionDescStyle}>
          Official representatives of the Sudanese Student Association at AIU. Click any cabinet profile card to view official contact portals.
        </p>

        <div style={executivesGridStyle}>
          {executives.map((exec, idx) => {
            const { studentId, major } = getStudentDetails(exec.name);
            return (
              <Card
                key={idx}
                hoverable={true}
                onClick={() => setSelectedExec({ ...exec, studentId, dynamicMajor: major })}
                padding="md"
                style={execCardStyle}
              >
                {/* Badge: GOVERNMENT at the top corner */}
                <div style={governmentBadgeContainerStyle}>
                  <Badge role="government" style={govBadgeStyle}>GOVERNMENT</Badge>
                </div>

                <div style={execAvatarBoxStyle}>
                  <Avatar src={exec.avatar} name={exec.name} size="lg" isCommittee={true} />
                  <div style={execRoleNameStyle}>{exec.role}</div>
                </div>

                <div style={execInfoBoxStyle}>
                  <h4 style={execNameStyle}>{exec.name}</h4>
                  
                  <div style={idRowStyle}>
                    <FileText size={12} color="var(--gray-450)" />
                    <span style={execIdStyle}>ID: {studentId}</span>
                  </div>

                  <div style={idRowStyle}>
                    <Briefcase size={12} color="var(--gray-450)" />
                    <span style={execMajorStyle}>{major || exec.major}</span>
                  </div>

                  <p style={execBioStyle}>
                    {exec.bio ? (exec.bio.length > 75 ? `${exec.bio.slice(0, 75)}...` : exec.bio) : 'Managing student affairs portfolio.'}
                  </p>
                </div>

                <div style={execCardFooterStyle}>
                  <span style={contactPromptStyle}>Contact Portal <ExternalLink size={12} /></span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 2. Historic Timeline Achievements (Previous Governments) */}
      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <History size={24} color="var(--secondary)" />
          <h2 style={sectionTitleStyle}>Previous Governments & Historical Legacies</h2>
        </div>

        <p style={sectionDescStyle}>
          Recognizing the structural contributions, welfare reforms, and historic achievements of past SSA student governments since 2020.
        </p>

        <div style={timelineContainerStyle}>
          {historyList.map((hist, idx) => (
            <div key={idx} style={timelineItemStyle}>
              {/* Timeline marker */}
              <div style={timelineMarkerContainerStyle}>
                <div style={timelineDotStyle} />
                {idx !== historyList.length - 1 && <div style={timelineLineStyle} />}
              </div>

              {/* Timeline content */}
              <div style={timelineContentStyle}>
                <Card hoverable={false} padding="lg" style={timelineCardStyle}>
                  <div style={timelineCardHeaderStyle}>
                    <span style={tenureBadgeStyle}>{hist.tenure}</span>
                    <h4 style={timelinePresTitleStyle}>
                      President: <strong>{hist.president}</strong>
                    </h4>
                  </div>

                  <div style={achievementsContainerStyle}>
                    <h5 style={achievementsTitleStyle}>Accomplishments & Welfare Reforms:</h5>
                    <ul style={achievementsListStyle}>
                      {hist.achievements.map((ach, achIdx) => (
                        <li key={achIdx}>{ach}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={historicalOfficersContainerStyle}>
                    <span style={officersLabelStyle}>Committee Cabinet Officers:</span>
                    <div style={officersListStyle}>
                      {hist.committee.map((officer, offIdx) => (
                        <span key={offIdx} style={officerSpanStyle}>
                          <strong>{officer.name}</strong> ({officer.role})
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Executive Contact Drawer Modal */}
      <Modal
        isOpen={!!selectedExec}
        onClose={() => setSelectedExec(null)}
        title={`${selectedExec?.name} — ${selectedExec?.role}`}
        footer={<Button onClick={() => setSelectedExec(null)}>Close Details</Button>}
      >
        {selectedExec && (
          <div style={modalBodyStyle}>
            <div style={modalHeaderRowStyle}>
              <Avatar src={selectedExec.avatar} name={selectedExec.name} size="lg" isCommittee={true} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <h4 style={modalTitleStyle}>{selectedExec.name}</h4>
                <span style={modalSubTitleStyle}>{selectedExec.dynamicMajor || selectedExec.major} · ID: {selectedExec.studentId}</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <Badge role="government">{selectedExec.role}</Badge>
                  <Badge variant="secondary">GOVERNMENT</Badge>
                </div>
              </div>
            </div>

            <hr style={modalDividerStyle} />

            <div style={modalSectionStyle}>
              <h5 style={modalLabelStyle}>PORTFOLIO DIRECTIVE & BIO</h5>
              <p style={modalBioStyle}>{selectedExec.bio}</p>
            </div>

            <hr style={modalDividerStyle} />

            <h5 style={modalContactsTitleStyle}>Direct Communication Channels</h5>
            <div style={modalContactsListStyle}>
              <div style={modalContactItemStyle}>
                <div style={iconBoxStyle}>
                  <Mail size={16} color="var(--primary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={modalContactLabelStyle}>Official Email</span>
                  <a href={`mailto:${selectedExec.email}`} style={modalContactLinkStyle}>
                    {selectedExec.email}
                  </a>
                </div>
              </div>

              {selectedExec.whatsapp && (
                <div style={modalContactItemStyle}>
                  <div style={{ ...iconBoxStyle, backgroundColor: '#dcfce7' }}>
                    <PhoneCall size={16} color="#16a34a" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={modalContactLabelStyle}>WhatsApp / Hotline</span>
                    <a
                      href={`https://wa.me/${selectedExec.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...modalContactLinkStyle, color: '#16a34a' }}
                    >
                      {selectedExec.whatsapp}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles Definitions
───────────────────────────────────────────── */
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  fontFamily: 'var(--font-body)'
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '2px solid var(--gray-200)',
  paddingBottom: '8px'
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const sectionDescStyle = {
  fontSize: '13.5px',
  color: 'var(--gray-500)',
  lineHeight: 1.4,
  textAlign: 'left'
};

const executivesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px'
};

const execCardStyle = {
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  textAlign: 'center',
  height: '100%',
  position: 'relative',
  paddingTop: '32px'
};

const governmentBadgeContainerStyle = {
  position: 'absolute',
  top: '12px',
  left: '12px'
};

const govBadgeStyle = {
  fontSize: '9.5px',
  padding: '2px 8px',
  fontWeight: '750',
  letterSpacing: '0.04em'
};

const execAvatarBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '14px'
};

const execRoleNameStyle = {
  fontSize: '12px',
  fontWeight: '750',
  color: 'var(--primary)',
  backgroundColor: 'var(--primary-light)',
  padding: '3px 10px',
  borderRadius: '999px',
  border: '1.5px solid rgba(15, 118, 110, 0.15)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const execInfoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flexGrow: 1,
  alignItems: 'center'
};

const execNameStyle = {
  fontSize: '15.5px',
  fontWeight: '800',
  color: 'var(--dark)',
  lineHeight: 1.2
};

const idRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12.5px',
  color: 'var(--dark-light)'
};

const execIdStyle = {
  fontFamily: 'monospace',
  fontWeight: '600'
};

const execMajorStyle = {
  fontWeight: '550'
};

const execBioStyle = {
  fontSize: '12.5px',
  color: 'var(--gray-500)',
  lineHeight: '1.4',
  marginTop: '4px',
  maxWidth: '240px'
};

const execCardFooterStyle = {
  paddingTop: '12px',
  borderTop: '1px solid var(--gray-150)',
  marginTop: '14px',
  display: 'flex',
  justifyContent: 'center'
};

const contactPromptStyle = {
  fontSize: '12.5px',
  color: 'var(--primary)',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px'
};

/* Timeline Previous Governments */
const timelineContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: '12px'
};

const timelineItemStyle = {
  display: 'flex',
  gap: '24px'
};

const timelineMarkerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '16px'
};

const timelineDotStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: 'var(--secondary)',
  border: '4px solid var(--secondary-light)',
  boxShadow: '0 0 8px rgba(212, 160, 23, 0.4)',
  zIndex: 2
};

const timelineLineStyle = {
  width: '2px',
  flexGrow: 1,
  backgroundColor: 'var(--gray-200)',
  margin: '4px 0'
};

const timelineContentStyle = {
  flexGrow: 1,
  paddingBottom: '32px',
  textAlign: 'left'
};

const timelineCardStyle = {
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)'
};

const timelineCardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  borderBottom: '1px solid var(--gray-150)',
  paddingBottom: '10px',
  marginBottom: '12px'
};

const tenureBadgeStyle = {
  fontSize: '12px',
  fontWeight: '700',
  backgroundColor: 'var(--secondary-light)',
  color: 'var(--secondary)',
  padding: '4px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid rgba(212, 160, 23, 0.15)'
};

const timelinePresTitleStyle = {
  fontSize: '14px',
  color: 'var(--dark-light)'
};

const achievementsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const achievementsTitleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const achievementsListStyle = {
  paddingLeft: '16px',
  fontSize: '13px',
  color: 'var(--dark-light)',
  lineHeight: '1.5',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const historicalOfficersContainerStyle = {
  marginTop: '16px',
  paddingTop: '12px',
  borderTop: '1px dashed var(--gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const officersLabelStyle = {
  fontSize: '11px',
  color: 'var(--gray-400)',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const officersListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 12px'
};

const officerSpanStyle = {
  fontSize: '11.5px',
  color: 'var(--dark-light)',
  backgroundColor: 'var(--gray-50)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--gray-150)'
};

/* Modal Contact */
const modalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const modalHeaderRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const modalTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--dark)',
  lineHeight: '1.2'
};

const modalSubTitleStyle = {
  fontSize: '12.5px',
  color: 'var(--gray-550)',
  fontWeight: '550'
};

const modalDividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '16px 0'
};

const modalSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const modalLabelStyle = {
  fontSize: '10px',
  fontWeight: '650',
  color: 'var(--gray-400)',
  letterSpacing: '0.04em'
};

const modalBioStyle = {
  fontSize: '13.5px',
  lineHeight: '1.5',
  color: 'var(--dark-light)'
};

const modalContactsTitleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--dark)',
  marginBottom: '12px'
};

const modalContactsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const modalContactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '13px'
};

const iconBoxStyle = {
  backgroundColor: 'var(--primary-light)',
  padding: '8px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalContactLabelStyle = {
  fontSize: '10px',
  color: 'var(--gray-400)',
  fontWeight: '600'
};

const modalContactLinkStyle = {
  color: 'var(--primary)',
  textDecoration: 'none',
  fontWeight: '600'
};

export default Government;
