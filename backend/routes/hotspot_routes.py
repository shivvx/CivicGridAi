from flask import Blueprint, jsonify
from backend.services.hotspot_service import hotspot_service

hotspot_bp = Blueprint("hotspot", __name__)

@hotspot_bp.route("", methods=["GET"])
def get_hotspots():
    hotspots = hotspot_service.get_all_hotspots()
    return jsonify({
        "total_hotspots": len(hotspots),
        "hotspots": hotspots
    }), 200
