import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Lock, FileText, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Card from '../components/Card';
import UploadImage from '../components/UploadImage';

const Register = () => {
  const { register } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    major: '',
    photo: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email';
    }

    if (!formData.major) tempErrors.major = 'Please select a major';
    
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const success = await register(formData);
    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
    }
  };

  return (
    <div style={pageStyle} className="gradient-bg">
      <div style={glowBall1Style} />
      <div style={glowBall2Style} />

      <div style={containerStyle}>
        <Card style={registerCardStyle} padding="none">
          <div style={logoSectionStyle}>
            <Link to="/login" style={backButtonStyle}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
            <h2 style={portalTitleStyle}>Student Registration</h2>
            <p style={portalSubStyle}>Join the Sudanese Student Association</p>
          </div>

          <div style={formSectionStyle}>
            {isSuccess ? (
              <div style={successContainerStyle}>
                <CheckCircle2 size={64} color="var(--success)" style={successIconStyle} />
                <h3 style={successTitleStyle}>Registration Completed!</h3>
                <p style={successDescStyle}>
                  Welcome, <strong>{formData.name}</strong>. Your account has been registered successfully.
                </p>
                <div style={alertBoxStyle}>
                  <strong>Instant Login Clearance:</strong> Your profile is immediately active. You can sign in using your Student ID (<code>{formData.studentId}</code>) and your selected password.
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Proceed to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={formStyle}>
                <div style={gridRowStyle}>
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    icon={User}
                    required
                  />
                  <Input
                    label="Student ID"
                    name="studentId"
                    placeholder="e.g. 2310087"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    error={errors.studentId}
                    icon={FileText}
                    required
                  />
                </div>

                <div style={gridRowStyle}>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="e.g. name@student.aiu.edu.my"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    icon={Mail}
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    placeholder="e.g. +60 11-1234 5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    icon={Smartphone}
                  />
                </div>

                <div style={gridRowStyle}>
                  <Select
                    label="Academic Major"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    options={majors}
                    error={errors.major}
                    required
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={photoLabelStyle}>Profile Photo</label>
                    <UploadImage
                      label=""
                      onImageSelected={handlePhotoUploaded}
                      defaultImage={formData.photo}
                    />
                  </div>
                </div>

                <div style={gridRowStyle}>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="At least 6 chars"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    icon={Lock}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    icon={Lock}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  Register Account
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  position: 'relative',
  overflowY: 'auto',
  fontFamily: 'var(--font-body)'
};

const glowBall1Style = {
  position: 'absolute',
  top: '-10%',
  left: '-10%',
  width: '50vw',
  height: '50vw',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(212, 160, 23, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
  pointerEvents: 'none'
};

const glowBall2Style = {
  position: 'absolute',
  bottom: '-10%',
  right: '-10%',
  width: '50vw',
  height: '50vw',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(15, 118, 110, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
  pointerEvents: 'none'
};

const containerStyle = {
  width: '100%',
  maxWidth: '680px',
  zIndex: 10,
  margin: '40px 0'
};

const registerCardStyle = {
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.4)'
};

const logoSectionStyle = {
  padding: '24px 32px',
  background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.04) 0%, rgba(212, 160, 23, 0.04) 100%)',
  borderBottom: '1px solid var(--gray-100)',
  position: 'relative',
  textAlign: 'center'
};

const backButtonStyle = {
  position: 'absolute',
  left: '24px',
  top: '28px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: 'var(--gray-500)',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '600',
  transition: 'color 0.15s ease'
};

const portalTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--primary)',
  marginTop: '12px'
};

const portalSubStyle = {
  fontSize: '11px',
  color: 'var(--secondary)',
  fontWeight: '650',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginTop: '2px'
};

const formSectionStyle = {
  padding: '32px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const gridRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const photoLabelStyle = {
  fontSize: '14px',
  fontWeight: '550',
  color: 'var(--dark-light)',
  textAlign: 'left'
};

const successContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '16px 0'
};

const successIconStyle = {
  marginBottom: '16px',
  animation: 'spin-bounce 0.5s ease-out'
};

const successTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '22px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const successDescStyle = {
  fontSize: '14px',
  color: 'var(--dark-light)',
  marginTop: '8px',
  lineHeight: '1.4'
};

const alertBoxStyle = {
  backgroundColor: 'var(--success-light)',
  border: '1.5px solid rgba(16, 185, 129, 0.25)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  color: 'var(--primary)',
  fontSize: '13px',
  textAlign: 'left',
  lineHeight: '1.4',
  margin: '20px 0',
  boxShadow: 'var(--shadow-sm)'
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    @media (max-width: 640px) {
      div[style*="gridRowStyle"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Register;
