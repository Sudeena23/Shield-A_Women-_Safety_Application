import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { alertService } from '../services/alertService';
import { userService } from '../services/userService';
import {
  ShieldAlert,
  Radio,
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  Search,
  Filter,
  Plus,
  Trash2,
  Phone,
  ShieldCheck,
  Send,
  Eye,
  FileText,
  Activity,
  UserX,
  UserCheck,
  Lock,
  Mail,
  Edit,
  TrendingUp,
  BarChart3,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../data/mockData';

export const AdminDashboard = ({
  currentUser,
  usersList = [],
  onDeleteUser,
  onToggleUserStatus,
  onAddUser,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dispatches'); // 'dispatches' | 'users' | 'pranks' | 'helplines'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/admin?tab=${tabName}`, { replace: true });
  };

  // Sync tab from URL search parameters (e.g. /admin?tab=users)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dispatches', 'users', 'pranks', 'helplines'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Load alert dispatches from alertService
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await alertService.getAlerts();
        // Map alert objects to dispatch format
        const mappedDispatches = alertsData.map((a, idx) => ({
          id: a.id || `DISP-${8900 + idx}`,
          victimName: a.user || a.victimName || 'Srijana Adhikari',
          victimPhone: a.victimPhone || '+977 9841-382910',
          bloodGroup: a.bloodGroup || 'O+',
          medicalNotes: a.medicalNotes || 'Recorded Shield Profile',
          location: a.location || 'Kathmandu, Nepal',
          triggeredAt: a.timestamp || 'Just now',
          status: a.status || 'Active',
          type: a.type || 'SOS Alert',
          guardianCount: a.recipientsCount || 2,
          duressActivated: !!a.duressActivated,
          ipLog: a.ipLog || '27.34.21.102 (Kathmandu Telecom)',
        }));
        setDispatches(mappedDispatches);
      } catch (e) {
        console.error('Failed to load alerts in admin dashboard', e);
      }
    };
    loadAlerts();
  }, []);

  // New User Form State for Admin
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  // Emergency Dispatch Feed State
  const [dispatches, setDispatches] = useState([]);

  // Helplines list managed by Admin
  const [helplinesList, setHelplinesList] = useState(EMERGENCY_NUMBERS);
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState('Police');

  const handleUpdateStatus = async (id, newStatus) => {
    setDispatches((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    try {
      await alertService.updateAlertStatus(id, newStatus);
    } catch (e) {
      console.error('Failed to update alert status via alertService', e);
    }
  };

  const handleAddHelpline = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNumber.trim()) return;

    const newObj = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      number: newNumber,
      category: newCategory,
      description: 'Official emergency helpline managed by Nepal Police Control Admin.',
      iconName: 'Shield',
      is24x7: true,
    };

    setHelplinesList([newObj, ...helplinesList]);
    setNewTitle('');
    setNewNumber('');
  };

  const handleDeleteHelpline = (id) => {
    setHelplinesList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (onAddUser) {
      onAddUser({
        id: `usr-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || '+977 9800-000000',
        role: newUserRole,
        status: 'Active',
        bloodGroup: 'O+',
        registeredAt: new Date().toISOString().split('T')[0],
      });
    }

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserOpen(false);
  };

  const filteredDispatches = dispatches.filter((item) => {
    const matchesSearch =
      item.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch)
  );

  // Strict Admin Role Check - Exclusive to Admin Accounts
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-[#28150a] border-2 border-red-900/80 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-red-950/80 border border-red-800 text-red-400 mx-auto flex items-center justify-center font-black">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Administrator Access Required</h2>
          <p className="text-xs sm:text-sm text-[#cb9d75] max-w-md mx-auto leading-relaxed">
            The Police Dispatch Control Room is restricted exclusively to administrator accounts. You are currently logged in as <strong className="text-white">{currentUser?.name || 'Visitor'}</strong> with role <strong className="uppercase text-amber-300">[{currentUser?.role || 'User'}]</strong>.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg"
            >
              Return to Citizen Safety Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0c05] text-[#f7f0e6] p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-64 h-64 text-[#cb9d75]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3d2212] text-[#cb9d75] border border-[#522f18] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-[#cb9d75]" /> Shield System Administration Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3d2212] text-[#e0c8ad] text-[10px] font-extrabold uppercase border border-[#522f18]">
                System Admin
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Control Center & User Management
            </h1>
            <p className="text-xs text-[#cb9d75]/80 max-w-2xl leading-relaxed">
              Real-time emergency alert management, user account control, platform helplines administration, and safety analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1a0c05]/90 p-3.5 rounded-2xl border border-[#3d2212] shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#3d2212] flex items-center justify-center text-[#e0c8ad] font-black text-sm border border-[#522f18]">
              🛡️
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {currentUser?.name || 'System Administrator #901'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Control Center Online
              </div>
            </div>
          </div>
        </div>

        {/* High Level KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#3d2212] text-xs">
          <div className="bg-[#1a0c05] p-4 rounded-2xl border border-[#3d2212]">
            <div className="text-[#cb9d75]/80 text-[11px] font-medium">Registered Users</div>
            <div className="text-2xl font-black text-[#e0c8ad] mt-1 font-mono">
              {usersList.length}
            </div>
          </div>

          <div className="bg-[#1a0c05] p-4 rounded-2xl border border-[#3d2212]">
            <div className="text-[#cb9d75]/80 text-[11px] font-medium">Active SOS Alerts</div>
            <div className="text-2xl font-black text-red-400 mt-1 flex items-center gap-2 font-mono">
              {dispatches.filter((d) => d.status === 'Active' || d.status === 'Unit Dispatched').length}
              <span className="text-[10px] font-normal text-red-400/80 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900">
                Live
              </span>
            </div>
          </div>

          <div className="bg-[#1a0c05] p-4 rounded-2xl border border-[#3d2212]">
            <div className="text-[#cb9d75]/80 text-[11px] font-medium">False Alarms Filtered</div>
            <div className="text-2xl font-black text-[#cb9d75] mt-1 font-mono">
              {dispatches.filter((d) => d.status === 'Accidental/Prank').length}
            </div>
          </div>

          <div className="bg-[#1a0c05] p-4 rounded-2xl border border-[#3d2212]">
            <div className="text-[#cb9d75]/80 text-[11px] font-medium">Avg Dispatch Speed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              2.4 mins
            </div>
          </div>
        </div>
      </div>



      {/* TAB 1: Live SOS Dispatches */}
      {activeTab === 'dispatches' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#28150a] p-4 rounded-2xl border border-[#3d2212]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#cb9d75]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search victim name, ID, or location..."
                className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#cb9d75]/70 shrink-0">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a0c05] border border-[#3d2212] text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active SOS</option>
                <option value="Unit Dispatched">Unit Dispatched</option>
                <option value="Accidental/Prank">Accidental/Prank</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDispatches.map((item) => (
              <div
                key={item.id}
                className={`bg-[#28150a] rounded-3xl p-6 border transition-all space-y-4 shadow-xl ${
                  item.status === 'Active'
                    ? 'border-red-500/80 shadow-red-950/40'
                    : item.status === 'Unit Dispatched'
                    ? 'border-[#cb9d75]'
                    : item.status === 'Accidental/Prank'
                    ? 'border-[#3d2212] opacity-80'
                    : 'border-emerald-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#3d2212] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#3d2212] text-white font-black flex items-center justify-center text-sm border border-[#522f18]">
                      {item.victimName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-[#cb9d75]/60">{item.id}</div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        {item.victimName}
                        {item.duressActivated && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#522f18] text-[#e0c8ad] border border-[#814a27] px-2 py-0.5 rounded">
                            Duress Mode
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      item.status === 'Active'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : item.status === 'Unit Dispatched'
                        ? 'bg-[#3d2212] text-[#e0c8ad] border-[#814a27]'
                        : item.status === 'Accidental/Prank'
                        ? 'bg-[#1a0c05] text-[#cb9d75]/70 border-[#3d2212]'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#1a0c05] p-3 rounded-2xl border border-[#3d2212] space-y-1">
                    <span className="text-[#cb9d75]/70 font-medium">Contact & Blood Group</span>
                    <div className="font-bold text-white">{item.victimPhone}</div>
                    <div className="text-red-400 font-extrabold text-[11px]">Blood: {item.bloodGroup}</div>
                  </div>

                  <div className="bg-[#1a0c05] p-3 rounded-2xl border border-[#3d2212] space-y-1">
                    <span className="text-[#cb9d75]/70 font-medium">Triggered Timestamp</span>
                    <div className="font-bold text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#cb9d75]" /> {item.triggeredAt}
                    </div>
                    <div className="text-[#cb9d75]/80 text-[11px]">{item.guardianCount} Guardians Notified</div>
                  </div>
                </div>

                <div className="bg-[#1a0c05] p-3.5 rounded-2xl border border-[#3d2212] space-y-1 text-xs">
                  <div className="text-[#cb9d75]/70 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> Live GPS Coordinates
                  </div>
                  <div className="font-bold text-[#f7f0e6]">{item.location}</div>
                </div>

                {item.medicalNotes && (
                  <div className="text-xs bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212] text-[#cb9d75]/80">
                    <strong className="text-[#e0c8ad]">Medical Notes:</strong> {item.medicalNotes}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-2 border-t border-[#3d2212]">
                  <a
                    href={`tel:${item.victimPhone}`}
                    className="flex-1 bg-[#3d2212] hover:bg-[#522f18] text-white font-bold py-2.5 px-3 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#522f18]"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Victim
                  </a>

                  {item.status !== 'Unit Dispatched' && item.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Unit Dispatched')}
                      className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#9e6133]/30"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Police Unit
                    </button>
                  )}

                  {item.status !== 'Accidental/Prank' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Accidental/Prank')}
                      className="bg-[#3d2212] hover:bg-[#522f18] text-[#e0c8ad] font-bold py-2.5 px-3 rounded-xl text-xs border border-[#814a27] transition-colors cursor-pointer"
                    >
                      Mark False Alarm
                    </button>
                  )}

                  {item.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: User Management (View All Users & Delete Users) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#28150a] p-4 rounded-2xl border border-[#3d2212]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#cb9d75]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by user name, email, or phone..."
                className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#9e6133]/30"
            >
              <UserPlus className="w-4 h-4" /> Add New Registered User
            </button>
          </div>

          {/* User Table */}
          <div className="bg-[#28150a] rounded-3xl border border-[#3d2212] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#f7f0e6]">
                <thead className="bg-[#1a0c05] text-[#cb9d75] font-extrabold uppercase tracking-wider text-[10px] border-b border-[#3d2212]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    {/* VIVA EXPLANATION - MISUSE PREVENTION CHECK 3: ADMIN ALERT COUNT */}
                    <th className="p-4">Total SOS Alerts</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Medical / Notes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d2212]">
                  {filteredUsers.map((u) => {
                    // Check 3: Simple calculation of user's total triggered alerts
                    const userTotalAlerts = dispatches.filter(
                      (d) => d.userId === u.id || d.victimName === u.name
                    ).length;

                    return (
                      <tr key={u.id} className="hover:bg-[#3d2212]/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white ${u.role === 'admin' ? 'bg-[#3d2212] text-[#e0c8ad] border border-[#814a27]' : 'bg-[#9e6133]'}`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-white text-xs flex items-center gap-2">
                                {u.name}
                                {u.id === currentUser?.id && (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#cb9d75]/80">{u.email}</div>
                              <div className="text-[10px] text-[#cb9d75]/60 font-mono">{u.phone}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              u.role === 'admin'
                                ? 'bg-[#1a0c05] text-[#e0c8ad] border-[#814a27]'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.status === 'Suspended'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.status || 'Active'}
                          </span>
                        </td>

                        {/* VIVA EXPLANATION - MISUSE PREVENTION CHECK 3: Total SOS Alerts column */}
                        <td className="p-4 font-mono font-bold">
                          <span className="px-2.5 py-1 rounded-xl bg-[#1a0c05] border border-[#3d2212] text-red-400 text-xs flex items-center gap-1 w-fit">
                            🚨 {userTotalAlerts} {userTotalAlerts === 1 ? 'alert' : 'alerts'}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[#cb9d75]/80">
                          {u.registeredAt || '2026-01-15'}
                        </td>

                        <td className="p-4 text-[#cb9d75]/80 max-w-xs truncate">
                          {u.medicalNotes || u.bloodGroup ? `[${u.bloodGroup || 'O+'}] ${u.medicalNotes || 'None'}` : 'None'}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => onToggleUserStatus && onToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-xl bg-[#3d2212] hover:bg-[#522f18] text-[#f7f0e6] text-[10px] font-bold border border-[#522f18] cursor-pointer"
                          >
                            {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                          </button>

                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                  onDeleteUser && onDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-xl border border-red-800/80 cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Manage Emergency Helplines */}
      {activeTab === 'helplines' && (
        <div className="space-y-6">
          <div className="bg-[#28150a] rounded-3xl p-6 border border-[#3d2212] space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Add Official Emergency Helpline Number
            </h3>

            <form onSubmit={handleAddHelpline} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#cb9d75]/80 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tourist Police Hotline"
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#cb9d75]/80 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="1144"
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#cb9d75]/80 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="Police">Police</option>
                  <option value="Women & Children">Women & Children</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Fire Brigade">Fire Brigade</option>
                  <option value="Helpline">General Helpline</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Add Helpline Number
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helplinesList.map((num) => (
              <div
                key={num.id}
                className="bg-[#28150a] rounded-2xl p-4 border border-[#3d2212] flex items-center justify-between gap-3 shadow-md"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1a0c05] text-[#cb9d75] border border-[#3d2212] px-2 py-0.5 rounded">
                    {num.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{num.title}</h4>
                  <div className="text-lg font-mono font-black text-emerald-400">{num.number}</div>
                </div>

                <button
                  onClick={() => handleDeleteHelpline(num.id)}
                  className="p-2 text-[#cb9d75]/60 hover:text-red-400 hover:bg-[#3d2212] rounded-xl transition-colors cursor-pointer"
                  title="Remove helpline"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 max-w-md w-full text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#cb9d75]" /> Add New Platform User / Admin
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-[#cb9d75] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Adhikari"
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+977 9841-000000"
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Role Assignment</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-[#e0c8ad] focus:outline-none cursor-pointer"
                >
                  <option value="user">User (Standard Citizen)</option>
                  <option value="admin">Admin (Police Control Room Dispatcher)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 bg-[#3d2212] text-[#e0c8ad] font-bold py-2 rounded-xl hover:bg-[#522f18] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-2 rounded-xl transition-colors shadow-md shadow-[#9e6133]/30"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
