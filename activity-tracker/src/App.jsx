import React, { useState, useEffect, useRef } from 'react';
import { Coffee, LayoutDashboard, BarChart2, User, ListTodo, Sun, Moon, Menu, ChevronDown } from 'lucide-react';
import DashboardView from './pages/DashboardView';
import StatsView from './pages/StatsView';
import TasksView from './pages/TasksView';
import LoginModal from './components/Login/LoginModal';
import { TaskProvider } from './context/TaskContext';
import { supabase } from './utils/supabaseClient';
import { profileService } from './services/dataService';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('focus-theme') === 'dark' ||
      (!localStorage.getItem('focus-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const lastSyncedTheme = useRef(darkMode ? 'dark' : 'light');

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserProfile(session?.user ?? null);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Theme with DB Profile
  useEffect(() => {
    const themeStr = darkMode ? 'dark' : 'light';
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('focus-theme', themeStr);

    if (userProfile && themeStr !== lastSyncedTheme.current) {
      profileService.updateProfile(userProfile, { theme: themeStr }).then(() => {
        lastSyncedTheme.current = themeStr;
      });
    }
  }, [darkMode, userProfile]);

  const handleAuth = async (payload) => {
    if (payload === 'LOGOUT') {
      supabase.auth.signOut();
      setUserProfile(null);
      setShowLogin(false);
      return;
    }

    const { email, password, mode } = payload;
    let authError = null;

    if (mode === 'REGISTER') {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
      if (!authError) alert("Check your email for a verification link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    }

    if (authError) {
      alert(authError.message);
      return;
    }

    setShowLogin(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'tasks', label: 'Tasks', icon: ListTodo }
  ];

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard': return <DashboardView />;
      case 'stats': return <StatsView />;
      case 'tasks': return <TasksView />;
      default: return <DashboardView />;
    }
  };

  const activeTab = tabs.find(t => t.id === currentTab) || tabs[0];

  return (
    <TaskProvider user={userProfile}>
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans selection:bg-[var(--app-accent)] selection:text-white transition-colors duration-300">
        {/* Top Navigation */}
        <nav className="px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--app-accent-muted)] rounded-xl text-[var(--app-accent)]">
              <Coffee size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Focus Time</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Dropdown */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--app-card)] text-[var(--app-accent)] shadow-sm border border-[var(--app-border)] font-bold transition-all active:scale-95"
              >
                <activeTab.icon size={18} />
                <span>{activeTab.label}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setCurrentTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${currentTab === tab.id ? 'bg-[var(--app-bg)] text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-bg)]'}`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentTab === tab.id ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-sm border border-[var(--app-border)]' : 'text-[var(--app-text-muted)] hover:text-white/5'}`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-6 bg-[var(--app-border)] mx-2" />

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-card)] hover:text-[var(--app-accent)] border border-transparent hover:border-[var(--app-border)] transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-card)] transition-all font-bold group"
            >
              <div className="p-1.5 bg-[var(--app-bg)] rounded-xl group-hover:bg-[var(--app-card)] transition-colors border border-[var(--app-border)]">
                <User size={16} className="text-[var(--app-accent)]" />
              </div>
              <span className="hidden sm:inline-block">
                {userProfile ? userProfile.email.split('@')[0] : 'Login'}
              </span>
            </button>
          </div>
        </nav>

        {/* Render Current View */}
        {renderTab()}

        {/* Login Modal Config */}
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSave={handleAuth}
          currentUser={userProfile}
        />
      </div>
    </TaskProvider>
  );
}

export default App;
