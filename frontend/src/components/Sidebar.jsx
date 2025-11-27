import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FaTasks, FaRobot, FaUser } from "react-icons/fa";

const menu = [
  { id: "dashboard", label: "Tasks", icon: <FaTasks/>, to: "/" },
  { id: "ai", label: "AI Planner", icon: <FaRobot/>, to: "/ai" },
  // { id: "profile", label: "Profile", icon: <FaUser/>, to: "/profile" },
];

export default function Sidebar(){
  const { pathname } = useLocation();
  return (
    <motion.aside initial={{ x:-120 }} animate={{ x:0 }} transition={{ duration:0.45 }}
      className="w-72 min-h-screen p-6 bg-gradient-to-b from-[#071021] to-[#071019] text-white">
      <div className="mb-8">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">AI Task Manager</div>
        <p className="text-sm text-muted mt-1">Plan smarter. Ship faster.</p>
      </div>
      <nav className="space-y-2">
        {menu.map(i => {
          const active = pathname === i.to || (i.to !== "/" && pathname.startsWith(i.to));
          return (
            <Link key={i.id} to={i.to}>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${active ? "bg-indigo-700/30" : "hover:bg-white/2"} transition`}>
                <div className="text-lg">{i.icon}</div>
                <div className="font-medium">{i.label}</div>
              </div>
            </Link>
          )
        })}
      </nav>
      <div className="mt-8">
        <div className="glass p-4 gradient-card">
          <h4 className="text-sm font-semibold">Pro tip</h4>
          <p className="text-xs text-muted mt-2">Use AI Planner to auto-generate a 7-day schedule from your goals.</p>
        </div>
      </div>
    </motion.aside>
  );
}
