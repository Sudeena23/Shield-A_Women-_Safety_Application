import React, { useState } from 'react';
import { PhoneCall, Search } from 'lucide-react';
import { EmergencyCard } from '../components/EmergencyCard';
import { EMERGENCY_NUMBERS } from '../data/mockData';

export const EmergencyNumbers = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNumbers = EMERGENCY_NUMBERS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#2d180c] via-[#4a2b18] to-[#2d180c] rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4 border border-[#683c22]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9e6133]/30 text-[#cb9d75] border border-[#9e6133]/40 text-xs font-black uppercase tracking-wider">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#cb9d75]" /> 24/7 Verified Emergency Hotlines
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Emergency Helplines & Rescue Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-[#eee0ce]/80 max-w-2xl leading-relaxed">
          Critical emergency numbers in Nepal are 1-tap away. Instant direct connection to official Nepal Police (100), National Women Commission (1145), Red Cross Ambulance (102), Fire Brigade (101), Traffic Patrol (103), and specialized crisis helplines.
        </p>
      </div>



      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#eee0ce] shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search helpline, police, medical..."
            className="w-full bg-[#fbf7f2] border border-[#eee0ce] text-[#2d180c] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Women', 'General', 'Police', 'Medical', 'Helpline'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#9e6133] text-white shadow-md shadow-[#9e6133]/20'
                  : 'bg-[#f7f0e6] text-[#814a27] hover:bg-[#eee0ce]'
              }`}
            >
              {cat === 'Women' ? 'Women Helplines' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Emergency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNumbers.map((emergency) => (
          <EmergencyCard
            key={emergency.id}
            emergency={emergency}
          />
        ))}
      </div>

    </div>
  );
};

