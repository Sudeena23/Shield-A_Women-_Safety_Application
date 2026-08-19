import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Star,
  Check
} from 'lucide-react';

/**
 * Auth Page Component
 * Exact design replica matching the user's reference screenshot:
 * Left side: Dark slate canvas (#292b2e), centered warm cream circular badge, brown "Welcome back",
 * dark inputs, solid caramel button, Google button, "New here? Create account".
 * Right side: Deep rich caramel brown canvas (#381b05), "Shield | Your safety, our priority",
 * "A sanctuary in your pocket.", pill badges, and bottom testimonial card.
 */
export const Auth = ({ onLoginSuccess, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [signupStep, setSignupStep] = useState(1); // 1 or 2
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleDemoLogin = (type) => {
    let demoUser;
    if (type === 'admin') {
      demoUser = {
        id: 'usr-admin-01',
        name: 'System Administrator',
        email: 'admin@shield.org',
        phone: '+977 01-4228435',
        role: 'admin',
        emergencyPin: '9911',
        avatarBg: 'bg-[#4a2b18]',
        bloodGroup: 'O+',
        medicalNotes: 'Shield System Administrator #901',
      };
    } else {
      demoUser = {
        id: 'usr-101',
        name: 'Srijana Adhikari',
        email: 'srijana.adhikari@example.com',
        phone: '+977 9841-382910',
        role: 'user',
        emergencyPin: '9911',
        avatarBg: 'bg-[#9e6133]',
        bloodGroup: 'O+',
        medicalNotes: 'Contact emergency contacts in distress',
      };
    }

    onLoginSuccess(demoUser);
    setSuccessMessage(`Welcome back, ${demoUser.name}! Directing to ${type === 'admin' ? 'Admin Portal' : 'Dashboard'}...`);
    setTimeout(() => {
      navigate(type === 'admin' ? '/admin' : '/dashboard');
    }, 800);
  };

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleGoogleLogin = () => {
    handleDemoLogin('standard');
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    setSignupStep(2);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      const response = await authService.login(email, password);
      const loggedUser = response.user;
      onLoginSuccess(loggedUser);
      setSuccessMessage(`Login successful! Directing to ${loggedUser.role === 'admin' ? 'Admin Portal' : 'Dashboard'}...`);
      setTimeout(() => {
        navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await authService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        emergencyPin: '9911',
        bloodGroup: 'O+',
        medicalNotes: 'None',
      });
      const newUser = response.user;
      onLoginSuccess(newUser);
      setSuccessMessage(`Account created successfully! Welcome to Shield.`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  if (currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-[#232527] rounded-2xl p-8 border border-[#3b3e42] shadow-2xl text-center space-y-6 text-white">
          <div className="w-16 h-16 rounded-2xl bg-[#e8d5bf] text-[#8e4e13] mx-auto flex items-center justify-center border border-[#e8d5bf]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#e8d5bf] bg-[#3b2d20] px-3.5 py-1 rounded-full border border-[#8e4e13] uppercase tracking-wider">
              Currently Logged In
            </span>
            <h1 className="text-2xl font-black text-white mt-3">{currentUser.name}</h1>
            <p className="text-xs text-[#b2a798] mt-1">{currentUser.email} • {currentUser.phone}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#3b3e42]">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-[#8e4e13] hover:bg-[#a85d18] text-white font-extrabold px-6 py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer btn-primary"
            >
              <span>Go to Safety Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="w-full sm:w-auto bg-[#2e3135] hover:bg-[#383c40] text-white font-bold px-6 py-3 rounded-xl border border-[#44484e] text-xs cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#282a2c]">
      
      {/* 50/50 Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        
        {/* LEFT PANEL: Dark Slate Form Section */}
        <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#282a2c]">
          <div className="w-full max-w-[400px] mx-auto my-auto space-y-6">
            
            {/* Centered Top Icon Badge */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#f3e5d3] text-[#8e4e13] mx-auto flex items-center justify-center shadow-md">
                <Shield className="w-8 h-8 fill-[#8e4e13]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#b86d29] tracking-tight">
                {isLoginTab ? 'Welcome back' : 'Create an account'}
              </h1>

              <p className="text-xs sm:text-sm text-[#b2a798] font-medium">
                {isLoginTab 
                  ? 'Sign in to your Shield account' 
                  : 'Get started with instant emergency protection'}
              </p>
            </div>

            {/* Error or Success Notification */}
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {isLoginTab ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29] focus:ring-1 focus:ring-[#b86d29]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-white">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Password reset link dispatched to your email.')}
                      className="text-xs font-medium text-[#b86d29] hover:text-[#d4833b] cursor-pointer"
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
                      className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29] focus:ring-1 focus:ring-[#b86d29]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  className="w-full bg-[#8e4e13] hover:bg-[#a65c17] text-white font-bold py-3 px-6 rounded-lg text-sm transition-all cursor-pointer shadow-md active:scale-[0.99] mt-2"
                >
                  Sign in
                </button>

                {/* Divider Line */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3e4247]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#282a2c] px-3 text-[#7d8288] text-xs">or</span>
                  </div>
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-[#1f2123] hover:bg-[#2c2f32] text-white font-bold py-2.5 px-4 rounded-lg border border-[#3e4247] text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Footer Signup Link */}
                <div className="text-center pt-3">
                  <p className="text-xs text-[#b2a798]">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginTab(false);
                        setSignupStep(1);
                        setErrorMessage(null);
                      }}
                      className="font-bold text-[#b86d29] hover:underline cursor-pointer"
                    >
                      Create account
                    </button>
                  </p>
                </div>

              </form>
            ) : (
              /* MULTI-STEP SIGNUP FORM */
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#b2a798]">
                    <span>Step {signupStep} of 2</span>
                    <span>{signupStep === 1 ? '50%' : '100%'}</span>
                  </div>
                  <div className="w-full bg-[#1f2123] h-1.5 rounded-full overflow-hidden border border-[#3e4247]">
                    <div
                      className="bg-[#b86d29] h-full transition-all duration-300"
                      style={{ width: signupStep === 1 ? '50%' : '100%' }}
                    />
                  </div>
                </div>

                {signupStep === 1 ? (
                  <form onSubmit={handleNextStep} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Srijana Adhikari"
                          className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+977 9841-382910"
                          className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#8e4e13] hover:bg-[#a65c17] text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9198] hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8b9198] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1f2123] border border-[#3e4247] rounded-lg pl-10 pr-10 py-2.5 text-xs font-medium text-white placeholder-[#6d737a] focus:outline-none focus:border-[#b86d29]"
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

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="w-1/3 bg-[#1f2123] hover:bg-[#2c2f32] text-white font-bold py-2.5 px-3 rounded-lg border border-[#3e4247] text-xs cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-[#8e4e13] hover:bg-[#a65c17] text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Create account</span>
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center pt-2">
                  <p className="text-xs text-[#b2a798]">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginTab(true);
                        setErrorMessage(null);
                      }}
                      className="font-bold text-[#b86d29] hover:underline cursor-pointer"
                    >
                      Sign in instead
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Quick Demo Test Buttons */}
            <div className="pt-3 border-t border-[#3e4247]">
              <div className="text-center text-[11px] text-[#b2a798] font-bold mb-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#b86d29]" />
                <span>Quick Test Logins</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('standard')}
                  className="bg-[#1f2123] hover:bg-[#2c2f32] text-[#e8dcd0] text-[11px] font-bold p-2 rounded-lg border border-[#3e4247] text-center cursor-pointer"
                >
                  👩 User Account
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="bg-[#381b05] hover:bg-[#4a2408] text-[#e8dcd0] text-[11px] font-bold p-2 rounded-lg border border-[#68360d] text-center cursor-pointer"
                >
                  🛡️ System Admin
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Rich Deep Caramel Brown Background */}
        <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-[#381b05] text-white">
          
          {/* Top Brand Tagline */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-white tracking-tight">Shield</span>
            <span className="text-white/40 font-light">|</span>
            <span className="text-xs font-medium text-[#c2b2a1]">Your safety, our priority</span>
          </div>

          {/* Main Headline & Description */}
          <div className="space-y-6 max-w-lg my-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-[1.15] tracking-tight">
              A sanctuary<br />in your pocket.
            </h2>

            <p className="text-sm sm:text-base text-[#c2b2a1] leading-relaxed font-normal max-w-md">
              Trusted by thousands using SOS, live location, and guardian alerts every day.
            </p>

            {/* Pill Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="bg-[#2a1303] text-[#c2b2a1] text-xs font-semibold px-4 py-2 rounded-full border border-[#482307]">
                24/7 support
              </span>
              <span className="bg-[#2a1303] text-[#c2b2a1] text-xs font-semibold px-4 py-2 rounded-full border border-[#482307]">
                Guardian network
              </span>
            </div>
          </div>

          {/* Bottom Testimonial Card */}
          <div className="bg-[#2a1303]/90 border border-[#482307] rounded-2xl p-6 space-y-3 shadow-lg max-w-md">
            <div className="flex items-center gap-1 text-[#e0b070]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#e0b070] stroke-[#e0b070]" />
              ))}
            </div>

            <p className="text-xs sm:text-sm text-[#e8dcd0] font-normal italic leading-relaxed">
              "The SOS button gave me real peace of mind on late walks home."
            </p>

            <div className="text-xs font-bold text-white pt-1">
              Meera P.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
