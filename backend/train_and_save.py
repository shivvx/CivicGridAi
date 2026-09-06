import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import xgboost as xgb

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = PROJECT_ROOT / "india_infrastructure_hackathon_10k.csv"

DATA_DIR.mkdir(exist_ok=True, parents=True)
MODELS_DIR.mkdir(exist_ok=True, parents=True)

# 40 Real Indian Districts with precise coordinates & baseline governance metrics
DISTRICTS = [
    # Uttar Pradesh
    {"district": "Bahraich", "state": "Uttar Pradesh", "lat": 27.5744, "lon": 81.5975, "pop": 3487000, "rural_pct": 88.2, "vuln": 0.84, "base_gap": 82.5, "sector": "Healthcare"},
    {"district": "Sitapur", "state": "Uttar Pradesh", "lat": 27.5683, "lon": 80.6829, "pop": 4483000, "rural_pct": 87.5, "vuln": 0.79, "base_gap": 74.2, "sector": "Roads & Transport"},
    {"district": "Balrampur", "state": "Uttar Pradesh", "lat": 27.4300, "lon": 82.1800, "pop": 2148000, "rural_pct": 91.3, "vuln": 0.86, "base_gap": 84.1, "sector": "Water & Sanitation"},
    {"district": "Shravasti", "state": "Uttar Pradesh", "lat": 27.7000, "lon": 81.9300, "pop": 1117000, "rural_pct": 94.6, "vuln": 0.89, "base_gap": 86.8, "sector": "Education"},
    {"district": "Gonda", "state": "Uttar Pradesh", "lat": 27.1300, "lon": 81.9600, "pop": 3433000, "rural_pct": 92.1, "vuln": 0.76, "base_gap": 71.5, "sector": "Energy & Power"},
    {"district": "Raebareli", "state": "Uttar Pradesh", "lat": 26.2300, "lon": 81.2400, "pop": 3405000, "rural_pct": 89.2, "vuln": 0.68, "base_gap": 62.0, "sector": "Digital Infrastructure & DPI"},
    {"district": "Hardoi", "state": "Uttar Pradesh", "lat": 27.3900, "lon": 80.1300, "pop": 4092000, "rural_pct": 86.4, "vuln": 0.74, "base_gap": 69.4, "sector": "Roads & Transport"},
    {"district": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "pop": 4589000, "rural_pct": 34.0, "vuln": 0.38, "base_gap": 41.2, "sector": "Public Safety"},

    # Bihar
    {"district": "Darbhanga", "state": "Bihar", "lat": 26.1542, "lon": 85.8918, "pop": 3937000, "rural_pct": 90.1, "vuln": 0.88, "base_gap": 79.0, "sector": "Water & Sanitation"},
    {"district": "Katihar", "state": "Bihar", "lat": 25.5394, "lon": 87.5714, "pop": 3071000, "rural_pct": 91.2, "vuln": 0.85, "base_gap": 78.4, "sector": "Water & Sanitation"},
    {"district": "Madhubani", "state": "Bihar", "lat": 26.3500, "lon": 86.0800, "pop": 4487000, "rural_pct": 96.4, "vuln": 0.87, "base_gap": 81.2, "sector": "Healthcare"},
    {"district": "Purnia", "state": "Bihar", "lat": 25.7771, "lon": 87.4753, "pop": 3264000, "rural_pct": 89.8, "vuln": 0.82, "base_gap": 75.3, "sector": "Roads & Transport"},
    {"district": "Araria", "state": "Bihar", "lat": 26.1500, "lon": 87.5200, "pop": 2811000, "rural_pct": 94.0, "vuln": 0.89, "base_gap": 83.7, "sector": "Healthcare"},
    {"district": "Muzaffarpur", "state": "Bihar", "lat": 26.1200, "lon": 85.3900, "pop": 4801000, "rural_pct": 90.4, "vuln": 0.77, "base_gap": 68.2, "sector": "Energy & Power"},
    {"district": "Gaya", "state": "Bihar", "lat": 24.7955, "lon": 85.0002, "pop": 4391000, "rural_pct": 86.8, "vuln": 0.78, "base_gap": 70.8, "sector": "Water & Sanitation"},

    # West Bengal
    {"district": "Malda", "state": "West Bengal", "lat": 25.0000, "lon": 88.1400, "pop": 3988000, "rural_pct": 86.2, "vuln": 0.81, "base_gap": 76.5, "sector": "Water & Sanitation"},
    {"district": "Murshidabad", "state": "West Bengal", "lat": 24.1800, "lon": 88.2700, "pop": 7103000, "rural_pct": 80.3, "vuln": 0.78, "base_gap": 73.1, "sector": "Healthcare"},
    {"district": "Purulia", "state": "West Bengal", "lat": 23.3300, "lon": 86.3600, "pop": 2930000, "rural_pct": 87.3, "vuln": 0.79, "base_gap": 72.8, "sector": "Water & Sanitation"},
    {"district": "Paschim Medinipur", "state": "West Bengal", "lat": 22.4200, "lon": 87.3200, "pop": 5913000, "rural_pct": 87.8, "vuln": 0.71, "base_gap": 64.9, "sector": "Roads & Transport"},

    # Maharashtra
    {"district": "Gadchiroli", "state": "Maharashtra", "lat": 20.1800, "lon": 80.0000, "pop": 1072000, "rural_pct": 89.0, "vuln": 0.83, "base_gap": 80.6, "sector": "Healthcare"},
    {"district": "Nandurbar", "state": "Maharashtra", "lat": 21.3700, "lon": 74.2400, "pop": 1648000, "rural_pct": 83.3, "vuln": 0.82, "base_gap": 78.9, "sector": "Education"},
    {"district": "Yavatmal", "state": "Maharashtra", "lat": 20.3900, "lon": 78.1200, "pop": 2772000, "rural_pct": 78.4, "vuln": 0.72, "base_gap": 67.3, "sector": "Energy & Power"},
    {"district": "Dhule", "state": "Maharashtra", "lat": 20.9000, "lon": 74.7800, "pop": 2050000, "rural_pct": 72.2, "vuln": 0.65, "base_gap": 61.4, "sector": "Roads & Transport"},

    # Odisha
    {"district": "Kalahandi", "state": "Odisha", "lat": 19.9100, "lon": 83.1700, "pop": 1576000, "rural_pct": 92.3, "vuln": 0.86, "base_gap": 83.2, "sector": "Healthcare"},
    {"district": "Rayagada", "state": "Odisha", "lat": 19.1700, "lon": 83.4200, "pop": 967000, "rural_pct": 84.8, "vuln": 0.85, "base_gap": 81.7, "sector": "Water & Sanitation"},
    {"district": "Koraput", "state": "Odisha", "lat": 18.8100, "lon": 82.7100, "pop": 1379000, "rural_pct": 83.6, "vuln": 0.84, "base_gap": 80.1, "sector": "Roads & Transport"},
    {"district": "Nuapada", "state": "Odisha", "lat": 20.8300, "lon": 82.5200, "pop": 610000, "rural_pct": 94.4, "vuln": 0.83, "base_gap": 79.4, "sector": "Energy & Power"},

    # Rajasthan
    {"district": "Barmer", "state": "Rajasthan", "lat": 25.7500, "lon": 71.3900, "pop": 2603000, "rural_pct": 93.0, "vuln": 0.81, "base_gap": 81.0, "sector": "Water & Sanitation"},
    {"district": "Jaisalmer", "state": "Rajasthan", "lat": 26.9157, "lon": 70.9083, "pop": 669000, "rural_pct": 86.7, "vuln": 0.77, "base_gap": 77.2, "sector": "Energy & Power"},
    {"district": "Banswara", "state": "Rajasthan", "lat": 23.5500, "lon": 74.4500, "pop": 1797000, "rural_pct": 92.9, "vuln": 0.83, "base_gap": 79.8, "sector": "Healthcare"},
    {"district": "Dungarpur", "state": "Rajasthan", "lat": 23.8400, "lon": 73.7200, "pop": 1388000, "rural_pct": 93.6, "vuln": 0.82, "base_gap": 78.5, "sector": "Education"},

    # Chhattisgarh
    {"district": "Bastar", "state": "Chhattisgarh", "lat": 19.1000, "lon": 81.9500, "pop": 1413000, "rural_pct": 86.1, "vuln": 0.87, "base_gap": 84.5, "sector": "Healthcare"},
    {"district": "Dantewada", "state": "Chhattisgarh", "lat": 18.9000, "lon": 81.3500, "pop": 533000, "rural_pct": 81.9, "vuln": 0.88, "base_gap": 85.2, "sector": "Roads & Transport"},
    {"district": "Bijapur", "state": "Chhattisgarh", "lat": 18.8000, "lon": 80.8200, "pop": 255000, "rural_pct": 88.4, "vuln": 0.91, "base_gap": 88.0, "sector": "Digital Infrastructure & DPI"},
    {"district": "Sukma", "state": "Chhattisgarh", "lat": 18.4000, "lon": 81.6700, "pop": 250000, "rural_pct": 90.0, "vuln": 0.90, "base_gap": 87.3, "sector": "Public Safety"},

    # Madhya Pradesh
    {"district": "Chhindwara", "state": "Madhya Pradesh", "lat": 22.0500, "lon": 78.9300, "pop": 2090000, "rural_pct": 75.8, "vuln": 0.69, "base_gap": 66.2, "sector": "Energy & Power"},
    {"district": "Mandla", "state": "Madhya Pradesh", "lat": 22.6000, "lon": 80.3800, "pop": 1054000, "rural_pct": 87.5, "vuln": 0.81, "base_gap": 76.9, "sector": "Healthcare"},

    # Karnataka & Telangana
    {"district": "Raichur", "state": "Karnataka", "lat": 16.2000, "lon": 77.3600, "pop": 1928000, "rural_pct": 74.6, "vuln": 0.73, "base_gap": 68.9, "sector": "Water & Sanitation"},
    {"district": "Yadgir", "state": "Karnataka", "lat": 16.7700, "lon": 77.1400, "pop": 1174000, "rural_pct": 81.2, "vuln": 0.77, "base_gap": 72.4, "sector": "Education"},
    {"district": "Adilabad", "state": "Telangana", "lat": 19.6600, "lon": 78.5300, "pop": 708000, "rural_pct": 76.3, "vuln": 0.75, "base_gap": 71.0, "sector": "Roads & Transport"}
]

SECTOR_TEMPLATES = {
    "Healthcare": [
        "Primary Health Centre has no doctor and medical supplies are exhausted.",
        "हमारे प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं हैं और दवाइयां खत्म हो गई हैं।",
        "আমাদের স্বাস্থ্যকেন্দ্রে কোনো ডাক্তার নেই, ওষুধপত্রও পাওয়া যাচ্ছে না।",
        "Emergency ambulance cannot reach rural clinic due to submerged access road.",
        "Maternal care ward ceiling is leaking and power backup is non-functional.",
        "O posto de saúde comunitário está sem médicos e sem medicamentos essenciais."
    ],
    "Water & Sanitation": [
        "Drinking water pipeline has ruptured, forcing 400 families to drink contaminated groundwater.",
        "हमारे इलाके में पीने के पानी की पाइपलाइन टूट गई है, लोग गंदा पानी पीने को मजबूर हैं।",
        "পানীয় জলের পাইপলাইন ফেটে গেছে, মানুষ নোংরা জল খেতে বাধ্য হচ্ছে।",
        "Deep borewell pump burned out three weeks ago, acute water crisis in village.",
        "Open sewage drain is overflowing into the local market creating severe disease outbreak.",
        "A tubulação de água potável rompeu e a comunidade está sem abastecimento há dias."
    ],
    "Roads & Transport": [
        "PMGSY link road washed away by heavy monsoon flash floods, isolating three villages.",
        "सड़क टूटी होने से बारिश में अस्पताल और बाजार तक पहुंचना नामुमकिन हो गया है।",
        "ভারী বৃষ্টিতে রাস্তা ভেঙে যোগাযোগ সম্পূর্ণ বিচ্ছিন্ন হয়ে পড়েছে।",
        "Concrete culvert bridge collapsed under heavy transport, immediate replacement required.",
        "Dangerous highway crater potholes causing recurring vehicle accidents daily.",
        "A ponte de concreto desabou e a estrada rural está completamente intransitável."
    ],
    "Energy & Power": [
        "Agricultural distribution 33kV transformer blown, halting village irrigation for weeks.",
        "मुख्य बिजली का ट्रांसफॉर्मर तीन हफ्तों से खराब पड़ा है, खेतों में सिंचाई ठप है।",
        "বিদ্যুতের ট্রান্সফরমার বিকল হয়ে থাকায় সেচ কাজ বন্ধ হয়ে গেছে।",
        "High voltage wires snapped and hanging low across school pathway, extreme safety hazard.",
        "Rural feeder line suffers 18 hours of unscheduled blackouts daily during harvest.",
        "O transformador de energia explodiu, deixando toda a área rural sem eletricidade."
    ],
    "Education": [
        "Primary government school building structurally degraded with hazardous cracked roof.",
        "सरकारी प्राथमिक विद्यालय की छत में दरारें हैं, बच्चों की सुरक्षा खतरे में है।",
        "সরকারি প্রাথমিক বিদ্যালয়ের ভবন ভেঙে পড়ার আশঙ্কায় ক্লাস বন্ধ।",
        "Girls secondary school lacks functional sanitation and clean drinking water facilities.",
        "Digital education lab equipment delivered but no broadband fiber connectivity available.",
        "A escola pública está com a estrutura danificada e sem saneamento para os alunos."
    ],
    "Digital Infrastructure & DPI": [
        "Common Service Centre (CSC) disconnected due to snapped optical fiber, Aadhaar disabled.",
        "ऑप्टिकल फाइबर केबल कटने से जन सेवा केंद्र ठप है और राशन वितरण रुक गया है।",
        "অপটিক্যাল ফাইবার সংযোগ বিচ্ছিন্ন হওয়ায় ডিজিটাল পরিষেবা বন্ধ।",
        "Cellular telecom tower battery bank depleted, zero mobile coverage in 15km perimeter.",
        "Panchayat digital records terminal offline, welfare disbursements delayed by months.",
        "A torre de telecomunicações está inoperante, deixando a vila sem sinal de internet."
    ],
    "Public Safety": [
        "River embankment erosion threatening to breach and submerge adjoining village settlements.",
        "नदी का तटबंध टूटने की कगार पर है, बाढ़ से पूरे गांव में पानी घुसने का खतरा है।",
        "নদীর বাঁধ ভেঙে লোকালয়ে জল ঢোকার প্রবল আশঙ্কা দেখা দিয়েছে।",
        "Rural highway intersection lacks high-mast streetlights, high rate of night crime.",
        "Fire response station missing water tanker refill hydrants in industrial zone.",
        "O dique de contenção contra enchentes está sob risco de ruptura iminente."
    ]
}

def generate_10k_dataset():
    print("Generating 10,000-record real-world aligned infrastructure dataset...")
    np.random.seed(42)
    records = []
    
    n_records = 10000
    for i in range(n_records):
        dist_meta = DISTRICTS[i % len(DISTRICTS)]
        
        # Determine sector: 45% dominant deficit, 55% distributed across others
        if np.random.rand() < 0.45:
            cat = dist_meta["sector"]
        else:
            cat = np.random.choice(list(SECTOR_TEMPLATES.keys()))
            
        complaint_template = np.random.choice(SECTOR_TEMPLATES[cat])
        
        # Spatial jitter within district radius (~10km)
        lat_jitter = np.random.normal(0, 0.04)
        lon_jitter = np.random.normal(0, 0.04)
        lat = round(dist_meta["lat"] + lat_jitter, 5)
        lon = round(dist_meta["lon"] + lon_jitter, 5)
        
        # Feature generation
        gap_jitter = np.random.normal(0, 6)
        infra_gap = float(np.clip(dist_meta["base_gap"] + gap_jitter, 25.0, 98.0))
        
        days_maint = int(np.clip(np.random.exponential(150) + 30, 10, 480))
        upvotes = int(np.clip(np.random.negative_binomial(5, 0.08), 1, 450))
        
        # Budget required (between 8 Lakhs to 4.2 Crores INR)
        budget = int(np.random.uniform(800000, 42000000))
        
        # Urgency & Priority Class derivation (0: Low, 1: Medium, 2: High, 3: Critical)
        urgency_score = (infra_gap * 0.4) + ((days_maint / 480) * 35) + ((dist_meta["vuln"]) * 25)
        if urgency_score > 72 or (dist_meta["vuln"] > 0.82 and infra_gap > 75):
            priority_class = 3
            urgency_level = "Critical"
        elif urgency_score > 58:
            priority_class = 2
            urgency_level = "High"
        elif urgency_score > 42:
            priority_class = 1
            urgency_level = "Medium"
        else:
            priority_class = 0
            urgency_level = "Low"
            
        record = {
            "request_id": f"CG-{10000 + i}",
            "timestamp": pd.Timestamp("2026-08-01") + pd.Timedelta(days=int(np.random.uniform(0, 36))),
            "state": dist_meta["state"],
            "district": dist_meta["district"],
            "latitude": lat,
            "longitude": lon,
            "category": cat,
            "complaint_text": complaint_template,
            "urgency_level": urgency_level,
            "priority_class": priority_class,
            "upvotes": upvotes,
            "infrastructure_gap": round(infra_gap, 2),
            "budget_required": budget,
            "days_since_last_maintenance": days_maint,
            "population_density": round(upvotes * 10.0 + dist_meta["pop"] / 10000.0, 2),
            "vulnerability_index": dist_meta["vuln"],
            "status": np.random.choice(["Active", "Under Review", "Scheduled", "Pending Funding"], p=[0.55, 0.20, 0.15, 0.10])
        }
        records.append(record)
        
    df = pd.DataFrame(records)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Dataset successfully created and saved to {DATASET_PATH} ({len(df)} records).")
    return df

def train_and_save():
    df = generate_10k_dataset()
    
    # -------------------------------------------------------------
    # 1. NLP Intent Classification Model
    # -------------------------------------------------------------
    print("\n[1/5] Training Multilingual Intent Classifier (TF-IDF + L2 Regularized Logistic Regression)...")
    # Sub-word char n-grams + word n-grams captures multilingual roots (Hindi, Bengali, English, etc.)
    vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer="char_wb", min_df=2, max_features=12000)
    X_text = vectorizer.fit_transform(df["complaint_text"])
    y_intent = df["category"]
    
    clf = LogisticRegression(C=0.01, max_iter=1000, solver="lbfgs")
    clf.fit(X_text, y_intent)
    
    joblib.dump(vectorizer, MODELS_DIR / "intent_vectorizer.pkl")
    joblib.dump(clf, MODELS_DIR / "text_classifier.pkl")
    joblib.dump(list(clf.classes_), MODELS_DIR / "intent_class_map.pkl")
    print(f"NLP model saved. Classes: {list(clf.classes_)}")
    
    # -------------------------------------------------------------
    # 2. DBSCAN Spatial Hotspot Clustering
    # -------------------------------------------------------------
    print("\n[2/5] Training Spatial DBSCAN Clustering Engine on Coordinates...")
    coords = df[["latitude", "longitude"]].values
    scaler = StandardScaler()
    coords_scaled = scaler.fit_transform(coords)
    joblib.dump(scaler, MODELS_DIR / "coordinate_scaler.pkl")
    
    db = DBSCAN(eps=0.10, min_samples=5)
    labels = db.fit_predict(coords_scaled)
    df["cluster_id"] = labels
    
    valid_clusters = df[df["cluster_id"] != -1]
    hotspot_rows = []
    
    for c_id, group in valid_clusters.groupby("cluster_id"):
        if len(group) < 5:
            continue
        dominant_cat = group["category"].mode()[0]
        avg_sev = group["priority_class"].mean() * 25.0 + 25.0
        centroid_lat = round(group["latitude"].mean(), 5)
        centroid_lon = round(group["longitude"].mean(), 5)
        district = group["district"].mode()[0]
        state = group["state"].mode()[0]
        beneficiaries = int(len(group) * np.random.uniform(1500, 3500))
        
        hotspot_rows.append({
            "hotspot_id": f"HS-{c_id:03d}",
            "latitude": centroid_lat,
            "longitude": centroid_lon,
            "district": district,
            "state": state,
            "dominant_category": dominant_cat,
            "request_count": len(group),
            "average_severity": round(avg_sev, 2),
            "estimated_beneficiaries": beneficiaries,
            "infrastructure_gap_score": round(group["infrastructure_gap"].mean(), 2)
        })
        
    hotspots_df = pd.DataFrame(hotspot_rows)
    hotspots_df.sort_values(by="request_count", ascending=False, inplace=True)
    hotspots_df.to_csv(DATA_DIR / "hotspots.csv", index=False)
    print(f"DBSCAN generated {len(hotspots_df)} infrastructure deficit hotspots -> {DATA_DIR / 'hotspots.csv'}")

    # -------------------------------------------------------------
    # 3. XGBoost Multi-Class Priority Classifier
    # -------------------------------------------------------------
    print("\n[3/5] Training XGBoost Multi-Class Priority Classifier...")
    # Features
    feature_cols = [
        "latitude", "longitude", "population_density", "infrastructure_gap",
        "budget_required", "days_since_last_maintenance", "upvotes",
        "state", "district", "category"
    ]
    
    X = df[feature_cols].copy()
    y = df["priority_class"].values
    
    # Categorical encoding
    for cat_col in ["state", "district", "category"]:
        X[cat_col] = X[cat_col].astype("category")
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    priority_model = xgb.XGBClassifier(
        objective="multi:softmax",
        num_class=4,
        n_estimators=60,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        enable_categorical=True,
        random_state=42
    )
    priority_model.fit(X_train, y_train)
    train_acc = priority_model.score(X_train, y_train)
    test_acc = priority_model.score(X_test, y_test)
    print(f"XGBoost Priority Classifier trained: Train Acc={train_acc:.3f}, Test Acc={test_acc:.3f}")
    
    joblib.dump(priority_model, MODELS_DIR / "priority_model.pkl")
    
    # -------------------------------------------------------------
    # 4. XGBoost 30-Day Demand Forecasting Regressor
    # -------------------------------------------------------------
    print("\n[4/5] Training XGBoost 30-Day Demand Forecasting Regressor...")
    y_demand = df["upvotes"] * 1.5 + np.random.normal(10, 4, size=len(df))
    y_demand = np.maximum(y_demand, 1.0)
    
    demand_model = xgb.XGBRegressor(
        objective="reg:squarederror",
        n_estimators=70,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.7,
        colsample_bytree=0.9,
        tree_method="hist",
        enable_categorical=True,
        random_state=42
    )
    demand_model.fit(X_train, y_demand[X_train.index])
    print("XGBoost Demand Regressor trained successfully.")
    joblib.dump(demand_model, MODELS_DIR / "demand_model.pkl")

    # -------------------------------------------------------------
    # 5. Metadata and Districts Cache
    # -------------------------------------------------------------
    print("\n[5/5] Saving District Benchmarks and Schema Metadata...")
    with open(DATA_DIR / "districts_metadata.json", "w", encoding="utf-8") as f:
        json.dump(DISTRICTS, f, indent=2)
        
    print("\nTraining and Model Serialization Completed Successfully!")

if __name__ == "__main__":
    train_and_save()
