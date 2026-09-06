import React, { useState, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  Radio,
  Users,
  MapPin,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "dispatches", label: "Live SOS", icon: Radio, badge: true },
  { id: "users", label: "Users", icon: Users },
  { id: "liveLocation", label: "Live Location", icon: MapPin },
  { id: "helplines", label: "Helplines", icon: Phone },
];

const WIDTH_EXPANDED = 256; // w-64
const WIDTH_COLLAPSED = 80; // w-20

export const AdminNavbar = ({
  activeTab,
  onTabChange,
  activeSOSCount = 0,
  user = null,
  onLogout = null,
  onWidthChange = null,
}) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [collapsed, setCollapsed] = useState(isMobile);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => {
      setIsMobile(e.matches);
      setCollapsed(e.matches);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!onWidthChange) return;
    const width = isMobile ? 0 : collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;
    onWidthChange(width);
  }, [isMobile, collapsed, onWidthChange]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
  };

  const getInitial = () => {
    if (!user?.name) return "A";
    return user.name.charAt(0).toUpperCase();
  };

  const handleTabClick = (id) => {
    onTabChange(id);
    if (isMobile) setCollapsed(true);
  };

  const mobileHiddenClass = isMobile
    ? collapsed
      ? "-translate-x-full"
      : "translate-x-0"
    : "translate-x-0";

  const widthClass = isMobile ? "w-64" : collapsed ? "w-20" : "w-64";
  const showLabels = isMobile ? true : !collapsed;

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen z-50
          bg-white border-r border-[#eee0ce] shadow-sm
          flex flex-col
          transition-all duration-300
          ${widthClass}
          ${mobileHiddenClass}
        `}
      >
        {/* Top Branding */}
        <div className="h-16 sm:h-20 px-4 border-b border-[#eee0ce] flex items-center justify-between shrink-0 bg-[#fdfbf7]">
          {showLabels && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#9e6133] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[#2d180c] font-black text-base sm:text-lg tracking-tight truncate">
                  SHIELD
                </h1>
                <p className="text-[#814a27] text-[10px] font-bold uppercase tracking-wider truncate">
                  Admin Portal
                </p>
              </div>
            </div>
          )}

          {!showLabels && (
            <div className="w-10 h-10 bg-[#9e6133] rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#814a27] hover:text-[#2d180c] p-2 rounded-xl hover:bg-[#f7f0e6] transition-colors shrink-0 cursor-pointer"
            aria-label={collapsed ? "Open menu" : "Close menu"}
          >
            {isMobile ? (
              <X className="w-5 h-5" />
            ) : collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Admin Profile Section */}
        {showLabels && (
          <div className="p-4 sm:p-5 border-b border-[#eee0ce] shrink-0 bg-[#fdfbf7]/60">
            <p className="text-[#814a27]/70 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
              Active Administrator
            </p>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#f7f0e6] border border-[#eee0ce] flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-[#9e6133] font-black text-sm">
                  {getInitial()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[#2d180c] text-xs sm:text-sm font-bold truncate">
                  {user?.name || "Admin User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[#814a27]/80 text-[11px] font-medium">Duty Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {showLabels && (
            <p className="text-[#814a27]/60 text-[10px] font-extrabold uppercase tracking-wider px-3 mb-2">
              Management Menu
            </p>
          )}

          <div className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={!showLabels ? item.label : ""}
                  className={`
                    relative w-full flex items-center rounded-xl transition-all cursor-pointer text-xs
                    ${showLabels ? "gap-3 px-3.5 py-3" : "justify-center p-3"}
                    ${
                      active
                        ? "bg-[#9e6133] text-white font-extrabold shadow-md shadow-[#9e6133]/25"
                        : "text-[#814a27] hover:bg-[#f7f0e6] hover:text-[#2d180c] font-bold"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  {showLabels && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}

                  {item.badge && activeSOSCount > 0 && showLabels && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs animate-bounce">
                      {activeSOSCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#eee0ce] shrink-0 bg-[#fdfbf7] space-y-1">
          <button
            onClick={() => handleTabClick("settings")}
            title={!showLabels ? "Settings" : ""}
            className={`
              relative w-full flex items-center rounded-xl transition-all cursor-pointer text-xs
              ${showLabels ? "gap-3 px-3.5 py-2.5" : "justify-center p-3"}
              ${
                activeTab === "settings"
                  ? "bg-[#9e6133] text-white font-extrabold shadow-md shadow-[#9e6133]/25"
                  : "text-[#814a27] hover:bg-[#f7f0e6] hover:text-[#2d180c] font-bold"
              }
            `}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {showLabels && <span className="truncate">Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            title={!showLabels ? "Logout" : ""}
            className={`
              w-full flex items-center rounded-xl text-red-600 font-bold
              hover:bg-red-50 transition-colors cursor-pointer text-xs
              ${showLabels ? "gap-3 px-3.5 py-2.5" : "justify-center p-3"}
            `}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-40 bg-[#9e6133] text-white p-3 rounded-2xl shadow-xl shadow-[#9e6133]/30 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default AdminNavbar;