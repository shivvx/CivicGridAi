from flask import Blueprint, request, jsonify
from backend.services.ml_service import ml_service

prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/predict_priority", methods=["POST"])
def predict_priority():
    data = request.get_json() or {}
    result = ml_service.predict_priority(data)
    return jsonify(result), 200

@prediction_bp.route("/predict_demand", methods=["POST"])
def predict_demand():
    data = request.get_json() or {}
    demand = ml_service.predict_demand(data)
    return jsonify({"projected_30_day_demand": demand}), 200

@prediction_bp.route("/explain_decision", methods=["POST"])
def explain_decision():
    """
    FEATURE 4: SHAP (Shapley Additive exPlanations) Decision Tree Explainer
    """
    data = request.get_json() or {}
    explanation = ml_service.explain_priority_decision(data)
    return jsonify(explanation), 200
