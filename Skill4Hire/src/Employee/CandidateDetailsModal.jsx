"use client";
import {
  RiCloseLine,
  RiMailLine,
  RiMapPinLine,
  RiUserLine,
  RiBriefcaseLine,
  RiDownloadLine,
  RiThumbUpLine,
  RiPhoneLine
} from "react-icons/ri";

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
  const experience = candidate.experience || {};
  const education = candidate.education || {};
  const hasExperienceDetails = Boolean(
    experience && (experience.isExperienced || experience.role || experience.company || experience.yearsOfExperience)
  );
  const hasEducationDetails = Boolean(
    education && (education.degree || education.institution || education.graduationYear)
  );
  const resumeLabel = candidate.hasCv
    ? (candidate.resumeFileName || "Available")
    : "Not uploaded";
  const experienceLines = [];
  if (experience.role) experienceLines.push(experience.role);
  if (experience.company) experienceLines.push(experience.company);
  if (typeof experience.yearsOfExperience === "number") {
    experienceLines.push(`${experience.yearsOfExperience} yrs experience`);
  }

  const educationLines = [];
  if (education.degree) educationLines.push(education.degree);
  if (education.institution) educationLines.push(education.institution);
  if (education.graduationYear) educationLines.push(`Class of ${education.graduationYear}`);

  const phoneValue = candidate.phoneNumber || candidate.phone || "";

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
              {candidate.headline && <div className="muted" style={{ marginTop: '0.25rem' }}>{candidate.headline}</div>}
              {candidate.location && <div className="muted">{candidate.location}</div>}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="details-col">
              <InfoRow
                icon={RiMailLine}
                label="Email"
                value={candidate.email ? (
                  <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                ) : null}
              />
              <InfoRow
                icon={RiPhoneLine}
                label="Phone"
                value={phoneValue || null}
              />
              <InfoRow icon={RiMapPinLine} label="Location" value={candidate.location} />
              <InfoRow icon={RiBriefcaseLine} label="Resume" value={resumeLabel} />
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
              <div className="section">
                <div className="section-title">Experience</div>
                {hasExperienceDetails ? (
                  <div className="muted">
                    {experienceLines.map((line, idx) => (
                      <div key={`${line}-${idx}`}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <div className="muted">No experience listed</div>
                )}
              </div>
              <div className="section">
                <div className="section-title">Education</div>
                {hasEducationDetails ? (
                  <div className="muted">
                    {educationLines.map((line, idx) => (
                      <div key={`${line}-${idx}`}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <div className="muted">No education listed</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-secondary" onClick={onDownloadCv} disabled={!candidate.hasCv} title={candidate.hasCv ? 'Download CV' : 'No CV available'}>
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
