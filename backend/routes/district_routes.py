from flask import Blueprint, request, jsonify
from backend.services.district_service import district_service

district_bp = Blueprint("district", __name__)

@district_bp.route("", methods=["GET"])
def get_districts():
    climate_mode = request.args.get("climate_mode", "false").lower() == "true"
    sector_filter = request.args.get("sector")
    if sector_filter == "All":
        sector_filter = None

    districts = district_service.get_ranked_districts(
        climate_resilient_mode=climate_mode,
        sector_filter=sector_filter
    )
    return jsonify({
        "total": len(districts),
        "climate_resilient_mode": climate_mode,
        "districts": districts
    }), 200

@district_bp.route("/<district_name>", methods=["GET"])
def get_district_detail(district_name):
    detail = district_service.get_district_detail(district_name)
    if not detail:
        return jsonify({"error": f"District {district_name} not found"}), 404
    return jsonify(detail), 200
