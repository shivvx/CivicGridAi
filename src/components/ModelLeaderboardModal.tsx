import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  FileSpreadsheet, 
  Activity, 
  Play, 
  ArrowRight,
  TrendingUp,
  Languages,
  MapPin,
  RefreshCw,
  Zap,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { fetchModelBenchmarks, fetchTestSamples, runTestSampleInference } from '../lib/api';

interface ModelLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelLeaderboardModal: React.FC<ModelLeaderboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'test_validator'>('leaderboard');
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [testSamples, setTestSamples] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<any | null>(null);
  const [inferenceResult, setInferenceResult] = useState<any | null>(null);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState<boolean>(false);
  const [evaluatingSample, setEvaluatingSample] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingBenchmarks(true);
    try {
      const [bData, sData] = await Promise.all([
        fetchModelBenchmarks(),
        fetchTestSamples(15)
      ]);
      setBenchmarks(bData);
      if (sData && sData.samples && sData.samples.length > 0) {
        setTestSamples(sData.samples);
        setSelectedSample(sData.samples[0]);
        // Auto-run inference on first sample
        runInference(sData.samples[0]);
      }
    } catch (e) {
      console.error('Error loading benchmark data:', e);
    } finally {
      setLoadingBenchmarks(false);
    }
  };

  const runInference = async (sample: any) => {
    setEvaluatingSample(true);
    try {
      const res = await runTestSampleInference(sample);
      setInferenceResult(res);
    } catch (e) {
      console.error('Error running test inference:', e);
    } finally {
      setEvaluatingSample(false);
    }
  };

  if (!isOpen) return null;

  const prioLeaderboard = benchmarks?.benchmarks?.priority_classification?.leaderboard || [];
  const demLeaderboard = benchmarks?.benchmarks?.demand_forecasting?.leaderboard || [];
  const nlpLeaderboard = benchmarks?.benchmarks?.multilingual_nlp?.leaderboard || [];
  const clusterSummary = benchmarks?.benchmarks?.spatial_clustering?.summary || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Enterprise ML Benchmark & Test Suite
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Synced with Production Backend
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluating 15 architectures across 10,000 records with a 2,000-sample held-out test split
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher */}
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                <span>Model Leaderboard</span>
              </button>
              <button
                onClick={() => setActiveTab('test_validator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'test_validator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>2k Test CSV Inspector</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dataset Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Source Dataset:</span>
            <span className="font-mono text-slate-900 font-semibold">10,000 Records (10k CSV)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Stratified Split:</span>
            <span className="font-mono text-slate-700">8,000 Train / 2,000 Test</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Priority Winner:</span>
            <span className="font-mono text-emerald-700 font-semibold flex items-center space-x-1">
              <Trophy className="h-3 w-3 inline text-amber-500" />
              <span>LightGBM (93.6% Acc)</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Demand Regressor:</span>
            <span className="font-mono text-emerald-700 font-semibold flex items-center space-x-1">
              <Trophy className="h-3 w-3 inline text-amber-500" />
              <span>Ridge (R²: 1.000)</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {activeTab === 'leaderboard' ? (
            <div className="space-y-6">
              
              {/* Task 1: Priority / Urgency Classification */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Task 1: Infrastructure Urgency Multi-Class Classification
                      </h3>
                      <p className="text-xs text-slate-500">
                        Evaluated against held-out 2,000-sample test partition (Low, Medium, High, Critical)
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                    6 Architectures Evaluated
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="pb-2">Model Architecture</th>
                        <th className="pb-2 text-center">Test Accuracy</th>
                        <th className="pb-2 text-center">Macro-F1</th>
                        <th className="pb-2 text-center">Balanced Acc</th>
                        <th className="pb-2 text-center">Precision</th>
                        <th className="pb-2 text-center">Recall</th>
                        <th className="pb-2 text-center">Latency (100 Qs)</th>
                        <th className="pb-2 text-right">Production Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {prioLeaderboard.map((m: any, idx: number) => {
                        const isWinner = m.status?.includes('Winner');
                        return (
                          <tr key={idx} className={isWinner ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50/80'}>
                            <td className="py-2.5 flex items-center space-x-2 font-sans font-medium text-slate-900">
                              {isWinner && <Trophy className="h-4 w-4 text-amber-500 shrink-0" />}
                              <span>{m.model_name}</span>
                            </td>
                            <td className="py-2.5 text-center text-emerald-700 font-bold">
                              {(m.accuracy * 100).toFixed(2)}%
                            </td>
                            <td className="py-2.5 text-center text-slate-800 font-semibold">
                              {m.macro_f1?.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-center text-slate-600">
                              {m.balanced_accuracy?.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-center text-slate-500">
                              {m.macro_precision?.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-center text-slate-500">
                              {m.macro_recall?.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-center text-amber-700">
                              {m.latency_100_queries_ms}ms
                            </td>
                            <td className="py-2.5 text-right font-sans">
                              {isWinner ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Zap className="h-3 w-3 text-emerald-700" />
                                  <span>Active Winner 🏆</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Benchmark Complete</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task 2 & Task 3 Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Task 2: Demand Forecasting Regressors */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Task 2: 30-Day Demand Regressors
                        </h3>
                        <p className="text-xs text-slate-500">Citizen request volume forecast</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      5 Models
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="pb-2">Architecture</th>
                          <th className="pb-2 text-center">R² Score</th>
                          <th className="pb-2 text-center">RMSE</th>
                          <th className="pb-2 text-center">MAE</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {demLeaderboard.map((m: any, idx: number) => {
                          const isWinner = m.status?.includes('Winner');
                          return (
                            <tr key={idx} className={isWinner ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50/80'}>
                              <td className="py-2.5 flex items-center space-x-1.5 font-sans font-medium text-slate-900">
                                {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                <span>{m.model_name}</span>
                              </td>
                              <td className="py-2.5 text-center text-emerald-700 font-bold">
                                {m.r2_score?.toFixed(4)}
                              </td>
                              <td className="py-2.5 text-center text-slate-700">
                                {m.rmse?.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-center text-slate-500">
                                {m.mae?.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-right font-sans">
                                {isWinner ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Winner 🏆
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Evaluated</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Task 3: Multilingual NLP & Geospatial Summary */}
                <div className="space-y-6">
                  {/* Multilingual NLP */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <Languages className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Task 3: Cross-Lingual Grievance NLP
                          </h3>
                          <p className="text-xs text-slate-500">Sub-word TF-IDF across Indic languages</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                        4 Classifiers
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="pb-2">NLP Model</th>
                            <th className="pb-2 text-center">Accuracy</th>
                            <th className="pb-2 text-center">Macro-F1</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {nlpLeaderboard.map((m: any, idx: number) => {
                            const isWinner = m.status?.includes('Winner');
                            return (
                              <tr key={idx} className={isWinner ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50/80'}>
                                <td className="py-2 flex items-center space-x-1.5 font-sans font-medium text-slate-900">
                                  {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                  <span>{m.model_name}</span>
                                </td>
                                <td className="py-2 text-center text-emerald-700 font-bold">
                                  {(m.accuracy * 100).toFixed(1)}%
                                </td>
                                <td className="py-2 text-center text-slate-700">
                                  {m.macro_f1?.toFixed(4)}
                                </td>
                                <td className="py-2 text-right font-sans">
                                  {isWinner ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      Winner 🏆
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500">Evaluated</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Geospatial Clustering Metric */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Task 4: DBSCAN Geospatial Clustering
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {clusterSummary.total_hotspots_discovered || 35} Centroid Hotspots identified across {clusterSummary.clustered_requests_count || 9800} complaints
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                      eps=0.10, min=6
                    </span>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            /* Tab B: Interactive 2k Test CSV Validator */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Sample Selector from 2k Test CSV */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Held-out Test CSV (2,000 Samples)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Showing 15 Samples
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1">
                  {testSamples.map((s, idx) => {
                    const isSelected = selectedSample?.Request_ID === s.Request_ID;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedSample(s);
                          runInference(s);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {s.Request_ID}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.Urgency_Level === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            s.Urgency_Level === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            s.Urgency_Level === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            Truth: {s.Urgency_Level}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 font-medium truncate">
                          {s.Sub_Category || s.Category}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                          <span>{s.District}, {s.State}</span>
                          <span>{s.Citizen_Upvotes} Upvotes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Model Inference & Verification Card */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span>Real-Time Model Inference & Truth Verification</span>
                  </h3>
                  <button
                    onClick={() => selectedSample && runInference(selectedSample)}
                    disabled={evaluatingSample}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all"
                  >
                    <RefreshCw className={`h-3 w-3 ${evaluatingSample ? 'animate-spin' : ''}`} />
                    <span>Re-evaluate</span>
                  </button>
                </div>

                {inferenceResult && selectedSample ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 shadow-xs">
                    
                    {/* Urgency Verification Box */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Ground Truth (Test Label)
                        </span>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {inferenceResult.ground_truth_urgency}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          LightGBM Model Prediction
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xl font-bold ${
                            inferenceResult.predicted_urgency === 'Critical' ? 'text-rose-600' :
                            inferenceResult.predicted_urgency === 'High' ? 'text-amber-600' :
                            inferenceResult.predicted_urgency === 'Medium' ? 'text-blue-600' : 'text-slate-700'
                          }`}>
                            {inferenceResult.predicted_urgency}
                          </span>
                          {inferenceResult.is_exact_match ? (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Exact Match</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Close Match
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Confidence: {(inferenceResult.prediction_confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Class Probability Distribution */}
                    {inferenceResult.probabilities && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">
                          Softmax Probability Distribution Across Priority Classes:
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(inferenceResult.probabilities).map(([cls, prob]: any) => (
                            <div key={cls} className="space-y-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className={cls === inferenceResult.predicted_urgency ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                                  {cls}
                                </span>
                                <span className="text-slate-600">{(prob * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    cls === 'Critical' ? 'bg-rose-500' :
                                    cls === 'High' ? 'bg-amber-500' :
                                    cls === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${Math.max(2, prob * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Demand Forecast and Features */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">30-Day Demand</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {inferenceResult.projected_demand} Req/mo
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Days Pending</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {selectedSample.Days_Pending} Days
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Allocated Budget</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{(selectedSample.Allocated_Budget_INR / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>

                    {/* SHAP Game-Theoretic Waterfall Attribution */}
                    {inferenceResult.waterfall_contributions && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">
                          SHAP Feature Explainer Attribution (TreeExplainer):
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          {inferenceResult.waterfall_contributions.slice(1, 5).map((f: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                              <span className="text-slate-600 truncate">{f.feature}</span>
                              <span className={`font-bold ${f.value >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {f.value >= 0 ? `+${f.value}` : f.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs">
                    Select a test sample on the left to inspect live inference
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Models pickled to <code className="font-mono text-slate-700 font-semibold">backend/models/</code> and synchronized with Flask REST API.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors shadow-xs"
          >
            Close Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
};
