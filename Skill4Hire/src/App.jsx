import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import RoleSelection from './components/RoleSelection.jsx';
import UnifiedLogin from './components/UnifiedLogin.jsx';
import EmployeeDashboard from './Employee/EmployeeDashboard.jsx';
import CompanyDashboard from './Company/CompanyDashboard.jsx';
import JobPostings from './Company/JobPostings.jsx';
import JobForm from './Company/JobForm.jsx';
import CompanyProfilePage from './Company/CompanyProfilePage.jsx';
import CandidateProfileApp from './Candidate/Profile.jsx';
import EmployeeProfile from './Employee/EmployeeProfile.jsx';
import CandidateRegister from './components/CandidateRegister.jsx';
import CompanyRegister from './components/CompanyRegister.jsx';
import EmployeeRegister from './components/EmployeeRegister.jsx';

import './App.css';

const withMainApp = (element) => <div className="main-app">{element}</div>;

const renderProtected = (element, allowedRoles) => (
  <RequireAuth allowedRoles={allowedRoles}>
    {withMainApp(element)}
  </RequireAuth>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-selection" element={withMainApp(<RoleSelection />)} />

        {/* Auth + Register */}
        <Route path="/register/candidate" element={withMainApp(<CandidateRegister />)} />
        <Route path="/register/company" element={withMainApp(<CompanyRegister />)} />
        <Route path="/register/employee" element={withMainApp(<EmployeeRegister />)} />
        <Route path="/login" element={withMainApp(<UnifiedLogin />)} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up" element={<Navigate to="/role-selection" replace />} />
        {/* Legacy fallback */}
        <Route path="/legacy-login" element={withMainApp(<UnifiedLogin />)} />

        {/* Dashboards */}
        <Route path="/employee-dashboard" element={renderProtected(<EmployeeDashboard />, ['EMPLOYEE'])} />
        <Route path="/company-dashboard" element={renderProtected(<CompanyDashboard />, ['COMPANY'])} />

        {/* Company */}
        <Route path="/company-profile" element={renderProtected(<CompanyProfilePage />, ['COMPANY'])} />
        <Route path="/jobs" element={renderProtected(<JobPostings />, ['COMPANY'])} />
        <Route path="/jobs/create" element={renderProtected(<JobForm />, ['COMPANY'])} />
        <Route path="/jobs/edit/:id" element={renderProtected(<JobForm />, ['COMPANY'])} />

        {/* Candidate */}
        <Route path="/candidate" element={renderProtected(<CandidateProfileApp />, ['CANDIDATE'])} />

        {/* Employee Additional */}
        <Route path="/employee-profile" element={renderProtected(<EmployeeProfile />, ['EMPLOYEE'])} />
      </Routes>
    </Router>
  );
}

export default App;

function RequireAuth({ children, allowedRoles }) {
  const location = useLocation();

  if (typeof window === 'undefined') {
    return null;
  }

  let storedRole = null;
  let storedId = null;

  try {
    storedRole = window.localStorage.getItem('userRole');
    storedId = window.localStorage.getItem('userId');
  } catch {
    storedRole = null;
    storedId = null;
  }

  if (!storedRole || !storedId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(storedRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
