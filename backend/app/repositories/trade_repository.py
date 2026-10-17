import json
import logging
from typing import Any, Dict, List, Optional
import aiosqlite
from app.core.config import settings
from app.schemas.trade import (
    ResearchAssessment,
    ResearchAssessmentCreate,
    ResearchParticipant,
    ResearchParticipantCreate,
)

logger = logging.getLogger(__name__)


class TradeRepository:
    """Async repository for persistence across trade evaluations, quiz scores, and research."""

    def __init__(self, db_path: Optional[str] = None) -> None:
        self.db_path = db_path or settings.sqlite_db_path

    async def _get_connection(self) -> aiosqlite.Connection:
        conn = await aiosqlite.connect(self.db_path)
        conn.row_factory = aiosqlite.Row
        await conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    # -------------------------------------------------------------
    # Trade Analyses
    # -------------------------------------------------------------
    async def save_trade_analysis(
        self,
        underlying: str,
        position_type: str,
        spot_price: float,
        strike_price: float,
        premium: float,
        lot_size: int,
        num_lots: int,
        expiry_days: int,
        implied_volatility: Optional[float],
        risk_free_rate: Optional[float],
        brokerage: float,
        transaction_charges: float,
        slippage: float,
        available_capital: Optional[float],
        max_acceptable_loss: Optional[float],
        risk_classification: str,
        risk_score: float,
        max_loss: Optional[float],
        max_gain: Optional[float],
        break_even: float,
        full_result_json: str,
    ) -> int:
        query = """
        INSERT INTO trade_analyses (
            underlying, position_type, spot_price, strike_price, premium,
            lot_size, num_lots, expiry_days, implied_volatility, risk_free_rate,
            brokerage, transaction_charges, slippage, available_capital, max_acceptable_loss,
            risk_classification, risk_score, max_loss, max_gain, break_even, full_result_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        conn = await self._get_connection()
        try:
            cursor = await conn.execute(
                query,
                (
                    underlying,
                    position_type,
                    spot_price,
                    strike_price,
                    premium,
                    lot_size,
                    num_lots,
                    expiry_days,
                    implied_volatility,
                    risk_free_rate,
                    brokerage,
                    transaction_charges,
                    slippage,
                    available_capital,
                    max_acceptable_loss,
                    risk_classification,
                    risk_score,
                    max_loss,
                    max_gain,
                    break_even,
                    full_result_json,
                ),
            )
            await conn.commit()
            return cursor.lastrowid
        finally:
            await conn.close()

    async def get_trade_analysis(self, analysis_id: int) -> Optional[Dict[str, Any]]:
        conn = await self._get_connection()
        try:
            cursor = await conn.execute("SELECT * FROM trade_analyses WHERE id = ?", (analysis_id,))
            row = await cursor.fetchone()
            return dict(row) if row else None
        finally:
            await conn.close()

    # -------------------------------------------------------------
    # Behavioural Reflections
    # -------------------------------------------------------------
    async def save_behavioural_reflection(
        self,
        participant_id: Optional[str],
        trade_analysis_id: Optional[int],
        main_reason: Optional[str],
        social_media_source: Optional[bool],
        understands_max_loss: Optional[bool],
        acting_on_fomo: Optional[bool],
        recovering_losses: Optional[bool],
        influenced_by_screenshot: Optional[bool],
        loss_affects_essentials: Optional[bool],
        independent_evaluation: Optional[bool],
        flags_json: str,
        reflection_text: str,
    ) -> int:
        query = """
        INSERT INTO behavioural_reflections (
            participant_id, trade_analysis_id, main_reason, social_media_source,
            understands_max_loss, acting_on_fomo, recovering_losses,
            influenced_by_screenshot, loss_affects_essentials,
            independent_evaluation, flags_json, reflection_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        conn = await self._get_connection()
        try:
            cursor = await conn.execute(
                query,
                (
                    participant_id,
                    trade_analysis_id,
                    main_reason,
                    int(social_media_source) if social_media_source is not None else None,
                    int(understands_max_loss) if understands_max_loss is not None else None,
                    int(acting_on_fomo) if acting_on_fomo is not None else None,
                    int(recovering_losses) if recovering_losses is not None else None,
                    int(influenced_by_screenshot) if influenced_by_screenshot is not None else None,
                    int(loss_affects_essentials) if loss_affects_essentials is not None else None,
                    int(independent_evaluation) if independent_evaluation is not None else None,
                    flags_json,
                    reflection_text,
                ),
            )
            await conn.commit()
            return cursor.lastrowid
        finally:
            await conn.close()

    # -------------------------------------------------------------
    # Quiz Scores
    # -------------------------------------------------------------
    async def save_quiz_score(
        self,
        participant_id: Optional[str],
        session_id: Optional[str],
        score: int,
        total_questions: int,
        percentage: float,
        answers_json: str,
        concept_scores_json: str,
    ) -> int:
        query = """
        INSERT INTO quiz_scores (
            participant_id, session_id, score, total_questions, percentage, answers_json, concept_scores_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        conn = await self._get_connection()
        try:
            cursor = await conn.execute(
                query,
                (
                    participant_id,
                    session_id,
                    score,
                    total_questions,
                    percentage,
                    answers_json,
                    concept_scores_json,
                ),
            )
            await conn.commit()
            return cursor.lastrowid
        finally:
            await conn.close()

    # -------------------------------------------------------------
    # Research Module: Participants & Assessments
    # -------------------------------------------------------------
    async def create_participant(self, p: ResearchParticipantCreate) -> ResearchParticipant:
        import uuid
        participant_id = p.id or f"p_{uuid.uuid4().hex[:8]}"
        query = """
        INSERT INTO research_participants (id, group_assignment, age_band, experience_level, notes)
        VALUES (?, ?, ?, ?, ?)
        """
        conn = await self._get_connection()
        try:
            await conn.execute(
                query,
                (participant_id, p.group_assignment, p.age_band, p.experience_level, p.notes),
            )
            await conn.commit()
            cursor = await conn.execute("SELECT * FROM research_participants WHERE id = ?", (participant_id,))
            row = await cursor.fetchone()
            return ResearchParticipant(
                id=row["id"],
                created_at=str(row["created_at"]),
                group_assignment=row["group_assignment"],
                age_band=row["age_band"],
                experience_level=row["experience_level"],
                notes=row["notes"],
            )
        finally:
            await conn.close()

    async def get_participant(self, participant_id: str) -> Optional[ResearchParticipant]:
        conn = await self._get_connection()
        try:
            cursor = await conn.execute("SELECT * FROM research_participants WHERE id = ?", (participant_id,))
            row = await cursor.fetchone()
            if not row:
                return None
            return ResearchParticipant(
                id=row["id"],
                created_at=str(row["created_at"]),
                group_assignment=row["group_assignment"],
                age_band=row["age_band"],
                experience_level=row["experience_level"],
                notes=row["notes"],
            )
        finally:
            await conn.close()

    async def list_participants(self) -> List[ResearchParticipant]:
        conn = await self._get_connection()
        try:
            cursor = await conn.execute("SELECT * FROM research_participants ORDER BY created_at ASC")
            rows = await cursor.fetchall()
            return [
                ResearchParticipant(
                    id=row["id"],
                    created_at=str(row["created_at"]),
                    group_assignment=row["group_assignment"],
                    age_band=row["age_band"],
                    experience_level=row["experience_level"],
                    notes=row["notes"],
                )
                for row in rows
            ]
        finally:
            await conn.close()

    async def create_assessment(self, a: ResearchAssessmentCreate) -> ResearchAssessment:
        query = """
        INSERT INTO research_assessments (
            participant_id, stage, max_loss_accuracy, breakeven_accuracy,
            asymmetric_risk_recognition, willingness_to_trade, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        conn = await self._get_connection()
        try:
            cursor = await conn.execute(
                query,
                (
                    a.participant_id,
                    a.stage,
                    a.max_loss_accuracy,
                    a.breakeven_accuracy,
                    a.asymmetric_risk_recognition,
                    a.willingness_to_trade,
                    a.confidence,
                ),
            )
            await conn.commit()
            new_id = cursor.lastrowid
            cursor = await conn.execute("SELECT * FROM research_assessments WHERE id = ?", (new_id,))
            row = await cursor.fetchone()
            return ResearchAssessment(
                id=row["id"],
                created_at=str(row["created_at"]),
                participant_id=row["participant_id"],
                stage=row["stage"],
                max_loss_accuracy=row["max_loss_accuracy"],
                breakeven_accuracy=row["breakeven_accuracy"],
                asymmetric_risk_recognition=row["asymmetric_risk_recognition"],
                willingness_to_trade=row["willingness_to_trade"],
                confidence=row["confidence"],
            )
        finally:
            await conn.close()

    async def list_assessments(self, participant_id: Optional[str] = None) -> List[ResearchAssessment]:
        conn = await self._get_connection()
        try:
            if participant_id:
                cursor = await conn.execute(
                    "SELECT * FROM research_assessments WHERE participant_id = ? ORDER BY created_at ASC",
                    (participant_id,),
                )
            else:
                cursor = await conn.execute("SELECT * FROM research_assessments ORDER BY created_at ASC")
            rows = await cursor.fetchall()
            return [
                ResearchAssessment(
                    id=row["id"],
                    created_at=str(row["created_at"]),
                    participant_id=row["participant_id"],
                    stage=row["stage"],
                    max_loss_accuracy=row["max_loss_accuracy"],
                    breakeven_accuracy=row["breakeven_accuracy"],
                    asymmetric_risk_recognition=row["asymmetric_risk_recognition"],
                    willingness_to_trade=row["willingness_to_trade"],
                    confidence=row["confidence"],
                )
                for row in rows
            ]
        finally:
            await conn.close()

    async def get_all_research_records(self) -> List[Dict[str, Any]]:
        """Fetch combined participant and assessment records for CSV export and statistical evaluation."""
        query = """
        SELECT 
            p.id AS participant_id,
            p.group_assignment,
            p.age_band,
            p.experience_level,
            a.id AS assessment_id,
            a.stage,
            a.created_at AS assessment_time,
            a.max_loss_accuracy,
            a.breakeven_accuracy,
            a.asymmetric_risk_recognition,
            a.willingness_to_trade,
            a.confidence
        FROM research_participants p
        LEFT JOIN research_assessments a ON p.id = a.participant_id
        ORDER BY p.id, a.stage DESC
        """
        conn = await self._get_connection()
        try:
            cursor = await conn.execute(query)
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]
        finally:
            await conn.close()


trade_repository = TradeRepository()
