import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, 
  FiBriefcase, 
  FiUsers,
  FiArrowLeft,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';
import brainLogo from '../assets/brain-logo.jpg';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    {
      id: 'candidate',
      title: 'Candidate',
      icon: <FiUser size={32} />,
      description: 'I am looking for job opportunities and want to showcase my skills',
      features: ['Create professional profile', 'Upload CV & Portfolio', 'Get matched with jobs', 'Track applications'],
      color: '#4F46E5'
    },
    {
      id: 'company',
      title: 'Company',
      icon: <FiBriefcase size={32} />,
      description: 'I represent a company and want to find talented professionals',
      features: ['Post job openings', 'Browse candidate profiles', 'Manage applications', 'Schedule interviews'],
      color: '#059669'
    },
    {
      id: 'employee',
      title: 'Employee',
      icon: <FiUsers size={32} />,
      description: 'I am an employee and want to refer candidates or manage hiring',
      features: ['Refer candidates', 'Manage team hiring', 'Access company tools', 'Track referrals'],
      color: '#DC2626'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  return (
    <div className="role-selection">
      <div className="role-container">
        {/* Header */}
        <div className="role-header">
          <div className="logo-section">
            <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="role-logo" />
            <h1>Choose Your Role</h1>
          </div>
          <p className="role-subtitle">Select the role that best describes you to get started</p>
        </div>

        {/* Role Cards */}
        <div className="roles-grid">
          {roles.map(role => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
              style={{ '--role-color': role.color }}
            >
              <div className="role-icon">{role.icon}</div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-description">{role.description}</p>
              
              <div className="role-features">
                <h4>What you can do:</h4>
                <ul>
                  {role.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="role-selection-indicator">
                {selectedRole === role.id ? (
                  <>
                    <FiCheck style={{marginRight: '6px'}} /> Selected
                  </>
                ) : (
                  'Click to select'
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="role-actions">
          <Link to="/" className="btn-secondary">
            <FiArrowLeft style={{marginRight: '8px'}} /> Back to Home
          </Link>
          
          {selectedRole && (
            <Link 
              to={`/register/${selectedRole}`} 
              className="btn-primary"
            >
              Continue as {roles.find(r => r.id === selectedRole)?.title} 
              <FiArrowRight style={{marginLeft: '8px'}} />
            </Link>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default RoleSelection;