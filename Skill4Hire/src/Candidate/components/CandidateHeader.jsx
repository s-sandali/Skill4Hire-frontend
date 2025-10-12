"use client"

import { FiMenu, FiSearch, FiBell, FiMessageCircle, FiLogOut } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { authService } from "../../services/authService"
import "../base.css"
import "./CandidateHeader.css"

export default function CandidateHeader({ onMenuClick }) {
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore errors, proceed to navigate
    } finally {
      navigate('/login')
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      try {
        const { candidateService } = await import("../../services/candidateService")
        const profile = await candidateService.getProfile()
        if (mounted) setCandidate(profile)
      } catch {
        // ignore header fetch failures
      }
    }
    fetchProfile()
    return () => { mounted = false }
  }, [])

  const avatarSrc = useMemo(() => {
    if (candidate?.profilePicturePath) {
      return `http://localhost:8080/uploads/profile-pictures/${candidate.profilePicturePath}`
    }
    const seed = candidate?.email || candidate?.name || "guest"
    // DiceBear avatar as random-but-stable fallback by seed
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`
  }, [candidate])

  return (
    <header className="header">
      <div className="header-content">
        <button className="header-btn md:hidden" onClick={onMenuClick}>
          <FiMenu size={20} />
        </button>
        <div className="header-search">
          <FiSearch className="search-icon" size={18} />
          <input type="text" placeholder="Search jobs, companies..." className="search-input" />
        </div>
        <div className="header-actions">
          <button className="header-btn">
            <FiBell size={18} />
          </button>
          <button className="header-btn">
            <FiMessageCircle size={18} />
          </button>
          <button className="header-btn" onClick={handleLogout} title="Log out">
            <FiLogOut size={18} />
          </button>
          <div className="header-profile">
            <img src={avatarSrc} alt="Profile" className="profile-avatar" />
          </div>
        </div>
      </div>
    </header>
  )
}