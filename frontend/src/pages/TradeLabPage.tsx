import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Compass,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { TradeInput, TradeAnalysisResponse, BlackScholesResult } from '../types';
import {
  DEFAULT_TRADE_INPUT,
  PRESET_NIFTY_LONG_CALL,
  PRESET_BANKNIFTY_SHORT_PUT,
  PRESET_HIGH_RISK,
} from '../utils/presets';
import { api } from '../services/api';
import { formatINR, formatPercent } from '../utils/format';
import { Tooltip } from '../components/Tooltip';
import { RiskBadge } from '../components/RiskBadge';
import { PayoffChart } from '../components/PayoffChart';

export const TradeLabPage: React.FC = () => {
  const [inputs, setInputs] = useState<TradeInput>(DEFAULT_TRADE_INPUT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<TradeAnalysisResponse | null>(null);
  const [bsGreeks, setBsGreeks] = useState<BlackScholesResult | null>(null);
  const [showGreeks, setShowGreeks] = useState<boolean>(true);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  // Run analysis on mount and when explicit "Analyse Trade" is invoked
  useEffect(() => {
    runAnalysis(inputs);
  }, []);

  const validate = (form: TradeInput): boolean => {
    const errs: Record<string, string> = {};
    if (form.spot_price <= 0) errs.spot_price = 'Spot price must be positive';
    if (form.strike_price <= 0) errs.strike_price = 'Strike price must be positive';
    if (form.premium <= 0) errs.premium = 'Premium must be positive';
    if (form.lot_size <= 0) errs.lot_size = 'Lot size must be greater than 0';
    if (form.num_lots <= 0) errs.num_lots = 'Must trade at least 1 lot';
    if (form.expiry_days <= 0) errs.expiry_days = 'Expiry must be at least 1 day';
    if (form.implied_volatility <= 0) errs.implied_volatility = 'Implied volatility must be > 0';
    if (form.available_capital <= 0) errs.available_capital = 'Available capital must be positive';
    if (form.max_acceptable_loss < 0) errs.max_acceptable_loss = 'Max loss cannot be negative';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const runAnalysis = async (tradeForm: TradeInput) => {
    if (!validate(tradeForm)) return;

    setLoading(true);
    try {
      const res = await api.analyseTrade(tradeForm);
      setAnalysis(res);

      // Also compute Black-Scholes Greeks
      const greeks = await api.priceOption({
        spot_price: tradeForm.spot_price,
        strike_price: tradeForm.strike_price,
        time_to_expiry: tradeForm.expiry_days / 365,
        risk_free_rate: tradeForm.risk_free_rate / 100,
        implied_volatility: tradeForm.implied_volatility / 100,
        option_type: tradeForm.position_type.endsWith('call') ? 'call' : 'put',
      });
      setBsGreeks(greeks);
    } catch (e) {
      console.error('Failed to analyze trade', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TradeInput, val: any) => {
    const updated = { ...inputs, [field]: val };

    // Auto-update lot size if switching underlying
    if (field === 'underlying') {
      if (val === 'NIFTY') updated.lot_size = 50;
      else if (val === 'BANKNIFTY') updated.lot_size = 15;
    }

    setInputs(updated);
  };

  const applyPreset = (preset: TradeInput) => {
    setInputs(preset);
    runAnalysis(preset);
  };

  const toggleFindingExpand = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations for capital ratios
  const totalQuantity = inputs.lot_size * inputs.num_lots;
  const totalPremium = inputs.premium * totalQuantity;
  const isLong = inputs.position_type.startsWith('long');
  const maxLoss = analysis?.payoff_metrics.max_loss;
  const lossVsCapitalPct =
    maxLoss !== null && maxLoss !== undefined
      ? ((maxLoss / inputs.available_capital) * 100).toFixed(1)
      : null;
  const lossVsTolerancePct =
    maxLoss !== null && maxLoss !== undefined
      ? ((maxLoss / inputs.max_acceptable_loss) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      {/* Page Title & Preset Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pre-Trade Intelligence Lab
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Interactive Model
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Simulate options contracts under strict deterministic parameters and identify unhedged tail liabilities.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-400 mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset(PRESET_NIFTY_LONG_CALL)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            NIFTY Long Call
          </button>
          <button
            type="button"
            onClick={() => applyPreset(PRESET_BANKNIFTY_SHORT_PUT)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            BANKNIFTY Short Put
          </button>
          <button
            type="button"
            onClick={() => applyPreset(PRESET_HIGH_RISK)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 shadow-2xs transition-colors"
          >
            High Risk Example
          </button>
          <button
            type="button"
            onClick={() => applyPreset(DEFAULT_TRADE_INPUT)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT PANEL - TRADE INPUT FORM (4 cols on lg) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>Trade Parameters</span>
            </h2>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              User Hypothesis
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAnalysis(inputs);
            }}
            className="space-y-4 text-xs"
          >
            {/* Underlying & Position Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Underlying Asset
                  <Tooltip content="Target index or stock ticker. Lot sizes adjust dynamically." />
                </label>
                <select
                  value={inputs.underlying}
                  onChange={(e) => handleInputChange('underlying', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="NIFTY">NIFTY 50</option>
                  <option value="BANKNIFTY">BANKNIFTY</option>
                  <option value="FINNIFTY">FINNIFTY</option>
                  <option value="CUSTOM">Custom Equity</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Position Type
                  <Tooltip content="Long positions cap loss at premium. Short positions carry high/unbounded risk." />
                </label>
                <select
                  value={inputs.position_type}
                  onChange={(e) => handleInputChange('position_type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="long_call">Long Call (Buy)</option>
                  <option value="long_put">Long Put (Buy)</option>
                  <option value="short_call">Short Call (Sell)</option>
                  <option value="short_put">Short Put (Sell)</option>
                </select>
              </div>
            </div>

            {/* Spot Price & Strike Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Spot Price (₹)
                  <Tooltip content="Current underlying index level." />
                </label>
                <input
                  type="number"
                  value={inputs.spot_price}
                  onChange={(e) => handleInputChange('spot_price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    errors.spot_price ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.spot_price && <p className="text-red-500 text-[10px] mt-0.5">{errors.spot_price}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Strike Price (₹)
                  <Tooltip content="Contract exercise price." />
                </label>
                <input
                  type="number"
                  value={inputs.strike_price}
                  onChange={(e) => handleInputChange('strike_price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    errors.strike_price ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.strike_price && <p className="text-red-500 text-[10px] mt-0.5">{errors.strike_price}</p>}
              </div>
            </div>

            {/* Premium & Lot Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Premium / Unit (₹)
                  <Tooltip content="Quoted market premium per unit." />
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.premium}
                  onChange={(e) => handleInputChange('premium', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    errors.premium ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.premium && <p className="text-red-500 text-[10px] mt-0.5">{errors.premium}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lot Size (Units)
                  <Tooltip content="Standard contract multiplier (NIFTY=50, BANKNIFTY=15)." />
                </label>
                <input
                  type="number"
                  value={inputs.lot_size}
                  onChange={(e) => handleInputChange('lot_size', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                    errors.lot_size ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Number of Lots & Expiry Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number of Lots
                  <Tooltip content="Total contracts traded. Leverage scales directly with lot count." />
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputs.num_lots}
                  onChange={(e) => handleInputChange('num_lots', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expiry (Days)
                  <Tooltip content="Calendar days remaining until contract expiry." />
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputs.expiry_days}
                  onChange={(e) => handleInputChange('expiry_days', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Volatility & Risk-Free Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Implied Volatility (%)
                  <Tooltip content="Annualized market expectation of volatility (India VIX proxy)." />
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.implied_volatility}
                  onChange={(e) => handleInputChange('implied_volatility', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Risk-Free Rate (%)
                  <Tooltip content="Benchmark RBI 91-day T-Bill yield (currently ~6.5%)." />
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.risk_free_rate}
                  onChange={(e) => handleInputChange('risk_free_rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Friction & Costs Section */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Friction & Execution Charges (₹)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Brokerage</label>
                  <input
                    type="number"
                    value={inputs.brokerage}
                    onChange={(e) => handleInputChange('brokerage', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">STT & Taxes</label>
                  <input
                    type="number"
                    value={inputs.transaction_charges}
                    onChange={(e) => handleInputChange('transaction_charges', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Slippage</label>
                  <input
                    type="number"
                    value={inputs.slippage}
                    onChange={(e) => handleInputChange('slippage', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Capital & Personal Loss Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available Capital (₹)
                  <Tooltip content="Total liquid trading account balance." />
                </label>
                <input
                  type="number"
                  value={inputs.available_capital}
                  onChange={(e) => handleInputChange('available_capital', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Loss Limit (₹)
                  <Tooltip content="Maximum acceptable rupee loss before psychological or capital distress." />
                </label>
                <input
                  type="number"
                  value={inputs.max_acceptable_loss}
                  onChange={(e) => handleInputChange('max_acceptable_loss', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2 mt-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{loading ? 'Evaluating Model...' : 'Analyse Trade'}</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              All calculations executed deterministically based on provided inputs.
            </p>
          </form>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL - COMPREHENSIVE ANALYSIS RESULTS (8 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {analysis ? (
            <>
              {/* Section 1: Position Summary & Risk Classification Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {inputs.underlying} • {inputs.position_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <RiskBadge level={analysis.risk_classification} />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Total Quantity: {totalQuantity} units ({inputs.num_lots} lot{inputs.num_lots > 1 ? 's' : ''})
                    </h2>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Composite Risk Score</span>
                    <div className="text-2xl font-black text-slate-900">
                      {analysis.risk_score}
                      <span className="text-xs font-normal text-slate-400"> / 100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block">Total Premium</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatINR(totalPremium)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block">Trading Friction</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatINR(analysis.payoff_metrics.total_costs)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block">Break-even Spot</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{analysis.payoff_metrics.breakeven_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block">Capital At Stake</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {isLong
                        ? formatINR(totalPremium + analysis.payoff_metrics.total_costs)
                        : 'Margin + Unlimited Tail'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Payoff Metrics KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Max Loss Card */}
                <div
                  className={`p-5 rounded-xl border ${
                    maxLoss === null
                      ? 'bg-red-50 border-red-300'
                      : maxLoss !== undefined && maxLoss > inputs.max_acceptable_loss
                      ? 'bg-red-50/70 border-red-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide">Maximum Possible Loss</span>
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-xl font-black text-red-600">
                    {maxLoss === null ? 'Theoretically Unlimited' : formatINR(maxLoss)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {maxLoss === null
                      ? 'Unhedged short call exposes entire account balance'
                      : `${lossVsCapitalPct}% of available capital`}
                  </p>
                </div>

                {/* Max Gain Card */}
                <div className="p-5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide">Maximum Potential Gain</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-600">
                    {analysis.payoff_metrics.max_gain === null
                      ? 'Unlimited Upside'
                      : formatINR(analysis.payoff_metrics.max_gain)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isLong
                      ? 'Subject to directional momentum & theta decay'
                      : 'Capped at net collected premium'}
                  </p>
                </div>

                {/* Risk vs Tolerance Card */}
                <div className="p-5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-500 uppercase tracking-wide">Tolerance Budget</span>
                    <Compass className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {maxLoss === null
                      ? 'Exceeded'
                      : `${lossVsTolerancePct}% used`}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Target limit: {formatINR(inputs.max_acceptable_loss)}
                  </p>
                </div>
              </div>

              {/* Section 3: Interactive Payoff Chart */}
              <PayoffChart
                strike={inputs.strike_price}
                premium={inputs.premium}
                position_type={inputs.position_type}
                spot_price={inputs.spot_price}
                quantity={totalQuantity}
                costs={analysis.payoff_metrics.total_costs}
                breakeven={analysis.payoff_metrics.breakeven_price}
              />

              {/* Section 4: Scenario Analysis Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Scenario Matrix at Expiry
                  </h3>
                  <span className="text-xs text-slate-400">Calculated after statutory charges</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Market Scenario</th>
                        <th className="py-2.5 px-4">Spot at Expiry</th>
                        <th className="py-2.5 px-4">Gross P&L</th>
                        <th className="py-2.5 px-4">Net P&L (₹)</th>
                        <th className="py-2.5 px-4 text-right">Return on Stake</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                      {analysis.scenario_results.map((sc, idx) => {
                        const isProfit = sc.net_pnl > 0;
                        const isLoss = sc.net_pnl < 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-sans font-medium text-slate-900">{sc.scenario_name}</td>
                            <td className="py-3 px-4">₹{sc.spot_at_expiry.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4">{formatINR(sc.gross_pnl)}</td>
                            <td
                              className={`py-3 px-4 font-bold ${
                                isProfit ? 'text-emerald-600' : isLoss ? 'text-red-600' : 'text-slate-600'
                              }`}
                            >
                              {formatINR(sc.net_pnl)}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-bold ${
                                isProfit ? 'text-emerald-600' : isLoss ? 'text-red-600' : 'text-slate-600'
                              }`}
                            >
                              {formatPercent(sc.return_on_premium)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Risk Engine Findings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Risk Findings & Heuristic Flags ({analysis.risk_findings.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Deterministic Rule Engine</span>
                </div>

                {analysis.risk_findings.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.risk_findings.map((f) => {
                      const isExpanded = expandedFindings[f.rule_id];
                      return (
                        <div
                          key={f.rule_id}
                          className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-xs space-y-2 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <RiskBadge level={f.severity} />
                              <span className="font-bold text-slate-900">{f.metric_name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleFindingExpand(f.rule_id)}
                              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                            >
                              {isExpanded ? (
                                <>
                                  Less <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  Details <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-slate-700 leading-relaxed">{f.explanation}</p>

                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-200/80 space-y-2 text-[11px]">
                              <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <div>
                                  <span className="font-semibold text-slate-500">Calculated Value:</span>{' '}
                                  {f.calculated_value}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-500">Standard Threshold:</span>{' '}
                                  {f.threshold}
                                </div>
                              </div>
                              <div className="text-slate-500">
                                <span className="font-semibold">Assumptions:</span> {f.assumptions}
                              </div>
                              <div className="p-2.5 rounded bg-teal-50 border border-teal-200 text-teal-900 font-medium flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{f.educational_tip}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No critical rule violations detected for this configuration. Maximum loss is strictly bounded.</span>
                  </div>
                )}
              </div>

              {/* Section 6: Black-Scholes Greeks (Collapsible) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowGreeks(!showGreeks)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-bold text-slate-900">
                      Black-Scholes Theoretical Valuation & Greeks
                    </span>
                  </div>
                  {showGreeks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showGreeks && bsGreeks && (
                  <div className="p-6 space-y-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Theoretical Price</span>
                        <span className="text-base font-bold text-slate-900 font-mono">
                          ₹{bsGreeks.theoretical_price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Vs Market ₹{inputs.premium}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Delta (Δ)</span>
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {bsGreeks.delta}
                        </span>
                        <span className="text-[10px] text-slate-400">Price sensitivity</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Gamma (Γ)</span>
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {bsGreeks.gamma}
                        </span>
                        <span className="text-[10px] text-slate-400">Delta acceleration</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Theta (Θ)</span>
                        <span className="text-base font-bold text-slate-900 font-mono">
                          ₹{bsGreeks.theta} / day
                        </span>
                        <span className="text-[10px] text-slate-400">Daily decay</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block">Vega (ν)</span>
                        <span className="text-base font-bold text-slate-900 font-mono">
                          ₹{bsGreeks.vega}
                        </span>
                        <span className="text-[10px] text-slate-400">Per 1% IV shift</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <strong>Model Limitations:</strong> The Black-Scholes formula assumes log-normal returns, constant volatility, and frictionless continuous trading. Real-world Indian derivative markets exhibit volatility smiles, sudden weekend gap risk, and discrete jumps around major macro announcements.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 7: Plain-Language Explanation */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-6 text-xs text-teal-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-teal-900 text-sm">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Plain-Language Pre-Trade Assessment</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {analysis.educational_explanation}
                </p>
                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] text-teal-800">
                  <span>Assumptions: {analysis.model_assumptions[0]}</span>
                  <a href="/methodology" className="underline font-semibold hover:text-teal-950">
                    Review full assumptions
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FlaskConical className="w-8 h-8 text-teal-600 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-800">Initializing analytical engine...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
