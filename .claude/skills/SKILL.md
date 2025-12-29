---
name: creating-financial-models
description: This skill provides an advanced financial modeling suite with DCF analysis, sensitivity testing, Monte Carlo simulations, scenario planning, LBO analysis, and real estate investment modeling for investment decisions
---

# Financial Modeling Suite

A comprehensive financial modeling toolkit for investment analysis, valuation, and risk assessment using industry-standard methodologies.

## Scripts Included

| Module | Description |
|--------|-------------|
| `dcf_model.py` | Complete DCF valuation engine with WACC calculation and terminal value |
| `sensitivity_analysis.py` | Sensitivity testing framework with tornado charts and breakeven analysis |
| `monte_carlo.py` | Probabilistic simulation with correlated variables and risk metrics |
| `scenario_planner.py` | Scenario planning with decision trees and economic stress testing |
| `lbo_model.py` | Leveraged buyout analysis with debt schedules and waterfall distributions |
| `real_estate_dcf.py` | Property-level DCF for multifamily and commercial real estate |

---

## 1. Discounted Cash Flow (DCF) Analysis

**Module:** `dcf_model.py`

Build complete DCF models with multiple growth scenarios, calculate terminal values using perpetuity growth and exit multiple methods, determine WACC, and generate enterprise and equity valuations.

### Key Features
- Historical financial data input
- Projection engine with customizable assumptions
- WACC calculation using CAPM
- Terminal value (growth or exit multiple)
- Sensitivity analysis on key drivers

### Example Usage
```python
from dcf_model import DCFModel

model = DCFModel("TechCorp")
model.set_historical_financials(revenue=[800, 900, 1000], ebitda=[160, 189, 220], ...)
model.set_assumptions(projection_years=5, revenue_growth=[0.15, 0.12, 0.10, 0.08, 0.06])
model.calculate_wacc(risk_free_rate=0.04, beta=1.2, market_premium=0.07, ...)
model.calculate_enterprise_value()
print(model.generate_summary())
```

---

## 2. Sensitivity Analysis

**Module:** `sensitivity_analysis.py`

Test key assumptions impact on valuation with one-way and two-way sensitivity tables, tornado charts, and breakeven analysis.

### Key Features
- One-way sensitivity with percentage ranges
- Two-way data tables (Excel-style)
- Tornado analysis for driver ranking
- Scenario comparison tables
- Breakeven search algorithm

### Example Usage
```python
from sensitivity_analysis import SensitivityAnalyzer, create_data_table

analyzer = SensitivityAnalyzer(model)
tornado = analyzer.tornado_analysis(variables, output_func)
data_table = create_data_table(
    row_variable=("WACC", [0.08, 0.10, 0.12], wacc_update),
    col_variable=("Growth", [0.02, 0.03, 0.04], growth_update),
    output_func=model.calculate_value
)
```

---

## 3. Monte Carlo Simulation

**Module:** `monte_carlo.py`

Run thousands of scenarios with probability distributions to quantify uncertainty and generate confidence intervals.

### Key Features
- Multiple distribution types: normal, lognormal, triangular, uniform, PERT
- Correlated variable sampling via Cholesky decomposition
- Statistical summary (mean, median, percentiles, skewness)
- Confidence intervals (90%, 95%)
- Value at Risk (VaR) and Conditional VaR
- Sensitivity contribution analysis
- Probability of target achievement

### Distribution Types
| Type | Parameters | Use Case |
|------|------------|----------|
| Normal | mean, std | Symmetric uncertainty |
| Lognormal | mean, std | Positive values, right-skewed |
| Triangular | low, mode, high | Expert estimates |
| Uniform | low, high | Equal probability range |
| PERT | low, mode, high, lambda | Project estimates (weighted toward mode) |

### Example Usage
```python
from monte_carlo import MonteCarloSimulator

sim = MonteCarloSimulator(seed=42)
sim.add_normal('revenue', mean=1000, std=100)
sim.add_triangular('margin', low=0.15, mode=0.20, high=0.28)
sim.add_pert('growth', low=0.05, mode=0.10, high=0.20)

# Set correlations
sim.set_correlations({('growth', 'margin'): 0.3})

# Run simulation
results = sim.run_simulation(dcf_model, n_iterations=5000)
print(sim.generate_report('enterprise_value'))
print(f"Probability of EV > $15M: {sim.probability_of_target('enterprise_value', 15000):.1%}")
```

---

## 4. Scenario Planning

**Module:** `scenario_planner.py`

Build and compare multiple scenarios with probability weighting, decision tree analysis, and economic stress testing.

### Key Features
- Best/base/worst case scenarios
- Custom scenario definitions
- Probability-weighted expected values
- Decision tree analysis with expected value calculation
- Pre-built economic scenarios (recession, boom, stagflation, etc.)
- Upside/downside analysis

### Pre-Built Economic Scenarios
- `recession`: -2% GDP, 8% unemployment
- `stagflation`: 0.5% GDP, 6% inflation
- `expansion`: 3.5% GDP, 4% unemployment
- `boom`: 5% GDP, 3.5% unemployment
- `deflation`: -1% GDP, -1% inflation
- `normalization`: 2% GDP, 2% inflation

### Example Usage
```python
from scenario_planner import ScenarioPlanner, DecisionTreeAnalyzer

planner = ScenarioPlanner()
planner.set_model(investment_model)
planner.add_standard_scenarios({
    'revenue': (800, 1000, 1200),
    'growth': (0.02, 0.05, 0.10),
    'margin': (0.10, 0.15, 0.22)
})
results = planner.run_scenarios()
ev = planner.calculate_expected_value('exit_value')

# Decision tree
tree = DecisionTreeAnalyzer("Acquisition Decision")
tree.add_decision("Acquire", [
    ("High Synergies", 0.3, 2_000_000),
    ("Low Synergies", 0.4, 800_000),
    ("Failure", 0.3, -500_000)
])
print(f"Expected Value: ${tree.calculate_expected_value():,.0f}")
```

---

## 5. LBO Model

**Module:** `lbo_model.py`

Leveraged buyout analysis with sources & uses, debt schedules, returns calculation, and waterfall distributions.

### Key Features
- Sources & uses of funds
- Multiple debt tranches (senior, sub, mezz, PIK)
- Amortization schedules
- IRR, MOIC, cash return calculations
- Equity waterfall with carry tiers
- Management promote calculations

### Debt Types Supported
- Senior secured
- Term Loan A/B
- Second lien / Subordinated
- Mezzanine
- PIK (payment-in-kind)
- Revolving credit

### Example Usage
```python
from lbo_model import LBOModel, DebtType, quick_lbo

# Full model
lbo = LBOModel("Acme Corp")
lbo.set_transaction(entry_multiple=8.0, ltm_ebitda=50)
lbo.add_debt_tranche("Term Loan B", DebtType.TERM_LOAN_B, multiple=4.0, interest_rate=0.065)
lbo.add_debt_tranche("Second Lien", DebtType.SUBORDINATED, multiple=1.5, interest_rate=0.095)
lbo.calculate_sources_uses()
lbo.set_operating_assumptions(base_revenue=250, revenue_growth=[0.08, 0.07, 0.06, 0.05, 0.04])
lbo.set_exit(exit_multiple=8.5, exit_year=5)
lbo.build_debt_schedule()
returns = lbo.calculate_returns()

# Waterfall
lbo.add_waterfall_tier("8% Preferred", 0.08, 0.80, 0.20)
lbo.add_waterfall_tier("20%+ Carry", 0.20, 0.50, 0.50)
waterfall = lbo.calculate_waterfall()

# Quick analysis
model = quick_lbo(
    purchase_price=400, ltm_ebitda=50, revenue=250,
    revenue_growth=0.06, ebitda_margin=0.20
)
```

---

## 6. Real Estate DCF

**Module:** `real_estate_dcf.py`

Property-level DCF analysis specialized for multifamily and commercial real estate investments.

### Key Features
- Unit mix modeling (studio, 1BR, 2BR, etc.)
- Detailed operating proforma
- GPR → Vacancy → EGI → NOI waterfall
- Debt service with I/O periods
- CapEx reserves by component
- Exit cap rate valuation
- Refinancing analysis
- Cap rate sensitivity tables

### Property Types Supported
- Multifamily
- Office
- Retail
- Industrial
- Self-storage
- Mixed-use

### Key Metrics Calculated
- IRR (levered)
- Equity Multiple
- Cash-on-Cash Return
- Going-in Cap Rate
- DSCR (Debt Service Coverage Ratio)
- LTV (Loan-to-Value)

### Example Usage
```python
from real_estate_dcf import RealEstateDCF, UnitMix, PropertyType, quick_multifamily_analysis

# Full model
model = RealEstateDCF("Brooklyn Center Apartments", PropertyType.MULTIFAMILY)
model.set_property_details(
    units=90, total_sqft=72000,
    unit_mix=[
        UnitMix("Studio", 10, 500, 950),
        UnitMix("1BR", 45, 750, 1150),
        UnitMix("2BR", 30, 950, 1400),
        UnitMix("3BR", 5, 1200, 1700),
    ]
)
model.set_acquisition(purchase_price=8_100_000, capex_at_acquisition=200_000)
model.set_financing(ltv=0.75, interest_rate=0.0575, io_period_years=2)
model.set_operating_assumptions(hold_period=5, rent_growth=[0.04, 0.035, 0.03, 0.03, 0.025])
model.set_exit(exit_cap_rate=0.06)
model.build_proforma()
returns = model.calculate_returns()
print(model.generate_summary())

# Quick analysis
model = quick_multifamily_analysis(
    purchase_price=8_100_000, units=90, avg_monthly_rent=1200,
    ltv=0.75, exit_cap_rate=0.06
)
```

---

## Input Requirements Summary

### For DCF Analysis
- Historical financial statements (3-5 years)
- Revenue growth assumptions
- Operating margin projections
- Capital expenditure forecasts
- Working capital requirements
- Terminal growth rate or exit multiple
- Discount rate components (risk-free rate, beta, market premium)

### For Monte Carlo Simulation
- Probability distributions for uncertain variables
- Correlation assumptions between variables
- Number of iterations (typically 1,000-10,000)

### For LBO Analysis
- LTM EBITDA and purchase multiple
- Debt structure (tranches, rates, amortization)
- Operating projections
- Exit assumptions

### For Real Estate DCF
- Property details (units, SF, unit mix)
- Acquisition price and financing terms
- Rent roll / market rents
- Operating expenses
- CapEx reserves
- Exit cap rate

---

## Best Practices Applied

### Modeling Standards
- Consistent formatting and structure
- Clear assumption documentation
- Separation of inputs, calculations, outputs
- Error checking and validation

### Valuation Principles
- Use multiple valuation methods for triangulation
- Apply appropriate risk adjustments
- Consider market comparables
- Validate against trading multiples
- Document key assumptions clearly

### Risk Management
- Identify and quantify key risks
- Use probability-weighted scenarios
- Stress test extreme cases
- Consider correlation effects
- Provide confidence intervals

---

## Limitations and Disclaimers

- Models are only as good as their assumptions
- Past performance doesn't guarantee future results
- Market conditions can change rapidly
- Regulatory and tax changes may impact results
- Professional judgment required for interpretation
- **Not a substitute for professional financial advice**
