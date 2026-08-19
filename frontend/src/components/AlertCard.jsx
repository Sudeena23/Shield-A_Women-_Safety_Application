import React from 'react';
import { ShieldAlert, Radio, Bell, CheckCircle2, MapPin, Clock } from 'lucide-react';

export const AlertCard = ({ alert }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'SOS':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'Location':
        return <Radio className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getBg = () => {
    switch (alert.type) {
      case 'SOS':
        return 'bg-red-50 border-red-200';
      case 'Location':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-start gap-3">
      <div className={`p-3 rounded-2xl border ${getBg()} shrink-0`}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-extrabold text-slate-900 truncate">
            {alert.title}
          </h4>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              alert.status === 'Resolved'
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {alert.status}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{alert.location}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {alert.timestamp}
          </span>
        </div>

        {alert.recipientsCount && (
          <div className="mt-2 text-[11px] font-semibold text-slate-500 bg-slate-50 inline-block px-2 py-0.5 rounded-md border border-slate-200/60">
            Broadcasting to {alert.recipientsCount} guardians
          </div>
        )}
      </div>
    </div>
  );
};
