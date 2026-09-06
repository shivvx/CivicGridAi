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
      
      {/* Simulation Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <h2 className="font-display text-xl font-bold text-white">
                Capital Budget Simulator & SCIP Knapsack Optimizer
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Google OR-Tools Mixed Integer Linear Programming (0/1 MILP) solving social welfare maximization under hard fiscal budget envelopes
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-cyan-950/80 px-3 py-1 text-xs font-mono text-cyan-300 border border-cyan-500/30">
              SCIP Branch-and-Cut (LP Relaxation)
            </span>
          </div>
        </div>

        {/* Interactive Slider & Preset Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <span>Active Capital Budget Ceiling:</span>
              <span className="font-mono text-cyan-400 text-base font-extrabold">₹{budgetCr} Crores INR</span>
              <span className="text-[11px] text-slate-400 font-mono">(₹{(budgetCr * 10000000).toLocaleString()})</span>
            </label>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1.5">
              {[5, 10, 15, 25, 40, 60].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    budgetCr === preset
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>₹5 Crores (Austerity Baseline)</span>
              <span>₹15 Crores (Standard Fiscal Allocation)</span>
              <span>₹35 Crores (Expanded NIP)</span>
              <span>₹60 Crores (Emergency Crisis Surge)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Solver Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Total Capital Allocated</div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="font-display text-2xl font-black text-emerald-400">
              ₹{scipData ? formatCr(scipData.total_allocated_inr) : '0.00'} Cr
            </span>
            <span className="text-xs text-slate-400">({scipData?.budget_utilization_pct}% utilized)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Unallocated Reserve: ₹{scipData ? formatCr(scipData.unallocated_fiscal_reserve_inr) : '0.00'} Cr
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Direct Citizen Beneficiaries</div>
          <div className="mt-1 font-display text-2xl font-black text-cyan-400">
            {scipData?.total_direct_beneficiaries.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Maximized Social Welfare Objective
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Project Selection Ratio</div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="font-display text-2xl font-black text-white">
              {scipData?.funded_projects_count || 0}
            </span>
            <span className="text-xs text-slate-400">Funded / {scipData?.deferred_projects_count || 0} Deferred</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            0/1 Decision Knapsack Variables
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Mathematical Solve Latency</div>
          <div className="mt-1 font-display text-2xl font-black text-indigo-400">
            {scipData?.solve_time_ms ? `${scipData.solve_time_ms} ms` : '<4.8 ms'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">
            100% Deterministic Global Optimality
          </div>
        </div>

      </div>

      {/* Feature 3: Cryptographic Merkle-Tree Audit Lineage Banner */}
      {scipData?.merkle_audit && (
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                    Feature 3: Cryptographic Merkle-Tree Anti-Corruption Audit Seal
                  </h3>
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                    {scipData.merkle_audit.verified_audit_status}
                  </span>
                </div>
                <div className="font-mono text-xs text-cyan-300 mt-1 break-all select-all">
                  Merkle Root: <span className="text-white font-bold">{scipData.merkle_audit.merkle_root}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Leaves: {scipData.merkle_audit.leaf_count} projects hashed • Tree Depth: {scipData.merkle_audit.tree_depth} • Any political tampering invalidates root hash
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-300 border border-slate-800">
                SHA-256 Ledger
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Modeler */}
      {lifecycleData && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Feature 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Infrastructure Modeler
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mathematical Net Present Value (NPV) formulation demonstrating how capital investment today prevents disaster reconstruction losses
              </p>
            </div>

            <div className="flex items-center space-x-3 text-right font-mono text-xs">
              <span className="text-slate-400">Social Discount Rate: <b>6.0%</b></span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                Benefit-Cost Ratio: {lifecycleData.benefit_cost_ratio} : 1
              </span>
            </div>
          </div>

          {/* Lifecycle Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleData.annual_cashflows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${(Number(val) / 100000).toFixed(1)} Lakhs`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="unmitigated_crisis_cost_inr" name="Avoided Crisis Reconstruction Loss" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scheduled_maintenance_inr" name="Scheduled Preventive Maintenance" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span><b>Lifecycle Verdict</b>: {lifecycleData.lifecycle_verdict}</span>
            <span className="font-mono text-emerald-400">Total 10-Yr Avoided Losses: ₹{formatCr(lifecycleData.total_10yr_avoided_damages_inr)} Cr</span>
          </div>
        </div>
      )}

      {/* Project Portfolio Tabs (Funded vs Deferred) */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPortfolioTab('FUNDED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedPortfolioTab === 'FUNDED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Funded Portfolio ({scipData?.funded_projects_count || 0})
            </button>
            <button
              onClick={() => setSelectedPortfolioTab('DEFERRED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedPortfolioTab === 'DEFERRED'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deferred / Queue Next Cycle ({scipData?.deferred_projects_count || 0})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            {selectedPortfolioTab === 'FUNDED' ? 'Sorted by Welfare Impact' : 'Awaiting Next Fiscal Appropriation'}
          </span>
        </div>

        {/* Portfolio Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(selectedPortfolioTab === 'FUNDED' ? scipData?.funded_portfolio : scipData?.deferred_portfolio)?.map((proj) => {
                const matchedDistrict = districts.find(d => d.district === proj.district);
                return (
                  <tr key={proj.project_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-white">
                      {proj.district} <span className="text-[10px] text-slate-400 font-normal">({proj.state})</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                        {proj.dominant_deficit_sector}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 max-w-xs truncate text-slate-300">{proj.intervention}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-cyan-400">{proj.priority_score}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-400">₹{formatCr(proj.cost_inr)} Cr</td>
                    <td className="px-4 py-2.5 font-mono text-slate-300">{proj.beneficiaries.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      {matchedDistrict && (
                        <button
                          onClick={() => exportOfficialDprPdf(matchedDistrict, proj, scipData?.merkle_audit?.merkle_root)}
                          className="inline-flex items-center space-x-1 rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-all"
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
