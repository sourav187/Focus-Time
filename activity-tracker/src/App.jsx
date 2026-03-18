import React, { useState, useEffect } from 'react';
import { Coffee, LayoutDashboard, BarChart2, User, ListTodo } from 'lucide-react';
import TimerView from './pages/TimerView';
import StatsView from './pages/StatsView';
import TasksView from './pages/TasksView';
import LoginModal from './components/LoginModal';
import { TaskProvider } from './context/TaskContext';
import { supabase } from './utils/supabaseClient';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Get initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserProfile(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (payload) => {
    if (payload === 'LOGOUT') {
      await supabase.auth.signOut();
      setShowLogin(false);
      return;
    }

    const { email, password, mode } = payload;
    let authError = null;

    if (mode === 'REGISTER') {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
      if (!authError) {
        alert("Registered! Note: If Supabase 'Confirm email' is ON, you must click the verification link in your email before you can log in.");
      }
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

  const renderTab = () => {
    switch(currentTab) {
      case 'dashboard': return <TimerView />;
      case 'stats': return <StatsView />;
      case 'tasks': return <TasksView />;
      default: return <TimerView />;
    }
  };

  return (
    <TaskProvider user={userProfile}>
      <div className="min-h-screen bg-[#FAF8F5] text-[#4A3F35] font-sans selection:bg-[#E89D71] selection:text-white transition-colors duration-300">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto mb-4">
          <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E89D71]/20 rounded-xl text-[#E89D71]">
            <Coffee size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-medium tracking-tight">Focus Time</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentTab === 'dashboard' ? 'bg-white text-[#E89D71] shadow-sm border border-[#F4EFE6]' : 'text-[#8C7A6B] hover:bg-white/50'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentTab === 'stats' ? 'bg-white text-[#E89D71] shadow-sm border border-[#F4EFE6]' : 'text-[#8C7A6B] hover:bg-white/50'}`}
          >
            <BarChart2 size={18} /> Stats
          </button>
          <button
            onClick={() => setCurrentTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentTab === 'tasks' ? 'bg-white text-[#E89D71] shadow-sm border border-[#F4EFE6]' : 'text-[#8C7A6B] hover:bg-white/50'}`}
          >
            <ListTodo size={18} /> Tasks
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#8C7A6B] hover:bg-white/50 transition-all font-bold group"
          >
            <div className="p-1 bg-[#FAF8F5] rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-[#F4EFE6]">
              <User size={16} className="text-[#E89D71]" />
            </div>
            {userProfile ? userProfile.email.split('@')[0] : 'Login'}
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
