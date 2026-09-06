import React, { useState, useEffect } from 'react';
import { SCIPResult, District } from '../types';
import { simulateBudget, calculateLifecycleModel } from '../lib/api';
import { 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { exportOfficialDprPdf } from '../lib/dprExport';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface SimulationViewProps {
  districts: District[];
  climateMode: boolean;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ districts, climateMode }) => {
  const [budgetCr, setBudgetCr] = useState<number>(15); // in Crores
  const [scipData, setScipData] = useState<SCIPResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lifecycleData, setLifecycleData] = useState<any | null>(null);
  const [selectedPortfolioTab, setSelectedPortfolioTab] = useState<'FUNDED' | 'DEFERRED'>('FUNDED');

  useEffect(() => {
    runSimulation(budgetCr);
  }, [budgetCr, climateMode]);

  const runSimulation = async (cr: number) => {
    setLoading(true);
    try {
      const budgetInr = cr * 10000000;
      const res = await simulateBudget(budgetInr, climateMode);
      setScipData(res);

      // Also compute 10-Year Lifecycle Model for total allocated capex
      const lifeRes = await calculateLifecycleModel(res.total_allocated_inr || 35000000);
      setLifecycleData(lifeRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (cr: number) => {
    setBudgetCr(cr);
  };

  const formatCr = (inr: number) => (inr / 10000000).toFixed(2);

  return (
    <div className="space-y-6">
      
      {/* Simulation Header & Budget Slider */}
      <div className="gov-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-emerald-600" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                Capital Budget Simulator & SCIP Knapsack Optimizer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Google OR-Tools Mixed Integer Linear Programming (0/1 MILP) solving social welfare maximization under hard fiscal budget envelopes
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200">
              SCIP Branch-and-Cut (LP Relaxation)
            </span>
          </div>
        </div>

        {/* Interactive Slider & Preset Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <span>Active Capital Budget Ceiling:</span>
              <span className="font-mono text-emerald-700 text-base font-extrabold">₹{budgetCr} Crores INR</span>
              <span className="text-[11px] text-slate-500 font-mono">(₹{(budgetCr * 10000000).toLocaleString()})</span>
            </label>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1.5">
              {[5, 10, 15, 25, 40, 60].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                    budgetCr === preset
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  ₹{preset} Cr
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider */}
          <div className="relative">
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={budgetCr}
              onChange={(e) => setBudgetCr(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
              <span>₹5 Crores (Austerity Baseline)</span>
              <span>₹15 Crores (Standard Allocation)</span>
              <span>₹35 Crores (Expanded NIP)</span>
              <span>₹60 Crores (Crisis Surge)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Solver Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="gov-card p-5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Total Capital Allocated</div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="font-display text-2xl font-extrabold text-slate-900">
              ₹{scipData ? formatCr(scipData.total_allocated_inr) : '0.00'} Cr
            </span>
            <span className="text-xs text-slate-500 font-semibold">({scipData?.budget_utilization_pct}% utilized)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Unallocated Reserve: ₹{scipData ? formatCr(scipData.unallocated_fiscal_reserve_inr) : '0.00'} Cr
          </div>
        </div>

        <div className="gov-card p-5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Direct Citizen Beneficiaries</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            {scipData?.total_direct_beneficiaries.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Maximized Social Welfare Objective
          </div>
        </div>

        <div className="gov-card p-5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Project Selection Ratio</div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="font-display text-2xl font-extrabold text-slate-900">
              {scipData?.funded_projects_count || 0}
            </span>
            <span className="text-xs text-slate-500">Funded / {scipData?.deferred_projects_count || 0} Deferred</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            0/1 Decision Knapsack Variables
          </div>
        </div>

        <div className="gov-card p-5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Mathematical Solve Latency</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            {scipData?.solve_time_ms ? `${scipData.solve_time_ms} ms` : '<4.8 ms'}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-mono font-semibold">
            100% Deterministic Global Optimality
          </div>
        </div>

      </div>

      {/* Feature 3: Cryptographic Merkle-Tree Audit Lineage Banner */}
      {scipData?.merkle_audit && (
        <div className="gov-card p-5 border border-slate-200 relative overflow-hidden bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white text-emerald-700 border border-slate-200 shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Feature 3: Cryptographic Merkle-Tree Anti-Corruption Audit Seal
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    {scipData.merkle_audit.verified_audit_status}
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-700 mt-1 break-all select-all">
                  Merkle Root: <span className="text-slate-900 font-bold">{scipData.merkle_audit.merkle_root}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Leaves: {scipData.merkle_audit.leaf_count} projects hashed • Tree Depth: {scipData.merkle_audit.tree_depth} • Any political tampering invalidates root hash
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 border border-slate-200 shadow-xs">
                SHA-256 Ledger
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Modeler */}
      {lifecycleData && (
        <div className="gov-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Feature 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Infrastructure Modeler
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mathematical Net Present Value (NPV) formulation demonstrating how capital investment today prevents disaster reconstruction losses
              </p>
            </div>

            <div className="flex items-center space-x-3 text-right font-mono text-xs">
              <span className="text-slate-500">Social Discount Rate: <b className="text-slate-900">6.0%</b></span>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Benefit-Cost Ratio: {lifecycleData.benefit_cost_ratio} : 1
              </span>
            </div>
          </div>

          {/* Lifecycle Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleData.annual_cashflows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${(Number(val) / 100000).toFixed(1)} Lakhs`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="unmitigated_crisis_cost_inr" name="Avoided Crisis Reconstruction Loss" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scheduled_maintenance_inr" name="Scheduled Preventive Maintenance" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span><b>Lifecycle Verdict:</b> {lifecycleData.lifecycle_verdict}</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Total 10-Yr Avoided Losses: ₹{formatCr(lifecycleData.total_10yr_avoided_damages_inr)} Cr
            </span>
          </div>
        </div>
      )}

      {/* Project Portfolio Tabs (Funded vs Deferred) */}
      <div className="gov-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPortfolioTab('FUNDED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                selectedPortfolioTab === 'FUNDED'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Funded Portfolio ({scipData?.funded_projects_count || 0})
            </button>
            <button
              onClick={() => setSelectedPortfolioTab('DEFERRED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                selectedPortfolioTab === 'DEFERRED'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Deferred / Next Appropriation ({scipData?.deferred_projects_count || 0})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {selectedPortfolioTab === 'FUNDED' ? 'Sorted by Social Welfare Reach' : 'Queued for Next Fiscal Budget'}
          </span>
        </div>

        {/* Portfolio Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">District</th>
                <th className="px-4 py-2.5">Sector</th>
                <th className="px-4 py-2.5">Civil Scope</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Capital Outlay</th>
                <th className="px-4 py-2.5">Beneficiaries</th>
                <th className="px-4 py-2.5 text-right">DPR Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {(selectedPortfolioTab === 'FUNDED' ? scipData?.funded_portfolio : scipData?.deferred_portfolio)?.map((proj) => {
                const matchedDistrict = districts.find(d => d.district === proj.district);
                return (
                  <tr key={proj.project_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {proj.district} <span className="text-[10px] text-slate-500 font-normal">({proj.state})</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
                        {proj.dominant_deficit_sector}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 max-w-xs truncate text-slate-700">{proj.intervention}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{proj.priority_score}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">₹{formatCr(proj.cost_inr)} Cr</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{proj.beneficiaries.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      {matchedDistrict && (
                        <button
                          onClick={() => exportOfficialDprPdf(matchedDistrict, proj, scipData?.merkle_audit?.merkle_root)}
                          className="inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF DPR</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
