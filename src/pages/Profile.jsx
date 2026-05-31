import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Mail, FileText, Download, Edit2, CheckCircle2, Award, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

const Profile = () => {
  const { currentUser, updateProfile } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    photo: currentUser?.photo || '',
    major: currentUser?.major || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photo: localUrl }));
      updateProfile({ photo: localUrl }); // instant save for photo
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
    updateProfile({ photo: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      updateProfile(formData);
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `SSA_Membership_${currentUser?.studentId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG', err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`SSA_Membership_${currentUser?.studentId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        style={{ display: 'none' }} 
      />

      <div style={headerTextGroupStyle}>
        <h1 style={titleStyle}>Student Profile Hub</h1>
        <p style={subtitleStyle}>Manage your identity, update your photo, and generate your digital membership card.</p>
      </div>

      <div style={layoutGridStyle}>
        {/* Left Column: Top Section Profile Info */}
        <div style={leftColumnStyle}>
          <Card hoverable={false} padding="xl" style={mainProfileCardStyle}>
            {/* Top Section: Large Profile Photo */}
            <div style={largeAvatarWrapperStyle}>
              <Avatar 
                src={formData.photo} 
                name={currentUser?.name || 'Student'} 
                size="xxl" 
                isCommittee={currentUser?.role === 'government' || currentUser?.role === 'admin'} 
              />
            </div>

            {/* Below: Basic Info */}
            <div style={basicInfoSectionStyle}>
              <h2 style={profileNameStyle}>{currentUser?.name}</h2>
              <span style={profileIdStyle}>{currentUser?.studentId}</span>
              <span style={profileEmailStyle}>{currentUser?.email}</span>
              <span style={profileMajorStyle}>{currentUser?.major}</span>
              
              <div style={badgeRowStyle}>
                <Badge role={currentUser?.role} />
                {currentUser?.position && (
                   <span style={positionBadgeStyle}><Award size={12} /> {currentUser.position}</span>
                )}
                <span style={statusBadgeStyle}>{currentUser?.status.toUpperCase()}</span>
              </div>
            </div>

            <hr style={dividerStyle} />

            {/* Actions Panel */}
            <div style={actionsPanelStyle}>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} icon={Camera} style={{ width: '100%' }}>
                Change Photo
              </Button>
              {formData.photo && (
                <Button variant="outline" onClick={handleRemovePhoto} style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}>
                  Remove Photo
                </Button>
              )}
              <Button variant="primary" onClick={handleDownloadPNG} icon={Download} style={{ width: '100%' }}>
                Download Card (PNG)
              </Button>
              <Button variant="secondary" onClick={handleDownloadPDF} icon={FileText} style={{ width: '100%' }}>
                Download Card (PDF)
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)} icon={Edit2} style={{ width: '100%' }}>
                {isEditing ? 'Cancel Editing' : 'Edit Information'}
              </Button>
            </div>
          </Card>

          {/* Edit Form (conditionally rendered) */}
          {isEditing && (
            <Card hoverable={false} padding="lg" style={{ marginTop: '20px', animation: 'fade-in 0.2s ease' }}>
              <h3 style={sectionHeadingStyle}>Edit Profile Details</h3>
              <form onSubmit={handleSubmit} style={formStyle}>
                <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} icon={User} required />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} icon={Mail} required />
                <Input label="Academic Major" name="major" value={formData.major} onChange={handleInputChange} icon={FileText} required />
                <Button type="submit" variant="primary" loading={isSubmitting} icon={CheckCircle2} style={{ marginTop: '8px' }}>
                  Save Changes
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Digital Membership Card */}
        <div style={rightColumnStyle}>
          <h3 style={sectionHeadingStyle}>My Membership Card</h3>
          <p style={cardHintStyle}>This digital credential can be used for events, university activities, and community membership verification.</p>
          
          <div style={cardPreviewContainerStyle}>
            {/* The Digital Card Element (Used for html2canvas) */}
            <div ref={cardRef} style={digitalCardWrapperStyle}>
              <div style={digitalCardInnerStyle}>
                {/* Background decorative elements */}
                <div style={cardBgCircle1Style} />
                <div style={cardBgCircle2Style} />

                {/* Card Header */}
                <div style={cardHeaderStyle}>
                  <div style={cardLogoTextStyle}>SSA AIU</div>
                  <div style={cardRoleBadgeStyle}>{currentUser?.role.toUpperCase()}</div>
                </div>

                {/* Card Body */}
                <div style={cardBodyStyle}>
                  <div style={cardAvatarWrapperStyle}>
                    <img 
                      src={formData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'} 
                      alt="Profile" 
                      style={cardAvatarImageStyle}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div style={cardInfoColumnStyle}>
                    <h3 style={cardNameStyle}>{currentUser?.name}</h3>
                    <div style={cardIdLabelStyle}>STUDENT ID</div>
                    <div style={cardIdValueStyle}>{currentUser?.studentId}</div>
                    
                    <div style={cardMajorLabelStyle}>MAJOR</div>
                    <div style={cardMajorValueStyle}>{currentUser?.major || 'General Studies'}</div>
                    
                    {currentUser?.position && (
                      <div style={cardPositionStyle}>{currentUser.position}</div>
                    )}
                  </div>
                </div>

                {/* Card Footer with QR */}
                <div style={cardFooterStyle}>
                  <div style={cardStatusPillStyle}>{currentUser?.status.toUpperCase()}</div>
                  {/* Dynamic QR Code from API (supports CORS) */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentUser?.studentId || 'SSA')}&bgcolor=F8F9FA`} 
                    alt="QR Code" 
                    style={cardQrImageStyle}
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)',
  animation: 'fade-in 0.3s ease'
};

const headerTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  textAlign: 'left'
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

const layoutGridStyle = {
  display: 'grid',
  gridTemplateColumns: '340px 1fr',
  gap: '32px',
  alignItems: 'start'
};

const leftColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

/* Profile Left Column */
const mainProfileCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)'
};

const largeAvatarWrapperStyle = {
  marginBottom: '20px',
  position: 'relative'
};

const basicInfoSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  width: '100%'
};

const profileNameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--dark)'
};

const profileIdStyle = {
  fontFamily: 'monospace',
  fontSize: '15px',
  fontWeight: '600',
  color: 'var(--gray-500)'
};

const profileEmailStyle = {
  fontSize: '14px',
  color: 'var(--dark-light)'
};

const profileMajorStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--primary)',
  marginTop: '4px'
};

const badgeRowStyle = {
  display: 'flex',
  gap: '8px',
  marginTop: '12px',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

const statusBadgeStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--gray-600)',
  backgroundColor: 'var(--gray-100)',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)'
};

const positionBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--secondary)',
  backgroundColor: 'var(--secondary-light)',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)'
};

const dividerStyle = {
  width: '100%',
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '24px 0'
};

const actionsPanelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%'
};

/* Form */
const sectionHeadingStyle = {
  fontSize: '16px',
  fontWeight: '750',
  color: 'var(--dark)',
  marginBottom: '16px',
  textAlign: 'left'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  textAlign: 'left'
};

/* Digital Card Right Column */
const cardHintStyle = {
  fontSize: '13.5px',
  color: 'var(--gray-500)',
  textAlign: 'left',
  maxWidth: '500px',
  marginBottom: '8px'
};

const cardPreviewContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  padding: '32px 0'
};

/* Digital Card Element Design */
const digitalCardWrapperStyle = {
  width: '460px',
  height: '280px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, var(--dark) 0%, #1a1e26 100%)',
  padding: '6px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden'
};

const digitalCardInnerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.1)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px',
  overflow: 'hidden'
};

/* Decorative Backgrounds */
const cardBgCircle1Style = {
  position: 'absolute',
  top: '-50px',
  right: '-30px',
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
  opacity: 0.15,
  zIndex: 0
};

const cardBgCircle2Style = {
  position: 'absolute',
  bottom: '-60px',
  left: '-40px',
  width: '220px',
  height: '220px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
  opacity: 0.15,
  zIndex: 0
};

/* Card Header */
const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1,
  marginBottom: '24px'
};

const cardLogoTextStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '20px',
  fontWeight: '800',
  color: '#fff',
  letterSpacing: '0.05em'
};

const cardRoleBadgeStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--dark)',
  backgroundColor: 'var(--secondary)',
  padding: '4px 12px',
  borderRadius: '4px',
  letterSpacing: '0.08em'
};

/* Card Body */
const cardBodyStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '24px',
  zIndex: 1,
  flexGrow: 1
};

const cardAvatarWrapperStyle = {
  width: '110px',
  height: '110px',
  borderRadius: '12px',
  border: '3px solid rgba(255,255,255,0.2)',
  overflow: 'hidden',
  backgroundColor: 'var(--gray-800)',
  flexShrink: 0
};

const cardAvatarImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const cardInfoColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  gap: '4px'
};

const cardNameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '22px',
  fontWeight: '800',
  color: '#fff',
  marginBottom: '8px',
  lineHeight: 1.1
};

const cardIdLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--primary)',
  letterSpacing: '0.08em'
};

const cardIdValueStyle = {
  fontFamily: 'monospace',
  fontSize: '16px',
  fontWeight: '600',
  color: '#fff',
  marginBottom: '8px'
};

const cardMajorLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  letterSpacing: '0.08em'
};

const cardMajorValueStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#fff'
};

const cardPositionStyle = {
  marginTop: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--secondary)',
  fontStyle: 'italic'
};

/* Card Footer */
const cardFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  zIndex: 1,
  marginTop: 'auto'
};

const cardStatusPillStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.3)',
  padding: '4px 12px',
  borderRadius: '20px',
  letterSpacing: '0.05em'
};

const cardQrImageStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '4px',
  backgroundColor: '#fff',
  padding: '4px'
};

/* Responsive injection */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @media (max-width: 900px) {
      div[style*="layoutGridStyle"] {
        grid-template-columns: 1fr !important;
      }
      div[style*="digitalCardWrapperStyle"] {
        width: 100% !important;
        max-width: 460px;
        height: auto !important;
        min-height: 280px;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Profile;
