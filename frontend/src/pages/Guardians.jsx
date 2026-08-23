import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Heart,
  X,
  CheckCircle2,
  Shield,
  AlertCircle,
  Phone,
  Edit3,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Info,
  HeartHandshake
} from 'lucide-react';
import { GuardianCard } from '../components/GuardianCard';
import { guardianService } from '../services/guardianService';

/**
 * ============================================================================
 * GUARDIAN MANAGEMENT PAGE COMPONENT
 * ============================================================================
 * 
 * Allows women and users to manage their personal safety circle:
 * - Add new emergency contacts (Parents, Siblings, Partners, Friends).
 * - Mark a primary emergency contact for prioritized dispatch.
 * - Test SMS & alert connection with visual feedback.
 * - Edit contact details or remove outdated guardians.
 * ============================================================================
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Mother',
    isPrimary: false,
  });

  // Notification Toast (Success or Error)
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, message) => {
    setToastMessage({ type, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
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
      email: '',
      relationship: 'Mother',
      isPrimary: guardians.length === 0, // Auto-mark primary if first guardian
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      name: guardian.name,
      phone: guardian.phone,
      email: guardian.email || '',
      relationship: guardian.relationship || 'Mother',
      isPrimary: !!guardian.isPrimary,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('error', 'Please provide both Guardian Name and Phone Number.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGuardian) {
        await onUpdateGuardian({
          ...editingGuardian,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email ? formData.email.trim() : '',
          relationship: formData.relationship,
          isPrimary: formData.isPrimary,
        });
        showToast('success', `Updated guardian "${formData.name.trim()}" successfully.`);
      } else {
        await onAddGuardian({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email ? formData.email.trim() : '',
          relationship: formData.relationship,
          isPrimary: formData.isPrimary,
          status: 'Active',
          avatarBg: ['bg-[#9e6133]', 'bg-[#814a27]', 'bg-[#4a2b18]', 'bg-[#b87b48]', 'bg-[#cb9d75]'][
            Math.floor(Math.random() * 5)
          ],
        });
        showToast('success', `Added "${formData.name.trim()}" to your emergency guardian circle.`);
      }
      resetForm();
    } catch (err) {
      showToast('error', err.message || 'Failed to save guardian. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guardianId, guardianName) => {
    if (!window.confirm(`Are you sure you want to remove ${guardianName || 'this guardian'} from your emergency contacts?`)) {
      return;
    }

    try {
      await onDeleteGuardian(guardianId);
      showToast('success', `Guardian removed from emergency list.`);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete guardian.');
    }
  };

  const handleSetPrimary = async (guardianId) => {
    try {
      await onSetPrimaryGuardian(guardianId);
      showToast('success', `Primary guardian updated.`);
    } catch (err) {
      showToast('error', err.message || 'Failed to set primary guardian.');
    }
  };

  const handleTestAlert = async (guardian) => {
    try {
      const res = await guardianService.testAlert(guardian.id || guardian._id);
      if (guardian.email) {
        showToast(
          'success',
          `🚨 Test SOS alert & email dispatched to ${guardian.name} (${guardian.email})!`
        );
      } else {
        showToast(
          'success',
          `Test alert notification simulated for ${guardian.name} (${guardian.phone}).`
        );
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to dispatch test alert.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ====================================================================
          HEADER SECTION
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eee0ce] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#814a27] uppercase tracking-widest bg-[#f7f0e6] px-3.5 py-1 rounded-full border border-[#eee0ce] w-fit mb-2">
            <Users className="w-3.5 h-3.5 text-[#9e6133]" />
            <span>Emergency Guardians Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2d180c] tracking-tight">
            Guardian Network
          </h1>
          <p className="text-sm text-[#814a27]/80 mt-1 max-w-2xl">
            Trusted contacts who receive instant SOS alerts, live GPS location breadcrumbs, and emergency phone notifications whenever you trigger distress mode.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#9e6133]/20 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer btn-primary shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </div>

      {/* ====================================================================
          FEEDBACK TOAST ALERTS
          ==================================================================== */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-md animate-fadeIn border ${
            toastMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ====================================================================
          ADD / EDIT GUARDIAN FORM (Modal / Inline Card)
          ==================================================================== */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#eee0ce] shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-[#f7f0e6] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#f7f0e6] text-[#9e6133] rounded-2xl border border-[#eee0ce]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#2d180c]">
                  {editingGuardian ? 'Edit Guardian Details' : 'Add Emergency Guardian'}
                </h3>
                <p className="text-xs text-[#814a27]/70">
                  {editingGuardian ? 'Update contact and emergency dispatch settings' : 'Add a trusted person to receive SOS location coordinates'}
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="p-2 text-[#814a27]/60 hover:text-[#2d180c] rounded-xl hover:bg-[#f7f0e6] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Full Name <span className="text-[#9e6133]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Mobile Phone Number <span className="text-[#9e6133]">*</span>
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

            {/* Guardian Email for SOS alerts */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Email Address (For Instant SOS Mail)</span>
                <span className="text-[10px] font-normal text-[#814a27]/70">Optional</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. guardian@example.com"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-extrabold text-[#2d180c] uppercase tracking-wider mb-2">
                Relationship to You
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Partner / Spouse">Partner / Spouse</option>
                <option value="Best Friend">Best Friend</option>
                <option value="Relative">Relative</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Community Safety Officer">Community Safety Officer</option>
                <option value="Colleague / Manager">Colleague / Manager</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Primary Guardian Switch */}
            <div className="flex flex-col justify-center pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-[#fdfbf7] p-3 rounded-xl border border-[#eee0ce]">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-5 h-5 text-[#9e6133] rounded border-[#eee0ce] focus:ring-[#9e6133]"
                />
                <div>
                  <span className="text-xs font-extrabold text-[#2d180c] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#9e6133] fill-[#9e6133]" />
                    Set as Primary Guardian
                  </span>
                  <span className="text-[11px] text-[#814a27]/70 block mt-0.5">
                    First contact notified during SOS emergency calls
                  </span>
                </div>
              </label>
            </div>

            {/* Information notice */}
            <div className="md:col-span-2 p-3 bg-[#f7f0e6] rounded-2xl border border-[#eee0ce] flex items-start gap-2.5 text-xs text-[#814a27]">
              <Info className="w-4 h-4 text-[#9e6133] shrink-0 mt-0.5" />
              <span>
                Guardians receive immediate priority alerts with your live Google Maps GPS coordinates and 1-tap emergency calling whenever SOS is activated.
              </span>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-[#f7f0e6]">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-[#eee0ce] text-[#2d180c] font-bold text-xs hover:bg-[#f7f0e6] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold text-xs shadow-md cursor-pointer btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingGuardian ? 'Save Changes' : 'Add Guardian Now'}</span>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ====================================================================
          GUARDIANS CARD GRID OR EMPTY STATE
          ==================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#2d180c]">
            Active Guardian Network ({guardians.length})
          </h2>
          <span className="text-xs text-[#814a27]/70 font-medium">
            24/7 Encrypted Signal Active
          </span>
        </div>

        {guardians.length === 0 ? (
          /* Empty State */
          <div className="bg-[#fdfbf7] border-2 border-dashed border-[#eee0ce] rounded-3xl p-12 text-center space-y-6 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-[#f7f0e6] text-[#9e6133] mx-auto flex items-center justify-center border border-[#eee0ce]">
              <Shield className="w-12 h-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-[#2d180c]">No Emergency Guardians Added Yet</h3>
              <p className="text-xs sm:text-sm text-[#814a27]/80 leading-relaxed">
                Add trusted family members, friends, or local safety contacts so Shield can instantly broadcast distress alerts and live GPS tracking coordinates during emergency SOS presses.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#9e6133]/20 text-xs uppercase tracking-wider cursor-pointer btn-primary inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Your First Guardian</span>
            </button>
          </div>
        ) : (
          /* Guardians Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guardians.map((g) => (
              <div key={g.id || g._id} className="transition-all duration-300 hover:-translate-y-1">
                <GuardianCard
                  guardian={g}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => handleDelete(id, g.name)}
                  onTestAlert={handleTestAlert}
                  onSetPrimary={handleSetPrimary}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
