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
  Lock
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  climateMode: boolean;
  setClimateMode: (mode: boolean) => void;
  openVisionModal: () => void;
  openJudgeMode: () => void;
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
  tickerVisible,
  setTickerVisible
}) => {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-blue-700 shadow-lg shadow-cyan-500/25">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-lg font-black tracking-tight text-white">
                CIVIC<span className="text-cyan-400">GRID</span> <span className="text-indigo-400">AI</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                v2.6 PROD
              </span>
            </div>
            {/* Wi-Fi Loopback Isolation Badge */}
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span className="font-mono text-[10px] tracking-tight text-slate-300">
                127.0.0.1:8750 <span className="text-emerald-400 font-semibold">• Loopback Isolated</span>
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

          {/* Dedicated Judge Mode Button */}
          <button
            onClick={openJudgeMode}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:scale-105 transition-transform"
            title="Launch 6-Step Hackathon Judge Walkthrough Tour"
          >
            <Award className="h-3.5 w-3.5 text-amber-100" />
            <span>Judge Mode</span>
          </button>
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
