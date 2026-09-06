// Navbar.js - User Version
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

import {
  Shield,
  LayoutDashboard,
  Users,
  PhoneCall,
  Radio,
  Menu,
  X,
  ShieldAlert,
  UserCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  Settings,
  Bell,
  AlertCircle,
  Clock,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

// ============================================
// 1. NOTIFICATIONS PANEL
// ============================================
const NotificationsPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SOS':
        return <AlertCircle className="w-4 h-4 text-red-500" />;

      case 'GUARDIAN':
        return <UserCheck className="w-4 h-4 text-blue-500" />;

      case 'SAFETY':
        return <Shield className="w-4 h-4 text-green-500" />;

      case 'EMERGENCY':
        return <PhoneCall className="w-4 h-4 text-yellow-500" />;

      default:
        return <MessageCircle className="w-4 h-4 text-[#814a27]" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'SOS':
        return 'bg-red-50 border-red-200';

      case 'GUARDIAN':
        return 'bg-blue-50 border-blue-200';

      case 'SAFETY':
        return 'bg-green-50 border-green-200';

      case 'EMERGENCY':
        return 'bg-yellow-50 border-yellow-200';

      default:
        return 'bg-[#f7f0e6] border-[#eee0ce]';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-[#eee0ce] overflow-hidden z-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eee0ce]">

        <div className="flex items-center gap-2">

          <Bell className="w-5 h-5 text-[#814a27]" />

          <h3 className="text-[#2d180c] font-bold">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-[#9e6133] text-white rounded-full">
              {unreadCount} new
            </span>
          )}

        </div>

        <div className="flex items-center gap-2">

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#814a27] hover:text-[#2d180c]"
            >
              Mark all read
            </button>
          )}

          <button
            onClick={onClose}
            className="text-[#814a27]/50 hover:text-[#814a27]"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">

        {notifications.length > 0 ? (

          notifications.map((notification) => (

            <div
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-[#eee0ce] hover:bg-[#f7f0e6] cursor-pointer ${
                !notification.read ? 'bg-[#fdfbf7]' : ''
              }`}
              onClick={() => onMarkRead(notification.id)}
            >

              <div
                className={`p-2 rounded-lg border ${getNotificationBg(
                  notification.type
                )}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">

                <p
                  className={`text-sm ${
                    !notification.read
                      ? 'text-[#2d180c] font-medium'
                      : 'text-[#814a27]'
                  }`}
                >
                  {notification.message}
                </p>

                <div className="flex items-center gap-2 mt-1">

                  <Clock className="w-3 h-3 text-[#814a27]/50" />

                  <span className="text-xs text-[#814a27]/50">
                    {notification.time}
                  </span>

                  {!notification.read && (
                    <span className="w-2 h-2 bg-[#9e6133] rounded-full"></span>
                  )}

                </div>

              </div>

              {!notification.read && (
                <button
                  className="text-[#814a27]/50 hover:text-[#814a27]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notification.id);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}

            </div>

          ))

        ) : (

          <div className="flex flex-col items-center justify-center py-12">

            <Bell className="w-12 h-12 text-[#eee0ce] mb-3" />

            <p className="text-[#814a27]/60 text-sm">
              No notifications
            </p>

            <p className="text-[#814a27]/40 text-xs">
              You're all caught up!
            </p>

          </div>

        )}

      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-[#eee0ce] text-center">

          <button
            className="text-xs text-[#814a27] hover:text-[#2d180c]"
            onClick={() => {
              console.log('View all notifications');
              onClose();
            }}
          >
            View all notifications
          </button>

        </div>
      )}

    </div>
  );
};


// ============================================
// 2. MAIN NAVBAR
// ============================================
export const Navbar = ({
  onTriggerSOS,
  currentUser,
  onLogout,
  onOpenFakeCall,
  activeSOSCount = 0,
  guardianCount = 0,
}) => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const location = useLocation();


  // ============================================
  // USER NOTIFICATIONS (Real Backend & Socket.io)
  // ============================================
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-system-1',
      type: 'SAFETY',
      message: '🛡️ Shield Protection Active: 1-Tap SOS and live GPS telemetry ready.',
      time: 'Just now',
      read: false,
    },
  ]);

  // Load real system broadcasts from backend
  useEffect(() => {
    const loadRealBroadcasts = async () => {
      try {
        const { adminService } = await import('../services/adminService');
        const broadcasts = await adminService.getBroadcasts();
        
        if (broadcasts && broadcasts.length > 0) {
          const mapped = broadcasts.slice(0, 5).map((b) => ({
            id: b._id || b.id,
            type: b.priority === 'High' || b.priority === 'Critical' ? 'SOS' : 'SAFETY',
            message: `📢 ${b.title}: ${b.message}`,
            time: new Date(b.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newOnes = mapped.filter((m) => !existingIds.has(m.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('Notice loading broadcasts in navbar:', err.message);
      }
    };

    loadRealBroadcasts();

    // Listen for live emergency broadcasts dispatched by Admin in real time
    import('../services/socketService').then(({ socket, connectSocket }) => {
      connectSocket();
      
      const handleLiveBroadcast = (broadcast) => {
        setNotifications((prev) => [
          {
            id: broadcast.id || `live-bc-${Date.now()}`,
            type: 'SOS',
            message: `🚨 EMERGENCY BROADCAST: ${broadcast.title} - ${broadcast.message}`,
            time: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      };

      socket.on('emergency-broadcast', handleLiveBroadcast);

      return () => {
        socket.off('emergency-broadcast', handleLiveBroadcast);
      };
    });
  }, []);

  // ============================================
  // NOTIFICATION FUNCTIONS
  // ============================================
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };


  // ============================================
  // NAVIGATION LINKS
  // ============================================

  const navLinks = [

    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },

    {
      name: 'My Guardians',
      path: '/guardians',
      icon: Users,
      badge: guardianCount,
    },

    {
      name: 'Live Location',
      path: '/live-location',
      icon: Radio,
    },

    {
      name: 'Emergency Numbers',
      path: '/emergency-numbers',
      icon: PhoneCall,
    },

    {
      name: 'Fake Call',
      path: '/fake-call',
      icon: PhoneCall,
    },

    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },

  ];


  // Don't show navbar if user is not logged in or on the landing page (/)
  if (!currentUser || location.pathname === '/') return null;


  // ============================================
  // NAVBAR UI
  // ============================================

  return (

    <header className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#eee0ce]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 gap-3">


          {/* =====================================
              LOGO
          ===================================== */}

          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 shrink-0"
          >

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#814a27] via-[#9e6133] to-[#b87b48] text-white shadow-md">

              <Shield className="w-6 h-6" />

            </div>


            <div className="hidden sm:flex flex-col">

              <span className="text-xl font-black tracking-tight text-[#2d180c]">
                SHIELD
              </span>

              <span className="text-[10px] text-[#814a27]/80 font-medium -mt-1">
                Women's Safety Companion
              </span>

            </div>

          </Link>


          {/* =====================================
              DESKTOP NAVIGATION
          ===================================== */}

          <nav className="hidden md:flex items-center gap-1">

            {navLinks.map((link) => {

              const Icon = link.icon;


              // Fake Call button
              if (link.path === '/fake-call') {

                return (

                  <button
                    key={link.path}
                    onClick={onOpenFakeCall}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold text-[#4a2b18] hover:bg-[#2d180c] hover:text-white transition-all"
                  >

                    <Icon className="w-3.5 h-3.5 text-[#814a27]" />

                    {link.name}

                  </button>

                );

              }


              return (

                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-[#2d180c] text-white'
                        : 'text-[#4a2b18] hover:bg-[#2d180c] hover:text-white'
                    }`
                  }
                >

                  <Icon className="w-3.5 h-3.5" />

                  {link.name}


                  {/* Guardian Count */}
                  {link.badge > 0 && (

                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-[#9e6133] text-white text-[8px] font-bold rounded-full">

                      {link.badge}

                    </span>

                  )}

                </NavLink>

              );

            })}

          </nav>


          {/* =====================================
              RIGHT SIDE
          ===================================== */}

          <div className="flex items-center gap-2">


            {/* =================================
                NOTIFICATIONS
            ================================= */}

            <div className="relative">

              <button
                onClick={() =>
                  setNotificationsOpen(!notificationsOpen)
                }
                className={`relative p-2 rounded-xl transition-colors ${
                  notificationsOpen
                    ? 'bg-[#2d180c] text-white'
                    : 'text-[#814a27] hover:bg-[#f7f0e6]'
                }`}
              >

                <Bell className="w-4 h-4" />


                {/* Notification Count */}

                {notifications.filter((n) => !n.read).length > 0 && (

                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center bg-[#9e6133] text-white text-[8px] font-bold rounded-full">

                    {notifications.filter((n) => !n.read).length}

                  </span>

                )}

              </button>


              <NotificationsPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications}
                onMarkRead={markAsRead}
                onMarkAllRead={markAllAsRead}
              />

            </div>


            {/* =================================
                USER PROFILE
            ================================= */}

            <div className="relative">

              <button
                onClick={() =>
                  setUserDropdownOpen(!userDropdownOpen)
                }
                className="flex items-center gap-2 bg-[#f7f0e6] border border-[#eee0ce] p-1.5 pr-2.5 rounded-xl hover:bg-[#eee0ce] transition-all"
              >

                <div
                  className={`w-8 h-8 rounded-lg ${
                    currentUser.avatarBg || 'bg-[#9e6133]'
                  } text-white flex items-center justify-center text-xs font-bold`}
                >

                  {currentUser.name?.charAt(0)}

                </div>


                <span className="hidden sm:block text-xs font-bold max-w-[90px] truncate">

                  {currentUser.name?.split(' ')[0]}

                </span>


                <ChevronDown className="w-3.5 h-3.5 text-[#814a27]" />

              </button>


              {/* User Dropdown */}

              {userDropdownOpen && (

                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#eee0ce] p-3 space-y-2 z-50">


                  <div className="border-b border-[#f7f0e6] pb-3">

                    <p className="text-xs font-extrabold text-[#2d180c]">
                      {currentUser.name}
                    </p>

                    <p className="text-[11px] text-[#814a27]/70 truncate">
                      {currentUser.email}
                    </p>

                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#2d180c] hover:text-white"
                  >
                    My Dashboard
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>


                  <Link
                    to="/guardians"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#2d180c] hover:text-white"
                  >
                    My Guardians
                    <Users className="w-4 h-4" />
                  </Link>


                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#2d180c] hover:text-white"
                  >
                    My Profile
                    <UserCheck className="w-4 h-4" />
                  </Link>


                  <Link
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#2d180c] hover:text-white"
                  >
                    Settings
                    <Sparkles className="w-4 h-4" />
                  </Link>


                  {/* Logout */}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-[#814a27] hover:bg-[#2d180c] hover:text-white"
                  >

                    Sign Out

                    <LogOut className="w-4 h-4" />

                  </button>

                </div>

              )}

            </div>


            {/* =================================
                SOS BUTTON
            ================================= */}

            <button
              onClick={onTriggerSOS}
              className="relative bg-gradient-to-r from-[#9e6133] to-[#814a27] text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 hover:shadow-lg transition-all"
            >

              <ShieldAlert className="w-4 h-4" />

              <span className="hidden sm:inline">
                SOS
              </span>


              {activeSOSCount > 0 && (

                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full animate-pulse">

                  {activeSOSCount}

                </span>

              )}

            </button>


            {/* =================================
                MOBILE MENU
            ================================= */}

            <button
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="md:hidden p-2 rounded-xl bg-[#f7f0e6]"
            >

              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

      </div>


      {/* =========================================
          MOBILE MENU
      ========================================= */}

      {mobileMenuOpen && (

        <div className="md:hidden border-t border-[#eee0ce] bg-[#fdfbf7] p-4 space-y-2">

          {navLinks.map((link) => {

            const Icon = link.icon;


            {/* Fake Call */}

            if (link.path === '/fake-call') {

              return (

                <button
                  key={link.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFakeCall();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-[#4a2b18] hover:bg-[#2d180c] hover:text-white"
                >

                  <Icon className="w-5 h-5" />

                  {link.name}

                </button>

              );

            }


            return (

              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl text-sm font-bold ${
                    isActive
                      ? 'bg-[#2d180c] text-white'
                      : 'text-[#4a2b18] hover:bg-[#2d180c] hover:text-white'
                  }`
                }
              >

                <Icon className="w-5 h-5" />

                {link.name}


                {link.badge > 0 && (

                  <span className="ml-auto min-w-5 h-5 px-1.5 flex items-center justify-center bg-[#9e6133] text-white text-[10px] font-bold rounded-full">

                    {link.badge}

                  </span>

                )}

              </NavLink>

            );

          })}


          {/* Mobile SOS + Notification */}

          <div className="flex gap-2 mt-3">

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTriggerSOS();
              }}
              className="flex-1 bg-[#9e6133] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >

              <ShieldAlert className="w-5 h-5" />

              TRIGGER SOS

            </button>


            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setNotificationsOpen(true);
              }}
              className="p-3 rounded-xl bg-[#f7f0e6] text-[#814a27]"
            >

              <Bell className="w-5 h-5" />

            </button>

          </div>

        </div>

      )}

    </header>

  );
};


export default Navbar;