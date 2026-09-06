import numpy as np

class VisionService:
    @staticmethod
    def calculate_ndwi_flood_inundation(band_green: np.ndarray, band_nir: np.ndarray) -> dict:
        """
        FEATURE 1: Satellite & Computer Vision Ingestion (Sentinel-2 NDWI Flood Detection)
        Formula: NDWI = (Green - NIR) / (Green + NIR)
        """
        denominator = band_green + band_nir
        denominator[denominator == 0] = 1e-9
        ndwi = (band_green - band_nir) / denominator
        
        # Water bodies and flood anomalies typically have NDWI > 0.3
        flood_pixels = int(np.sum(ndwi > 0.3))
        total_pixels = int(ndwi.size)
        inundation_percentage = float((flood_pixels / max(1, total_pixels)) * 100)
        
        severity = "Critical" if inundation_percentage > 35.0 else "Elevated" if inundation_percentage > 15.0 else "Normal"
        is_emergency = inundation_percentage > 25.0

        return {
            "ndwi_mean": round(float(np.mean(ndwi)), 4),
            "inundation_percentage": round(inundation_percentage, 2),
            "flood_severity": severity,
            "is_emergency_hotspot": is_emergency,
            "total_pixels_analyzed": total_pixels,
            "submerged_pixel_count": flood_pixels,
            "estimated_submerged_area_sq_km": round((flood_pixels * 100.0) / 1000000.0, 2) # Assuming 10m Sentinel-2 resolution
        }

    @staticmethod
    def analyze_preset_tile(preset_name: str) -> dict:
        """
        Generates deterministic Sentinel-2 tile matrices for live stage demonstrations.
        """
        np.random.seed(42)
        if preset_name == "bihar_monsoon_flood":
            # High Green reflectance relative to NIR in submerged flooded basin
            green = np.random.uniform(0.35, 0.85, (100, 100))
            nir = np.random.uniform(0.05, 0.40, (100, 100))
            district = "Darbhanga / Madhubani"
            sector = "Water & Sanitation / Flood Defense"
            description = "Sentinel-2 Multi-Spectral Inundation: Widespread Bagmati river breach submersing village access roads."
        elif preset_name == "bengal_delta_inundation":
            green = np.random.uniform(0.40, 0.90, (100, 100))
            nir = np.random.uniform(0.02, 0.35, (100, 100))
            district = "Malda / Murshidabad"
            sector = "Public Safety & Embankments"
            description = "Sentinel-2 NDWI Delta Basin: Critical embankment slippage inundating 420 hectares of agrarian land."
        elif preset_name == "up_rural_potholes":
            # Pothole & Road degradation surface model
            green = np.random.uniform(0.15, 0.45, (100, 100))
            nir = np.random.uniform(0.20, 0.50, (100, 100))
            district = "Sitapur / Bahraich PMGSY Arteries"
            sector = "Roads & Transport"
            description = "Drone Pavement Profiler: Severe aggregate stripping, 14 major structural craters detected along 8.4 km corridor."
        else:
            green = np.random.uniform(0.2, 0.5, (100, 100))
            nir = np.random.uniform(0.3, 0.6, (100, 100))
            district = "Bahraich"
            sector = "Healthcare"
            description = "Baseline Satellite Pass: Normal seasonal terrain with localized runoff."

        result = VisionService.calculate_ndwi_flood_inundation(green, nir)
        result["preset"] = preset_name
        result["district"] = district
        result["target_sector"] = sector
        result["technical_synopsis"] = description
        return result

vision_service = VisionService()
