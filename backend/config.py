import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

class Config:
    BASE_DIR = BASE_DIR
    PROJECT_ROOT = PROJECT_ROOT

    # Security: STRICT 127.0.0.1 loopback isolation to prevent exposure on shared Wi-Fi
    HOST = "127.0.0.1"
    PORT = 8749
    DEBUG = False

    # Data paths
    DATASET_PATH = PROJECT_ROOT / "india_infrastructure_hackathon_10k.csv"
    HOTSPOTS_PATH = BASE_DIR / "data" / "hotspots.csv"
    MODELS_DIR = BASE_DIR / "models"

    # Infrastructure Sector Taxonomy (7 Classes)
    SECTORS = [
        "Healthcare",
        "Water & Sanitation",
        "Roads & Transport",
        "Energy & Power",
        "Education",
        "Digital Infrastructure & DPI",
        "Public Safety"
    ]

    # Priority Classes
    PRIORITY_CLASSES = ["Low", "Medium", "High", "Critical"]

    # Google Gemini API Key for Grounded Policy Synthesizer
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_BUDGET = 150000000  # 15 Crore INR default
