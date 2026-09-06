import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Star,
  Check,
  KeyRound,
  HeartPulse,
  Info,
  Radio,
  PhoneCall,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  LogIn,
  UserPlus
} from 'lucide-react';
export const Auth = ({ onLoginSuccess, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' || searchParams.get('tab') === 'create-account' ? false : true;
  const [isLoginTab, setIsLoginTab] = useState(initialTab);
  const [signupStep, setSignupStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup' || tabParam === 'create-account') {
      setIsLoginTab(false);
    } else if (tabParam === 'login') {
      setIsLoginTab(true);
    }
  }, [searchParams]);
  const handleTabChange = (loginMode) => {
    setIsLoginTab(loginMode);
    setSignupStep(1);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSearchParams(loginMode ? { tab: 'login' } : { tab: 'create-account' });
  };
  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };
  const validatePhone = (phoneStr) => {
    return /^\+?[0-9]{10,15}$/.test(phoneStr.trim().replace(/[-\s]/g, ''));
  };
  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'None', color: 'bg-neutral-600' };
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-300' };
  };
  const pwdStrength = calculatePasswordStrength(password);
  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || !validatePhone(phone)) {
      setErrorMessage('Please enter a valid mobile phone number (10-15 digits).');
      return;
    }
    setSignupStep(2);
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email format.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const loggedUser = response.user;
      if (loggedUser.role === 'admin') {
        await authService.logout();
        setErrorMessage('Access denied.');
        setIsLoading(false);
        return;
      }
      onLoginSuccess(loggedUser);
      setSuccessMessage(`Login successful! Welcome, ${loggedUser.name}. Opening Dashboard...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 750);
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
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
      const newUser = response.user;
      onLoginSuccess(newUser);
      setSuccessMessage(`Account created successfully! Welcome to Shield, ${newUser.name}.`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Account registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !validateEmail(forgotEmail)) {
      setErrorMessage('Please enter a valid email for password reset.');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotPasswordOpen(false);
      setForgotEmail('');
      setSuccessMessage('Password reset instructions have been dispatched to your email.');
    }, 2000);
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#232527] text-[#e8dcd0]">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        <div className="lg:col-span-7 flex flex-col justify-center px-4 py-8 sm:px-10 lg:px-16 bg-[#282a2c] relative">
          <div className="w-full max-w-[440px] mx-auto space-y-6">
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#f3e5d3] to-[#e8d5bf] text-[#8e4e13] mx-auto flex items-center justify-center shadow-lg shadow-[#8e4e13]/20 border border-[#cb9d75]/40">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 fill-[#8e4e13]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#282a2c]"></span>
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isLoginTab ? 'Login to Shield' : 'Create an Account'}
                </h1>
                <p className="text-xs sm:text-sm text-[#b2a798] font-medium mt-1">
                  {isLoginTab 
                    ? 'Enter your credentials to access 24/7 personal safety tools' 
                    : 'Set up your account for emergency response and guardian tracking'}
                </p>
              </div>
            </div>
            <div className="bg-[#1b1c1e] p-1 rounded-2xl border border-[#3e4247] flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => handleTabChange(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isLoginTab
                    ? 'bg-[#8e4e13] text-white shadow-md'
                    : 'text-[#9c958a] hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isLoginTab
                    ? 'bg-[#8e4e13] text-white shadow-md'
                    : 'text-[#9c958a] hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-md animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-md animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">{successMessage}</div>
              </div>
            )}
            {isLoginTab ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#e8dcd0]">
                    Email Address <span className="text-[#cb9d75]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@shield.com"
                      className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75] focus:ring-1 focus:ring-[#cb9d75] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-[#e8dcd0]">
                      Password <span className="text-[#cb9d75]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs font-bold text-[#cb9d75] hover:text-[#e8d5bf] cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-10 py-3 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75] focus:ring-1 focus:ring-[#cb9d75] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#3e4247] bg-[#1b1c1e] text-[#8e4e13] focus:ring-[#cb9d75]"
                    />
                    <span className="text-xs text-[#b2a798] font-medium">Keep me logged in</span>
                  </label>
                  <span className="text-[11px] text-[#8b9198] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    SSL 256-bit Encrypted
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#8e4e13] to-[#a65c17] hover:from-[#a65c17] hover:to-[#be6b1d] text-white font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-[#8e4e13]/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="text-center pt-3">
                  <p className="text-xs text-[#b2a798]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange(false)}
                      className="font-bold text-[#cb9d75] hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#1b1c1e] p-3 rounded-2xl border border-[#3e4247] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#b2a798]">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-5 h-5 rounded-full bg-[#8e4e13] text-white flex items-center justify-center text-[10px]">
                        {signupStep}
                      </span>
                      {signupStep === 1 ? 'Step 1: Account Essentials' : 'Step 2: Password & Security'}
                    </span>
                    <span className="text-[#cb9d75] font-extrabold">{signupStep === 1 ? '50% Complete' : '100% Complete'}</span>
                  </div>
                  <div className="w-full bg-[#282a2c] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#8e4e13] to-[#cb9d75] h-full transition-all duration-300 rounded-full"
                      style={{ width: signupStep === 1 ? '50%' : '100%' }}
                    />
                  </div>
                </div>
                {signupStep === 1 ? (
                  <form onSubmit={handleNextStep} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#e8dcd0]">
                        Full Name <span className="text-[#cb9d75]">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sudeena Sharma"
                          className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75] focus:ring-1 focus:ring-[#cb9d75]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#e8dcd0]">
                        Email Address <span className="text-[#cb9d75]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. user@shield.com"
                          className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75] focus:ring-1 focus:ring-[#cb9d75]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#e8dcd0]">
                          Mobile Phone <span className="text-[#cb9d75]">*</span>
                        </label>
                        <span className="text-[10px] text-[#cb9d75]">Emergency Contact Line</span>
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+977 9841-382910"
                          className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#8e4e13] hover:bg-[#a65c17] text-white font-extrabold py-3 px-6 rounded-xl text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="text-center pt-2">
                      <p className="text-xs text-[#b2a798]">
                        Already registered?{' '}
                        <button
                          type="button"
                          onClick={() => handleTabChange(true)}
                          className="font-bold text-[#cb9d75] hover:underline cursor-pointer"
                        >
                          Login instead
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#e8dcd0]">
                        Create Password <span className="text-[#cb9d75]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#b2a798]">Strength:</span>
                            <span className={`font-extrabold ${pwdStrength.text}`}>{pwdStrength.label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 h-1 bg-[#1b1c1e] rounded-full overflow-hidden">
                            <div className={`h-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'}`} />
                            <div className={`h-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'}`} />
                            <div className={`h-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'}`} />
                            <div className={`h-full ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-transparent'}`} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#e8dcd0]">
                        Confirm Password <span className="text-[#cb9d75]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#e8dcd0]">
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
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="w-1/3 bg-[#1b1c1e] hover:bg-[#242629] text-white font-bold py-2.5 px-3 rounded-xl border border-[#3e4247] text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-2/3 bg-gradient-to-r from-[#8e4e13] to-[#a65c17] hover:from-[#a65c17] hover:to-[#be6b1d] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 lg:p-14 bg-gradient-to-br from-[#381b05] via-[#2d1503] to-[#1e0d02] text-white relative overflow-hidden border-l border-[#482307]">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#cb9d75]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#8e4e13]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f3e5d3] text-[#8e4e13] flex items-center justify-center font-black text-sm shadow">
                S
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight">SHIELD NEPAL</span>
                <span className="text-[10px] text-[#cb9d75] font-medium">Women's Safety Platform</span>
              </div>
            </div>
            <span className="bg-[#2a1303] text-[#cb9d75] text-[10px] font-bold px-3 py-1 rounded-full border border-[#482307] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              24/7 Active
            </span>
          </div>
          <div className="space-y-6 max-w-md my-auto relative z-10">
            <div>
              <span className="text-xs font-bold text-[#cb9d75] uppercase tracking-widest block mb-2">
                Confidence in Every Step
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                A sanctuary in your pocket.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#c2b2a1] leading-relaxed">
              Engineered for swift emergency response, live encrypted location sharing, and immediate connection to guardians and local helplines.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="bg-[#2a1303]/90 border border-[#482307] p-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-red-950/80 text-red-400 flex items-center justify-center shrink-0 border border-red-800/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">1-Tap SOS Emergency Broadcast</h4>
                  <p className="text-[11px] text-[#b2a798]">Sends instant GPS alert with siren to your guardians.</p>
                </div>
              </div>
              <div className="bg-[#2a1303]/90 border border-[#482307] p-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Live Encrypted GPS Tracking</h4>
                  <p className="text-[11px] text-[#b2a798]">Continuous breadcrumb trail for late night transit safety.</p>
                </div>
              </div>
              <div className="bg-[#2a1303]/90 border border-[#482307] p-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800/40">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Discreet Fake Call Simulator</h4>
                  <p className="text-[11px] text-[#b2a798]">Simulate incoming calls to safely exit uncomfortable situations.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#2a1303]/90 border border-[#482307] rounded-2xl p-4 space-y-2 shadow-lg relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#e0b070]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#e0b070] stroke-[#e0b070]" />
                ))}
              </div>
              <span className="text-[10px] text-[#cb9d75] font-bold">Verified User</span>
            </div>
            <p className="text-xs text-[#e8dcd0] italic leading-relaxed">
              "The SOS button and fake call feature gave me real peace of mind on late walks home from campus."
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="font-extrabold text-white">Meera P., Kathmandu</span>
              <span className="text-[#a89b8d]">Protected since 2024</span>
            </div>
          </div>
        </div>
      </div>
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#292b2e] border border-[#3e4247] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-[#3e4247]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3d2715] text-[#cb9d75] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Reset Your Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-[#8b9198] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#b2a798]">
              Enter your registered email address and we'll send a secure password reset link with instructions.
            </p>
            {forgotSent ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verification code dispatched to {forgotEmail}!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#e8dcd0] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1b1c1e] border border-[#3e4247] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#686f78] focus:outline-none focus:border-[#cb9d75]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="w-1/3 bg-[#1b1c1e] hover:bg-[#242629] text-white font-bold py-2.5 rounded-xl border border-[#3e4247] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#8e4e13] hover:bg-[#a65c17] text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
