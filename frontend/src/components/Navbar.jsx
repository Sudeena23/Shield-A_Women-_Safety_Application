import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  PhoneCall,
  Radio,
  Bell,
  Menu,
  X,
  ShieldAlert,
  UserCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  Settings,
} from 'lucide-react';

export const Navbar = ({
  onTriggerSOS,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenFakeCall,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();

  const userNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Guardians', path: '/guardians', icon: Users },
    { name: 'Live Location', path: '/live-location', icon: Radio },
    { name: 'Emergency Numbers', path: '/emergency-numbers', icon: PhoneCall },
    { name: 'Fake Call', path: '/fake-call', icon: PhoneCall },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNavLinks = [
    { name: 'Live SOS Feeds', path: '/admin?tab=dispatches', icon: Radio },
    { name: 'User Database', path: '/admin?tab=users', icon: Users },
    { name: 'Helplines Registry', path: '/admin?tab=helplines', icon: PhoneCall },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const isAdminPath = location.pathname === '/admin';
  const isAdminRole = currentUser?.role === 'admin';
  const loggedInNavLinks = (isAdminRole || isAdminPath) ? adminNavLinks : userNavLinks;

  // Do not show top navbar when logged out unless on /admin
  if (!currentUser && !isAdminPath) {
    return null;
  }


  // Mobile Drawer Links when logged out - strictly login & signup
  const guestMobileContent = (
    <div className="space-y-3 pt-2">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Public Visitor</span>
        </div>
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            onOpenAuthModal('login');
          }}
          className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            onOpenAuthModal('login');
          }}
          className="w-full bg-[#f7f0e6] hover:bg-[#eee0ce] text-[#2d180c] font-extrabold py-3 rounded-xl border border-[#eee0ce] text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-[#814a27]" />
          <span>Login to Shield</span>
        </button>

        <button
          onClick={() => {
            setMobileMenuOpen(false);
            onOpenAuthModal('signup');
          }}
          className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 rounded-xl text-sm shadow-md shadow-[#9e6133]/20 cursor-pointer"
        >
          <span>Sign Up Free</span>
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#eee0ce] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <Link to={currentUser?.role === 'admin' ? "/admin" : (currentUser ? "/dashboard" : "/")} className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#814a27] via-[#9e6133] to-[#b87b48] text-white shadow-md shadow-[#9e6133]/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 fill-white/10" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#2d180c] group-hover:text-[#9e6133] transition-colors">
                  SHIELD
                </span>
                {currentUser?.role === 'admin' && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-[#814a27] text-amber-200 px-1.5 py-0.5 rounded border border-[#522f18]">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#814a27]/80 font-medium tracking-tight -mt-1 hidden sm:inline">
                {currentUser?.role === 'admin' ? 'Admin Control Center' : "Women's Safety Companion"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {(currentUser || isAdminPath) && (
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5">
              {loggedInNavLinks.map((link) => {
                const Icon = link.icon;
                const currentFullPath = `${location.pathname}${location.search}`;
                const isActive =
                  currentFullPath === link.path ||
                  (location.pathname === '/admin' && location.search === '' && link.path.includes('tab=dispatches')) ||
                  (location.pathname === link.path && !link.path.includes('?'));

                if (link.path === '/fake-call') {
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => {
                        if (onOpenFakeCall) onOpenFakeCall();
                      }}
                      className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap text-[#4a2b18] hover:bg-[#2d180c] hover:text-white cursor-pointer group"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                      <span>{link.name}</span>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap group ${
                      isActive
                        ? 'bg-[#2d180c] text-white border border-[#4a2b18]'
                        : 'text-[#4a2b18] hover:bg-[#2d180c] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-amber-400' : 'text-[#814a27] group-hover:text-amber-400'}`} />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Right Action: User Profile Dropdown or Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!currentUser && isAdminPath && (
              <button
                onClick={() => onOpenAuthModal('login')}
                className="bg-[#2d180c] hover:bg-[#4a2b18] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
            {/* User Auth Section */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-[#f7f0e6] hover:bg-[#2d180c] text-[#2d180c] hover:text-white border border-[#eee0ce] hover:border-[#2d180c] p-1.5 pr-2.5 rounded-xl transition-all cursor-pointer group"
                >
                  <div className={`w-7 h-7 rounded-lg ${currentUser.avatarBg || 'bg-[#9e6133]'} text-white font-extrabold flex items-center justify-center text-xs shadow-xs`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#814a27] group-hover:text-amber-400 transition-colors hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#eee0ce] p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-[#f7f0e6] pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-[#2d180c] truncate">{currentUser.name}</div>
                        {currentUser.role === 'admin' && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#2d180c] text-[#eee0ce] px-1.5 py-0.5 rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#814a27]/70 truncate">{currentUser.email}</div>
                      <div className="text-[11px] text-[#814a27]/70 truncate">{currentUser.phone}</div>
                    </div>

                    <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#eee0ce] text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#814a27]/70">Deactivation PIN:</span>
                        <span className="font-bold text-[#2d180c]">•••• ({currentUser.emergencyPin})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#814a27]/70">Blood Group:</span>
                        <span className="font-bold text-[#814a27]">{currentUser.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    <Link
                      to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between text-xs font-bold text-[#4a2b18] hover:text-white hover:bg-[#2d180c] p-2 rounded-lg transition-colors group"
                    >
                      <span>{currentUser?.role === 'admin' ? 'Admin Portal' : 'Safety Dashboard'}</span>
                      <LayoutDashboard className="w-4 h-4 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between text-xs font-bold text-[#4a2b18] hover:text-white hover:bg-[#2d180c] p-2 rounded-lg transition-colors group"
                    >
                      <span>Edit My Profile</span>
                      <UserCheck className="w-4 h-4 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between text-xs font-bold text-[#4a2b18] hover:text-white hover:bg-[#2d180c] p-2 rounded-lg transition-colors group"
                    >
                      <span>Personal Settings</span>
                      <Sparkles className="w-4 h-4 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#814a27] hover:text-white hover:bg-[#2d180c] p-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-4 h-4 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Quick SOS Trigger for regular users only */}
            {currentUser && currentUser.role !== 'admin' && (
              <button
                id="nav-quick-sos-btn"
                onClick={onTriggerSOS}
                className="relative group bg-gradient-to-r from-[#9e6133] to-[#814a27] hover:from-[#814a27] hover:to-[#683c22] text-white font-bold px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-[#814a27]/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Quick trigger emergency SOS broadcast"
              >
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#cb9d75] rounded-full animate-ping" />
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="tracking-wide uppercase font-black">SOS</span>
              </button>
            )}

            {/* Hamburger Menu Button */}
            {(currentUser || isAdminPath) && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#2d180c] bg-[#f7f0e6] hover:bg-[#eee0ce] transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hamburger Drawer Menu */}
      {mobileMenuOpen && (
        <div className="bg-[#fdfbf7] border-b border-[#eee0ce] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 max-w-7xl mx-auto">
          {currentUser ? (
            <>
              {/* User Account Info inside Mobile Drawer */}
              <div className="p-3 bg-[#f7f0e6] rounded-2xl border border-[#eee0ce] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${currentUser.avatarBg || 'bg-[#9e6133]'} text-white font-extrabold flex items-center justify-center text-xs`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#2d180c]">{currentUser.name}</div>
                    <div className="text-[10px] text-[#814a27]/70">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-[#814a27] font-bold hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              <div className="px-3 pt-1 text-xs font-bold text-[#814a27]/60 uppercase tracking-wider">
                {currentUser?.role === 'admin' ? 'Admin System Navigation' : 'Safety Dashboard Navigation'}
              </div>

              {loggedInNavLinks.map((link) => {
                const Icon = link.icon;
                const currentFullPath = `${location.pathname}${location.search}`;
                const isActive =
                  currentFullPath === link.path ||
                  (location.pathname === '/admin' && location.search === '' && link.path.includes('tab=dispatches')) ||
                  (location.pathname === link.path && !link.path.includes('?'));

                if (link.path === '/fake-call') {
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenFakeCall) onOpenFakeCall();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-[#4a2b18] hover:bg-[#2d180c] hover:text-white group cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-[#814a27] group-hover:text-amber-400 transition-colors" />
                      <span>{link.name}</span>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#2d180c] text-white font-bold border border-[#4a2b18]'
                        : 'text-[#4a2b18] hover:bg-[#2d180c] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-[#814a27] group-hover:text-amber-400'}`} />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}

              {currentUser?.role !== 'admin' && (
                <div className="pt-2 border-t border-[#eee0ce]">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onTriggerSOS();
                    }}
                    className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#9e6133]/20 cursor-pointer text-xs"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    TRIGGER EMERGENCY SOS NOW
                  </button>
                </div>
              )}
            </>

          ) : (
            guestMobileContent
          )}
        </div>
      )}
    </header>
  );
};
