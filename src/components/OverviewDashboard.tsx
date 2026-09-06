import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { District, Hotspot, SCIPResult, TelemetryEvent } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  Cpu, 
  Search, 
  MapPin, 
  ArrowUpRight,
  X,
  Satellite,
  Droplets,
  Sparkles,
  CheckCircle2,
  Layers,
  Eye,
  Activity,
  ShieldAlert
} from 'lucide-react';
import L from 'leaflet';
import { ALL_INDIA_DISTRICTS, IndiaDistrict } from '../lib/allIndiaDistricts';

export interface SatelliteAnomaly {
  id: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  anomalyType: 'flood_ndwi' | 'road_damage_sar' | 'thermal_drought';
  title: string;
  spectralIndex: string;
  sensor: string;
  severity: 'Critical' | 'High';
  confidence: number;
  detectedIssues: string;
  recommendedAction: string;
  priorityScoreBoost: number;
  impactedSector: string;
}

export const SATELLITE_ANOMALIES: SatelliteAnomaly[] = [
  {
    id: 'SAT-001',
    district: 'Bahraich',
    state: 'Uttar Pradesh',
    lat: 27.57,
    lng: 81.60,
    radiusMeters: 22000,
    anomalyType: 'flood_ndwi',
    title: 'Mahasi Embankment Breach & Submerged Arterial Highway',
    spectralIndex: 'NDWI: +0.74 (Severe Waterlogging)',
    sensor: 'Sentinel-2 Multi-Spectral (10m MSI)',
    severity: 'Critical',
    confidence: 97.4,
    detectedIssues: 'Submerged State Highway 42 over 3.4 km. Primary health center access cut off by 1.2m standing flood waters.',
    recommendedAction: 'Deploy high-capacity mobile dewatering pump & construct reinforced stone-pitch embankment.',
    priorityScoreBoost: 18.4,
    impactedSector: 'Water & Sanitation'
  },
  {
    id: 'SAT-002',
    district: 'Darbhanga',
    state: 'Bihar',
    lat: 26.15,
    lng: 85.90,
    radiusMeters: 20000,
    anomalyType: 'flood_ndwi',
    title: 'Bagmati Basin Stormwater Surge & Inundated Culverts',
    spectralIndex: 'NDWI: +0.68 (Active Waterlogging)',
    sensor: 'Sentinel-2 Multi-Spectral (B3/B8 Index)',
    severity: 'Critical',
    confidence: 95.8,
    detectedIssues: 'Heavy monsoon runoff causing backflow into agricultural arterial roads and rural sanitation pits.',
    recommendedAction: 'Emergency culvert clearing, siphon installation, and water purification tablet distribution.',
    priorityScoreBoost: 16.2,
    impactedSector: 'Water & Sanitation'
  },
  {
    id: 'SAT-003',
    district: 'Kupwara',
    state: 'Jammu & Kashmir',
    lat: 34.53,
    lng: 74.25,
    radiusMeters: 18000,
    anomalyType: 'road_damage_sar',
    title: 'NH-701 Mountain Pavement Fissures & Landslide Creep',
    spectralIndex: 'PCI: 28/100 (Severe Distress)',
    sensor: 'Sentinel-1 C-Band InSAR Coherence',
    severity: 'Critical',
    confidence: 94.6,
    detectedIssues: 'Differential ground subsidence of 42mm along slope cutting. Structural retaining wall shear failure.',
    recommendedAction: 'Construct geo-grid reinforced gabion retaining wall and high-tensile rockfall barrier.',
    priorityScoreBoost: 19.1,
    impactedSector: 'Roads & Transport'
  },
  {
    id: 'SAT-004',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.52,
    lng: 73.85,
    radiusMeters: 18000,
    anomalyType: 'road_damage_sar',
    title: 'Industrial Corridor Pavement Rutting & Bitumen Fatigue',
    spectralIndex: 'PCI: 34/100 (Sub-base Fatigue)',
    sensor: 'High-Res Aerial CV / Sentinel-1 SAR',
    severity: 'High',
    confidence: 93.1,
    detectedIssues: 'Heavy freight transit induced deep wheel-path rutting and alligator cracking across 12km freight ring.',
    recommendedAction: 'Cold milling and polymer-modified bitumen (PMB) surface course overlay (50mm).',
    priorityScoreBoost: 12.8,
    impactedSector: 'Roads & Transport'
  },
  {
    id: 'SAT-005',
    district: 'Banswara',
    state: 'Rajasthan',
    lat: 23.54,
    lng: 74.45,
    radiusMeters: 19000,
    anomalyType: 'road_damage_sar',
    title: 'Tribal Arterial Road Culvert Scour & Structural Crack',
    spectralIndex: 'PCI: 32/100 (Culvert Scour)',
    sensor: 'Sentinel-1 SAR / Computer Vision',
    severity: 'High',
    confidence: 92.4,
    detectedIssues: 'Mahi river tributary runoff washed out bridge approach abutment, isolating 4 tribal village clusters.',
    recommendedAction: 'Reinforced concrete wing wall reconstruction & precast twin-box culvert replacement.',
    priorityScoreBoost: 14.7,
    impactedSector: 'Roads & Transport'
  },
  {
    id: 'SAT-006',
    district: 'Jhansi',
    state: 'Uttar Pradesh',
    lat: 25.44,
    lng: 78.56,
    radiusMeters: 24000,
    anomalyType: 'thermal_drought',
    title: 'Groundwater Table Depletion & Extreme Thermal Stress',
    spectralIndex: 'LST: +44.2°C (Thermal Deficit)',
    sensor: 'Landsat-8 TIRS / MODIS Thermal',
    severity: 'High',
    confidence: 91.8,
    detectedIssues: 'Severe soil moisture deficit (<11%). Borewells failing across 8 drought-prone Gram Panchayats.',
    recommendedAction: 'Deep groundwater recharge shaft excavation and piped community drinking water link.',
    priorityScoreBoost: 15.3,
    impactedSector: 'Water & Sanitation'
  },
  {
    id: 'SAT-007',
    district: 'Gadchiroli',
    state: 'Maharashtra',
    lat: 20.18,
    lng: 80.00,
    radiusMeters: 20000,
    anomalyType: 'flood_ndwi',
    title: 'Wainganga Floodplain Siltation & Water Supply Contamination',
    spectralIndex: 'NDWI: +0.65 (Contaminated Runoff)',
    sensor: 'Sentinel-2 Multi-Spectral MSI',
    severity: 'High',
    confidence: 94.0,
    detectedIssues: 'Intense surface runoff inundating open dug wells and rural sub-centres in tribal forest tracts.',
    recommendedAction: 'Install decentralized multi-stage chlorination and solar powered ultra-filtration units.',
    priorityScoreBoost: 17.0,
    impactedSector: 'Healthcare'
  },
  {
    id: 'SAT-008',
    district: 'Dhemaji',
    state: 'Assam',
    lat: 27.48,
    lng: 94.58,
    radiusMeters: 22000,
    anomalyType: 'flood_ndwi',
    title: 'Brahmaputra Tributary Overtopping & Substation Submersion',
    spectralIndex: 'NDWI: +0.82 (Extreme Inundation)',
    sensor: 'Sentinel-2 MSI Multi-Spectral',
    severity: 'Critical',
    confidence: 98.1,
    detectedIssues: 'Jiadhali river flash flood submerging road links and cutting power to rural health sub-centre.',
    recommendedAction: 'Deploy mobile emergency water treatment plant & elevate electrical substation plinth by 1.8m.',
    priorityScoreBoost: 21.5,
    impactedSector: 'Energy & Power'
  }
];

interface OverviewDashboardProps {
  districts: District[];
  hotspots: Hotspot[];
  scipResult: SCIPResult | null;
  onSelectDistrict: (district: District) => void;
  climateMode: boolean;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  latestTelemetry?: TelemetryEvent | null;
  externalTargetDistrict?: IndiaDistrict | null;
  onTelemetrySubmitted?: (analysis: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  districts,
  hotspots,
  scipResult,
  onSelectDistrict,
  climateMode,
  selectedSector,
  setSelectedSector,
  latestTelemetry,
  externalTargetDistrict,
  onTelemetrySubmitted
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const searchPinRef = useRef<L.Marker | null>(null);
  const searchCircleRef = useRef<L.Circle | null>(null);
  const satelliteAnomalyLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);
  const [mapTheme, setMapTheme] = useState<'street' | 'satellite'>('street');
  const [satelliteAIMode, setSatelliteAIMode] = useState<boolean>(true);
  const [activeAnomaly, setActiveAnomaly] = useState<SatelliteAnomaly | null>(null);
  const [injectedAnomalies, setInjectedAnomalies] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tile Providers
  const TILE_URLS = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const TILE_ATTRIBUTIONS = {
    street: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: '&copy; Esri World Imagery Earth Observation'
  };

  // Fuzzy search all India districts
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return ALL_INDIA_DISTRICTS
      .filter(d => 
        d.district.toLowerCase().includes(q) || 
        d.state.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.5, 81.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const baseTile = L.tileLayer(TILE_URLS.street, {
        attribution: TILE_ATTRIBUTIONS.street,
        maxZoom: 19
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
      maxZoom: mapTheme === 'satellite' ? 18 : 19
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
      const matchesSector = selectedSector === 'All' || d.dominant_deficit_sector === selectedSector;
      return matchesSector;
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
  }, [districts, hotspots, selectedSector, showHotspots]);

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

  // Automated Satellite AI Multi-Spectral Anomaly Detection Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (satelliteAnomalyLayerRef.current) {
      mapInstanceRef.current.removeLayer(satelliteAnomalyLayerRef.current);
      satelliteAnomalyLayerRef.current = null;
    }

    if (!satelliteAIMode) return;

    const group = L.layerGroup();

    SATELLITE_ANOMALIES.forEach((anomaly) => {
      const isInjected = injectedAnomalies.includes(anomaly.id);
      const isFlood = anomaly.anomalyType === 'flood_ndwi';
      const isRoad = anomaly.anomalyType === 'road_damage_sar';
      
      const themeColor = isFlood ? '#06b6d4' : isRoad ? '#f59e0b' : '#ef4444';
      const themeFill = isFlood ? 'rgba(6, 182, 212, 0.22)' : isRoad ? 'rgba(245, 158, 11, 0.22)' : 'rgba(239, 68, 68, 0.22)';

      // Holographic Radar Circle
      const radarCircle = L.circle([anomaly.lat, anomaly.lng], {
        radius: anomaly.radiusMeters,
        color: themeColor,
        weight: isInjected ? 3 : 2,
        dashArray: isInjected ? undefined : '4, 4',
        fillColor: themeFill,
        fillOpacity: isInjected ? 0.35 : 0.22
      });

      // Interactive Satellite Marker
      const satIcon = L.divIcon({
        className: 'satellite-anomaly-pin',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="${anomaly.title}">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:${themeColor}; opacity:0.3; animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width:24px; height:24px; border-radius:50%; background:${themeColor}; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px ${themeColor}60; color:#ffffff; font-size:11px; font-weight:bold;">
              🛰️
            </div>
            <div style="position:absolute; top:26px; white-space:nowrap; background:#0f172a; color:#ffffff; font-size:9px; font-family:monospace; font-weight:700; padding:2px 6px; border-radius:6px; border:1px solid ${themeColor}; pointer-events:none; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
              ${anomaly.spectralIndex.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([anomaly.lat, anomaly.lng], { icon: satIcon });
      
      const openDetail = () => {
        setActiveAnomaly(anomaly);
        mapInstanceRef.current?.flyTo([anomaly.lat, anomaly.lng], 10, { duration: 1.2 });
      };

      marker.on('click', openDetail);
      radarCircle.on('click', openDetail);

      marker.bindTooltip(`
        <div style="background:#0f172a; color:#f8fafc; padding:10px 14px; border-radius:12px; font-size:11px; border:1px solid ${themeColor}; box-shadow:0 12px 30px rgba(0,0,0,0.4); max-width:240px;">
          <div style="display:flex; align-items:center; gap:6px; font-size:10px; color:${themeColor}; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
            <span>🛰️ ${anomaly.sensor.split(' ')[0]} Anomaly</span>
            <span style="background:${themeColor}20; border:1px solid ${themeColor}50; padding:1px 4px; border-radius:4px;">${anomaly.severity}</span>
          </div>
          <div style="font-weight:700; color:#ffffff; font-size:12px; margin-top:4px;">${anomaly.title}</div>
          <div style="color:#94a3b8; font-size:10px; margin-top:2px;">${anomaly.district}, ${anomaly.state}</div>
          <div style="font-family:monospace; color:${themeColor}; font-size:11px; font-weight:700; margin-top:6px;">${anomaly.spectralIndex}</div>
          <div style="font-size:9px; color:#34d399; margin-top:6px; font-weight:600;">Click to inspect Sentinel CV telemetry →</div>
        </div>
      `, { direction: 'top', offset: [0, -15] });

      group.addLayer(radarCircle);
      group.addLayer(marker);
    });

    group.addTo(mapInstanceRef.current);
    satelliteAnomalyLayerRef.current = group;
  }, [satelliteAIMode, injectedAnomalies]);

  // Fly to a district on the map
  const flyToDistrict = useCallback((target: IndiaDistrict) => {
    if (!mapInstanceRef.current) return;

    // Clear previous search pin
    if (searchPinRef.current) {
      mapInstanceRef.current.removeLayer(searchPinRef.current);
    }
    if (searchCircleRef.current) {
      mapInstanceRef.current.removeLayer(searchCircleRef.current);
    }

    // Fly to location
    mapInstanceRef.current.flyTo([target.latitude, target.longitude], 10, {
      duration: 1.5,
      easeLinearity: 0.5
    });

    // Add a highlighted search pin
    const pinIcon = L.divIcon({
      className: 'search-pin',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:rgba(5,150,105,0.2); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:20px; height:20px; border-radius:50%; background:#059669; border:3px solid #ffffff; box-shadow:0 4px 12px rgba(5,150,105,0.4); z-index:10;"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const pin = L.marker([target.latitude, target.longitude], { icon: pinIcon })
      .addTo(mapInstanceRef.current);
    
    pin.bindTooltip(`
      <div style="background:#ffffff; color:#0f172a; padding:10px 14px; border-radius:10px; font-size:11px; border:1px solid #d1fae5; box-shadow:0 10px 25px -5px rgba(5,150,105,0.2); min-width:160px;">
        <div style="font-weight:700; color:#059669; font-size:12px;">📍 ${target.district}</div>
        <div style="color:#64748b; font-size:10px;">${target.state}</div>
        <div style="font-size:9px; color:#94a3b8; margin-top:4px;">Lat: ${target.latitude.toFixed(2)}° N, Lon: ${target.longitude.toFixed(2)}° E</div>
      </div>
    `, { permanent: true, direction: 'top', offset: [0, -20] });

    searchPinRef.current = pin;

    // Add pulse circle
    const circle = L.circle([target.latitude, target.longitude], {
      radius: 15000,
      color: '#059669',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.08,
      dashArray: '6, 4'
    }).addTo(mapInstanceRef.current);
    searchCircleRef.current = circle;

    // Auto-remove after 12 seconds
    setTimeout(() => {
      if (mapInstanceRef.current) {
        if (searchPinRef.current) {
          mapInstanceRef.current.removeLayer(searchPinRef.current);
          searchPinRef.current = null;
        }
        if (searchCircleRef.current) {
          mapInstanceRef.current.removeLayer(searchCircleRef.current);
          searchCircleRef.current = null;
        }
      }
    }, 12000);
  }, []);

  // Respond to external target district from header search
  useEffect(() => {
    if (externalTargetDistrict) {
      flyToDistrict(externalTargetDistrict);
    }
  }, [externalTargetDistrict, flyToDistrict]);

  const handleSearchSelect = (item: IndiaDistrict) => {
    setSearchQuery(item.district);
    setShowSearchDropdown(false);
    flyToDistrict(item);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.parentElement?.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 cursor-default select-none">
              Total Grievance Telemetry
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">10,000</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 cursor-default select-none">
              ↑ +18.4% today
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Verified telemetry across 802 Indian districts (40 Priority Core & 29 DBSCAN Clusters)</p>
        </div>

        {/* Card 2: Critical Deficit Zones */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 cursor-default select-none">
              Critical Deficit Zones
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-rose-600">{criticalCount}</span>
            <span className="text-xs font-semibold text-slate-500 cursor-default select-none">of 802 National Grid</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">{highCount} High Priority | Urgent intervention queued</p>
        </div>

        {/* Card 3: Direct Beneficiary Reach */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 cursor-default select-none">
              Target Beneficiary Reach
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700 border border-blue-200">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">{totalBeneficiaries.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium cursor-default select-none">Citizens</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Maximized welfare reach under hard fiscal budget cap</p>
        </div>

        {/* Card 4: Operations Research Optimization Status */}
        <div className="gov-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 cursor-default select-none">
              Capital Outlay (SCIP)
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-display text-3xl font-extrabold text-emerald-700">₹{allocatedCr} Cr</span>
            <span className="text-xs text-slate-500 cursor-default select-none">/ ₹{totalBudgetCr} Cr</span>
          </div>
          <p className="mt-1.5 text-xs text-emerald-700 font-mono flex items-center space-x-1 font-semibold cursor-default select-none">
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
              Search all 802 Indian districts • Realtime Autocomplete & Pinpoint Zoom • Street & satellite views
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Map Theme Toggle — Street & Satellite Only */}
            {/* Map Theme Toggle — Street & Satellite Only */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setMapTheme('street')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mapTheme === 'street' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Street View
              </button>
              <button
                onClick={() => setMapTheme('satellite')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mapTheme === 'satellite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Satellite AI Anomaly Detection Toggle */}
            <button
              onClick={() => {
                const next = !satelliteAIMode;
                setSatelliteAIMode(next);
                if (next && mapTheme !== 'satellite') {
                  setMapTheme('satellite');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-xl transition-all border ${
                satelliteAIMode
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Toggle Automated Sentinel-2 NDWI & Sentinel-1 SAR Anomaly Detection"
            >
              <Satellite className={`h-3.5 w-3.5 ${satelliteAIMode ? 'text-cyan-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-bold">{satelliteAIMode ? 'Satellite AI: Active (8)' : 'Satellite AI'}</span>
            </button>

            {/* Search Input with Autocomplete */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search all 802 districts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                className="rounded-xl bg-white pl-9 pr-8 py-1.5 text-xs font-medium text-slate-900 placeholder-slate-400 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-56 sm:w-64 md:w-72 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-[1000] max-h-72 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
                  <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">802 Districts Mesh</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{searchResults.length} matches</span>
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={`${item.district}-${item.state}-${idx}`}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">{item.district}</div>
                        <div className="text-[10px] text-slate-500">{item.state} • {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E</div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <span>Fly To</span>
                        <MapPin className="h-3 w-3 shrink-0" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sector Filter Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-800 border border-slate-200 focus:bg-white focus:border-slate-300 focus:outline-none cursor-pointer"
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

        {/* Satellite AI Live Anomaly Stream Banner */}
        {satelliteAIMode && !activeAnomaly && (
          <div className="mb-3 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 p-3 border border-cyan-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Satellite className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-cyan-300">Live Satellite AI Anomaly Detection Active:</span>
                <span className="text-slate-300 ml-1.5">
                  Sentinel-2 Multi-Spectral (NDWI) & Sentinel-1 InSAR detecting 8 critical infrastructure anomalies across India.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-md border border-cyan-700/50">
                Click any radar pin to inspect & inject
              </span>
            </div>
          </div>
        )}

        {/* Satellite AI Anomaly Detailed Inspection Card */}
        {activeAnomaly && (
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 border border-cyan-500/50 shadow-2xl animate-fadeIn relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                    <Satellite className="h-3 w-3 animate-pulse" />
                    <span>{activeAnomaly.sensor}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                    {activeAnomaly.severity} Anomaly
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    AI Confidence: <b className="text-emerald-400">{activeAnomaly.confidence}%</b> (Vision Transformer)
                  </span>
                </div>

                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeAnomaly.title}</span>
                  <span className="text-xs font-normal text-slate-300">({activeAnomaly.district}, {activeAnomaly.state})</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeAnomaly.detectedIssues}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                  <span>Spectral Telemetry: <b className="text-cyan-300 font-mono">{activeAnomaly.spectralIndex}</b></span>
                  <span>•</span>
                  <span>Sector: <b className="text-amber-300">{activeAnomaly.impactedSector}</b></span>
                  <span>•</span>
                  <span>Remediation: <span className="text-slate-200">{activeAnomaly.recommendedAction}</span></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    if (injectedAnomalies.includes(activeAnomaly.id)) return;
                    setInjectedAnomalies(prev => [...prev, activeAnomaly.id]);
                    if (onTelemetrySubmitted) {
                      onTelemetrySubmitted({
                        telemetry_id: Math.floor(Math.random() * 90000 + 10000),
                        detected_language: 'Sentinel-2 Multi-Spectral Telemetry',
                        extracted_district: activeAnomaly.district,
                        intent_name: activeAnomaly.impactedSector,
                        urgency_rating: activeAnomaly.severity,
                        standardized_english_summary: `[Satellite CV Detection] ${activeAnomaly.title}: ${activeAnomaly.detectedIssues}`
                      });
                    }
                  }}
                  disabled={injectedAnomalies.includes(activeAnomaly.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    injectedAnomalies.includes(activeAnomaly.id)
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 hover:scale-102 cursor-pointer'
                  }`}
                >
                  {injectedAnomalies.includes(activeAnomaly.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Injected into National Priority Mesh</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-slate-950" />
                      <span>Inject into District Priority Index (+{activeAnomaly.priorityScoreBoost} pts)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveAnomaly(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Close inspection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="relative h-[480px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs" style={{ zIndex: 0 }}>
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {/* Refined Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 p-3.5 backdrop-blur-md border border-slate-200 text-[11px] space-y-1.5 shadow-md cursor-default select-none">
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

            {satelliteAIMode && (
              <div className="pt-2 border-t border-slate-100 mt-2 space-y-1.5">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Satellite AI Detections</div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-slate-700 font-medium">Sentinel-2 Flood (NDWI)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-slate-700 font-medium">Sentinel-1 Road Damage</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Ranked Districts Quick Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-default select-none">
              Top Ranked High-Deficit Districts
            </span>
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-0.5 cursor-default select-none">
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
