// filepath: src/Employee/EmployeeNotifications.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { employeeService } from "../services/employeeService";
import { RiNotification3Line, RiCheckLine, RiDeleteBinLine, RiEyeLine, RiRefreshLine } from "react-icons/ri";

const EmployeeNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployeeNotifications?.(p, l);
      if (data && typeof data === 'object' && Array.isArray(data.content)) {
        setItems(data.content);
        setPage(data.page ?? p);
        setLimit(data.limit ?? l);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      } else {
        const arr = Array.isArray(data) ? data : (data?.content || []);
        setItems(arr);
        setTotalPages(1);
        setTotalElements(arr.length);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
      setItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const loadUnread = useCallback(async () => {
    try {
      const res = await employeeService.getUnreadNotificationCount();
      setUnreadCount(res?.unreadCount ?? 0);
    } catch (e) {
      console.error('Unread count error', e);
    }
  }, []);

  useEffect(() => {
    load(0, limit);
    loadUnread();
  }, [load, loadUnread, limit]);

  useEffect(() => {
    const id = setInterval(() => { load(page, limit); loadUnread(); }, 30000);
    return () => clearInterval(id);
  }, [load, loadUnread, page, limit]);

  const markAsRead = async (id) => {
    try {
      if (employeeService.patchMarkNotificationAsRead) {
        await employeeService.patchMarkNotificationAsRead(id);
      } else {
        await employeeService.markNotificationAsRead(id);
      }
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Mark read error', e);
    }
  };

  const markAll = async () => {
    try {
      await employeeService.markAllNotificationsAsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Mark all error', e);
    }
  };

  const removeOne = async (id) => {
    try {
      await employeeService.deleteNotification(id);
      const n = items.find(x => x.id === id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
      // If pagination is enabled and we removed last item, reload page
      if (items.length === 1 && totalPages > 1 && page > 0) {
        load(page - 1, limit);
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const refresh = () => { load(page, limit); loadUnread(); };

  const seedSample = async () => {
    try {
      await employeeService.seedOneNotification?.();
      refresh();
    } catch (e) {
      console.error('Seed sample error', e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RiNotification3Line className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-small" onClick={markAll} title="Mark all as read">
              <RiCheckLine className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button className="btn btn-secondary btn-small" onClick={refresh} title="Refresh">
            <RiRefreshLine className="w-4 h-4" /> Refresh
          </button>
          {import.meta?.env?.DEV && (
            <button className="btn btn-secondary btn-small" onClick={seedSample} title="Seed sample notification (dev only)">
              + Sample
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : items.length === 0 ? (
        <div className="no-data text-center py-8">
          <RiNotification3Line size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-700">No notifications yet</p>
          <p className="text-sm text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex-1">
                {n.title && <div className="font-semibold text-gray-900">{n.title}</div>}
                <div className="text-gray-800">{n.message}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  {n.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{n.category}</span>}
                  <span className="uppercase tracking-wide text-gray-400">{n.type}</span>
                  <span>
                    {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!n.read && (
                  <button className="btn btn-secondary btn-small" onClick={() => markAsRead(n.id)} title="Mark as read">
                    <RiEyeLine className="w-4 h-4" />
                  </button>
                )}
                <button className="btn btn-danger btn-small" onClick={() => removeOne(n.id)} title="Delete">
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {totalPages} • {totalElements} total
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary btn-small"
              onClick={() => { const p = Math.max(0, page - 1); setPage(p); load(p, limit); }}
              disabled={page <= 0}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => { const p = Math.min(totalPages - 1, page + 1); setPage(p); load(p, limit); }}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeNotifications;
