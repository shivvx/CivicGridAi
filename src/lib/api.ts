import { District, Hotspot, SCIPResult, VisionResult, SHAPExplanation } from '../types';

export const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  return res.json();
}

export async function fetchDistricts(climateMode: boolean = false, sector?: string): Promise<{ total: number; districts: District[] }> {
  let url = `${API_BASE}/districts?climate_mode=${climateMode}`;
  if (sector && sector !== 'All') {
    url += `&sector=${encodeURIComponent(sector)}`;
  }
  const res = await fetch(url);
  return res.json();
}

export async function fetchHotspots(): Promise<{ total_hotspots: number; hotspots: Hotspot[] }> {
  const res = await fetch(`${API_BASE}/hotspots`);
  return res.json();
}

export async function simulateBudget(budgetLimitInr: number, climateMode: boolean = false, sectorFilter?: string): Promise<SCIPResult> {
  const res = await fetch(`${API_BASE}/dashboard/simulate_budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      budget_limit: budgetLimitInr,
      climate_mode: climateMode,
      sector_filter: sectorFilter === 'All' ? null : sectorFilter
    })
  });
  return res.json();
}

export async function submitCitizenGrievance(text: string, district?: string) {
  const res = await fetch(`${API_BASE}/citizen/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, district })
  });
  return res.json();
}

export async function fetchRecentTelemetry() {
  const res = await fetch(`${API_BASE}/citizen/recent`);
  return res.json();
}

export async function explainDecision(features: any): Promise<SHAPExplanation> {
  const res = await fetch(`${API_BASE}/prediction/explain_decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features)
  });
  return res.json();
}

export async function analyzeSatelliteTile(preset: string): Promise<VisionResult> {
  const res = await fetch(`${API_BASE}/vision/analyze_tile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset })
  });
  return res.json();
}

export async function fetchVisionPresets() {
  const res = await fetch(`${API_BASE}/vision/presets`);
  return res.json();
}

export async function calculateLifecycleModel(capexInr: number, discountRate: number = 0.06) {
  const res = await fetch(`${API_BASE}/dashboard/lifecycle_model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capex_inr: capexInr, discount_rate: discountRate })
  });
  return res.json();
}

export async function queryAssistant(query: string, budgetLimit: number, climateMode: boolean) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, budget_limit: budgetLimit, climate_mode: climateMode })
  });
  return res.json();
}

export async function generateDpr(district: string) {
  const res = await fetch(`${API_BASE}/assistant/generate_dpr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ district })
  });
  return res.json();
}
