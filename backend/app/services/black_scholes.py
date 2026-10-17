import math
from typing import Dict, Tuple
import numpy as np
from scipy.stats import norm
from app.schemas.trade import BlackScholesResult, GreeksResult


def black_scholes_price(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: str,
) -> float:
    """Calculate theoretical Black-Scholes price for a European vanilla option.

    Parameters:
    - S: Underlying spot price (S > 0)
    - K: Strike price (K > 0)
    - T: Time to expiry in years (T >= 0)
    - r: Annualized risk-free interest rate (e.g. 0.07 for 7%)
    - sigma: Annualized volatility (e.g. 0.20 for 20%)
    - option_type: 'call' or 'put'
    """
    if S <= 0:
        raise ValueError("Underlying spot price S must be strictly positive.")
    if K <= 0:
        raise ValueError("Strike price K must be strictly positive.")
    if T < 0:
        raise ValueError("Time to expiry T cannot be negative.")
    if r < 0:
        raise ValueError("Risk-free rate r cannot be negative.")
    if sigma < 0:
        raise ValueError("Volatility sigma cannot be negative.")

    opt = option_type.lower().strip()
    if opt not in ("call", "put"):
        raise ValueError("option_type must be either 'call' or 'put'.")

    # Edge case 1: At expiry (T = 0)
    if T <= 0:
        if opt == "call":
            return max(0.0, S - K)
        else:
            return max(0.0, K - S)

    # Edge case 2: Zero volatility (deterministic payoff discounted to present value)
    if sigma <= 1e-12:
        discounted_K = K * math.exp(-r * T)
        if opt == "call":
            return max(0.0, S - discounted_K)
        else:
            return max(0.0, discounted_K - S)

    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T

    if opt == "call":
        price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    else:
        price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

    return max(0.0, float(price))


def calculate_greeks(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: str,
) -> GreeksResult:
    """Calculate Delta, Gamma, Theta, Vega, and Rho with market-standard Indian units.

    Units:
    - Delta: Dimensionless hedge ratio. Call: [0, 1], Put: [-1, 0]
    - Gamma: Per unit move in underlying (dDelta / dS)
    - Theta: P&L decay per calendar day (1/365 of annual theta, negative for long options)
    - Vega: P&L change per 1% (0.01) change in implied volatility
    - Rho: P&L change per 1% (0.01) change in risk-free interest rate
    """
    if S <= 0 or K <= 0:
        raise ValueError("Spot and Strike must be strictly positive.")
    if T < 0 or sigma < 0 or r < 0:
        raise ValueError("T, sigma, and r must be non-negative.")

    opt = option_type.lower().strip()
    if opt not in ("call", "put"):
        raise ValueError("option_type must be either 'call' or 'put'.")

    # Edge cases: At expiry or zero volatility
    if T <= 1e-7 or sigma <= 1e-7:
        if opt == "call":
            if S > K:
                delta = 1.0
            elif math.isclose(S, K, rel_tol=1e-5):
                delta = 0.5
            else:
                delta = 0.0
        else:
            if S < K:
                delta = -1.0
            elif math.isclose(S, K, rel_tol=1e-5):
                delta = -0.5
            else:
                delta = 0.0
        return GreeksResult(delta=delta, gamma=0.0, theta=0.0, vega=0.0, rho=0.0)

    sqrt_T = math.sqrt(T)
    d1 = (math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T)
    d2 = d1 - sigma * sqrt_T

    pdf_d1 = norm.pdf(d1)
    exp_rT = math.exp(-r * T)

    # 1. Delta
    if opt == "call":
        delta = norm.cdf(d1)
    else:
        delta = norm.cdf(d1) - 1.0  # = -norm.cdf(-d1)

    # 2. Gamma (identical for Call and Put)
    gamma = pdf_d1 / (S * sigma * sqrt_T)

    # 3. Vega (per 1% move in volatility = 0.01 * dC/dsigma)
    vega_raw = S * sqrt_T * pdf_d1
    vega = vega_raw * 0.01

    # 4. Theta (per calendar day, divided by 365)
    first_term = -(S * pdf_d1 * sigma) / (2.0 * sqrt_T)
    if opt == "call":
        annual_theta = first_term - (r * K * exp_rT * norm.cdf(d2))
    else:
        annual_theta = first_term + (r * K * exp_rT * norm.cdf(-d2))
    theta = annual_theta / 365.0

    # 5. Rho (per 1% move in interest rate)
    if opt == "call":
        rho = (K * T * exp_rT * norm.cdf(d2)) * 0.01
    else:
        rho = (-K * T * exp_rT * norm.cdf(-d2)) * 0.01

    return GreeksResult(
        delta=round(float(delta), 4),
        gamma=round(float(gamma), 6),
        theta=round(float(theta), 4),
        vega=round(float(vega), 4),
        rho=round(float(rho), 4),
    )


def verify_put_call_parity(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
) -> float:
    """Verify European put-call parity: C - P = S - K * exp(-r*T).

    Returns the absolute pricing difference (should be ~0 within numerical precision).
    """
    call_price = black_scholes_price(S, K, T, r, sigma, "call")
    put_price = black_scholes_price(S, K, T, r, sigma, "put")
    synthetic_forward = S - (K * math.exp(-r * T))
    return abs((call_price - put_price) - synthetic_forward)


def calculate_black_scholes_analytics(
    spot_price: float,
    strike_price: float,
    time_to_expiry_days: float,
    risk_free_rate: float,
    implied_volatility: float,
    option_type: str,
) -> BlackScholesResult:
    """Consolidated Black-Scholes valuation and Greeks wrapper."""
    T_years = max(0.0, time_to_expiry_days / 365.0)
    sigma = implied_volatility / 100.0 if implied_volatility > 1.0 else implied_volatility

    price = black_scholes_price(
        S=spot_price,
        K=strike_price,
        T=T_years,
        r=risk_free_rate,
        sigma=sigma,
        option_type=option_type,
    )

    greeks = calculate_greeks(
        S=spot_price,
        K=strike_price,
        T=T_years,
        r=risk_free_rate,
        sigma=sigma,
        option_type=option_type,
    )

    # Intrinsic & Time value
    if option_type.lower() == "call":
        intrinsic = max(0.0, spot_price - strike_price)
    else:
        intrinsic = max(0.0, strike_price - spot_price)
    time_value = max(0.0, price - intrinsic)

    parity_diff = verify_put_call_parity(
        S=spot_price,
        K=strike_price,
        T=T_years,
        r=risk_free_rate,
        sigma=sigma,
    )

    return BlackScholesResult(
        theoretical_price=round(price, 2),
        intrinsic_value=round(intrinsic, 2),
        time_value=round(time_value, 2),
        greeks=greeks,
        put_call_parity_difference=round(parity_diff, 6),
        underlying_price=round(spot_price, 2),
        strike_price=round(strike_price, 2),
        days_to_expiry=round(time_to_expiry_days, 1),
    )
