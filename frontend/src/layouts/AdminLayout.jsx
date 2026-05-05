import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";
import { notificationAPI } from "../services/apiClient";

const AdminLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") return;
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setItems(res.data.data || []);
        setUnread(Number(res.data.unreadCount) || 0);
      }
    } catch (e) {
      console.error("Tải thông báo:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30000);
    const onRefresh = () => loadNotifications();
    window.addEventListener("admin-notifications-refresh", onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("admin-notifications-refresh", onRefresh);
    };
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleOpenBell = () => {
    setPanelOpen((o) => !o);
    loadNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="text-xl font-bold text-gray-800 hidden md:block" />
          <div className="flex items-center gap-5 ml-auto">
            <div className="relative" ref={wrapRef}>
              <button
                type="button"
                onClick={handleOpenBell}
                className="relative p-2 text-gray-500 hover:text-indigo-600 transition rounded-xl hover:bg-indigo-50"
                aria-label="Thông báo"
              >
                <span className="text-2xl">🔔</span>
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[10px] h-2.5 px-1 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {panelOpen && (
                <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-50 font-bold text-gray-900 text-sm">
                    Thông báo
                    {unread > 0 && (
                      <span className="ml-2 text-xs font-normal text-indigo-600">
                        {unread} chưa đọc
                      </span>
                    )}
                  </div>
                  {items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">
                      Chưa có thông báo
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {items.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!n.is_read) handleMarkRead(n.id);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                              !n.is_read ? "bg-indigo-50/40" : ""
                            }`}
                          >
                            <p className="font-semibold text-gray-900 text-sm">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {n.created_at
                                ? new Date(n.created_at).toLocaleString("vi-VN")
                                : ""}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-gray-900">{user.name || "Người dùng"}</p>
                <p className="text-xs text-gray-500">{user.role_name || "Thành viên"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
