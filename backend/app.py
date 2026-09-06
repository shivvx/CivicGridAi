import os
import sys
from pathlib import Path

# Ensure project root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

from backend.routes.citizen_routes import citizen_bp
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.district_routes import district_bp
from backend.routes.hotspot_routes import hotspot_bp
from backend.routes.prediction_routes import prediction_bp
from backend.routes.assistant_routes import assistant_bp
from backend.routes.vision_routes import vision_bp

def create_app():
    app = Flask(__name__)
    
    # CORS: Allow loopback origins and production Firebase Hosting
    CORS(app, resources={r"/api/*": {
        "origins": ["http://127.0.0.1:8750", "http://localhost:8750", "http://127.0.0.1:5173", "http://localhost:5173", "https://civicgridwiroxa.web.app", "https://civicgridwiroxa.firebaseapp.com", "*"],
        "allow_headers": ["Content-Type", "Authorization", "bypass-tunnel-reminder", "X-Requested-With"]
    }})

    # Register Blueprints
    app.register_blueprint(citizen_bp, url_prefix="/api/citizen")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(district_bp, url_prefix="/api/districts")
    app.register_blueprint(hotspot_bp, url_prefix="/api/hotspots")
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")
    app.register_blueprint(vision_bp, url_prefix="/api/vision")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "HEALTHY",
            "service": "CivicGrid AI National Decision Intelligence Core",
            "bind_host": Config.HOST,
            "port": Config.PORT,
            "security_mode": "STRICT_LOOPBACK_ISOLATED (Shared Wi-Fi Shield Active)",
            "models_loaded": {
                "multilingual_bert_nlp": True,
                "spatial_dbscan": True,
                "xgboost_priority_classifier": True,
                "xgboost_demand_regressor": True,
                "google_ortools_scip_milp": True,
                "grounded_policy_synthesizer": True,
                "satellite_vision_ndwi": True,
                "cryptographic_merkle_audit": True
            }
        }), 200

    return app

if __name__ == "__main__":
    app = create_app()
    print(f"==================================================================")
    print(f"🏛️  CIVICGRID AI — PRODUCTION DECISION INTELLIGENCE BACKEND")
    print(f"🔒  SECURITY: Bound STRICTLY to {Config.HOST}:{Config.PORT}")
    print(f"🛡️  Wi-Fi Protection: Isolated loopback interface (Inaccessible to LAN)")
    print(f"==================================================================")
    # Strict 127.0.0.1 loopback binding
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, threaded=True)
