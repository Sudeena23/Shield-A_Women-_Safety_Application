import React, { useState } from 'react';
import { Phone, Edit3, Trash2, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const GuardianCard = ({
  guardian,
  onEdit,
  onDelete,
  onTestAlert,
  onSetPrimary,
}) => {
  const [testSent, setTestSent] = useState(false);

  const handleTest = () => {
    if (onTestAlert) {
      onTestAlert(guardian);
    }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#eee0ce] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {guardian.isPrimary ? (
        <div className="absolute top-0 right-0 bg-[#9e6133] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
          <Heart className="w-3 h-3 fill-white" />
          Primary Guardian
        </div>
      ) : (
        onSetPrimary && (
          <button
            onClick={() => onSetPrimary(guardian.id)}
            className="absolute top-2 right-2 text-[#814a27]/60 hover:text-[#814a27] bg-[#f7f0e6] hover:bg-[#eee0ce] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#eee0ce] transition-all cursor-pointer flex items-center gap-1"
            title="Mark as Primary"
          >
            <Heart className="w-3 h-3" /> Set Primary
          </button>
        )
      )}

      <div>
        <div className="flex items-center gap-3 mb-4 pt-1">
          <div
            className={`w-12 h-12 rounded-2xl ${guardian.avatarBg || 'bg-[#9e6133]'} text-white font-extrabold text-lg flex items-center justify-center shadow-xs shrink-0`}
          >
            {guardian.name.charAt(0)}
          </div>
          <div className="pr-12">
            <h3 className="text-base font-extrabold text-[#2d180c] group-hover:text-[#9e6133] transition-colors">
              {guardian.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#814a27]/70 mt-0.5">
              <span className="font-semibold text-[#814a27] bg-[#f7f0e6] px-2 py-0.5 rounded-md border border-[#eee0ce]">
                {guardian.relationship}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                {guardian.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#fdfbf7] border border-[#eee0ce] rounded-xl p-3 mb-4 space-y-1">
          <div className="text-[11px] text-[#814a27]/60 font-medium uppercase tracking-wider">Contact Line</div>
          <div className="text-sm font-extrabold text-[#2d180c] font-mono flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#814a27]" />
            {guardian.phone}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#eee0ce]">
        <a
          href={`tel:${guardian.phone}`}
          className="flex-1 bg-[#2d180c] hover:bg-[#4a2b18] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          Call
        </a>

        <button
          onClick={handleTest}
          className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
            testSent
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-[#f7f0e6] hover:bg-[#eee0ce] border-[#eee0ce] text-[#814a27]'
          }`}
        >
          {testSent ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Alert Sent!
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#814a27]" />
              Test Alert
            </>
          )}
        </button>

        <button
          onClick={() => onEdit(guardian)}
          className="p-2.5 rounded-xl border border-[#eee0ce] text-[#814a27] hover:text-[#2d180c] hover:bg-[#f7f0e6] transition-colors cursor-pointer"
          title="Edit Guardian"
          aria-label="Edit Guardian"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(guardian.id)}
          className="p-2.5 rounded-xl border border-[#eee0ce] text-[#814a27]/60 hover:text-[#814a27] hover:bg-[#f7f0e6] transition-colors cursor-pointer"
          title="Delete Guardian"
          aria-label="Delete Guardian"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
