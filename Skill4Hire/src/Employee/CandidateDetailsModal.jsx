"use client";
import { RiCloseLine, RiMailLine, RiMapPinLine, RiUserLine, RiBriefcaseLine, RiBookLine, RiDownloadLine, RiThumbUpLine } from "react-icons/ri";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="info-row">
    <div className="info-icon">{Icon ? <Icon /> : null}</div>
    <div className="info-content">
      <div className="info-label">{label}</div>
      <div className="info-value">{value || '—'}</div>
    </div>
  </div>
);

const Pill = ({ children }) => (
  <span className="pill">{children}</span>
);

const CandidateDetailsModal = ({ isOpen, onClose, candidate, onDownloadCv, onRecommend }) => {
  if (!isOpen || !candidate) return null;

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  // Experience rendering helper
  const renderExperience = (exp) => {
    if (!exp) return <div className="muted">No experience listed</div>;
    const { yearsOfExperience, positions } = exp;
    return (
      <div>
        <div><strong>Years of Experience:</strong> {yearsOfExperience || '—'}</div>
        {Array.isArray(positions) && positions.length > 0 && (
          <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
            {positions.map((pos, idx) => (
              <li key={idx}>
                <strong>{pos.title || 'Role'}:</strong> {pos.company || ''} {pos.startDate ? `(${pos.startDate} - ${pos.endDate || 'Present'})` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay modal-overlay--center" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="avatar-lg">
              {candidate.profilePictureUrl ? (
                <img src={candidate.profilePictureUrl} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <RiUserLine />
              )}
            </div>
            <div>
              <h3>{candidate.name || 'Candidate'}</h3>
              <div className="muted">{candidate.title || '—'}</div>
              {candidate.location && <div className="muted">{candidate.location}</div>}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="details-col">
              <InfoRow icon={RiMapPinLine} label="Location" value={candidate.location} />
              <InfoRow icon={RiBriefcaseLine} label="CV" value={candidate.resumePath ? 'Available' : 'Not uploaded'} />
              {candidate.resumePath && (
                <button className="btn btn-link" onClick={onDownloadCv} style={{ margin: '0.5rem 0' }}>
                  <RiDownloadLine /> Download Resume
                </button>
              )}
              <div style={{ marginTop: '1rem' }}>
                <div className="section-title">Experience</div>
                {renderExperience(candidate.experience)}
              </div>
            </div>
            <div className="details-col">
              <div className="section">
                <div className="section-title">Skills</div>
                <div className="skills-list">
                  {skills.length === 0 ? (
                    <div className="muted">No skills listed</div>
                  ) : (
                    skills.map((s) => <Pill key={s}>{s}</Pill>)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-secondary" onClick={onDownloadCv} disabled={!candidate.resumePath} title={candidate.resumePath ? 'Download Resume' : 'No resume available'}>
            <RiDownloadLine /> Download Resume
          </button>
          <button className="btn btn-primary" onClick={onRecommend}>
            <RiThumbUpLine /> Recommend
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
