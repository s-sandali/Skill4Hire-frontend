import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.jsx'
import RoleSelection from './components/RoleSelection.jsx'
import CandidateRegister from './components/CandidateRegister.jsx'
import CompanyRegister from './components/CompanyRegister.jsx'
import EmployeeRegister from './components/EmployeeRegister.jsx'
import AdminRegister from './components/AdminRegister.jsx'
import UnifiedLogin from './components/UnifiedLogin.jsx'
import EmployeeDashboard from './components/EmployeeDashboard.jsx'
import CandidateProfilePage from './Candidate/CandidateProfilePage.jsx';
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
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        <Route path="/candidate-profile" element={<CandidateProfilePage />} /> 
      </Routes>
    </Router>
  )
}

export default App