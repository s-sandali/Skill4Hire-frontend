import { useState, useEffect } from 'react';
import CompanyDashboard from './CompanyDashboard';
import './CompanyProfilePage.css';

const CompanyProfilePage = () => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing profile (mock data for now)
  useEffect(() => {
    // TODO: Replace with actual API call
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Mock existing profile data
        const mockProfile = {
          id: 1,
          companyName: "TechCorp Solutions",
          email: "hr@techcorp.com",
          website: "https://www.techcorp.com",
          location: "San Francisco, CA",
          industry: "Technology",
          companySize: "51-200",
          description: "Leading technology solutions provider",
          logo: null,
          foundedYear: "2010",
          contactPerson: "Jane Smith",
          phone: "+1 (555) 123-4567"
        };
        
        // Simulate API delay
        setTimeout(() => {
          setCompanyProfile(mockProfile);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async (profileData) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // TODO: Replace with actual API call
      console.log('Saving profile:', profileData);
      
      // Simulate API call
      setTimeout(() => {
        setCompanyProfile({ ...profileData, id: companyProfile?.id || Date.now() });
        setMessage('Profile saved successfully!');
        setIsLoading(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      // TODO: Replace with actual API call
      console.log('Deleting profile:', profileId);
      
      // Simulate API call
      setTimeout(() => {
        setCompanyProfile(null);
        setMessage('Profile deleted successfully!');
        setIsLoading(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage('Error deleting profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="company-profile-page">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <CompanyDashboard
        existingProfile={companyProfile}
        onSave={handleSaveProfile}
        onDelete={handleDeleteProfile}
      />
    </div>
  );
};

export default CompanyProfilePage;