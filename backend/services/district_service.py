import json
import numpy as np
from pathlib import Path
from backend.config import Config

class DistrictService:
    def __init__(self):
        self.districts_metadata = []
        self._load_metadata()

    def _load_metadata(self):
        meta_path = Config.BASE_DIR / "data" / "districts_metadata.json"
        if meta_path.exists():
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.districts_metadata = json.load(f)
            except Exception as e:
                print(f"Error loading district metadata: {e}")

    def get_ranked_districts(self, climate_resilient_mode: bool = False, sector_filter: str = None) -> list:
        if not self.districts_metadata:
            self._load_metadata()

        ranked = []
        for dist in self.districts_metadata:
            # 6-Factor Composite Priority Formulation
            pop = dist.get("pop", 2000000)
            rural_pct = dist.get("rural_pct", 85.0)
            vuln = dist.get("vuln", 0.75)
            gap = dist.get("base_gap", 70.0)
            dominant_sector = dist.get("sector", "Healthcare")

            # Synthetic deterministic citizen complaints volume
            req_count = int((gap / 100.0) * (pop / 10000.0) * 1.8 + (rural_pct / 100.0) * 80)
            
            # 1. S_demand (30% weight, normalized per 10,000 residents and capped at 100)
            req_per_10k = (req_count / max(1.0, pop / 10000.0))
            s_demand = min(100.0, round((req_per_10k / 25.0) * 100.0, 1))

            # 2. S_gap (25% weight, physical infrastructure gap)
            s_gap = min(100.0, round(gap * 1.15, 1))

            # 3. S_pop (15% weight, rural population & density impact)
            rural_factor = rural_pct / 100.0
            density_factor = min(1.0, (pop / 1000.0) / 800.0)
            s_pop = min(100.0, round((rural_factor * 0.6 + density_factor * 0.4) * 100.0, 1))

            # 4. S_vuln (10% weight, poverty and deprivation index)
            s_vuln = min(100.0, round(vuln * 100.0, 1))

            # 5. S_inv (10% weight, historical capital backlog)
            per_capita_inv = round(35.0 + (1.0 - vuln) * 45.0, 1)
            s_inv = 85.0 if per_capita_inv < 50.0 else max(10.0, round(100.0 - per_capita_inv, 1))

            # 6. S_urgency (10% weight, distance and critical hazard)
            s_urgency = 92.0 if gap > 80.0 else 74.0 if gap > 70.0 else 55.0

            # Standard 6-Factor Composite Priority Score
            base_priority = (
                0.30 * s_demand +
                0.25 * s_gap +
                0.15 * s_pop +
                0.10 * s_vuln +
                0.10 * s_inv +
                0.10 * s_urgency
            )

            # FEATURE 8: ESG & Climate Disaster Vulnerability Composite Index
            # Ingests flood risk (NDWI simulation), heatwave stress, and groundwater depletion
            flood_risk_score = round(min(96.0, (dist["lat"] % 3) * 22.0 + (gap * 0.35) + 20.0), 1)
            heat_stress_score = round(min(94.0, (dist["lon"] % 4) * 18.0 + 35.0), 1)
            groundwater_deficit = round(min(98.0, 85.0 - (dist["lat"] * 1.5) + (vuln * 30.0)), 1)
            esg_climate_composite = round(flood_risk_score * 0.45 + heat_stress_score * 0.30 + groundwater_deficit * 0.25, 1)

            if climate_resilient_mode:
                final_priority = round(base_priority * 0.75 + esg_climate_composite * 0.25, 1)
            else:
                final_priority = round(base_priority, 1)

            urgency_class = (
                "Critical" if final_priority >= 75.0 else
                "High" if final_priority >= 62.0 else
                "Medium" if final_priority >= 48.0 else "Low"
            )

            # Recommended physical civil engineering intervention
            intervention_map = {
                "Healthcare": "Deploy Solar-Powered Primary Health Centre with Cold-Chain Storage & Emergency Tri-Axle Ambulance",
                "Water & Sanitation": "Install Solar Multi-Village Deep Filtration Pipeline & Overhead Chlorination Storage Tank",
                "Roads & Transport": "All-Weather Reinforced High-Level Box Culvert & Concrete PMGSY Link Road with Flood Berms",
                "Energy & Power": "Replace Degraded 33kV Agricultural Transformer & Install Microgrid Feeder Automation",
                "Education": "Structural Roof Reconstruction & Comprehensive Solar Sanitation Facilities at High School",
                "Digital Infrastructure & DPI": "Re-splice Subterranean Optical Fiber & Upgrade BharatNet Village Digital Kiosk",
                "Public Safety": "Geotextile Reinforced Riprap Embankment & High-Mast Flood Evacuation Lighting"
            }

            cost_inr = int(22000000 + (final_priority / 100.0) * 18000000)
            beneficiaries = int((pop * 0.22) * (final_priority / 100.0))

            item = {
                "district": dist["district"],
                "state": dist["state"],
                "latitude": dist["lat"],
                "longitude": dist["lon"],
                "population": pop,
                "rural_percentage": rural_pct,
                "vulnerability_index": vuln,
                "infrastructure_gap_score": gap,
                "dominant_deficit_sector": dominant_sector,
                "priority_score": final_priority,
                "base_priority_score": round(base_priority, 1),
                "urgency_class": urgency_class,
                "factor_breakdown": {
                    "s_demand": s_demand,
                    "s_gap": s_gap,
                    "s_pop": s_pop,
                    "s_vuln": s_vuln,
                    "s_inv": s_inv,
                    "s_urgency": s_urgency
                },
                "esg_climate_metrics": {
                    "flood_risk_score": flood_risk_score,
                    "heat_stress_score": heat_stress_score,
                    "groundwater_deficit": groundwater_deficit,
                    "esg_climate_composite": esg_climate_composite
                },
                "anti_bias_metrics": {
                    "citizen_demand_weight_pct": 30.0,
                    "objective_baseline_weight_pct": 70.0,
                    "digital_privilege_suppression_ratio": "1 : 10,000 residents"
                },
                "recommended_project": {
                    "project_id": f"PRJ-{dist['district'][:3].upper()}-01",
                    "intervention": intervention_map.get(dominant_sector, "Civil Infrastructure Reconstruction"),
                    "estimated_cost_inr": cost_inr,
                    "targeted_beneficiaries": beneficiaries,
                    "days_pending_maintenance": int(120 + gap * 2.2),
                    "phased_tranches": {
                        "q1_emergency_mobilization": int(cost_inr * 0.35),
                        "q2_civil_foundation": int(cost_inr * 0.30),
                        "q3_equipment_fitment": int(cost_inr * 0.20),
                        "q4_commissioning_audit": int(cost_inr * 0.15)
                    }
                }
            }
            ranked.append(item)

        if sector_filter and sector_filter != "All":
            ranked = [r for r in ranked if r["dominant_deficit_sector"] == sector_filter]

        # Rank descending
        ranked.sort(key=lambda x: x["priority_score"], reverse=True)
        for i, dist in enumerate(ranked):
            dist["rank"] = i + 1

        return ranked

    def get_district_detail(self, district_name: str) -> dict:
        districts = self.get_ranked_districts()
        for d in districts:
            if d["district"].lower() == district_name.lower():
                return d
        return districts[0] if districts else {}

district_service = DistrictService()
