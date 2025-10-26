"use client";
import { useEffect, useState } from "react";
import { RiNotification3Line, RiEyeLine, RiCloseLine, RiDeleteBinLine, RiCheckLine } from "react-icons/ri";
import { candidateService } from "../../services/candidateService";
import "./CandidateNotificationPanel.css";

const CandidateNotificationPanel = ({ isOpen, onClose, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const load = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getNotifications();
      const list = Array.isArray(data) ? data : (data?.content || []);
      setNotifications(list);
    } catch (e) {
      console.error("Failed to fetch candidate notifications", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await candidateService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      onChange?.();
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await candidateService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onChange?.();
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await candidateService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      onChange?.();
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (<span className="notification-badge">{unreadCount}</span>)}
          </div>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-small" onClick={markAllAsRead} title="Mark all as read">
                <RiCheckLine /> Mark All Read
              </button>
            )}
            <button className="close-btn" onClick={onClose} title="Close">
              <RiCloseLine />
            </button>
          </div>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="no-data" style={{ textAlign: "center", padding: "2rem" }}>
              <RiNotification3Line size={44} style={{ opacity: 0.6, marginBottom: ".75rem" }} />
              <p>No notifications yet</p>
              <p style={{ fontSize: ".875rem", opacity: 0.7 }}>You're all caught up!</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.read ? "" : "unread"}`}>
                  <div className="notification-content">
                    <div className="notification-message">{n.message || n.title}</div>
                    <div className="notification-meta">
                      {n.type && <span className="notification-type">{n.type}</span>}
                      {n.createdAt && (
                        <span className="notification-time">
                          {new Date(n.createdAt).toLocaleDateString()} - {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!n.read && (
                      <button className="btn-icon" title="Mark as read" onClick={() => markAsRead(n.id)}>
                        <RiEyeLine />
                      </button>
                    )}
                    <button className="btn-icon danger" title="Delete" onClick={() => deleteNotification(n.id)}>
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateNotificationPanel;
