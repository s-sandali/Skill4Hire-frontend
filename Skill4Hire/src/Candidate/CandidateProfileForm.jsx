import { useState, useEffect } from 'react';
import SkillsInput from './SkillsInput';
import ResumeUpload from './ResumeUpload';

const CandidateProfileForm = ({ existingProfile, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');

  // Update form fields when existingProfile changes
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name || '');
      setEmail(existingProfile.email || '');
      setEducation(existingProfile.education || '');
      setExperience(existingProfile.experience || '');
      setSkills(existingProfile.skills || []);
      setResume(existingProfile.resume || null);
      setLocation(existingProfile.location || '');
      setTitle(existingProfile.title || '');
    }
  }, [existingProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = { 
      name, 
      email, 
      education, 
      experience, 
      skills, 
      resume,
      location,
      title
    };
    onSave(profileData);
  };

  return (
    <form className="candidate-profile-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <label>Full Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />

        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <label>Professional Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g. Frontend Developer"
        />

        <label>Location</label>
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. San Francisco, CA"
        />

        <label>Education</label>
        <textarea 
          value={education} 
          onChange={(e) => setEducation(e.target.value)} 
          placeholder="List your educational background"
          rows="3"
        />

        <label>Experience</label>
        <textarea 
          value={experience} 
          onChange={(e) => setExperience(e.target.value)} 
          placeholder="Describe your work experience"
          rows="4"
        />

        <label>Skills</label>
        <SkillsInput skills={skills} setSkills={setSkills} />

        <label>Resume</label>
        <ResumeUpload resume={resume} setResume={setResume} />

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Profile</button>
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
  );
};

export default CandidateProfileForm;