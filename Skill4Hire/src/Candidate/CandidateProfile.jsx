import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { candidateService } from '../services/candidateService';

const CandidateProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: '',
    phone: '',
    education: '',
    experience: [],
    skills: [],
    profileScore: 0,
    applications: 0,
    interviews: 0
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await candidateService.getCandidateProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    fetchProfile();
  }, []);

  // Calculate profile score based on completed fields
  const calculateProfileScore = (profileData) => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.location,
      profileData.phone,
      profileData.education,
      profileData.skills?.length,
      profileData.experience?.length
    ];
    const filledFields = fields.filter(field => field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div className="profile-overview">
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <h1 className="profile-name">{profile.name || 'Add Your Name'}</h1>
          </div>
          <div className="profile-actions">
            <Link to="/candidate/edit" className="edit-profile-btn">
              <FiEdit2 /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
              />
              <path d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                strokeDasharray={`${calculateProfileScore(profile)}, 100`}
              />
            </svg>
            <div className="stat-circle-value">{calculateProfileScore(profile)}%</div>
          </div>
          <div className="label">Profile Score</div>
        </div>
        <div className="stat-item">
          <div className="value">{profile.applications || 0}</div>
          <div className="label">Applications</div>
        </div>
        <div className="stat-item">
          <div className="value">{profile.interviews || 0}</div>
          <div className="label">Interviews</div>
        </div>
      </div>

      <div className="profile-info-section">
        <h2>Personal Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="label">Full Name</div>
            <div className="value">{profile.name || 'Not specified'}</div>
          </div>
          <div className="info-item">
            <div className="label">Email</div>
            <div className="value">{profile.email || 'Not specified'}</div>
          </div>
          <div className="info-item">
            <div className="label">Location</div>
            <div className="value">{profile.location || 'Not specified'}</div>
          </div>
          <div className="info-item">
            <div className="label">Phone</div>
            <div className="value">{profile.phone || 'Not specified'}</div>
          </div>
        </div>

        <div className="education-section">
          <h2>Education</h2>
          <div className="section-content">
            {profile.education || 'No education details added yet'}
          </div>
        </div>

        {profile.skills?.length > 0 && (
          <div className="skills-section">
            <h2>Skills</h2>
            <div className="skills-grid">
              {profile.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {profile.experience?.length > 0 && (
          <div className="experience-section">
            <h2>Experience</h2>
            <div className="section-content">
              {profile.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h3>{exp.title}</h3>
                  <p className="company">{exp.company}</p>
                  <p className="duration">{exp.period}</p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;