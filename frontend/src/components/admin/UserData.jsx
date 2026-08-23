import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit, Search, Shield, User, Mail, X } from 'lucide-react';

export const UserData = ({ 
  usersList = [], 
  currentUser, 
  onDeleteUser, 
  onToggleUserStatus, 
  onAddUser, 
  onEditUser 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'user', 
    status: 'Active' 
  });

  const filteredUsers = usersList.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    if (onAddUser) {
      onAddUser({ ...newUser, id: Date.now() });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'user', status: 'Active' });
    }
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    if (onEditUser && editingUser) {
      onEditUser(editingUser);
      setShowEditModal(false);
      setEditingUser(null);
    }
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-[#2d180c] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#9e6133]" />
            User Management
            <span className="ml-2 text-xs font-bold text-[#814a27]/70 bg-[#f7f0e6] px-2.5 py-0.5 rounded-full border border-[#eee0ce]">
              {usersList.length} registered
            </span>
          </h3>
          <p className="text-xs text-[#814a27]/80 mt-1">Manage user accounts, roles, and safety profile statuses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md shadow-[#9e6133]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#814a27]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full bg-white border border-[#eee0ce] rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] shadow-sm placeholder-[#814a27]/40"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#eee0ce] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fdfbf7] border-b border-[#eee0ce]">
              <tr>
                <th className="px-5 py-3.5 text-left font-black text-[#814a27] uppercase tracking-wider text-[11px]">User</th>
                <th className="px-5 py-3.5 text-left font-black text-[#814a27] uppercase tracking-wider text-[11px]">Email</th>
                <th className="px-5 py-3.5 text-left font-black text-[#814a27] uppercase tracking-wider text-[11px]">Role</th>
                <th className="px-5 py-3.5 text-left font-black text-[#814a27] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-3.5 text-left font-black text-[#814a27] uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userId = user.id || user._id;
                const currentUserId = currentUser?.id || currentUser?._id;
                const isCurrent = userId === currentUserId;
                const isActive = (user.status || 'Active').toLowerCase() === 'active';

                return (
                  <tr key={userId} className="border-b border-[#f7f0e6] hover:bg-[#fdfbf7] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#2d180c]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#f7f0e6] text-[#9e6133] flex items-center justify-center text-xs font-black border border-[#eee0ce]">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-extrabold">{user.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#9e6133]/15 text-[#9e6133] px-2 py-0.5 rounded-full font-bold">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#814a27]/80 font-medium">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-[#f7f0e6] text-[#814a27] border-[#eee0ce]'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3 text-purple-600" /> : <User className="w-3 h-3 text-[#9e6133]" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-[#814a27] hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus && onToggleUserStatus(userId)}
                          className="p-2 text-[#814a27] hover:text-[#2d180c] hover:bg-[#f7f0e6] rounded-xl transition-colors text-xs cursor-pointer"
                          title={isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {isActive ? '🔒' : '🔓'}
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                onDeleteUser && onDeleteUser(userId);
                              }
                            }}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-[#814a27]/60 text-xs font-medium">
            No matching user profiles found.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#2d180c] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee0ce] pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-[#2d180c]">
                <Plus className="w-5 h-5 text-emerald-600" /> Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#814a27] hover:text-[#2d180c] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  placeholder="e.g. Sita Sharma"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Account Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none cursor-pointer"
                >
                  <option value="user">User (Standard Citizen)</option>
                  <option value="admin">Admin (Emergency Dispatcher)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#f7f0e6] text-[#814a27] font-extrabold py-3 rounded-2xl hover:bg-[#eee0ce] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 rounded-2xl transition-colors shadow-md shadow-[#9e6133]/25 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#2d180c] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee0ce] pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-[#2d180c]">
                <Edit className="w-5 h-5 text-[#9e6133]" /> Edit User Profile
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#814a27] hover:text-[#2d180c] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Account Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-[#f7f0e6] text-[#814a27] font-extrabold py-3 rounded-2xl hover:bg-[#eee0ce] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3 rounded-2xl transition-colors shadow-md shadow-[#9e6133]/25 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};