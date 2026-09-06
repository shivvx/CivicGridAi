import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  CheckCircle2,
  X,
  MapPin,
  Compass,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIA_DISTRICTS, IndiaDistrict } from '../lib/allIndiaDistricts';

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
  onSelectDistrictFromSearch?: (district: IndiaDistrict) => void;
  setSelectedSector?: (sector: string) => void;
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
  setTickerVisible,
  onSelectDistrictFromSearch,
  setSelectedSector
}) => {
  const { user, signOut } = useAuth();
  const [headerSearch, setHeaderSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'overview', label: 'GIS Command Center', icon: Activity, badge: 'Live Grid' },
    { id: 'citizen', label: 'Citizen Ingestion', icon: Mic, badge: '5 Langs' },
    { id: 'priorities', label: 'Priority Index', icon: FileSpreadsheet, badge: '802 Grid' },
    { id: 'simulator', label: 'Budget Simulator (SCIP)', icon: Sliders, badge: 'MILP' },
    { id: 'assistant', label: 'Policy Copilot', icon: BrainCircuit, badge: 'Gemini' },
    { id: 'trace', label: 'Merkle Lineage Trace', icon: ShieldCheck, badge: 'SHA-256' },
  ];

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = headerSearch.trim().toLowerCase();

  // Search Results: Districts (802 Grid)
  const matchingDistricts = useMemo(() => {
    if (!query) return [];
    return ALL_INDIA_DISTRICTS.filter(d => 
      d.district.toLowerCase().includes(query) || d.state.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [query]);

  // Search Results: Navigation Modules
  const matchingModules = useMemo(() => {
    if (!query) return [];
    return navItems.filter(item => 
      item.label.toLowerCase().includes(query) || item.id.toLowerCase().includes(query) || item.badge.toLowerCase().includes(query)
    );
  }, [query]);

  // Search Results: Deficit Sectors
  const SECTOR_OPTIONS = ['Healthcare', 'Water & Sanitation', 'Roads & Bridges', 'Power & Energy', 'Education'];
  const matchingSectors = useMemo(() => {
    if (!query) return [];
    return SECTOR_OPTIONS.filter(s => s.toLowerCase().includes(query));
  }, [query]);

  const hasResults = matchingDistricts.length > 0 || matchingModules.length > 0 || matchingSectors.length > 0;

  const handleDistrictClick = (dist: IndiaDistrict) => {
    if (onSelectDistrictFromSearch) {
      onSelectDistrictFromSearch(dist);
    }
    setActiveTab('overview');
    setHeaderSearch('');
    setIsSearchOpen(false);
  };

  const handleModuleClick = (tabId: string) => {
    setActiveTab(tabId);
    setHeaderSearch('');
    setIsSearchOpen(false);
  };

  const handleSectorClick = (sector: string) => {
    if (setSelectedSector) {
      setSelectedSector(sector);
    }
    setActiveTab('overview');
    setHeaderSearch('');
    setIsSearchOpen(false);
  };

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
              <span>802 DISTS LIVE</span>
            </div>
          </div>
        </div>

        {/* Center: Global Intelligence Search Field with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search all 802 districts, sectors, or modules..."
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-14 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-300 transition-all shadow-2xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {headerSearch ? (
                <button
                  onClick={() => {
                    setHeaderSearch('');
                    setIsSearchOpen(false);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <kbd className="text-[10px] font-mono bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300/60 cursor-default select-none">⌘K</kbd>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown Panel */}
          {isSearchOpen && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-[9999] max-h-[420px] overflow-y-auto animate-fadeIn divide-y divide-slate-100">
              
              {/* Districts Section */}
              {matchingDistricts.length > 0 && (
                <div className="p-2">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Indian Districts (802 Grid)</span>
                    <span className="text-[9px] text-emerald-600 lowercase font-sans font-medium">click to zoom on map</span>
                  </div>
                  {matchingDistricts.map((dist) => (
                    <button
                      key={`${dist.district}-${dist.state}`}
                      onClick={() => handleDistrictClick(dist)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-emerald-50/70 group transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                            {dist.district}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {dist.state} • {dist.latitude.toFixed(2)}°N, {dist.longitude.toFixed(2)}°E
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                        <span>Zoom</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Modules Section */}
              {matchingModules.length > 0 && (
                <div className="p-2">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Platform Modules
                  </div>
                  {matchingModules.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleModuleClick(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 group transition-all"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 group-hover:text-slate-900 transition-colors">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.badge}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Deficit Sectors Section */}
              {matchingSectors.length > 0 && (
                <div className="p-2">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Deficit Sectors
                  </div>
                  {matchingSectors.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => handleSectorClick(sector)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-emerald-50/70 group transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {sector}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                        <span>Filter Map</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!hasResults && (
                <div className="p-6 text-center text-xs text-slate-500">
                  <Compass className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No matching district or module</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try searching for <span className="font-bold text-slate-600">Bahraich</span>, <span className="font-bold text-slate-600">Varanasi</span>, <span className="font-bold text-slate-600">Healthcare</span>, or <span className="font-bold text-slate-600">SCIP</span>
                  </p>
                </div>
              )}

            </div>
          )}
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
