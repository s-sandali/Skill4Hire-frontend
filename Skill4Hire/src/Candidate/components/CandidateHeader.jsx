"use client"

import { FiMenu, FiSearch, FiBell, FiMessageCircle } from "react-icons/fi"
import "../base.css"
import "./CandidateHeader.css"

export default function CandidateHeader({ onMenuClick }) {
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
          <div className="header-profile">
            <img src="/professional-headshot.png" alt="Profile" className="profile-avatar" />
          </div>
        </div>
      </div>
    </header>
  )
}