import { useState } from 'react';
import './SkillsInput.css';

const SkillsInput = ({ skills, setSkills }) => {
  const [input, setInput] = useState('');

  const addSkill = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      setSkills([...skills, input.trim()]);
      setInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="skills-input-container">
      <div className="skills-tags">
        {skills.map(skill => (
          <span key={skill} className="skill-tag">
            {skill}
            <button 
              type="button" 
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="skills-input-row">
        <input
          type="text"
          value={input}
          placeholder="Add a skill and press Enter"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          type="button" 
          className="btn-primary" 
          onClick={addSkill}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SkillsInput;