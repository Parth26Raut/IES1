import React, { useState } from 'react';
import {
  Telescope,
  Sparkles,
  ExternalLink,
  BookOpen,
  ChevronRight,
  TrendingDown,
  Layers,
  Scale,
  Brain,
  Flame,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { CausalMap } from '../components/CausalMap';

interface SectionContent {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  paragraphs: string[];
  keyInsight: string;
}

const WEALTH_TRAP_SECTIONS: SectionContent[] = [
  {
    id: 'speed-of-wealth',
    title: '1. The Speed-of-Wealth Illusion',
    icon: Flame,
    paragraphs: [
      'The modern digital economy has truncated the psychological horizon of wealth accumulation. While historical index compounding operates over decades at 12–14% CAGR, retail derivative trading is routinely marketed as a mechanism to double or triple capital in days.',
      'This creates a cognitive distortion known as the "Speed-of-Wealth" illusion. Retail participants mistakenly equate high volatility and extreme leverage with accelerated wealth creation, ignoring the mathematical reality that high-variance betting paths have a terminal absorption boundary at zero.',
      'When returns are viewed through a compressed time frame, the probability of total ruin approaches unity for any strategy that repeatedly wagers large fractions of account equity without positive mathematical expectancy.',
    ],
    keyInsight:
      'True wealth compounds slowly through patience and reinvestment. Fast money mechanisms in derivatives almost invariably transfer capital from impatient retail buyers to market makers and institutions.',
  },
  {
    id: 'screenshots-bias',
    title: '2. Profit Screenshots & Distorted Risk Perception',
    icon: Layers,
    paragraphs: [
      'Social media feeds provide a non-representative sample of market reality. Traders who generate windfall gains on out-of-the-money options enthusiastically post green P&L screenshots, while the hundreds of losing trades from the same cohort remain invisible.',
      'This survivorship bias dramatically alters risk perception. Viewers subconsciously calibrate their probability estimates based on available digital evidence, assuming that 300% single-day returns are routine occurrences rather than low-probability tail outliers.',
      'Moreover, static screenshots completely omit critical contextual variables: the trader’s total net worth, unclosed open liabilities, prior drawdowns, or whether the trade was an unhedged leg of a larger portfolio hedge.',
    ],
    keyInsight:
      'A screenshot represents a single outcome node on a high-risk probability tree. Never mistake a winning lottery ticket for a sustainable investment strategy.',
  },
  {
    id: 'finfluencer-conflicts',
    title: '3. Fin-fluencers & Hidden Conflicts of Interest',
    icon: Scale,
    paragraphs: [
      'The economic model of online financial influencers ("fin-fluencers") is rarely aligned with their followers’ net financial well-being. Creators monetize through views, high-frequency broker referral commissions, paid telegram channels, and course subscriptions.',
      'Brokerage affiliate agreements frequently pay influencers based on active trade turnover or account generation rather than client profitability. Consequently, content that encourages frequent intraday zero-day options trading generates maximum affiliate revenue, even if it guarantees negative expected value for the subscriber.',
      'Regulatory authorities including SEBI have documented significant instances of unregistered entities offering guaranteed profit schemes or manipulating low-liquidity option strikes through digital channels.',
    ],
    keyInsight:
      'If an advisor profits from your trading volume or subscription fees rather than your audited performance, their incentives are directly misaligned with your capital preservation.',
  },
  {
    id: 'fomo-social-proof',
    title: '4. FOMO & Algorithmic Social Proof',
    icon: Brain,
    paragraphs: [
      'The Fear of Missing Out (FOMO) is an evolutionary heuristic that served humans well in tribal environments but proves fatal in modern capital markets. When peer groups in office chats or social forums discuss sudden trading gains, abstaining feels like an active financial penalty.',
      'Algorithmic recommendation engines actively amplify this anxiety by grouping engaging, emotionally charged speculative content into recommendation feeds, creating a false consensus that "everyone is trading options and getting rich".',
      'This peer pressure bypasses deliberate analytical reasoning, causing individuals to deploy capital without verifying contract strikes, implied volatility premiums, or worst-case payoff profiles.',
    ],
    keyInsight:
      'Markets penalize consensus herd behavior. Entering a trade because others claim to be profiting is the fastest route to buying overpriced volatility at market tops.',
  },
  {
    id: 'ai-anxiety',
    title: '5. AI Anxiety & Compounded Financial Urgency',
    icon: Sparkles,
    paragraphs: [
      'The rapid acceleration of generative AI and workforce automation has sparked widespread socioeconomic anxiety regarding job security, career longevity, and white-collar income stability.',
      'For many educated young professionals, this anxiety manifests as a desperate imperative to generate "parallel secondary income" or achieve financial independence before technological obsolescence strikes.',
      'Retail options trading is frequently rationalized as an accessible, high-yield digital side hustle. Tragically, turning to speculative derivatives under acute financial stress degrades emotional discipline and leads directly to oversized position sizing.',
    ],
    keyInsight:
      'Anxiety is the enemy of risk management. Using high-leverage derivatives as an antidote to career uncertainty almost always compounds financial distress rather than relieving it.',
  },
  {
    id: 'leverage-costs',
    title: '6. Leverage & The Silent Drag of Compounding Costs',
    icon: TrendingDown,
    paragraphs: [
      'Options inherently embed massive leverage. A ₹10,000 premium can control an index position worth ₹10,00,000. While leverage magnifies upside percentages, it equally magnifies frictional transaction costs.',
      'Retail traders often underestimate the aggregate impact of brokerage, Securities Transaction Tax (STT), exchange turnover fees, GST, and bid-ask slippage. On small account sizes with frequent turnover, statutory friction can consume 20% to 50% of nominal capital annually.',
      'Even a trader with a 50% directional win rate will see their capital steadily eroded by theta decay and non-negotiable exchange transaction costs.',
    ],
    keyInsight:
      'Frictional costs are deterministic; trading profits are probabilistic. In high-frequency options trading, the house edge of fees and slippage quietly erodes retail equity.',
  },
  {
    id: 'investing-vs-gambling',
    title: '7. Investing vs Speculation vs Gambling',
    icon: Scale,
    paragraphs: [
      'Investing involves allocating capital into productive enterprise assets that generate cash flows, dividends, and real economic value over long horizons with positive mathematical expectation.',
      'Speculation involves taking calculated, time-bounded directional risks where the outcome is uncertain but backed by structural advantages, rigorous position sizing, and asymmetry.',
      'Gambling occurs when market participants enter short-dated derivative contracts with negative mathematical expectancy, driven by adrenaline, hope, or arbitrary predictions without defining loss boundaries.',
    ],
    keyInsight:
      'If you cannot articulate the mathematical edge, the exact probability distribution, and your maximum loss in rupees, you are not trading — you are gambling with financial instruments.',
  },
  {
    id: 'risk-vs-prediction',
    title: '8. Understanding Risk ≠ Predicting Returns',
    icon: ShieldCheck,
    paragraphs: [
      'Retail market culture is obsessed with prediction: "Where will NIFTY close on Thursday?" "Will the market rally after the budget?" This obsession stems from the illusion that superior foresight is the key to trading success.',
      'Institutional risk managers understand that future market price movements are fundamentally non-deterministic and subject to sudden stochastic shocks. True competence lies not in predicting outcomes, but in sizing bets such that no single failure can cause ruin.',
      'Pre-trade intelligence means establishing rigid boundaries before entering a trade: understanding what happens if the trade is 100% wrong, and confirming that the worst-case scenario will not threaten your solvency.',
    ],
    keyInsight:
      'You cannot control the market’s direction, but you have 100% control over how much capital you risk. Master downside risk, and survival takes care of itself.',
  },
];

const EVIDENCE_TABLE = [
  {
    statistic: '89% of individual retail F&O traders incurred net losses',
    source: 'SEBI Research Report on Retail F&O Trading',
    date: 'January 2023',
    population: '45.2 Lakh individual active traders (FY22)',
    limitations: 'Covers FY19 and FY22 only; does not track algorithmic proprietary trading desks.',
  },
  {
    statistic: 'Average net loss per loss-making trader was ₹1.1 Lakh',
    source: 'SEBI Research Report on Retail F&O Trading',
    date: 'January 2023',
    population: 'Loss-making cohort in Indian equity derivatives',
    limitations: 'Includes transaction costs; excludes tax write-offs or individual net worth variance.',
  },
  {
    statistic: 'Loss makers spent an additional 28% of net losses on transaction charges',
    source: 'SEBI Follow-up Study on F&O Turnover',
    date: 'September 2024',
    population: 'All retail derivative accounts in India',
    limitations: 'Calculated across aggregate exchange and brokerage fees.',
  },
  {
    statistic: 'Over 93% of young traders (<25 yrs) incurred net losses in index options',
    source: 'SEBI Follow-up Study on F&O Turnover',
    date: 'September 2024',
    population: 'Traders aged 18-25 entering post-pandemic',
    limitations: 'Younger cohort exhibits higher turnover and lower average capital.',
  },
  {
    statistic: 'Algorithmic social media exposure correlates with higher speculative trading frequency',
    source: 'Academic Behavioral Finance Studies [Source required - specific Indian peer-reviewed paper]',
    date: '2023-2024',
    population: 'Retail smartphone trading cohorts',
    limitations: 'Observational data; confounding variables include bull-market sentiment.',
  },
];

export const WealthTrapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(WEALTH_TRAP_SECTIONS[0].id);
  const activeSection = WEALTH_TRAP_SECTIONS.find((s) => s.id === activeTab) || WEALTH_TRAP_SECTIONS[0];
  const ActiveIcon = activeSection.icon;

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Wealth Trap Observatory
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            Cognitive & Structural Analysis
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          An empirical exploration of the psychological vulnerabilities, digital ecosystems, and structural mechanics that entrap retail capital in Indian derivative markets.
        </p>
      </div>

      {/* 8 Sections Tabbed Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar / Tab buttons */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2 block">
            Observatory Modules
          </span>
          {WEALTH_TRAP_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isSelected = sec.id === activeTab;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold text-left transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 truncate">{sec.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
              </button>
            );
          })}
        </div>

        {/* Detailed Content Panel */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeSection.title}</h2>
              <span className="text-xs text-slate-400">Riskwise Cognitive Research Series</span>
            </div>
          </div>

          {/* Paragraphs */}
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            {activeSection.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Key Insight Box */}
          <div className="p-5 rounded-xl bg-slate-900 text-slate-100 space-y-2 border-l-4 border-teal-500">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Core Takeaway</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{activeSection.keyInsight}</p>
          </div>
        </div>
      </div>

      {/* Causal Hypothesis Map Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Psychological & Market Feedback Dynamics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore how structural stressors drive speculative behavior, and how deterministic risk salience disrupts the cycle.
          </p>
        </div>
        <CausalMap />
      </section>

      {/* Empirical Evidence & References Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>Empirical Evidence & Benchmark References</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official regulatory disclosures, empirical market studies, and verified behavioral datasets.
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            Official Regulatory Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Disclosed Statistic / Finding</th>
                <th className="py-3 px-4">Authoritative Source</th>
                <th className="py-3 px-4">Publication Date</th>
                <th className="py-3 px-4">Sample / Population</th>
                <th className="py-3 px-4">Methodological Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {EVIDENCE_TABLE.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-900 leading-snug">
                    {row.statistic}
                  </td>
                  <td className="py-3 px-4 font-medium text-teal-700">
                    {row.source}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {row.population}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] leading-relaxed">
                    {row.limitations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Citation Integrity Notice:</strong> RISKWISE adheres to strict academic citation standards. Any placeholder marked <em>[Source required]</em> indicates an ongoing literature review where empirical verification is currently being synthesized. We do not invent or fabricate citations.
          </span>
        </div>
      </section>
    </div>
  );
};
