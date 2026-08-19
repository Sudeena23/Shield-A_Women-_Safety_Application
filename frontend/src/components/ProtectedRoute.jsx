import React from 'react';
import { Lock, Shield, LogIn, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProtectedRoute = ({
  currentUser,
  onOpenAuthModal,
  allowedRole, // 'user' | 'admin' | ['user', 'admin']
  requiredRole, // 'user' | 'admin' | ['user', 'admin']
  children,
  featureName = 'this feature',
}) => {
  const navigate = useNavigate();
  const targetRoles = requiredRole || allowedRole;

  // 1. Not Logged In
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-red-100 shadow-xl text-center space-y-6 relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 text-red-600 mx-auto flex items-center justify-center shadow-inner relative">
            <Lock className="w-10 h-10 stroke-[2.5]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-xs">
              !
            </div>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Authentication Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2d180c] tracking-tight">
              Sign In Required for Access
            </h2>
            <p className="text-sm text-[#814a27]/80 leading-relaxed">
              Accessing <strong className="text-[#2d180c]">{featureName}</strong> requires an active Shield safety account to secure your live GPS logs, guardian contacts, and encrypted emergency dispatch settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto bg-gradient-to-r from-[#9e6133] via-[#814a27] to-[#9e6133] hover:from-[#814a27] hover:to-[#683c22] text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-[#9e6133]/25 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4 fill-white/20" />
              <span>Sign In or Register Now</span>
            </button>
          </div>

          <div className="pt-6 border-t border-[#eee0ce] max-w-md mx-auto text-xs text-[#814a27]/70 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#9e6133] shrink-0" />
            <span>Need to test immediately? Use the quick 1-tap tester accounts inside the login screen.</span>
          </div>

        </div>
      </div>
    );
  }

  // 2. Role Verification
  if (targetRoles) {
    const rolesArray = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
    const userRole = currentUser.role || 'user';
    const isAuthorized = rolesArray.includes(userRole);

    if (!isAuthorized) {
      // Custom Access Denied (403 Forbidden) Page
      return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#28150a] text-white rounded-3xl p-8 sm:p-12 border-2 border-[#814a27] shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            <div className="w-20 h-20 rounded-3xl bg-[#3d2212] border border-[#814a27] text-[#e0c8ad] mx-auto flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-[#e0c8ad] bg-[#3d2212] px-3 py-1 rounded-full border border-[#814a27]">
                403 Access Denied • Role Restriction
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unauthorized Role Permissions
              </h2>
              <p className="text-sm text-[#cb9d75] leading-relaxed">
                You are currently signed in as <strong className="text-white">{currentUser.name}</strong> with a <strong className="text-white uppercase">[{userRole}]</strong> account. This page requires <strong className="text-[#e0c8ad] uppercase">[{rolesArray.join(' or ')}]</strong> access rights.
              </p>
            </div>

            <div className="bg-[#1a0c05] p-4 rounded-2xl border border-[#3d2212] max-w-md mx-auto text-xs text-[#cb9d75]/80 text-left space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Active Session Info
              </div>
              <div>• Account ID: <code className="text-white">{currentUser.id || 'usr-active'}</code></div>
              <div>• Assigned Role: <span className="font-bold text-[#e0c8ad] uppercase">{userRole}</span></div>
              <div>• Requested Path Feature: <span className="text-white">{featureName}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')}
                className="w-full sm:w-auto bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#9e6133]/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Return to My Authorized Dashboard ({userRole === 'admin' ? 'Admin Portal' : 'User Dashboard'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto bg-[#3d2212] hover:bg-[#522f18] text-[#e0c8ad] font-bold px-6 py-3.5 rounded-2xl border border-[#522f18] text-xs transition-all cursor-pointer"
              >
                Switch Account / Sign In as {rolesArray.join('/')}
              </button>
            </div>

          </div>
        </div>
      );
    }
  }

  // Authorized -> Render child component
  return <>{children}</>;
};

