import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const { register } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email';
    }

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
    const success = await register(formData.email, formData.password);
    setIsSubmitting(false);
    
    if (success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={successIconWrapper}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <h2 style={successTitle}>Registration Successful!</h2>
            <p style={successText}>
              Your account has been created. Please log in to complete your profile.
            </p>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => navigate('/login')}
              style={{ marginTop: '20px' }}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={iconWrapperStyle}>
            <User size={32} color="#f59e0b" />
          </div>
          <h1 style={titleStyle}>Create an Account</h1>
          <p style={subtitleStyle}>Join the Sudanese Student Hub today!</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <Input
            label="Email Address *"
            name="email"
            type="email"
            icon={Mail}
            placeholder="e.g. ahmed@example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
          />

          <Input
            label="Password *"
            name="password"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
          />

          <Input
            label="Confirm Password *"
            name="confirmPassword"
            type="password"
            icon={Lock}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            icon={ArrowRight}
            style={{ marginTop: '10px' }}
          >
            Register
          </Button>

          <p style={footerTextStyle}>
            Already have an account?{' '}
            <Link to="/login" style={linkStyle}>Log in here</Link>
          </p>
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
  maxWidth: '450px',
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
  gap: '16px',
};

const footerTextStyle = {
  textAlign: 'center',
  fontSize: '14px',
  color: '#64748b',
  marginTop: '10px',
};

const linkStyle = {
  color: '#f59e0b',
  fontWeight: '600',
  textDecoration: 'none',
};

const successIconWrapper = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px'
};

const successTitle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1e293b',
  marginBottom: '10px'
};

const successText = {
  color: '#64748b',
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '30px'
};

export default Register;
