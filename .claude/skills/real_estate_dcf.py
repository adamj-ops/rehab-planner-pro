"""
Real Estate DCF model for property-level investment analysis.
Specialized for multifamily, commercial, and mixed-use properties.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import numpy as np
import pandas as pd


class PropertyType(Enum):
    """Types of real estate properties."""
    MULTIFAMILY = "multifamily"
    OFFICE = "office"
    RETAIL = "retail"
    INDUSTRIAL = "industrial"
    MIXED_USE = "mixed_use"
    SELF_STORAGE = "self_storage"
    HOTEL = "hotel"


class LeaseType(Enum):
    """Types of lease structures."""
    GROSS = "gross"
    MODIFIED_GROSS = "modified_gross"
    TRIPLE_NET = "triple_net"
    ABSOLUTE_NET = "absolute_net"


@dataclass
class UnitMix:
    """Unit mix for multifamily properties."""
    
    unit_type: str  # e.g., "1BR", "2BR", "Studio"
    unit_count: int
    avg_sqft: float
    market_rent: float  # Monthly rent per unit
    current_rent: float | None = None  # If below market
    vacancy_rate: float = 0.05
    
    @property
    def total_sqft(self) -> float:
        return self.unit_count * self.avg_sqft
    
    @property
    def annual_potential_rent(self) -> float:
        return self.unit_count * self.market_rent * 12
    
    @property
    def effective_rent(self) -> float:
        rent = self.current_rent or self.market_rent
        return rent * (1 - self.vacancy_rate)


@dataclass
class Tenant:
    """Commercial tenant for office/retail properties."""
    
    name: str
    sqft: float
    annual_rent_psf: float
    lease_start: int  # Year
    lease_end: int
    annual_escalation: float = 0.03
    expense_reimbursement: float = 0.0  # % of expenses reimbursed
    tenant_improvement: float = 0.0  # TI allowance per sqft
    leasing_commission: float = 0.0  # LC as % of lease value


@dataclass
class CapExReserve:
    """Capital expenditure reserve item."""
    
    item: str
    cost_per_unit: float  # Or per sqft
    replacement_years: int
    
    def annual_reserve(self, units_or_sqft: float) -> float:
        """Calculate annual reserve contribution."""
        total_cost = self.cost_per_unit * units_or_sqft
        return total_cost / self.replacement_years


class RealEstateDCF:
    """Complete real estate DCF model."""
    
    def __init__(
        self,
        property_name: str = "Property",
        property_type: PropertyType = PropertyType.MULTIFAMILY
    ):
        """
        Initialize real estate DCF model.
        
        Args:
            property_name: Name of property
            property_type: Type of property
        """
        self.property_name = property_name
        self.property_type = property_type
        
        # Property details
        self.units: int = 0
        self.total_sqft: float = 0
        self.year_built: int = 0
        self.unit_mix: list[UnitMix] = []
        self.tenants: list[Tenant] = []
        
        # Acquisition
        self.purchase_price: float = 0
        self.closing_costs_pct: float = 0.02
        self.capex_at_acquisition: float = 0
        
        # Financing
        self.loan_amount: float = 0
        self.interest_rate: float = 0.05
        self.amortization_years: int = 30
        self.loan_term_years: int = 10
        self.io_period_years: int = 0  # Interest-only period
        
        # Operating assumptions
        self.hold_period: int = 5
        self.rent_growth: list[float] = []
        self.expense_growth: list[float] = []
        self.vacancy_rate: float = 0.05
        self.bad_debt_rate: float = 0.01
        self.management_fee_pct: float = 0.03
        
        # Expenses
        self.operating_expenses: dict[str, float] = {}
        self.capex_reserves: list[CapExReserve] = []
        
        # Exit
        self.exit_cap_rate: float = 0.055
        self.disposition_costs_pct: float = 0.02
        
        # Results
        self.proforma: pd.DataFrame | None = None
        self.cash_flows: pd.DataFrame | None = None
        self.returns: dict[str, Any] = {}
    
    def set_property_details(
        self,
        units: int,
        total_sqft: float,
        year_built: int | None = None,
        unit_mix: list[UnitMix] | None = None
    ):
        """
        Set property physical details.
        
        Args:
            units: Number of units
            total_sqft: Total rentable square feet
            year_built: Year property was built
            unit_mix: Detailed unit mix (for multifamily)
        """
        self.units = units
        self.total_sqft = total_sqft
        self.year_built = year_built or 2000
        
        if unit_mix:
            self.unit_mix = unit_mix
    
    def set_acquisition(
        self,
        purchase_price: float,
        closing_costs_pct: float = 0.02,
        capex_at_acquisition: float = 0
    ):
        """
        Set acquisition parameters.
        
        Args:
            purchase_price: Purchase price
            closing_costs_pct: Closing costs as % of price
            capex_at_acquisition: Day 1 capital improvements
        """
        self.purchase_price = purchase_price
        self.closing_costs_pct = closing_costs_pct
        self.capex_at_acquisition = capex_at_acquisition
    
    def set_financing(
        self,
        ltv: float | None = None,
        loan_amount: float | None = None,
        interest_rate: float = 0.055,
        amortization_years: int = 30,
        loan_term_years: int = 10,
        io_period_years: int = 0
    ):
        """
        Set financing parameters.
        
        Args:
            ltv: Loan-to-value ratio (alternative to loan_amount)
            loan_amount: Loan amount (alternative to ltv)
            interest_rate: Annual interest rate
            amortization_years: Amortization period
            loan_term_years: Loan term
            io_period_years: Interest-only period
        """
        if ltv:
            self.loan_amount = self.purchase_price * ltv
        elif loan_amount:
            self.loan_amount = loan_amount
        
        self.interest_rate = interest_rate
        self.amortization_years = amortization_years
        self.loan_term_years = loan_term_years
        self.io_period_years = io_period_years
    
    def set_operating_assumptions(
        self,
        hold_period: int = 5,
        rent_growth: float | list[float] = 0.03,
        expense_growth: float | list[float] = 0.025,
        vacancy_rate: float = 0.05,
        bad_debt_rate: float = 0.01,
        management_fee_pct: float = 0.03
    ):
        """
        Set operating assumptions.
        
        Args:
            hold_period: Investment holding period
            rent_growth: Annual rent growth (single rate or list)
            expense_growth: Annual expense growth
            vacancy_rate: Stabilized vacancy rate
            bad_debt_rate: Bad debt / collection loss
            management_fee_pct: Management fee as % of EGI
        """
        self.hold_period = hold_period
        
        if isinstance(rent_growth, float):
            self.rent_growth = [rent_growth] * hold_period
        else:
            self.rent_growth = rent_growth
        
        if isinstance(expense_growth, float):
            self.expense_growth = [expense_growth] * hold_period
        else:
            self.expense_growth = expense_growth
        
        self.vacancy_rate = vacancy_rate
        self.bad_debt_rate = bad_debt_rate
        self.management_fee_pct = management_fee_pct
    
    def set_operating_expenses(self, expenses: dict[str, float]):
        """
        Set Year 1 operating expenses.
        
        Args:
            expenses: Dictionary of expense category -> annual amount
        """
        self.operating_expenses = expenses
    
    def set_default_expenses_multifamily(self, per_unit: bool = True):
        """
        Set default operating expenses for multifamily.
        
        Args:
            per_unit: If True, expenses are per unit; else total
        """
        defaults = {
            'Real Estate Taxes': 1200,
            'Insurance': 400,
            'Utilities': 800,
            'Repairs & Maintenance': 600,
            'Contract Services': 300,
            'Turnover Costs': 250,
            'Administrative': 200,
            'Marketing': 100,
            'Payroll': 500,
        }
        
        if per_unit:
            self.operating_expenses = {k: v * self.units for k, v in defaults.items()}
        else:
            self.operating_expenses = defaults
    
    def add_capex_reserve(self, item: str, cost_per_unit: float, replacement_years: int):
        """Add a capital expenditure reserve item."""
        self.capex_reserves.append(CapExReserve(item, cost_per_unit, replacement_years))
    
    def set_default_capex_reserves(self):
        """Set default capex reserves for multifamily."""
        defaults = [
            ('Roof', 8000, 20),
            ('HVAC', 5000, 15),
            ('Appliances', 1500, 10),
            ('Flooring', 2000, 7),
            ('Water Heaters', 800, 10),
            ('Exterior Paint', 1500, 7),
            ('Parking Lot', 500, 15),
        ]
        
        for item, cost, years in defaults:
            self.add_capex_reserve(item, cost, years)
    
    def set_exit(self, exit_cap_rate: float, disposition_costs_pct: float = 0.02):
        """
        Set exit assumptions.
        
        Args:
            exit_cap_rate: Exit capitalization rate
            disposition_costs_pct: Selling costs as % of sale price
        """
        self.exit_cap_rate = exit_cap_rate
        self.disposition_costs_pct = disposition_costs_pct
    
    def calculate_gpr(self, year: int = 0) -> float:
        """
        Calculate Gross Potential Rent for a given year.
        
        Args:
            year: Projection year (0 = Year 1)
            
        Returns:
            Annual GPR
        """
        if self.unit_mix:
            base_gpr = sum(um.annual_potential_rent for um in self.unit_mix)
        else:
            # Estimate from price per unit
            avg_rent = (self.purchase_price / self.units) * 0.01  # 1% rule estimate
            base_gpr = self.units * avg_rent * 12
        
        # Apply rent growth
        for i in range(year):
            base_gpr *= (1 + self.rent_growth[i])
        
        return base_gpr
    
    def calculate_noi(self, year: int = 0) -> dict[str, float]:
        """
        Calculate Net Operating Income for a given year.
        
        Args:
            year: Projection year (0 = Year 1)
            
        Returns:
            Dictionary with income/expense breakdown
        """
        # Gross Potential Rent
        gpr = self.calculate_gpr(year)
        
        # Vacancy & Credit Loss
        vacancy_loss = gpr * self.vacancy_rate
        bad_debt = gpr * self.bad_debt_rate
        
        # Effective Gross Income
        egi = gpr - vacancy_loss - bad_debt
        
        # Operating Expenses (with growth)
        total_opex = sum(self.operating_expenses.values())
        for i in range(year):
            total_opex *= (1 + self.expense_growth[i])
        
        # Management Fee
        mgmt_fee = egi * self.management_fee_pct
        
        # Total Expenses
        total_expenses = total_opex + mgmt_fee
        
        # NOI
        noi = egi - total_expenses
        
        return {
            'gpr': gpr,
            'vacancy_loss': vacancy_loss,
            'bad_debt': bad_debt,
            'egi': egi,
            'operating_expenses': total_opex,
            'management_fee': mgmt_fee,
            'total_expenses': total_expenses,
            'noi': noi
        }
    
    def calculate_debt_service(self, outstanding_balance: float, year: int) -> dict[str, float]:
        """
        Calculate annual debt service.
        
        Args:
            outstanding_balance: Current loan balance
            year: Current year (for IO period check)
            
        Returns:
            Dictionary with debt service components
        """
        if self.loan_amount == 0:
            return {'interest': 0, 'principal': 0, 'total': 0, 'ending_balance': 0}
        
        monthly_rate = self.interest_rate / 12
        
        if year <= self.io_period_years:
            # Interest only
            annual_interest = outstanding_balance * self.interest_rate
            annual_principal = 0
        else:
            # Amortizing payment calculation
            remaining_amort_months = (self.amortization_years * 12) - ((year - self.io_period_years - 1) * 12)
            
            if remaining_amort_months > 0 and monthly_rate > 0:
                # Monthly payment on remaining balance
                monthly_payment = outstanding_balance * (
                    monthly_rate * (1 + monthly_rate) ** remaining_amort_months
                ) / ((1 + monthly_rate) ** remaining_amort_months - 1)
                
                # Calculate interest and principal split
                # Simplified: use average balance for interest
                annual_interest = outstanding_balance * self.interest_rate * 0.95  # Approximation
                annual_payment = monthly_payment * 12
                annual_principal = annual_payment - annual_interest
                annual_principal = max(0, annual_principal)
            else:
                annual_interest = 0
                annual_principal = outstanding_balance
        
        ending_balance = max(0, outstanding_balance - annual_principal)
        
        return {
            'interest': annual_interest,
            'principal': annual_principal,
            'total': annual_interest + annual_principal,
            'ending_balance': ending_balance
        }
    
    def calculate_capex_reserves(self) -> float:
        """Calculate total annual capex reserves."""
        return sum(
            reserve.annual_reserve(self.units)
            for reserve in self.capex_reserves
        )
    
    def build_proforma(self) -> pd.DataFrame:
        """
        Build full proforma projection.
        
        Returns:
            DataFrame with annual projections
        """
        data = []
        loan_balance = self.loan_amount
        
        for year in range(self.hold_period + 1):
            if year == 0:
                # Year 0 - Acquisition
                row = {
                    'Year': 0,
                    'GPR': 0,
                    'Vacancy_Loss': 0,
                    'Bad_Debt': 0,
                    'EGI': 0,
                    'Operating_Expenses': 0,
                    'Management_Fee': 0,
                    'NOI': 0,
                    'Capex_Reserves': 0,
                    'NCF': 0,
                    'Debt_Service': 0,
                    'Interest': 0,
                    'Principal': 0,
                    'BTCF': 0,
                    'Loan_Balance': self.loan_amount
                }
            else:
                # Operating years
                noi_data = self.calculate_noi(year - 1)  # year-1 because calculate_noi is 0-indexed
                ds_data = self.calculate_debt_service(loan_balance, year)
                capex = self.calculate_capex_reserves()
                
                ncf = noi_data['noi'] - capex
                btcf = ncf - ds_data['total']
                
                loan_balance = ds_data['ending_balance']
                
                row = {
                    'Year': year,
                    'GPR': noi_data['gpr'],
                    'Vacancy_Loss': noi_data['vacancy_loss'],
                    'Bad_Debt': noi_data['bad_debt'],
                    'EGI': noi_data['egi'],
                    'Operating_Expenses': noi_data['operating_expenses'],
                    'Management_Fee': noi_data['management_fee'],
                    'NOI': noi_data['noi'],
                    'Capex_Reserves': capex,
                    'NCF': ncf,
                    'Debt_Service': ds_data['total'],
                    'Interest': ds_data['interest'],
                    'Principal': ds_data['principal'],
                    'BTCF': btcf,
                    'Loan_Balance': loan_balance
                }
            
            data.append(row)
        
        self.proforma = pd.DataFrame(data)
        return self.proforma
    
    def calculate_exit_value(self) -> dict[str, float]:
        """
        Calculate sale proceeds at exit.
        
        Returns:
            Dictionary with exit metrics
        """
        if self.proforma is None:
            self.build_proforma()
        
        # Exit NOI (Year after hold period)
        exit_noi_data = self.calculate_noi(self.hold_period)
        exit_noi = exit_noi_data['noi']
        
        # Sale price based on cap rate
        sale_price = exit_noi / self.exit_cap_rate
        
        # Disposition costs
        disposition_costs = sale_price * self.disposition_costs_pct
        
        # Net sale proceeds
        net_sale = sale_price - disposition_costs
        
        # Loan payoff
        loan_payoff = self.proforma.loc[self.hold_period, 'Loan_Balance']
        
        # Equity proceeds
        equity_proceeds = net_sale - loan_payoff
        
        return {
            'exit_noi': exit_noi,
            'sale_price': sale_price,
            'exit_cap_rate': self.exit_cap_rate,
            'disposition_costs': disposition_costs,
            'net_sale_proceeds': net_sale,
            'loan_payoff': loan_payoff,
            'equity_proceeds': equity_proceeds
        }
    
    def calculate_returns(self) -> dict[str, Any]:
        """
        Calculate investment returns.
        
        Returns:
            Dictionary with return metrics
        """
        if self.proforma is None:
            self.build_proforma()
        
        exit_data = self.calculate_exit_value()
        
        # Initial equity investment
        total_cost = (
            self.purchase_price +
            self.purchase_price * self.closing_costs_pct +
            self.capex_at_acquisition
        )
        initial_equity = total_cost - self.loan_amount
        
        # Build cash flow series
        cash_flows = [-initial_equity]
        for year in range(1, self.hold_period + 1):
            if year == self.hold_period:
                # Final year includes sale proceeds
                annual_cf = self.proforma.loc[year, 'BTCF'] + exit_data['equity_proceeds']
            else:
                annual_cf = self.proforma.loc[year, 'BTCF']
            cash_flows.append(annual_cf)
        
        # IRR
        try:
            irr = np.irr(cash_flows)
        except:
            irr = self._calculate_irr(cash_flows)
        
        # Equity Multiple
        total_distributions = sum(cf for cf in cash_flows[1:])
        equity_multiple = (total_distributions + initial_equity) / initial_equity
        
        # Cash-on-Cash Return (Year 1)
        year1_btcf = self.proforma.loc[1, 'BTCF']
        coc_return = year1_btcf / initial_equity
        
        # Average Cash-on-Cash
        avg_btcf = self.proforma.loc[1:self.hold_period, 'BTCF'].mean()
        avg_coc = avg_btcf / initial_equity
        
        # Cap Rate metrics
        year1_noi = self.proforma.loc[1, 'NOI']
        going_in_cap = year1_noi / self.purchase_price
        
        # Debt metrics
        year1_ds = self.proforma.loc[1, 'Debt_Service']
        dscr = year1_noi / year1_ds if year1_ds > 0 else float('inf')
        
        self.returns = {
            'initial_equity': initial_equity,
            'total_cost': total_cost,
            'irr': irr,
            'equity_multiple': equity_multiple,
            'coc_year1': coc_return,
            'coc_average': avg_coc,
            'going_in_cap': going_in_cap,
            'exit_cap': self.exit_cap_rate,
            'dscr': dscr,
            'ltv': self.loan_amount / self.purchase_price,
            'cash_flows': cash_flows,
            **exit_data
        }
        
        return self.returns
    
    def _calculate_irr(self, cash_flows: list[float], max_iter: int = 1000) -> float:
        """Manual IRR calculation."""
        rate = 0.10
        
        for _ in range(max_iter):
            npv = sum(cf / (1 + rate) ** i for i, cf in enumerate(cash_flows))
            dnpv = sum(-i * cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows))
            
            if abs(dnpv) < 1e-10:
                break
            
            new_rate = rate - npv / dnpv
            
            if abs(new_rate - rate) < 1e-8:
                return new_rate
            
            rate = new_rate
        
        return rate
    
    def sensitivity_cap_rate(self, cap_rates: list[float]) -> pd.DataFrame:
        """
        Sensitivity analysis on exit cap rate.
        
        Args:
            cap_rates: List of cap rates to test
            
        Returns:
            DataFrame with sensitivity results
        """
        original_cap = self.exit_cap_rate
        results = []
        
        for cap in cap_rates:
            self.exit_cap_rate = cap
            returns = self.calculate_returns()
            
            results.append({
                'Exit_Cap_Rate': cap,
                'IRR': returns['irr'],
                'Equity_Multiple': returns['equity_multiple'],
                'Sale_Price': returns['sale_price'],
                'Equity_Proceeds': returns['equity_proceeds']
            })
        
        self.exit_cap_rate = original_cap
        return pd.DataFrame(results)
    
    def refinance_analysis(
        self,
        refi_year: int,
        new_ltv: float,
        new_rate: float,
        new_amort: int = 30
    ) -> dict[str, Any]:
        """
        Analyze refinancing scenario.
        
        Args:
            refi_year: Year to refinance
            new_ltv: New LTV based on refi value
            new_rate: New interest rate
            new_amort: New amortization period
            
        Returns:
            Refinancing analysis results
        """
        if self.proforma is None:
            self.build_proforma()
        
        # Value at refinance (based on NOI and assumed cap rate)
        refi_noi = self.proforma.loc[refi_year, 'NOI'] if refi_year <= self.hold_period else self.calculate_noi(refi_year - 1)['noi']
        assumed_cap = self.going_in_cap if hasattr(self, 'going_in_cap') else 0.06
        refi_value = refi_noi / assumed_cap
        
        # New loan amount
        new_loan = refi_value * new_ltv
        
        # Existing balance
        existing_balance = self.proforma.loc[refi_year, 'Loan_Balance']
        
        # Cash out
        cash_out = new_loan - existing_balance
        
        # New debt service
        monthly_rate = new_rate / 12
        periods = new_amort * 12
        new_monthly_payment = new_loan * (
            monthly_rate * (1 + monthly_rate) ** periods
        ) / ((1 + monthly_rate) ** periods - 1)
        new_annual_ds = new_monthly_payment * 12
        
        # Current debt service
        current_ds = self.proforma.loc[refi_year, 'Debt_Service']
        
        return {
            'refi_year': refi_year,
            'property_value': refi_value,
            'new_loan_amount': new_loan,
            'existing_balance': existing_balance,
            'cash_out_proceeds': cash_out,
            'new_interest_rate': new_rate,
            'new_annual_debt_service': new_annual_ds,
            'current_debt_service': current_ds,
            'ds_change': new_annual_ds - current_ds,
            'new_ltv': new_ltv,
            'new_dscr': refi_noi / new_annual_ds if new_annual_ds > 0 else float('inf')
        }
    
    def generate_summary(self) -> str:
        """
        Generate text summary of analysis.
        
        Returns:
            Formatted summary string
        """
        if not self.returns:
            self.calculate_returns()
        
        summary = [
            f"Real Estate Investment Analysis - {self.property_name}",
            "=" * 55,
            "",
            "Property Overview:",
            f"  Property Type: {self.property_type.value.title()}",
            f"  Units: {self.units}",
            f"  Square Feet: {self.total_sqft:,.0f}",
            "",
            "Acquisition:",
            f"  Purchase Price: ${self.purchase_price:,.0f}",
            f"  Price per Unit: ${self.purchase_price/self.units:,.0f}" if self.units > 0 else "",
            f"  Price per SF: ${self.purchase_price/self.total_sqft:.2f}" if self.total_sqft > 0 else "",
            f"  Going-In Cap Rate: {self.returns['going_in_cap']:.2%}",
            "",
            "Financing:",
            f"  Loan Amount: ${self.loan_amount:,.0f}",
            f"  LTV: {self.returns['ltv']:.1%}",
            f"  Interest Rate: {self.interest_rate:.2%}",
            f"  DSCR (Year 1): {self.returns['dscr']:.2f}x",
            "",
            "Returns:",
            f"  IRR: {self.returns['irr']:.1%}",
            f"  Equity Multiple: {self.returns['equity_multiple']:.2f}x",
            f"  Cash-on-Cash (Year 1): {self.returns['coc_year1']:.1%}",
            f"  Average Cash-on-Cash: {self.returns['coc_average']:.1%}",
            "",
            "Exit (Year {0}):".format(self.hold_period),
            f"  Exit Cap Rate: {self.exit_cap_rate:.2%}",
            f"  Sale Price: ${self.returns['sale_price']:,.0f}",
            f"  Equity Proceeds: ${self.returns['equity_proceeds']:,.0f}",
        ]
        
        return "\n".join(summary)


# Convenience function for quick multifamily analysis
def quick_multifamily_analysis(
    purchase_price: float,
    units: int,
    avg_monthly_rent: float,
    ltv: float = 0.75,
    interest_rate: float = 0.055,
    hold_period: int = 5,
    rent_growth: float = 0.03,
    exit_cap_rate: float = 0.055,
    vacancy_rate: float = 0.05,
    expense_ratio: float = 0.45
) -> RealEstateDCF:
    """
    Quick multifamily investment analysis.
    
    Args:
        purchase_price: Purchase price
        units: Number of units
        avg_monthly_rent: Average monthly rent per unit
        ltv: Loan-to-value ratio
        interest_rate: Loan interest rate
        hold_period: Investment hold period
        rent_growth: Annual rent growth
        exit_cap_rate: Exit cap rate
        vacancy_rate: Vacancy rate
        expense_ratio: Operating expenses as % of EGI
        
    Returns:
        Configured RealEstateDCF model with results
    """
    model = RealEstateDCF("Multifamily Property", PropertyType.MULTIFAMILY)
    
    # Property details
    model.set_property_details(
        units=units,
        total_sqft=units * 900,  # Assume 900 SF average
        unit_mix=[UnitMix("Average", units, 900, avg_monthly_rent)]
    )
    
    # Acquisition
    model.set_acquisition(purchase_price)
    
    # Financing
    model.set_financing(ltv=ltv, interest_rate=interest_rate)
    
    # Operating assumptions
    model.set_operating_assumptions(
        hold_period=hold_period,
        rent_growth=rent_growth,
        vacancy_rate=vacancy_rate
    )
    
    # Expenses based on ratio
    annual_gpr = units * avg_monthly_rent * 12
    annual_egi = annual_gpr * (1 - vacancy_rate)
    total_expenses = annual_egi * expense_ratio
    model.set_operating_expenses({'Total Operating Expenses': total_expenses})
    
    # Exit
    model.set_exit(exit_cap_rate)
    
    # Calculate
    model.build_proforma()
    model.calculate_returns()
    
    return model


# Example usage
if __name__ == "__main__":
    # Create model for a 90-unit apartment complex
    model = RealEstateDCF("Brooklyn Center Apartments", PropertyType.MULTIFAMILY)
    
    # Property details
    model.set_property_details(
        units=90,
        total_sqft=72000,  # ~800 SF average
        year_built=1985,
        unit_mix=[
            UnitMix("Studio", 10, 500, 950),
            UnitMix("1BR", 45, 750, 1150),
            UnitMix("2BR", 30, 950, 1400),
            UnitMix("3BR", 5, 1200, 1700),
        ]
    )
    
    # Acquisition
    model.set_acquisition(
        purchase_price=8_100_000,
        closing_costs_pct=0.02,
        capex_at_acquisition=200_000  # Day 1 improvements
    )
    
    # Financing
    model.set_financing(
        ltv=0.75,
        interest_rate=0.0575,
        amortization_years=30,
        io_period_years=2
    )
    
    # Operating
    model.set_operating_assumptions(
        hold_period=5,
        rent_growth=[0.04, 0.035, 0.03, 0.03, 0.025],
        expense_growth=0.025,
        vacancy_rate=0.05,
        management_fee_pct=0.04
    )
    
    # Expenses
    model.set_default_expenses_multifamily()
    model.set_default_capex_reserves()
    
    # Exit
    model.set_exit(exit_cap_rate=0.06)
    
    # Build and analyze
    proforma = model.build_proforma()
    returns = model.calculate_returns()
    
    print(model.generate_summary())
    
    print("\n\nAnnual Proforma:")
    print(proforma[['Year', 'NOI', 'BTCF', 'Loan_Balance']].to_string(index=False))
    
    # Sensitivity
    print("\n\nCap Rate Sensitivity:")
    sensitivity = model.sensitivity_cap_rate([0.05, 0.055, 0.06, 0.065, 0.07])
    print(sensitivity.to_string(index=False))
