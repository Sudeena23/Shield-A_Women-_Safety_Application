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
  Sparkles
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

  useEffect(() => {
    if (isOpen) {
      setIsLoginTab(initialTab === 'login');
    }
  }, [isOpen, initialTab]);

  // Form Fields
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPin, setEmergencyPin] = useState('9911');
  const [bloodGroup, setBloodGroup] = useState('O+');

  if (!isOpen) return null;

  const handleDemoFill = (type) => {
    let demoUser;
    if (type === 'admin') {
      demoUser = {
        id: 'usr-admin-01',
        name: 'System Administrator',
        email: 'admin@shield.org',
        phone: '+977 01-4228435',
        role: 'admin',
        emergencyPin: '9911',
        avatarBg: 'bg-slate-900',
        bloodGroup: 'O+',
        medicalNotes: 'Shield System Administrator #901',
      };
    } else if (type === 'sarah') {
      demoUser = {
        id: 'usr-101',
        name: 'Srijana Adhikari',
        email: 'srijana.adhikari@example.com',
        phone: '+977 9841-382910',
        role: 'user',
        emergencyPin: '9911',
        avatarBg: 'bg-rose-500',
        bloodGroup: 'O+',
        medicalNotes: 'Penicillin allergy; Contact mother in emergency',
      };
    } else {
      demoUser = {
        id: 'usr-102',
        name: 'Aaradhya Dahal',
        email: 'aaradhya.dahal@collegenepal.edu.np',
        phone: '+977 9801-721440',
        role: 'user',
        emergencyPin: '4321',
        avatarBg: 'bg-purple-600',
        bloodGroup: 'A+',
        medicalNotes: 'Asthma Inhaler required',
      };
    }

    onLoginSuccess(demoUser);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isLoginTab) {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter email and password.');
        return;
      }
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please enter a valid email format.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      try {
        const response = await authService.login(email, password);
        onLoginSuccess(response.user);
        onClose();
      } catch (err) {
        setErrorMessage(err.message || 'Login failed.');
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
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      try {
        const response = await authService.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          role: role,
          emergencyPin: emergencyPin || '9911',
          bloodGroup: bloodGroup,
        });
        onLoginSuccess(response.user);
        onClose();
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d180c]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#eee0ce] shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#814a27]/60 hover:text-[#2d180c] hover:bg-[#f7f0e6] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#f7f0e6] pb-4">
          <div className="p-3 bg-[#f7f0e6] text-[#814a27] rounded-2xl">
            <Shield className="w-6 h-6 fill-[#9e6133]/10" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#2d180c]">
              {isLoginTab ? 'Sign In to Shield' : 'Create Safety Profile'}
            </h3>
            <p className="text-xs text-[#814a27]/70">Access emergency guardians and live tracking</p>
          </div>
        </div>

        {/* Quick Login Options */}
        <div className="bg-[#fdfbf7] p-3 rounded-2xl border border-[#eee0ce] space-y-2">
          <div className="text-[10px] uppercase font-bold text-[#814a27]/70 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#9e6133]" /> Quick Login Options
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoFill('sarah')}
              className="bg-white hover:bg-[#f7f0e6] text-[#2d180c] text-[11px] font-bold py-1.5 px-2 rounded-xl border border-[#eee0ce] transition-all cursor-pointer text-center truncate"
              title="User: Srijana Adhikari"
            >
              👩 Srijana (User)
            </button>
            <button
              onClick={() => handleDemoFill('admin')}
              className="bg-[#2d180c] hover:bg-[#4a2b18] text-[#eee0ce] text-[11px] font-extrabold py-1.5 px-2 rounded-xl border border-[#4a2b18] transition-all cursor-pointer text-center truncate"
              title="System Administrator"
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#f7f0e6] p-1 rounded-xl border border-[#eee0ce]">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              isLoginTab ? 'bg-white text-[#2d180c] shadow-xs' : 'text-[#814a27]/70'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              !isLoginTab ? 'bg-white text-[#2d180c] shadow-xs' : 'text-[#814a27]/70'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="bg-[#f7f0e6] border border-[#eee0ce] text-[#814a27] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#9e6133] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-[11px] font-bold text-[#2d180c] uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#814a27]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Srijana Adhikari"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#2d180c] uppercase mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#814a27]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srijana@example.com"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-[11px] font-bold text-[#2d180c] uppercase mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#814a27]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 9841-234567"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#2d180c] uppercase mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#814a27]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl pl-9 pr-9 py-2.5 text-xs font-semibold text-[#2d180c] focus:outline-none focus:ring-2 focus:ring-[#9e6133]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#814a27]/60 hover:text-[#2d180c]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLoginTab && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-[#814a27]/70 uppercase mb-1">
                  Deactivation PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={emergencyPin}
                  onChange={(e) => setEmergencyPin(e.target.value)}
                  placeholder="9911"
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2d180c]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#814a27]/70 uppercase mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#eee0ce] rounded-xl px-2 py-2 text-xs font-bold text-[#2d180c]"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-3 px-4 rounded-xl shadow-md shadow-[#9e6133]/20 text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {isLoginTab ? 'Sign In' : 'Register Safety Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};
