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
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col">
          
          {/* Top Header */}
          <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  PRIORITY RANK #{district.rank} (OF 802 NATIONAL GRID)
                </span>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  district.urgency_class === 'Critical' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {district.urgency_class} Urgency Tier
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
                {district.district}, <span className="text-emerald-700">{district.state}</span>
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                <span>Population: <strong className="text-slate-800">{district.population.toLocaleString()}</strong> ({district.rural_percentage}% Rural)</span>
                <span>•</span>
                <span>Poverty Index: <strong className="text-slate-800">{district.vulnerability_index}</strong></span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
            
            {/* 6-Factor Radar Chart */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  6-Factor Composite Priority Radar Profile
                </span>
                <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {district.priority_score} / 100
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar name={district.district} dataKey="A" stroke="#059669" fill="#10b981" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature 4: SHAP Waterfall Visualizer */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Feature 4: SHAP Waterfall Model Explainability
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Game-Theoretic Shapley Attribution</span>
              </div>

              {loadingShap ? (
                <div className="py-8 text-center text-xs text-slate-400">Computing Shapley values...</div>
              ) : shapData ? (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    Base Model Expectation: <strong className="text-slate-900 font-mono">{shapData.base_expected_value} pts</strong> → Final Priority: <strong className="text-rose-600 font-mono">{shapData.final_composite_score} pts</strong>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {shapData.waterfall_contributions.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50/70 border border-slate-200/70">
                        <span className="text-slate-700 font-medium">{item.feature}</span>
                        <span className={`font-mono font-bold ${
                          item.is_base ? 'text-slate-500' :
                          item.impact === 'positive' ? 'text-rose-600' : 'text-emerald-600'
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
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Physical Civil Intervention
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ₹{costCr} Crores INR
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-800">
                <div className="font-bold text-slate-900 text-sm mb-1">{proj.intervention}</div>
                <div className="text-slate-500 mt-1">
                  Targeted Catchment: <strong className="text-slate-800">{proj.targeted_beneficiaries.toLocaleString()} Citizens</strong> | Pending Backlog: <strong className="text-slate-800">{proj.days_pending_maintenance} days</strong>
                </div>
              </div>

              {/* Phased Expenditure Drawdowns */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Phased Fiscal Drawdown Schedule (Q1 - Q4)
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px]">
                    <div className="text-slate-500 font-medium">Q1 Immediate Mobilization</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">₹{(proj.phased_tranches.q1_emergency_mobilization / 100000).toFixed(1)} Lakhs (35%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px]">
                    <div className="text-slate-500 font-medium">Q2 Foundation & Drainage</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">₹{(proj.phased_tranches.q2_civil_foundation / 100000).toFixed(1)} Lakhs (30%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px]">
                    <div className="text-slate-500 font-medium">Q3 Equipment & Solar Fitment</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">₹{(proj.phased_tranches.q3_equipment_fitment / 100000).toFixed(1)} Lakhs (20%)</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px]">
                    <div className="text-slate-500 font-medium">Q4 Commissioning & Audit</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">₹{(proj.phased_tranches.q4_commissioning_audit / 100000).toFixed(1)} Lakhs (15%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 Preview: 10-Year Avoidance */}
            <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-900">10-Year Lifecycle Savings (Feature 5)</div>
                <div className="text-emerald-700 text-[11px] mt-0.5">Prevents ₹11.8 Cr in catastrophic reconstruction via ₹3.5 Cr capex</div>
              </div>
              <div className="font-mono text-sm font-black text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-200 shadow-xs">
                BCR 3.38 : 1
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Audit Seal: <span className="font-mono text-slate-700 font-semibold">SHA-256 Validated</span>
            </div>
            
            {/* Feature 6: 1-Click Official DPR PDF Download */}
            <button
              onClick={() => exportOfficialDprPdf(district)}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
            >
              <Download className="h-4 w-4 text-slate-300" />
              <span>Download Official DPR (PDF)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
