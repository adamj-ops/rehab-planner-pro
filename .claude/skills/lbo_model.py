"""
Leveraged Buyout (LBO) model for private equity analysis.
Calculates returns, debt schedules, and waterfall distributions.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import numpy as np
import pandas as pd


class DebtType(Enum):
    """Types of debt instruments."""
    SENIOR = "senior"
    SUBORDINATED = "subordinated"
    MEZZANINE = "mezzanine"
    REVOLVER = "revolver"
    TERM_LOAN_A = "term_loan_a"
    TERM_LOAN_B = "term_loan_b"
    HIGH_YIELD = "high_yield"


@dataclass
class DebtTranche:
    """Individual debt tranche in capital structure."""
    
    name: str
    debt_type: DebtType
    principal: float
    interest_rate: float
    amortization_pct: float = 0.0  # Annual amortization as % of original principal
    maturity_years: int = 7
    pik_rate: float = 0.0  # PIK interest rate (added to principal)
    commitment_fee: float = 0.0  # For revolvers
    prepayment_penalty: float = 0.0
    
    def annual_interest(self, outstanding_principal: float) -> float:
        """Calculate annual cash interest."""
        return outstanding_principal * self.interest_rate
    
    def annual_pik(self, outstanding_principal: float) -> float:
        """Calculate annual PIK interest."""
        return outstanding_principal * self.pik_rate
    
    def annual_amortization(self) -> float:
        """Calculate annual mandatory amortization."""
        return self.principal * self.amortization_pct


@dataclass
class WaterfallTier:
    """Single tier in equity waterfall distribution."""
    
    name: str
    hurdle_irr: float  # IRR hurdle for this tier
    sponsor_share: float  # Sponsor share above this hurdle
    management_share: float  # Management share above this hurdle
    
    @property
    def total_share(self) -> float:
        return self.sponsor_share + self.management_share


class LBOModel:
    """Complete LBO model with debt, returns, and waterfall."""
    
    def __init__(self, company_name: str = "Target Company"):
        """
        Initialize LBO model.
        
        Args:
            company_name: Name of target company
        """
        self.company_name = company_name
        
        # Transaction inputs
        self.purchase_price: float = 0
        self.entry_multiple: float = 0
        self.entry_ebitda: float = 0
        self.transaction_fees: float = 0
        self.financing_fees: float = 0
        
        # Capital structure
        self.debt_tranches: list[DebtTranche] = []
        self.equity_contribution: float = 0
        self.rollover_equity: float = 0
        
        # Operating assumptions
        self.projection_years: int = 5
        self.revenue_growth: list[float] = []
        self.ebitda_margin: list[float] = []
        self.capex_percent: list[float] = []
        self.nwc_percent: list[float] = []
        self.tax_rate: float = 0.25
        self.base_revenue: float = 0
        
        # Exit assumptions
        self.exit_multiple: float = 0
        self.exit_year: int = 5
        
        # Results
        self.projections: pd.DataFrame | None = None
        self.debt_schedule: pd.DataFrame | None = None
        self.returns: dict[str, Any] = {}
        
        # Waterfall
        self.waterfall_tiers: list[WaterfallTier] = []
    
    def set_transaction(
        self,
        purchase_price: float | None = None,
        entry_multiple: float | None = None,
        ltm_ebitda: float | None = None,
        transaction_fees_pct: float = 0.02,
        financing_fees_pct: float = 0.03
    ):
        """
        Set transaction parameters.
        
        Args:
            purchase_price: Total purchase price (or calculate from multiple)
            entry_multiple: EV/EBITDA entry multiple
            ltm_ebitda: Last twelve months EBITDA
            transaction_fees_pct: Transaction fees as % of purchase price
            financing_fees_pct: Financing fees as % of debt
        """
        if purchase_price and ltm_ebitda:
            self.purchase_price = purchase_price
            self.entry_ebitda = ltm_ebitda
            self.entry_multiple = purchase_price / ltm_ebitda
        elif entry_multiple and ltm_ebitda:
            self.entry_multiple = entry_multiple
            self.entry_ebitda = ltm_ebitda
            self.purchase_price = entry_multiple * ltm_ebitda
        else:
            raise ValueError("Must provide either purchase_price or entry_multiple with ltm_ebitda")
        
        self.transaction_fees = self.purchase_price * transaction_fees_pct
        self._financing_fees_pct = financing_fees_pct
    
    def add_debt_tranche(
        self,
        name: str,
        debt_type: DebtType,
        amount: float | None = None,
        multiple: float | None = None,
        interest_rate: float = 0.06,
        amortization_pct: float = 0.0,
        maturity_years: int = 7,
        pik_rate: float = 0.0
    ):
        """
        Add a debt tranche to the capital structure.
        
        Args:
            name: Tranche name
            debt_type: Type of debt
            amount: Dollar amount (or calculate from multiple)
            multiple: Debt as multiple of EBITDA
            interest_rate: Annual interest rate
            amortization_pct: Annual amortization %
            maturity_years: Maturity in years
            pik_rate: PIK interest rate
        """
        if amount:
            principal = amount
        elif multiple and self.entry_ebitda:
            principal = multiple * self.entry_ebitda
        else:
            raise ValueError("Must provide amount or multiple")
        
        tranche = DebtTranche(
            name=name,
            debt_type=debt_type,
            principal=principal,
            interest_rate=interest_rate,
            amortization_pct=amortization_pct,
            maturity_years=maturity_years,
            pik_rate=pik_rate
        )
        
        self.debt_tranches.append(tranche)
    
    def calculate_sources_uses(self) -> pd.DataFrame:
        """
        Calculate sources and uses of funds.
        
        Returns:
            DataFrame showing sources and uses
        """
        # Uses
        uses = {
            'Purchase Price': self.purchase_price,
            'Transaction Fees': self.transaction_fees,
            'Financing Fees': sum(t.principal for t in self.debt_tranches) * self._financing_fees_pct
        }
        
        self.financing_fees = uses['Financing Fees']
        total_uses = sum(uses.values())
        
        # Sources
        total_debt = sum(t.principal for t in self.debt_tranches)
        
        sources = {}
        for tranche in self.debt_tranches:
            sources[tranche.name] = tranche.principal
        
        sources['Rollover Equity'] = self.rollover_equity
        
        # Calculate required equity
        total_sources_ex_equity = total_debt + self.rollover_equity
        self.equity_contribution = total_uses - total_sources_ex_equity
        sources['Sponsor Equity'] = self.equity_contribution
        
        # Build DataFrame
        uses_df = pd.DataFrame([
            {'Item': k, 'Amount': v, 'Type': 'Uses'}
            for k, v in uses.items()
        ])
        
        sources_df = pd.DataFrame([
            {'Item': k, 'Amount': v, 'Type': 'Sources'}
            for k, v in sources.items()
        ])
        
        # Add totals
        uses_df = pd.concat([uses_df, pd.DataFrame([{
            'Item': 'Total Uses', 'Amount': total_uses, 'Type': 'Uses'
        }])])
        
        sources_df = pd.concat([sources_df, pd.DataFrame([{
            'Item': 'Total Sources', 'Amount': sum(sources.values()), 'Type': 'Sources'
        }])])
        
        return pd.concat([sources_df, uses_df])
    
    def set_operating_assumptions(
        self,
        base_revenue: float,
        revenue_growth: list[float],
        ebitda_margin: list[float],
        capex_percent: list[float] | None = None,
        nwc_percent: list[float] | None = None,
        tax_rate: float = 0.25
    ):
        """
        Set operating assumptions for projections.
        
        Args:
            base_revenue: Year 0 revenue
            revenue_growth: Annual revenue growth rates
            ebitda_margin: EBITDA margins by year
            capex_percent: Capex as % of revenue
            nwc_percent: NWC as % of revenue
            tax_rate: Tax rate
        """
        self.base_revenue = base_revenue
        self.projection_years = len(revenue_growth)
        self.revenue_growth = revenue_growth
        self.ebitda_margin = ebitda_margin
        self.capex_percent = capex_percent or [0.03] * self.projection_years
        self.nwc_percent = nwc_percent or [0.08] * self.projection_years
        self.tax_rate = tax_rate
    
    def set_exit(self, exit_multiple: float, exit_year: int | None = None):
        """
        Set exit assumptions.
        
        Args:
            exit_multiple: EV/EBITDA exit multiple
            exit_year: Year of exit (default: last projection year)
        """
        self.exit_multiple = exit_multiple
        self.exit_year = exit_year or self.projection_years
    
    def build_projections(self) -> pd.DataFrame:
        """
        Build operating projections and free cash flow.
        
        Returns:
            DataFrame with projections
        """
        years = list(range(self.projection_years + 1))  # Include Year 0
        
        projections = {
            'Year': years,
            'Revenue': [self.base_revenue],
            'EBITDA': [self.entry_ebitda],
            'EBITDA_Margin': [self.entry_ebitda / self.base_revenue if self.base_revenue else 0],
            'D&A': [0],
            'EBIT': [self.entry_ebitda],
            'Interest': [0],
            'EBT': [self.entry_ebitda],
            'Taxes': [0],
            'Net_Income': [self.entry_ebitda],
            'Capex': [0],
            'NWC_Change': [0],
            'FCF': [0]
        }
        
        prev_revenue = self.base_revenue
        prev_nwc = self.base_revenue * self.nwc_percent[0]
        
        for i in range(self.projection_years):
            # Revenue
            revenue = prev_revenue * (1 + self.revenue_growth[i])
            projections['Revenue'].append(revenue)
            
            # EBITDA
            ebitda = revenue * self.ebitda_margin[i]
            projections['EBITDA'].append(ebitda)
            projections['EBITDA_Margin'].append(self.ebitda_margin[i])
            
            # D&A (assume = capex for simplicity)
            da = revenue * self.capex_percent[i]
            projections['D&A'].append(da)
            
            # EBIT
            ebit = ebitda - da
            projections['EBIT'].append(ebit)
            
            # Interest (placeholder - will be calculated in debt schedule)
            projections['Interest'].append(0)
            
            # EBT
            projections['EBT'].append(ebit)
            
            # Taxes
            taxes = max(0, ebit * self.tax_rate)
            projections['Taxes'].append(taxes)
            
            # Net Income
            net_income = ebit - taxes
            projections['Net_Income'].append(net_income)
            
            # Capex
            capex = revenue * self.capex_percent[i]
            projections['Capex'].append(capex)
            
            # NWC Change
            nwc = revenue * self.nwc_percent[i]
            nwc_change = nwc - prev_nwc
            projections['NWC_Change'].append(nwc_change)
            
            # Free Cash Flow (before debt service)
            fcf = ebitda - taxes - capex - nwc_change
            projections['FCF'].append(fcf)
            
            prev_revenue = revenue
            prev_nwc = nwc
        
        self.projections = pd.DataFrame(projections)
        return self.projections
    
    def build_debt_schedule(self) -> pd.DataFrame:
        """
        Build detailed debt schedule with interest and amortization.
        
        Returns:
            DataFrame with debt schedule
        """
        if self.projections is None:
            self.build_projections()
        
        years = list(range(self.projection_years + 1))
        
        schedule = {'Year': years}
        
        total_interest = [0] * len(years)
        total_debt = [0] * len(years)
        total_amortization = [0] * len(years)
        
        for tranche in self.debt_tranches:
            beginning_balance = [tranche.principal]
            interest = [0]
            pik = [0]
            amortization = [0]
            ending_balance = [tranche.principal]
            
            for i in range(1, len(years)):
                # Beginning balance = prior ending balance
                beg_bal = ending_balance[-1]
                beginning_balance.append(beg_bal)
                
                # Interest
                cash_int = tranche.annual_interest(beg_bal)
                interest.append(cash_int)
                
                # PIK
                pik_int = tranche.annual_pik(beg_bal)
                pik.append(pik_int)
                
                # Amortization
                amort = min(tranche.annual_amortization(), beg_bal)
                amortization.append(amort)
                
                # Ending balance
                end_bal = beg_bal + pik_int - amort
                ending_balance.append(max(0, end_bal))
                
                # Update totals
                total_interest[i] += cash_int
                total_amortization[i] += amort
                total_debt[i] += end_bal
            
            # Store in schedule
            schedule[f'{tranche.name}_Beginning'] = beginning_balance
            schedule[f'{tranche.name}_Interest'] = interest
            schedule[f'{tranche.name}_Amortization'] = amortization
            schedule[f'{tranche.name}_Ending'] = ending_balance
        
        # Add totals
        schedule['Total_Interest'] = total_interest
        schedule['Total_Amortization'] = total_amortization
        schedule['Total_Debt'] = [sum(t.principal for t in self.debt_tranches)] + total_debt[1:]
        
        # Calculate debt/EBITDA
        ebitda = self.projections['EBITDA'].values
        schedule['Debt_to_EBITDA'] = [
            schedule['Total_Debt'][i] / ebitda[i] if ebitda[i] > 0 else 0
            for i in range(len(years))
        ]
        
        self.debt_schedule = pd.DataFrame(schedule)
        
        # Update projections with actual interest
        self.projections['Interest'] = total_interest
        self.projections['EBT'] = self.projections['EBIT'] - self.projections['Interest']
        
        return self.debt_schedule
    
    def calculate_exit_value(self) -> dict[str, float]:
        """
        Calculate exit enterprise value and equity proceeds.
        
        Returns:
            Dictionary with exit metrics
        """
        if self.projections is None or self.debt_schedule is None:
            self.build_debt_schedule()
        
        # Exit EBITDA
        exit_ebitda = self.projections.loc[self.exit_year, 'EBITDA']
        
        # Exit EV
        exit_ev = exit_ebitda * self.exit_multiple
        
        # Remaining debt at exit
        remaining_debt = self.debt_schedule.loc[self.exit_year, 'Total_Debt']
        
        # Equity value at exit
        exit_equity = exit_ev - remaining_debt
        
        return {
            'exit_ebitda': exit_ebitda,
            'exit_ev': exit_ev,
            'exit_multiple': self.exit_multiple,
            'remaining_debt': remaining_debt,
            'exit_equity': exit_equity,
            'exit_year': self.exit_year
        }
    
    def calculate_returns(self) -> dict[str, Any]:
        """
        Calculate IRR, MOIC, and other return metrics.
        
        Returns:
            Dictionary with return metrics
        """
        exit_metrics = self.calculate_exit_value()
        
        # Initial equity investment
        initial_equity = self.equity_contribution + self.rollover_equity
        
        # Exit equity proceeds
        exit_equity = exit_metrics['exit_equity']
        
        # Build cash flow series for IRR
        cash_flows = [-initial_equity]  # Initial investment
        
        # Add any dividends or distributions (from excess FCF after debt service)
        for i in range(1, self.exit_year + 1):
            fcf = self.projections.loc[i, 'FCF']
            interest = self.debt_schedule.loc[i, 'Total_Interest']
            amortization = self.debt_schedule.loc[i, 'Total_Amortization']
            
            # Cash available after debt service
            excess_cash = fcf - interest - amortization
            
            if i == self.exit_year:
                cash_flows.append(exit_equity + max(0, excess_cash))
            else:
                # Assume excess cash used for debt paydown, not distributed
                cash_flows.append(0)
        
        # Calculate IRR
        try:
            irr = np.irr(cash_flows)
        except:
            # Manual IRR calculation if numpy fails
            irr = self._calculate_irr(cash_flows)
        
        # Calculate MOIC
        moic = exit_equity / initial_equity if initial_equity > 0 else 0
        
        # Cash-on-cash return
        cash_return = (exit_equity - initial_equity) / initial_equity if initial_equity > 0 else 0
        
        self.returns = {
            'initial_equity': initial_equity,
            'exit_equity': exit_equity,
            'irr': irr,
            'moic': moic,
            'cash_return': cash_return,
            'holding_period': self.exit_year,
            'cash_flows': cash_flows,
            **exit_metrics
        }
        
        return self.returns
    
    def _calculate_irr(self, cash_flows: list[float], max_iter: int = 1000) -> float:
        """Manual IRR calculation using Newton's method."""
        rate = 0.10  # Initial guess
        
        for _ in range(max_iter):
            npv = sum(cf / (1 + rate) ** i for i, cf in enumerate(cash_flows))
            
            # Derivative
            dnpv = sum(-i * cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows))
            
            if abs(dnpv) < 1e-10:
                break
            
            new_rate = rate - npv / dnpv
            
            if abs(new_rate - rate) < 1e-8:
                return new_rate
            
            rate = new_rate
        
        return rate
    
    def add_waterfall_tier(
        self,
        name: str,
        hurdle_irr: float,
        sponsor_share: float,
        management_share: float
    ):
        """
        Add a tier to the equity waterfall.
        
        Args:
            name: Tier name
            hurdle_irr: IRR hurdle for this tier
            sponsor_share: Sponsor share above hurdle
            management_share: Management share above hurdle
        """
        tier = WaterfallTier(
            name=name,
            hurdle_irr=hurdle_irr,
            sponsor_share=sponsor_share,
            management_share=management_share
        )
        self.waterfall_tiers.append(tier)
        # Sort by hurdle
        self.waterfall_tiers.sort(key=lambda x: x.hurdle_irr)
    
    def calculate_waterfall(
        self,
        management_equity_pct: float = 0.10,
        sponsor_equity_pct: float = 0.90
    ) -> pd.DataFrame:
        """
        Calculate waterfall distribution of proceeds.
        
        Args:
            management_equity_pct: Management's base equity percentage
            sponsor_equity_pct: Sponsor's base equity percentage
            
        Returns:
            DataFrame with waterfall breakdown
        """
        if not self.returns:
            self.calculate_returns()
        
        total_proceeds = self.returns['exit_equity']
        initial_equity = self.returns['initial_equity']
        
        # If no waterfall tiers, use straight split
        if not self.waterfall_tiers:
            return pd.DataFrame([{
                'Tier': 'Straight Split',
                'Sponsor Proceeds': total_proceeds * sponsor_equity_pct,
                'Management Proceeds': total_proceeds * management_equity_pct,
                'Sponsor %': sponsor_equity_pct,
                'Management %': management_equity_pct
            }])
        
        waterfall_results = []
        remaining_proceeds = total_proceeds
        
        # Return of capital first
        sponsor_capital = initial_equity * sponsor_equity_pct
        mgmt_capital = initial_equity * management_equity_pct
        
        sponsor_proceeds = min(sponsor_capital, remaining_proceeds * sponsor_equity_pct)
        mgmt_proceeds = min(mgmt_capital, remaining_proceeds * management_equity_pct)
        
        waterfall_results.append({
            'Tier': 'Return of Capital',
            'Hurdle': '0%',
            'Sponsor Proceeds': sponsor_proceeds,
            'Management Proceeds': mgmt_proceeds,
            'Sponsor %': sponsor_equity_pct,
            'Management %': management_equity_pct
        })
        
        remaining_proceeds -= (sponsor_proceeds + mgmt_proceeds)
        
        # Work through tiers
        prev_hurdle_value = initial_equity
        
        for tier in self.waterfall_tiers:
            if remaining_proceeds <= 0:
                break
            
            # Calculate value needed to achieve hurdle
            hurdle_value = initial_equity * (1 + tier.hurdle_irr) ** self.exit_year
            tier_size = hurdle_value - prev_hurdle_value
            
            # Distribute this tier
            tier_distribution = min(tier_size, remaining_proceeds)
            
            sponsor_share = tier_distribution * tier.sponsor_share
            mgmt_share = tier_distribution * tier.management_share
            
            waterfall_results.append({
                'Tier': tier.name,
                'Hurdle': f'{tier.hurdle_irr:.0%}',
                'Sponsor Proceeds': sponsor_share,
                'Management Proceeds': mgmt_share,
                'Sponsor %': tier.sponsor_share,
                'Management %': tier.management_share
            })
            
            sponsor_proceeds += sponsor_share
            mgmt_proceeds += mgmt_share
            remaining_proceeds -= tier_distribution
            prev_hurdle_value = hurdle_value
        
        # Any remaining above highest hurdle
        if remaining_proceeds > 0 and self.waterfall_tiers:
            top_tier = self.waterfall_tiers[-1]
            waterfall_results.append({
                'Tier': f'Above {top_tier.name}',
                'Hurdle': f'>{top_tier.hurdle_irr:.0%}',
                'Sponsor Proceeds': remaining_proceeds * top_tier.sponsor_share,
                'Management Proceeds': remaining_proceeds * top_tier.management_share,
                'Sponsor %': top_tier.sponsor_share,
                'Management %': top_tier.management_share
            })
        
        df = pd.DataFrame(waterfall_results)
        
        # Add totals
        totals = pd.DataFrame([{
            'Tier': 'TOTAL',
            'Hurdle': '',
            'Sponsor Proceeds': df['Sponsor Proceeds'].sum(),
            'Management Proceeds': df['Management Proceeds'].sum(),
            'Sponsor %': df['Sponsor Proceeds'].sum() / total_proceeds,
            'Management %': df['Management Proceeds'].sum() / total_proceeds
        }])
        
        return pd.concat([df, totals], ignore_index=True)
    
    def generate_summary(self) -> str:
        """
        Generate text summary of LBO model.
        
        Returns:
            Formatted summary string
        """
        if not self.returns:
            self.calculate_returns()
        
        total_debt = sum(t.principal for t in self.debt_tranches)
        
        summary = [
            f"LBO Model Summary - {self.company_name}",
            "=" * 50,
            "",
            "Transaction Summary:",
            f"  Purchase Price: ${self.purchase_price:,.0f}",
            f"  Entry Multiple: {self.entry_multiple:.1f}x EBITDA",
            f"  Entry EBITDA: ${self.entry_ebitda:,.0f}",
            "",
            "Capital Structure:",
            f"  Total Debt: ${total_debt:,.0f} ({total_debt/self.entry_ebitda:.1f}x EBITDA)",
        ]
        
        for tranche in self.debt_tranches:
            summary.append(f"    {tranche.name}: ${tranche.principal:,.0f} @ {tranche.interest_rate:.1%}")
        
        summary.extend([
            f"  Sponsor Equity: ${self.equity_contribution:,.0f}",
            f"  Rollover Equity: ${self.rollover_equity:,.0f}",
            "",
            "Exit Assumptions:",
            f"  Exit Year: {self.exit_year}",
            f"  Exit Multiple: {self.exit_multiple:.1f}x EBITDA",
            f"  Exit EBITDA: ${self.returns['exit_ebitda']:,.0f}",
            f"  Exit EV: ${self.returns['exit_ev']:,.0f}",
            "",
            "Returns:",
            f"  IRR: {self.returns['irr']:.1%}",
            f"  MOIC: {self.returns['moic']:.2f}x",
            f"  Cash Return: {self.returns['cash_return']:.1%}",
        ])
        
        return "\n".join(summary)


# Convenience function for quick LBO analysis
def quick_lbo(
    purchase_price: float,
    ltm_ebitda: float,
    revenue: float,
    revenue_growth: float,
    ebitda_margin: float,
    senior_debt_multiple: float = 4.0,
    sub_debt_multiple: float = 1.5,
    senior_rate: float = 0.06,
    sub_rate: float = 0.10,
    exit_multiple: float | None = None,
    holding_period: int = 5
) -> LBOModel:
    """
    Quick LBO analysis with simplified inputs.
    
    Args:
        purchase_price: Total purchase price
        ltm_ebitda: LTM EBITDA
        revenue: Current revenue
        revenue_growth: Annual revenue growth (constant)
        ebitda_margin: EBITDA margin (constant)
        senior_debt_multiple: Senior debt as multiple of EBITDA
        sub_debt_multiple: Sub debt as multiple of EBITDA
        senior_rate: Senior debt interest rate
        sub_rate: Sub debt interest rate
        exit_multiple: Exit multiple (default = entry)
        holding_period: Holding period in years
        
    Returns:
        Configured LBO model with results
    """
    model = LBOModel("Target")
    
    # Transaction
    model.set_transaction(purchase_price=purchase_price, ltm_ebitda=ltm_ebitda)
    
    # Debt
    model.add_debt_tranche(
        "Senior Debt",
        DebtType.SENIOR,
        multiple=senior_debt_multiple,
        interest_rate=senior_rate,
        amortization_pct=0.05
    )
    
    model.add_debt_tranche(
        "Sub Debt",
        DebtType.SUBORDINATED,
        multiple=sub_debt_multiple,
        interest_rate=sub_rate,
        amortization_pct=0.0
    )
    
    # Calculate equity needed
    model.calculate_sources_uses()
    
    # Operating assumptions
    model.set_operating_assumptions(
        base_revenue=revenue,
        revenue_growth=[revenue_growth] * holding_period,
        ebitda_margin=[ebitda_margin] * holding_period
    )
    
    # Exit
    entry_multiple = purchase_price / ltm_ebitda
    model.set_exit(
        exit_multiple=exit_multiple or entry_multiple,
        exit_year=holding_period
    )
    
    # Build model
    model.build_debt_schedule()
    model.calculate_returns()
    
    return model


# Example usage
if __name__ == "__main__":
    # Create LBO model
    lbo = LBOModel("Acme Corp")
    
    # Set transaction
    lbo.set_transaction(
        entry_multiple=8.0,
        ltm_ebitda=50,  # $50M EBITDA
        transaction_fees_pct=0.02
    )
    
    # Add debt
    lbo.add_debt_tranche(
        "Term Loan B",
        DebtType.TERM_LOAN_B,
        multiple=4.0,  # 4x EBITDA
        interest_rate=0.065,
        amortization_pct=0.01
    )
    
    lbo.add_debt_tranche(
        "Second Lien",
        DebtType.SUBORDINATED,
        multiple=1.5,  # 1.5x EBITDA
        interest_rate=0.095,
        amortization_pct=0.0
    )
    
    # Calculate sources & uses
    su = lbo.calculate_sources_uses()
    print("Sources & Uses:")
    print(su)
    
    # Operating assumptions
    lbo.set_operating_assumptions(
        base_revenue=250,  # $250M revenue
        revenue_growth=[0.08, 0.07, 0.06, 0.05, 0.04],
        ebitda_margin=[0.20, 0.21, 0.22, 0.22, 0.22]
    )
    
    # Exit
    lbo.set_exit(exit_multiple=8.5, exit_year=5)
    
    # Build and calculate
    lbo.build_debt_schedule()
    returns = lbo.calculate_returns()
    
    print("\n" + lbo.generate_summary())
    
    # Waterfall
    lbo.add_waterfall_tier("8% Preferred", 0.08, 0.80, 0.20)
    lbo.add_waterfall_tier("15% Catch-up", 0.15, 0.60, 0.40)
    lbo.add_waterfall_tier("20%+ Carry", 0.20, 0.50, 0.50)
    
    waterfall = lbo.calculate_waterfall()
    print("\nEquity Waterfall:")
    print(waterfall)
