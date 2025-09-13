import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.jsx'
import CandidateRegister from './assets/CandidateRegister.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<CandidateRegister />} />
      </Routes>
    </Router>
  )
}

export default App
