import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { FaBell } from "react-icons/fa";

export default function Topbar({ onGenerate }) {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="h-16 px-6 flex items-center justify-between glass">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
        <div className="text-sm text-muted hidden md:block">Manage tasks & generate AI plans</div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onGenerate} className="btn-primary px-4 py-2 rounded-md shadow hover:opacity-95">
          <span className="font-medium">Generate Smart Plan</span>
        </button>
        <button className="p-2 rounded-md hover:bg-white/5">
          <FaBell />
        </button>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-black font-bold">
              {user.name?.[0] || "U"}
            </div>
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <button onClick={logout} className="text-xs text-muted hover:underline">Logout</button>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
