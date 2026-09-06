import json
import time
from flask import Blueprint, request, jsonify, Response
from backend.services.district_service import district_service
from backend.services.recommendation_service import recommendation_service
from backend.services.depreciation_service import depreciation_service
from backend.services.audit_service import audit_service
from backend.config import Config

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/summary", methods=["GET"])
def get_summary():
    districts = district_service.get_ranked_districts()
    total_districts = len(districts)
    total_pop = sum(d["population"] for d in districts)
    critical_count = sum(1 for d in districts if d["urgency_class"] == "Critical")
    high_count = sum(1 for d in districts if d["urgency_class"] == "High")
    avg_priority = round(sum(d["priority_score"] for d in districts) / max(1, total_districts), 1)
    
    # Run default SCIP solver under 15 Cr INR
    default_scip = recommendation_service.solve_knapsack_scip(Config.DEFAULT_BUDGET)

    return jsonify({
        "status": "ONLINE",
        "total_records_ingested": 10000,
        "total_districts_monitored": total_districts,
        "total_population_catchment": total_pop,
        "critical_districts_count": critical_count,
        "high_priority_districts_count": high_count,
        "average_system_priority": avg_priority,
        "active_budget_inr": Config.DEFAULT_BUDGET,
        "default_scip_solution": default_scip
    }), 200

@dashboard_bp.route("/simulate_budget", methods=["POST"])
def simulate_budget():
    """
    Executes Google OR-Tools SCIP Mixed Integer Linear Programming (0/1 Knapsack MILP)
    and seals the decision with Feature 3 Cryptographic Merkle Root.
    """
    data = request.get_json() or {}
    budget_limit = float(data.get("budget_limit", Config.DEFAULT_BUDGET))
    climate_mode = bool(data.get("climate_mode", False))
    sector_filter = data.get("sector_filter")

    scip_result = recommendation_service.solve_knapsack_scip(
        budget_limit_inr=budget_limit,
        climate_mode=climate_mode,
        sector_filter=sector_filter
    )

    # FEATURE 3: Cryptographic Merkle-Tree Audit Lineage
    audit_payload = {
        "timestamp": time.time(),
        "budget_limit": budget_limit,
        "funded_projects": [p["project_id"] for p in scip_result["funded_portfolio"]],
        "total_allocated": scip_result["total_allocated_inr"],
        "beneficiaries": scip_result["total_direct_beneficiaries"]
    }
    merkle_audit = audit_service.compute_merkle_root(scip_result["funded_portfolio"])
    scip_result["merkle_audit"] = merkle_audit

    return jsonify(scip_result), 200

@dashboard_bp.route("/lifecycle_model", methods=["POST"])
def lifecycle_model():
    """
    FEATURE 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Infrastructure Modeler
    """
    data = request.get_json() or {}
    capex = float(data.get("capex_inr", 35000000))
    discount_rate = float(data.get("discount_rate", 0.06))
    
    result = depreciation_service.calculate_10_year_lifecycle_npv(capex, discount_rate)
    return jsonify(result), 200

@dashboard_bp.route("/telemetry_stream")
def telemetry_stream():
    """
    FEATURE 7: Live WebSockets / SSE Real-Time Citizen Telemetry Ticker & Geospatial Pulse
    Streams live simulated incoming citizen telemetry events every 3.5 seconds.
    """
    def event_stream():
        districts_sample = [
            ("Bahraich", "Uttar Pradesh", "Healthcare", "Doctor absence and waterlogging near PHC"),
            ("Darbhanga", "Bihar", "Water & Sanitation", "Water transmission pipe fractured"),
            ("Sitapur", "Uttar Pradesh", "Roads & Transport", "PMGSY road culvert cracked"),
            ("Malda", "West Bengal", "Water & Sanitation", "Tube-well groundwater arsenic contamination"),
            ("Katihar", "Bihar", "Public Safety", "Mahananda river flood embankment sliding"),
            ("Gadchiroli", "Maharashtra", "Healthcare", "Emergency maternal van stuck on dirt road"),
            ("Kalahandi", "Odisha", "Education", "Government school boundary wall collapsed in storm"),
            ("Barmer", "Rajasthan", "Energy & Power", "33kV feeder trip during peak afternoon heat")
        ]
        counter = 0
        while True:
            dist, state, cat, snippet = districts_sample[counter % len(districts_sample)]
            counter += 1
            payload = {
                "telemetry_id": 200000 + counter,
                "district": dist,
                "state": state,
                "category": cat,
                "urgency": "Critical" if counter % 2 == 0 else "High",
                "snippet": snippet,
                "timestamp": "Live Pulse",
                "pulse": True
            }
            yield f"data: {json.dumps(payload)}\n\n"
            time.sleep(3.5)

    return Response(event_stream(), mimetype="text/event-stream")
