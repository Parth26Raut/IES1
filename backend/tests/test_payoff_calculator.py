import pytest
from app.schemas.trade import TradeInput
from app.services.payoff_calculator import (
    calculate_payoff,
    calculate_position_summary,
    calculate_scenarios,
)


def test_long_call_payoff():
    # K=24000, p=100, q=50, costs=50
    # ITM
    res_itm = calculate_payoff("long_call", spot_at_expiry=24200, strike=24000, premium=100, quantity=50, costs=50)
    assert res_itm.gross_pnl == 5000.0
    assert res_itm.net_pnl == 4950.0
    assert res_itm.is_profit is True

    # ATM
    res_atm = calculate_payoff("long_call", spot_at_expiry=24000, strike=24000, premium=100, quantity=50, costs=50)
    assert res_atm.gross_pnl == -5000.0
    assert res_atm.net_pnl == -5050.0
    assert res_atm.is_profit is False

    # OTM
    res_otm = calculate_payoff("long_call", spot_at_expiry=23800, strike=24000, premium=100, quantity=50, costs=50)
    assert res_otm.gross_pnl == -5000.0
    assert res_otm.net_pnl == -5050.0
    assert res_otm.is_profit is False


def test_long_put_payoff():
    # K=24000, p=100, q=50, costs=50
    # ITM
    res_itm = calculate_payoff("long_put", spot_at_expiry=23800, strike=24000, premium=100, quantity=50, costs=50)
    assert res_itm.gross_pnl == 5000.0
    assert res_itm.net_pnl == 4950.0
    assert res_itm.is_profit is True

    # ATM
    res_atm = calculate_payoff("long_put", spot_at_expiry=24000, strike=24000, premium=100, quantity=50, costs=50)
    assert res_atm.gross_pnl == -5000.0
    assert res_atm.net_pnl == -5050.0

    # OTM
    res_otm = calculate_payoff("long_put", spot_at_expiry=24200, strike=24000, premium=100, quantity=50, costs=50)
    assert res_otm.gross_pnl == -5000.0
    assert res_otm.net_pnl == -5050.0


def test_short_call_payoff():
    # K=24000, p=100, q=50, costs=50
    # ITM
    res_itm = calculate_payoff("short_call", spot_at_expiry=24200, strike=24000, premium=100, quantity=50, costs=50)
    assert res_itm.gross_pnl == -5000.0
    assert res_itm.net_pnl == -5050.0
    assert res_itm.is_profit is False

    # ATM
    res_atm = calculate_payoff("short_call", spot_at_expiry=24000, strike=24000, premium=100, quantity=50, costs=50)
    assert res_atm.gross_pnl == 5000.0
    assert res_atm.net_pnl == 4950.0
    assert res_atm.is_profit is True

    # OTM
    res_otm = calculate_payoff("short_call", spot_at_expiry=23800, strike=24000, premium=100, quantity=50, costs=50)
    assert res_otm.gross_pnl == 5000.0
    assert res_otm.net_pnl == 4950.0
    assert res_otm.is_profit is True


def test_short_put_payoff():
    # K=24000, p=100, q=50, costs=50
    # ITM
    res_itm = calculate_payoff("short_put", spot_at_expiry=23800, strike=24000, premium=100, quantity=50, costs=50)
    assert res_itm.gross_pnl == -5000.0
    assert res_itm.net_pnl == -5050.0

    # ATM
    res_atm = calculate_payoff("short_put", spot_at_expiry=24000, strike=24000, premium=100, quantity=50, costs=50)
    assert res_atm.gross_pnl == 5000.0
    assert res_atm.net_pnl == 4950.0

    # OTM
    res_otm = calculate_payoff("short_put", spot_at_expiry=24200, strike=24000, premium=100, quantity=50, costs=50)
    assert res_otm.gross_pnl == 5000.0
    assert res_otm.net_pnl == 4950.0


def test_breakeven_and_limits():
    # Long call
    lc = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=2,  # quantity = 100
        expiry_days=7,
        brokerage=40,
        transaction_charges=20,
        available_capital=100000,
    )
    s_lc = calculate_position_summary(lc)
    assert s_lc.break_even == 24100.0
    assert s_lc.total_quantity == 100
    assert s_lc.max_loss == 10060.0  # 100 * 100 + 60
    assert s_lc.max_gain is None
    assert s_lc.capital_at_risk_pct == 10.06

    # Long put
    lp = TradeInput(
        underlying="NIFTY",
        position_type="long_put",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=1,
        expiry_days=7,
    )
    s_lp = calculate_position_summary(lp)
    assert s_lp.break_even == 23900.0
    assert s_lp.max_loss == 5000.0
    assert s_lp.max_gain == (24000 - 100) * 50  # 1,195,000

    # Short call unlimited loss
    sc = TradeInput(
        underlying="NIFTY",
        position_type="short_call",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=1,
        expiry_days=7,
        brokerage=20,
    )
    s_sc = calculate_position_summary(sc)
    assert s_sc.break_even == 24100.0
    assert s_sc.max_loss is None
    assert s_sc.max_gain == 5000.0 - 20.0
    assert "Unlimited" in s_sc.max_loss_formatted

    # Short put
    sp = TradeInput(
        underlying="NIFTY",
        position_type="short_put",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=1,
        expiry_days=7,
        brokerage=20,
    )
    s_sp = calculate_position_summary(sp)
    assert s_sp.break_even == 23900.0
    assert s_sp.max_loss == (24000 - 100) * 50 + 20.0
    assert s_sp.max_gain == 5000.0 - 20.0


def test_scenario_analysis():
    scenarios = calculate_scenarios(
        position_type="long_call",
        strike=24000,
        premium=100,
        quantity=50,
        costs=50,
        spot_price=24000,
        scenarios=[10.0, 0.0, -10.0],
    )
    assert len(scenarios) == 3
    # +10% -> spot = 26400 -> gross = (26400 - 24000)*50 - 5000 = 2400*50 - 5000 = 120000 - 5000 = 115000
    assert scenarios[0].spot_at_expiry == 26400.0
    assert scenarios[0].gross_pnl == 115000.0
    assert scenarios[0].net_pnl == 114950.0

    # -10% -> spot = 21600 -> gross = -5000 -> net = -5050
    assert scenarios[2].spot_at_expiry == 21600.0
    assert scenarios[2].net_pnl == -5050.0


def test_edge_cases_and_invalid_inputs():
    # Zero premium option
    res_zero = calculate_payoff("long_call", spot_at_expiry=24050, strike=24000, premium=0, quantity=50, costs=0)
    assert res_zero.gross_pnl == 2500.0
    assert res_zero.net_pnl == 2500.0

    # Negative spot
    with pytest.raises(ValueError, match="cannot be negative"):
        calculate_payoff("long_call", spot_at_expiry=-100, strike=24000, premium=10, quantity=50)

    # Negative strike
    with pytest.raises(ValueError, match="must be positive"):
        calculate_payoff("long_call", spot_at_expiry=24000, strike=-24000, premium=10, quantity=50)

    # Unsupported position
    with pytest.raises(ValueError, match="Unsupported position_type"):
        calculate_payoff("invalid_option", spot_at_expiry=24000, strike=24000, premium=10, quantity=50)
