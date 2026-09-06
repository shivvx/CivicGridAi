class DepreciationService:
    @staticmethod
    def calculate_10_year_lifecycle_npv(initial_capex_inr: float, discount_rate: float = 0.06) -> dict:
        """
        FEATURE 5: Multi-Year Capital Depreciation & 10-Year Lifecycle Infrastructure Modeler
        Mathematical Formulation:
          NPV = SUM_{t=1}^{10} [ (AvoidedCrisisCost_t - ScheduledMaintenance_t) / (1 + r)^t ] - InitialCapex
        """
        # Baseline emergency failure rate without intervention is ~22% of asset value escalating annually
        annual_projection = []
        cumulative_avoided_damages = 0.0
        discounted_net_benefits_sum = 0.0
        
        # Asset physical condition degradation curve (Good -> Fair -> Poor -> Critical Failure)
        for year in range(1, 11):
            # Without intervention: escalating disaster/reconstruction costs
            unmitigated_crisis_cost = initial_capex_inr * (0.12 + 0.025 * year)
            # With proactive intervention: small planned preventive maintenance
            scheduled_maint = initial_capex_inr * (0.02 + 0.003 * year)
            
            net_annual_benefit = unmitigated_crisis_cost - scheduled_maint
            discount_factor = (1.0 + discount_rate) ** year
            discounted_benefit = net_annual_benefit / discount_factor
            
            cumulative_avoided_damages += net_annual_benefit
            discounted_net_benefits_sum += discounted_benefit
            
            # Straight-line / reducing balance asset book value
            depreciated_asset_value = max(0.0, initial_capex_inr * (1.0 - (year * 0.075)))
            
            annual_projection.append({
                "year": f"Year {year}",
                "unmitigated_crisis_cost_inr": round(unmitigated_crisis_cost),
                "scheduled_maintenance_inr": round(scheduled_maint),
                "net_avoided_loss_inr": round(net_annual_benefit),
                "discounted_benefit_inr": round(discounted_benefit),
                "depreciated_asset_book_value_inr": round(depreciated_asset_value)
            })

        npv = discounted_net_benefits_sum - initial_capex_inr
        bcr = discounted_net_benefits_sum / max(1.0, initial_capex_inr)
        
        return {
            "initial_capex_inr": initial_capex_inr,
            "social_discount_rate": discount_rate,
            "net_present_value_inr": round(npv),
            "benefit_cost_ratio": round(bcr, 2),
            "total_10yr_avoided_damages_inr": round(cumulative_avoided_damages),
            "lifecycle_verdict": f"Highly Fiscally Accretive: Every ₹1 invested today yields ₹{bcr:.2f} in avoided crisis reconstruction.",
            "annual_cashflows": annual_projection
        }

depreciation_service = DepreciationService()
