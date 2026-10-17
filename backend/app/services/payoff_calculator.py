import math
from typing import List, Optional
from app.schemas.trade import PayoffResult, PositionSummary, ScenarioResult, TradeInput


def calculate_payoff(
    position_type: str,
    spot_at_expiry: float,
    strike: float,
    premium: float,
    quantity: int,
    costs: float = 0.0,
) -> PayoffResult:
    """Calculate gross and net P&L for a single European vanilla option position at expiry.

    Formulas:
    q = quantity
    Long Call:  Gross P&L = max(S - K, 0) * q - p * q
    Long Put:   Gross P&L = max(K - S, 0) * q - p * q
    Short Call: Gross P&L = p * q - max(S - K, 0) * q
    Short Put:  Gross P&L = p * q - max(K - S, 0) * q
    Net P&L = Gross P&L - costs
    """
    if spot_at_expiry < 0:
        raise ValueError("spot_at_expiry cannot be negative.")
    if strike <= 0:
        raise ValueError("strike must be positive.")
    if premium < 0:
        raise ValueError("premium cannot be negative.")
    if quantity <= 0:
        raise ValueError("quantity must be greater than zero.")
    if costs < 0:
        raise ValueError("costs cannot be negative.")

    pos = position_type.lower().replace("-", "_").replace(" ", "_")

    if pos == "long_call":
        gross_pnl = max(spot_at_expiry - strike, 0.0) * quantity - premium * quantity
    elif pos == "long_put":
        gross_pnl = max(strike - spot_at_expiry, 0.0) * quantity - premium * quantity
    elif pos == "short_call":
        gross_pnl = premium * quantity - max(spot_at_expiry - strike, 0.0) * quantity
    elif pos == "short_put":
        gross_pnl = premium * quantity - max(strike - spot_at_expiry, 0.0) * quantity
    else:
        raise ValueError(f"Unsupported position_type '{position_type}'. Must be one of: long_call, long_put, short_call, short_put.")

    net_pnl = gross_pnl - costs

    return PayoffResult(
        spot_at_expiry=round(spot_at_expiry, 2),
        gross_pnl=round(gross_pnl, 2),
        net_pnl=round(net_pnl, 2),
        is_profit=(net_pnl > 0),
    )


def calculate_scenarios(
    position_type: str,
    strike: float,
    premium: float,
    quantity: int,
    costs: float,
    spot_price: float,
    scenarios: Optional[List[float]] = None,
) -> List[ScenarioResult]:
    """Calculate payoff across predefined or custom percentage moves from current spot price.

    Default scenario presets: +20%, +10%, 0%, -10%, -20%.
    """
    if scenarios is None:
        scenarios = [20.0, 10.0, 0.0, -10.0, -20.0]

    results: List[ScenarioResult] = []
    capital_base = (premium * quantity) + costs if "long" in position_type else (strike * quantity)

    for pct in scenarios:
        spot_at_exp = max(0.0, spot_price * (1.0 + (pct / 100.0)))
        payoff = calculate_payoff(
            position_type=position_type,
            spot_at_expiry=spot_at_exp,
            strike=strike,
            premium=premium,
            quantity=quantity,
            costs=costs,
        )
        
        name_prefix = f"+{pct:.0f}%" if pct > 0 else (f"{pct:.0f}%" if pct < 0 else "0% (Current Spot)")
        roc = None
        if capital_base > 0:
            roc = round((payoff.net_pnl / capital_base) * 100.0, 2)

        results.append(
            ScenarioResult(
                scenario_name=f"{name_prefix} Underlying Move",
                percentage_change=pct,
                spot_at_expiry=round(spot_at_exp, 2),
                gross_pnl=payoff.gross_pnl,
                net_pnl=payoff.net_pnl,
                return_on_capital=roc,
            )
        )

    return results


def calculate_position_summary(trade: TradeInput) -> PositionSummary:
    """Compute comprehensive position-level analytics, break-evens, limits, and moneyness."""
    K = trade.strike_price
    p = trade.premium
    q = trade.total_quantity
    C = trade.total_costs
    S = trade.spot_price
    pos = trade.position_type.lower().replace("-", "_").replace(" ", "_")

    # 1. Break-even
    # Long Call: K + p
    # Long Put: K - p
    # Short Call: K + p
    # Short Put: K - p
    if pos in ("long_call", "short_call"):
        break_even = K + p
    elif pos in ("long_put", "short_put"):
        break_even = max(0.0, K - p)
    else:
        raise ValueError(f"Invalid position_type {trade.position_type}")

    # 2. Max Loss and Max Gain
    # Long Call:
    #   Max Loss = p * q + C
    #   Max Gain = UNLIMITED (None)
    # Long Put:
    #   Max Loss = p * q + C
    #   Max Gain = (K - p) * q - C (when K > p)
    # Short Call:
    #   Max Loss = UNLIMITED (None)
    #   Max Gain = p * q - C
    # Short Put:
    #   Max Loss = (K - p) * q + C if K > p else C
    #   Max Gain = p * q - C
    if pos == "long_call":
        max_loss = p * q + C
        max_loss_formatted = f"₹{max_loss:,.2f}"
        max_gain = None
        max_gain_formatted = "Unlimited"

    elif pos == "long_put":
        max_loss = p * q + C
        max_loss_formatted = f"₹{max_loss:,.2f}"
        gain_val = (K - p) * q - C if K > p else -C
        max_gain = max(0.0, gain_val)
        max_gain_formatted = f"₹{max_gain:,.2f}"

    elif pos == "short_call":
        max_loss = None
        max_loss_formatted = "Unlimited (Undefined Downside)"
        gain_val = p * q - C
        max_gain = max(0.0, gain_val)
        max_gain_formatted = f"₹{max_gain:,.2f}"

    elif pos == "short_put":
        loss_val = (K - p) * q + C if K > p else C
        max_loss = max(0.0, loss_val)
        max_loss_formatted = f"₹{max_loss:,.2f}"
        gain_val = p * q - C
        max_gain = max(0.0, gain_val)
        max_gain_formatted = f"₹{max_gain:,.2f}"

    # 3. Capital exposure percentage
    capital_at_risk_pct = None
    if trade.available_capital and trade.available_capital > 0:
        if max_loss is not None:
            capital_at_risk_pct = round((max_loss / trade.available_capital) * 100.0, 2)
        else:
            capital_at_risk_pct = 100.0  # short call represents theoretical 100%+ ruin potential

    # 4. Risk / Reward ratio
    if max_loss is None:
        risk_reward_ratio = "Asymmetric: Unlimited Loss vs Capped Premium"
    elif max_gain is None:
        risk_reward_ratio = f"Defined Risk (₹{max_loss:,.0f}) vs Unlimited Gain"
    elif max_loss > 0 and max_gain > 0:
        ratio = max_gain / max_loss
        risk_reward_ratio = f"1 : {ratio:.2f}"
    else:
        risk_reward_ratio = "N/A"

    # 5. Moneyness
    is_call = "call" in pos
    tolerance = 0.002 * S  # 0.2% band for ATM
    if abs(S - K) <= tolerance:
        moneyness = "ATM"
    elif is_call:
        moneyness = "ITM" if S > K else "OTM"
    else:
        moneyness = "ITM" if S < K else "OTM"

    # 6. Intrinsic and Time Value
    if is_call:
        intrinsic = max(0.0, S - K)
    else:
        intrinsic = max(0.0, K - S)
    time_value = max(0.0, p - intrinsic)

    return PositionSummary(
        position_type=trade.position_type,
        underlying=trade.underlying.upper(),
        spot_price=round(S, 2),
        strike_price=round(K, 2),
        premium=round(p, 2),
        lot_size=trade.lot_size,
        num_lots=trade.num_lots,
        total_quantity=q,
        break_even=round(break_even, 2),
        max_loss=round(max_loss, 2) if max_loss is not None else None,
        max_loss_formatted=max_loss_formatted,
        max_gain=round(max_gain, 2) if max_gain is not None else None,
        max_gain_formatted=max_gain_formatted,
        total_premium_inr=round(p * q, 2),
        total_costs_inr=round(C, 2),
        capital_at_risk_pct=capital_at_risk_pct,
        risk_reward_ratio=risk_reward_ratio,
        moneyness=moneyness,
        intrinsic_value=round(intrinsic, 2),
        time_value=round(time_value, 2),
    )
