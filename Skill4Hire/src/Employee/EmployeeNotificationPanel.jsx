"use client";
import { useState, useEffect } from "react";
import {
    RiNotification3Line,
    RiCheckLine,
    RiDeleteBinLine,
    RiCloseLine,
    RiEyeLine
} from "react-icons/ri";
import { employeeService } from "../services/employeeService";

const EmployeeNotificationPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await employeeService.getNotifications();
            setNotifications(Array.isArray(data) ? data : (data?.content || []));
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await employeeService.getUnreadNotificationCount();
            setUnreadCount(data?.unreadCount || 0);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            // Prefer PATCH when available
            if (employeeService.patchMarkNotificationAsRead) {
                await employeeService.patchMarkNotificationAsRead(notificationId);
            } else {
                await employeeService.markNotificationAsRead(notificationId);
            }
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await employeeService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await employeeService.deleteNotification(notificationId);
            const toDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (toDelete && !toDelete.read) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [isOpen]);

    // Simple polling refresh while panel is open
    useEffect(() => {
        if (!isOpen) return;
        const id = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);
        return () => clearInterval(id);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "80vh" }}>
                <div className="modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {unreadCount > 0 && (
                            <button className="btn btn-secondary btn-small" onClick={markAllAsRead} title="Mark all as read">
                                <RiCheckLine /> Mark All Read
                            </button>
                        )}
                        <button className="close-btn" onClick={onClose}>
                            <RiCloseLine />
                        </button>
                    </div>
                </div>

                <div className="modal-body" style={{ padding: "1rem" }}>
                    {loading ? (
                        <div className="loading-state">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="no-data" style={{ textAlign: "center", padding: "2rem" }}>
                            <RiNotification3Line size={48} style={{ opacity: 0.5, marginBottom: "1rem" }} />
                            <p>No notifications yet</p>
                            <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map((n) => (
                                <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                                    <div className="notification-content">
                                        {n.title && <div className="notification-title">{n.title}</div>}
                                        <div className="notification-message">{n.message}</div>
                                        <div className="notification-meta">
                                            {n.category && <span className="notification-category">{n.category}</span>}
                                            <span className="notification-type">{n.type}</span>
                                            <span className="notification-time">
                                                {new Date(n.createdAt).toLocaleDateString()} •
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        {!n.read && (
                                            <button className="btn-icon" onClick={() => markAsRead(n.id)} title="Mark as read">
                                                <RiEyeLine />
                                            </button>
                                        )}
                                        <button className="btn-icon danger" onClick={() => deleteNotification(n.id)} title="Delete notification">
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

export default EmployeeNotificationPanel;

