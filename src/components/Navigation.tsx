import React, { useState } from 'react';
import { 
  Activity, 
  Mic, 
  Sliders, 
  FileSpreadsheet, 
  BrainCircuit, 
  ShieldCheck, 
  Satellite, 
  Leaf, 
  Award,
  Radio,
  Lock,
  Cpu,
  User,
  LogOut,
  Flame,
  Search,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  climateMode: boolean;
  setClimateMode: (mode: boolean) => void;
  openVisionModal: () => void;
  openJudgeMode: () => void;
  openModelLeaderboard: () => void;
  openAuthModal: () => void;
  tickerVisible: boolean;
  setTickerVisible: (visible: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  climateMode,
  setClimateMode,
  openVisionModal,
  openJudgeMode,
  openModelLeaderboard,
  openAuthModal,
  tickerVisible,
  setTickerVisible
}) => {
  const { user, signOut } = useAuth();
  const [headerSearch, setHeaderSearch] = useState('');

  const navItems = [
    { id: 'overview', label: 'GIS Command Center', icon: Activity, badge: 'Live Grid' },
    { id: 'citizen', label: 'Citizen Ingestion', icon: Mic, badge: '5 Langs' },
    { id: 'priorities', label: 'Priority Index', icon: FileSpreadsheet, badge: '40 Dists' },
    { id: 'simulator', label: 'Budget Simulator (SCIP)', icon: Sliders, badge: 'MILP' },
    { id: 'assistant', label: 'Policy Copilot', icon: BrainCircuit, badge: 'Gemini' },
    { id: 'trace', label: 'Merkle Lineage Trace', icon: ShieldCheck, badge: 'SHA-256' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      
      {/* Top Tier: Identity, Global Search, System Telemetry & Role Access */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 border-b border-slate-100">
        
        {/* Left: Brand & System Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="font-display text-base font-bold tracking-tight text-slate-900 flex items-center">
              <span>Civic<span className="text-emerald-600">Grid</span></span>
              <span className="ml-1.5 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-mono font-bold text-slate-700 cursor-default select-none">AI</span>
            </span>
            <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 cursor-default select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>V1.2 LIVE</span>
            </div>
          </div>
        </div>

        {/* Center: Global Intelligence Search Field */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search districts, sectors, or metrics..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-14 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="text-[10px] font-mono bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300/60 cursor-default select-none">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: National Grid, ESG, CV, ML & Judge Demo Actions */}
        <div className="flex items-center space-x-2">
          
          {/* National Location Badge */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium cursor-default select-none">
            <Globe2 className="h-3.5 w-3.5 text-slate-500" />
            <span>IN National Grid</span>
          </div>

          {/* Climate-Resilient ESG Mode Toggle */}
          <button
            onClick={() => setClimateMode(!climateMode)}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all border ${
              climateMode
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Toggle ESG & Climate Disaster Vulnerability Composite Index"
          >
            <Leaf className={`h-3.5 w-3.5 ${climateMode ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{climateMode ? 'ESG: ON' : 'ESG Mode'}</span>
          </button>

          {/* Satellite & Road CV Inspector */}
          <button
            onClick={openVisionModal}
            className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
            title="Sentinel-2 Satellite NDWI & Road Pavement CV Inspector"
          >
            <Satellite className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Satellite CV</span>
          </button>

          {/* ML Models & 2k Test Suite */}
          <button
            onClick={openModelLeaderboard}
            className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
            title="Inspect 15 Trained Machine Learning Architectures & 2k Test Set"
          >
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">ML Benchmark</span>
          </button>

          {/* Executive Architecture Briefing Button */}
          <button
            onClick={openJudgeMode}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
            title="System Architecture & Executive Intelligence Briefing"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Executive Briefing</span>
          </button>

          {/* User Auth & Role Switcher */}
          {user ? (
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={openAuthModal}
                className="flex items-center space-x-2 rounded-lg hover:bg-white px-2 py-0.5 transition-all text-xs"
                title="Switch User Role or View Firebase Profile"
              >
                <div className="h-6 w-6 rounded-full overflow-hidden border border-slate-300 bg-white shrink-0 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-slate-900 text-[11px] leading-tight truncate max-w-[85px]">
                    {user?.displayName ? user.displayName.split(' ')[0] : 'Officer'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono leading-tight">
                    {user?.role || 'Verified'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => signOut()}
                className="p-1 rounded-md bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-all text-xs"
                title="Sign Out of Session"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02]"
              title="Sign In with Firebase or Select a Persona"
            >
              <Flame className="h-3.5 w-3.5 text-white" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Second Tier: Horizontal Primary Product Navigation Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
};
