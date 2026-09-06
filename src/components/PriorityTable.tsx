import React, { useState } from 'react';
import { District } from '../types';
import { 
  ArrowUpDown, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  Leaf, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface PriorityTableProps {
  districts: District[];
  onSelectDistrict: (district: District) => void;
  climateMode: boolean;
}

export const PriorityTable: React.FC<PriorityTableProps> = ({
  districts,
  onSelectDistrict,
  climateMode
}) => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof District>('priority_score');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = districts.filter(d => {
    const matchesSearch = d.district.toLowerCase().includes(search.toLowerCase()) ||
                          d.state.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === 'All' || d.dominant_deficit_sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof District) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Anti-Bias Proof Banner */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center space-x-2">
              <span>National Infrastructure Priority Index (40 Districts)</span>
              {climateMode && (
                <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <Leaf className="h-3 w-3" />
                  <span>ESG Mode Enabled</span>
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Transparent 6-factor composite priority ranking with anti-bias suppression of digital smartphone privilege
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[11px] font-mono text-cyan-400">
              ISO 37120 Smart City Standard Compliant
            </span>
          </div>
        </div>

        {/* Anti-Bias Proof Box */}
        <div className="mt-4 rounded-xl bg-slate-900/80 p-3.5 border border-cyan-500/20 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Mathematical Anti-Bias Guarantee</span>: Citizen complaint volume is normalized per 10,000 residents and capped at 30 points. The remaining 70% is driven strictly by physical deficit gaps (25%), poverty indices (10%), investment backlogs (10%), rural population (15%), and ML urgency (10%).
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
            70% Objective / 30% Demand
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="glass-panel rounded-2xl p-6">
        
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 focus:border-cyan-500 focus:outline-none"
            >
              <option value="All">All Sectors</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Roads & Transport">Roads & Transport</option>
              <option value="Energy & Power">Energy & Power</option>
              <option value="Education">Education</option>
              <option value="Digital Infrastructure & DPI">Digital Infrastructure</option>
              <option value="Public Safety">Public Safety</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing <b className="text-white">{sorted.length}</b> of 40 Districts
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('rank')}>
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('district')}>
                  <div className="flex items-center space-x-1">
                    <span>District & State</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('priority_score')}>
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <span>Priority Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Urgency Tier</th>
                <th className="px-4 py-3">Dominant Deficit Sector</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('population')}>
                  <div className="flex items-center space-x-1">
                    <span>Catchment Pop</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Proposed Civil Intervention</th>
                <th className="px-3 py-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sorted.map((d) => (
                <tr 
                  key={d.district} 
                  onClick={() => onSelectDistrict(d)}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-3 font-mono font-bold text-cyan-400">#{d.rank}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{d.district}</div>
                    <div className="text-[10px] text-slate-400">{d.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-white">{d.priority_score}</span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            d.urgency_class === 'Critical' ? 'bg-rose-500' :
                            d.urgency_class === 'High' ? 'bg-amber-500' : 'bg-cyan-400'
                          }`} 
                          style={{ width: `${d.priority_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      d.urgency_class === 'Critical' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' :
                      d.urgency_class === 'High' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                      d.urgency_class === 'Medium' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' :
                      'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {d.urgency_class}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                      {d.dominant_deficit_sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {d.population.toLocaleString()} <span className="text-[9px]">({d.rural_percentage}% rural)</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate text-[11px]">
                    {d.recommended_project.intervention}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDistrict(d);
                      }}
                      className="inline-flex items-center space-x-1 rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white transition-all"
                    >
                      <span>Inspect SHAP</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
