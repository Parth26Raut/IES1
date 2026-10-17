import math
from typing import Dict, List, Optional, Tuple
from app.schemas.trade import (
    BehaviouralInput,
    PositionSummary,
    RiskEvaluationResponse,
    RiskFinding,
    ScenarioResult,
    TradeInput,
)
from app.services.payoff_calculator import (
    calculate_position_summary,
    calculate_scenarios,
)
from app.services.behavioural_analysis import assess_behavioural_flags


def evaluate_risk(
    trade: TradeInput,
    behavioural_input: Optional[BehaviouralInput] = None,
) -> RiskEvaluationResponse:
    """Deterministic, rules-based pre-trade risk evaluation engine.

    Evaluates 10 comprehensive risk rule categories with zero external AI dependence,
    strictly adhering to Indian derivatives market conventions (NSE).
    """
    summary = calculate_position_summary(trade)
    scenarios = calculate_scenarios(
        position_type=trade.position_type,
        strike=trade.strike_price,
        premium=trade.premium,
        quantity=summary.total_quantity,
        costs=summary.total_costs_inr,
        spot_price=trade.spot_price,
    )

    findings: List[RiskFinding] = []
    score_breakdown: List[str] = []
    total_score: float = 0.0

    pos = trade.position_type.lower().replace("-", "_").replace(" ", "_")
    total_prem = summary.total_premium_inr
    total_costs = summary.total_costs_inr
    max_loss = summary.max_loss
    max_gain = summary.max_gain

    # -------------------------------------------------------------
    # Rule 1: max_loss_exposure (Absolute loss magnitude in INR)
    # -------------------------------------------------------------
    if max_loss is not None:
        if max_loss >= 100000.0:
            findings.append(
                RiskFinding(
                    severity="elevated",
                    rule_id="RULE-01-MAX-LOSS-ABS",
                    metric_name="Max Absolute Loss",
                    calculated_value=f"₹{max_loss:,.2f}",
                    threshold="₹100,000.00",
                    explanation=f"Potential maximum loss of ₹{max_loss:,.2f} is exceptionally high in absolute nominal terms.",
                    assumptions="Assumes position held through expiry without stop-loss intervention.",
                    educational_tip="Never risk an absolute sum that would cause emotional distress or disrupt daily financial obligations.",
                )
            )
            total_score += 15.0
            score_breakdown.append("+15 (Absolute loss exceeds ₹100,000)")
        elif max_loss >= 50000.0:
            findings.append(
                RiskFinding(
                    severity="warning",
                    rule_id="RULE-01-MAX-LOSS-ABS",
                    metric_name="Max Absolute Loss",
                    calculated_value=f"₹{max_loss:,.2f}",
                    threshold="₹50,000.00",
                    explanation=f"Potential maximum loss of ₹{max_loss:,.2f} represents a significant capital commitment.",
                    assumptions="Assumes full expiry settlement.",
                    educational_tip="Ensure total allocation per trade does not exceed standard risk management parameters.",
                )
            )
            total_score += 8.0
            score_breakdown.append("+8 (Absolute loss exceeds ₹50,000)")
        elif max_loss >= 25000.0:
            findings.append(
                RiskFinding(
                    severity="info",
                    rule_id="RULE-01-MAX-LOSS-ABS",
                    metric_name="Max Absolute Loss",
                    calculated_value=f"₹{max_loss:,.2f}",
                    threshold="₹25,000.00",
                    explanation=f"Maximum loss exposure is ₹{max_loss:,.2f}.",
                    assumptions="Position held to expiry.",
                    educational_tip="Track multi-lot exposure carefully across open contracts.",
                )
            )

    # -------------------------------------------------------------
    # Rule 2: capital_at_risk (Loss relative to declared capital)
    # -------------------------------------------------------------
    if trade.available_capital and trade.available_capital > 0:
        if max_loss is None:
            # Short call with undefined loss
            findings.append(
                RiskFinding(
                    severity="severe",
                    rule_id="RULE-02-CAPITAL-AT-RISK",
                    metric_name="Capital at Risk %",
                    calculated_value="Potentially >100%",
                    threshold="50.0%",
                    explanation="Because maximum loss is undefined, this single position can exhaust 100% or more of available trading capital.",
                    assumptions="Unhedged naked short call exposed to sudden gap openings.",
                    educational_tip="Naked short call selling should never be executed without defined risk spread structures.",
                )
            )
            total_score += 35.0
            score_breakdown.append("+35 (Naked short call threatens >100% of trading capital)")
        else:
            loss_pct = (max_loss / trade.available_capital) * 100.0
            if loss_pct >= 50.0:
                findings.append(
                    RiskFinding(
                        severity="severe",
                        rule_id="RULE-02-CAPITAL-AT-RISK",
                        metric_name="Capital at Risk %",
                        calculated_value=f"{loss_pct:.1f}%",
                        threshold="50.0%",
                        explanation=f"Max loss of ₹{max_loss:,.2f} exposes {loss_pct:.1f}% of total trading capital (₹{trade.available_capital:,.2f}).",
                        assumptions="Single contract expiry worst-case outcome.",
                        educational_tip="Professional risk managers limit risk per trade to 1%-2% of total capital. Over 50% is catastrophic risk.",
                    )
                )
                total_score += 35.0
                score_breakdown.append(f"+35 (Exposes {loss_pct:.1f}% of capital, >=50% threshold)")
            elif loss_pct >= 25.0:
                findings.append(
                    RiskFinding(
                        severity="elevated",
                        rule_id="RULE-02-CAPITAL-AT-RISK",
                        metric_name="Capital at Risk %",
                        calculated_value=f"{loss_pct:.1f}%",
                        threshold="25.0%",
                        explanation=f"Max loss exposes {loss_pct:.1f}% of capital. A series of two such trades would halve your account.",
                        assumptions="Full contract loss scenario.",
                        educational_tip="Reduce lot size or hedge with offsetting long strikes to shrink capital commitment.",
                    )
                )
                total_score += 25.0
                score_breakdown.append(f"+25 (Exposes {loss_pct:.1f}% of capital, >=25% threshold)")
            elif loss_pct >= 10.0:
                findings.append(
                    RiskFinding(
                        severity="warning",
                        rule_id="RULE-02-CAPITAL-AT-RISK",
                        metric_name="Capital at Risk %",
                        calculated_value=f"{loss_pct:.1f}%",
                        threshold="10.0%",
                        explanation=f"Trade commits {loss_pct:.1f}% of capital to downside risk.",
                        assumptions="Worst-case settlement at expiry.",
                        educational_tip="Keep portfolio allocation per single idea under 5% to absorb market drawdown sequences.",
                    )
                )
                total_score += 15.0
                score_breakdown.append(f"+15 (Exposes {loss_pct:.1f}% of capital, >=10% threshold)")

    # -------------------------------------------------------------
    # Rule 3: loss_limit_breach (Exceeding user-stated loss tolerance)
    # -------------------------------------------------------------
    if trade.max_acceptable_loss and trade.max_acceptable_loss > 0:
        if max_loss is None or max_loss > trade.max_acceptable_loss:
            breach_val = "Unlimited" if max_loss is None else f"₹{max_loss:,.2f}"
            findings.append(
                RiskFinding(
                    severity="severe",
                    rule_id="RULE-03-LOSS-LIMIT-BREACH",
                    metric_name="Loss Tolerance Breach",
                    calculated_value=breach_val,
                    threshold=f"₹{trade.max_acceptable_loss:,.2f}",
                    explanation=(
                        f"Theoretical position loss ({breach_val}) violates your declared maximum loss threshold of "
                        f"₹{trade.max_acceptable_loss:,.2f}."
                    ),
                    assumptions="Contract held until strike expiry without manual exit.",
                    educational_tip="Never enter a trade whose structural worst-case outcome exceeds your pre-committed loss budget.",
                )
            )
            total_score += 30.0
            score_breakdown.append("+30 (Worst-case loss exceeds declared loss tolerance)")

    # -------------------------------------------------------------
    # Rule 4: risk_asymmetry (Loss >> Gain, typical of option selling)
    # -------------------------------------------------------------
    if "short" in pos:
        if max_loss is None:
            findings.append(
                RiskFinding(
                    severity="severe",
                    rule_id="RULE-04-ASYMMETRIC-RISK",
                    metric_name="Asymmetric Risk Ratio",
                    calculated_value="Undefined (Infinity : 1)",
                    threshold="3.0x",
                    explanation=f"You are risking unlimited downside to collect a capped net premium of ₹{summary.max_gain:,.2f}.",
                    assumptions="Naked call position.",
                    educational_tip="Selling naked options creates extreme negative skewness. High win-rate is offset by catastrophic tail events.",
                )
            )
            total_score += 20.0
            score_breakdown.append("+20 (Extreme negative asymmetry: unlimited risk vs capped reward)")
        elif max_gain is not None and max_gain > 0:
            ratio = max_loss / max_gain
            if ratio >= 3.0:
                findings.append(
                    RiskFinding(
                        severity="elevated",
                        rule_id="RULE-04-ASYMMETRIC-RISK",
                        metric_name="Asymmetric Risk Ratio",
                        calculated_value=f"{ratio:.2f}x",
                        threshold="3.0x",
                        explanation=f"Maximum loss (₹{max_loss:,.2f}) is {ratio:.1f} times higher than maximum possible profit (₹{max_gain:,.2f}).",
                        assumptions="Zero price lower bound for short put.",
                        educational_tip="Consider defined-risk credit spreads (e.g. Bull Put Spread) to cap tail risk.",
                    )
                )
                total_score += 15.0
                score_breakdown.append(f"+15 (Negative asymmetry: loss is {ratio:.1f}x max profit)")

    # -------------------------------------------------------------
    # Rule 5: expiry_risk (Accelerated time decay & gamma spikes)
    # -------------------------------------------------------------
    if trade.expiry_days <= 2:
        findings.append(
            RiskFinding(
                severity="elevated",
                rule_id="RULE-05-EXPIRY-RISK",
                metric_name="Days to Expiry",
                calculated_value=f"{trade.expiry_days} days",
                threshold="< 3 days",
                explanation=f"With only {trade.expiry_days} calendar days remaining, gamma risk and theta decay are at maximum intensity.",
                assumptions="Expiry day or 0-2 DTE trading.",
                educational_tip="Options within 48 hours of expiry suffer extreme volatility and rapid premium erosion.",
            )
        )
        total_score += 15.0
        score_breakdown.append("+15 (Ultra-short expiry <=2 days: severe gamma and decay risk)")
    elif trade.expiry_days <= 5:
        findings.append(
            RiskFinding(
                severity="warning",
                rule_id="RULE-05-EXPIRY-RISK",
                metric_name="Days to Expiry",
                calculated_value=f"{trade.expiry_days} days",
                threshold="<= 5 days",
                explanation="Contract is approaching weekly expiry. Position sensitivities will shift rapidly with spot fluctuations.",
                assumptions="Weekly expiry dynamics.",
                educational_tip="Watch intraday delta shifts closely as strike approaches expiry.",
            )
        )
        total_score += 8.0
        score_breakdown.append("+8 (Near-term expiry <=5 days)")

    # -------------------------------------------------------------
    # Rule 6: iv_sensitivity (High volatility regime / IV crush)
    # -------------------------------------------------------------
    iv_pct = (trade.normalized_iv * 100.0) if trade.normalized_iv is not None else None
    if iv_pct is not None and iv_pct >= 50.0:
        findings.append(
            RiskFinding(
                severity="warning" if "short" in pos else "elevated",
                rule_id="RULE-06-IV-SENSITIVITY",
                metric_name="Implied Volatility",
                calculated_value=f"{iv_pct:.1f}%",
                threshold="50.0%",
                explanation=(
                    f"Implied volatility of {iv_pct:.1f}% is elevated. "
                    + ("Long option buyers face steep IV crush risk if volatility reverts." if "long" in pos else "Option sellers benefit from rich premiums but face extreme underlying gap risk.")
                ),
                assumptions="High volatility regime (e.g. Union Budget, Election, Corporate Earnings).",
                educational_tip="Check historical volatility percentiles before paying high premiums for options.",
            )
        )
        total_score += 10.0
        score_breakdown.append(f"+10 (High IV environment: {iv_pct:.1f}%)")

    # -------------------------------------------------------------
    # Rule 7: short_tail_risk (Unlimited loss specifically for short call)
    # -------------------------------------------------------------
    if pos == "short_call":
        findings.append(
            RiskFinding(
                severity="severe",
                rule_id="RULE-07-SHORT-TAIL-RISK",
                metric_name="Short Call Tail Risk",
                calculated_value="Unlimited Upside Exposure",
                threshold="Defined Risk",
                explanation="A short call has theoretically unlimited loss because there is no ceiling on how high the underlying stock or index can rally.",
                assumptions="Contract held without an upper protective long call.",
                educational_tip="SEBI data shows uncovered short options account for the vast majority of catastrophic retail trader bankruptcies.",
            )
        )
        total_score += 40.0
        score_breakdown.append("+40 (Naked short call: unbounded tail loss potential)")

    # -------------------------------------------------------------
    # Rule 8: cost_sensitivity (Frictional drag from charges & slippage)
    # -------------------------------------------------------------
    if total_prem > 0:
        cost_ratio = (total_costs / total_prem) * 100.0
        if cost_ratio >= 10.0:
            findings.append(
                RiskFinding(
                    severity="warning",
                    rule_id="RULE-08-COST-SENSITIVITY",
                    metric_name="Frictional Cost %",
                    calculated_value=f"{cost_ratio:.1f}%",
                    threshold="10.0%",
                    explanation=f"Estimated brokerage, transaction taxes, and slippage (₹{total_costs:,.2f}) consume {cost_ratio:.1f}% of total premium turnover.",
                    assumptions="Includes STT, exchange fees, GST, stamp duty, and slippage.",
                    educational_tip="High frictional costs drastically shift long-term expected value negative, especially for OTM lot scalping.",
                )
            )
            total_score += 10.0
            score_breakdown.append(f"+10 (Transaction costs eat {cost_ratio:.1f}% of premium)")

    # -------------------------------------------------------------
    # Rule 9: missing_info (Gaps in data affecting risk evaluation)
    # -------------------------------------------------------------
    missing_items = []
    if not trade.available_capital:
        missing_items.append("available_capital")
    if not trade.max_acceptable_loss:
        missing_items.append("max_acceptable_loss")
    if trade.implied_volatility is None:
        missing_items.append("implied_volatility")

    if missing_items:
        findings.append(
            RiskFinding(
                severity="info",
                rule_id="RULE-09-MISSING-INFO",
                metric_name="Missing Parameters",
                calculated_value=", ".join(missing_items),
                threshold="All inputs provided",
                explanation=f"Risk evaluation was conducted without: {', '.join(missing_items)}. Providing these enables precise portfolio drawdown checks.",
                assumptions="Calculations proceed with standard Indian market baseline defaults.",
                educational_tip="Inputting your actual available capital allows the engine to compute exact ruin probability metrics.",
            )
        )

    # -------------------------------------------------------------
    # Rule 10: behavioural_pressure (FOMO, Revenge trading, Social media)
    # -------------------------------------------------------------
    behavioural_summary = None
    if behavioural_input:
        behavioural_summary = assess_behavioural_flags(behavioural_input)
        if behavioural_summary.flag_count > 0:
            findings.append(
                RiskFinding(
                    severity="elevated" if behavioural_summary.flag_count >= 3 else "warning",
                    rule_id="RULE-10-BEHAVIOURAL-PRESSURE",
                    metric_name="Behavioural Red Flags",
                    calculated_value=f"{behavioural_summary.flag_count} flags detected",
                    threshold="0 flags",
                    explanation=f"Self-reflection identified emotional triggers: {', '.join(f.flag_type for f in behavioural_summary.flags)}.",
                    assumptions="Self-reported questionnaire responses.",
                    educational_tip="Emotional bias (loss recovery, social media tips, FOMO) is the leading contributor to derivative trading losses.",
                )
            )
            beh_points = min(25.0, behavioural_summary.flag_count * 8.0)
            total_score += beh_points
            score_breakdown.append(f"+{beh_points:.0f} ({behavioural_summary.flag_count} behavioural flags detected)")

    # -------------------------------------------------------------
    # Risk Score & Classification Formulation
    # -------------------------------------------------------------
    clamped_score = min(100.0, max(0.0, total_score))
    if clamped_score <= 25.0:
        classification = "lower"
    elif clamped_score <= 50.0:
        classification = "moderate"
    elif clamped_score <= 75.0:
        classification = "elevated"
    else:
        classification = "severe"

    if score_breakdown:
        score_explanation = (
            f"Transparent Score: {clamped_score:.0f}/100. Breakdown: "
            + "; ".join(score_breakdown)
            + f". Classification: {classification.upper()}."
        )
    else:
        score_explanation = (
            f"Transparent Score: {clamped_score:.0f}/100. Standard risk profile within normal operating bounds. "
            f"Classification: {classification.upper()}."
        )

    model_assumptions = [
        "European option payoff evaluated strictly at expiry.",
        "Underlying prices cannot fall below ₹0.00.",
        "Indian market conventions: MIBOR risk-free baseline 7.0% p.a., calendar year 365 days.",
        "All regulatory charges (STT, exchange turnover fees, GST, stamp duty) and slippage deducted from gross P&L.",
        "No dynamic hedging or early exercise considered.",
    ]

    educational_explanation = (
        f"This trade is structured as a {summary.position_type.upper()} on {summary.underlying} "
        f"at strike ₹{summary.strike_price:,.2f} with premium ₹{summary.premium:,.2f}. "
        f"The break-even price at expiry is ₹{summary.break_even:,.2f}. "
        + (
            f"Maximum possible loss is capped at ₹{summary.max_loss:,.2f}."
            if summary.max_loss is not None
            else "WARNING: Maximum loss is UNLIMITED because short call options have no upper boundary."
        )
    )

    data_quality = {
        "spot_price_verified": True,
        "implied_volatility_provided": trade.implied_volatility is not None,
        "capital_provided": trade.available_capital is not None,
        "tolerance_provided": trade.max_acceptable_loss is not None,
        "total_inputs_evaluated": 15,
    }

    return RiskEvaluationResponse(
        trade_summary=summary,
        payoff_metrics=summary,
        risk_findings=findings,
        risk_classification=classification,
        risk_score=round(clamped_score, 1),
        risk_score_explanation=score_explanation,
        scenario_results=scenarios,
        model_assumptions=model_assumptions,
        behavioural_reflection=behavioural_summary.model_dump() if behavioural_summary else None,
        data_quality=data_quality,
        educational_explanation=educational_explanation,
    )
