import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Brain,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { BehaviouralInput, BehaviouralResponse } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

interface QuestionConfig {
  id: keyof BehaviouralInput;
  title: string;
  subtitle: string;
  options: { label: string; value: any }[];
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 'main_reason',
    title: '1. What is your primary motivation for considering this trade?',
    subtitle: 'Identify whether this decision stems from a systematic strategy or emotional stimulus.',
    options: [
      { label: 'Structured trading strategy / predefined setup', value: 'strategy' },
      { label: 'Learning / low-stakes practice', value: 'practice' },
      { label: 'Based on an external tip or influencer alert', value: 'tip' },
      { label: 'Urgent feeling that the market will leave without me (FOMO)', value: 'fomo' },
      { label: 'Desire to quickly recover prior losses', value: 'loss_recovery' },
      { label: 'Generate quick cash for imminent expenses', value: 'cash_urgency' },
    ],
  },
  {
    id: 'social_media_source',
    title: '2. Did you discover this trade through social media or a messaging group?',
    subtitle: 'Telegram, YouTube, X (Twitter), Instagram, or WhatsApp groups.',
    options: [
      { label: 'Yes, discovered via social channel or channel alert', value: true },
      { label: 'No, self-sourced via personal market scanning', value: false },
      { label: 'Prefer not to say', value: null },
    ],
  },
  {
    id: 'understands_max_loss',
    title: '3. Do you know the exact maximum rupee loss possible if this trade fails?',
    subtitle: 'Absolute worst-case financial liability if held into expiration.',
    options: [
      { label: 'Yes, I know the exact rupee number and accept it', value: true },
      { label: 'I have a rough mental estimate only', value: false },
      { label: 'No, I have not calculated the maximum loss yet', value: false },
      { label: 'Options can only lose what I paid', value: false },
    ],
  },
  {
    id: 'acting_on_fomo',
    title: '4. Do you feel rushed to enter before the price runs away?',
    subtitle: 'Emotional urgency often degrades risk-to-reward evaluation.',
    options: [
      { label: 'Yes, I feel intense urgency to enter immediately', value: true },
      { label: 'Slightly hurried, but I have a planned entry', value: false },
      { label: 'No, completely calm and executing a scheduled plan', value: false },
    ],
  },
  {
    id: 'recovering_losses',
    title: '5. Are you using this trade to recoup recent drawdowns or losses?',
    subtitle: 'Revenge trading is the single most common cause of portfolio ruin.',
    options: [
      { label: 'Yes, I need to make back money lost earlier today or this week', value: true },
      { label: 'Partially, though this is a standard setup', value: false },
      { label: 'No, this trade is entirely independent of previous outcomes', value: false },
    ],
  },
  {
    id: 'influenced_by_screenshot',
    title: '6. Have you been motivated by screenshots of huge percentage returns?',
    subtitle: 'Cognitive anchoring to extreme tail-outcome profits.',
    options: [
      { label: 'Yes, saw someone post massive 200%+ gains in similar contracts', value: true },
      { label: 'Somewhat aware, but focusing on my own system', value: false },
      { label: 'No, screenshots do not factor into my risk process', value: false },
    ],
  },
  {
    id: 'loss_affects_essentials',
    title: '7. Would losing 100% of the money in this trade impact essential living expenses?',
    subtitle: 'Rent, groceries, loan EMIs, school fees, or emergency reserves.',
    options: [
      { label: 'Yes, this loss would create genuine personal or household hardship', value: true },
      { label: 'It would sting emotionally, but essentials are 100% protected', value: false },
      { label: 'No, this is purely discretionary risk capital', value: false },
    ],
  },
  {
    id: 'independent_evaluation',
    title: '8. Have you calculated break-even and payoff independently without relying on someone else?',
    subtitle: 'Personal verification of contract strike, premium, and theta decay.',
    options: [
      { label: 'Yes, I evaluated the strike, volatility, and break-even myself', value: true },
      { label: 'Only partially; mostly trusting the person who shared it', value: false },
      { label: 'No independent verification done', value: false },
    ],
  },
];

export const BehaviouralCheckPage: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, any>>({
    main_reason: null,
    social_media_source: null,
    understands_max_loss: null,
    acting_on_fomo: null,
    recovering_losses: null,
    influenced_by_screenshot: null,
    loss_affects_essentials: null,
    independent_evaluation: null,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BehaviouralResponse | null>(null);

  const handleSelect = (field: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.submitReflection(answers as BehaviouralInput);
      setResult(resp);
    } catch (err) {
      console.error('Reflection submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({
      main_reason: null,
      social_media_source: null,
      understands_max_loss: null,
      acting_on_fomo: null,
      recovering_losses: null,
      influenced_by_screenshot: null,
      loss_affects_essentials: null,
      independent_evaluation: null,
    });
    setResult(null);
  };

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pre-Trade Behavioural Diagnostic
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Cognitive Salience
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Unpack subconscious emotional triggers, FOMO impulses, and loss-chasing before executing your order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Responses</span>
        </button>
      </div>

      {/* Results Banner (If Submitted) */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Behavioural Reflection Summary</h2>
            </div>
            <RiskBadge level={result.concern_level} />
          </div>

          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-sm leading-relaxed">
            <p className="font-medium">{result.reflection_text}</p>
          </div>

          {result.flags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Identified Cognitive Biases ({result.flags.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {result.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Honest self-observation protects your trading capital far more than any indicator.
            </p>
            <NavLink
              to="/trade-lab"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Continue to Trade Lab</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      )}

      {/* 8 Question Form Cards */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Completed: <strong>{answeredCount} of {QUESTIONS.length}</strong> questions
          </span>
          <span className="text-teal-600 font-medium">No personal identifying data recorded</span>
        </div>

        {QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>
            </div>

            <div className="space-y-2 pt-1">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[q.id] === opt.value;
                return (
                  <label
                    key={oIdx}
                    onClick={() => handleSelect(q.id, opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-500 text-teal-950 font-semibold shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt.value)}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || answeredCount < 4}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            <span>{loading ? 'Evaluating Biases...' : 'Submit Reflection & Review Traps'}</span>
          </button>
          {answeredCount < 4 && (
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Please answer at least 4 questions to generate a meaningful behavioural diagnostic.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
