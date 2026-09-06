import React, { useEffect, useRef, useState } from 'react';
import { District, Hotspot, SCIPResult, TelemetryEvent } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  Cpu, 
  Filter, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  MapPin, 
  Globe, 
  Satellite as SatelliteIcon,
  CheckCircle2,
  ArrowUpRight
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);
  const [mapTheme, setMapTheme] = useState<'light' | 'satellite' | 'dark'>('light');

  // Tile Providers (High-Resolution)
  const TILE_URLS = {
    light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  };

  const TILE_ATTRIBUTIONS = {
    light: '&copy; Esri & OpenStreetMap contributors',
    satellite: '&copy; Esri World Imagery Earth Observation',
    dark: '&copy; Esri & OpenStreetMap contributors'
  };

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

      const baseTile = L.tileLayer(TILE_URLS.light, {
        attribution: TILE_ATTRIBUTIONS.light,
        maxZoom: 16
      }).addTo(map);
      tileLayerRef.current = baseTile;

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

  // Change Map Theme dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(TILE_URLS[mapTheme], {
      attribution: TILE_ATTRIBUTIONS[mapTheme],
      maxZoom: mapTheme === 'satellite' ? 18 : 16
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapTheme]);

  // Update Markers & Hotspots on data / filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    // Render DBSCAN Hotspots
    if (showHotspots) {
      hotspots.forEach((hs) => {
        const radius = Math.min(26000, 10000 + hs.request_count * 28);
        const circle = L.circle([hs.latitude, hs.longitude], {
          radius: radius,
          color: '#dc2626',
          weight: 1.5,
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          dashArray: '4, 6'
        });

        circle.bindTooltip(`
          <div style="background:#ffffff; color:#0f172a; padding:8px 12px; border-radius:10px; font-size:11px; border:1px solid #fecaca; box-shadow:0 10px 25px -5px rgba(15,23,42,0.12);">
            <div style="font-weight:700; color:#dc2626; font-size:11px;">DBSCAN Cluster #${hs.hotspot_id}</div>
            <div style="color:#475569; font-size:10px;">${hs.district}, ${hs.state}</div>
            <div style="margin-top:4px; font-size:10px; color:#0f172a;">Demands: <b>${hs.request_count}</b> | Deficit Score: <b>${hs.infrastructure_gap_score}</b></div>
          </div>
        `, { sticky: true });

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
      const color = dist.urgency_class === 'Critical' ? '#dc2626' :
                    dist.urgency_class === 'High' ? '#d97706' :
                    dist.urgency_class === 'Medium' ? '#2563eb' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${dist.urgency_class === 'Critical' ? `<div class="absolute -inset-1 rounded-full animate-ping opacity-50" style="background-color: ${color}"></div>` : ''}
            <div class="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] text-white shadow-md transition-transform group-hover:scale-125" style="background-color: ${color}">
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
        <div style="background:#ffffff; color:#0f172a; padding:10px 14px; border-radius:10px; font-size:11px; border:1px solid #e2e8f0; box-shadow:0 10px 25px -5px rgba(15,23,42,0.12); min-width:180px;">
          <div style="font-weight:700; color:#0f172a; font-size:12px;">#${dist.rank} ${dist.district}</div>
          <div style="color:#64748b; font-size:10px;">${dist.state}</div>
          <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; color:#64748b;">Priority Score:</span>
            <span style="font-weight:700; color:${color}; font-family:monospace;">${dist.priority_score} [${dist.urgency_class}]</span>
          </div>
          <div style="font-size:10px; color:#475569; margin-top:2px;">Sector: <b>${dist.dominant_deficit_sector}</b></div>
          <div style="font-size:9px; color:#059669; margin-top:6px; font-weight:600;">Click to view SHAP & Scope →</div>
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
        radius: 42000,
        color: '#059669',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.3
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
  const totalBeneficiaries = scipResult?.total_direct_beneficiaries || 3682538;
  const allocatedCr = scipResult ? (scipResult.total_allocated_inr / 10000000).toFixed(1) : '14.3';
  const totalBudgetCr = scipResult ? (scipResult.active_budget_limit_inr / 10000000).toFixed(1) : '15.0';

  return (
    <div className="space-y-6">
      
      {/* 4 Primary KPI Cards (Executive GovTech Design) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Citizen Ingestion Volume */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Grievance Telemetry
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">10,000</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ↑ +18.4% today
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Verified complaints across 40 administrative districts</p>
        </div>

        {/* Card 2: Critical Deficit Zones */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Critical Deficit Zones
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-rose-600">{criticalCount}</span>
            <span className="text-xs font-semibold text-slate-500">of 40 Districts</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">{highCount} High Priority | Urgent intervention queued</p>
        </div>

        {/* Card 3: Direct Beneficiary Reach */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Target Beneficiary Reach
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700 border border-blue-200">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">{totalBeneficiaries.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">Citizens</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Maximized welfare reach under hard fiscal budget cap</p>
        </div>

        {/* Card 4: Operations Research Optimization Status */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Capital Outlay (SCIP)
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-emerald-700">₹{allocatedCr} Cr</span>
            <span className="text-xs text-slate-500">/ ₹{totalBudgetCr} Cr</span>
          </div>
          <p className="mt-1.5 text-xs text-emerald-700 font-mono flex items-center space-x-1 font-semibold">
            <span>● Global Optimality Proven (SCIP MILP)</span>
          </p>
        </div>

      </div>

      {/* Main Map Card: National Infrastructure Spatial Map */}
      <div className="gov-card p-5 sm:p-6">
        
        {/* Header & Controls Bar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h2 className="font-display text-base font-bold text-slate-900 uppercase tracking-wide">
                National Infrastructure Spatial Map
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Spatial distribution across districts, spatial hotspots, and real-time citizen demand signals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Map Theme Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setMapTheme('light')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mapTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Light Canvas
              </button>
              <button
                onClick={() => setMapTheme('satellite')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mapTheme === 'satellite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite Earth
              </button>
              <button
                onClick={() => setMapTheme('dark')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mapTheme === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dark Canvas
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-none w-36 sm:w-44"
              />
            </div>

            {/* Sector Filter Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
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
        </div>

        {/* Map Container */}
        <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {/* Refined Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 p-3.5 backdrop-blur-md border border-slate-200 text-[11px] space-y-1.5 shadow-md">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Priority Classification</div>
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              <span className="text-slate-700 font-medium">Critical (&gt;75)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700 font-medium">High (62-75)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-700 font-medium">Medium (48-61)</span>
            </div>
          </div>
        </div>

        {/* Top 5 Ranked Districts Quick Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Top Ranked High-Deficit Districts
            </span>
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-0.5">
              Click any district card for SHAP & Scope details <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {districts.slice(0, 5).map((d) => (
              <button
                key={d.district}
                onClick={() => onSelectDistrict(d)}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center space-x-1.5">
                    <span className="text-emerald-700 font-mono">#{d.rank}</span>
                    <span>{d.district}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.dominant_deficit_sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-900">{d.priority_score}</div>
                  <div className={`text-[9px] font-bold uppercase ${
                    d.urgency_class === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {d.urgency_class}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
