import React, { useState } from 'react';
import { Users, UserPlus, Heart, X, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { GuardianCard } from '../components/GuardianCard';

/**
 * Guardian Management Page Component
 * List of guardian cards with add, edit, and remove,
 * smooth transition when adding or removing a card,
 * and an empty-state illustration when the list is empty.
 */
export const Guardians = ({
  guardians = [],
  onAddGuardian,
  onUpdateGuardian,
  onDeleteGuardian,
  onSetPrimaryGuardian,
}) => {
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Mother',
    isPrimary: false,
  });

  const [testNotification, setTestNotification] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      relationship: 'Mother',
      isPrimary: false,
    });
    setEditingGuardian(null);
    setIsFormOpen(false);
  };

  const handleOpenAdd = () => {
    setEditingGuardian(null);
    setFormData({
      name: '',
      phone: '',
      relationship: 'Mother',
      isPrimary: false,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      name: guardian.name,
      phone: guardian.phone,
      relationship: guardian.relationship,
      isPrimary: !!guardian.isPrimary,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingGuardian) {
      onUpdateGuardian({
        ...editingGuardian,
        name: formData.name,
        phone: formData.phone,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
      });
      setTestNotification(`Updated guardian "${formData.name}" successfully.`);
    } else {
      onAddGuardian({
        name: formData.name,
        phone: formData.phone,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
        status: 'Online',
        avatarBg: ['bg-[#9e6133]', 'bg-[#814a27]', 'bg-[#4a2b18]', 'bg-[#b87b48]', 'bg-[#cb9d75]'][
          Math.floor(Math.random() * 5)
        ],
        lastActive: 'Just now',
      });
      setTestNotification(`Added new guardian "${formData.name}" to your safety network.`);
    }

    resetForm();
    setTimeout(() => setTestNotification(null), 3000);
  };

  const handleTestAlert = (guardian) => {
    setTestNotification(`Test SMS & App Alert dispatched to ${guardian.name} (${guardian.phone}).`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eee0ce] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#814a27] uppercase tracking-widest bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce] w-fit mb-2">
            <Users className="w-3.5 h-3.5 text-[#9e6133]" /> Emergency Contacts Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2d180c] tracking-tight">
            Guardian Network
          </h1>
          <p className="text-sm text-[#814a27]/80 mt-1">
            Manage trusted family members and guardians who receive immediate SOS alerts and live GPS tracking during distress.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-[#9e6133]/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </div>

      {/* Global Toast Notification */}
      {testNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{testNotification}</span>
          </div>
          <button onClick={() => setTestNotification(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Guardian Drawer / Modal Form */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#eee0ce] shadow-2xl space-y-6 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-[#f7f0e6] text-[#9e6133] rounded-2xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#2d180c]">
                {editingGuardian ? 'Edit Guardian Details' : 'Add New Guardian Contact'}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="p-2 text-[#814a27]/60 hover:text-[#2d180c] rounded-xl hover:bg-[#f7f0e6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Srijana Adhikari"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Mobile Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +977 9841-382910"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Relationship / Role
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Best Friend">Best Friend</option>
                <option value="Partner">Partner / Spouse</option>
                <option value="Workplace Manager">Workplace Manager</option>
                <option value="Community Officer">Community Safety Officer</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-5 h-5 text-[#9e6133] rounded border-[#eee0ce] focus:ring-[#9e6133]"
                />
                <span className="text-xs font-bold text-[#2d180c] flex items-center gap-1">
                  <Heart className="w-4 h-4 text-[#9e6133] fill-[#9e6133]" /> Mark as Primary Guardian
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-[#f7f0e6]">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-[#eee0ce] text-[#2d180c] font-bold text-xs hover:bg-[#f7f0e6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold text-xs shadow-md cursor-pointer btn-primary"
              >
                {editingGuardian ? 'Save Changes' : 'Add Guardian Now'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guardians List Grid or Empty State Illustration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2d180c]">
            Active Guardian Network ({guardians.length})
          </h2>
          <span className="text-xs text-[#814a27]/70 font-medium">Automatic Emergency SMS & Dispatch Active</span>
        </div>

        {guardians.length === 0 ? (
          /* Empty State Illustration */
          <div className="bg-[#fdfbf7] border-2 border-dashed border-[#eee0ce] rounded-3xl p-12 text-center space-y-6 animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-[#f7f0e6] text-[#9e6133] mx-auto flex items-center justify-center border border-[#eee0ce]">
              <Shield className="w-12 h-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-[#2d180c]">No Emergency Guardians Added Yet</h3>
              <p className="text-xs sm:text-sm text-[#814a27]/80 leading-relaxed">
                Add your trusted family members, friends, or local safety officers so Shield can instantly dispatch distress SMS alerts and live location coordinates during emergency SOS presses.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-[#9e6133]/20 text-xs uppercase tracking-wider cursor-pointer btn-primary inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Your First Guardian</span>
            </button>
          </div>
        ) : (
          /* Card Grid with Smooth Transitions */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guardians.map((g) => (
              <div key={g.id} className="transition-all duration-300 hover:-translate-y-1">
                <GuardianCard
                  guardian={g}
                  onEdit={handleOpenEdit}
                  onDelete={onDeleteGuardian}
                  onTestAlert={handleTestAlert}
                  onSetPrimary={onSetPrimaryGuardian}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
