import React, { useState, useEffect } from 'react';
import { District, Hotspot, SCIPResult, TelemetryEvent } from './types';
import { fetchDistricts, fetchHotspots, simulateBudget } from './lib/api';

import { Navigation } from './components/Navigation';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CitizenSubmission } from './components/CitizenSubmission';
import { PriorityTable } from './components/PriorityTable';
import { SimulationView } from './components/SimulationView';
import { PolicyAssistant } from './components/PolicyAssistant';
import { TraceView } from './components/TraceView';
import { DistrictDrawer } from './components/DistrictDrawer';
import { VisionModal } from './components/VisionModal';
import { JudgeMode } from './components/JudgeMode';
import { TelemetryTicker } from './components/TelemetryTicker';
import { ModelLeaderboardModal } from './components/ModelLeaderboardModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [climateMode, setClimateMode] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<string>('All');

  const [districts, setDistricts] = useState<District[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [scipResult, setScipResult] = useState<SCIPResult | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState<boolean>(false);
  const [isModelLeaderboardOpen, setIsModelLeaderboardOpen] = useState<boolean>(false);
  const [tickerVisible, setTickerVisible] = useState<boolean>(true);
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryEvent | null>(null);

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, [climateMode, selectedSector]);

  const loadData = async () => {
    try {
      const [distRes, hsRes, simRes] = await Promise.all([
        fetchDistricts(climateMode, selectedSector),
        fetchHotspots(),
        simulateBudget(150000000, climateMode, selectedSector)
      ]);

      if (distRes && distRes.districts) setDistricts(distRes.districts);
      if (hsRes && hsRes.hotspots) setHotspots(hsRes.hotspots);
      if (simRes) setScipResult(simRes);
    } catch (e) {
      console.error('Data loading error:', e);
    }
  };

  const handleTelemetrySubmitted = (analysis: any) => {
    const evt: TelemetryEvent = {
      telemetry_id: analysis.telemetry_id,
      language: analysis.detected_language,
      district: analysis.extracted_district,
      state: 'National Grid',
      category: analysis.intent_name,
      urgency: analysis.urgency_rating,
      snippet: analysis.standardized_english_summary,
      timestamp: 'Just now',
      pulse: true
    };
    setLatestTelemetry(evt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-16">
      
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        climateMode={climateMode}
        setClimateMode={setClimateMode}
        openVisionModal={() => setIsVisionModalOpen(true)}
        openJudgeMode={() => setIsJudgeModeOpen(true)}
        openModelLeaderboard={() => setIsModelLeaderboardOpen(true)}
        tickerVisible={tickerVisible}
        setTickerVisible={setTickerVisible}
      />

      {/* Main Content Body */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            districts={districts}
            hotspots={hotspots}
            scipResult={scipResult}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            climateMode={climateMode}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            latestTelemetry={latestTelemetry}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenSubmission
            onTelemetrySubmitted={handleTelemetrySubmitted}
          />
        )}

        {activeTab === 'priorities' && (
          <PriorityTable
            districts={districts}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            climateMode={climateMode}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulationView
            districts={districts}
            climateMode={climateMode}
          />
        )}

        {activeTab === 'assistant' && (
          <PolicyAssistant
            budgetLimit={scipResult?.active_budget_limit_inr || 150000000}
            climateMode={climateMode}
          />
        )}

        {activeTab === 'trace' && (
          <TraceView />
        )}
      </main>

      {/* Slide-Over District Drawer */}
      <DistrictDrawer
        district={selectedDistrict}
        onClose={() => setSelectedDistrict(null)}
      />

      {/* Feature 1: Satellite & Road CV Modal */}
      <VisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        onInjectAnomaly={(anomaly) => {
          setActiveTab('simulator');
        }}
      />

      {/* Enterprise ML Model Leaderboard & 2k Test CSV Validator Modal */}
      <ModelLeaderboardModal
        isOpen={isModelLeaderboardOpen}
        onClose={() => setIsModelLeaderboardOpen(false)}
      />

      {/* Dedicated Hackathon Judge Walkthrough Modal */}
      <JudgeMode
        isOpen={isJudgeModeOpen}
        onClose={() => setIsJudgeModeOpen(false)}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
      />

      {/* Feature 7: Live Real-Time Citizen Telemetry Ticker */}
      {tickerVisible && (
        <TelemetryTicker
          onSelectEvent={(evt) => {
            const d = districts.find(dist => dist.district.toLowerCase() === evt.district.toLowerCase());
            if (d) setSelectedDistrict(d);
          }}
        />
      )}

    </div>
  );
};

export default App;
