import { DashboardData, TradeAnalysisResponse, UserSettings, ResearchParticipant } from '../types';

const STORAGE_KEYS = {
  DASHBOARD_DATA: 'riskwise_dashboard_data',
  RECENT_ANALYSES: 'riskwise_recent_analyses',
  SETTINGS: 'riskwise_user_settings',
  QUIZ_HISTORY: 'riskwise_quiz_history',
  RESEARCH_PARTICIPANTS: 'riskwise_research_participants',
};

export const DEFAULT_SETTINGS: UserSettings = {
  default_underlying: 'NIFTY',
  default_nifty_lot: 50,
  default_banknifty_lot: 15,
  default_capital: 100000,
  dark_mode: false,
  data_retention_days: 90,
};

export const DEFAULT_DEMO_DASHBOARD: DashboardData = {
  trades_analysed: 14,
  high_risk_trades: 6,
  risk_comprehension_score: 72,
  potential_losses_examined: 485000,
  risk_distribution: [
    { classification: 'Lower', count: 3 },
    { classification: 'Moderate', count: 5 },
    { classification: 'Elevated', count: 4 },
    { classification: 'Severe', count: 2 },
  ],
  recent_analyses: [
    {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      underlying: 'NIFTY',
      position_type: 'short_call',
      trade_summary: { underlying: 'NIFTY', position_type: 'short_call', quantity: 250 },
      payoff_metrics: {
        total_premium: 16250,
        total_quantity: 250,
        total_costs: 450,
        max_loss: null,
        max_gain: 15800,
        breakeven_price: 22765,
        gross_pnl_at_scenarios: [],
      },
      risk_findings: [
        {
          severity: 'severe',
          rule_id: 'R01_UNLIMITED_LOSS',
          metric_name: 'Maximum Loss Potential',
          calculated_value: 'Unlimited',
          threshold: '100% of capital',
          explanation: 'Short call has unbounded upside liability if the underlying rallies significantly.',
          assumptions: 'No stop loss orders executed.',
          educational_tip: 'Naked short options expose capital to theoretical infinite loss in extreme market gaps.',
        },
      ],
      risk_classification: 'Severe',
      risk_score: 88,
      risk_score_explanation: 'Unbounded loss exposure with high capital vulnerability.',
      scenario_results: [],
      model_assumptions: ['Black-Scholes European model with no intraday hedging'],
      data_quality: { status: 'Simulated User Scenario' },
      educational_explanation: 'This trade carries severe asymmetric risk. You stand to gain a small capped premium while exposing yourself to unlimited loss.',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      underlying: 'BANKNIFTY',
      position_type: 'long_call',
      trade_summary: { underlying: 'BANKNIFTY', position_type: 'long_call', quantity: 30 },
      payoff_metrics: {
        total_premium: 6600,
        total_quantity: 30,
        total_costs: 195,
        max_loss: 6795,
        max_gain: null,
        breakeven_price: 48420,
        gross_pnl_at_scenarios: [],
      },
      risk_findings: [
        {
          severity: 'warning',
          rule_id: 'R04_TIME_DECAY',
          metric_name: 'Theta Erosion',
          calculated_value: '5 days to expiry',
          threshold: '< 7 days',
          explanation: 'Option premium will decay exponentially in the final days before expiry.',
          assumptions: 'Constant IV and spot.',
          educational_tip: 'Options with under 7 days to expiry experience accelerated theta decay.',
        },
      ],
      risk_classification: 'Moderate',
      risk_score: 42,
      risk_score_explanation: 'Defined loss capped at premium paid; moderate time decay risk.',
      scenario_results: [],
      model_assumptions: ['Constant implied volatility across all scenarios'],
      data_quality: { status: 'User Hypothesis' },
      educational_explanation: 'Maximum loss is strictly limited to ₹6,795 (premium + statutory charges).',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      underlying: 'NIFTY',
      position_type: 'long_put',
      trade_summary: { underlying: 'NIFTY', position_type: 'long_put', quantity: 50 },
      payoff_metrics: {
        total_premium: 7500,
        total_quantity: 50,
        total_costs: 95,
        max_loss: 7595,
        max_gain: 1122405,
        breakeven_price: 22350,
        gross_pnl_at_scenarios: [],
      },
      risk_findings: [],
      risk_classification: 'Lower',
      risk_score: 22,
      risk_score_explanation: 'Capped risk matching personal loss tolerance.',
      scenario_results: [],
      model_assumptions: ['Standard options settlement'],
      data_quality: { status: 'Simulated User Scenario' },
      educational_explanation: 'Downside hedge position with strictly defined capital outlay.',
    },
  ],
};

export const storage = {
  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  getDashboardData: (): DashboardData => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with demo data
      storage.saveDashboardData(DEFAULT_DEMO_DASHBOARD);
      return DEFAULT_DEMO_DASHBOARD;
    } catch {
      return DEFAULT_DEMO_DASHBOARD;
    }
  },
  saveDashboardData: (data: DashboardData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save dashboard data', e);
    }
  },
  addTradeAnalysis: (analysis: TradeAnalysisResponse, inputUnderlying: string, inputPosition: string) => {
    const current = storage.getDashboardData();
    const newEntry = {
      ...analysis,
      timestamp: new Date().toISOString(),
      underlying: inputUnderlying,
      position_type: inputPosition,
    };
    const maxLossVal = analysis.payoff_metrics.max_loss ?? 150000;
    const isHighRisk = analysis.risk_score >= 60 || analysis.risk_classification === 'Severe' || analysis.risk_classification === 'Elevated';
    
    // Update distribution
    const distMap = new Map(current.risk_distribution.map(d => [d.classification, d.count]));
    const cls = analysis.risk_classification || 'Moderate';
    distMap.set(cls, (distMap.get(cls) || 0) + 1);

    const updated: DashboardData = {
      trades_analysed: current.trades_analysed + 1,
      high_risk_trades: isHighRisk ? current.high_risk_trades + 1 : current.high_risk_trades,
      risk_comprehension_score: Math.min(100, Math.max(0, current.risk_comprehension_score + (isHighRisk ? -1 : 2))),
      potential_losses_examined: current.potential_losses_examined + maxLossVal,
      risk_distribution: Array.from(distMap.entries()).map(([classification, count]) => ({ classification, count })),
      recent_analyses: [newEntry, ...current.recent_analyses.slice(0, 19)],
    };
    storage.saveDashboardData(updated);
  },

  getResearchParticipants: (): ResearchParticipant[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESEARCH_PARTICIPANTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveResearchParticipants: (participants: ResearchParticipant[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESEARCH_PARTICIPANTS, JSON.stringify(participants));
    } catch (e) {
      console.error('Failed to save research participants', e);
    }
  },
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DASHBOARD_DATA);
      localStorage.removeItem(STORAGE_KEYS.RECENT_ANALYSES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.RESEARCH_PARTICIPANTS);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
