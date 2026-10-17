import json
from typing import Optional, Union
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.repositories.trade_repository import trade_repository
from app.schemas.trade import (
    BehaviouralInput,
    RiskEvaluationResponse,
    TradeInput,
)
from app.services.risk_engine import evaluate_risk

router = APIRouter(prefix="/risk", tags=["Risk Intelligence"])


class RiskEvaluationRequest(BaseModel):
    trade: TradeInput
    behavioural: Optional[BehaviouralInput] = None


@router.post(
    "/evaluate",
    response_model=RiskEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Pre-Trade Risk Intelligence",
)
async def evaluate_trade_risk(
    payload: Union[RiskEvaluationRequest, TradeInput]
) -> RiskEvaluationResponse:
    """Run comprehensive rules-based pre-trade risk evaluation across 10 deterministic risk categories."""
    try:
        if isinstance(payload, RiskEvaluationRequest):
            trade = payload.trade
            beh = payload.behavioural
        else:
            trade = payload
            beh = None

        evaluation = evaluate_risk(trade=trade, behavioural_input=beh)

        # Save to database
        await trade_repository.save_trade_analysis(
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
            risk_classification=evaluation.risk_classification,
            risk_score=evaluation.risk_score,
            max_loss=evaluation.trade_summary.max_loss,
            max_gain=evaluation.trade_summary.max_gain,
            break_even=evaluation.trade_summary.break_even,
            full_result_json=evaluation.model_dump_json(),
        )

        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating trade risk: {str(e)}",
        )
