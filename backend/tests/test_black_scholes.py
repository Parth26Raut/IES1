import math
import pytest
from app.services.black_scholes import (
    black_scholes_price,
    calculate_black_scholes_analytics,
    calculate_greeks,
    verify_put_call_parity,
)


def test_known_black_scholes_benchmark():
    # Hull classic textbook benchmark:
    # S = 100, K = 100, T = 1.0 year, r = 0.05 (5%), sigma = 0.20 (20%)
    # Call price is approximately 10.4506
    # Put price is approximately 5.5735
    call = black_scholes_price(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="call")
    put = black_scholes_price(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="put")

    assert pytest.approx(call, abs=0.01) == 10.45
    assert pytest.approx(put, abs=0.01) == 5.57


def test_put_call_parity():
    # Parity: C - P = S - K * exp(-r*T)
    S = 24000.0
    K = 23800.0
    T = 30.0 / 365.0
    r = 0.07
    sigma = 0.16

    parity_err = verify_put_call_parity(S=S, K=K, T=T, r=r, sigma=sigma)
    assert parity_err < 1e-6

    # Test with ATM and OTM
    for test_k in [23000.0, 24000.0, 25000.0]:
        err = verify_put_call_parity(S=S, K=test_k, T=T, r=r, sigma=sigma)
        assert err < 1e-6


def test_greeks_properties():
    S = 24000.0
    K = 24000.0
    T = 15.0 / 365.0
    r = 0.07
    sigma = 0.15

    call_greeks = calculate_greeks(S, K, T, r, sigma, "call")
    put_greeks = calculate_greeks(S, K, T, r, sigma, "put")

    # Call Delta in [0, 1]
    assert 0.0 <= call_greeks.delta <= 1.0
    # Put Delta in [-1, 0]
    assert -1.0 <= put_greeks.delta <= 0.0
    # Delta relation: Call Delta - Put Delta ~= 1.0
    assert pytest.approx(call_greeks.delta - put_greeks.delta, abs=0.001) == 1.0

    # Gamma is positive and equal for call and put
    assert call_greeks.gamma > 0.0
    assert pytest.approx(call_greeks.gamma, rel=1e-3) == put_greeks.gamma

    # Vega is positive and equal for call and put
    assert call_greeks.vega > 0.0
    assert pytest.approx(call_greeks.vega, rel=1e-3) == put_greeks.vega

    # Theta is negative for long options (calendar day decay)
    assert call_greeks.theta < 0.0
    assert put_greeks.theta < 0.0


def test_edge_cases():
    S = 24000.0
    K = 23500.0

    # T = 0 (At expiry)
    call_t0 = black_scholes_price(S=S, K=K, T=0.0, r=0.07, sigma=0.20, option_type="call")
    assert call_t0 == 500.0

    put_t0 = black_scholes_price(S=S, K=K, T=0.0, r=0.07, sigma=0.20, option_type="put")
    assert put_t0 == 0.0

    # sigma = 0
    call_sig0 = black_scholes_price(S=S, K=K, T=0.1, r=0.07, sigma=0.0, option_type="call")
    discounted_k = K * math.exp(-0.07 * 0.1)
    assert pytest.approx(call_sig0, abs=0.01) == max(0.0, S - discounted_k)

    # Deep ITM / Deep OTM
    deep_itm_call = black_scholes_price(S=30000.0, K=15000.0, T=0.1, r=0.07, sigma=0.2, option_type="call")
    assert deep_itm_call > 14900.0

    deep_otm_call = black_scholes_price(S=10000.0, K=30000.0, T=0.05, r=0.07, sigma=0.1, option_type="call")
    assert pytest.approx(deep_otm_call, abs=1e-4) == 0.0


def test_no_arbitrage_bounds():
    S = 24000.0
    K = 24500.0
    T = 0.25
    r = 0.06
    sigma = 0.22

    c = black_scholes_price(S, K, T, r, sigma, "call")
    p = black_scholes_price(S, K, T, r, sigma, "put")
    disc_k = K * math.exp(-r * T)

    # Call upper bound is spot, lower bound is max(0, S - K*exp(-rT))
    assert 0.0 <= c <= S
    assert c >= max(0.0, S - disc_k)

    # Put upper bound is discounted strike, lower bound is max(0, K*exp(-rT) - S)
    assert 0.0 <= p <= disc_k
    assert p >= max(0.0, disc_k - S)


def test_invalid_inputs():
    with pytest.raises(ValueError, match="strictly positive"):
        black_scholes_price(S=-100, K=100, T=1, r=0.05, sigma=0.2, option_type="call")

    with pytest.raises(ValueError, match="strictly positive"):
        black_scholes_price(S=100, K=-100, T=1, r=0.05, sigma=0.2, option_type="call")

    with pytest.raises(ValueError, match="option_type"):
        black_scholes_price(S=100, K=100, T=1, r=0.05, sigma=0.2, option_type="strangle")
