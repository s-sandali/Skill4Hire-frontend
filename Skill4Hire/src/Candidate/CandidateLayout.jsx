import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiBell, FiShare2, FiMessageCircle } from 'react-icons/fi';
import { BsGrid, BsPersonCircle, BsFileText, BsBriefcase, BsBell } from 'bs-icons';

const CandidateLayout = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h1>Skill4Hire</h1>
        </div>
        
        <nav className="nav-menu">
          <Link to="/candidate/dashboard" className="nav-item">
            <BsGrid /> Dashboard
          </Link>
          <Link to="/candidate/profile" className="nav-item">
            <BsPersonCircle /> Profile
          </Link>
          <Link to="/candidate/edit" className="nav-item">
            <BsFileText /> Edit Profile
          </Link>
          <Link to="/candidate/applications" className="nav-item">
            <BsBriefcase /> Applications
          </Link>
          <Link to="/candidate/jobs" className="nav-item">
            <BsBriefcase /> Job Recommendations
          </Link>
          <Link to="/candidate/notifications" className="nav-item">
            <BsBell /> Notifications
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CandidateLayout;