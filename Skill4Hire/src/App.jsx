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
import CandidateLayout from './Candidate/components/CandidateLayout.jsx';
import CandidateDashboard from './Candidate/CandidateDashboard.jsx';
import CandidateProfilePage from './Candidate/CandidateProfilePage.jsx';
import CandidateApplications from './Candidate/components/Applications.jsx';
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
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate-profile" element={<CandidateProfilePage />} />
        <Route path="/candidate-setup" element={<CandidatePage />} />
        <Route path="/candidate-applications" element={<CandidateApplications />} />
         <Route path="/jobs" element={<JobPostings />} />
        <Route path="/jobs/create" element={<JobForm />} />
        <Route path="/jobs/edit/:id" element={<JobForm />} />
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="edit" element={<CandidateProfilePage />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="jobs" element={<CandidateDashboard />} />
          <Route path="notifications" element={<CandidateDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

