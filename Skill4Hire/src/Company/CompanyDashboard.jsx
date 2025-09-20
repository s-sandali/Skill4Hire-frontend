import { useState, useEffect } from 'react';
import LogoUpload from './LogoUpload';
import './CompanyDashboard.css';

const CompanyDashboard = ({ existingProfile, onSave, onDelete }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [foundedYear, setFoundedYear] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  // Update form fields when existingProfile changes
  useEffect(() => {
    if (existingProfile) {
      setCompanyName(existingProfile.companyName || '');
      setEmail(existingProfile.email || '');
      setWebsite(existingProfile.website || '');
      setLocation(existingProfile.location || '');
      setIndustry(existingProfile.industry || '');
      setCompanySize(existingProfile.companySize || '');
      setDescription(existingProfile.description || '');
      setLogo(existingProfile.logo || null);
      setLogoPreview(existingProfile.logo || null);
      setFoundedYear(existingProfile.foundedYear || '');
      setContactPerson(existingProfile.contactPerson || '');
      setPhone(existingProfile.phone || '');
    }
  }, [existingProfile]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = { 
      companyName,
      email,
      website,
      location,
      industry,
      companySize,
      description,
      logo: logoPreview, // Use logoPreview (data URL) instead of logo (File object)
      foundedYear,
      contactPerson,
      phone
    };
    onSave(profileData);
  };

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Company Profile</h1>
        <p className="dashboard-subtitle">Create and manage your company profile</p>
      </div>

      <form className="company-profile-form" onSubmit={handleSubmit}>
        <div className="form-card">
          {/* Logo Upload Section */}
          <LogoUpload
            logo={logo}
            logoPreview={logoPreview}
            onLogoChange={handleLogoChange}
            onLogoRemove={handleRemoveLogo}
          />

          {/* Company Information */}
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input 
                type="text" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                required 
                placeholder="Enter company name"
              />
            </div>
            <div className="form-group">
              <label>Industry *</label>
              <select 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)} 
                required
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="company@example.com"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input 
                type="url" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)} 
                placeholder="https://www.company.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
                placeholder="City, Country"
              />
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select 
                value={companySize} 
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Founded Year</label>
              <input 
                type="number" 
                value={foundedYear} 
                onChange={(e) => setFoundedYear(e.target.value)} 
                placeholder="e.g. 2010"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input 
                type="text" 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
                placeholder="HR Manager / Recruiter Name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label>Company Description *</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your company, culture, and what makes you unique..."
              rows="5"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
            {existingProfile && existingProfile.id && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => onDelete(existingProfile.id)}
              >
                Delete Profile
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyDashboard;