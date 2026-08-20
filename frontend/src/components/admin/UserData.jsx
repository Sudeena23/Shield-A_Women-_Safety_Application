// UserData.js
import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit, Search, Shield, User, Mail } from 'lucide-react';

export const UserData = ({ 
  usersList, 
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
    status: 'active' 
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
      setNewUser({ name: '', email: '', role: 'user', status: 'active' });
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
      <div className="bg-[#28150a] rounded-3xl p-6 border border-[#3d2212] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#cb9d75]" />
            User Management
            <span className="ml-2 text-xs font-normal text-[#cb9d75]/60">({usersList.length} registered)</span>
          </h3>
          <p className="text-xs text-[#cb9d75]/60 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#9e6133]/20"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#cb9d75]/50 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#28150a] rounded-3xl border border-[#3d2212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#1a0c05] border-b border-[#3d2212]">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-[#cb9d75]/70">User</th>
                <th className="px-4 py-3 text-left font-bold text-[#cb9d75]/70">Email</th>
                <th className="px-4 py-3 text-left font-bold text-[#cb9d75]/70">Role</th>
                <th className="px-4 py-3 text-left font-bold text-[#cb9d75]/70">Status</th>
                <th className="px-4 py-3 text-left font-bold text-[#cb9d75]/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userId = user.id || user._id;
                const currentUserId = currentUser?.id || currentUser?._id;
                const isCurrent = userId === currentUserId;
                const isActive = (user.status || 'Active').toLowerCase() === 'active';

                return (
                  <tr key={userId} className="border-b border-[#3d2212] hover:bg-[#1a0c05]/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3d2212] flex items-center justify-center text-xs font-black border border-[#522f18]">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        {user.name}
                        {isCurrent && (
                          <span className="text-[10px] bg-[#9e6133]/30 text-[#cb9d75] px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#cb9d75]/80">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-[#3d2212] text-[#cb9d75] border border-[#522f18]'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-[#cb9d75]/60 hover:text-emerald-400 hover:bg-[#3d2212] rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleUserStatus && onToggleUserStatus(userId)}
                          className="p-1.5 text-[#cb9d75]/60 hover:text-[#cb9d75] hover:bg-[#3d2212] rounded-lg transition-colors text-sm cursor-pointer"
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
                            className="p-1.5 text-[#cb9d75]/60 hover:text-red-400 hover:bg-[#3d2212] rounded-lg transition-colors cursor-pointer"
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
          <div className="text-center py-8 text-[#cb9d75]/60">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 max-w-md w-full text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#cb9d75] hover:text-white cursor-pointer text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#3d2212] text-[#e0c8ad] font-bold py-2.5 rounded-xl hover:bg-[#522f18] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl transition-colors shadow-md"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 max-w-md w-full text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#cb9d75]" /> Edit User
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#cb9d75] hover:text-white cursor-pointer text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-[#3d2212] text-[#e0c8ad] font-bold py-2.5 rounded-xl hover:bg-[#522f18] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl transition-colors shadow-md"
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