import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  UserCheck,
  Phone,
  Heart,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { authService } from '../services/authService';
export const ProtectedRoute = ({
  currentUser,
  onOpenAuthModal,
  onLoginSuccess,
  onLogout,
  allowedRole, 
  requiredRole, 
  authLoading = false,
  children,
  featureName = 'this feature',
}) => {
  const navigate = useNavigate();
  const targetRoles = requiredRole || allowedRole;
  const rolesArray = targetRoles
    ? Array.isArray(targetRoles)
      ? targetRoles
      : [targetRoles]
    : null;
  const userRole = currentUser?.role || 'user';
  const isAuthorized =
    currentUser && (!rolesArray || rolesArray.includes(userRole));
  const isAdminPath =
    rolesArray && rolesArray.includes('admin') && !rolesArray.includes('user');
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (authTab === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter both your email address and password.');
        return;
      }
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await authService.login(email, password);
        if (isAdminPath && response.user.role !== 'admin') {
          await authService.logout();
          setErrorMessage('Access denied.');
          setIsLoading(false);
          return;
        }
        if (!isAdminPath && response.user.role === 'admin') {
          await authService.logout();
          setErrorMessage('Access denied.');
          setIsLoading(false);
          return;
        }
        if (onLoginSuccess) {
          await onLoginSuccess(response.user);
        }
      } catch (err) {
        setErrorMessage(
          err.message || 'Login failed. Please check your credentials.'
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setErrorMessage(
          'Please fill in all required fields (Name, Email, Phone, Password).'
        );
        return;
      }
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!phoneRegex.test(phone.trim().replace(/[-\s]/g, ''))) {
        setErrorMessage('Please enter a valid mobile phone number (10-15 digits).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must contain at least 6 characters.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await authService.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          bloodGroup: bloodGroup,
        });
        if (onLoginSuccess) {
          await onLoginSuccess(response.user);
        }
      } catch (err) {
        setErrorMessage(
          err.message || 'Registration failed. Please check your details.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#9e6133] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#814a27]/70 uppercase tracking-wider">
            Verifying Session Security...
          </p>
        </div>
      </div>
    );
  }
  if (isAuthorized) {
    return <>{children}</>;
  }
  if (currentUser && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
        <Shield className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-black text-[#2d180c]">Access Denied</h2>
        <p className="text-sm text-[#814a27]">
          Your account role ({userRole}) does not have permission to access {featureName}.
        </p>
        <button
          onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')}
          className="bg-[#9e6133] hover:bg-[#814a27] text-white px-6 py-2 rounded-xl font-bold transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f0e6] text-[#814a27] border border-[#eee0ce] text-xs font-black uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5 text-[#9e6133]" />
          <span>
            {isAdminPath ? 'Admin Portal Authorization' : 'Authentication Required'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#2d180c] tracking-tight">
          {isAdminPath
            ? 'Login to Admin Control Center'
            : `Login Required for ${featureName}`}
        </h2>
        <p className="text-xs sm:text-sm text-[#814a27]/80 max-w-md mx-auto">
          {isAdminPath
            ? 'Please log in with your administrator credentials or create an account.'
            : `Accessing ${featureName} requires an active safety session.`}
        </p>
      </div>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#eee0ce] shadow-xl space-y-5 relative">
        <div className="flex bg-[#f7f0e6] p-1 rounded-2xl border border-[#eee0ce]">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authTab === 'login'
                ? 'bg-[#2d180c] text-white shadow-md'
                : 'text-[#814a27] hover:text-[#2d180c]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authTab === 'register'
                ? 'bg-[#2d180c] text-white shadow-md'
                : 'text-[#814a27] hover:text-[#2d180c]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authTab === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sita Sharma"
                    className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[#2d180c] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#814a27]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#814a27]/50 hover:text-[#814a27] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-[#9e6133]/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : authTab === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>
              {isLoading
                ? 'Authenticating...'
                : authTab === 'login'
                ? 'Login'
                : 'Create Account'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
