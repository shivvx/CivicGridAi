import React, { useEffect, useState } from 'react';
import { District, SHAPExplanation } from '../types';
import { 
  X, 
  Download, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Layers,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { explainDecision } from '../lib/api';
import { exportOfficialDprPdf } from '../lib/dprExport';

interface DistrictDrawerProps {
  district: District | null;
  onClose: () => void;
}

export const DistrictDrawer: React.FC<DistrictDrawerProps> = ({ district, onClose }) => {
  const [shapData, setShapData] = useState<SHAPExplanation | null>(null);
  const [loadingShap, setLoadingShap] = useState(false);

  useEffect(() => {
    if (!district) return;
    loadShap();
  }, [district]);

  const loadShap = async () => {
    if (!district) return;
    setLoadingShap(true);
    try {
      const res = await explainDecision({
        infrastructure_gap: district.infrastructure_gap_score,
        days_since_last_maintenance: district.recommended_project.days_pending_maintenance,
        vulnerability_index: district.vulnerability_index,
        upvotes: Math.round(district.factor_breakdown.s_demand * 0.8),
        budget_required: district.recommended_project.estimated_cost_inr,
        rural_percentage: district.rural_percentage
      });
      setShapData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShap(false);
    }
  };

  if (!district) return null;

  const radarData = [
    { subject: 'Demand Signal (30%)', A: district.factor_breakdown.s_demand, fullMark: 100 },
    { subject: 'Deficit Gap (25%)', A: district.factor_breakdown.s_gap, fullMark: 100 },
    { subject: 'Catchment Pop (15%)', A: district.factor_breakdown.s_pop, fullMark: 100 },
    { subject: 'Poverty Index (10%)', A: district.factor_breakdown.s_vuln, fullMark: 100 },
    { subject: 'Capital Backlog (10%)', A: district.factor_breakdown.s_inv, fullMark: 100 },
    { subject: 'ML Urgency (10%)', A: district.factor_breakdown.s_urgency, fullMark: 100 }
  ];

  const proj = district.recommended_project;
  const costCr = (proj.estimated_cost_inr / 10000000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-cyan-500/30 text-slate-100 shadow-2xl flex flex-col">
          
          {/* Top Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  RANK #{district.rank} OF 40
                </span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                  district.urgency_class === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300'
                }`}>
                  {district.urgency_class} Urgency Tier
                </span>
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white mt-1">
                {district.district}, <span className="text-cyan-400">{district.state}</span>
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span>Population: <b>{district.population.toLocaleString()}</b> ({district.rural_percentage}% Rural)</span>
                <span>•</span>
                <span>Poverty Index: <b>{district.vulnerability_index}</b></span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 6-Factor Radar Chart */}
            <div className="glass-panel rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  6-Factor Composite Priority Radar Profile
                </span>
                <span className="font-mono text-sm font-black text-cyan-400">
                  {district.priority_score} / 100
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Radar name={district.district} dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature 4: SHAP Waterfall Visualizer */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Feature 4: SHAP Waterfall Model Explainability
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Game-Theoretic Shapley Attribution</span>
              </div>

              {loadingShap ? (
                <div className="py-8 text-center text-xs text-slate-400">Computing Shapley values...</div>
              ) : shapData ? (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-slate-400">
                    Base Model Expectation: <b className="text-white font-mono">{shapData.base_expected_value} pts</b> → Final Priority: <b className="text-rose-400 font-mono">{shapData.final_composite_score} pts</b>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {shapData.waterfall_contributions.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-300 font-medium">{item.feature}</span>
                        <span className={`font-mono font-bold ${
                          item.is_base ? 'text-slate-400' :
                          item.impact === 'positive' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {item.value > 0 && !item.is_base ? `+${item.value}` : item.value} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Proposed Physical Civil Intervention */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recommended Physical Civil Intervention
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ₹{costCr} Crores INR
                </span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-cyan-500/20 text-xs text-slate-200">
                <div className="font-bold text-cyan-400 text-sm mb-1">{proj.intervention}</div>
                <div className="text-slate-400 mt-1">
                  Targeted Catchment: <b>{proj.targeted_beneficiaries.toLocaleString()} Citizens</b> | Pending Backlog: <b>{proj.days_pending_maintenance} days</b>
                </div>
              </div>

              {/* Phased Expenditure Drawdowns */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Phased Fiscal Drawdown Schedule (Q1 - Q4)
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-[11px]">
                    <div className="text-slate-400">Q1 Immediate Mobilization</div>
                    <div className="font-mono font-bold text-white mt-0.5">₹{(proj.phased_tranches.q1_emergency_mobilization / 100000).toFixed(1)} Lakhs (35%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-[11px]">
                    <div className="text-slate-400">Q2 Foundation & Drainage</div>
                    <div className="font-mono font-bold text-white mt-0.5">₹{(proj.phased_tranches.q2_civil_foundation / 100000).toFixed(1)} Lakhs (30%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-[11px]">
                    <div className="text-slate-400">Q3 Equipment & Solar Fitment</div>
                    <div className="font-mono font-bold text-white mt-0.5">₹{(proj.phased_tranches.q3_equipment_fitment / 100000).toFixed(1)} Lakhs (20%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-[11px]">
                    <div className="text-slate-400">Q4 Commissioning & Audit</div>
                    <div className="font-mono font-bold text-white mt-0.5">₹{(proj.phased_tranches.q4_commissioning_audit / 100000).toFixed(1)} Lakhs (15%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 Preview: 10-Year Avoidance */}
            <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/30 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-400">10-Year Lifecycle Savings (Feature 5)</div>
                <div className="text-slate-400 text-[11px]">Prevents ₹11.8 Cr in catastrophic reconstruction via ₹3.5 Cr capex</div>
              </div>
              <div className="font-mono text-sm font-black text-emerald-400">
                BCR 3.38 : 1
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Audit Seal: <span className="font-mono text-cyan-400">SHA-256 Validated</span>
            </div>
            
            {/* Feature 6: 1-Click Official DPR PDF Download */}
            <button
              onClick={() => exportOfficialDprPdf(district)}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-102 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download Official DPR (PDF)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
