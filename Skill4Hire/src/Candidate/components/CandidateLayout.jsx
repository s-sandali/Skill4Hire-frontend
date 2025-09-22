"use client"

import { useState } from "react"
import CandidateSidebar from "./CandidateSidebar.jsx"
import CandidateHeader from "./CandidateHeader.jsx"
import "../base.css"
import "./CandidateLayout.css"

export default function CandidateLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="candidate-layout">
      <CandidateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="candidate-main">
        <CandidateHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="candidate-content">{children}</main>
      </div>
    </div>
  )
}