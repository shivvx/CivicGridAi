from flask import Blueprint, request, jsonify, Response
from backend.services.nlp_service import nlp_service
from backend.services.ml_service import ml_service

citizen_bp = Blueprint("citizen", __name__)

# In-memory recent telemetry queue
RECENT_TELEMETRY = [
    {
        "telemetry_id": 108421,
        "language": "Hindi (हिंदी)",
        "district": "Bahraich",
        "state": "Uttar Pradesh",
        "category": "Healthcare",
        "urgency": "Critical",
        "timestamp": "Just now",
        "snippet": "प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं हैं और बारिश में सड़क डूब गई है।"
    },
    {
        "telemetry_id": 108422,
        "language": "Bengali (বাংলা)",
        "district": "Malda",
        "state": "West Bengal",
        "category": "Water & Sanitation",
        "urgency": "Critical",
        "timestamp": "1m ago",
        "snippet": "পানীয় জলের পাইপলাইন ফেটে গেছে, মানুষ নোংরা জল খেতে বাধ্য হচ্ছে।"
    },
    {
        "telemetry_id": 108423,
        "language": "English",
        "district": "Sitapur",
        "state": "Uttar Pradesh",
        "category": "Energy & Power",
        "urgency": "High",
        "timestamp": "3m ago",
        "snippet": "Agricultural distribution 33kV transformer blown for 3 weeks."
    },
    {
        "telemetry_id": 108424,
        "language": "Portuguese",
        "district": "Darbhanga",
        "state": "Bihar",
        "category": "Roads & Transport",
        "urgency": "Critical",
        "timestamp": "5m ago",
        "snippet": "A ponte de concreto desabou e a estrada rural está intransitável."
    }
]

@citizen_bp.route("/submit", methods=["POST"])
def submit_grievance():
    data = request.get_json() or {}
    text = data.get("text", "")
    district_hint = data.get("district")
    
    analysis = nlp_service.predict_intent(text, district_hint=district_hint)
    if not analysis.get("extracted_district") or analysis["extracted_district"] == "Unknown":
        analysis["extracted_district"] = district_hint or "Bahraich"

    # Register into recent telemetry
    new_entry = {
        "telemetry_id": analysis["telemetry_id"],
        "language": analysis["detected_language"],
        "district": analysis["extracted_district"],
        "state": "National Grid",
        "category": analysis["intent_name"],
        "urgency": analysis["urgency_rating"],
        "timestamp": "Just now",
        "snippet": text[:120]
    }
    RECENT_TELEMETRY.insert(0, new_entry)
    if len(RECENT_TELEMETRY) > 50:
        RECENT_TELEMETRY.pop()

    return jsonify({
        "status": "SUCCESS",
        "message": f"Citizen telemetry registered to national grid. Telemetry #{analysis['telemetry_id']}",
        "analysis": analysis
    }), 200

@citizen_bp.route("/sms_webhook", methods=["POST", "GET"])
def sms_webhook():
    """
    FEATURE 2: Rural WhatsApp & Twilio SMS Telemetry Bot
    Receives incoming Twilio / WhatsApp webhook payloads from citizens in remote offline regions.
    """
    body = request.values.get("Body") or request.args.get("Body", "")
    from_num = request.values.get("From") or request.args.get("From", "Rural Citizen")

    if not body and request.is_json:
        data = request.get_json()
        body = data.get("Body") or data.get("text", "")

    if not body:
        body = "Water pipeline ruptured in village Darbhanga, please send emergency repairs."

    analysis = nlp_service.predict_intent(body)
    
    # Store telemetry
    RECENT_TELEMETRY.insert(0, {
        "telemetry_id": analysis["telemetry_id"],
        "language": f"SMS / WhatsApp ({analysis['detected_language']})",
        "district": analysis["extracted_district"],
        "state": "Offline Telemetry Bot",
        "category": analysis["intent_name"],
        "urgency": analysis["urgency_rating"],
        "timestamp": "Just now (SMS)",
        "snippet": body[:120]
    })

    # Return standard TwiML XML Response
    twiml_resp = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>CivicGrid AI: Grievance registered for sector [{analysis['intent_name']}] in [{analysis['extracted_district']}]. Telemetry ID #{analysis['telemetry_id']} added to National SCIP Priority Knapsack.</Message>
</Response>"""
    return Response(twiml_resp, mimetype="application/xml")

@citizen_bp.route("/recent", methods=["GET"])
def get_recent():
    return jsonify({
        "count": len(RECENT_TELEMETRY),
        "telemetry": RECENT_TELEMETRY
    }), 200
