import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  MessageSquareText, 
  Settings as SettingsIcon,
  TrendingUp,
  BarChart2,
  LogOut,
  Loader2,
  Menu,
  X,
  Brain
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ChatBot from './components/ChatBot';
import Settings from './components/Settings';
import TradeModal from './components/TradeModal';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import BehavioralAnalytics from './components/BehavioralAnalytics';

import { 
  getTrades, 
  saveTrade, 
  deleteTrade, 
  getSettings, 
  saveSettings as saveSettingsService,
  logoutUser,
  getCurrentSessionUser
} from './services/storageService';
import { Trade, UserSettings, User } from './types';
import { supabase } from './services/supabaseClient';

enum Tab {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  CHAT = 'CHAT',
  BEHAVIORAL = 'BEHAVIORAL',
  SETTINGS = 'SETTINGS'
}

enum AppState {
  LOADING = 'LOADING',
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  APP = 'APP'
}

const App: React.FC = () => {
  // App Navigation State
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Content State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    initialCapital: 0,
    monthlyGoal: 0,
    riskPerTrade: 0
  });
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | undefined>(undefined);

  // Initialize Auth Session
  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentSessionUser();
      if (user) {
        handleLoginSuccess(user);
      } else {
        setAppState(AppState.LANDING);
      }
    };
    checkSession();

    // Listen for auth changes (like token expiration)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAppState(AppState.LANDING);
      } else if (event === 'SIGNED_IN' && session?.user) {
         const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name || '',
         }
         handleLoginSuccess(user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    setIsDataLoading(true);
    try {
      const [fetchedTrades, fetchedSettings] = await Promise.all([
        getTrades(userId),
        getSettings(userId)
      ]);
      setTrades(fetchedTrades);
      setSettings(fetchedSettings);
    } catch (error) {
      console.error("Failed to load user data", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.APP);
    loadUserData(user.id);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleSaveTrade = async (trade: Trade) => {
    if (!currentUser) return;
    await saveTrade(currentUser.id, trade);
    await loadUserData(currentUser.id); 
    setIsModalOpen(false);
  };

  const handleDeleteTrade = async (id: string) => {
    if (!currentUser) return;
    await deleteTrade(currentUser.id, id);
    await loadUserData(currentUser.id);
    setIsModalOpen(false);
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    if (!currentUser) return;
    setSettings(newSettings); 
    await saveSettingsService(currentUser.id, newSettings);
  };

  const openAddTrade = (date: string) => {
    setModalDate(date);
    setTradeToEdit(undefined);
    setIsModalOpen(true);
  };

  const openEditTrade = (trade: Trade) => {
    setModalDate(trade.date);
    setTradeToEdit(trade);
    setIsModalOpen(true);
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
      }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-gray-900 text-white font-medium shadow-sm' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} strokeWidth={activeTab === tab ? 2 : 2} />
      <span className="text-sm">{label}</span>
    </button>
  );

  // --- RENDER LOGIC ---

  if (appState === AppState.LOADING) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-gray-900" size={40} />
      </div>
    );
  }

  if (appState === AppState.LANDING) {
    return (
      <LandingPage 
        onGetStarted={() => { setAuthMode('REGISTER'); setAppState(AppState.AUTH); }}
        onLogin={() => { setAuthMode('LOGIN'); setAppState(AppState.AUTH); }}
      />
    );
  }

  if (appState === AppState.AUTH) {
    return (
      <Auth 
        initialMode={authMode}
        onAuthSuccess={handleLoginSuccess}
        onCancel={() => setAppState(AppState.LANDING)}
      />
    );
  }

  // --- MAIN APP UI ---

  return (
    <div className="flex h-screen bg-gray-50/50 text-gray-900 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <div className="bg-gray-900 text-white p-1.5 rounded-lg">
                <BarChart2 size={20} />
             </div>
             <span className="font-bold text-lg tracking-tight">GrinderScore</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
             {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 flex flex-col p-6 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-3 px-2 mb-10">
          <div className="p-2 bg-gray-900 rounded-lg">
            <BarChart2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">GrinderScore</h1>
          </div>
        </div>

        <div className="md:hidden mb-8 mt-16">
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem tab={Tab.CALENDAR} icon={CalendarIcon} label="Calendário" />
          <NavItem tab={Tab.CHAT} icon={MessageSquareText} label="AI Insight" />
          <NavItem tab={Tab.BEHAVIORAL} icon={Brain} label="Analytics Comp." />
          <NavItem tab={Tab.SETTINGS} icon={SettingsIcon} label="Ajustes" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 space-y-4">
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <p className="text-xs text-gray-500 mb-1 font-medium">Patrimônio Total</p>
             <p className="text-lg font-bold text-gray-900">
               {settings && (settings.initialCapital + trades.reduce((acc, t) => acc + t.pnl, 0)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
             </p>
           </div>
           
           <button 
             onClick={handleLogout}
             className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 font-medium w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
           >
             <LogOut size={16} /> Sair da conta
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pt-20 md:pt-8 px-4 md:px-8 pb-10 relative scroll-smooth">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {activeTab === Tab.DASHBOARD && 'Visão Geral'}
              {activeTab === Tab.CALENDAR && 'Calendário'}
              {activeTab === Tab.CHAT && 'AI Insight'}
              {activeTab === Tab.BEHAVIORAL && 'Analytics Comportamental'}
              {activeTab === Tab.SETTINGS && 'Configurações'}
            </h2>
            <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">
              {activeTab === Tab.DASHBOARD && 'Acompanhe métricas e evolução patrimonial.'}
              {activeTab === Tab.CALENDAR && 'Gerencie suas operações diárias.'}
              {activeTab === Tab.CHAT && 'Análise de mercado com inteligência artificial.'}
              {activeTab === Tab.BEHAVIORAL && 'Avaliação de performance e disciplina.'}
              {activeTab === Tab.SETTINGS && 'Personalize os parâmetros da sua conta.'}
            </p>
          </div>
          
          {activeTab === Tab.CALENDAR && (
            <button 
              onClick={() => openAddTrade(new Date().toISOString().split('T')[0])}
              className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              Novo Registro
            </button>
          )}
        </header>

        <div className="animate-fade-in pb-10">
          {isDataLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
             </div>
          ) : (
            <>
              {activeTab === Tab.DASHBOARD && <Dashboard trades={trades} settings={settings} />}
              {activeTab === Tab.CALENDAR && (
                <div className="h-auto md:h-[calc(100vh-14rem)]">
                  <CalendarView trades={trades} onAddTrade={openAddTrade} onEditTrade={openEditTrade} />
                </div>
              )}
              {activeTab === Tab.CHAT && <ChatBot trades={trades} />}
              {activeTab === Tab.BEHAVIORAL && <BehavioralAnalytics trades={trades} settings={settings} />}
              {activeTab === Tab.SETTINGS && <Settings settings={settings} onSave={handleSaveSettings} />}
            </>
          )}
        </div>
      </main>

      <TradeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrade}
        onDelete={handleDeleteTrade}
        initialDate={modalDate}
        tradeToEdit={tradeToEdit}
        userId={currentUser?.id || ''}
      />
    </div>
  );
};

export default App;
