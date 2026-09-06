import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  X,
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  UserPlus,
  HeartPulse,
  RefreshCw
} from 'lucide-react';
export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'login',
}) => {
  const [isLoginTab, setIsLoginTab] = useState(initialTab === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsLoginTab(initialTab === 'login');
      setErrorMessage(null);
    }
  }, [isOpen, initialTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (isLoginTab) {
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
        if (response.user.role === 'admin') {
          await authService.logout();
          setErrorMessage('Access denied.');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(response.user);
        onClose();
      } catch (err) {
        setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setErrorMessage('Please fill in all required fields (Name, Email, Phone, Password).');
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
          medicalNotes: 'Personal safety profile created via Shield app',
        });
        onLoginSuccess(response.user);
        onClose();
      } catch (err) {
        setErrorMessage(err.message || 'Account creation failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1b1d]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#292b2e] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#3e4247] shadow-2xl relative space-y-5 text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#8b9198] hover:text-white hover:bg-[#1b1c1e] rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 border-b border-[#3e4247] pb-4">
          <div className="p-3 bg-[#3d2715] text-[#cb9d75] rounded-2xl border border-[#8e4e13]">
            <Shield className="w-6 h-6 fill-[#8e4e13]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              {isLoginTab ? 'Login to Shield' : 'Create an Account'}
            </h3>
            <p className="text-xs text-[#b2a798]">Access 24/7 personal safety tools and guardian alerts</p>
          </div>
        </div>
        <div className="flex bg-[#1b1c1e] p-1 rounded-xl border border-[#3e4247]">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isLoginTab ? 'bg-[#8e4e13] text-white shadow-md' : 'text-[#9c958a] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isLoginTab ? 'bg-[#8e4e13] text-white shadow-md' : 'text-[#9c958a] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8b9198] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Riya Sharma"
                  className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8b9198] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@shield.com"
                className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
              />
            </div>
          </div>
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8b9198] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 9841-382910"
                  className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8b9198] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
                Blood Group (Optional for First Responders)
              </label>
              <div className="relative">
                <HeartPulse className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#cb9d75] cursor-pointer"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg} className="bg-[#1b1c1e] text-white">
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#8e4e13] to-[#a65c17] hover:from-[#a65c17] hover:to-[#be6b1d] text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isLoginTab ? 'Login' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
