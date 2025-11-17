"use client";
import { RiCloseLine, RiMailLine, RiMapPinLine, RiUserLine, RiBriefcaseLine, RiBookLine, RiDownloadLine, RiThumbUpLine, RiPhoneLine } from "react-icons/ri";

const InfoRow = ({ icon: Icon, label, value, children }) => (
    <div className="info-row" style={{
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '1rem',
      padding: '0.5rem 0'
    }}>
      <div className="info-icon" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        marginRight: '12px',
        flexShrink: 0
      }}>
        {Icon ? <Icon style={{ fontSize: '18px' }} /> : null}
      </div>
      <div className="info-content" style={{ flex: 1 }}>
        <div className="info-label" style={{
          fontSize: '0.875rem',
          color: '#64748b',
          fontWeight: 500,
          marginBottom: '2px'
        }}>
          {label}
        </div>
        <div className="info-value" style={{
          fontSize: '1rem',
          color: '#1e293b',
          fontWeight: 400
        }}>
          {value || children || '—'}
        </div>
      </div>
    </div>
);

const Pill = ({ children }) => (
    <span className="pill" style={{
      display: 'inline-block',
      padding: '6px 12px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 500,
      margin: '0 8px 8px 0',
      border: '1px solid #e2e8f0'
    }}>
    {children}
  </span>
);

const CandidateDetailsModal = ({ isOpen, onClose, candidate, onDownloadCv, onRecommend }) => {
  if (!isOpen || !candidate) return null;

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  // Experience rendering helper
  const renderExperience = (exp) => {
    if (!exp) return <div style={{ color: '#64748b', fontStyle: 'italic' }}>No experience listed</div>;
    const { yearsOfExperience, positions } = exp;
    return (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Years of Experience:</strong> {yearsOfExperience || '—'}
          </div>
          {Array.isArray(positions) && positions.length > 0 && (
              <ul style={{
                margin: '0.5rem 0 0 1rem',
                padding: 0,
                listStyleType: 'disc'
              }}>
                {positions.map((pos, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <strong>{pos.title || 'Role'}:</strong> {pos.company || ''} {pos.startDate ? `(${pos.startDate} - ${pos.endDate || 'Present'})` : ''}
                    </li>
                ))}
              </ul>
          )}
        </div>
    );
  };

  const renderEducation = (edu) => {
    if (!edu) return <div style={{ color: '#64748b', fontStyle: 'italic' }}>No education listed</div>;
    const { degree, institution, graduationYear } = edu;
    return (
        <div>
          {degree && <div style={{ marginBottom: '0.25rem' }}><strong>Degree:</strong> {degree}</div>}
          {institution && <div style={{ marginBottom: '0.25rem' }}><strong>Institution:</strong> {institution}</div>}
          {graduationYear && <div><strong>Graduation:</strong> {graduationYear}</div>}
        </div>
    );
  };

  const avatarWrapperStyle = {
    width: 96,
    height: 96,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #e2e8f0',
    flexShrink: 0
  };

  const avatarImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  };

  const resumeAvailable = Boolean(candidate.resumePath);
  const downloadHref = candidate.candidateId ? `/api/companies/candidates/${candidate.candidateId}/cv` : undefined;

  return (
      <div className="modal-overlay modal-overlay--center" onClick={onClose} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div className="modal modal--wide" onClick={(e) => e.stopPropagation()} style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="modal-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.5rem 1.5rem 0',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1.5rem'
          }}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div className="avatar-lg" style={avatarWrapperStyle}>
                {candidate.profilePictureUrl ? (
                    <img src={candidate.profilePictureUrl} alt={candidate.name} style={avatarImgStyle} />
                ) : (
                    <RiUserLine style={{ fontSize: '2.5rem', color: '#64748b' }} />
                )}
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  {candidate.name || 'Candidate'}
                </h3>
                <div style={{
                  color: '#475569',
                  fontSize: '1.125rem',
                  marginBottom: '4px'
                }}>
                  {candidate.title || '—'}
                </div>
                {candidate.location && (
                    <div style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <RiMapPinLine /> {candidate.location}
                    </div>
                )}
              </div>
            </div>
            <button className="close-btn" onClick={onClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <RiCloseLine />
            </button>
          </div>

          <div className="modal-body" style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1
          }}>
            <div className="details-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem'
            }}>
              <div className="details-col">
                <InfoRow icon={RiMailLine} label="Email" value={candidate.email} />
                <InfoRow icon={RiPhoneLine} label="Phone" value={candidate.phoneNumber} />
                <InfoRow icon={RiBriefcaseLine} label="Resume">
                  {resumeAvailable ? (
                      <a
                          href={downloadHref}
                          onClick={(e) => {
                            if (onDownloadCv) {
                              e.preventDefault();
                              onDownloadCv();
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                          title="Download Resume"
                      >
                        <RiDownloadLine /> Download Resume
                      </a>
                  ) : (
                      'Not uploaded'
                  )}
                </InfoRow>

                <div style={{ marginTop: '1.5rem' }}>
                  <div className="section-title" style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Experience
                  </div>
                  {renderExperience(candidate.experience)}
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <div className="section-title" style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Education
                  </div>
                  {renderEducation(candidate.education)}
                </div>
              </div>

              <div className="details-col">
                <div className="section">
                  <div className="section-title" style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Skills
                  </div>
                  <div className="skills-list" style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {skills.length === 0 ? (
                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>No skills listed</div>
                    ) : (
                        skills.map((s) => <Pill key={s}>{s}</Pill>)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{
            padding: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button className="btn btn-secondary" onClick={onClose} style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Close
            </button>
            <button className="btn btn-primary" onClick={onRecommend} style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <RiThumbUpLine /> Recommend
            </button>
          </div>
        </div>
      </div>
  );
};

export default CandidateDetailsModal;