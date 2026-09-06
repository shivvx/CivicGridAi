export interface FactorBreakdown {
  s_demand: number;
  s_gap: number;
  s_pop: number;
  s_vuln: number;
  s_inv: number;
  s_urgency: number;
}

export interface ESGMetrics {
  flood_risk_score: number;
  heat_stress_score: number;
  groundwater_deficit: number;
  esg_climate_composite: number;
}

export interface RecommendedProject {
  project_id: string;
  intervention: string;
  estimated_cost_inr: number;
  targeted_beneficiaries: number;
  days_pending_maintenance: number;
  phased_tranches: {
    q1_emergency_mobilization: number;
    q2_civil_foundation: number;
    q3_equipment_fitment: number;
    q4_commissioning_audit: number;
  };
}

export interface District {
  rank: number;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  rural_percentage: number;
  vulnerability_index: number;
  infrastructure_gap_score: number;
  dominant_deficit_sector: string;
  priority_score: number;
  base_priority_score: number;
  urgency_class: "Critical" | "High" | "Medium" | "Low";
  factor_breakdown: FactorBreakdown;
  esg_climate_metrics: ESGMetrics;
  anti_bias_metrics: {
    citizen_demand_weight_pct: number;
    objective_baseline_weight_pct: number;
    digital_privilege_suppression_ratio: string;
  };
  recommended_project: RecommendedProject;
}

export interface Hotspot {
  hotspot_id: string;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  dominant_category: string;
  request_count: number;
  average_severity: number;
  estimated_beneficiaries: number;
  infrastructure_gap_score: number;
}

export interface FundedProject {
  district: string;
  state: string;
  rank: number;
  priority_score: number;
  urgency_class: string;
  dominant_deficit_sector: string;
  project_id: string;
  intervention: string;
  cost_inr: number;
  beneficiaries: number;
  welfare_weight: number;
  decision: "FUNDED" | "DEFERRED";
  phased_tranches: {
    q1_emergency_mobilization: number;
    q2_civil_foundation: number;
    q3_equipment_fitment: number;
    q4_commissioning_audit: number;
  };
}

export interface MerkleAudit {
  merkle_root: string;
  leaf_count: number;
  tree_depth: number;
  sample_leaves: string[];
  verified_audit_status: string;
}

export interface SCIPResult {
  solver_engine: string;
  solve_time_ms: number;
  active_budget_limit_inr: number;
  total_allocated_inr: number;
  unallocated_fiscal_reserve_inr: number;
  budget_utilization_pct: number;
  total_direct_beneficiaries: number;
  composite_roi_index: number;
  funded_projects_count: number;
  deferred_projects_count: number;
  funded_portfolio: FundedProject[];
  deferred_portfolio: FundedProject[];
  merkle_audit?: MerkleAudit;
}

export interface TelemetryEvent {
  telemetry_id: number;
  language?: string;
  district: string;
  state: string;
  category: string;
  urgency: string;
  snippet: string;
  timestamp: string;
  pulse?: boolean;
}

export interface SHAPContribution {
  feature: string;
  value: number;
  impact?: "positive" | "negative";
  is_base?: boolean;
}

export interface SHAPExplanation {
  base_expected_value: number;
  final_composite_score: number;
  urgency_class: string;
  waterfall_contributions: SHAPContribution[];
  feature_weights: Record<string, number>;
}

export interface VisionResult {
  preset?: string;
  district?: string;
  target_sector?: string;
  technical_synopsis?: string;
  ndwi_mean: number;
  inundation_percentage: number;
  flood_severity: string;
  is_emergency_hotspot: boolean;
  total_pixels_analyzed: number;
  submerged_pixel_count: number;
  estimated_submerged_area_sq_km: number;
}
