import { useState } from 'react';
import { Link } from 'react-router-dom';
import brainLogo from '../assets/brain-logo.jpg';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    {
      id: 'candidate',
      title: 'Candidate',
      icon: '👤',
      description: 'I am looking for job opportunities and want to showcase my skills',
      features: ['Create professional profile', 'Upload CV & Portfolio', 'Get matched with jobs', 'Track applications'],
      color: '#4F46E5'
    },
    {
      id: 'company',
      title: 'Company',
      icon: '🏢',
      description: 'I represent a company and want to find talented professionals',
      features: ['Post job openings', 'Browse candidate profiles', 'Manage applications', 'Schedule interviews'],
      color: '#059669'
    },
    {
      id: 'employee',
      title: 'Employee',
      icon: '👥',
      description: 'I am an employee and want to refer candidates or manage hiring',
      features: ['Refer candidates', 'Manage team hiring', 'Access company tools', 'Track referrals'],
      color: '#DC2626'
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: '⚙️',
      description: 'I need administrative access to manage the platform',
      features: ['Platform management', 'User oversight', 'System configuration', 'Analytics dashboard'],
      color: '#7C3AED'
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
                {selectedRole === role.id ? '✓ Selected' : 'Click to select'}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="role-actions">
          <Link to="/" className="btn-secondary">
            ← Back to Home
          </Link>
          
          {selectedRole && (
            <Link 
              to={`/register/${selectedRole}`} 
              className="btn-primary"
            >
              Continue as {roles.find(r => r.id === selectedRole)?.title} →
            </Link>
          )}
        </div>

        {/* Help Text */}
        <div className="role-help">
          <p>
            <strong>Not sure which role to choose?</strong><br />
            • <strong>Candidate:</strong> If you're looking for job opportunities<br />
            • <strong>Company:</strong> If you're hiring for your organization<br />
            • <strong>Employee:</strong> If you work for a company and want to refer candidates<br />
            • <strong>Admin:</strong> If you need administrative platform access
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
