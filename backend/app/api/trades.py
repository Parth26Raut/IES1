import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.repositories.trade_repository import trade_repository
from app.schemas.trade import (
    BlackScholesInput,
    BlackScholesResult,
    PositionSummary,
    ScenarioResult,
    TradeInput,
)
from app.services.black_scholes import calculate_black_scholes_analytics
from app.services.payoff_calculator import (
    calculate_position_summary,
    calculate_scenarios,
)

router = APIRouter(prefix="/trades", tags=["Trades"])


class ScenarioAnalysisRequest(BaseModel):
    trade: TradeInput
    scenarios: Optional[List[float]] = Field(
        default=None,
        description="Hypothetical percentage moves e.g. [20, 10, 0, -10, -20]",
    )


class TradeAnalysisResponse(BaseModel):
    id: Optional[int] = None
    summary: PositionSummary
    scenarios: List[ScenarioResult]


@router.post(
    "/analyse",
    response_model=TradeAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Full Trade Analysis & Payoff Computation",
)
async def analyse_trade(trade: TradeInput) -> TradeAnalysisResponse:
    """Analyze European option trade structure, compute break-evens, limits, and payoff profile."""
    try:
        summary = calculate_position_summary(trade)
        scenarios = calculate_scenarios(
            position_type=trade.position_type,
            strike=trade.strike_price,
            premium=trade.premium,
            quantity=summary.total_quantity,
            costs=summary.total_costs_inr,
            spot_price=trade.spot_price,
        )

        # Persist to database
        record_id = await trade_repository.save_trade_analysis(
            underlying=trade.underlying,
            position_type=trade.position_type,
            spot_price=trade.spot_price,
            strike_price=trade.strike_price,
            premium=trade.premium,
            lot_size=trade.lot_size,
            num_lots=trade.num_lots,
            expiry_days=trade.expiry_days,
            implied_volatility=trade.implied_volatility,
            risk_free_rate=trade.risk_free_rate,
            brokerage=trade.brokerage or 0.0,
            transaction_charges=trade.transaction_charges or 0.0,
            slippage=trade.slippage or 0.0,
            available_capital=trade.available_capital,
            max_acceptable_loss=trade.max_acceptable_loss,
            risk_classification="standard",
            risk_score=0.0,
            max_loss=summary.max_loss,
            max_gain=summary.max_gain,
            break_even=summary.break_even,
            full_result_json=json.dumps(
                {"summary": summary.model_dump(), "scenarios": [s.model_dump() for s in scenarios]}
            ),
        )

        return TradeAnalysisResponse(id=record_id, summary=summary, scenarios=scenarios)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during trade analysis: {str(e)}",
        )


@router.post(
    "/scenarios",
    response_model=List[ScenarioResult],
    status_code=status.HTTP_200_OK,
    summary="Compute Payoffs Across Percentage Underlying Moves",
)
async def compute_scenarios(request: ScenarioAnalysisRequest) -> List[ScenarioResult]:
    """Evaluate payoff metrics across user-specified or default spot market scenarios."""
    try:
        summary = calculate_position_summary(request.trade)
        return calculate_scenarios(
            position_type=request.trade.position_type,
            strike=request.trade.strike_price,
            premium=request.trade.premium,
            quantity=summary.total_quantity,
            costs=summary.total_costs_inr,
            spot_price=request.trade.spot_price,
            scenarios=request.scenarios,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/price",
    response_model=BlackScholesResult,
    status_code=status.HTTP_200_OK,
    summary="Black-Scholes Pricing and Greeks Calculation",
)
async def price_option(input_data: BlackScholesInput) -> BlackScholesResult:
    """Compute European vanilla option fair value, Greeks, and put-call parity check."""
    try:
        return calculate_black_scholes_analytics(
            spot_price=input_data.spot_price,
            strike_price=input_data.strike_price,
            time_to_expiry_days=input_data.time_to_expiry_days,
            risk_free_rate=input_data.risk_free_rate,
            implied_volatility=input_data.implied_volatility,
            option_type=input_data.option_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
