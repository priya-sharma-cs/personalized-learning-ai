import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  AlertTriangle,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition ${
      isActive ? "bg-blue-500 text-white" : "hover:bg-slate-700 text-gray-300"
    }`;

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        AI Risk System
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Fixed Dashboard link */}
        <NavLink to="/dashboard" className={linkStyle}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/students" className={linkStyle}>
          <Users size={20} />
          Students
        </NavLink>

        <NavLink to="/analytics" className={linkStyle}>
          <BarChart3 size={20} />
          Analytics
        </NavLink>

        <NavLink to="/alerts" className={linkStyle}>
          <AlertTriangle size={20} />
          Risk Alerts
        </NavLink>

        <NavLink to="/settings" className={linkStyle}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-sm text-gray-400">
        Version 1.0
      </div>
    </div>
  );
}