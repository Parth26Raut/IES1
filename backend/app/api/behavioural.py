import json
from fastapi import APIRouter, HTTPException, status
from app.repositories.trade_repository import trade_repository
from app.schemas.trade import BehaviouralInput, BehaviouralResponse
from app.services.behavioural_analysis import assess_behavioural_flags

router = APIRouter(prefix="/behavioural", tags=["Behavioural Analysis"])


@router.post(
    "/reflect",
    response_model=BehaviouralResponse,
    status_code=status.HTTP_200_OK,
    summary="Process Self-Reflection Behavioural Questionnaire",
)
async def process_behavioural_reflection(input_data: BehaviouralInput) -> BehaviouralResponse:
    """Analyze behavioural trading triggers, social media influence, and risk perception."""
    try:
        response = assess_behavioural_flags(input_data)

        # Persist reflection if participant or trade analysis ID is provided
        await trade_repository.save_behavioural_reflection(
            participant_id=input_data.participant_id,
            trade_analysis_id=input_data.trade_analysis_id,
            main_reason=input_data.main_reason,
            social_media_source=input_data.social_media_source,
            understands_max_loss=input_data.understands_max_loss,
            acting_on_fomo=input_data.acting_on_fomo,
            recovering_losses=input_data.recovering_losses,
            influenced_by_screenshot=input_data.influenced_by_screenshot,
            loss_affects_essentials=input_data.loss_affects_essentials,
            independent_evaluation=input_data.independent_evaluation,
            flags_json=json.dumps([f.model_dump() for f in response.flags]),
            reflection_text=response.reflection_text,
        )

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing behavioural reflection: {str(e)}",
        )
