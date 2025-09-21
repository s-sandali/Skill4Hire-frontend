"use client"

import { Link, useLocation } from "react-router-dom"
import { 
  FiBarChart2, 
  FiUser, 
  FiEdit3, 
  FiFileText, 
  FiStar, 
  FiBell 
} from "react-icons/fi"
import brainLogo from "../../assets/brain-logo.jpg"
import "../base.css"
import "./CandidateSidebar.css"

export default function CandidateSidebar({ isOpen, onClose }) {
  const location = useLocation()
  
  const navItems = [
    { href: "/candidate-dashboard", label: "Dashboard", icon: FiBarChart2 },
    { href: "/candidate-profile", label: "Profile", icon: FiUser },
    { href: "/candidate-setup", label: "Edit Profile", icon: FiEdit3 },
    { href: "#", label: "Applications", icon: FiFileText, disabled: true },
    { href: "#", label: "Job Recommendations", icon: FiStar, disabled: true },
    { href: "#", label: "Notifications", icon: FiBell, disabled: true },
  ]

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src={brainLogo} alt="Skill4Hire" className="sidebar-logo" />
          <h2 className="sidebar-title">Skill4Hire</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          item.disabled ? (
            <div
              key={index}
              className="sidebar-link disabled"
              onClick={(e) => e.preventDefault()}
            >
              <span className="sidebar-icon">
                <item.icon size={18} />
              </span>
              {item.label}
              <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.5 }}>Soon</span>
            </div>
          ) : (
            <Link
              key={index}
              to={item.href}
              className={`sidebar-link ${location.pathname === item.href ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-icon">
                <item.icon size={18} />
              </span>
              {item.label}
            </Link>
          )
        ))}
      </nav>
    </div>
  )
}