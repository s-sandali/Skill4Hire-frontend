import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.jsx'
import CandidateRegister from './assets/CandidateRegister.jsx'
import CandidateLogin from './assets/CandidateLogin.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<CandidateRegister />} />
        <Route path="/login" element={<CandidateLogin />} />
      </Routes>
    </Router>
  )
}

export default App
