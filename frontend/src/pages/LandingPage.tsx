import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Brain,
  BookOpen,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-900/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-slate-900">RISKWISE</span>
              <p className="text-[10px] uppercase font-semibold text-teal-600 tracking-wider">
                Pre-Trade Risk Intelligence
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <NavLink to="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </NavLink>
            <NavLink to="/trade-lab" className="hover:text-slate-900 transition-colors">
              Trade Lab
            </NavLink>
            <NavLink to="/wealth-trap" className="hover:text-slate-900 transition-colors">
              Wealth Trap
            </NavLink>
            <NavLink to="/learn-risk" className="hover:text-slate-900 transition-colors">
              Literacy Lab
            </NavLink>
            <NavLink to="/methodology" className="hover:text-slate-900 transition-colors">
              Methodology
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/trade-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Independent Pre-Trade Risk Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Before You Trade. <br />
              <span className="text-teal-600">Understand What You Risk.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              An intelligent pre-trade risk platform that translates options complexity into clear financial consequences.
              Eliminate hidden tail liabilities, compute precise worst-case scenarios, and counter behavioural FOMO before committing capital.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavLink
                to="/trade-lab"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-sm transition-all shadow-teal-900/10"
              >
                <span>Analyse a Trade</span>
                <ArrowRight className="w-5 h-5" />
              </NavLink>

              <NavLink
                to="/wealth-trap"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-base transition-all shadow-xs"
              >
                <span>Explore the Wealth Trap</span>
              </NavLink>
            </div>

            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Payoff Equations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Indian Rupee (₹) & IST Calibration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Gamification or Broker Ties</span>
              </div>
            </div>
          </div>

          {/* Sample Risk Analysis Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Risk Evaluation
                  </span>
                  <h3 className="text-base font-bold text-slate-900">NIFTY Weekly Naked Short Call</h3>
                </div>
                <RiskBadge level="severe" />
              </div>

              {/* Payoff quick metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50/70 border border-red-200">
                  <span className="text-[11px] font-medium text-red-700 uppercase">Worst-Case Loss</span>
                  <p className="text-lg font-extrabold text-red-800">Theoretically Unlimited</p>
                  <span className="text-[10px] text-red-600">Unhedged right side tail risk</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Max Capped Gain</span>
                  <p className="text-lg font-bold text-slate-900">₹8,125</p>
                  <span className="text-[10px] text-slate-500">Premium retained minus charges</span>
                </div>
              </div>

              {/* Risk finding callout */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Severe Risk Detected: Asymmetric Payoff Inversion</span>
                </div>
                <p className="text-slate-700">
                  You are risking unlimited portfolio liability for a maximum gain of ₹8,125. A sudden 3% gap-up at open would erase 100% of your maintenance margin.
                </p>
              </div>

              {/* Educational tip preview */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Calculated via Black-Scholes & SEBI Margins</span>
                <NavLink
                  to="/trade-lab"
                  className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Test this trade <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="py-16 bg-white border-y border-slate-200 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Architected For Discipline</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Three Pillars of Pre-Trade Intelligence
            </p>
            <p className="text-sm text-slate-500">
              Unlike typical brokers whose revenue scales with trade turnover, RISKWISE exists purely to protect retail capital by highlighting unexamined risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-teal-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Understand True Downside</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                See your maximum possible loss in actual Rupees (₹). Interactive charts show how much you could lose or earn, the price at which you break even, and the risks before placing a trade.
              </p>
              <div className="pt-2">
                <NavLink
                  to="/trade-lab"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Launch Trade Lab <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-teal-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Counter FOMO & Biases</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Simple behavioural checks help identify risky trading habits, such as trading to recover losses, blindly following social media tips, or using money needed for household expenses.
              </p>
              <div className="pt-2">
                <NavLink
                  to="/risk-intelligence"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Take Behavioural Check <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-teal-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Learn Before You Trade</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Objective financial literacy assessments measuring comprehension of Greeks, volatility crush, leverage multipliers, and empirical SEBI market data.
              </p>
              <div className="pt-2">
                <NavLink
                  to="/learn-risk"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Test Risk Literacy <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Maximum Loss Matters Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-[#0f172a] text-slate-100 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Core Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Maximum Loss Matters More Than Profit Projections
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              In financial derivatives, the math of loss recovery is brutally asymmetric. If an options trade loses 50% of your account capital, you need a 100% gain on the remaining capital just to get back to even. If you lose 90%, you require a 900% gain.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Brokers and social media algorithms emphasize upside payoff tickets. RISKWISE flips the paradigm: we ensure you are never surprised by total capital destruction.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <NavLink
                to="/trade-lab"
                className="px-6 py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors"
              >
                Simulate Your Position
              </NavLink>
              <NavLink
                to="/methodology"
                className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
              >
                Read Methodology & Formulae
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Educational Disclaimer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-900 tracking-wider">RISKWISE PLATFORM</span>
            <p className="text-xs text-slate-500">
              Academic Pre-Trade Risk Intelligence & Behavioural Architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <NavLink to="/methodology" className="hover:text-slate-900">
              Methodology
            </NavLink>
            <NavLink to="/wealth-trap" className="hover:text-slate-900">
              Evidence & Studies
            </NavLink>
            <NavLink to="/settings" className="hover:text-slate-900">
              Settings & Privacy
            </NavLink>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
          <strong>Mandatory Educational Disclaimer:</strong> RISKWISE is designed exclusively for educational, cognitive research, and risk awareness purposes. It does not provide investment advice, trading recommendations, portfolio management, or order routing services. Financial options and derivatives trading in India involve substantial risk of loss. SEBI research has shown that approximately 9 out of 10 individual traders in the equity F&O segment incur net financial losses.
        </div>
      </footer>
    </div>
  );
};
