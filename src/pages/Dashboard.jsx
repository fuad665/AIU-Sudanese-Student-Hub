import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  Users,
  Vote,
  Calendar,
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Contact,
  GraduationCap,
  Sparkles,
  BookOpen
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const Dashboard = () => {
  const { currentUser, users, elections, events, announcements, approveStudent, rsvpEvent } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedAnn, setSelectedAnn] = useState(null);

  // Statistics Computations
  const totalStudents = users.filter((u) => u.status === 'active' || u.status === 'government').length;
  const govMembers = users.filter((u) => u.role === 'government' || u.role === 'admin' || u.status === 'government').length;
  const alumniCount = users.filter((u) => u.status === 'alumni').length;
  const totalEvents = events.length;
  const totalAnn = announcements.length;
  const totalElections = elections.length;
  const pendingApprovalsCount = users.filter((u) => u.role === 'pending').length;

  // Filter events RSVP'd by user
  const userRSVPs = events.filter((ev) => ev.rsvps.includes(currentUser.id));

  // Quick Action Buttons based on Role
  const renderQuickActions = () => {
    return (
      <div style={quickActionsGridStyle}>
        {currentUser && (
          <Button
            variant="outline"
            onClick={() => navigate('/my-card')}
            icon={Contact}
            style={actionButtonStyle}
          >
            My Digital ID Card
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => navigate('/elections')}
          icon={Vote}
          style={actionButtonStyle}
        >
          Voting Portal
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/alumni')}
          icon={GraduationCap}
          style={actionButtonStyle}
        >
          Request Mentorship
        </Button>

        {currentUser.role === 'admin' && pendingApprovalsCount > 0 && (
          <Button
            variant="danger"
            onClick={() => navigate('/admin')}
            icon={ShieldAlert}
            style={actionButtonStyle}
          >
            Review {pendingApprovalsCount} Approvals
          </Button>
        )}
      </div>
    );
  };

  return (
    <div style={dashboardWrapperStyle}>
      {/* Greetings Header */}
      <div style={welcomeBannerStyle} className="gradient-bg">
        <div style={welcomeTextStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h2 style={welcomeTitleStyle}>Salam, {currentUser.name}!</h2>
            <Badge role={currentUser.role} />
          </div>
          <p style={welcomeSubStyle}>
            {currentUser.role === 'admin'
              ? 'Administrator Access Active. Keep the Sudanese student database and committees running smoothly!'
              : currentUser.status === 'alumni'
              ? 'Welcome back, valued alumnus! Browse the alumni network, connect with mentors, and stay in touch with your AIU community.'
              : 'Welcome back to the Sudanese Student Association Hub at AIU. Check your digital ID card, upcoming elections, and local schedules.'}
          </p>
        </div>
        <div style={cultureVisualBoxStyle}>
          🇸🇩
        </div>
      </div>

      {/* Admin Quick Action Alert Banner */}
      {currentUser.role === 'admin' && pendingApprovalsCount > 0 && (
        <div style={adminAlertBannerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} />
            <span><strong>Administrative Alert:</strong> There are {pendingApprovalsCount} new student registration applications waiting for your validation.</span>
          </div>
          <Button size="sm" variant="danger" onClick={() => navigate('/admin')}>
            Approve Now
          </Button>
        </div>
      )}

      {/* Stats Cards Section */}
      <div style={statsGridStyle}>
        <StatsCard title="Total Students" value={totalStudents} icon={Users} description="Active on campus" />
        <StatsCard title="Government Members" value={govMembers} icon={Users} description="Committee/Admin" />
        <StatsCard title="Alumni" value={alumniCount} icon={GraduationCap} description="Graduated students" />
        <StatsCard title="Events" value={totalEvents} icon={Calendar} description="All scheduled programs" />
        <StatsCard title="Announcements" value={totalAnn} icon={Megaphone} description="Community bulletins" />
        <StatsCard title="Elections" value={totalElections} icon={Vote} description="Voting/Ballot sessions" />
      </div>

      {/* Main Widgets Container */}
      <div style={widgetGridStyle}>
        {/* Left Column: Announcements Ticker */}
        <div style={leftColumnStyle}>
          <Card hoverable={false} padding="lg">
            <div style={widgetHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} color="var(--primary)" />
                <h3 style={widgetTitleStyle}>Official Announcements</h3>
              </div>
              <Link to="/announcements" style={viewAllLinkStyle}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div style={annListStyle}>
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnn(ann)}
                  style={annItemStyle}
                >
                  <div style={annMetaStyle}>
                    <Badge variant={ann.importance === 'high' ? 'danger' : 'primary'} style={{ fontSize: '10px' }}>
                      {ann.category}
                    </Badge>
                    <span style={annDateStyle}>{ann.date}</span>
                  </div>
                  <h4 style={annItemTitleStyle}>
                    {ann.importance === 'high' && <span style={highTagStyle}>[URGENT] </span>}
                    {ann.title}
                  </h4>
                  <p style={annSnippetStyle}>{ann.content.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: RSVPs & Quick Actions */}
        <div style={rightColumnStyle}>
          {/* Quick Actions Panel */}
          <Card hoverable={false} padding="lg" style={{ marginBottom: '24px' }}>
            <h3 style={{ ...widgetTitleStyle, marginBottom: '14px' }}>Quick Actions</h3>
            {renderQuickActions()}
          </Card>

          {/* User RSVPs Panel */}
          <Card hoverable={false} padding="lg">
            <div style={widgetHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--primary)" />
                <h3 style={widgetTitleStyle}>My Registered RSVPs</h3>
              </div>
            </div>

            <div style={rsvpContainerStyle}>
              {userRSVPs.length > 0 ? (
                <div style={rsvpListStyle}>
                  {userRSVPs.map((ev) => (
                    <div key={ev.id} style={rsvpItemStyle}>
                      <div style={rsvpTextContainerStyle}>
                        <span style={rsvpItemTitleStyle}>{ev.title}</span>
                        <span style={rsvpItemTimeStyle}>{ev.date} | {ev.location}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rsvpEvent(ev.id)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Cancel RSVP
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyRsvpStyle}>
                  <BookOpen size={24} color="var(--gray-300)" />
                  <p style={{ marginTop: '8px' }}>You have not RSVP'd to any upcoming events yet.</p>
                  <Link to="/events" style={rsvpExploreLinkStyle}>Explore Events Calendar</Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Announcement Details Modal */}
      <Modal
        isOpen={!!selectedAnn}
        onClose={() => setSelectedAnn(null)}
        title={selectedAnn?.title || ''}
        footer={<Button onClick={() => setSelectedAnn(null)}>Close Notice</Button>}
      >
        {selectedAnn && (
          <div>
            <div style={modalMetaRowStyle}>
              <Badge variant={selectedAnn.importance === 'high' ? 'danger' : 'primary'}>
                {selectedAnn.category}
              </Badge>
              <span style={modalAuthorStyle}>Posted by {selectedAnn.author} on {selectedAnn.date}</span>
            </div>
            <p style={modalBodyStyle}>{selectedAnn.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

const dashboardWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)'
};

const welcomeBannerStyle = {
  borderRadius: 'var(--radius-xl)',
  padding: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#ffffff',
  boxShadow: 'var(--shadow-premium)',
  overflow: 'hidden',
  position: 'relative'
};

const welcomeTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxWidth: '75%',
  zIndex: 1
};

const portalHeaderTagStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em'
};

const welcomeTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '24px',
  fontWeight: '800',
  lineHeight: 1.2
};

const welcomeSubStyle = {
  fontSize: '14px',
  opacity: 0.88,
  lineHeight: 1.4
};

const cultureVisualBoxStyle = {
  fontSize: '84px',
  userSelect: 'none',
  opacity: 0.25,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  right: '24px',
  zIndex: 0
};

const adminAlertBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  backgroundColor: 'var(--danger-light)',
  border: '1.5px solid rgba(239, 68, 68, 0.25)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--danger)',
  fontSize: '13.5px',
  fontFamily: 'var(--font-body)'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px'
};

const widgetGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: '24px'
};

const leftColumnStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const widgetHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '14px',
  borderBottom: '1.5px solid var(--gray-150)',
  marginBottom: '16px'
};

const widgetTitleStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const viewAllLinkStyle = {
  fontSize: '13px',
  color: 'var(--primary)',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px'
};

const annListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const annItemStyle = {
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--gray-200)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const annMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px'
};

const annDateStyle = {
  fontSize: '11px',
  color: 'var(--gray-400)',
  fontWeight: '500'
};

const annItemTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--dark)',
  lineHeight: 1.3,
  marginBottom: '4px'
};

const highTagStyle = {
  color: 'var(--danger)',
  fontWeight: '700'
};

const annSnippetStyle = {
  fontSize: '12px',
  color: 'var(--dark-light)',
  lineHeight: 1.4
};

const quickActionsGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const actionButtonStyle = {
  width: '100%',
  justifyContent: 'flex-start',
  padding: '12px 16px'
};

const rsvpContainerStyle = {
  minHeight: '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const rsvpListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const rsvpItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--gray-150)'
};

const rsvpTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  maxWidth: '70%'
};

const rsvpItemTitleStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--dark)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const rsvpItemTimeStyle = {
  fontSize: '11px',
  color: 'var(--gray-450)'
};

const emptyRsvpStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: 'var(--gray-400)',
  fontSize: '13px',
  padding: '24px 0'
};

const rsvpExploreLinkStyle = {
  fontSize: '12px',
  color: 'var(--primary)',
  fontWeight: '600',
  marginTop: '6px',
  textDecoration: 'none'
};

const modalMetaRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px'
};

const modalAuthorStyle = {
  fontSize: '12px',
  color: 'var(--gray-500)'
};

const modalBodyStyle = {
  lineHeight: 1.6,
  fontSize: '14px',
  color: 'var(--dark-light)',
  whiteSpace: 'pre-line'
};

// Add card animations in document style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    div[style*="annItemStyle"]:hover {
      border-color: var(--primary) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    @media (max-width: 1024px) {
      div[style*="widgetGridStyle"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;
