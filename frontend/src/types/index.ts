export type PositionType = 'long_call' | 'long_put' | 'short_call' | 'short_put';

export interface TradeInput {
  underlying: string;
  position_type: PositionType;
  spot_price: number;
  strike_price: number;
  premium: number;
  lot_size: number;
  num_lots: number;
  expiry_days: number;
  implied_volatility: number;
  risk_free_rate: number;
  brokerage: number;
  transaction_charges: number;
  slippage: number;
  available_capital: number;
  max_acceptable_loss: number;
}

export interface ScenarioResult {
  scenario_name: string;
  spot_at_expiry: number;
  gross_pnl: number;
  net_pnl: number;
  return_on_premium: number;
}

export interface PayoffMetrics {
  total_premium: number;
  total_quantity: number;
  total_costs: number;
  max_loss: number | null; // null = unlimited
  max_gain: number | null; // null = unlimited
  breakeven_price: number;
  gross_pnl_at_scenarios: ScenarioResult[];
}

export interface RiskFinding {
  severity: 'info' | 'warning' | 'elevated' | 'severe';
  rule_id: string;
  metric_name: string;
  calculated_value: number | string;
  threshold: number | string;
  explanation: string;
  assumptions: string;
  educational_tip: string;
}

export interface TradeAnalysisResponse {
  trade_summary: Record<string, any>;
  payoff_metrics: PayoffMetrics;
  risk_findings: RiskFinding[];
  risk_classification: string;
  risk_score: number;
  risk_score_explanation: string;
  scenario_results: ScenarioResult[];
  model_assumptions: string[];
  data_quality: Record<string, any>;
  educational_explanation: string;
}

export interface BlackScholesInput {
  spot_price: number;
  strike_price: number;
  time_to_expiry: number; // in years
  risk_free_rate: number;
  implied_volatility: number;
  option_type: 'call' | 'put';
}

export interface BlackScholesResult {
  theoretical_price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  option_type: string;
}

export interface BehaviouralInput {
  main_reason: string | null;
  social_media_source: boolean | null;
  understands_max_loss: boolean | null;
  acting_on_fomo: boolean | null;
  recovering_losses: boolean | null;
  influenced_by_screenshot: boolean | null;
  loss_affects_essentials: boolean | null;
  independent_evaluation: boolean | null;
}

export interface BehaviouralResponse {
  flags: string[];
  reflection_text: string;
  concern_level: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct_index?: number;
  concept_tag: string;
  explanation?: string;
}

export interface QuizResult {
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  per_concept: Record<string, { correct: number; total: number }>;
  feedback: { question_id: string; correct: boolean; explanation: string }[];
}

export interface ResearchParticipant {
  id: string;
  age_band: string;
  experience_level: string;
  study_group: 'control' | 'intervention';
  baseline_score: number | null;
  posttest_score: number | null;
  created_at: string;
}

export interface ResearchSummary {
  total_participants: number;
  control_count: number;
  intervention_count: number;
  control_baseline_mean: number | null;
  control_posttest_mean: number | null;
  intervention_baseline_mean: number | null;
  intervention_posttest_mean: number | null;
  control_change: number | null;
  intervention_change: number | null;
  between_group_difference: number | null;
  is_demo_data: boolean;
}

export interface DashboardData {
  trades_analysed: number;
  high_risk_trades: number;
  risk_comprehension_score: number;
  potential_losses_examined: number;
  recent_analyses: (TradeAnalysisResponse & { timestamp: string; underlying?: string; position_type?: string })[];
  risk_distribution: { classification: string; count: number }[];
}

export interface UserSettings {
  default_underlying: string;
  default_nifty_lot: number;
  default_banknifty_lot: number;
  default_capital: number;
  dark_mode: boolean;
  api_key?: string;
  data_retention_days: number;
}
