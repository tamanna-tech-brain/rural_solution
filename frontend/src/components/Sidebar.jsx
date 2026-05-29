import { NavLink } from "react-router-dom";
import {
  Bell,
  BadgeDollarSign,
  CalendarRange,
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  Tractor,
  Store,
  Users,
  HelpCircle
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Users", to: "/user", icon: Users },
  { label: "Equipment", to: "/equipment", icon: Tractor },
  { label: "Mandi", to: "/mandi", icon: Store },
  { label: "Payments", to: "/payment", icon: BadgeDollarSign },
  { label: "Disputes", to: "/dispute", icon: ShieldAlert },
  { label: "Map", to: "/map", icon: MapPinned },
  { label: "Notifications", to: "/notifications", icon: Bell },
   { label: "Help Desk", to: "/help", icon: HelpCircle },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/70 bg-white/90 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 px-4 py-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg">
            🌾
          </div>
          <div>
            <p className="text-sm font-semibold">KrishiPool</p>
            <p className="text-xs text-emerald-50/85">Agriculture coordination</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {menuItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs text-emerald-800">
        <p className="font-semibold">Tip</p>
        <p className="mt-1 text-emerald-700/90">
          Keep bookings, payments, and disputes organized in one place.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;