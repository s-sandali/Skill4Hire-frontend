import { useState } from 'react';
import SkillsInput from './SkillsInput';
import ResumeUpload from './ResumeUpload';

const CandidateProfileForm = ({ existingProfile, onSave, onDelete }) => {
  const [name, setName] = useState(existingProfile?.name || '');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [education, setEducation] = useState(existingProfile?.education || '');
  const [experience, setExperience] = useState(existingProfile?.experience || '');
  const [skills, setSkills] = useState(existingProfile?.skills || []);
  const [resume, setResume] = useState(existingProfile?.resume || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = { name, email, education, experience, skills, resume };
    onSave(profileData);
  };

  return (
    <form className="candidate-profile-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Education</label>
        <textarea value={education} onChange={(e) => setEducation(e.target.value)} />

        <label>Experience</label>
        <textarea value={experience} onChange={(e) => setExperience(e.target.value)} />

        <label>Skills</label>
        <SkillsInput skills={skills} setSkills={setSkills} />

        <label>Resume</label>
        <ResumeUpload resume={resume} setResume={setResume} />

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save / Update</button>
          {existingProfile && (
            <button type="button" className="btn-secondary" onClick={() => onDelete(existingProfile.id)}>Delete</button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CandidateProfileForm;
