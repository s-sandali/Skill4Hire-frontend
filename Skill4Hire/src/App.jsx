import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import RoleSelection from './components/RoleSelection.jsx';
import CandidateRegister from './components/CandidateRegister.jsx';
import CompanyRegister from './components/CompanyRegister.jsx';
import EmployeeRegister from './components/EmployeeRegister.jsx';
import AdminRegister from './components/AdminRegister.jsx';
import UnifiedLogin from './components/UnifiedLogin.jsx';
import EmployeeDashboard from './Employee/EmployeeDashboard.jsx';
import CompanyDashboard from './Company/CompanyDashboard.jsx';
import AdminDashboard from './Admin/AdminDashboard.jsx';
import JobPostings from './Company/JobPostings.jsx';
import JobForm from './Company/JobForm.jsx';
import CompanyProfilePage from './Company/CompanyProfilePage.jsx';
import CandidateProfileApp from './Candidate/Profile.jsx';
import EmployeeProfile from './Employee/EmployeeProfile.jsx';
import EmployeeNotificationPanel from './Employee/EmployeeNotificationPanel.jsx';

import './App.css';

const withMainApp = (element) => <div className="main-app">{element}</div>;

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
        <Route path="/register/admin" element={withMainApp(<AdminRegister />)} />
        <Route path="/login" element={withMainApp(<UnifiedLogin />)} />

        {/* Dashboards */}
        <Route path="/employee-dashboard" element={withMainApp(<EmployeeDashboard />)} />
        <Route path="/company-dashboard" element={withMainApp(<CompanyDashboard />)} />
        <Route path="/admin-dashboard" element={withMainApp(<AdminDashboard />)} />

        {/* Company */}
        <Route path="/company-profile" element={withMainApp(<CompanyProfilePage />)} />
        <Route path="/jobs" element={withMainApp(<JobPostings />)} />
        <Route path="/jobs/create" element={withMainApp(<JobForm />)} />
        <Route path="/jobs/edit/:id" element={withMainApp(<JobForm />)} />

        {/* Candidate */}
        <Route path="/candidate" element={withMainApp(<CandidateProfileApp />)} />

        {/* Employee Additional */}
        <Route path="/employee-profile" element={withMainApp(<EmployeeProfile />)} />
        <Route path="/employee-notifications" element={withMainApp(<EmployeeNotificationPanel />)} />
      </Routes>
    </Router>
  );
}

export default App;
