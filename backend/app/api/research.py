from typing import List
from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, Field
from app.repositories.trade_repository import trade_repository
from app.schemas.trade import (
    ResearchAssessment,
    ResearchAssessmentCreate,
    ResearchParticipant,
    ResearchParticipantCreate,
    ResearchSummary,
)
from app.services.research_analysis import (
    export_research_csv,
    generate_research_summary,
    seed_synthetic_research_data,
)

router = APIRouter(prefix="/research", tags=["Research Experiment"])


class SeedDemoRequest(BaseModel):
    sample_size: int = Field(default=30, ge=4, le=500)


class SeedDemoResponse(BaseModel):
    message: str
    total_participants: int


@router.get(
    "/summary",
    response_model=ResearchSummary,
    status_code=status.HTTP_200_OK,
    summary="Get Consolidated Research Trial Analytics",
)
async def get_summary() -> ResearchSummary:
    """Retrieve statistical aggregations, baseline/post comparisons, and treatment effects."""
    try:
        return await generate_research_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error compiling research summary: {str(e)}",
        )


@router.post(
    "/participants",
    response_model=ResearchParticipant,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Research Participant",
)
async def create_participant(participant: ResearchParticipantCreate) -> ResearchParticipant:
    """Enroll a participant into either 'control' or 'intervention' trial cohorts."""
    try:
        return await trade_repository.create_participant(participant)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error enrolling participant: {str(e)}",
        )


@router.get(
    "/participants",
    response_model=List[ResearchParticipant],
    status_code=status.HTTP_200_OK,
    summary="List Registered Research Participants",
)
async def list_participants() -> List[ResearchParticipant]:
    """List all registered participants."""
    return await trade_repository.list_participants()


@router.post(
    "/assessments",
    response_model=ResearchAssessment,
    status_code=status.HTTP_201_CREATED,
    summary="Record Baseline or Post-Intervention Assessment",
)
async def create_assessment(assessment: ResearchAssessmentCreate) -> ResearchAssessment:
    """Log participant scores on risk comprehension, loss accuracy, and trading willingness."""
    try:
        # Check participant exists
        p = await trade_repository.get_participant(assessment.participant_id)
        if not p:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant '{assessment.participant_id}' does not exist.",
            )
        return await trade_repository.create_assessment(assessment)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error recording assessment: {str(e)}",
        )


@router.get(
    "/export",
    status_code=status.HTTP_200_OK,
    summary="Export Anonymized Research Data as CSV",
)
async def export_data() -> Response:
    """Export complete experimental trial data in CSV format for academic or empirical replication."""
    try:
        csv_content = await export_research_csv()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=riskwise_research_export.csv"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting CSV: {str(e)}",
        )


@router.post(
    "/seed-demo",
    response_model=SeedDemoResponse,
    status_code=status.HTTP_200_OK,
    summary="Seed Synthetic Demo Cohort Data",
)
async def seed_demo(request: SeedDemoRequest = SeedDemoRequest()) -> SeedDemoResponse:
    """Populate synthetic baseline and post-test assessments for demonstration and presentation."""
    try:
        count = await seed_synthetic_research_data(sample_size=request.sample_size)
        return SeedDemoResponse(
            message=f"Successfully seeded demo data with {count} participants.",
            total_participants=count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error seeding demo data: {str(e)}",
        )
