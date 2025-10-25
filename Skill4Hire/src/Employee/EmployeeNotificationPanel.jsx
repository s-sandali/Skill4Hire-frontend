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

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await employeeService.getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const data = await employeeService.getUnreadNotificationCount();
            setUnreadCount(data?.unreadCount || 0);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            await employeeService.markNotificationAsRead(notificationId);
            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await employeeService.markAllNotificationsAsRead();
            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            await employeeService.deleteNotification(notificationId);
            // Update local state
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

            // Update unread count if deleted notification was unread
            if (notificationToDelete && !notificationToDelete.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            fetchUnreadCount();
        }
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
                            <button
                                className="btn btn-secondary btn-small"
                                onClick={markAllAsRead}
                                title="Mark all as read"
                            >
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
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                >
                                    <div className="notification-content">
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-meta">
                                            <span className="notification-type">{notification.type}</span>
                                            <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()} •
                                                {new Date(notification.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                      </span>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => markAsRead(notification.id)}
                                                title="Mark as read"
                                            >
                                                <RiEyeLine />
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => deleteNotification(notification.id)}
                                            title="Delete notification"
                                        >
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