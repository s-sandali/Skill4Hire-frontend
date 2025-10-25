import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.jsx'
import RoleSelection from './components/RoleSelection.jsx'
import CandidateRegister from './components/CandidateRegister.jsx'
import CompanyRegister from './components/CompanyRegister.jsx'
import EmployeeRegister from './components/EmployeeRegister.jsx'
import AdminRegister from './components/AdminRegister.jsx'
import UnifiedLogin from './components/UnifiedLogin.jsx'
import EmployeeDashboard from './Employee/EmployeeDashboard.jsx'
import CompanyDashboard from './Company/CompanyDashboard.jsx'
import AdminDashboard from './Admin/AdminDashboard.jsx'
import CandidatePage from './Candidate/CandidatePage.jsx';
import JobPostings from "./Company/JobPostings.jsx";
import JobForm from "./Company/JobForm.jsx";
import CompanyProfilePage from './Company/CompanyProfilePage.jsx';
import EmployeeProfile from './Employee/EmployeeProfile.jsx';
import EmployeeNotificationPanel from './Employee/EmployeeNotificationPanel.jsx';
import './App.css'




function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/register/candidate" element={<CandidateRegister />} />
          <Route path="/register/company" element={<CompanyRegister />} />
          <Route path="/register/employee" element={<EmployeeRegister />} />
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/candidate-home" element={<CandidatePage />} />
          <Route path="/candidate-dashboard" element={<CandidatePage />} />
          <Route path="/candidate-profile" element={<CandidatePage />} />
          <Route path="/candidate-setup" element={<CandidatePage />} />
          <Route path="/candidate-applications" element={<CandidatePage />} />
          <Route path="/candidate-jobs" element={<CandidatePage />} />
          <Route path="/candidate-matches" element={<CandidatePage />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route path="/jobs" element={<JobPostings />} />
          <Route path="/jobs/create" element={<JobForm />} />
          <Route path="/jobs/edit/:id" element={<JobForm />} />
          <Route path="employee-profile" element={<EmployeeDashboard />} />
          <Route path="employee-notification" element={<EmployeeDashboard />} />
        </Routes>
      </Router>
  )
}

export default App
