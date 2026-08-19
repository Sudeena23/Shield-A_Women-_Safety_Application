import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SOSAlertModal } from './components/SOSAlertModal';
import { FakeCallModal } from './components/FakeCallModal';
import { AuthModal } from './components/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Guardians } from './pages/Guardians';
import { EmergencyNumbers } from './pages/EmergencyNumbers';
import { LiveLocation } from './pages/LiveLocation';
import { Auth } from './pages/Auth';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile } from './pages/UserProfile';
import { UserSettings } from './pages/UserSettings';
import { NotFound } from './pages/NotFound';

import { authService } from './services/authService';
import { guardianService } from './services/guardianService';
import { alertService } from './services/alertService';
import { locationService } from './services/locationService';
import { userService } from './services/userService';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const validPaths = [
    '/',
    '/emergency-numbers',
    '/auth',
    '/dashboard',
    '/guardians',
    '/live-location',
    '/profile',
    '/settings',
    '/admin',
  ];
  const isKnownPath = validPaths.includes(location.pathname);

  // Global State managed via Services
  const [guardians, setGuardians] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleOpenAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // SOS Trigger & Misuse Prevention State
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAntiPrankSOSOpen, setIsAntiPrankSOSOpen] = useState(false);
  const [cooldownError, setCooldownError] = useState(null);

  // Fake Call Escaper State
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  // Initial Data Fetching from Service Layer
  useEffect(() => {
    const initServicesData = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        const loadedGuardians = await guardianService.getGuardians();
        setGuardians(loadedGuardians);

        const loadedAlerts = await alertService.getAlerts();
        setAlerts(loadedAlerts);

        const loadedUsers = await userService.getUsers();
        setUsersList(loadedUsers);
      } catch (err) {
        console.error('Failed to initialize data from services:', err);
      }
    };
    initServicesData();
  }, []);

  // Auth Handlers - Role-Based Redirect after login
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    try {
      const [updatedUsers, updatedGuardians, updatedAlerts] = await Promise.all([
        userService.getUsers(),
        guardianService.getGuardians(),
        alertService.getAlerts(),
      ]);
      setUsersList(updatedUsers);
      setGuardians(updatedGuardians);
      setAlerts(updatedAlerts);
    } catch (e) {
      console.error(e);
    }

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    navigate('/');
  };

  // User Management Handlers (Admin)
  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsersList((previous) => previous.filter((user) => user.id !== userId));
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const updated = await userService.toggleUserStatus(userId);
      setUsersList((previous) => previous.map((user) => (user.id === userId ? updated : user)));
    } catch (e) {
      console.error('Failed to toggle user status', e);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const created = await userService.addUser(newUser);
      setUsersList((prev) => [created, ...prev]);
    } catch (e) {
      console.error('Failed to add user', e);
    }
  };

  // Profile Update Handler
  const handleUpdateProfile = async (updatedUser) => {
    try {
      const saved = await authService.updateProfile(updatedUser);
      setCurrentUser(saved);
      const updatedUsers = await userService.getUsers();
      setUsersList(updatedUsers);
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  // CRUD Handler: Add Guardian
  const handleAddGuardian = async (newG) => {
    try {
      const created = await guardianService.addGuardian(newG);
      setGuardians((prev) => [created, ...prev]);
    } catch (e) {
      console.error('Failed to add guardian', e);
    }
  };

  // CRUD Handler: Update Guardian
  const handleUpdateGuardian = async (updatedG) => {
    try {
      const updated = await guardianService.updateGuardian(updatedG.id, updatedG);
      setGuardians((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    } catch (e) {
      console.error('Failed to update guardian', e);
    }
  };

  // CRUD Handler: Delete Guardian
  const handleDeleteGuardian = async (id) => {
    try {
      await guardianService.deleteGuardian(id);
      setGuardians((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      console.error('Failed to delete guardian', e);
    }
  };

  // CRUD Handler: Set Primary Guardian
  const handleSetPrimaryGuardian = async (id) => {
    try {
      const updatedList = await guardianService.setPrimaryGuardian(id);
      setGuardians(updatedList);
    } catch (e) {
      console.error('Failed to set primary guardian', e);
    }
  };

  // Direct SOS Trigger -> Plays Siren & Starts Time to Dispatch
  const handleTriggerSOS = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    handleConfirmSOSDispatch();
  };

  const handleConfirmSOSDispatch = async () => {
    setCooldownError(null);

    try {
      let liveLoc = { lat: 27.7033, lng: 85.3130, address: 'Tridevi Marg, Thamel, Kathmandu' };
      try {
        liveLoc = await locationService.getCurrentLocation();
      } catch {
        // Fallback location
      }

      const newAlert = await alertService.createAlert({
        user: currentUser?.name || 'Shield User',
        userId: currentUser?.id || 'usr-101',
        userPhone: currentUser?.phone || '+977 9841-382910',
        location: liveLoc.address || `${liveLoc.lat}, ${liveLoc.lng}`,
        lat: liveLoc.lat,
        lng: liveLoc.lng,
        status: 'Active',
        type: 'SOS Alert',
        recipientsCount: guardians.length,
      });

      setAlerts((prev) => [newAlert, ...prev]);
      setIsSOSOpen(true);
    } catch (err) {
      console.warn('Alert creation:', err.message);
      setIsSOSOpen(true); // Open SOS alert modal anyway for immediate siren & dispatch
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7f2] text-[#2d180c] font-sans flex flex-col justify-between selection:bg-[#9e6133] selection:text-white">
      <div>
        {/* Fixed Navbar */}
        <Navbar
          onTriggerSOS={handleTriggerSOS}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          onOpenFakeCall={() => setIsFakeCallOpen(true)}
        />

        {/* Page Routing */}
        <main>
          <Routes>
            {/* Home Landing */}
            <Route path="/" element={<Home onTriggerSOS={handleTriggerSOS} onOpenFakeCall={() => setIsFakeCallOpen(true)} />} />

            {/* Public Helplines */}
            <Route
              path="/emergency-numbers"
              element={<EmergencyNumbers />}
            />

            {/* Auth Login & Register Page */}
            <Route
              path="/auth"
              element={
                <Auth
                  onLoginSuccess={handleLoginSuccess}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />

            {/* User Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  allowedRole="user"
                  featureName="Safety Command Dashboard"
                >
                  <Dashboard
                    onTriggerSOS={handleTriggerSOS}
                    guardians={guardians}
                    alerts={alerts}
                    currentUser={currentUser}
                    onOpenFakeCall={() => setIsFakeCallOpen(true)}
                  />
                </ProtectedRoute>
              }
            />

            {/* Guardians CRUD */}
            <Route
              path="/guardians"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  allowedRole="user"
                  featureName="Guardian Contact Management"
                >
                  <Guardians
                    guardians={guardians}
                    onAddGuardian={handleAddGuardian}
                    onUpdateGuardian={handleUpdateGuardian}
                    onDeleteGuardian={handleDeleteGuardian}
                    onSetPrimaryGuardian={handleSetPrimaryGuardian}
                  />
                </ProtectedRoute>
              }
            />

            {/* Live Location */}
            <Route
              path="/live-location"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  allowedRole="user"
                  featureName="Live Location Broadcast"
                >
                  <LiveLocation guardians={guardians} />
                </ProtectedRoute>
              }
            />

            {/* Edit Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  allowedRole={['user', 'admin']}
                  featureName="Personal Safety Profile"
                >
                  <UserProfile
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    alerts={alerts}
                  />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  allowedRole={['user', 'admin']}
                  featureName="Account Safety Settings"
                >
                  <UserSettings currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
                </ProtectedRoute>
              }
            />

            {/* Admin Control Center - Accessible without strict login wall */}
            <Route
              path="/admin"
              element={
                <AdminDashboard
                  currentUser={currentUser}
                  usersList={usersList}
                  onDeleteUser={handleDeleteUser}
                  onToggleUserStatus={handleToggleUserStatus}
                  onAddUser={handleAddUser}
                />
              }
            />

            {/* Catch-all 404 Page Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Global Footer (Hidden on 404 Not Found) */}
      {isKnownPath && <Footer currentUser={currentUser} />}

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalTab}
      />

      {/* SOS Emergency Broadcast Modal */}
      <SOSAlertModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        guardians={guardians}
        currentUserPin={currentUser?.emergencyPin || '9911'}
      />

      {/* Misuse Prevention Cooldown Active Toast Banner */}
      {cooldownError && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-amber-900/90 text-amber-100 border border-amber-600 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-extrabold uppercase tracking-wider text-amber-300">
              SOS Cooldown Active
            </div>
            <p className="font-medium">{cooldownError}</p>
          </div>
          <button
            onClick={() => setCooldownError(null)}
            className="p-1 hover:bg-amber-800 rounded-lg text-amber-300 ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fake Call Escaper Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
