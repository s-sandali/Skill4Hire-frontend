import { useState } from 'react';

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

  return (
    <div className="skills-input">
      <div className="skills-tags">
        {skills.map(skill => (
          <span key={skill} className="skill-tag">
            {skill} <button type="button" onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder="Add a skill"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
      />
      <button type="button" className="btn-primary small" onClick={addSkill}>Add</button>
    </div>
  );
};

export default SkillsInput;
