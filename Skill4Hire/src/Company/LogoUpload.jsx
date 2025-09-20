import { useState } from 'react';
import './LogoUpload.css';

const LogoUpload = ({ logo, logoPreview, onLogoChange, onLogoRemove }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onLogoChange({ target: { files } });
    }
  };

  const handleFileInputChange = (e) => {
    onLogoChange(e);
  };

  return (
    <div className="logo-upload">
      <label className="logo-label">Company Logo</label>
      <div 
        className={`logo-upload-container ${dragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {logoPreview ? (
          <div className="logo-preview">
            <img src={logoPreview} alt="Company Logo" className="logo-image" />
            <div className="logo-overlay">
              <button 
                type="button" 
                className="remove-logo-btn"
                onClick={onLogoRemove}
                title="Remove logo"
              >
                ×
              </button>
              <button 
                type="button" 
                className="change-logo-btn"
                onClick={() => document.getElementById('logo-upload-input').click()}
                title="Change logo"
              >
                📷
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="logo-upload-placeholder"
            onClick={() => document.getElementById('logo-upload-input').click()}
          >
            <div className="upload-icon">📷</div>
            <p className="upload-text">Upload Company Logo</p>
            <p className="upload-subtext">
              Drag & drop or click to select
            </p>
            <p className="upload-formats">
              Supports: JPG, PNG, SVG (Max 5MB)
            </p>
          </div>
        )}
        
        <input
          type="file"
          id="logo-upload-input"
          accept="image/*"
          onChange={handleFileInputChange}
          className="logo-input"
          style={{ display: 'none' }}
        />
      </div>
      
      {logo && (
        <div className="logo-info">
          <p className="file-name">📁 {logo.name}</p>
          <p className="file-size">
            {(logo.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;