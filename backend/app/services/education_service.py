import random
from typing import Dict, List, Optional, Set, Tuple
from app.schemas.trade import QuizQuestion, QuizQuestionFull, QuizResult, QuizSubmission

QUESTION_BANK: List[QuizQuestionFull] = [
    QuizQuestionFull(
        id="q1",
        text="If you buy a NIFTY 24,000 Call option at a premium of ₹120, what is your break-even point at expiry (ignoring costs)?",
        options=["₹23,880", "₹24,000", "₹24,120", "₹24,240"],
        correct_answer=2,
        explanation="For a long call option, Break-even = Strike + Premium = 24,000 + 120 = 24,120.",
        concept_tag="break_even",
    ),
    QuizQuestionFull(
        id="q2",
        text="What is the theoretical maximum loss for an unhedged buyer of an Out-of-the-Money (OTM) Put option?",
        options=[
            "Unlimited",
            "The premium paid plus brokerage and transaction charges",
            "The strike price multiplied by lot size",
            "The difference between spot price and strike price",
        ],
        correct_answer=1,
        explanation="An option buyer can never lose more than the initial premium paid plus incidental transaction fees.",
        concept_tag="maximum_loss",
    ),
    QuizQuestionFull(
        id="q3",
        text="What is the theoretical maximum loss when selling (writing) a naked Call option without owning the underlying?",
        options=[
            "The premium collected",
            "The strike price",
            "Unlimited",
            "Zero",
        ],
        correct_answer=2,
        explanation="Because an underlying stock or index can theoretically rise indefinitely, an uncovered call seller faces unlimited loss potential.",
        concept_tag="short_option_risk",
    ),
    QuizQuestionFull(
        id="q4",
        text="If an option contract has a Delta of 0.40, how much will the option premium change if the underlying asset price rises by ₹10?",
        options=["₹0.40", "₹4.00", "₹10.00", "₹40.00"],
        correct_answer=1,
        explanation="Delta measures the rate of change of option price per unit change in underlying. 0.40 * ₹10 = ₹4.00.",
        concept_tag="greeks",
    ),
    QuizQuestionFull(
        id="q5",
        text="Which Greek measures the rate of time decay of an option contract as it approaches expiry?",
        options=["Delta", "Gamma", "Theta", "Vega"],
        correct_answer=2,
        explanation="Theta represents the dollar (or rupee) amount an option's premium decreases each day due to the passage of time.",
        concept_tag="time_decay",
    ),
    QuizQuestionFull(
        id="q6",
        text="When implied volatility (IV) crashes immediately after a major scheduled corporate earnings event, what usually happens to option premiums?",
        options=[
            "Both Call and Put premiums collapse (IV crush)",
            "Call premiums rise while Put premiums fall",
            "Option premiums remain unaffected",
            "Premiums double due to high volume",
        ],
        correct_answer=0,
        explanation="Vega connects IV to option value. An IV crush decreases extrinsic time value across both calls and puts simultaneously.",
        concept_tag="implied_volatility",
    ),
    QuizQuestionFull(
        id="q7",
        text="In Indian derivatives markets (NSE), what style of options are traded on indices like NIFTY 50?",
        options=[
            "American-style (exercisable any time before expiry)",
            "European-style (exercisable only at expiry)",
            "Bermudan-style",
            "Asian-style",
        ],
        correct_answer=1,
        explanation="Index options on NSE are European-style ('CE' / 'PE'), meaning settlement occurs strictly on expiry date with cash settlement.",
        concept_tag="option_structure",
    ),
    QuizQuestionFull(
        id="q8",
        text="If you sell a NIFTY 23,500 Put option for ₹150 with a lot size of 50, what is the maximum gross profit you can earn?",
        options=["₹7,500", "₹23,500", "₹1,175,000", "Unlimited"],
        correct_answer=0,
        explanation="An option seller's maximum gain is strictly capped at the premium collected: ₹150 * 50 = ₹7,500.",
        concept_tag="maximum_gain",
    ),
    QuizQuestionFull(
        id="q9",
        text="What happens to the Theta decay rate of an At-The-Money (ATM) option as expiry approaches?",
        options=[
            "Decay slows down",
            "Decay remains completely linear",
            "Decay accelerates exponentially in the final days",
            "Decay becomes zero",
        ],
        correct_answer=2,
        explanation="For ATM options, time decay accelerates sharply during the final week, resulting in steep erosion per day.",
        concept_tag="time_decay",
    ),
    QuizQuestionFull(
        id="q10",
        text="If your brokerage, STT, and slippage total ₹250 on a trade where you collected ₹1,000 premium, what percentage did transaction costs consume?",
        options=["2.5%", "10%", "25%", "40%"],
        correct_answer=2,
        explanation="Cost drag = (250 / 1000) * 100 = 25%. Frictional costs consume a quarter of your gross edge.",
        concept_tag="transaction_costs",
    ),
    QuizQuestionFull(
        id="q11",
        text="Why does buying deep Out-of-the-Money (OTM) options frequently lead to long-term retail portfolio depletion?",
        options=[
            "They have high delta",
            "They suffer from low probability of profit and rapid time decay to zero",
            "Brokers charge double margin for OTM options",
            "They cannot be sold before expiry",
        ],
        correct_answer=1,
        explanation="Deep OTM options have very low probability of expiring in-the-money. While cheap, frequent 100% losses compound rapidly.",
        concept_tag="probability_of_profit",
    ),
    QuizQuestionFull(
        id="q12",
        text="According to SEBI's official study on retail individual traders in the Indian equity F&O segment, approximately what percentage make net losses?",
        options=["Around 25%", "Around 50%", "Over 90%", "Less than 10%"],
        correct_answer=2,
        explanation="SEBI research revealed that over 90% (93% in recent studies) of active retail F&O traders incur net financial losses after transaction charges.",
        concept_tag="risk_awareness",
    ),
    QuizQuestionFull(
        id="q13",
        text="If you buy a Put option with strike 24,500 at premium ₹200 and at expiry the index closes at 24,000, what is your net profit per unit (ignoring fees)?",
        options=["₹300", "₹500", "₹200", "Loss of ₹200"],
        correct_answer=0,
        explanation="Intrinsic value at expiry = max(24,500 - 24,000, 0) = ₹500. Net profit = Intrinsic - Premium paid = 500 - 200 = ₹300.",
        concept_tag="break_even",
    ),
    QuizQuestionFull(
        id="q14",
        text="Which of the following creates a 'defined risk' option position?",
        options=[
            "Selling a naked call",
            "Selling a naked put",
            "Buying a call while simultaneously selling a higher strike call (Bull Call Spread)",
            "Averaging down on a declining short put",
        ],
        correct_answer=2,
        explanation="A vertical spread caps both maximum gain and maximum loss by holding an offsetting long strike, eliminating undefined tail risk.",
        concept_tag="risk_mitigation",
    ),
    QuizQuestionFull(
        id="q15",
        text="What is 'Gamma' risk in options trading?",
        options=[
            "The sensitivity of option price to changes in interest rates",
            "The acceleration of Delta per unit change in the underlying price",
            "The bid-ask spread on expiry day",
            "The currency exchange risk",
        ],
        correct_answer=1,
        explanation="Gamma is the second derivative of option price with respect to underlying spot. High gamma causes delta to swing violently.",
        concept_tag="greeks",
    ),
    QuizQuestionFull(
        id="q16",
        text="If an investor holds an underlying stock and buys a Put option on it to protect against a crash, this strategy is known as:",
        options=["Protective Put (Married Put)", "Covered Call", "Naked Short Put", "Straddle"],
        correct_answer=0,
        explanation="A Protective Put pairs a long equity position with a long put to establish a guaranteed minimum floor price.",
        concept_tag="hedging",
    ),
    QuizQuestionFull(
        id="q17",
        text="What is the effect of an increase in implied volatility on the price of a European Put option, holding all else constant?",
        options=[
            "Decreases put price",
            "Increases put price",
            "Has no effect on put price",
            "Changes put price to zero",
        ],
        correct_answer=1,
        explanation="Vega is strictly positive for standard long options. Higher volatility widens expected distribution of prices, increasing both call and put values.",
        concept_tag="implied_volatility",
    ),
    QuizQuestionFull(
        id="q18",
        text="What is the break-even price at expiry for a trader who sells a 23,000 Put at ₹180 premium?",
        options=["₹23,180", "₹23,000", "₹22,820", "₹22,640"],
        correct_answer=2,
        explanation="Break-even for Short Put = Strike - Premium = 23,000 - 180 = 22,820.",
        concept_tag="break_even",
    ),
    QuizQuestionFull(
        id="q19",
        text="If a trader risks ₹40,000 on a single weekly options trade with a total trading account size of ₹50,000, this violates which foundational risk rule?",
        options=[
            "Capital at Risk / Portfolio ruin allocation",
            "Put-Call Parity",
            "Exchange Settlement Rule",
            "Interest Rate Arbitrage",
        ],
        correct_answer=0,
        explanation="Risking 80% of account capital on a single short-horizon trade creates near certainty of total capital wipeout.",
        concept_tag="capital_at_risk",
    ),
    QuizQuestionFull(
        id="q20",
        text="Why does an option's extrinsic (time) value equal zero at the moment of expiry?",
        options=[
            "Because volatility goes to infinity",
            "Because there is no remaining time for future price uncertainty to develop",
            "Because exchange regulations cancel extrinsic value",
            "Because interest rates drop to zero",
        ],
        correct_answer=1,
        explanation="At expiry (T=0), all time uncertainty vanishes, and the contract is worth purely its intrinsic exercise value.",
        concept_tag="time_decay",
    ),
    QuizQuestionFull(
        id="q21",
        text="When does Put-Call Parity hold for European options?",
        options=[
            "Only when market is crashing",
            "Always in frictionless no-arbitrage equilibrium: C - P = S - K * exp(-r*T)",
            "Only for At-The-Money options",
            "Only on expiry day",
        ],
        correct_answer=1,
        explanation="Put-call parity is an exact structural arbitrage relationship connecting calls, puts, underlying spot, and risk-free discounting.",
        concept_tag="option_structure",
    ),
]


def get_quiz_questions(
    count: int = 10,
    exclude_ids: Optional[List[str]] = None,
    seed: Optional[int] = None,
) -> List[QuizQuestion]:
    """Retrieve sanitized quiz questions without leaking answers."""
    exclude_set = set(exclude_ids or [])
    available = [q for q in QUESTION_BANK if q.id not in exclude_set]

    # If count exceeds available non-excluded questions, fallback to entire bank
    if len(available) < count:
        available = QUESTION_BANK.copy()

    rng = random.Random(seed)
    selected = rng.sample(available, min(count, len(available)))

    return [
        QuizQuestion(
            id=q.id,
            text=q.text,
            options=q.options,
            concept_tag=q.concept_tag,
        )
        for q in selected
    ]


def evaluate_quiz_submission(submission: QuizSubmission) -> QuizResult:
    """Evaluate quiz responses, compute overall percentage and per-concept diagnostic metrics."""
    bank_map: Dict[str, QuizQuestionFull] = {q.id: q for q in QUESTION_BANK}
    
    score = 0
    feedback = []
    concept_stats: Dict[str, Dict[str, int]] = {}

    for qid, user_choice in submission.answers.items():
        question = bank_map.get(qid)
        if not question:
            continue

        is_correct = (user_choice == question.correct_answer)
        if is_correct:
            score += 1

        tag = question.concept_tag
        if tag not in concept_stats:
            concept_stats[tag] = {"correct": 0, "total": 0}
        concept_stats[tag]["total"] += 1
        if is_correct:
            concept_stats[tag]["correct"] += 1

        feedback.append(
            {
                "question_id": qid,
                "text": question.text,
                "user_answer": user_choice,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "explanation": question.explanation,
                "concept_tag": tag,
            }
        )

    total_submitted = max(1, len(submission.answers))
    percentage = round((score / total_submitted) * 100.0, 2)

    concept_scores = {}
    for tag, counts in concept_stats.items():
        pct = round((counts["correct"] / max(1, counts["total"])) * 100.0, 1)
        concept_scores[tag] = {
            "correct": counts["correct"],
            "total": counts["total"],
            "percentage": pct,
        }

    return QuizResult(
        score=score,
        total_questions=total_submitted,
        percentage=percentage,
        feedback=feedback,
        concept_scores=concept_scores,
    )
