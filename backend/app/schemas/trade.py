from typing import Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator


PositionType = Literal["long_call", "long_put", "short_call", "short_put"]
OptionType = Literal["call", "put"]
RiskClassification = Literal["lower", "moderate", "elevated", "severe"]
SeverityLevel = Literal["info", "warning", "elevated", "severe"]


class TradeInput(BaseModel):
    """Input payload representing an option trade structure."""
    underlying: str = Field(..., description="Ticker or underlying asset, e.g. NIFTY, BANKNIFTY")
    position_type: PositionType = Field(..., description="long_call, long_put, short_call, short_put")
    spot_price: float = Field(..., gt=0, description="Current price of underlying asset in INR")
    strike_price: float = Field(..., gt=0, description="Strike price of the contract in INR")
    premium: float = Field(..., ge=0, description="Option premium per unit in INR")
    lot_size: int = Field(..., ge=1, description="Number of units per contract lot")
    num_lots: int = Field(default=1, ge=1, description="Number of contract lots")
    expiry_days: int = Field(..., ge=0, description="Calendar days remaining until contract expiry")
    implied_volatility: Optional[float] = Field(
        default=None, ge=0, description="Implied volatility (percentage e.g. 15.5 or decimal e.g. 0.155)"
    )
    risk_free_rate: Optional[float] = Field(
        default=0.07, ge=0, le=100.0, description="Annualized risk-free interest rate (e.g. 0.07 or 7.0 for 7% MIBOR/RBI)"
    )
    brokerage: Optional[float] = Field(default=0.0, ge=0, description="Flat brokerage charges in INR")
    transaction_charges: Optional[float] = Field(
        default=0.0, ge=0, description="Regulatory and exchange charges (STT, GST, stamp duty) in INR"
    )
    slippage: Optional[float] = Field(default=0.0, ge=0, description="Estimated execution slippage per unit in INR")
    available_capital: Optional[float] = Field(
        default=None, gt=0, description="Total dedicated trading capital in INR"
    )
    max_acceptable_loss: Optional[float] = Field(
        default=None, gt=0, description="Maximum loss the trader is prepared to absorb in INR"
    )

    @field_validator("risk_free_rate", mode="before")
    @classmethod
    def normalize_risk_free_rate(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return 0.07
        try:
            val = float(v)
            if val > 1.0:
                return val / 100.0
            return val
        except (ValueError, TypeError):
            return 0.07

    @field_validator("position_type", mode="before")
    @classmethod
    def normalize_position_type(cls, v: str) -> str:
        if isinstance(v, str):
            v_clean = v.strip().lower().replace(" ", "_").replace("-", "_")
            return v_clean
        return v

    @property
    def total_quantity(self) -> int:
        return self.lot_size * self.num_lots

    @property
    def total_costs(self) -> float:
        # Brokerage + Transaction charges + (slippage per unit * quantity)
        slippage_total = (self.slippage or 0.0) * self.total_quantity
        return (self.brokerage or 0.0) + (self.transaction_charges or 0.0) + slippage_total

    @property
    def normalized_iv(self) -> Optional[float]:
        if self.implied_volatility is None:
            return None
        # If passed as percentage (e.g. 18.5), convert to decimal 0.185
        if self.implied_volatility > 1.0:
            return self.implied_volatility / 100.0
        return self.implied_volatility


class PayoffResult(BaseModel):
    """Result of payoff calculation at a specific underlying expiry price."""
    spot_at_expiry: float
    gross_pnl: float
    net_pnl: float
    is_profit: bool


class ScenarioResult(BaseModel):
    """Scenario evaluation across hypothetical underlying market moves."""
    scenario_name: str
    percentage_change: float
    spot_at_expiry: float
    gross_pnl: float
    net_pnl: float
    return_on_capital: Optional[float] = None


class PositionSummary(BaseModel):
    """Consolidated financial summary and risk characteristics for an option position."""
    position_type: PositionType
    underlying: str
    spot_price: float
    strike_price: float
    premium: float
    lot_size: int
    num_lots: int
    total_quantity: int
    break_even: float
    max_loss: Optional[float] = Field(
        None, description="Maximum potential monetary loss in INR. None indicates unlimited loss."
    )
    max_loss_formatted: str
    max_gain: Optional[float] = Field(
        None, description="Maximum potential monetary profit in INR. None indicates unlimited gain."
    )
    max_gain_formatted: str
    total_premium_inr: float
    total_costs_inr: float
    capital_at_risk_pct: Optional[float] = None
    risk_reward_ratio: Optional[str] = None
    moneyness: Literal["ITM", "ATM", "OTM"]
    intrinsic_value: float
    time_value: float


class RiskFinding(BaseModel):
    """Deterministic risk alert or diagnostic item generated by rules engine."""
    severity: SeverityLevel
    rule_id: str
    metric_name: str
    calculated_value: Union[float, str, None] = None
    threshold: Union[float, str, None] = None
    explanation: str
    assumptions: str
    educational_tip: str


class RiskEvaluationResponse(BaseModel):
    """Comprehensive pre-trade risk evaluation report."""
    trade_summary: PositionSummary
    payoff_metrics: PositionSummary
    risk_findings: List[RiskFinding]
    risk_classification: RiskClassification
    risk_score: float = Field(..., ge=0, le=100)
    risk_score_explanation: str
    scenario_results: List[ScenarioResult]
    model_assumptions: List[str]
    behavioural_reflection: Optional[Dict] = None
    data_quality: Dict[str, Union[bool, str, int]]
    educational_explanation: str


class BlackScholesInput(BaseModel):
    """Inputs for Black-Scholes European pricing and Greeks calculation."""
    spot_price: float = Field(..., gt=0)
    strike_price: float = Field(..., gt=0)
    time_to_expiry_days: float = Field(..., ge=0)
    risk_free_rate: float = Field(default=0.07, ge=0)
    implied_volatility: float = Field(..., ge=0)
    option_type: OptionType

    @field_validator("risk_free_rate", mode="before")
    @classmethod
    def normalize_rate(cls, v: float) -> float:
        if v is None:
            return 0.07
        try:
            val = float(v)
            if val > 1.0:
                return val / 100.0
            return val
        except (ValueError, TypeError):
            return 0.07

    @field_validator("implied_volatility", mode="before")
    @classmethod
    def normalize_iv(cls, v: float) -> float:
        try:
            val = float(v)
            if val > 1.0:
                return val / 100.0
            return val
        except (ValueError, TypeError):
            return 0.20


class GreeksResult(BaseModel):
    """Option sensitivities (Greeks) with market-standard Indian convention."""
    delta: float = Field(..., description="Dimensionless hedge ratio. Call: [0, 1], Put: [-1, 0]")
    gamma: float = Field(..., description="Rate of change of delta per INR 1 move in underlying")
    theta: float = Field(..., description="Time decay per calendar day in INR (negative for long)")
    vega: float = Field(..., description="Sensitivity per 1 percentage point (1%) shift in IV in INR")
    rho: Optional[float] = Field(default=0.0, description="Sensitivity per 1% move in interest rate")


class BlackScholesResult(BaseModel):
    """Black-Scholes analytical output including fair value and Greeks."""
    theoretical_price: float
    intrinsic_value: float
    time_value: float
    greeks: GreeksResult
    put_call_parity_difference: Optional[float] = None
    underlying_price: float
    strike_price: float
    days_to_expiry: float


class BehaviouralInput(BaseModel):
    """Self-reflection questionnaire responses from retail trader."""
    main_reason: Optional[Literal["income", "learning", "tip", "fomo", "recovery", "other"]] = None
    social_media_source: Optional[bool] = None
    understands_max_loss: Optional[bool] = None
    acting_on_fomo: Optional[bool] = None
    recovering_losses: Optional[bool] = None
    influenced_by_screenshot: Optional[bool] = None
    loss_affects_essentials: Optional[bool] = None
    independent_evaluation: Optional[bool] = None
    participant_id: Optional[str] = None
    trade_analysis_id: Optional[int] = None


class BehaviouralFlag(BaseModel):
    flag_type: str
    severity: SeverityLevel
    headline: str
    reflection_prompt: str


class BehaviouralResponse(BaseModel):
    flags: List[BehaviouralFlag]
    flag_count: int
    reflection_text: str
    behavioural_score: float
    recommendations: List[str]


class QuizQuestion(BaseModel):
    """Sanitized quiz question sent to client for knowledge assessment."""
    id: str
    text: str
    options: List[str]
    concept_tag: str


class QuizQuestionFull(QuizQuestion):
    """Internal quiz question structure with answer key and explanation."""
    correct_answer: int
    explanation: str


class QuizSubmission(BaseModel):
    """Quiz response submission payload."""
    participant_id: Optional[str] = None
    session_id: Optional[str] = None
    answers: Dict[str, int] = Field(..., description="Map of question_id to selected option index 0-3")


class QuizResult(BaseModel):
    score: int
    total_questions: int
    percentage: float
    feedback: List[Dict]
    concept_scores: Dict[str, Dict[str, Union[int, float]]]


class ResearchParticipantCreate(BaseModel):
    id: Optional[str] = None
    group_assignment: Literal["control", "intervention"]
    age_band: Optional[str] = None
    experience_level: Optional[str] = None
    notes: Optional[str] = None


class ResearchParticipant(BaseModel):
    id: str
    created_at: str
    group_assignment: Literal["control", "intervention"]
    age_band: Optional[str] = None
    experience_level: Optional[str] = None
    notes: Optional[str] = None


class ResearchAssessmentCreate(BaseModel):
    participant_id: str
    stage: Literal["baseline", "post"]
    max_loss_accuracy: float = Field(..., ge=0, le=1.0)
    breakeven_accuracy: float = Field(..., ge=0, le=1.0)
    asymmetric_risk_recognition: float = Field(..., ge=0, le=1.0)
    willingness_to_trade: float = Field(..., ge=0, le=1.0)
    confidence: float = Field(..., ge=0, le=1.0)


class ResearchAssessment(ResearchAssessmentCreate):
    id: int
    created_at: str


class ResearchSummary(BaseModel):
    total_participants: int
    control_count: int
    intervention_count: int
    group_metrics: Dict[str, Dict[str, Dict[str, float]]]
    statistical_comparison: Dict[str, Union[float, Dict[str, float], str]]
