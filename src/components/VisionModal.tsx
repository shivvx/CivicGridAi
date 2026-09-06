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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Satellite className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Feature 1: Satellite & Computer Vision Ingestion (Sentinel-2 NDWI)
                </h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 border border-slate-200">
                  10m Multi-Spectral Resolution
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates Normalized Difference Water Index (NDWI) and road surface degradation to detect submerged infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                  ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">{p.title}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{p.location}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{p.spectral_band}</div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-600 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <span>Ingesting Sentinel-2 Multi-Spectral Tile & Computing NDWI Matrix...</span>
            </div>
          ) : result ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Simulated Spectral Tile View (5 Cols) */}
              <div className="md:col-span-5 rounded-xl bg-slate-50 p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Multi-Spectral Pixel Matrix (100x100)</span>
                    <span className="font-mono text-[10px] text-slate-700 font-bold">B03 vs B08</span>
                  </div>

                  {/* Synthetic Multi-Spectral Canvas Visualizer */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="text-center z-10 p-3">
                      <Droplets className="h-10 w-10 text-emerald-600 mx-auto animate-pulse mb-1" />
                      <div className="font-mono text-xs font-bold text-slate-900">NDWI Index: {result.ndwi_mean}</div>
                      <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                        {result.inundation_percentage}% Submerged Surface Area
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Mathematical Formula</span>: <code className="font-mono text-emerald-700">NDWI = (Green - NIR) / (Green + NIR)</code>
                </div>
              </div>

              {/* Right Column: Ingestion Metrics & Civil Scope (7 Cols) */}
              <div className="md:col-span-7 space-y-3">
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Flood Inundation Ratio</div>
                    <div className="text-xl font-bold text-rose-600 mt-0.5">{result.inundation_percentage}%</div>
                    <div className="text-[10px] text-slate-500">{result.submerged_pixel_count.toLocaleString()} flooded pixels</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Estimated Submerged Extent</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">
                      {result.estimated_submerged_area_sq_km} <span className="text-xs font-normal text-slate-500">sq km</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Sentinel-2 10m Ground Grid</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-600">Hazard Classification</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                      result.flood_severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {result.flood_severity} Anomaly
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {result.technical_synopsis}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Target Deficit Sector</div>
                    <div className="font-bold text-slate-900 mt-0.5">{result.target_sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Geographic Zone</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{result.district}</div>
                  </div>
                </div>

              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Automated Satellite Telemetry Ingestion • Copernicus Open Access Hub Compliant
          </span>
          <button
            onClick={() => {
              if (result && onInjectAnomaly) {
                onInjectAnomaly(result);
              }
              onClose();
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-300" />
            <span>Inject Satellite Anomaly into SCIP Grid</span>
          </button>
        </div>

      </div>
    </div>
  );
};
