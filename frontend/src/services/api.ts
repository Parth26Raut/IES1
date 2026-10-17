import {
  TradeInput,
  TradeAnalysisResponse,
  BlackScholesInput,
  BlackScholesResult,
  BehaviouralInput,
  BehaviouralResponse,
  QuizQuestion,
  QuizResult,
  ResearchSummary,
  ResearchParticipant,
  ScenarioResult,
  RiskFinding,
  PayoffMetrics,
} from '../types';
import { storage } from '../utils/localStorage';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_BASE = RAW_BASE ? `${RAW_BASE}/api/v1` : '/api/v1';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// -------------------------------------------------------------
// LOCAL CALCULATION FALLBACK ENGINE (when backend is unreachable)
// -------------------------------------------------------------

function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPDF(x: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export function computeBlackScholes(input: BlackScholesInput): BlackScholesResult {
  const S = Math.max(0.001, input.spot_price);
  const K = Math.max(0.001, input.strike_price);
  const T = Math.max(0.0001, input.time_to_expiry);
  const r = input.risk_free_rate;
  const sigma = Math.max(0.0001, input.implied_volatility);

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);
  const n_minus_d1 = normalCDF(-d1);
  const n_minus_d2 = normalCDF(-d2);
  const pdfD1 = normalPDF(d1);

  let price = 0;
  let delta = 0;
  let theta = 0;

  if (input.option_type === 'call') {
    price = S * nd1 - K * Math.exp(-r * T) * nd2;
    delta = nd1;
    // Per day theta
    theta = (-(S * pdfD1 * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * nd2) / 365;
  } else {
    price = K * Math.exp(-r * T) * n_minus_d2 - S * n_minus_d1;
    delta = nd1 - 1;
    theta = (-(S * pdfD1 * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * n_minus_d2) / 365;
  }

  const gamma = pdfD1 / (S * sigma * sqrtT);
  const vega = (S * sqrtT * pdfD1) / 100; // per 1% change in vol

  return {
    theoretical_price: Math.max(0, Number(price.toFixed(2))),
    delta: Number(delta.toFixed(3)),
    gamma: Number(gamma.toFixed(5)),
    theta: Number(theta.toFixed(2)),
    vega: Number(vega.toFixed(2)),
    option_type: input.option_type,
  };
}

function calculateLocalAnalysis(input: TradeInput): TradeAnalysisResponse {
  const quantity = input.lot_size * input.num_lots;
  const totalPremium = input.premium * quantity;
  const totalCosts = input.brokerage + input.transaction_charges + input.slippage;

  let maxLoss: number | null = null;
  let maxGain: number | null = null;
  let breakevenPrice = 0;

  const isLong = input.position_type.startsWith('long');
  const isCall = input.position_type.endsWith('call');

  if (input.position_type === 'long_call') {
    maxLoss = totalPremium + totalCosts;
    maxGain = null; // Unlimited upside
    breakevenPrice = input.strike_price + input.premium + totalCosts / quantity;
  } else if (input.position_type === 'long_put') {
    maxLoss = totalPremium + totalCosts;
    maxGain = (input.strike_price - input.premium) * quantity - totalCosts;
    breakevenPrice = input.strike_price - input.premium - totalCosts / quantity;
  } else if (input.position_type === 'short_call') {
    maxLoss = null; // Unlimited loss
    maxGain = totalPremium - totalCosts;
    breakevenPrice = input.strike_price + input.premium - totalCosts / quantity;
  } else if (input.position_type === 'short_put') {
    maxLoss = (input.strike_price - input.premium) * quantity + totalCosts;
    maxGain = totalPremium - totalCosts;
    breakevenPrice = input.strike_price - input.premium + totalCosts / quantity;
  }

  // Generate 5 key scenarios
  const scenarioPercents = [
    { name: 'Strong Rally (+10%)', pct: 0.10 },
    { name: 'Moderate Advance (+5%)', pct: 0.05 },
    { name: 'Unchanged Spot (0%)', pct: 0.00 },
    { name: 'Moderate Decline (-5%)', pct: -0.05 },
    { name: 'Severe Drop (-10%)', pct: -0.10 },
  ];

  const scenarioResults: ScenarioResult[] = scenarioPercents.map((sc) => {
    const spotAtExpiry = Math.round(input.spot_price * (1 + sc.pct));
    let grossPnl = 0;

    if (input.position_type === 'long_call') {
      const intrinsic = Math.max(0, spotAtExpiry - input.strike_price) * quantity;
      grossPnl = intrinsic - totalPremium;
    } else if (input.position_type === 'long_put') {
      const intrinsic = Math.max(0, input.strike_price - spotAtExpiry) * quantity;
      grossPnl = intrinsic - totalPremium;
    } else if (input.position_type === 'short_call') {
      const intrinsic = Math.max(0, spotAtExpiry - input.strike_price) * quantity;
      grossPnl = totalPremium - intrinsic;
    } else {
      const intrinsic = Math.max(0, input.strike_price - spotAtExpiry) * quantity;
      grossPnl = totalPremium - intrinsic;
    }

    const netPnl = grossPnl - totalCosts;
    const baseDenom = isLong ? totalPremium : Math.max(1, input.available_capital);
    const returnOnPremium = Number(((netPnl / baseDenom) * 100).toFixed(2));

    return {
      scenario_name: sc.name,
      spot_at_expiry: spotAtExpiry,
      gross_pnl: Math.round(grossPnl),
      net_pnl: Math.round(netPnl),
      return_on_premium: returnOnPremium,
    };
  });

  const payoffMetrics: PayoffMetrics = {
    total_premium: totalPremium,
    total_quantity: quantity,
    total_costs: totalCosts,
    max_loss: maxLoss !== null ? Math.round(maxLoss) : null,
    max_gain: maxGain !== null ? Math.round(maxGain) : null,
    breakeven_price: Math.round(breakevenPrice * 100) / 100,
    gross_pnl_at_scenarios: scenarioResults,
  };

  // Risk findings engine
  const findings: RiskFinding[] = [];
  let riskScore = 20;

  // Rule 1: Unlimited Loss
  if (maxLoss === null) {
    findings.push({
      severity: 'severe',
      rule_id: 'R01_UNLIMITED_DOWNSIDE',
      metric_name: 'Loss Boundary',
      calculated_value: 'Unbounded / Unlimited',
      threshold: 'Capped Risk Profile',
      explanation: 'Short call positions incur theoretically unlimited financial liability if the index rallies aggressively.',
      assumptions: 'Assumes the contract is held into expiration without stop-loss execution.',
      educational_tip: 'Naked short positions expose traders to ruinous tail events. Defined-risk spreads cap this potential.',
    });
    riskScore += 45;
  }

  // Rule 2: Capital Exposure
  const capitalExposurePct = (totalPremium / Math.max(1, input.available_capital)) * 100;
  if (isLong && capitalExposurePct > 20) {
    findings.push({
      severity: capitalExposurePct > 40 ? 'severe' : 'elevated',
      rule_id: 'R02_CAPITAL_EXPOSURE',
      metric_name: 'Premium-to-Capital Ratio',
      calculated_value: `${capitalExposurePct.toFixed(1)}% of Capital`,
      threshold: 'Maximum 10% recommended',
      explanation: `Allocating ${capitalExposurePct.toFixed(1)}% of total liquid capital into a single options contract carries disproportionate concentration risk.`,
      assumptions: 'Zero recovery upon total expiry loss.',
      educational_tip: 'Professional risk frameworks typically allocate <2-5% of total portfolio value to single-leg speculative options.',
    });
    riskScore += capitalExposurePct > 40 ? 30 : 20;
  }

  // Rule 3: Loss Limit Breach
  if (maxLoss !== null && maxLoss > input.max_acceptable_loss) {
    const breachPct = (((maxLoss - input.max_acceptable_loss) / input.max_acceptable_loss) * 100).toFixed(0);
    findings.push({
      severity: 'severe',
      rule_id: 'R03_LOSS_LIMIT_VIOLATION',
      metric_name: 'Maximum Possible Loss vs Tolerance',
      calculated_value: `₹${maxLoss.toLocaleString('en-IN')}`,
      threshold: `₹${input.max_acceptable_loss.toLocaleString('en-IN')}`,
      explanation: `Worst-case loss exceeds your stated risk tolerance threshold by ${breachPct}%.`,
      assumptions: 'Full assignment or worthless expiration occurs.',
      educational_tip: 'Align trade lot size so that total worst-case capital drawdown is below your predetermined comfort threshold.',
    });
    riskScore += 25;
  }

  // Rule 4: High Theta Decay / Short Expiry
  if (input.expiry_days <= 3) {
    findings.push({
      severity: isLong ? 'elevated' : 'warning',
      rule_id: 'R04_EXPIRATION_THETA',
      metric_name: 'Calendar Days to Expiry',
      calculated_value: `${input.expiry_days} day(s)`,
      threshold: '>= 7 days',
      explanation: 'Ultrafast time decay (theta acceleration) severely erodes option value each trading hour near zero-day expiry.',
      assumptions: 'Constant underlying volatility and no rapid price spike.',
      educational_tip: 'Zero-day and near-term options behave like binary lottery tickets where theta decay outpaces slight market drift.',
    });
    riskScore += 15;
  }

  // Rule 5: OTM Strike Distance
  const moneynessPct = Math.abs(input.strike_price - input.spot_price) / input.spot_price;
  if (moneynessPct > 0.04) {
    findings.push({
      severity: 'warning',
      rule_id: 'R05_FAR_OTM_MOMENTUM',
      metric_name: 'Strike Distance from Spot',
      calculated_value: `${(moneynessPct * 100).toFixed(1)}% Out of the Money`,
      threshold: '< 2.0% distance',
      explanation: 'Deep out-of-the-money options require substantial directional momentum simply to avoid expiring worthless.',
      assumptions: 'Historical standard deviation distribution.',
      educational_tip: 'Retail traders frequently buy low-priced OTM options misjudging nominal price for low risk.',
    });
    riskScore += 10;
  }

  riskScore = Math.min(99, Math.max(10, riskScore));

  let classification = 'Lower';
  if (riskScore >= 75) classification = 'Severe';
  else if (riskScore >= 55) classification = 'Elevated';
  else if (riskScore >= 35) classification = 'Moderate';

  return {
    trade_summary: {
      underlying: input.underlying,
      position_type: input.position_type,
      total_quantity: quantity,
      strike: input.strike_price,
      spot: input.spot_price,
      entry_premium: input.premium,
    },
    payoff_metrics: payoffMetrics,
    risk_findings: findings,
    risk_classification: classification,
    risk_score: riskScore,
    risk_score_explanation: `Composite risk calculated at ${riskScore}/100 driven by ${findings.length} identified risk condition(s).`,
    scenario_results: scenarioResults,
    model_assumptions: [
      'Constant implied volatility throughout scenario evaluation',
      'Zero intraday slippage or liquidity gap during assignment',
      'Indian statutory STT, exchange charges and SEBI turnover fees estimated',
      'European index settlement at cash price on expiry day',
    ],
    data_quality: {
      mode: 'Client Analytical Model / Simulation',
      confidence: 'High for expiry payoff; model-dependent for Greeks',
    },
    educational_explanation:
      maxLoss === null
        ? 'CRITICAL: This position has unrestricted liability. A large adverse market movement could result in capital losses exceeding your total account balance.'
        : `Your maximum possible financial loss on this trade is exactly ₹${maxLoss.toLocaleString('en-IN')}. Even if the underlying moves dramatically in your favor, keep in mind you need the price to surpass ₹${breakevenPrice.toFixed(2)} to cover costs and premium.`,
  };
}

// -------------------------------------------------------------
// QUIZ QUESTIONS BANK
// -------------------------------------------------------------
const QUIZ_QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'If you buy a NIFTY Call option at ₹150 premium with a lot size of 50, what is your maximum possible loss?',
    options: [
      'Unlimited if the market crashes',
      'Exactly ₹7,500 (premium × lot size) plus brokerage/fees',
      'The strike price of the index',
      'Zero, because calls only make money',
    ],
    correct_index: 1,
    concept_tag: 'Option Payoff Mechanics',
    explanation:
      'For any long option (buying a call or put), your maximum loss is strictly capped at the total premium paid plus transaction costs.',
  },
  {
    id: 'q2',
    text: 'What happens to the time value (Theta) of an out-of-the-money option as the expiration date approaches?',
    options: [
      'It increases rapidly',
      'It remains completely constant',
      'It decays at an accelerating rate towards zero',
      'It turns into intrinsic value automatically',
    ],
    correct_index: 2,
    concept_tag: 'Theta & Time Decay',
    explanation:
      'Option time decay accelerates non-linearly, particularly in the final 7 days before weekly expiration.',
  },
  {
    id: 'q3',
    text: 'A social media fin-fluencer shares a screenshot showing ₹2,00,000 profit on a ₹10,000 capital outlay. What critical information is missing?',
    options: [
      'Which broker app they used',
      'The position sizing, stop-loss rules, number of previous losing trades, and probability of total capital loss',
      'The exact second the screenshot was taken',
      'Nothing; screenshots prove reliable investing skill',
    ],
    correct_index: 1,
    concept_tag: 'Behavioral Bias & Survivorship',
    explanation:
      'Screenshots reflect survivorship bias and single-trade outcomes without showing portfolio drawdown, trade frequency, or asymmetric risk.',
  },
  {
    id: 'q4',
    text: 'If you sell (write) a naked Call option without owning the underlying asset, what is your theoretical maximum risk?',
    options: [
      'Limited to the premium received',
      'Capped at 50% of your account balance',
      'Theoretically unlimited if the asset rallies steeply',
      'Strictly zero if held to expiry',
    ],
    correct_index: 2,
    concept_tag: 'Naked Options & Asymmetry',
    explanation:
      'Selling naked calls carries unbounded risk because an underlying asset has no theoretical upper price ceiling.',
  },
  {
    id: 'q5',
    text: 'What does SEBI’s landmark study on individual Indian F&O traders reveal?',
    options: [
      'Over 90% of active retail derivative traders made net losses over the analyzed periods',
      'Most retail traders beat mutual funds by 25%',
      'Options buying is consistently profitable for college students',
      'Trading costs and brokerage are negligible',
    ],
    correct_index: 0,
    concept_tag: 'Market Reality & SEBI Evidence',
    explanation:
      'SEBI official studies revealed 9 out of 10 retail derivatives traders incurred net losses, incurring significant transaction costs.',
  },
  {
    id: 'q6',
    text: 'Why does trading out of a desire to "recover previous losses" often lead to catastrophic drawdowns?',
    options: [
      'It causes traders to take larger, riskier bets (revenge trading) and ignore stop-losses',
      'Brokers increase brokerage fees after a loss',
      'The stock exchange tracks losing accounts to punish them',
      'Markets always move against traders who lost money',
    ],
    correct_index: 0,
    concept_tag: 'Behavioral Traps',
    explanation:
      'Revenge trading causes emotional escalation, excessive leverage, and abandonment of predefined risk boundaries.',
  },
  {
    id: 'q7',
    text: 'If Implied Volatility (IV) drops sharply immediately after an earnings announcement, what happens to option prices?',
    options: [
      'Both call and put option prices drop (IV crush), even if the price barely moved',
      'Both calls and puts double in value',
      'Only put options fall; calls always gain',
      'Implied volatility has no impact on pricing',
    ],
    correct_index: 0,
    concept_tag: 'Volatility & Vega',
    explanation:
      'A post-event collapse in implied volatility (IV crush) rapidly decreases option premiums regardless of direction.',
  },
  {
    id: 'q8',
    text: 'What does "Break-even" represent for a Call option buyer with Strike 22,000 and Premium ₹100?',
    options: [
      '22,000',
      '22,100 plus transaction charges per share',
      '21,900',
      '22,200',
    ],
    correct_index: 1,
    concept_tag: 'Option Payoff Mechanics',
    explanation:
      'To break even on a long call, the underlying must rise above the strike by at least the premium paid plus trading fees.',
  },
  {
    id: 'q9',
    text: 'Which of the following distinguishes disciplined risk management from gambling?',
    options: [
      'Predicting tomorrow’s closing price with 100% certainty',
      'Pre-defining maximum acceptable loss, sizing positions appropriately, and accepting probabilistic outcomes',
      'Using 10x margin to maximize potential return on a hunch',
      'Following telegram channels with guaranteed call tips',
    ],
    correct_index: 1,
    concept_tag: 'Investing vs Speculation vs Gambling',
    explanation:
      'Professional trading is based on disciplined position sizing, risk budgeting, and probabilistic thinking.',
  },
  {
    id: 'q10',
    text: 'Why is buying deep Out-Of-The-Money (OTM) options nicknamed a "lottery ticket"?',
    options: [
      'They have high probability of modest gains',
      'They appear cheap nominally but carry very low mathematical probability of finishing in-the-money before expiry',
      'The government runs options exchanges as lotteries',
      'Because they never lose money',
    ],
    correct_index: 1,
    concept_tag: 'Option Payoff Mechanics',
    explanation:
      'Deep OTM options suffer high decay and very low delta, causing most to expire completely worthless.',
  },
  // Additional questions for post-test variety
  {
    id: 'q11',
    text: 'What is "Delta" in options trading?',
    options: [
      'The speed at which the underlying price changes',
      'The estimated change in option price for a ₹1 move in the underlying asset',
      'The total commission paid to the broker',
      'The number of days until monthly expiration',
    ],
    correct_index: 1,
    concept_tag: 'Options Greeks',
    explanation:
      'Delta measures how much an option’s theoretical value moves when the underlying price changes by one unit.',
  },
  {
    id: 'q12',
    text: 'If you have ₹50,000 in your trading account, risking ₹40,000 on a single weekly expiry trade violates which core principle?',
    options: [
      'Capital preservation and position sizing risk rules',
      'SEBI exchange minimum balance requirement',
      'Tax deduction limit',
      'Broker referral bonus condition',
    ],
    correct_index: 0,
    concept_tag: 'Capital Management',
    explanation:
      'Committing 80% of account equity to a single weekly derivative bet invites high risk of total portfolio ruin.',
  },
];

// -------------------------------------------------------------
// API CLIENT IMPLEMENTATION
// -------------------------------------------------------------

export const api = {
  analyseTrade: async (input: TradeInput): Promise<TradeAnalysisResponse> => {
    try {
      return await fetchAPI<TradeAnalysisResponse>('/trades/analyse', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (err) {
      // Graceful local calculation fallback
      const localResult = calculateLocalAnalysis(input);
      // Save to local storage history
      storage.addTradeAnalysis(localResult, input.underlying, input.position_type);
      return localResult;
    }
  },

  getScenarios: async (input: TradeInput): Promise<ScenarioResult[]> => {
    try {
      return await fetchAPI<ScenarioResult[]>('/trades/scenarios', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      return calculateLocalAnalysis(input).scenario_results;
    }
  },

  priceOption: async (input: BlackScholesInput): Promise<BlackScholesResult> => {
    try {
      return await fetchAPI<BlackScholesResult>('/trades/price', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      return computeBlackScholes(input);
    }
  },

  evaluateRisk: async (input: TradeInput): Promise<{ findings: RiskFinding[]; score: number; classification: string }> => {
    try {
      return await fetchAPI('/risk/evaluate', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      const res = calculateLocalAnalysis(input);
      return {
        findings: res.risk_findings,
        score: res.risk_score,
        classification: res.risk_classification,
      };
    }
  },

  submitReflection: async (input: BehaviouralInput): Promise<BehaviouralResponse> => {
    try {
      return await fetchAPI<BehaviouralResponse>('/behavioural/reflect', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      const flags: string[] = [];
      let concern = 'Low';

      if (input.acting_on_fomo) {
        flags.push('FOMO Trigger: Urgency driven by fear of missing perceived market gains.');
        concern = 'Elevated';
      }
      if (input.recovering_losses) {
        flags.push('Loss Chasing: Attempting to recover prior drawdowns with higher stakes.');
        concern = 'Severe';
      }
      if (input.social_media_source || input.influenced_by_screenshot) {
        flags.push('External Influence: Decision anchored on external hype or unverified screenshots.');
        if (concern !== 'Severe') concern = 'Elevated';
      }
      if (input.loss_affects_essentials) {
        flags.push('Critical Capital Vulnerability: Potential loss impacts essential living expenses.');
        concern = 'Severe';
      }
      if (input.understands_max_loss === false) {
        flags.push('Unexamined Downside: Committing capital without clear comprehension of maximum loss.');
        if (concern !== 'Severe') concern = 'Elevated';
      }

      let reflectionText =
        'Your reflection indicates a measured, independent approach to risk evaluation. Maintain clear stop-loss limits.';
      if (concern === 'Severe') {
        reflectionText =
          'Pause and reflect. Committing essential capital to recover losses or chasing speculative opportunities often leads to compounding errors. We strongly advise stepping back and reviewing maximum loss exposure.';
      } else if (concern === 'Elevated') {
        reflectionText =
          'Notice how external momentum or FOMO might be influencing your timing. Verify if this trade aligns with your defined personal risk framework before committing capital.';
      }

      return {
        flags,
        reflection_text: reflectionText,
        concern_level: concern,
      };
    }
  },

  getQuestions: async (count = 10, exclude: string[] = []): Promise<QuizQuestion[]> => {
    try {
      return await fetchAPI<QuizQuestion[]>(`/education/questions?count=${count}&exclude=${exclude.join(',')}`);
    } catch {
      // Local question bank filtering
      const filtered = QUIZ_QUESTION_BANK.filter((q) => !exclude.includes(q.id));
      return filtered.slice(0, count);
    }
  },

  submitQuiz: async (answers: Record<string, number>): Promise<QuizResult> => {
    try {
      return await fetchAPI<QuizResult>('/education/submit', {
        method: 'POST',
        body: JSON.stringify(answers),
      });
    } catch {
      let correctCount = 0;
      const perConcept: Record<string, { correct: number; total: number }> = {};
      const feedback: { question_id: string; correct: boolean; explanation: string }[] = [];

      Object.entries(answers).forEach(([qId, selectedIdx]) => {
        const question = QUIZ_QUESTION_BANK.find((q) => q.id === qId);
        if (!question) return;

        const concept = question.concept_tag || 'General';
        if (!perConcept[concept]) {
          perConcept[concept] = { correct: 0, total: 0 };
        }
        perConcept[concept].total += 1;

        const isCorrect = selectedIdx === question.correct_index;
        if (isCorrect) {
          correctCount += 1;
          perConcept[concept].correct += 1;
        }

        feedback.push({
          question_id: qId,
          correct: isCorrect,
          explanation: question.explanation || (isCorrect ? 'Correct!' : 'Incorrect answer.'),
        });
      });

      const totalQuestions = Object.keys(answers).length;
      const scorePct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      return {
        total_questions: totalQuestions,
        correct_count: correctCount,
        score_percentage: scorePct,
        per_concept: perConcept,
        feedback,
      };
    }
  },

  getResearchSummary: async (): Promise<ResearchSummary> => {
    try {
      return await fetchAPI<ResearchSummary>('/research/summary');
    } catch {
      const participants = storage.getResearchParticipants();
      if (participants.length === 0) {
        return {
          total_participants: 0,
          control_count: 0,
          intervention_count: 0,
          control_baseline_mean: null,
          control_posttest_mean: null,
          intervention_baseline_mean: null,
          intervention_posttest_mean: null,
          control_change: null,
          intervention_change: null,
          between_group_difference: null,
          is_demo_data: true,
        };
      }

      const control = participants.filter((p) => p.study_group === 'control');
      const intervention = participants.filter((p) => p.study_group === 'intervention');

      const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

      const ctrlBase = avg(control.map((p) => p.baseline_score).filter((s): s is number => s !== null));
      const ctrlPost = avg(control.map((p) => p.posttest_score).filter((s): s is number => s !== null));
      const intBase = avg(intervention.map((p) => p.baseline_score).filter((s): s is number => s !== null));
      const intPost = avg(intervention.map((p) => p.posttest_score).filter((s): s is number => s !== null));

      const ctrlChg = ctrlPost !== null && ctrlBase !== null ? ctrlPost - ctrlBase : null;
      const intChg = intPost !== null && intBase !== null ? intPost - intBase : null;
      const diff = intChg !== null && ctrlChg !== null ? intChg - ctrlChg : null;

      return {
        total_participants: participants.length,
        control_count: control.length,
        intervention_count: intervention.length,
        control_baseline_mean: ctrlBase !== null ? Math.round(ctrlBase * 10) / 10 : null,
        control_posttest_mean: ctrlPost !== null ? Math.round(ctrlPost * 10) / 10 : null,
        intervention_baseline_mean: intBase !== null ? Math.round(intBase * 10) / 10 : null,
        intervention_posttest_mean: intPost !== null ? Math.round(intPost * 10) / 10 : null,
        control_change: ctrlChg !== null ? Math.round(ctrlChg * 10) / 10 : null,
        intervention_change: intChg !== null ? Math.round(intChg * 10) / 10 : null,
        between_group_difference: diff !== null ? Math.round(diff * 10) / 10 : null,
        is_demo_data: true,
      };
    }
  },

  createParticipant: async (data: Omit<ResearchParticipant, 'id' | 'created_at'>): Promise<ResearchParticipant> => {
    try {
      return await fetchAPI<ResearchParticipant>('/research/participants', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const participants = storage.getResearchParticipants();
      const newP: ResearchParticipant = {
        ...data,
        id: `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
      };
      participants.push(newP);
      storage.saveResearchParticipants(participants);
      return newP;
    }
  },

  submitAssessment: async (data: { participant_id: string; test_type: 'baseline' | 'posttest'; score: number }) => {
    try {
      return await fetchAPI('/research/assessments', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const participants = storage.getResearchParticipants();
      const idx = participants.findIndex((p) => p.id === data.participant_id);
      if (idx !== -1) {
        if (data.test_type === 'baseline') {
          participants[idx].baseline_score = data.score;
        } else {
          participants[idx].posttest_score = data.score;
        }
        storage.saveResearchParticipants(participants);
      }
      return { success: true };
    }
  },

  exportResearch: async (): Promise<Blob> => {
    try {
      const r = await fetch(`${API_BASE}/research/export`);
      if (r.ok) return await r.blob();
      throw new Error('Export API failed');
    } catch {
      const participants = storage.getResearchParticipants();
      const headers = 'ID,Age Band,Experience,Study Group,Baseline Score,Posttest Score,Created At\n';
      const rows = participants
        .map(
          (p) =>
            `${p.id},"${p.age_band}","${p.experience_level}",${p.study_group},${p.baseline_score ?? ''},${p.posttest_score ?? ''},"${p.created_at}"`
        )
        .join('\n');
      return new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    }
  },

  seedDemoData: async () => {
    try {
      return await fetchAPI('/research/seed-demo', { method: 'POST' });
    } catch {
      const demoParticipants: ResearchParticipant[] = [
        { id: 'DEMO-101', age_band: '25-34', experience_level: 'Novice (<1 yr)', study_group: 'intervention', baseline_score: 42, posttest_score: 78, created_at: '2026-10-10T09:30:00Z' },
        { id: 'DEMO-102', age_band: '18-24', experience_level: 'Novice (<1 yr)', study_group: 'control', baseline_score: 40, posttest_score: 45, created_at: '2026-10-10T10:15:00Z' },
        { id: 'DEMO-103', age_band: '35-44', experience_level: 'Intermediate (1-3 yrs)', study_group: 'intervention', baseline_score: 55, posttest_score: 85, created_at: '2026-10-11T11:00:00Z' },
        { id: 'DEMO-104', age_band: '25-34', experience_level: 'Novice (<1 yr)', study_group: 'intervention', baseline_score: 38, posttest_score: 75, created_at: '2026-10-11T14:20:00Z' },
        { id: 'DEMO-105', age_band: '25-34', experience_level: 'Intermediate (1-3 yrs)', study_group: 'control', baseline_score: 52, posttest_score: 54, created_at: '2026-10-12T08:45:00Z' },
        { id: 'DEMO-106', age_band: '45-54', experience_level: 'Experienced (3+ yrs)', study_group: 'intervention', baseline_score: 65, posttest_score: 92, created_at: '2026-10-12T16:30:00Z' },
        { id: 'DEMO-107', age_band: '18-24', experience_level: 'Novice (<1 yr)', study_group: 'control', baseline_score: 35, posttest_score: 38, created_at: '2026-10-13T10:00:00Z' },
        { id: 'DEMO-108', age_band: '35-44', experience_level: 'Novice (<1 yr)', study_group: 'intervention', baseline_score: 48, posttest_score: 82, created_at: '2026-10-13T12:30:00Z' },
        { id: 'DEMO-109', age_band: '25-34', experience_level: 'Intermediate (1-3 yrs)', study_group: 'control', baseline_score: 58, posttest_score: 60, created_at: '2026-10-14T09:10:00Z' },
        { id: 'DEMO-110', age_band: '25-34', experience_level: 'Novice (<1 yr)', study_group: 'intervention', baseline_score: 45, posttest_score: 80, created_at: '2026-10-14T15:40:00Z' },
        { id: 'DEMO-111', age_band: '18-24', experience_level: 'Novice (<1 yr)', study_group: 'control', baseline_score: 44, posttest_score: 46, created_at: '2026-10-15T11:20:00Z' },
        { id: 'DEMO-112', age_band: '35-44', experience_level: 'Experienced (3+ yrs)', study_group: 'intervention', baseline_score: 70, posttest_score: 95, created_at: '2026-10-15T14:00:00Z' },
      ];
      storage.saveResearchParticipants(demoParticipants);
      return { seeded: true, count: demoParticipants.length };
    }
  },

  health: async () => {
    try {
      return await fetchAPI('/health');
    } catch {
      return { status: 'healthy', mode: 'standalone_client' };
    }
  },
};
