// HelplineRegister.js
import React, { useState } from 'react';
import { Plus, Trash2, Edit, Phone, Shield, Heart, Ambulance, Flame } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { id: '1', title: 'Emergency Police', number: '100', category: 'Police', icon: 'Shield' },
  { id: '2', title: 'Tourist Police', number: '1144', category: 'Police', icon: 'Shield' },
  { id: '3', title: 'Women & Children', number: '104', category: 'Women & Children', icon: 'Heart' },
  { id: '4', title: 'Ambulance Service', number: '102', category: 'Ambulance', icon: 'Ambulance' },
  { id: '5', title: 'Fire Brigade', number: '101', category: 'Fire Brigade', icon: 'Flame' },
];

const CATEGORY_ICONS = {
  'Police': Shield,
  'Women & Children': Heart,
  'Ambulance': Ambulance,
  'Fire Brigade': Flame,
  'Helpline': Phone,
};

const CATEGORY_COLORS = {
  'Police': 'border-blue-500/50 bg-blue-950/20',
  'Women & Children': 'border-pink-500/50 bg-pink-950/20',
  'Ambulance': 'border-emerald-500/50 bg-emerald-950/20',
  'Fire Brigade': 'border-red-500/50 bg-red-950/20',
  'Helpline': 'border-[#cb9d75]/50 bg-[#3d2212]/20',
};

export const HelplineRegister = () => {
  const [helplinesList, setHelplinesList] = useState(() => {
    const saved = localStorage.getItem("shield_registered_helplines");
    return saved ? JSON.parse(saved) : EMERGENCY_NUMBERS;
  });
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState('Police');

  const [editingHelpline, setEditingHelpline] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editCategory, setEditCategory] = useState('Police');

  const handleAddHelpline = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNumber.trim()) return;

    const newObj = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      number: newNumber,
      category: newCategory,
      icon: 'Phone',
    };

    const updated = [newObj, ...helplinesList];
    setHelplinesList(updated);
    localStorage.setItem("shield_registered_helplines", JSON.stringify(updated));
    setNewTitle('');
    setNewNumber('');
  };

  const handleDeleteHelpline = (id) => {
    if (!window.confirm('Are you sure you want to remove this helpline?')) return;
    const updated = helplinesList.filter((item) => item.id !== id);
    setHelplinesList(updated);
    localStorage.setItem("shield_registered_helplines", JSON.stringify(updated));
  };

  const openEditHelpline = (num) => {
    setEditingHelpline(num);
    setEditTitle(num.title);
    setEditNumber(num.number);
    setEditCategory(num.category);
  };

  const handleEditHelplineSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editNumber.trim()) return;

    const updated = helplinesList.map((item) =>
      item.id === editingHelpline.id
        ? { ...item, title: editTitle, number: editNumber, category: editCategory }
        : item
    );
    setHelplinesList(updated);
    localStorage.setItem("shield_registered_helplines", JSON.stringify(updated));
    setEditingHelpline(null);
  };

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Phone;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Add Helpline Form */}
      <div className="bg-[#28150a] rounded-3xl p-6 border border-[#3d2212] space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" /> Add Official Emergency Helpline
        </h3>
        <p className="text-xs text-[#cb9d75]/60">Add new emergency contact numbers for citizens to access during emergencies</p>

        <form onSubmit={handleAddHelpline} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#cb9d75]/80 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Tourist Police"
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
              placeholder="e.g., 1144"
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
              <option value="Police">🚔 Police</option>
              <option value="Women & Children">👩 Women & Children</option>
              <option value="Ambulance">🚑 Ambulance</option>
              <option value="Fire Brigade">🔥 Fire Brigade</option>
              <option value="Helpline">📞 General Helpline</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Helpline
            </button>
          </div>
        </form>
      </div>

      {/* Helplines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {helplinesList.map((num) => (
          <div
            key={num.id}
            className={`bg-[#28150a] rounded-2xl p-5 border ${CATEGORY_COLORS[num.category] || 'border-[#3d2212]'} 
              flex items-start justify-between gap-3 shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#cb9d75]">
                  {getCategoryIcon(num.category)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1a0c05] text-[#cb9d75] border border-[#3d2212] px-2 py-0.5 rounded">
                  {num.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{num.title}</h4>
              <div className="text-lg font-mono font-black text-emerald-400 mt-1">
                <a href={`tel:${num.number}`} className="hover:text-emerald-300 transition-colors">
                  {num.number}
                </a>
              </div>
              <div className="text-[10px] text-[#cb9d75]/40 mt-1">24/7 Emergency Service</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditHelpline(num)}
                className="p-2 text-[#cb9d75]/60 hover:text-emerald-400 hover:bg-[#3d2212] rounded-xl transition-colors cursor-pointer"
                title="Edit helpline"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteHelpline(num.id)}
                className="p-2 text-[#cb9d75]/60 hover:text-red-400 hover:bg-[#3d2212] rounded-xl transition-colors cursor-pointer"
                title="Remove helpline"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Helpline Modal */}
      {editingHelpline && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 max-w-md w-full text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#3d2212] pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#cb9d75]" /> Edit Helpline Number
              </h3>
              <button onClick={() => setEditingHelpline(null)} className="text-[#cb9d75] hover:text-white cursor-pointer text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditHelplineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[#cb9d75]/80 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl p-2.5 font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="Police">🚔 Police</option>
                  <option value="Women & Children">👩 Women & Children</option>
                  <option value="Ambulance">🚑 Ambulance</option>
                  <option value="Fire Brigade">🔥 Fire Brigade</option>
                  <option value="Helpline">📞 General Helpline</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHelpline(null)}
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