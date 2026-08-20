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
      window.location.href = "/login";
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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen z-50
          bg-[#160c07] border-r border-[#302018]
          flex flex-col
          transition-all duration-300
          ${widthClass}
          ${mobileHiddenClass}
        `}
      >
        <div className="h-16 sm:h-20 px-4 border-b border-[#302018] flex items-center justify-between shrink-0">
          {showLabels && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#9e6133] rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-bold text-base sm:text-lg truncate">
                  SHIELD
                </h1>
                <p className="text-[#98745a] text-[10px] uppercase truncate">
                  Admin Panel
                </p>
              </div>
            </div>
          )}

          {!showLabels && (
            <div className="w-10 h-10 bg-[#9e6133] rounded-xl flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#a9856c] hover:text-white p-2 rounded-lg hover:bg-[#27150d] shrink-0"
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

        {showLabels && (
          <div className="p-4 sm:p-5 border-b border-[#302018] shrink-0">
            <p className="text-[#80614d] text-[10px] uppercase mb-3">
              Administrator
            </p>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#3a2417] border border-[#6f4528] flex items-center justify-center shrink-0">
                <span className="text-[#d7a77d] font-bold">
                  {getInitial()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name || "Admin User"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  <span className="text-[#80614d] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 overflow-y-auto">
          {showLabels && (
            <p className="text-[#80614d] text-[10px] uppercase px-3 mb-3">
              Main Menu
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
                    relative w-full flex items-center rounded-lg transition
                    ${showLabels ? "gap-3 px-3 py-3" : "justify-center p-3"}
                    ${
                      active
                        ? "bg-[#8d542d] text-white"
                        : "text-[#a9856c] hover:bg-[#24140c] hover:text-white"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#d9a16d] rounded-r" />
                  )}

                  <Icon className="w-5 h-5 shrink-0" />

                  {showLabels && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}

                  {item.badge && activeSOSCount > 0 && showLabels && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                      {activeSOSCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-[#302018] shrink-0">
          <button
            onClick={() => handleTabClick("settings")}
            title={!showLabels ? "Settings" : ""}
            className={`
              relative w-full flex items-center rounded-lg transition
              ${showLabels ? "gap-3 px-3 py-3" : "justify-center p-3"}
              ${
                activeTab === "settings"
                  ? "bg-[#8d542d] text-white"
                  : "text-[#a9856c] hover:bg-[#24140c] hover:text-white"
              }
            `}
          >
            {activeTab === "settings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#d9a16d] rounded-r" />
            )}
            <Settings className="w-5 h-5 shrink-0" />
            {showLabels && <span className="text-sm font-medium truncate">Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            title={!showLabels ? "Logout" : ""}
            className={`
              w-full flex items-center rounded-lg text-red-400
              hover:bg-red-500/10 mt-1
              ${showLabels ? "gap-3 px-3 py-3" : "justify-center p-3"}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {showLabels && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-40 bg-[#9e6133] text-white p-3 rounded-lg shadow-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default AdminNavbar;