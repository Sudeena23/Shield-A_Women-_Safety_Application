import React, { useState } from 'react';
import { Plus, Trash2, Edit, Phone, Shield, Heart, Ambulance, Flame, X } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { id: '1', title: 'Emergency Police', number: '100', category: 'Police', icon: 'Shield' },
  { id: '2', title: 'Tourist Police', number: '1144', category: 'Police', icon: 'Shield' },
  { id: '3', title: 'Women & Children Commission', number: '1145', category: 'Women & Children', icon: 'Heart' },
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
    return <Icon className="w-4 h-4 text-[#9e6133]" />;
  };

  return (
    <div className="space-y-6">
      {/* Add Helpline Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#eee0ce] shadow-sm space-y-4">
        <h3 className="text-lg font-black text-[#2d180c] flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" /> Add Official Emergency Helpline
        </h3>
        <p className="text-xs text-[#814a27]/80">Configure emergency contact numbers available to all users across the mobile and web app.</p>

        <form onSubmit={handleAddHelpline} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Tourist Police"
              className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="e.g. 1144"
              className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none cursor-pointer"
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
              className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#9e6133]/25 cursor-pointer"
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
            className="bg-white rounded-3xl p-6 border border-[#eee0ce] flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                {getCategoryIcon(num.category)}
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce] px-2.5 py-0.5 rounded-full">
                  {num.category}
                </span>
              </div>
              <h4 className="text-sm font-black text-[#2d180c]">{num.title}</h4>
              <div className="text-xl font-mono font-black text-emerald-700">
                <a href={`tel:${num.number}`} className="hover:underline">
                  {num.number}
                </a>
              </div>
              <div className="text-[11px] text-[#814a27]/70 font-medium">24/7 Verified Emergency Helpline</div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditHelpline(num)}
                className="p-2 text-[#814a27] hover:text-[#2d180c] hover:bg-[#f7f0e6] rounded-xl transition-colors cursor-pointer"
                title="Edit Helpline"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteHelpline(num.id)}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Helpline"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingHelpline && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#eee0ce] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#2d180c] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee0ce] pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#9e6133]" /> Edit Helpline
              </h3>
              <button onClick={() => setEditingHelpline(null)} className="text-[#814a27] hover:text-[#2d180c] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditHelplineSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-mono font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#2d180c] mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-2.5 font-bold text-[#2d180c] focus:outline-none cursor-pointer"
                >
                  <option value="Police">🚔 Police</option>
                  <option value="Women & Children">👩 Women & Children</option>
                  <option value="Ambulance">🚑 Ambulance</option>
                  <option value="Fire Brigade">🔥 Fire Brigade</option>
                  <option value="Helpline">📞 General Helpline</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingHelpline(null)}
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