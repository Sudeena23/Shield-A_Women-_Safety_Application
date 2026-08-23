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
  allowedRole, // 'user' | 'admin' | ['user', 'admin']
  requiredRole, // 'user' | 'admin' | ['user', 'admin']
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

  // Form State
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

  // 0. Verification in progress -> Show clean loading spinner
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

  // 1. Authorized -> Render children directly
  if (isAuthorized) {
    return <>{children}</>;
  }

  // 2. Not authorized or not logged in as admin -> Directly load the Login and Signup form
  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Badge & Title */}
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

      {/* Auth Form Card with Login & Signup Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#eee0ce] shadow-xl space-y-5 relative">
        {/* Tab Selector: Login vs Create Account */}
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

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration specific fields */}
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

          {/* Email Address */}
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

          {/* Password */}
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

          {/* Submit Button */}
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
