import React, { useState, useEffect } from 'react';
import { VisionResult } from '../types';
import { analyzeSatelliteTile, fetchVisionPresets } from '../lib/api';
import { 
  Satellite, 
  X, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectAnomaly?: (anomaly: any) => void;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, onInjectAnomaly }) => {
  const [selectedPreset, setSelectedPreset] = useState('bihar_monsoon_flood');
  const [result, setResult] = useState<VisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      runAnalysis(selectedPreset);
    }
  }, [isOpen]);

  const loadPresets = async () => {
    try {
      const p = await fetchVisionPresets();
      if (p && p.presets) setPresets(p.presets);
    } catch (e) {
      console.error(e);
    }
  };

  const runAnalysis = async (presetId: string) => {
    setLoading(true);
    setSelectedPreset(presetId);
    try {
      const res = await analyzeSatelliteTile(presetId);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Satellite className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display text-lg font-bold text-white">
                  Feature 1: Satellite & Computer Vision Ingestion (Sentinel-2 NDWI)
                </h3>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                  10m Multi-Spectral Resolution
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates Normalized Difference Water Index (NDWI) and road surface degradation to detect submerged infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => runAnalysis(p.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPreset === p.id
                  ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-cyan-400">{p.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">{p.location}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{p.spectral_band}</div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-cyan-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Ingesting Sentinel-2 Multi-Spectral Tile & Computing NDWI Matrix...</span>
            </div>
          ) : result ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Simulated Spectral Tile View (5 Cols) */}
              <div className="md:col-span-5 rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Multi-Spectral Pixel Matrix (100x100)</span>
                    <span className="font-mono text-[10px] text-cyan-400">B03 vs B08</span>
                  </div>

                  {/* Synthetic Multi-Spectral Canvas Visualizer */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="text-center z-10 p-3">
                      <Droplets className="h-10 w-10 text-cyan-400 mx-auto animate-pulse mb-1" />
                      <div className="font-mono text-xs font-bold text-white">NDWI Index: {result.ndwi_mean}</div>
                      <div className="text-[10px] text-cyan-300 mt-0.5">
                        {result.inundation_percentage}% Submerged Surface Area
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <b>Mathematical Formula</b>: <code className="font-mono text-cyan-300">NDWI = (Green - NIR) / (Green + NIR)</code>
                </div>
              </div>

              {/* Right Column: Ingestion Metrics & Civil Scope (7 Cols) */}
              <div className="md:col-span-7 space-y-3">
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Flood Inundation Ratio</div>
                    <div className="text-xl font-black text-rose-400 mt-0.5">{result.inundation_percentage}%</div>
                    <div className="text-[10px] text-slate-400">{result.submerged_pixel_count.toLocaleString()} flooded pixels</div>
                  </div>

                  <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated Submerged Extent</div>
                    <div className="text-xl font-black text-cyan-400 mt-0.5">
                      {result.estimated_submerged_area_sq_km} <span className="text-xs">sq km</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Sentinel-2 10m Ground Grid</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-300">Hazard Classification</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                      result.flood_severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {result.flood_severity} Anomaly
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {result.technical_synopsis}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Target Deficit Sector</div>
                    <div className="font-bold text-white mt-0.5">{result.target_sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Geographic Zone</div>
                    <div className="font-bold text-cyan-400 mt-0.5">{result.district}</div>
                  </div>
                </div>

              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Automated Satellite Telemetry Ingestion • Copernicus Open Access Hub Compliant
          </span>
          <button
            onClick={() => {
              if (result && onInjectAnomaly) {
                onInjectAnomaly(result);
              }
              onClose();
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-102 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Inject Satellite Anomaly into SCIP Grid</span>
          </button>
        </div>

      </div>
    </div>
  );
};
