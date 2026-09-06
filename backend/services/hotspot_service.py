import pandas as pd
from pathlib import Path
from backend.config import Config

class HotspotService:
    def __init__(self):
        self.hotspots_df = None
        self._load_hotspots()

    def _load_hotspots(self):
        hotspots_path = Config.HOTSPOTS_PATH
        if hotspots_path.exists():
            try:
                self.hotspots_df = pd.read_csv(hotspots_path)
            except Exception as e:
                print(f"Error loading hotspots: {e}")

    def get_all_hotspots(self) -> list:
        if self.hotspots_df is None or self.hotspots_df.empty:
            self._load_hotspots()
            
        if self.hotspots_df is not None and not self.hotspots_df.empty:
            return self.hotspots_df.to_dict(orient="records")
            
        # Fallback preset hotspots if file is still generating
        return [
            {
                "hotspot_id": "HS-001",
                "latitude": 27.5744,
                "longitude": 81.5975,
                "district": "Bahraich",
                "state": "Uttar Pradesh",
                "dominant_category": "Healthcare",
                "request_count": 482,
                "average_severity": 88.5,
                "estimated_beneficiaries": 850000,
                "infrastructure_gap_score": 82.5
            },
            {
                "hotspot_id": "HS-002",
                "latitude": 26.1542,
                "longitude": 85.8918,
                "district": "Darbhanga",
                "state": "Bihar",
                "dominant_category": "Water & Sanitation",
                "request_count": 435,
                "average_severity": 86.2,
                "estimated_beneficiaries": 1100000,
                "infrastructure_gap_score": 79.0
            },
            {
                "hotspot_id": "HS-003",
                "latitude": 27.5683,
                "longitude": 80.6829,
                "district": "Sitapur",
                "state": "Uttar Pradesh",
                "dominant_category": "Roads & Transport",
                "request_count": 390,
                "average_severity": 79.4,
                "estimated_beneficiaries": 620000,
                "infrastructure_gap_score": 74.2
            }
        ]

hotspot_service = HotspotService()
