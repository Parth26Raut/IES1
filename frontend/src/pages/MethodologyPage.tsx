import React from 'react';
import {
  BookOpen,
  Calculator,
  ShieldCheck,
  Scale,
  Database,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Methodology & Technical Specifications
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            Open Documentation
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Complete mathematical formulations, risk engine heuristics, scoring algorithms, and empirical limitations.
        </p>
      </div>

      {/* 1. Calculation Methodology */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calculator className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">1. Options Payoff & Valuation Models</h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            At expiration, financial options settle deterministically based on the closing spot price of the underlying asset relative to the contract strike price. Let <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">S</code> denote spot price at expiry, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">K</code> strike price, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">P</code> premium per unit, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">Q</code> contract quantity, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900">C</code> aggregate frictional costs (brokerage, STT, turnover charges, slippage).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Long Call (Buy Call)</span>
              <p className="font-mono text-xs text-teal-800">Payoff = max(0, S - K) × Q</p>
              <p className="font-mono text-xs text-slate-600">Net P&amp;L = Payoff - (P × Q) - C</p>
              <p className="text-[11px] text-slate-500">Max Loss: (P × Q) + C | Break-even: K + P + (C/Q)</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Long Put (Buy Put)</span>
              <p className="font-mono text-xs text-teal-800">Payoff = max(0, K - S) × Q</p>
              <p className="font-mono text-xs text-slate-600">Net P&amp;L = Payoff - (P × Q) - C</p>
              <p className="text-[11px] text-slate-500">Max Loss: (P × Q) + C | Break-even: K - P - (C/Q)</p>
            </div>

            <div className="p-4 rounded-lg bg-red-50/50 border border-red-200 space-y-1">
              <span className="font-bold text-red-900 block">Short Call (Sell Naked Call)</span>
              <p className="font-mono text-xs text-red-800">Payoff = - max(0, S - K) × Q</p>
              <p className="font-mono text-xs text-slate-600">Net P&amp;L = (P × Q) + Payoff - C</p>
              <p className="text-[11px] text-red-600 font-semibold">Max Loss: Theoretically Unlimited</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block">Short Put (Sell Naked Put)</span>
              <p className="font-mono text-xs text-amber-800">Payoff = - max(0, K - S) × Q</p>
              <p className="font-mono text-xs text-slate-600">Net P&amp;L = (P × Q) + Payoff - C</p>
              <p className="text-[11px] text-slate-600">Max Loss: (K - P) × Q + C</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Black-Scholes Theoretical Pricing &amp; Greeks</h4>
            <p className="text-xs text-slate-600">
              European vanilla pricing equations parameterized by risk-free rate (r), time to expiry in years (T), implied volatility (σ), spot (S), and strike (K). Normal cumulative probabilities calculated using standard rational Chebyshev approximations (Abramowitz &amp; Stegun 7.1.26).
            </p>
          </div>
        </div>
      </section>

      {/* 2. Risk Engine Rules */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">2. Deterministic Risk Engine Rule Catalog</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Rule R01: Unbounded Downside Tail (Severe)</span>
              <span className="font-mono text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Severity: Severe</span>
            </div>
            <p className="text-slate-600">
              Triggered whenever a naked short call position is evaluated without matching long calls or underlying shares. Imposes the maximum base penalty due to structural risk of infinite upside price movements.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Rule R02: Excessive Capital Concentration (Elevated / Severe)</span>
              <span className="font-mono text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">Severity: Elevated</span>
            </div>
            <p className="text-slate-600">
              Triggered when total committed premium exceeds 20% of user-reported liquid account capital. Exceeding 40% escalates the finding to Severe.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Rule R03: Personal Loss Tolerance Violation (Severe)</span>
              <span className="font-mono text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Severity: Severe</span>
            </div>
            <p className="text-slate-600">
              Triggered when calculated worst-case rupee loss exceeds the user’s self-declared acceptable loss limit.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Rule R04: Near-Term Theta Acceleration (Warning / Elevated)</span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Severity: Warning</span>
            </div>
            <p className="text-slate-600">
              Triggered when contract expiration is ≤ 3 calendar days. Long contracts suffer intense exponential decay; short contracts experience high gamma risk.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Rule R05: Deep Out-of-the-Money Lottery Bias (Warning)</span>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">Severity: Info/Warning</span>
            </div>
            <p className="text-slate-600">
              Triggered when strike price exceeds 4% distance from spot. Flags the statistical tendency of retail traders to treat low-premium options as cheap lotteries.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Scoring Methodology */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Scale className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">3. Composite Risk Scoring Formulation</h2>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
          <p>
            The RISKWISE Risk Score is an integer from 1 to 100 calculated by evaluating active rule penalties against predefined risk weights:
          </p>
          <div className="p-3 bg-slate-900 text-teal-400 font-mono text-xs rounded-lg">
            RiskScore = min(99, max(10, BaseScore + Σ Penalty(Rule_i)))
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li><strong>Severe Violations:</strong> +25 to +45 points each (e.g. unbounded loss, capital breach)</li>
            <li><strong>Elevated Violations:</strong> +15 to +20 points each (e.g. high capital concentration, expiry &lt; 3 days)</li>
            <li><strong>Warning Violations:</strong> +10 points each (e.g. far OTM distance, theta erosion)</li>
          </ul>
          <div className="pt-2">
            <span className="font-bold text-slate-900">Classification Tiers:</span>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Lower: &lt; 35</span>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Moderate: 35 – 54</span>
              <span className="px-2.5 py-1 rounded bg-orange-50 text-orange-800 border border-orange-200 font-semibold">Elevated: 55 – 74</span>
              <span className="px-2.5 py-1 rounded bg-red-50 text-red-800 border border-red-200 font-semibold">Severe: ≥ 75</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data Sources */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">4. Data Sources & Calibration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">Verified Empirical Benchmarks</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Securities and Exchange Board of India (SEBI) F&amp;O Trading Studies (2023, 2024)</li>
              <li>National Stock Exchange of India (NSE) Contract Multipliers &amp; Settlement Specifications</li>
              <li>Reserve Bank of India (RBI) 91-Day T-Bill Yield benchmarks</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">User-Supplied & Simulated Data</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Trade parameters (spot, strike, premium) represent user hypotheses</li>
              <li>Available capital and tolerance are self-reported</li>
              <li>Research lab cohort entries are simulated demo records</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Limitations */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">5. Methodological Limitations</h2>
        </div>

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>Liquidity and Discrete Execution:</strong> Payoff curves assume continuous European cash settlement at expiry. In live market conditions, intraday bid-ask spreads, sudden exchange circuit filters, and overnight margin adjustments can restrict an investor’s ability to exit at theoretical prices.
          </p>
          <p>
            <strong>Black-Scholes Assumptions:</strong> The Black-Scholes formula assumes constant volatility and log-normal asset returns. Real-world Indian equity index derivatives frequently experience volatility skew (volatility smile) and heavy tail distributions.
          </p>
        </div>
      </section>

      {/* 6. Formal Disclaimer */}
      <section className="p-6 rounded-xl bg-slate-900 text-slate-300 text-xs leading-relaxed space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <FileText className="w-4 h-4" />
          <span>Academic & Research Disclaimer</span>
        </div>
        <p>
          RISKWISE is an academic prototype and cognitive research platform. It does not operate as an Investment Adviser, Research Analyst, or Portfolio Manager under SEBI regulations. All information and analytical models are provided strictly for educational and self-reflection purposes. Past market performance or theoretical options calculations do not guarantee future financial results.
        </p>
      </section>
    </div>
  );
};
