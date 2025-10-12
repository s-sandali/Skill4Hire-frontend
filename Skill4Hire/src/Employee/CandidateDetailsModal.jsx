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
  const exp = candidate.experience || {};
  const edu = candidate.education || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="avatar-lg"><RiUserLine /></div>
            <div>
              <h3>{candidate.name || 'Candidate'}</h3>
              <div className="muted">{candidate.title || candidate.position || '—'}</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="details-col">
              <InfoRow icon={RiMailLine} label="Email" value={candidate.email} />
              <InfoRow icon={RiMapPinLine} label="Location" value={candidate.location} />
              <InfoRow icon={RiBriefcaseLine} label="Experience" value={exp.isExperienced ? `${exp.yearsOfExperience || 0} years • ${exp.role || ''} ${exp.company ? 'at ' + exp.company : ''}` : 'No experience listed'} />
              <InfoRow icon={RiBookLine} label="Education" value={edu.degree ? `${edu.degree} • ${edu.institution || ''} ${edu.graduationYear ? '(' + edu.graduationYear + ')' : ''}` : '—'} />
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
          <button className="btn btn-secondary" onClick={onDownloadCv}>
            <RiDownloadLine /> Download CV
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

