import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

// =========================
// USER COMPONENTS
// =========================
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { SOSAlertModal } from "./components/SOSAlertModal";
import { FakeCallModal } from "./components/FakeCallModal";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";

// =========================
// USER PAGES
// =========================
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Guardians } from "./pages/Guardians";
import { EmergencyNumbers } from "./pages/EmergencyNumbers";
import { LiveLocation } from "./pages/LiveLocation";
import { Auth } from "./pages/Auth";
import { UserProfile } from "./pages/UserProfile";
import { UserSettings } from "./pages/UserSettings";
import { NotFound } from "./pages/NotFound";

// =========================
// ADMIN
// =========================
import { AdminDashboard } from "./components/admin/AdminDashboard";

// =========================
// ICONS
// =========================
import { AlertTriangle, X } from "lucide-react";

// =========================
// SERVICES
// =========================
import { authService } from "./services/authService";
import { guardianService } from "./services/guardianService";
import { alertService } from "./services/alertService";
import { userService } from "./services/userService";


function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // GLOBAL STATE
  // =========================

  const [guardians, setGuardians] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // =========================
  // AUTH MODAL
  // =========================

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  const handleOpenAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // =========================
  // SOS
  // =========================

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [cooldownError, setCooldownError] = useState(null);

  // =========================
  // FAKE CALL
  // =========================

  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  // ==========================================================
  // INITIAL DATA (Clean & Authenticated)
  // ==========================================================

  useEffect(() => {
    const initServicesData = async () => {
      try {
        // Get current logged-in user
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          // Get user's guardians
          try {
            const loadedGuardians = await guardianService.getGuardians();
            setGuardians(loadedGuardians || []);
          } catch (e) {
            setGuardians([]);
          }

          // Get alerts
          try {
            const loadedAlerts = await alertService.getAlerts();
            setAlerts(loadedAlerts || []);
          } catch (e) {
            setAlerts([]);
          }

          // If Admin, load users list
          if (user.role === "admin") {
            try {
              const loadedUsers = await userService.getUsers();
              setUsersList(loadedUsers || []);
            } catch (e) {
              setUsersList([]);
            }
          }
        } else {
          setGuardians([]);
          setAlerts([]);
          setUsersList([]);
        }
      } catch (error) {
        console.warn("Application initialized in guest mode:", error.message);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initServicesData();
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    try {
      const promises = [
        guardianService.getGuardians(),
        alertService.getAlerts(),
      ];

      if (user.role === "admin") {
        promises.push(userService.getUsers());
      }

      const results = await Promise.all(promises);
      setGuardians(results[0] || []);
      setAlerts(results[1] || []);
      if (user.role === "admin" && results[2]) {
        setUsersList(results[2]);
      }
    } catch (error) {
      console.warn("Notice loading user data post-login:", error.message);
    }

    // =========================
    // ROLE BASED REDIRECT
    // =========================

    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    setCurrentUser(null);

    navigate("/");
  };

  // ==========================================================
  // ADMIN - DELETE USER
  // ==========================================================

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);

      setUsersList((previous) =>
        previous.filter(
          (user) => user.id !== userId
        )
      );

    } catch (error) {
      console.error(
        "Failed to delete user:",
        error
      );
    }
  };

  // ==========================================================
  // ADMIN - EDIT USER
  // ==========================================================

  const handleEditUser = async (
    userId,
    updatedFields
  ) => {
    try {
      const updated =
        await userService.updateUser(
          userId,
          updatedFields
        );

      setUsersList((previous) =>
        previous.map((user) =>
          user.id === userId
            ? updated
            : user
        )
      );

    } catch (error) {
      console.error(
        "Failed to edit user:",
        error
      );
    }
  };

  // ==========================================================
  // ADMIN - TOGGLE USER STATUS
  // ==========================================================

  const handleToggleUserStatus = async (
    userId
  ) => {
    try {
      const updated =
        await userService.toggleUserStatus(
          userId
        );

      setUsersList((previous) =>
        previous.map((user) =>
          user.id === userId
            ? updated
            : user
        )
      );

    } catch (error) {
      console.error(
        "Failed to toggle user status:",
        error
      );
    }
  };

  // ==========================================================
  // ADMIN - ADD USER
  // ==========================================================

  const handleAddUser = async (newUser) => {
    try {
      const created =
        await userService.addUser(newUser);

      setUsersList((previous) => [
        created,
        ...previous,
      ]);

    } catch (error) {
      console.error(
        "Failed to add user:",
        error
      );
    }
  };

  // ==========================================================
  // PROFILE UPDATE
  // ==========================================================

  const handleUpdateProfile = async (
    updatedUser
  ) => {
    try {
      const saved =
        await authService.updateProfile(
          updatedUser
        );

      setCurrentUser(saved);

      if (saved && saved.role === "admin") {
        try {
          const updatedUsers =
            await userService.getUsers();
          setUsersList(updatedUsers || []);
        } catch (e) {
          // ignore admin list fetch failure
        }
      }

      return saved;
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );
      throw error;
    }
  };

  // ==========================================================
  // GUARDIAN - ADD
  // ==========================================================

  const handleAddGuardian = async (newGuardian) => {
    try {
      const created = await guardianService.addGuardian(newGuardian);
      setGuardians((previous) => [created, ...previous]);
      return created;
    } catch (error) {
      console.error("Failed to add guardian:", error);
      throw error;
    }
  };

  // ==========================================================
  // GUARDIAN - UPDATE
  // ==========================================================

  const handleUpdateGuardian = async (updatedGuardian) => {
    try {
      const updated = await guardianService.updateGuardian(
        updatedGuardian.id,
        updatedGuardian
      );

      setGuardians((previous) =>
        previous.map((guardian) =>
          guardian.id === updated.id ? updated : guardian
        )
      );
      return updated;
    } catch (error) {
      console.error("Failed to update guardian:", error);
      throw error;
    }
  };

  // ==========================================================
  // GUARDIAN - DELETE
  // ==========================================================

  const handleDeleteGuardian = async (id) => {
    try {
      await guardianService.deleteGuardian(id);

      setGuardians((previous) =>
        previous.filter((guardian) => guardian.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete guardian:", error);
      throw error;
    }
  };

  // ==========================================================
  // GUARDIAN - PRIMARY
  // ==========================================================

  const handleSetPrimaryGuardian = async (id) => {
    try {
      const updatedList = await guardianService.setPrimaryGuardian(id);
      setGuardians(updatedList);
      return updatedList;
    } catch (error) {
      console.error("Failed to set primary guardian:", error);
      throw error;
    }
  };

  // ==========================================================
  // SOS
  // ==========================================================

  const handleTriggerSOS = () => {
    if (!currentUser) {
      handleOpenAuthModal("login");
      return;
    }

    handleConfirmSOSDispatch();
  };

  // ==========================================================
  // CONFIRM SOS
  // ==========================================================

  const handleConfirmSOSDispatch = async () => {
    setCooldownError(null);

    try {
      let liveLoc = {
        lat: 27.7033,
        lng: 85.3130,
        address:
          "Tridevi Marg, Thamel, Kathmandu",
      };

      try {
        liveLoc =
          await locationService.getCurrentLocation();
      } catch (error) {
        console.warn(
          "Could not get live location. Using fallback."
        );
      }

      const newAlert =
        await alertService.createAlert({
          user:
            currentUser?.name ||
            "Shield User",

          userId:
            currentUser?.id ||
            "usr-101",

          userPhone:
            currentUser?.phone ||
            "+977 9841-382910",

          location:
            liveLoc.address ||
            `${liveLoc.lat}, ${liveLoc.lng}`,

          lat: liveLoc.lat,
          lng: liveLoc.lng,

          status: "Active",
          type: "SOS Alert",

          recipientsCount:
            guardians.length,
        });

      setAlerts((previous) => [
        newAlert,
        ...previous,
      ]);

      setIsSOSOpen(true);

    } catch (error) {
      console.warn(
        "Alert creation failed:",
        error.message
      );

      // Still open SOS modal
      setIsSOSOpen(true);
    }
  };

  // ==========================================================
  // PATH INFORMATION
  // ==========================================================

  const validPaths = [
    "/",
    "/emergency-numbers",
    "/auth",
    "/dashboard",
    "/guardians",
    "/live-location",
    "/profile",
    "/settings",
    "/admin",
  ];

  const isKnownPath =
    validPaths.includes(
      location.pathname
    );

  // ==========================================================
  // IS ADMIN PAGE?
  // ==========================================================

  const isAdminPage =
    location.pathname === "/admin" || location.pathname.startsWith("/admin");

  const isLandingPage =
    location.pathname === "/";

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#fbf7f2] text-[#2d180c] font-sans flex flex-col">

      {/* ======================================================
          USER NAVBAR

          IMPORTANT:
          This navbar is NEVER rendered on /admin or / (landing page).
      ====================================================== */}

      {!isAdminPage && !isLandingPage && (
        <Navbar
          onTriggerSOS={handleTriggerSOS}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          onOpenFakeCall={() =>
            setIsFakeCallOpen(true)
          }
        />
      )}

      {/* ======================================================
          ROUTES
      ====================================================== */}

      <main className="flex-1">

        <Routes>

          {/* ==================================================
              HOME
          ================================================== */}

          <Route
            path="/"
            element={
              <Home
                onTriggerSOS={
                  handleTriggerSOS
                }
                guardians={guardians}
                alerts={alerts}
                currentUser={currentUser}
                onOpenFakeCall={() =>
                  setIsFakeCallOpen(true)
                }
              />
            }
          />

          {/* ==================================================
              EMERGENCY NUMBERS
          ================================================== */}

          <Route
            path="/emergency-numbers"
            element={
              <EmergencyNumbers
                currentUser={currentUser}
              />
            }
          />

          {/* ==================================================
              AUTH
          ================================================== */}

          <Route
            path="/auth"
            element={
              <Auth
                onLoginSuccess={
                  handleLoginSuccess
                }
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />

          {/* ==================================================
              USER DASHBOARD

              USER + ADMIN
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="user"
                featureName="Safety Command Dashboard"
              >
                <Dashboard
                  onTriggerSOS={
                    handleTriggerSOS
                  }
                  guardians={guardians}
                  alerts={alerts}
                  currentUser={currentUser}
                  onOpenFakeCall={() =>
                    setIsFakeCallOpen(true)
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              GUARDIANS

              USER + ADMIN
          ================================================== */}

          <Route
            path="/guardians"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="user"
                featureName="Guardian Contact Management"
              >
                <Guardians
                  guardians={guardians}
                  onAddGuardian={
                    handleAddGuardian
                  }
                  onUpdateGuardian={
                    handleUpdateGuardian
                  }
                  onDeleteGuardian={
                    handleDeleteGuardian
                  }
                  onSetPrimaryGuardian={
                    handleSetPrimaryGuardian
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              LIVE LOCATION

              USER + ADMIN
          ================================================== */}

          <Route
            path="/live-location"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="user"
                featureName="Live Location Broadcast"
              >
                <LiveLocation
                  guardians={guardians}
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              PROFILE

              USER + ADMIN
          ================================================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="user"
                featureName="Personal Safety Profile"
              >
                <UserProfile
                  currentUser={currentUser}
                  onUpdateProfile={
                    handleUpdateProfile
                  }
                  alerts={alerts}
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              SETTINGS

              USER + ADMIN
          ================================================== */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="user"
                featureName="Account Safety Settings"
              >
                <UserSettings
                  currentUser={currentUser}
                  onUpdateProfile={
                    handleUpdateProfile
                  }
                  onOpenFakeCall={() =>
                    setIsFakeCallOpen(true)
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              ADMIN DASHBOARD

              ONLY ADMIN CAN ACCESS THIS PAGE.

              AdminDashboard contains AdminNavbar.

              DO NOT PUT Navbar HERE.
          ================================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                currentUser={currentUser}
                authLoading={isAuthLoading}
                onOpenAuthModal={() =>
                  handleOpenAuthModal("login")
                }
                onLoginSuccess={
                  handleLoginSuccess
                }
                onLogout={handleLogout}
                allowedRole="admin"
                featureName="Admin Control Center"
              >
                <AdminDashboard
                  currentUser={currentUser}
                  usersList={usersList}
                  onDeleteUser={
                    handleDeleteUser
                  }
                  onToggleUserStatus={
                    handleToggleUserStatus
                  }
                  onAddUser={
                    handleAddUser
                  }
                  onEditUser={
                    handleEditUser
                  }
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              404
          ================================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </main>

      {/* ======================================================
          FOOTER

          Do NOT show footer on admin page.
      ====================================================== */}

      {isKnownPath && !isAdminPage && (
        <Footer
          currentUser={currentUser}
        />
      )}

      {/* ======================================================
          AUTH MODAL
      ====================================================== */}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() =>
          setIsAuthModalOpen(false)
        }
        onLoginSuccess={
          handleLoginSuccess
        }
        initialTab={authModalTab}
      />

      {/* ======================================================
          SOS MODAL
      ====================================================== */}

      <SOSAlertModal
        isOpen={isSOSOpen}
        onClose={() =>
          setIsSOSOpen(false)
        }
        guardians={guardians}
      />

      {/* ======================================================
          SOS COOLDOWN
      ====================================================== */}

      {cooldownError && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-amber-900/90 text-amber-100 border border-amber-600 p-4 rounded-2xl shadow-2xl flex items-start gap-3">

          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />

          <div className="text-xs">

            <div className="font-extrabold uppercase">
              SOS Cooldown Active
            </div>

            <p>
              {cooldownError}
            </p>

          </div>

          <button
            onClick={() =>
              setCooldownError(null)
            }
            className="p-1"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* ======================================================
          FAKE CALL MODAL
      ====================================================== */}

      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() =>
          setIsFakeCallOpen(false)
        }
      />

    </div>
  );
}


// ==========================================================
// APP
// ==========================================================

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}