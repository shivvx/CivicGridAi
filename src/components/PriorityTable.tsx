import React, { useState } from 'react';
import { District } from '../types';
import { 
  ArrowUpDown, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  Leaf,
  Filter
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
      <div className="gov-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center space-x-2.5">
              <span>National Infrastructure Priority Index</span>
              {climateMode && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <Leaf className="h-3 w-3" />
                  <span>ESG Mode Active</span>
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Transparent 6-factor composite priority ranking with mathematical anti-bias suppression of smartphone privilege
            </p>
          </div>
          
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ISO 37120 Smart City Compliant
            </span>
          </div>
        </div>

        {/* Anti-Bias Mathematical Proof Box */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Mathematical Anti-Bias Guarantee:</span> Citizen complaint volume is normalized per 10,000 residents and capped at 30 points. The remaining 70% is driven strictly by physical deficit gaps (25%), poverty indices (10%), investment backlogs (10%), rural population (15%), and ML urgency (10%).
            </div>
          </div>
          <div className="shrink-0 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-200">
            70% Objective / 30% Demand
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="gov-card p-6">
        
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-none w-48 sm:w-60"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-800 border border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-none"
            >
              <option value="All">All 7 Sectors</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Roads & Transport">Roads & Transport</option>
              <option value="Energy & Power">Energy & Power</option>
              <option value="Education">Education</option>
              <option value="Digital Infrastructure & DPI">Digital Infrastructure</option>
              <option value="Public Safety">Public Safety</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <b className="text-slate-900">{sorted.length}</b> of 40 Districts
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
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
                  <div className="flex items-center space-x-1 text-slate-900">
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
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {sorted.map((d) => (
                <tr 
                  key={d.district} 
                  onClick={() => onSelectDistrict(d)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-3 font-mono font-bold text-slate-900">#{d.rank}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{d.district}</div>
                    <div className="text-[10px] text-slate-500">{d.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-slate-900">{d.priority_score}</span>
                      <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            d.urgency_class === 'Critical' ? 'bg-rose-600' :
                            d.urgency_class === 'High' ? 'bg-amber-500' : 'bg-blue-600'
                          }`} 
                          style={{ width: `${d.priority_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      d.urgency_class === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      d.urgency_class === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      d.urgency_class === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {d.urgency_class}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-medium">
                      {d.dominant_deficit_sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                    {d.population.toLocaleString()} <span className="text-[9px] text-slate-400">({d.rural_percentage}% rural)</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate text-[11px]">
                    {d.recommended_project.intervention}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDistrict(d);
                      }}
                      className="inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
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
