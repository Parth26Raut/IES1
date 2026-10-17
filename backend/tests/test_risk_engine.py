import pytest
from app.schemas.trade import BehaviouralInput, TradeInput
from app.services.risk_engine import evaluate_risk


def test_capital_at_risk_thresholds():
    # Capital = 100,000
    # 1. 50%+ capital at risk -> severe
    trade_50 = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=1200,  # 1200 * 50 = 60,000 (60% of 100,000)
        lot_size=50,
        num_lots=1,
        expiry_days=10,
        available_capital=100000,
    )
    eval_50 = evaluate_risk(trade_50)
    rule_02 = next((f for f in eval_50.risk_findings if f.rule_id == "RULE-02-CAPITAL-AT-RISK"), None)
    assert rule_02 is not None
    assert rule_02.severity == "severe"

    # 2. 25%-50% capital at risk -> elevated
    trade_25 = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=600,  # 600 * 50 = 30,000 (30% of 100,000)
        lot_size=50,
        num_lots=1,
        expiry_days=10,
        available_capital=100000,
    )
    eval_25 = evaluate_risk(trade_25)
    rule_02_elev = next((f for f in eval_25.risk_findings if f.rule_id == "RULE-02-CAPITAL-AT-RISK"), None)
    assert rule_02_elev is not None
    assert rule_02_elev.severity == "elevated"

    # 3. 10%-25% capital at risk -> warning
    trade_10 = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=300,  # 300 * 50 = 15,000 (15% of 100,000)
        lot_size=50,
        num_lots=1,
        expiry_days=10,
        available_capital=100000,
    )
    eval_10 = evaluate_risk(trade_10)
    rule_02_warn = next((f for f in eval_10.risk_findings if f.rule_id == "RULE-02-CAPITAL-AT-RISK"), None)
    assert rule_02_warn is not None
    assert rule_02_warn.severity == "warning"


def test_loss_limit_breach():
    # User's stated loss tolerance is 5,000, but position max loss is 7,500
    trade = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=150,  # 150 * 50 = 7,500
        lot_size=50,
        num_lots=1,
        expiry_days=10,
        max_acceptable_loss=5000,
    )
    res = evaluate_risk(trade)
    breach = next((f for f in res.risk_findings if f.rule_id == "RULE-03-LOSS-LIMIT-BREACH"), None)
    assert breach is not None
    assert breach.severity == "severe"
    assert "₹7,500" in breach.calculated_value
    assert "₹5,000" in breach.threshold


def test_short_call_tail_risk():
    trade = TradeInput(
        underlying="NIFTY",
        position_type="short_call",
        spot_price=24000,
        strike_price=24200,
        premium=150,
        lot_size=50,
        num_lots=1,
        expiry_days=7,
    )
    res = evaluate_risk(trade)
    tail_finding = next((f for f in res.risk_findings if f.rule_id == "RULE-07-SHORT-TAIL-RISK"), None)
    assert tail_finding is not None
    assert tail_finding.severity == "severe"
    assert "unlimited" in tail_finding.explanation.lower()


def test_cost_sensitivity_detection():
    # Premium is 20 * 50 = 1,000. Costs are 150 (15% > 10% threshold)
    trade = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=20,
        lot_size=50,
        num_lots=1,
        expiry_days=7,
        brokerage=100,
        transaction_charges=50,
    )
    res = evaluate_risk(trade)
    cost_finding = next((f for f in res.risk_findings if f.rule_id == "RULE-08-COST-SENSITIVITY"), None)
    assert cost_finding is not None
    assert cost_finding.severity == "warning"
    assert "15.0%" in cost_finding.calculated_value


def test_behavioural_flag_integration():
    trade = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=1,
        expiry_days=10,
    )
    beh = BehaviouralInput(
        main_reason="recovery",
        acting_on_fomo=True,
        loss_affects_essentials=True,
    )
    res = evaluate_risk(trade, behavioural_input=beh)
    beh_finding = next((f for f in res.risk_findings if f.rule_id == "RULE-10-BEHAVIOURAL-PRESSURE"), None)
    assert beh_finding is not None
    assert beh_finding.severity == "elevated"
    assert res.behavioural_reflection is not None
    assert res.behavioural_reflection["flag_count"] >= 3


def test_risk_classification_thresholds():
    # 1. Lower risk trade (small capital allocation, defined risk, ample expiry)
    safe_trade = TradeInput(
        underlying="NIFTY",
        position_type="long_call",
        spot_price=24000,
        strike_price=24000,
        premium=40,  # 40 * 50 = 2,000
        lot_size=50,
        num_lots=1,
        expiry_days=25,
        available_capital=200000,  # 1% capital at risk
        max_acceptable_loss=10000,
    )
    safe_res = evaluate_risk(safe_trade)
    assert safe_res.risk_score <= 25.0
    assert safe_res.risk_classification == "lower"

    # 2. Severe risk trade (naked short call with near expiry and capital breach)
    severe_trade = TradeInput(
        underlying="NIFTY",
        position_type="short_call",
        spot_price=24000,
        strike_price=24000,
        premium=100,
        lot_size=50,
        num_lots=2,
        expiry_days=1,  # near expiry gamma spike
        available_capital=50000,
        max_acceptable_loss=3000,
    )
    severe_res = evaluate_risk(severe_trade)
    assert severe_res.risk_score >= 76.0
    assert severe_res.risk_classification == "severe"
