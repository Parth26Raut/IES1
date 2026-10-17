from typing import List
from app.schemas.trade import BehaviouralFlag, BehaviouralInput, BehaviouralResponse


def assess_behavioural_flags(input_data: BehaviouralInput) -> BehaviouralResponse:
    """Analyze trader self-assessment responses and construct transparent reflective feedback.

    Employs positive, educational, non-judgmental guidance. Does NOT pathologize or diagnose.
    """
    flags: List[BehaviouralFlag] = []
    recommendations: List[str] = []
    reflection_paragraphs: List[str] = []
    flag_score: float = 0.0

    # 1. Main Motivation Check
    if input_data.main_reason == "recovery":
        flags.append(
            BehaviouralFlag(
                flag_type="Loss Recovery Drive",
                severity="warning",
                headline="Revenge Trading & Urgency Bias",
                reflection_prompt="Trading with the goal of recovering past losses often accelerates risk-taking and creates pressure to accept unfavorable setups.",
            )
        )
        recommendations.append("Treat this trade as entirely independent from historical P&L.")
        flag_score += 20.0
    elif input_data.main_reason == "tip":
        flags.append(
            BehaviouralFlag(
                flag_type="External Tip Reliance",
                severity="warning",
                headline="External Conviction Bias",
                reflection_prompt="Following tips from telegram channels or social media removes personal risk validation and trade ownership.",
            )
        )
        recommendations.append("Conduct an independent technical or fundamental reason before placing capital at risk.")
        flag_score += 15.0
    elif input_data.main_reason == "fomo":
        flags.append(
            BehaviouralFlag(
                flag_type="FOMO Drive",
                severity="elevated",
                headline="Fear of Missing Out",
                reflection_prompt="Entering out of fear of missing a rally frequently results in buying at cycle tops or paying inflated implied volatility.",
            )
        )
        recommendations.append("Wait for a scheduled pullback or predefined retest level instead of chasing momentum.")
        flag_score += 20.0

    # 2. Social Media & Screenshots
    if input_data.social_media_source or input_data.influenced_by_screenshot:
        flags.append(
            BehaviouralFlag(
                flag_type="Social Media Influence",
                severity="warning",
                headline="Survivorship Bias Exposure",
                reflection_prompt="Social media profit screenshots rarely disclose underlying position hedges, lot sizes, or past losing trades.",
            )
        )
        recommendations.append("Remember that verified SEBI data shows 93% of retail option traders incur net financial losses.")
        flag_score += 15.0

    # 3. FOMO Self-Acknowledgment
    if input_data.acting_on_fomo:
        if not any(f.flag_type == "FOMO Drive" for f in flags):
            flags.append(
                BehaviouralFlag(
                    flag_type="FOMO Acknowledged",
                    severity="elevated",
                    headline="Pacing & Timing Friction",
                    reflection_prompt="Recognizing FOMO is a powerful first step. Slowing down execution by even 15 minutes allows analytical clarity to return.",
                )
            )
            flag_score += 15.0

    # 4. Recovering Losses
    if input_data.recovering_losses:
        if not any(f.flag_type == "Loss Recovery Drive" for f in flags):
            flags.append(
                BehaviouralFlag(
                    flag_type="Loss Recovery Acknowledged",
                    severity="warning",
                    headline="Capital Preservation Priority",
                    reflection_prompt="Attempting to win back prior losses in a single contract significantly increases portfolio volatility.",
                )
            )
            flag_score += 15.0

    # 5. Loss Affects Essentials
    if input_data.loss_affects_essentials:
        flags.append(
            BehaviouralFlag(
                flag_type="Essential Capital Risk",
                severity="severe",
                headline="High Stakes Stress Risk",
                reflection_prompt="Trading with funds needed for essential living expenses or emergency reserves generates intense stress that impairs decision-making.",
            )
        )
        recommendations.append("Immediate Pause: Do not deploy capital required for household commitments, rent, or emergency liquidity.")
        flag_score += 35.0

    # 6. Understands Max Loss
    if input_data.understands_max_loss is False:
        flags.append(
            BehaviouralFlag(
                flag_type="Max Loss Ambiguity",
                severity="elevated",
                headline="Undefined Risk Comprehension",
                reflection_prompt="Trading an option contract without clarity on worst-case rupee loss creates severe vulnerability to unexpected market gaps.",
            )
        )
        recommendations.append("Study the payoff diagram and worst-case scenario before submitting the order.")
        flag_score += 20.0

    # 7. Independent Evaluation
    if input_data.independent_evaluation is False:
        flags.append(
            BehaviouralFlag(
                flag_type="Absence of Independent Validation",
                severity="warning",
                headline="Process Verification Needed",
                reflection_prompt="Relying on external opinion without completing your own thesis leaves you uncertain of when to exit or take profit.",
            )
        )
        recommendations.append("Document your planned entry price, target price, and invalidation stop-loss in writing.")
        flag_score += 10.0

    # Compose structured reflection text
    if not flags:
        reflection_paragraphs.append(
            "Self-reflection indicates healthy pre-trade discipline. You have approached this setup with independent validation "
            "and clear boundaries around capital and loss tolerance."
        )
        recommendations.append("Maintain strict stop-loss adherence throughout the life of the position.")
    else:
        reflection_paragraphs.append(
            f"Pre-trade reflection identified {len(flags)} behavioural consideration(s) to reflect on before committing capital. "
            "Markets reward patience and emotional neutrality."
        )
        for f in flags:
            reflection_paragraphs.append(f"• {f.headline}: {f.reflection_prompt}")

    reflection_text = "\n\n".join(reflection_paragraphs)
    clamped_score = min(100.0, flag_score)

    return BehaviouralResponse(
        flags=flags,
        flag_count=len(flags),
        reflection_text=reflection_text,
        behavioural_score=round(clamped_score, 1),
        recommendations=recommendations,
    )
