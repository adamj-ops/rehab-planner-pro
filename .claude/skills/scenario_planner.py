"""
Scenario planning module for financial models.
Build and compare multiple scenarios with probability weighting.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

import numpy as np
import pandas as pd


class ScenarioType(Enum):
    """Standard scenario types."""
    BEST = "best"
    BASE = "base"
    WORST = "worst"
    CUSTOM = "custom"


@dataclass
class Scenario:
    """Individual scenario definition."""
    
    name: str
    description: str
    assumptions: dict[str, float]
    probability: float = 0.0
    scenario_type: ScenarioType = ScenarioType.CUSTOM
    results: dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not 0 <= self.probability <= 1:
            raise ValueError("Probability must be between 0 and 1")


@dataclass 
class DecisionNode:
    """Node in a decision tree."""
    
    name: str
    probability: float
    value: float | None = None
    children: list['DecisionNode'] = field(default_factory=list)
    
    def expected_value(self) -> float:
        """Calculate expected value of this node."""
        if self.value is not None:
            return self.value * self.probability
        return sum(child.expected_value() for child in self.children) * self.probability


class ScenarioPlanner:
    """Build and analyze multiple scenarios."""
    
    def __init__(self, base_assumptions: dict[str, float] | None = None):
        """
        Initialize scenario planner.
        
        Args:
            base_assumptions: Default assumptions for base case
        """
        self.base_assumptions = base_assumptions or {}
        self.scenarios: dict[str, Scenario] = {}
        self.model_func: Callable | None = None
        self.comparison_results: pd.DataFrame | None = None
    
    def set_model(self, model_func: Callable[[dict[str, float]], dict[str, float]]):
        """
        Set the model function to evaluate scenarios.
        
        Args:
            model_func: Function taking assumptions dict, returning results dict
        """
        self.model_func = model_func
    
    def add_scenario(
        self,
        name: str,
        assumptions: dict[str, float],
        probability: float = 0.0,
        description: str = "",
        scenario_type: ScenarioType = ScenarioType.CUSTOM
    ):
        """
        Add a scenario to analyze.
        
        Args:
            name: Scenario name
            assumptions: Variable assumptions for this scenario
            probability: Probability weight (0-1)
            description: Description of scenario
            scenario_type: Type of scenario
        """
        # Merge with base assumptions
        full_assumptions = {**self.base_assumptions, **assumptions}
        
        self.scenarios[name] = Scenario(
            name=name,
            description=description,
            assumptions=full_assumptions,
            probability=probability,
            scenario_type=scenario_type
        )
    
    def add_standard_scenarios(
        self,
        variable_ranges: dict[str, tuple[float, float, float]],
        probabilities: tuple[float, float, float] = (0.20, 0.60, 0.20)
    ):
        """
        Add standard best/base/worst scenarios.
        
        Args:
            variable_ranges: Dict of variable -> (worst, base, best) values
            probabilities: Tuple of (worst, base, best) probabilities
        """
        worst_prb, base_prob, best_prob = probabilities
        
        worst_assumptions = {}
        base_assumptions = {}
        best_assumptions = {}
        
        for var, (worst, base, best) in variable_ranges.items():
            worst_assumptions[var] = worst
            base_assumptions[var] = base
            best_assumptions[var] = best
        
        self.add_scenario(
            "Worst Case",
            worst_assumptions,
            probability=worst_prb,
            description="Pessimistic scenario with unfavorable assumptions",
            scenario_type=ScenarioType.WORST
        )
        
        self.add_scenario(
            "Base Case",
            base_assumptions,
            probability=base_prob,
            description="Most likely scenario based on current expectations",
            scenario_type=ScenarioType.BASE
        )
        
        self.add_scenario(
            "Best Case",
            best_assumptions,
            probability=best_prob,
            description="Optimistic scenario with favorable assumptions",
            scenario_type=ScenarioType.BEST
        )
    
    def normalize_probabilities(self):
        """Normalize scenario probabilities to sum to 1."""
        total_prob = sum(s.probability for s in self.scenarios.values())
        
        if total_prob > 0:
            for scenario in self.scenarios.values():
                scenario.probability /= total_prob
    
    def run_scenarios(self) -> pd.DataFrame:
        """
        Run model for all scenarios.
        
        Returns:
            DataFrame comparing scenario results
        """
        if self.model_func is None:
            raise ValueError("Must set model function first")
        
        results = []
        
        for name, scenario in self.scenarios.items():
            # Run model
            outputs = self.model_func(scenario.assumptions)
            scenario.results = outputs
            
            # Compile results
            result = {
                'scenario': name,
                'type': scenario.scenario_type.value,
                'probability': scenario.probability,
                **scenario.assumptions,
                **outputs
            }
            results.append(result)
        
        self.comparison_results = pd.DataFrame(results)
        return self.comparison_results
    
    def calculate_expected_value(self, output_name: str) -> float:
        """
        Calculate probability-weighted expected value.
        
        Args:
            output_name: Name of output variable
            
        Returns:
            Expected value
        """
        if self.comparison_results is None:
            self.run_scenarios()
        
        weighted_sum = sum(
            scenario.results.get(output_name, 0) * scenario.probability
            for scenario in self.scenarios.values()
        )
        
        return weighted_sum
    
    def calculate_variance(self, output_name: str) -> float:
        """
        Calculate probability-weighted variance.
        
        Args:
            output_name: Name of output variable
            
        Returns:
            Variance
        """
        expected = self.calculate_expected_value(output_name)
        
        variance = sum(
            scenario.probability * (scenario.results.get(output_name, 0) - expected) ** 2
            for scenario in self.scenarios.values()
        )
        
        return variance
    
    def get_scenario_comparison(self, output_names: list[str] | None = None) -> pd.DataFrame:
        """
        Get comparison table of scenarios.
        
        Args:
            output_names: Specific outputs to compare (None for all)
            
        Returns:
            Comparison DataFrame
        """
        if self.comparison_results is None:
            self.run_scenarios()
        
        df = self.comparison_results.copy()
        
        # Add weighted values
        if output_names:
            for output in output_names:
                if output in df.columns:
                    df[f'{output}_weighted'] = df[output] * df['probability']
        
        return df
    
    def get_expected_values(self) -> dict[str, float]:
        """
        Get expected values for all outputs.
        
        Returns:
            Dictionary of output -> expected value
        """
        if not self.scenarios:
            return {}
        
        # Get all output names from first scenario
        first_scenario = next(iter(self.scenarios.values()))
        output_names = list(first_scenario.results.keys())
        
        return {
            output: self.calculate_expected_value(output)
            for output in output_names
        }
    
    def upside_downside_analysis(self, output_name: str) -> dict[str, Any]:
        """
        Analyze upside and downside relative to base case.
        
        Args:
            output_name: Output variable to analyze
            
        Returns:
            Dictionary with upside/downside metrics
        """
        if self.comparison_results is None:
            self.run_scenarios()
        
        # Find base case
        base_scenario = None
        for scenario in self.scenarios.values():
            if scenario.scenario_type == ScenarioType.BASE:
                base_scenario = scenario
                break
        
        if base_scenario is None:
            # Use expected value as base
            base_value = self.calculate_expected_value(output_name)
        else:
            base_value = base_scenario.results.get(output_name, 0)
        
        # Calculate upside/downside
        values = [s.results.get(output_name, 0) for s in self.scenarios.values()]
        
        max_value = max(values)
        min_value = min(values)
        
        upside = max_value - base_value
        downside = base_value - min_value
        
        # Asymmetry ratio
        asymmetry = upside / downside if downside != 0 else float('inf')
        
        return {
            'base_value': base_value,
            'max_value': max_value,
            'min_value': min_value,
            'upside': upside,
            'downside': downside,
            'upside_pct': upside / base_value * 100 if base_value != 0 else 0,
            'downside_pct': downside / base_value * 100 if base_value != 0 else 0,
            'range': max_value - min_value,
            'asymmetry_ratio': asymmetry
        }


class DecisionTreeAnalyzer:
    """Build and analyze decision trees."""
    
    def __init__(self, name: str = "Decision Tree"):
        """
        Initialize decision tree analyzer.
        
        Args:
            name: Name of the decision tree
        """
        self.name = name
        self.root: DecisionNode | None = None
        self.nodes: dict[str, DecisionNode] = {}
    
    def add_decision(
        self,
        name: str,
        outcomes: list[tuple[str, float, float]],
        parent: str | None = None
    ):
        """
        Add a decision point with outcomes.
        
        Args:
            name: Name of decision point
            outcomes: List of (outcome_name, probability, value) tuples
            parent: Name of parent node (None for root)
        """
        # Create children nodes
        children = []
        for outcome_name, probability, value in outcomes:
            child = DecisionNode(
                name=outcome_name,
                probability=probability,
                value=value
            )
            children.append(child)
            self.nodes[outcome_name] = child
        
        # Create or update parent
        if parent is None:
            # This is the root
            self.root = DecisionNode(
                name=name,
                probability=1.0,
                children=children
            )
            self.nodes[name] = self.root
        else:
            # Find parent and add children
            parent_node = self.nodes.get(parent)
            if parent_node:
                parent_node.children = children
                parent_node.value = None  # Clear value since it now has children
    
    def calculate_expected_value(self) -> float:
        """
        Calculate expected value of entire tree.
        
        Returns:
            Expected value
        """
        if self.root is None:
            return 0
        return self.root.expected_value()
    
    def get_all_paths(self) -> list[tuple[list[str], float, float]]:
        """
        Get all paths through the tree with probabilities and values.
        
        Returns:
            List of (path, cumulative_probability, value) tuples
        """
        paths = []
        
        def traverse(node: DecisionNode, path: list[str], cum_prob: float):
            current_path = path + [node.name]
            current_prob = cum_prob * node.probability
            
            if node.value is not None or not node.children:
                paths.append((current_path, current_prob, node.value or 0))
            else:
                for child in node.children:
                    traverse(child, current_path, current_prob)
        
        if self.root:
            traverse(self.root, [], 1.0)
        
        return paths
    
    def to_dataframe(self) -> pd.DataFrame:
        """
        Convert tree paths to DataFrame.
        
        Returns:
            DataFrame with all paths and values
        """
        paths = self.get_all_paths()
        
        data = []
        for path, probability, value in paths:
            data.append({
                'path': ' -> '.join(path),
                'probability': probability,
                'value': value,
                'expected_contribution': probability * value
            })
        
        df = pd.DataFrame(data)
        
        # Add total row
        total = pd.DataFrame([{
            'path': 'TOTAL EXPECTED VALUE',
            'probability': 1.0,
            'value': df['expected_contribution'].sum(),
            'expected_contribution': df['expected_contribution'].sum()
        }])
        
        return pd.concat([df, total], ignore_index=True)


class EconomicScenarioGenerator:
    """Generate economic scenarios for stress testing."""
    
    # Pre-defined economic scenarios
    SCENARIOS = {
        'recession': {
            'gdp_growth': -0.02,
            'inflation': 0.01,
            'unemployment': 0.08,
            'interest_rate': 0.02,
            'equity_return': -0.20,
            'credit_spread': 0.04,
            'description': 'Economic recession with declining GDP and rising unemployment'
        },
        'stagflation': {
            'gdp_growth': 0.005,
            'inflation': 0.06,
            'unemployment': 0.07,
            'interest_rate': 0.06,
            'equity_return': -0.10,
            'credit_spread': 0.03,
            'description': 'Stagnant growth with high inflation'
        },
        'expansion': {
            'gdp_growth': 0.035,
            'inflation': 0.025,
            'unemployment': 0.04,
            'interest_rate': 0.04,
            'equity_return': 0.12,
            'credit_spread': 0.015,
            'description': 'Economic expansion with healthy growth'
        },
        'boom': {
            'gdp_growth': 0.05,
            'inflation': 0.035,
            'unemployment': 0.035,
            'interest_rate': 0.05,
            'equity_return': 0.20,
            'credit_spread': 0.01,
            'description': 'Strong economic boom with robust growth'
        },
        'deflation': {
            'gdp_growth': -0.01,
            'inflation': -0.01,
            'unemployment': 0.06,
            'interest_rate': 0.005,
            'equity_return': -0.05,
            'credit_spread': 0.025,
            'description': 'Deflationary environment with falling prices'
        },
        'normalization': {
            'gdp_growth': 0.02,
            'inflation': 0.02,
            'unemployment': 0.05,
            'interest_rate': 0.03,
            'equity_return': 0.08,
            'credit_spread': 0.02,
            'description': 'Return to normal economic conditions'
        }
    }
    
    @classmethod
    def get_scenario(cls, name: str) -> dict[str, Any]:
        """Get a pre-defined economic scenario."""
        if name not in cls.SCENARIOS:
            raise ValueError(f"Unknown scenario: {name}. Available: {list(cls.SCENARIOS.keys())}")
        return cls.SCENARIOS[name].copy()
    
    @classmethod
    def get_all_scenarios(cls) -> dict[str, dict[str, Any]]:
        """Get all pre-defined scenarios."""
        return {k: v.copy() for k, v in cls.SCENARIOS.items()}
    
    @classmethod
    def create_custom_scenario(
        cls,
        gdp_growth: float,
        inflation: float,
        unemployment: float,
        interest_rate: float,
        equity_return: float | None = None,
        credit_spread: float | None = None
    ) -> dict[str, float]:
        """
        Create a custom economic scenario.
        
        Args:
            gdp_growth: Real GDP growth rate
            inflation: Inflation rate
            unemployment: Unemployment rate
            interest_rate: Risk-free interest rate
            equity_return: Expected equity return (estimated if None)
            credit_spread: Credit spread over risk-free (estimated if None)
            
        Returns:
            Custom scenario dictionary
        """
        # Estimate equity return if not provided
        if equity_return is None:
            # Simple model: equity return = risk-free + GDP growth + 5% premium
            equity_return = interest_rate + gdp_growth + 0.05
        
        # Estimate credit spread if not provided
        if credit_spread is None:
            # Higher unemployment = higher spreads
            credit_spread = 0.01 + unemployment * 0.3
        
        return {
            'gdp_growth': gdp_growth,
            'inflation': inflation,
            'unemployment': unemployment,
            'interest_rate': interest_rate,
            'equity_return': equity_return,
            'credit_spread': credit_spread
        }


def create_scenario_matrix(
    variables: dict[str, list[float]],
    model_func: Callable
) -> pd.DataFrame:
    """
    Create full factorial scenario matrix.
    
    Args:
        variables: Dict of variable name -> list of values to test
        model_func: Model function
        
    Returns:
        DataFrame with all scenario combinations
    """
    from itertools import product
    
    var_names = list(variables.keys())
    var_values = list(variables.values())
    
    results = []
    for combination in product(*var_values):
        assumptions = dict(zip(var_names, combination))
        outputs = model_func(assumptions)
        
        results.append({**assumptions, **outputs})
    
    return pd.DataFrame(results)


# Example usage
if __name__ == "__main__":
    # Simple model function
    def investment_model(assumptions: dict) -> dict:
        revenue = assumptions.get('revenue', 1000)
        growth = assumptions.get('growth', 0.05)
        margin = assumptions.get('margin', 0.15)
        multiple = assumptions.get('multiple', 8)
        
        # Project 3 years
        final_revenue = revenue * (1 + growth) ** 3
        ebitda = final_revenue * margin
        exit_value = ebitda * multiple
        
        # Simple ROI calculation
        initial_investment = 500
        roi = (exit_value - initial_investment) / initial_investment
        
        return {
            'exit_value': exit_value,
            'ebitda': ebitda,
            'roi': roi
        }
    
    # Create planner
    planner = ScenarioPlanner()
    planner.set_model(investment_model)
    
    # Add standard scenarios
    planner.add_standard_scenarios({
        'revenue': (800, 1000, 1200),
        'growth': (0.02, 0.05, 0.10),
        'margin': (0.10, 0.15, 0.22),
        'multiple': (6, 8, 11)
    })
    
    # Run scenarios
    results = planner.run_scenarios()
    print("Scenario Comparison:")
    print(results[['scenario', 'probability', 'exit_value', 'roi']])
    
    # Expected value
    ev = planner.calculate_expected_value('exit_value')
    print(f"\nExpected Exit Value: ${ev:,.0f}")
    
    # Upside/downside
    analysis = planner.upside_downside_analysis('exit_value')
    print(f"\nUpside: ${analysis['upside']:,.0f} ({analysis['upside_pct']:.1f}%)")
    print(f"Downside: ${analysis['downside']:,.0f} ({analysis['downside_pct']:.1f}%)")
    
    # Decision tree example
    tree = DecisionTreeAnalyzer("Acquisition Decision")
    
    tree.add_decision(
        "Acquire Company",
        [
            ("Success - High Synergies", 0.3, 2000000),
            ("Success - Low Synergies", 0.4, 800000),
            ("Failure", 0.3, -500000)
        ]
    )
    
    print(f"\nDecision Tree Expected Value: ${tree.calculate_expected_value():,.0f}")
    print("\nAll Paths:")
    print(tree.to_dataframe())
