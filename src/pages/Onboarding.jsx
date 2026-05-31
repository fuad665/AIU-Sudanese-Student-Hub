import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { insertUserProfile } from '../api/users';
import { User, FileText, Smartphone, ArrowRight, Upload } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import UploadImage from '../components/UploadImage';

const Onboarding = () => {
  const { authSession, currentUser, showToast } = useContext(AppContext);
  const navigate = useNavigate();

  // If there's no auth session, they shouldn't be here
  useEffect(() => {
    if (!authSession) {
      navigate('/login', { replace: true });
    } else if (currentUser) {
      // If they already have a profile, go to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [authSession, currentUser, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    phone: '',
    major: '',
    photo: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const majors = [
    'Software Engineering',
    'Computer Science',
    'Information Technology',
    'Business Administration',
    'Finance',
    'Economics',
    'Accounting',
    'Education',
    'Social Sciences'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUploaded = (imageUrl) => {
    setFormData((prev) => ({ ...prev, photo: imageUrl }));
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required';
    
    if (!formData.studentId.trim()) {
      tempErrors.studentId = 'Student ID is required';
    } else if (!/^\d{7}$/.test(formData.studentId)) {
      tempErrors.studentId = 'Student ID must be exactly 7 digits';
    }

    if (!formData.major) tempErrors.major = 'Please select a major';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !authSession?.user?.id) return;

    setIsSubmitting(true);
    try {
      // Pass the email from the auth session
      await insertUserProfile(authSession.user.id, {
        ...formData,
        email: authSession.user.email
      });
      
      showToast('Profile completed successfully!', 'success');
      // Hard redirect to force AppContext to re-fetch the user profile
      window.location.href = '/dashboard';
    } catch (err) {
      showToast(err.message || 'Failed to save profile. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (!authSession || currentUser) return null;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconWrapperStyle}>
            <User size={32} color="#f59e0b" />
          </div>
          <h1 style={titleStyle}>Complete Your Profile</h1>
          <p style={subtitleStyle}>
            Welcome! Please provide a few more details to activate your student account.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Profile Photo Upload */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Profile Photo</label>
            <UploadImage
              currentImageUrl={formData.photo}
              onImageUploaded={handlePhotoUploaded}
              userId={authSession.user.id}
            />
          </div>

          <div style={gridStyle}>
            <Input
              label="Full Name *"
              name="name"
              icon={User}
              placeholder="e.g. Ahmed Ali"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
            />
            
            <Input
              label="Student ID *"
              name="studentId"
              icon={FileText}
              placeholder="e.g. 3456788"
              value={formData.studentId}
              onChange={handleInputChange}
              error={errors.studentId}
            />
          </div>

          <div style={gridStyle}>
            <Select
              label="Academic Major *"
              name="major"
              options={majors.map(m => ({ value: m, label: m }))}
              value={formData.major}
              onChange={handleInputChange}
              error={errors.major}
            />
            
            <Input
              label="Phone Number"
              name="phone"
              icon={Smartphone}
              placeholder="e.g. +60 11-1234 5678"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            icon={ArrowRight}
            style={{ marginTop: '20px' }}
          >
            Complete Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── Inline Styles ────────────────────────
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
  padding: '20px',
  fontFamily: "'Inter', sans-serif",
};

const containerStyle = {
  width: '100%',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
  padding: '40px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
};

const iconWrapperStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  backgroundColor: 'rgba(245, 158, 11, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 10px 0',
};

const subtitleStyle = {
  fontSize: '15px',
  color: '#64748b',
  margin: 0,
  lineHeight: '1.5',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
};

const sectionStyle = {
  marginBottom: '10px',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '8px',
};

export default Onboarding;
