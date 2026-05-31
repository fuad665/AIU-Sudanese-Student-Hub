import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

const UploadImage = ({
  onImageSelected,
  defaultImage = null,
  label = 'Upload Profile Photo',
  className = ''
}) => {
  const [preview, setPreview] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local URL preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      
      // Simulate premium mock upload
      setIsUploading(true);
      setUploaded(false);
      setTimeout(() => {
        setIsUploading(false);
        setUploaded(true);
        if (onImageSelected) {
          // Pass base64 or local URL back to state context
          onImageSelected(localUrl);
        }
      }, 1500);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}
      
      <div style={boxStyle} onClick={triggerSelect}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {preview ? (
          <div style={previewContainerStyle}>
            <img src={preview} alt="Upload Preview" style={previewImageStyle} />
            <div style={overlayStyle}>
              {isUploading ? (
                <div style={spinnerStyle} />
              ) : uploaded ? (
                <div style={successOverlayStyle}>
                  <CheckCircle2 color="var(--success)" size={32} />
                  <span style={successTextStyle}>Upload Success!</span>
                </div>
              ) : (
                <span style={changePhotoTextStyle}>Change Photo</span>
              )}
            </div>
          </div>
        ) : (
          <div style={uploadPlaceholderStyle}>
            <Upload size={32} color="var(--gray-400)" />
            <span style={instructionStyle}>Click to browse photo</span>
            <span style={subInstructionStyle}>Supports PNG, JPG (Max 5MB)</span>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: '100%',
  fontFamily: 'var(--font-body)'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const boxStyle = {
  width: '100%',
  height: '140px',
  border: '2px dashed var(--gray-300)',
  borderRadius: 'var(--radius-lg)',
  backgroundColor: 'var(--gray-50)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  position: 'relative'
};

const previewContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const previewImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(30, 41, 59, 0.4)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease'
};

// CSS class handles opacity hover
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    div[onClick]:hover div {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

const changePhotoTextStyle = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '500',
  padding: '6px 12px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 'var(--radius-sm)'
};

const successOverlayStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  justifyContent: 'center'
};

const successTextStyle = {
  color: 'var(--primary)',
  fontWeight: '600',
  fontSize: '13px'
};

const uploadPlaceholderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  textAlign: 'center'
};

const instructionStyle = {
  fontSize: '13px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const subInstructionStyle = {
  fontSize: '11px',
  color: 'var(--gray-400)'
};

const spinnerStyle = {
  width: '24px',
  height: '24px',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  borderTop: '3px solid #ffffff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite'
};

export default UploadImage;
