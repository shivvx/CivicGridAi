# 🏆 CivicGrid AI — Machine Learning Model Benchmark Report

**Dataset**: `india_infrastructure_hackathon_10k.csv` (10,000 Records)  
**Evaluation Protocol**: Stratified 80/20 Train-Test Split (Held-out Test Set: 2,000 Samples)  
**Execution Timestamp**: 2026-09-06T03:45:36Z  
**Pipeline Runtime**: 14.09s  

---

## 1. Priority / Urgency Classification Leaderboard
*Multi-class classification: Low (0), Medium (1), High (2), Critical (3)*

| Model Architecture | Test Accuracy | Macro-F1 | Balanced Acc | Macro Precision | Macro Recall | Latency (100 Qs) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **LightGBM Classifier** | `93.60%` | `0.9297` | `0.9423` | `0.9198` | `0.9423` | `0.0ms` | Winner 🏆 (Active in Production API) |
| **XGBoost Classifier** | `93.45%` | `0.9281` | `0.9376` | `0.9207` | `0.9376` | `0.0ms` | Candidate Evaluated |
| **HistGradientBoosting** | `93.30%` | `0.9256` | `0.9323` | `0.9201` | `0.9323` | `0.3ms` | Candidate Evaluated |
| **Random Forest Classifier** | `80.00%` | `0.7901` | `0.7920` | `0.7935` | `0.7920` | `0.2ms` | Candidate Evaluated |
| **Extra Trees Classifier** | `60.90%` | `0.4668` | `0.4633` | `0.7798` | `0.4633` | `0.2ms` | Candidate Evaluated |
| **Calibrated Logistic Regression** | `46.30%` | `0.3502` | `0.3545` | `0.5095` | `0.3545` | `0.0ms` | Candidate Evaluated |

---

## 2. 30-Day Citizen Demand Volume Forecasting Leaderboard
*Target: Projected 30-day citizen demand volume*

| Model Architecture | R² Score | RMSE | MAE | Explained Variance | Training Time | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Ridge Regressor (L2)** | `1.0000` | `3.517` | `2.839` | `1.0000` | `0.01s` | Winner 🏆 (Active in Production API) |
| **Random Forest Regressor** | `0.9952` | `84.709` | `9.482` | `0.9952` | `0.43s` | Candidate Evaluated |
| **LightGBM Regressor** | `0.8580` | `459.771` | `34.270` | `0.8580` | `0.55s` | Candidate Evaluated |
| **HistGradientBoosting Regressor** | `0.8166` | `522.521` | `38.006` | `0.8166` | `1.81s` | Candidate Evaluated |
| **XGBoost Regressor** | `0.7329` | `630.503` | `41.539` | `0.7329` | `0.26s` | Candidate Evaluated |

---

## 3. Multilingual Citizen Grievance NLP Leaderboard
*Cross-lingual classification into Infrastructure Sectors*

| Model Architecture | Test Accuracy | Macro-F1 | Precision | Recall | Training Time | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Calibrated LinearSVC** | `100.00%` | `1.0000` | `1.0000` | `1.0000` | `0.24s` | Winner 🏆 (Active in Production API) |
| **Multinomial Logistic Regression** | `100.00%` | `1.0000` | `1.0000` | `1.0000` | `0.03s` | Candidate Evaluated |
| **Complement Naive Bayes** | `100.00%` | `1.0000` | `1.0000` | `1.0000` | `0.00s` | Candidate Evaluated |
| **Random Forest on TF-IDF** | `100.00%` | `1.0000` | `1.0000` | `1.0000` | `0.10s` | Candidate Evaluated |

---

## 4. Geospatial Infrastructure Deficit Clustering (DBSCAN)
- **Algorithm**: DBSCAN (`eps=0.10, min_samples=6`) on standardized geographic coordinates
- **Identified Deficit Hotspots**: 35 regional cluster centroids
- **Clustered Citizen Demands**: 10,000
- **Outlier / Diffuse Backlog**: 0
- **Artifact Exported**: `backend/data/hotspots.csv` & `backend/models/coordinate_scaler.pkl`

---

## 5. Production Synchronization Guarantee
All top-ranking winners (marked with 🏆) are automatically serialized and synchronized with the live Python Flask backend:
- `backend/models/priority_model.pkl`
- `backend/models/demand_model.pkl`
- `backend/models/text_classifier.pkl`
- `backend/models/intent_vectorizer.pkl`
- `backend/models/intent_class_map.pkl`
- `backend/models/coordinate_scaler.pkl`
