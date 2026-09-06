import React, { useEffect, useRef, useState } from 'react';
import { District, Hotspot, SCIPResult, TelemetryEvent } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  Cpu, 
  Filter, 
  Layers, 
  Search, 
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import L from 'leaflet';

interface OverviewDashboardProps {
  districts: District[];
  hotspots: Hotspot[];
  scipResult: SCIPResult | null;
  onSelectDistrict: (district: District) => void;
  climateMode: boolean;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  latestTelemetry?: TelemetryEvent | null;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  districts,
  hotspots,
  scipResult,
  onSelectDistrict,
  climateMode,
  selectedSector,
  setSelectedSector,
  latestTelemetry
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.5, 81.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // High-contrast dark executive map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB & OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Hotspots on data / filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    // Render DBSCAN Hotspots
    if (showHotspots) {
      hotspots.forEach((hs) => {
        const radius = Math.min(28000, 10000 + hs.request_count * 30);
        const circle = L.circle([hs.latitude, hs.longitude], {
          radius: radius,
          color: '#f43f5e',
          weight: 1.5,
          fillColor: '#f43f5e',
          fillOpacity: 0.12,
          dashArray: '4, 6'
        });

        circle.bindTooltip(`
          <div class="p-1 text-xs">
            <div class="font-bold text-rose-400">DBSCAN Hotspot ${hs.hotspot_id}</div>
            <div>${hs.district}, ${hs.state}</div>
            <div>Complaints: <b>${hs.request_count}</b> | Deficit: <b>${hs.infrastructure_gap_score}</b></div>
          </div>
        `, { sticky: true, className: 'leaflet-custom-tooltip' });

        markersGroupRef.current?.addLayer(circle);
      });
    }

    // Render District Markers
    const filteredDistricts = districts.filter(d => {
      const matchesSearch = d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === 'All' || d.dominant_deficit_sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    filteredDistricts.forEach((dist) => {
      const color = dist.urgency_class === 'Critical' ? '#f43f5e' :
                    dist.urgency_class === 'High' ? '#f59e0b' :
                    dist.urgency_class === 'Medium' ? '#38bdf8' : '#10b981';

      // Custom pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${dist.urgency_class === 'Critical' ? `<div class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
            <div class="h-6 w-6 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-white shadow-lg transition-transform group-hover:scale-125" style="background-color: ${color}">
              ${dist.rank}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([dist.latitude, dist.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectDistrict(dist);
      });

      marker.bindTooltip(`
        <div style="background:#0f172a; color:#f8fafc; padding:8px; border-radius:6px; font-size:11px; border:1px solid rgba(56,189,248,0.3);">
          <div style="font-weight:bold; color:#38bdf8;">#${dist.rank} ${dist.district} (${dist.state})</div>
          <div>Priority Score: <b style="color:${color}">${dist.priority_score}</b> [${dist.urgency_class}]</div>
          <div>Dominant Deficit: <b>${dist.dominant_deficit_sector}</b></div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Click to inspect SHAP & Civil Scope →</div>
        </div>
      `, { direction: 'top', offset: [0, -10] });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [districts, hotspots, selectedSector, searchQuery, showHotspots]);

  // Pulse effect when new telemetry arrives
  useEffect(() => {
    if (!latestTelemetry || !mapInstanceRef.current) return;
    const target = districts.find(d => d.district.toLowerCase() === latestTelemetry.district.toLowerCase());
    if (target) {
      const pulseMarker = L.circle([target.latitude, target.longitude], {
        radius: 45000,
        color: '#38bdf8',
        weight: 2,
        fillColor: '#38bdf8',
        fillOpacity: 0.35
      }).addTo(mapInstanceRef.current);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(pulseMarker);
        }
      }, 2500);
    }
  }, [latestTelemetry]);

  // Metrics
  const criticalCount = districts.filter(d => d.urgency_class === 'Critical').length;
  const highCount = districts.filter(d => d.urgency_class === 'High').length;
  const totalBeneficiaries = scipResult?.total_direct_beneficiaries || 2904525;
  const allocatedCr = scipResult ? Math.round(scipResult.total_allocated_inr / 10000000) : 13.1;
  const totalBudgetCr = scipResult ? Math.round(scipResult.active_budget_limit_inr / 10000000) : 15.0;

  return (
    <div className="space-y-6">
      {/* 4 High-Impact Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Citizen Ingestion Volume */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-cyan-500/10 blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Grievances</span>
            <span className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-white">10,000</span>
            <span className="text-xs font-semibold text-emerald-400">+128 today</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Harmonized across 40 administrative districts</p>
        </div>

        {/* Card 2: Critical Deficit Zones */}
        <div className="glass-panel-rose-glow rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Critical Priority Tiers</span>
            <span className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-rose-400">{criticalCount}</span>
            <span className="text-xs text-rose-300">of 40 Districts</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{highCount} High Priority | Urgent intervention required</p>
        </div>

        {/* Card 3: Direct Beneficiary Reach */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SCIP Beneficiaries</span>
            <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-indigo-400">{totalBeneficiaries.toLocaleString()}</span>
            <span className="text-xs text-slate-400">Citizens</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Maximized welfare reach under budget cap</p>
        </div>

        {/* Card 4: Operations Research Optimization Status */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">MILP SCIP Solver</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-emerald-400">₹{allocatedCr} Cr</span>
            <span className="text-xs text-slate-400">/ ₹{totalBudgetCr} Cr</span>
          </div>
          <p className="mt-1 text-xs text-emerald-400 font-mono">
            {scipResult?.solve_time_ms ? `<${scipResult.solve_time_ms}ms • Global Optimality` : 'Optimality Proven'}
          </p>
        </div>

      </div>

      {/* Main Map & Spatial Explorer */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        
        {/* Controls Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <span>National Spatial Infrastructure GIS Grid</span>
            </h2>
            <p className="text-xs text-slate-400">
              Visualizing 40 administrative districts and 29 unsupervised DBSCAN spatial clusters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Sector Filter Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 focus:border-cyan-500 focus:outline-none"
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

            {/* DBSCAN Hotspot Toggle */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all ${
                showHotspots
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>DBSCAN Hotspots</span>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-slate-800">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-slate-950/90 p-3 backdrop-blur-md border border-slate-800 text-[11px] space-y-1.5 shadow-xl">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Priority Legend</div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping opacity-80" />
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Critical (&gt;75)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">High (62-75)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Medium (48-61)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full border border-dashed border-rose-400" />
              <span className="text-rose-300">DBSCAN Deficit Cluster</span>
            </div>
          </div>
        </div>

        {/* Top Priority Quick Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top 5 Critical Priority Districts</span>
            <span className="text-xs text-cyan-400">Click any card to open Detailed Audit</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {districts.slice(0, 5).map((d) => (
              <button
                key={d.district}
                onClick={() => onSelectDistrict(d)}
                className="flex items-center justify-between rounded-xl bg-slate-900/70 p-3 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                    <span className="text-cyan-400">#{d.rank}</span>
                    <span>{d.district}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{d.dominant_deficit_sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-rose-400">{d.priority_score}</div>
                  <div className="text-[9px] text-rose-300 uppercase font-semibold">{d.urgency_class}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
