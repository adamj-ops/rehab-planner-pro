"""
Monte Carlo simulation module for financial models.
Runs probabilistic scenarios to quantify uncertainty and risk.
"""

from dataclasses import dataclass
from typing import Any, Callable

import numpy as np
import pandas as pd
from scipy import stats


@dataclass
class DistributionSpec:
    """Specification for a probability distribution."""
    
    name: str
    dist_type: str  # 'normal', 'lognormal', 'triangular', 'uniform', 'pert'
    params: dict[str, float]
    
    def sample(self, n: int, random_state: np.random.Generator | None = None) -> np.ndarray:
        """
        Generate random samples from the distribution.
        
        Args:
            n: Number of samples
            random_state: Random number generator for reproducibility
            
        Returns:
            Array of samples
        """
        rng = random_state or np.random.default_rng()
        
        if self.dist_type == 'normal':
            return rng.normal(
                self.params['mean'],
                self.params['std'],
                n
            )
        
        elif self.dist_type == 'lognormal':
            # Convert mean/std to lognormal parameters
            mean = self.params['mean']
            std = self.params['std']
            sigma = np.sqrt(np.log(1 + (std/mean)**2))
            mu = np.log(mean) - sigma**2/2
            return rng.lognormal(mu, sigma, n)
        
        elif self.dist_type == 'triangular':
            return rng.triangular(
                self.params['low'],
                self.params['mode'],
                self.params['high'],
                n
            )
        
        elif self.dist_type == 'uniform':
            return rng.uniform(
                self.params['low'],
                self.params['high'],
                n
            )
        
        elif self.dist_type == 'pert':
            # PERT distribution (modified beta)
            low = self.params['low']
            mode = self.params['mode']
            high = self.params['high']
            lambd = self.params.get('lambda', 4)
            
            # Calculate alpha and beta for beta distribution
            mean = (low + lambd * mode + high) / (lambd + 2)
            
            if mode == mean:
                alpha = beta_param = lambd / 2 + 1
            else:
                alpha = ((mean - low) * (2 * mode - low - high)) / ((mode - mean) * (high - low))
                beta_param = alpha * (high - mean) / (mean - low)
            
            # Sample from beta and scale
            samples = rng.beta(alpha, beta_param, n)
            return low + samples * (high - low)
        
        else:
            raise ValueError(f"Unknown distribution type: {self.dist_type}")


class CorrelationMatrix:
    """Manage correlations between variables for correlated sampling."""
    
    def __init__(self, variables: list[str]):
        """
        Initialize correlation matrix.
        
        Args:
            variables: List of variable names
        """
        self.variables = variables
        self.n_vars = len(variables)
        # Default to identity matrix (no correlation)
        self.matrix = np.eye(self.n_vars)
        self.var_index = {var: i for i, var in enumerate(variables)}
    
    def set_correlation(self, var1: str, var2: str, correlation: float):
        """
        Set correlation between two variables.
        
        Args:
            var1: First variable name
            var2: Second variable name
            correlation: Correlation coefficient (-1 to 1)
        """
        if not -1 <= correlation <= 1:
            raise ValueError("Correlation must be between -1 and 1")
        
        i = self.var_index[var1]
        j = self.var_index[var2]
        self.matrix[i, j] = correlation
        self.matrix[j, i] = correlation
    
    def get_cholesky(self) -> np.ndarray:
        """
        Get Cholesky decomposition for correlated sampling.
        
        Returns:
            Lower triangular Cholesky matrix
        """
        # Ensure matrix is positive definite
        try:
            return np.linalg.cholesky(self.matrix)
        except np.linalg.LinAlgError:
            # If not positive definite, find nearest valid matrix
            eigenvalues, eigenvectors = np.linalg.eigh(self.matrix)
            eigenvalues = np.maximum(eigenvalues, 1e-8)
            fixed_matrix = eigenvectors @ np.diag(eigenvalues) @ eigenvectors.T
            return np.linalg.cholesky(fixed_matrix)


class MonteCarloSimulator:
    """Run Monte Carlo simulations on financial models."""
    
    def __init__(self, seed: int | None = None):
        """
        Initialize simulator.
        
        Args:
            seed: Random seed for reproducibility
        """
        self.rng = np.random.default_rng(seed)
        self.distributions: dict[str, DistributionSpec] = {}
        self.correlations: CorrelationMatrix | None = None
        self.results: pd.DataFrame | None = None
        self.output_results: dict[str, np.ndarray] = {}
    
    def add_variable(
        self,
        name: str,
        dist_type: str,
        **params
    ):
        """
        Add a variable with its probability distribution.
        
        Args:
            name: Variable name
            dist_type: Distribution type
            **params: Distribution parameters
        """
        self.distributions[name] = DistributionSpec(
            name=name,
            dist_type=dist_type,
            params=params
        )
    
    def add_normal(self, name: str, mean: float, std: float):
        """Add normally distributed variable."""
        self.add_variable(name, 'normal', mean=mean, std=std)
    
    def add_triangular(self, name: str, low: float, mode: float, high: float):
        """Add triangular distributed variable."""
        self.add_variable(name, 'triangular', low=low, mode=mode, high=high)
    
    def add_uniform(self, name: str, low: float, high: float):
        """Add uniformly distributed variable."""
        self.add_variable(name, 'uniform', low=low, high=high)
    
    def add_pert(self, name: str, low: float, mode: float, high: float, lambd: float = 4):
        """Add PERT distributed variable (common in project finance)."""
        self.add_variable(name, 'pert', low=low, mode=mode, high=high, lambd=lambd)
    
    def add_lognormal(self, name: str, mean: float, std: float):
        """Add lognormally distributed variable (always positive)."""
        self.add_variable(name, 'lognormal', mean=mean, std=std)
    
    def set_correlations(self, correlations: dict[tuple[str, str], float]):
        """
        Set correlations between variables.
        
        Args:
            correlations: Dictionary of (var1, var2) -> correlation
        """
        variables = list(self.distributions.keys())
        self.correlations = CorrelationMatrix(variables)
        
        for (var1, var2), corr in correlations.items():
            self.correlations.set_correlation(var1, var2, corr)
    
    def _generate_correlated_samples(self, n: int) -> dict[str, np.ndarray]:
        """
        Generate correlated random samples using Cholesky decomposition.
        
        Args:
            n: Number of samples
            
        Returns:
            Dictionary of variable name -> samples
        """
        variables = list(self.distributions.keys())
        n_vars = len(variables)
        
        # Generate independent standard normal samples
        independent_samples = self.rng.standard_normal((n, n_vars))
        
        # Apply Cholesky transformation
        cholesky = self.correlations.get_cholesky()
        correlated_normal = independent_samples @ cholesky.T
        
        # Transform to uniform via CDF
        uniform_samples = stats.norm.cdf(correlated_normal)
        
        # Transform to target distributions via inverse CDF
        samples = {}
        for i, var_name in enumerate(variables):
            dist = self.distributions[var_name]
            
            if dist.dist_type == 'normal':
                samples[var_name] = stats.norm.ppf(
                    uniform_samples[:, i],
                    dist.params['mean'],
                    dist.params['std']
                )
            elif dist.dist_type == 'triangular':
                samples[var_name] = stats.triang.ppf(
                    uniform_samples[:, i],
                    c=(dist.params['mode'] - dist.params['low']) / 
                      (dist.params['high'] - dist.params['low']),
                    loc=dist.params['low'],
                    scale=dist.params['high'] - dist.params['low']
                )
            elif dist.dist_type == 'uniform':
                samples[var_name] = stats.uniform.ppf(
                    uniform_samples[:, i],
                    dist.params['low'],
                    dist.params['high'] - dist.params['low']
                )
            else:
                # For other distributions, use independent sampling
                samples[var_name] = dist.sample(n, self.rng)
        
        return samples
    
    def run_simulation(
        self,
        model_func: Callable[[dict[str, float]], dict[str, float]],
        n_iterations: int = 10000,
        output_names: list[str] | None = None
    ) -> pd.DataFrame:
        """
        Run Monte Carlo simulation.
        
        Args:
            model_func: Function that takes input dict and returns output dict
            n_iterations: Number of iterations
            output_names: Names of outputs to track (if None, tracks all)
            
        Returns:
            DataFrame with all simulation results
        """
        # Generate samples
        if self.correlations:
            samples = self._generate_correlated_samples(n_iterations)
        else:
            samples = {
                name: dist.sample(n_iterations, self.rng)
                for name, dist in self.distributions.items()
            }
        
        # Run model for each iteration
        results = []
        for i in range(n_iterations):
            inputs = {name: samples[name][i] for name in self.distributions}
            outputs = model_func(inputs)
            
            result = {'iteration': i, **inputs, **outputs}
            results.append(result)
        
        self.results = pd.DataFrame(results)
        
        # Store output arrays for quick access
        if output_names:
            for name in output_names:
                if name in self.results.columns:
                    self.output_results[name] = self.results[name].values
        else:
            # Auto-detect outputs (columns not in inputs)
            input_names = set(self.distributions.keys()) | {'iteration'}
            for col in self.results.columns:
                if col not in input_names:
                    self.output_results[col] = self.results[col].values
        
        return self.results
    
    def get_statistics(self, output_name: str) -> dict[str, float]:
        """
        Calculate summary statistics for an output variable.
        
        Args:
            output_name: Name of output variable
            
        Returns:
            Dictionary of statistics
        """
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        values = self.results[output_name]
        
        return {
            'mean': values.mean(),
            'median': values.median(),
            'std': values.std(),
            'min': values.min(),
            'max': values.max(),
            'p5': values.quantile(0.05),
            'p10': values.quantile(0.10),
            'p25': values.quantile(0.25),
            'p75': values.quantile(0.75),
            'p90': values.quantile(0.90),
            'p95': values.quantile(0.95),
            'skewness': values.skew(),
            'kurtosis': values.kurtosis()
        }
    
    def get_confidence_interval(
        self,
        output_name: str,
        confidence: float = 0.95
    ) -> tuple[float, float]:
        """
        Get confidence interval for output.
        
        Args:
            output_name: Name of output variable
            confidence: Confidence level (0-1)
            
        Returns:
            Tuple of (lower, upper) bounds
        """
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        values = self.results[output_name]
        alpha = 1 - confidence
        
        lower = values.quantile(alpha / 2)
        upper = values.quantile(1 - alpha / 2)
        
        return (lower, upper)
    
    def calculate_var(
        self,
        output_name: str,
        confidence: float = 0.95,
        initial_value: float | None = None
    ) -> dict[str, float]:
        """
        Calculate Value at Risk metrics.
        
        Args:
            output_name: Name of output variable
            confidence: Confidence level
            initial_value: Initial investment for return-based VaR
            
        Returns:
            Dictionary with VaR metrics
        """
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        values = self.results[output_name]
        
        # Absolute VaR (loss at confidence level)
        var_absolute = values.quantile(1 - confidence)
        
        # If initial value provided, calculate percentage VaR
        if initial_value:
            returns = (values - initial_value) / initial_value
            var_pct = returns.quantile(1 - confidence)
            
            # Expected Shortfall (CVaR) - average loss beyond VaR
            losses_beyond_var = returns[returns <= var_pct]
            cvar = losses_beyond_var.mean() if len(losses_beyond_var) > 0 else var_pct
        else:
            var_pct = None
            cvar = None
        
        return {
            'var_absolute': var_absolute,
            'var_percentage': var_pct,
            'cvar': cvar,
            'confidence': confidence
        }
    
    def probability_of_target(
        self,
        output_name: str,
        target: float,
        comparison: str = 'above'
    ) -> float:
        """
        Calculate probability of achieving target.
        
        Args:
            output_name: Name of output variable
            target: Target value
            comparison: 'above' or 'below'
            
        Returns:
            Probability as decimal
        """
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        values = self.results[output_name]
        
        if comparison == 'above':
            return (values >= target).mean()
        else:
            return (values <= target).mean()
    
    def sensitivity_contribution(self, output_name: str) -> pd.DataFrame:
        """
        Calculate contribution of each input to output variance.
        
        Args:
            output_name: Name of output variable
            
        Returns:
            DataFrame with sensitivity metrics
        """
        if self.results is None:
            raise ValueError("Must run simulation first")
        
        output = self.results[output_name]
        
        contributions = []
        for input_name in self.distributions.keys():
            input_values = self.results[input_name]
            
            # Correlation with output
            correlation = output.corr(input_values)
            
            # Rank correlation (Spearman)
            rank_correlation = output.rank().corr(input_values.rank())
            
            # Contribution to variance (squared correlation)
            variance_contribution = correlation ** 2
            
            contributions.append({
                'variable': input_name,
                'correlation': correlation,
                'rank_correlation': rank_correlation,
                'variance_contribution': variance_contribution
            })
        
        df = pd.DataFrame(contributions)
        
        # Normalize variance contributions
        total_var_contrib = df['variance_contribution'].sum()
        if total_var_contrib > 0:
            df['variance_pct'] = df['variance_contribution'] / total_var_contrib * 100
        else:
            df['variance_pct'] = 0
        
        return df.sort_values('variance_contribution', ascending=False)
    
    def generate_report(self, output_name: str) -> str:
        """
        Generate text report of simulation results.
        
        Args:
            output_name: Name of output to report on
            
        Returns:
            Formatted report string
        """
        if self.results is None:
            return "No simulation results available."
        
        stats = self.get_statistics(output_name)
        ci_90 = self.get_confidence_interval(output_name, 0.90)
        ci_95 = self.get_confidence_interval(output_name, 0.95)
        
        n_iterations = len(self.results)
        
        report = [
            f"Monte Carlo Simulation Report: {output_name}",
            "=" * 50,
            f"Iterations: {n_iterations:,}",
            "",
            "Summary Statistics:",
            f"  Mean:     ${stats['mean']:,.0f}",
            f"  Median:   ${stats['median']:,.0f}",
            f"  Std Dev:  ${stats['std']:,.0f}",
            f"  Min:      ${stats['min']:,.0f}",
            f"  Max:      ${stats['max']:,.0f}",
            "",
            "Percentiles:",
            f"  5th:      ${stats['p5']:,.0f}",
            f"  25th:     ${stats['p25']:,.0f}",
            f"  75th:     ${stats['p75']:,.0f}",
            f"  95th:     ${stats['p95']:,.0f}",
            "",
            "Confidence Intervals:",
            f"  90% CI:   ${ci_90[0]:,.0f} - ${ci_90[1]:,.0f}",
            f"  95% CI:   ${ci_95[0]:,.0f} - ${ci_95[1]:,.0f}",
            "",
            "Distribution Shape:",
            f"  Skewness: {stats['skewness']:.2f}",
            f"  Kurtosis: {stats['kurtosis']:.2f}",
        ]
        
        return "\n".join(report)


# Convenience function for quick simulations
def quick_monte_carlo(
    model_func: Callable,
    variables: dict[str, tuple[str, dict]],
    n_iterations: int = 5000,
    seed: int | None = None
) -> MonteCarloSimulator:
    """
    Quick setup and run of Monte Carlo simulation.
    
    Args:
        model_func: Model function taking dict of inputs
        variables: Dict of variable_name -> (dist_type, params)
        n_iterations: Number of iterations
        seed: Random seed
        
    Returns:
        Configured and run simulator
    """
    sim = MonteCarloSimulator(seed=seed)
    
    for name, (dist_type, params) in variables.items():
        sim.add_variable(name, dist_type, **params)
    
    sim.run_simulation(model_func, n_iterations)
    
    return sim


# Example usage
if __name__ == "__main__":
    # Simple DCF model function
    def dcf_model(inputs: dict[str, float]) -> dict[str, float]:
        revenue = inputs['revenue']
        margin = inputs['margin']
        growth = inputs['growth']
        wacc = inputs['wacc']
        terminal_growth = inputs['terminal_growth']
        
        # Project 5 years of FCF
        fcf = []
        current_revenue = revenue
        for year in range(5):
            current_revenue *= (1 + growth)
            fcf.append(current_revenue * margin * 0.75)  # After-tax FCF
        
        # Discount FCFs
        pv_fcf = sum(cf / (1 + wacc) ** (i + 1) for i, cf in enumerate(fcf))
        
        # Terminal value
        terminal_fcf = fcf[-1] * (1 + terminal_growth)
        terminal_value = terminal_fcf / (wacc - terminal_growth)
        pv_terminal = terminal_value / (1 + wacc) ** 5
        
        enterprise_value = pv_fcf + pv_terminal
        
        return {
            'enterprise_value': enterprise_value,
            'pv_fcf': pv_fcf,
            'pv_terminal': pv_terminal
        }
    
    # Set up simulation
    sim = MonteCarloSimulator(seed=42)
    
    # Add variables with distributions
    sim.add_normal('revenue', mean=1000, std=100)
    sim.add_triangular('margin', low=0.15, mode=0.20, high=0.28)
    sim.add_pert('growth', low=0.05, mode=0.10, high=0.20)
    sim.add_triangular('wacc', low=0.08, mode=0.10, high=0.14)
    sim.add_uniform('terminal_growth', low=0.02, high=0.04)
    
    # Set correlations (growth and margin often correlated)
    sim.set_correlations({
        ('growth', 'margin'): 0.3,
        ('wacc', 'growth'): -0.2  # Higher growth = lower perceived risk
    })
    
    # Run simulation
    results = sim.run_simulation(dcf_model, n_iterations=5000)
    
    # Print report
    print(sim.generate_report('enterprise_value'))
    
    # Probability of achieving target
    target = 15000
    prob = sim.probability_of_target('enterprise_value', target)
    print(f"\nProbability of EV > ${target:,}: {prob:.1%}")
    
    # Sensitivity contribution
    print("\nInput Sensitivity:")
    sensitivity = sim.sensitivity_contribution('enterprise_value')
    print(sensitivity[['variable', 'correlation', 'variance_pct']])
