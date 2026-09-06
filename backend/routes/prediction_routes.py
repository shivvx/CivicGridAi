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

@prediction_bp.route("/models_benchmark", methods=["GET"])
def models_benchmark():
    """
    Returns full comparative evaluation scorecard across trained ML models
    (Classifiers, Regressors, Multilingual NLP, and DBSCAN Spatial Hotspots)
    """
    benchmark_data = ml_service.get_model_benchmarks()
    return jsonify(benchmark_data), 200

@prediction_bp.route("/test_samples", methods=["GET"])
def test_samples():
    """
    Returns real records from the 2,000-record held-out test CSV for interactive testing
    """
    count = int(request.args.get("count", 15))
    samples = ml_service.get_test_samples(count=count)
    return jsonify({"count": len(samples), "samples": samples}), 200

@prediction_bp.route("/test_sample_inference", methods=["POST"])
def test_sample_inference():
    """
    Runs live model inference against a test sample and verifies prediction against Ground Truth
    """
    data = request.get_json() or {}
    evaluation = ml_service.evaluate_test_sample(data)
    return jsonify(evaluation), 200
