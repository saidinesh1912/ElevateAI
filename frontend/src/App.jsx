
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import { auth } from "./services/firebase";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  getUserProfile,
  getResumeAnalyses,
  getCareerTwinHistory,
} from "./services/api";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import HiddenSkills from "./pages/HiddenSkills";
import CareerTwin from "./pages/CareerTwin";
import {
  Zap,
  LayoutDashboard,
  Brain,
  GitBranch,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Target,
  Sparkles,
  Clock,
  ArrowRight,
  RefreshCw,
  BriefcaseBusiness,
} from "lucide-react";

// --------------------------------------------------
// PROTECTED ROUTE
// --------------------------------------------------

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading Elevate AI...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// --------------------------------------------------
// SIDEBAR NAVIGATION ITEM
// --------------------------------------------------

function SidebarItem({ to, icon: Icon, label, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      title={collapsed ? label : ""}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "sidebar-link-active" : ""} ${
          collapsed ? "sidebar-link-collapsed" : ""
        }`
      }
    >
      <Icon size={20} className="sidebar-link-icon" />
      <span className="sidebar-link-label">{label}</span>
      <span className="sidebar-link-indicator" />
    </NavLink>
  );
}

// --------------------------------------------------
// SIDEBAR SECTION HEADING
// --------------------------------------------------

function SidebarSection({ children, collapsed }) {
  return (
    <p className={`sidebar-section-title ${collapsed ? "sidebar-section-hidden" : ""}`}>
      {children}
    </p>
  );
}

// --------------------------------------------------
// SIDEBAR
// --------------------------------------------------

function Sidebar({ collapsed, mobileOpen, onClose, onLogout }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`app-sidebar ${
          collapsed ? "app-sidebar-collapsed" : ""
        } ${mobileOpen ? "app-sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={24} />
          </div>

          <div className="sidebar-brand-text">
            <h2>
              ELEVATE <span>AI</span>
            </h2>
            <p>CAREER INTELLIGENCE</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sidebar-mobile-close"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <SidebarSection collapsed={collapsed}>
            WORKSPACE
          </SidebarSection>

          <SidebarItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Overview"
            collapsed={collapsed}
            onNavigate={onClose}
          />

          <SidebarSection collapsed={collapsed}>
            AI INTELLIGENCE
          </SidebarSection>

          <SidebarItem
            to="/hidden-skills"
            icon={Brain}
            label="Hidden Skill Discovery"
            collapsed={collapsed}
            onNavigate={onClose}
          />

          <SidebarItem
            to="/career-twin"
            icon={GitBranch}
            label="Career Digital Twin"
            collapsed={collapsed}
            onNavigate={onClose}
          />

          <div className="sidebar-divider" />

          <SidebarSection collapsed={collapsed}>
            PERSONAL
          </SidebarSection>

          <SidebarItem
            to="/profile"
            icon={UserRound}
            label="My Profile"
            collapsed={collapsed}
            onNavigate={onClose}
          />

          <SidebarItem
            to="/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
            onNavigate={onClose}
          />
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Logout" : ""}
            className="sidebar-logout"
          >
            <LogOut size={20} />
            <span className="sidebar-link-label">Logout</span>
          </button>

          <div className="sidebar-version">
            <span className="sidebar-version-dot" />
            <span className="sidebar-link-label">Elevate AI · 2026</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// --------------------------------------------------
// TOP NAVBAR
// --------------------------------------------------

function TopNavbar({ collapsed, setCollapsed, setMobileOpen, profile }) {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Overview",
    "/hidden-skills": "Hidden Skill Discovery",
    "/career-twin": "Career Digital Twin",
    "/profile": "My Profile",
    "/settings": "Settings",
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "S";

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          className="sidebar-toggle-button"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight size={23} />
          ) : (
            <ChevronLeft size={23} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="mobile-menu-button"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1>{pageTitles[location.pathname] || "Elevate AI"}</h1>
          <p>Career Intelligence Platform</p>
        </div>
      </div>

      <div className="app-topbar-right">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>

          <div className="topbar-user-info">
            <p>{profile?.full_name || "Student"}</p>
            <span>Student</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// --------------------------------------------------
// STATISTIC CARD
// --------------------------------------------------

function StatCard({ icon: Icon, label, value, description, delay }) {
  return (
    <div className="dashboard-stat-card" style={{ animationDelay: delay }}>
      <div className="dashboard-stat-icon">
        <Icon size={22} />
      </div>

      <h3>{value}</h3>
      <p className="font-semibold text-white">{label}</p>
      <p>{description}</p>
    </div>
  );
}

// --------------------------------------------------
// FEATURE CARD
// --------------------------------------------------

function FeatureCard({ icon: Icon, title, description, details, link, delay }) {
  const navigate = useNavigate();

  return (
    <article
      className="dashboard-feature-card"
      style={{ animationDelay: delay }}
    >
      <div className="dashboard-feature-icon">
        <Icon size={27} />
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <div className="dashboard-feature-details">
        <p>{details}</p>

        <button type="button" onClick={() => navigate(link)}>
          Explore feature
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

// --------------------------------------------------
// DASHBOARD HOME
// --------------------------------------------------

function readAnalysisResult(record) {
  const raw = record?.analysis_result ?? record?.analysis ?? record?.results ?? {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? raw : {};
}

function getSkillLabel(skill) {
  if (typeof skill === "string") return skill.trim();
  return String(skill?.skill || skill?.name || skill?.skill_name || "").trim();
}

function formatActivityDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function DashboardHome({ profile, loading }) {
  const navigate = useNavigate();
  const [resumeAnalyses, setResumeAnalyses] = useState([]);
  const [careerAnalyses, setCareerAnalyses] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      setIsLoadingStats(true);
      setStatsError("");

      const [resumeResult, careerResult] = await Promise.allSettled([
        getResumeAnalyses(),
        getCareerTwinHistory(),
      ]);

      if (!active) return;

      if (resumeResult.status === "fulfilled") {
        const records = resumeResult.value?.analyses;
        setResumeAnalyses(Array.isArray(records) ? records : []);
      } else {
        console.error("Dashboard resume analytics error:", resumeResult.reason);
      }

      if (careerResult.status === "fulfilled") {
        const records = careerResult.value?.analyses;
        setCareerAnalyses(Array.isArray(records) ? records : []);
      } else {
        console.error("Dashboard Career Twin analytics error:", careerResult.reason);
      }

      if (resumeResult.status === "rejected" && careerResult.status === "rejected") {
        setStatsError("Unable to load your activity and career statistics.");
      }

      setIsLoadingStats(false);
    };

    loadDashboardData();
    return () => { active = false; };
  }, []);

  const dashboardStats = useMemo(() => {
    const projects = resumeAnalyses.flatMap((record) => {
      const result = readAnalysisResult(record);
      return Array.isArray(result.projects) ? result.projects : [];
    });

    const discoveredSkills = new Set();
    projects.forEach((project) => {
      const explicit = Array.isArray(project.explicit_skills) ? project.explicit_skills : [];
      const hidden = Array.isArray(project.potential_hidden_skills) ? project.potential_hidden_skills : [];
      [...explicit, ...hidden].forEach((skill) => {
        const label = getSkillLabel(skill);
        if (label) discoveredSkills.add(label.toLowerCase());
      });
    });

    const careerPaths = new Set();
    careerAnalyses.forEach((record) => {
      const matches = Array.isArray(record.career_matches) ? record.career_matches : [];
      matches.forEach((match) => {
        const name = String(match?.career || "").trim();
        if (name) careerPaths.add(name.toLowerCase());
      });
    });

    return {
      projects: projects.length,
      skills: discoveredSkills.size,
      careerPaths: careerPaths.size,
    };
  }, [resumeAnalyses, careerAnalyses]);

  const recentActivities = useMemo(() => {
    const hiddenItems = resumeAnalyses.map((record) => {
      const result = readAnalysisResult(record);
      const count = Array.isArray(result.projects) ? result.projects.length : 0;
      return {
        id: `hidden-${record.id || record.created_at || record.filename}`,
        title: "Hidden Skill Discovery completed",
        description: `${count} project${count === 1 ? "" : "s"} analyzed from ${record.filename || "your resume"}`,
        date: record.created_at,
        route: "/hidden-skills",
        icon: Brain,
      };
    });

    const careerItems = careerAnalyses.map((record) => {
      const count = Array.isArray(record.career_matches) ? record.career_matches.length : 0;
      return {
        id: `career-${record.id || record.created_at || record.filename}`,
        title: "Career Digital Twin generated",
        description: `${count} career path${count === 1 ? "" : "s"} recommended from ${record.filename || "your resume"}`,
        date: record.created_at,
        route: "/career-twin",
        icon: GitBranch,
      };
    });

    return [...hiddenItems, ...careerItems]
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [resumeAnalyses, careerAnalyses]);

  const firstName = profile?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-eyebrow">
          <Sparkles size={15} />
          YOUR CAREER INTELLIGENCE
        </div>
        <h2>Welcome Back, {firstName}!</h2>
        <p>
          Discover your hidden potential, understand your skills
          and build your future career with Elevate AI.
        </p>
        <div className="flex items-center gap-2 mt-5 text-xs text-neutral-500">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          Your personal AI career workspace
        </div>
      </section>

      {loading && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-neutral-300 mb-8">
          Loading your profile...
        </div>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Career Overview</h2>
          <p>Your career intelligence at a glance.</p>
        </div>

        {statsError && (
          <div className="mb-5 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
            {statsError}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-3 font-semibold text-orange-400 hover:text-orange-300"
            >
              Retry
            </button>
          </div>
        )}

        <div className="dashboard-stats">
          <StatCard icon={FolderKanban} label="Projects Analyzed"
            value={isLoadingStats ? "…" : dashboardStats.projects}
            description="Projects analyzed by Hidden Skill Discovery" delay="0ms" />
          <StatCard icon={Brain} label="Skills Discovered"
            value={isLoadingStats ? "…" : dashboardStats.skills}
            description="Unique explicit and potential hidden skills" delay="100ms" />
          <StatCard icon={BriefcaseBusiness} label="Career Paths"
            value={isLoadingStats ? "…" : dashboardStats.careerPaths}
            description="Unique AI-recommended career paths" delay="200ms" />
          <StatCard icon={Target} label="Profile Completion"
            value="—" description="Profile completion is not calculated yet" delay="300ms" />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>AI Career Intelligence</h2>
          <p>Explore the intelligence behind your career growth.</p>
        </div>
        <div className="dashboard-feature-grid">
          <FeatureCard icon={Brain} title="Hidden Skill Discovery"
            description="Discover technical and soft skills hidden in your projects, experiences and achievements."
            details="Let AI analyze your project descriptions and uncover the skills you may have overlooked."
            link="/hidden-skills" delay="100ms" />
          <FeatureCard icon={GitBranch} title="Career Digital Twin"
            description="Create your digital career profile and explore personalized career paths based on your skills and interests."
            details="Understand your career possibilities and identify the skills you need to develop."
            link="/career-twin" delay="200ms" />
        </div>
      </section>

      <section className="dashboard-activity">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Clock size={21} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Recent Activity</h2>
            <p className="text-neutral-500 text-xs mt-1">Your latest AI career updates.</p>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="dashboard-activity-empty">
            <RefreshCw size={25} className="animate-spin text-orange-400" />
            <p className="text-neutral-400">Loading your recent activity...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="dashboard-activity-empty">
            <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center">
              <Clock size={24} className="text-orange-400" />
            </div>
            <p className="text-white font-semibold">No recent activity yet</p>
            <p className="max-w-sm">
              Your Hidden Skill Discovery and Career Digital Twin analyses
              will appear here after you complete them.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <button key={activity.id} type="button"
                  onClick={() => navigate(activity.route)}
                  className="group flex w-full min-w-0 items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left transition hover:border-orange-500/40 hover:bg-neutral-900 sm:p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                    <ActivityIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-white">{activity.title}</p>
                    <p className="mt-1 break-words text-xs leading-5 text-neutral-400">{activity.description}</p>
                    <p className="mt-2 text-[11px] text-neutral-600">{formatActivityDate(activity.date)}</p>
                  </div>
                  <ArrowRight size={17}
                    className="shrink-0 text-neutral-600 transition group-hover:translate-x-1 group-hover:text-orange-400" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer className="text-center text-neutral-600 text-xs py-8">
        Elevate AI © 2026 | Your Career Intelligence Platform
      </footer>
    </div>
  );
}

// --------------------------------------------------
// PLACEHOLDER PAGES
// --------------------------------------------------

function PlaceholderPage({ title, description }) {
  return (
    <div className="dashboard-page">
      <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-10 text-center animate-fade-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
          <Sparkles size={30} className="text-orange-400" />
        </div>

        <h2 className="text-white text-2xl font-bold">{title}</h2>

        <p className="text-neutral-400 mt-3">{description}</p>

        <span className="inline-block mt-6 text-orange-400 text-sm font-semibold">
          Coming soon
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------------
// SHARED DASHBOARD LAYOUT
// --------------------------------------------------

function DashboardLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getUserProfile();
      setProfile(response.profile);
    } catch (err) {
      console.error("Profile retrieval error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid]);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to sign out. Please try again.");
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <TopNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
          profile={profile}
        />

        {error && (
          <div className="mx-4 mt-4 sm:mx-6 bg-red-950/40 border border-red-800 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>

            <button
              type="button"
              onClick={fetchProfile}
              className="mt-3 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {typeof children === "function"
          ? children({ profile, loading, error })
          : children}
      </main>
    </div>
  );
}

// --------------------------------------------------
// APPLICATION ROUTES
// --------------------------------------------------

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading Elevate AI...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        }
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              {({ profile, loading }) => (
                <DashboardHome profile={profile} loading={loading} />
              )}
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hidden-skills"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HiddenSkills />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/career-twin"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CareerTwin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              {({ profile, loading }) => (
                <PlaceholderPage
                  title="My Profile"
                  description={
                    loading
                      ? "Loading your profile..."
                      : `Your registered profile: ${
                          profile?.full_name || "Student"
                        }`
                  }
                />
              )}
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PlaceholderPage
                title="Settings"
                description="Manage your Elevate AI preferences."
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --------------------------------------------------
// MAIN APPLICATION
// --------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
