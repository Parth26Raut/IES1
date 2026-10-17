import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.repositories.trade_repository import trade_repository
from app.schemas.trade import QuizQuestion, QuizResult, QuizSubmission
from app.services.education_service import (
    evaluate_quiz_submission,
    get_quiz_questions,
)

router = APIRouter(prefix="/education", tags=["Education & Knowledge"])


@router.get(
    "/questions",
    response_model=List[QuizQuestion],
    status_code=status.HTTP_200_OK,
    summary="Get Randomized Risk & Derivatives Quiz Questions",
)
async def list_questions(
    count: int = Query(default=10, ge=1, le=50, description="Number of questions to return"),
    exclude: Optional[str] = Query(
        default=None, description="Comma-separated question IDs to exclude (for non-overlapping tests)"
    ),
) -> List[QuizQuestion]:
    """Retrieve sanitized quiz questions covering Indian option markets, risk rules, and Greeks."""
    exclude_list = [x.strip() for x in exclude.split(",") if x.strip()] if exclude else None
    return get_quiz_questions(count=count, exclude_ids=exclude_list)


@router.post(
    "/submit",
    response_model=QuizResult,
    status_code=status.HTTP_200_OK,
    summary="Submit Quiz Responses and Receive Detailed Explanations",
)
async def submit_quiz(submission: QuizSubmission) -> QuizResult:
    """Grade quiz responses, calculate conceptual proficiency scores, and persist results."""
    try:
        result = evaluate_quiz_submission(submission)

        # Persist submission result to database
        await trade_repository.save_quiz_score(
            participant_id=submission.participant_id,
            session_id=submission.session_id,
            score=result.score,
            total_questions=result.total_questions,
            percentage=result.percentage,
            answers_json=json.dumps(submission.answers),
            concept_scores_json=json.dumps(result.concept_scores),
        )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing quiz submission: {str(e)}",
        )
