import React, { useState } from 'react';
import { ArrowRight, Info, ShieldAlert, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface Pathway {
  id: string;
  title: string;
  category: 'negative' | 'positive';
  nodes: {
    title: string;
    description: string;
    badge: string;
  }[];
  hypothesis: string;
  confounders: string[];
}

const PATHWAYS: Pathway[] = [
  {
    id: 'urgency-path',
    title: 'Financial Pressure Pathway',
    category: 'negative',
    nodes: [
      {
        title: 'Macro/Financial Insecurity',
        description: 'Rising living costs, stagnant wage growth, or high aspirational goals create psychological urgency.',
        badge: 'Root Factor',
      },
      {
        title: 'Compounded Urgency',
        description: 'Desire to bypass slow compounding in favor of rapid asymmetric returns (the "Speed-of-Wealth" illusion).',
        badge: 'Cognitive Driver',
      },
      {
        title: 'High-Leverage Speculation',
        description: 'Disproportionate allocation into weekly naked or out-of-the-money options with catastrophic ruin probability.',
        badge: 'Observed Action',
      },
    ],
    hypothesis: 'Hypothesised relationship: Subjective economic stress lowers individual risk-aversion thresholds in retail derivative markets.',
    confounders: ['Disposable income variance', 'Prior financial literacy', 'Gambling propensity'],
  },
  {
    id: 'fomo-path',
    title: 'Digital Social Proof Pathway',
    category: 'negative',
    nodes: [
      {
        title: 'Social Media Amplification',
        description: 'Algorithms promote outlier profit screenshots and viral testimonial videos lacking loss context.',
        badge: 'External Stimulus',
      },
      {
        title: 'FOMO & Distorted Norms',
        description: 'Traders perceive options trading as an easy, everyday income stream with minimal cognitive complexity.',
        badge: 'Perceptual Bias',
      },
      {
        title: 'Heuristic Bypassing',
        description: 'Entering complex positions without calculating maximum loss, implied volatility impact, or breakeven hurdles.',
        badge: 'Decision Flaw',
      },
    ],
    hypothesis: 'Hypothesised relationship: Algorithmic exposure to survivorship-biased screenshots reduces time spent evaluating downside payoff.',
    confounders: ['Platform notification frequency', 'Age demographic', 'Trading app gamification'],
  },
  {
    id: 'education-path',
    title: 'Pre-Trade Intelligence Pathway (Intervention)',
    category: 'positive',
    nodes: [
      {
        title: 'Deterministic Risk Framing',
        description: 'Presenting explicit worst-case rupee loss and breakeven boundaries before order placement.',
        badge: 'Intervention',
      },
      {
        title: 'Heightened Risk Salience',
        description: 'Cognitive friction triggers deliberate reflection, overcoming hot-state emotional impulses.',
        badge: 'Cognitive Shift',
      },
      {
        title: 'Disciplined Capital Sizing',
        description: 'Reduction in oversized positions, avoidance of unhedged naked options, and adherence to loss limits.',
        badge: 'Target Outcome',
      },
    ],
    hypothesis: 'Hypothesised relationship: Mandatory pre-trade maximum loss salience significantly dampens high-risk options order submissions.',
    confounders: ['Intervention fatigue', 'Market volatility regime during test', 'User domain experience'],
  },
];

export const CausalMap: React.FC = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>('urgency-path');
  const active = PATHWAYS.find((p) => p.id === selectedPathway) || PATHWAYS[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Interactive Causal Hypothesis Map</h3>
            <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              Hypothesised Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examine how psychological catalysts, digital environments, and educational interventions interact in retail trading behavior.
          </p>
        </div>

        {/* Pathway selection tabs */}
        <div className="flex flex-wrap gap-2">
          {PATHWAYS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPathway(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPathway === p.id
                  ? p.category === 'positive'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes visual chain */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {active.nodes.map((node, idx) => (
          <div key={idx} className="relative flex flex-col">
            <div
              className={`h-full p-5 rounded-xl border transition-all ${
                active.category === 'positive'
                  ? 'bg-teal-50/40 border-teal-200 hover:border-teal-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-xs">
                  {node.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">Step 0{idx + 1}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">{node.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{node.description}</p>
            </div>

            {/* Connecting arrow for desktop */}
            {idx < active.nodes.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-xs items-center justify-center text-slate-500">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hypothesis Statement Box */}
      <div className="p-4 rounded-lg bg-slate-900 text-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Research Hypothesis Statement</span>
        </div>
        <p className="text-sm font-medium leading-relaxed">{active.hypothesis}</p>
      </div>

      {/* Confounding Variables & Limitations Callout */}
      <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Confounding Variables & Methodological Cautions</span>
        </div>
        <p className="text-slate-700">
          Correlation between these stages does not imply isolated causation. In natural trading environments, behavioral outcomes are concurrently modulated by:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {active.confounders.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-amber-200 text-slate-700 text-[11px]"
            >
              • {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
