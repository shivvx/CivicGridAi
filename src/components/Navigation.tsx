import React from 'react';
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
  UserCheck,
  User,
  LogOut,
  Flame
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
  const navItems = [
    { id: 'overview', label: 'GIS Command Center', icon: Activity },
    { id: 'citizen', label: 'Citizen Ingestion', icon: Mic },
    { id: 'priorities', label: 'Priority Index', icon: FileSpreadsheet },
    { id: 'simulator', label: 'Budget Simulator (SCIP)', icon: Sliders },
    { id: 'assistant', label: 'Policy Copilot', icon: BrainCircuit },
    { id: 'trace', label: 'Merkle Lineage Trace', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo & Security Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-blue-600 shadow-md shadow-cyan-500/20 shrink-0">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-display text-lg font-black tracking-tight text-white leading-none">
                CIVIC<span className="text-cyan-400">GRID</span> <span className="text-indigo-400">AI</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            {/* Wi-Fi Loopback Isolation Badge */}
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="font-mono text-[10px] text-slate-400">
                127.0.0.1:8750 <span className="text-emerald-400 font-semibold">• Loopback Protected</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Feature 8: Climate-Resilient ESG Mode Toggle */}
          <button
            onClick={() => setClimateMode(!climateMode)}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all border ${
              climateMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Feature 8: ESG & Climate Disaster Vulnerability Composite Index"
          >
            <Leaf className={`h-3.5 w-3.5 ${climateMode ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{climateMode ? 'ESG Mode: ON' : 'ESG Mode'}</span>
          </button>

          {/* Feature 1: Satellite & CV Inspector Button */}
          <button
            onClick={openVisionModal}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950/50 hover:border-cyan-400 transition-all"
            title="Feature 1: Sentinel-2 Satellite NDWI & Road Pavement CV Inspector"
          >
            <Satellite className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Satellite CV</span>
          </button>

          {/* ML Models & 2k Test Suite Button */}
          <button
            onClick={openModelLeaderboard}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/50 hover:border-emerald-400 transition-all shadow-sm"
            title="Inspect 15 Trained Machine Learning Architectures & 2,000-Sample Test Set Leaderboard"
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">ML Leaderboard</span>
          </button>

          {/* Dedicated Judge Mode Button */}
          <button
            onClick={openJudgeMode}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:scale-105 transition-transform"
            title="Launch 6-Step Hackathon Judge Walkthrough Tour"
          >
            <Award className="h-3.5 w-3.5 text-amber-100" />
            <span>Judge Mode</span>
          </button>

          {/* User Auth & Role Switcher / Logout */}
          {user ? (
            <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-cyan-500/30">
              <button
                onClick={openAuthModal}
                className="flex items-center space-x-2 rounded-lg hover:bg-slate-800/80 px-2 py-1 transition-all text-xs"
                title="Switch User Role or View Firebase Profile"
              >
                <div className="h-6 w-6 rounded-full overflow-hidden border border-cyan-400 bg-slate-800 shrink-0 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-cyan-300" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[85px]">
                    {user?.displayName ? user.displayName.split(' ')[0] : 'Officer'}
                  </span>
                  <span className="text-[9px] text-cyan-300 font-mono leading-tight">
                    {user?.role === 'District Planning Officer' ? 'DM Bahraich' : user?.role === 'State Auditor' ? 'Auditor' : user?.role || 'Citizen'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 hover:border-rose-400 transition-all text-xs"
                title="Sign Out of Firebase Session"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105"
              title="Sign In with Firebase or Select a Persona"
            >
              <Flame className="h-3.5 w-3.5 text-amber-100" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 bg-slate-950/90 px-2 py-1.5 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex shrink-0 items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
