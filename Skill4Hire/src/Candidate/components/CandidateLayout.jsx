"use client"

import { useState, useEffect } from "react"
import CandidateSidebar from "./CandidateSidebar.jsx"
import CandidateHeader from "./CandidateHeader.jsx"
import CandidateNotificationPanel from "./CandidateNotificationPanel.jsx"
import "../base.css"
import "./CandidateLayout.css"

export default function CandidateLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = async () => {
    try {
      const { candidateService } = await import("../../services/candidateService")
      const data = await candidateService.getNotifications()
      const list = Array.isArray(data) ? data : (data?.content || [])
      const count = list.filter(n => !n.read).length
      setUnreadCount(count)
    } catch {
      // swallow
    }
  }

  useEffect(() => {
    refreshUnread()
    const t = setInterval(refreshUnread, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="candidate-layout">
      <CandidateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="candidate-main">
        <CandidateHeader onMenuClick={() => setSidebarOpen(true)} onNotificationsClick={() => setNotificationsOpen(true)} unreadCount={unreadCount} />
        <main className="candidate-content">{children}</main>
        <CandidateNotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onChange={refreshUnread} />
      </div>
    </div>
  )
}
