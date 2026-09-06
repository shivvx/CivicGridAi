from flask import Blueprint, request, jsonify
from backend.services.vision_service import vision_service

vision_bp = Blueprint("vision", __name__)

@vision_bp.route("/presets", methods=["GET"])
def get_presets():
    return jsonify({
        "presets": [
            {
                "id": "bihar_monsoon_flood",
                "title": "Sentinel-2 Multi-Spectral Flood Inundation (North Bihar)",
                "location": "Darbhanga / Madhubani Basin",
                "sector": "Water & Sanitation / Embankments",
                "spectral_band": "B03 (Green) vs B08 (NIR) -> NDWI Calculation"
            },
            {
                "id": "up_rural_potholes",
                "title": "Drone Road Surface & Pothole Profiler (Eastern UP)",
                "location": "Bahraich / Sitapur PMGSY Arteries",
                "sector": "Roads & Transport",
                "spectral_band": "RGB High-Resolution Pavement Surface Degradation"
            },
            {
                "id": "bengal_delta_inundation",
                "title": "Sentinel-2 Delta Basin Overflow & Breach",
                "location": "Malda / Murshidabad Catchment",
                "sector": "Public Safety & Civil Embankments",
                "spectral_band": "B03 / B08 Multi-Temporal Anomaly"
            }
        ]
    }), 200

@vision_bp.route("/analyze_tile", methods=["POST"])
def analyze_tile():
    data = request.get_json() or {}
    preset = data.get("preset", "bihar_monsoon_flood")
    result = vision_service.analyze_preset_tile(preset)
    return jsonify(result), 200
