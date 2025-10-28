import PropTypes from 'prop-types';
import brainLogo from '../assets/brain-logo.jpg';

const PortalLogoBadge = ({ size = 72, imageScale = 0.7, alt = 'Skill4Hire logo', className = '', style = {} }) => {
  const numericSize = Number(size) || 72;
  const clampedScale = imageScale > 0 && imageScale <= 1 ? imageScale : 0.7;
  const imageSize = Math.round(numericSize * clampedScale);

  const combinedBadgeStyle = {
    width: `${numericSize}px`,
    height: `${numericSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${Math.max(12, Math.round(numericSize * 0.18))}px`,
    backgroundImage: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    boxShadow: '0 18px 40px rgba(37, 99, 235, 0.18)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    ...style,
  };

  const imageStyle = {
    width: `${imageSize}px`,
    height: `${imageSize}px`,
    objectFit: 'contain',
  };

  return (
    <div className={`portal-logo-badge ${className}`.trim()} style={combinedBadgeStyle}>
      <img src={brainLogo} alt={alt} style={imageStyle} />
    </div>
  );
};

PortalLogoBadge.propTypes = {
  size: PropTypes.number,
  imageScale: PropTypes.number,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default PortalLogoBadge;
