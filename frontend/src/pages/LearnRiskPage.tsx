import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Award,
  AlertTriangle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { QuizQuestion, QuizResult } from '../types';
import { api } from '../services/api';

const STORAGE_QUIZ_KEY = 'riskwise_literacy_quiz_state';

interface SavedQuizState {
  phase: 'pre_test' | 'intervention' | 'post_test' | 'completed';
  preTestResult: QuizResult | null;
  postTestResult: QuizResult | null;
}

export const LearnRiskPage: React.FC = () => {
  const [phase, setPhase] = useState<'pre_test' | 'intervention' | 'post_test' | 'completed'>('pre_test');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [preResult, setPreResult] = useState<QuizResult | null>(null);
  const [postResult, setPostResult] = useState<QuizResult | null>(null);

  // Load questions on mount or phase change
  useEffect(() => {
    loadSavedOrInit();
  }, []);

  const loadSavedOrInit = async () => {
    try {
      const saved = localStorage.getItem(STORAGE_QUIZ_KEY);
      if (saved) {
        const parsed: SavedQuizState = JSON.parse(saved);
        if (parsed.phase && parsed.preTestResult) {
          setPhase(parsed.phase);
          setPreResult(parsed.preTestResult);
          setPostResult(parsed.postTestResult);
          if (parsed.phase === 'post_test') {
            loadQuestions(['q1', 'q2', 'q3', 'q4', 'q5']);
          } else {
            setLoading(false);
          }
          return;
        }
      }
    } catch {
      // ignore
    }
    await startPreTest();
  };

  const startPreTest = async () => {
    setLoading(true);
    setPhase('pre_test');
    setCurrentIndex(0);
    setSelectedAnswers({});
    const qs = await api.getQuestions(8, []);
    setQuestions(qs);
    setLoading(false);
  };

  const loadQuestions = async (exclude: string[]) => {
    setLoading(true);
    const qs = await api.getQuestions(8, exclude);
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setLoading(false);
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit
      setLoading(true);
      const res = await api.submitQuiz(selectedAnswers);
      if (phase === 'pre_test') {
        setPreResult(res);
        setPhase('intervention');
        const stateToSave: SavedQuizState = {
          phase: 'intervention',
          preTestResult: res,
          postTestResult: null,
        };
        localStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(stateToSave));
      } else if (phase === 'post_test') {
        setPostResult(res);
        setPhase('completed');
        const stateToSave: SavedQuizState = {
          phase: 'completed',
          preTestResult: preResult,
          postTestResult: res,
        };
        localStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(stateToSave));
      }
      setLoading(false);
    }
  };

  const handleStartPostTest = async () => {
    const answeredIds = Object.keys(selectedAnswers);
    await loadQuestions(answeredIds);
    setPhase('post_test');
  };

  const handleReset = async () => {
    localStorage.removeItem(STORAGE_QUIZ_KEY);
    setPreResult(null);
    setPostResult(null);
    await startPreTest();
  };

  const currentQ = questions[currentIndex];
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Prepare chart comparison data if completed
  const chartData = React.useMemo(() => {
    if (!preResult || !postResult) return [];

    const allConcepts = Array.from(
      new Set([...Object.keys(preResult.per_concept), ...Object.keys(postResult.per_concept)])
    );

    return allConcepts.map((c) => {
      const pre = preResult.per_concept[c];
      const post = postResult.per_concept[c];

      const prePct = pre && pre.total > 0 ? Math.round((pre.correct / pre.total) * 100) : 0;
      const postPct = post && post.total > 0 ? Math.round((post.correct / post.total) * 100) : 0;

      return {
        concept: c,
        'Pre-Test Score (%)': prePct,
        'Post-Test Score (%)': postPct,
      };
    });
  }, [preResult, postResult]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title & Phase Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Risk Literacy Assessment
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {phase === 'pre_test'
                ? 'Phase 1: Baseline Pre-Test'
                : phase === 'intervention'
                ? 'Educational Intervention'
                : phase === 'post_test'
                ? 'Phase 2: Post-Intervention Test'
                : 'Assessment Completed'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Measure your pre-trade cognitive readiness, options payoff mechanics, and bias resistance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Assessment</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* PHASE 1 & PHASE 2 QUESTION RUNNER */}
      {/* ======================================================== */}
      {(phase === 'pre_test' || phase === 'post_test') && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <GraduationCap className="w-8 h-8 text-teal-600 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-800">Preparing assessment items...</p>
            </div>
          ) : currentQ ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Progress Bar & Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    Concept: {currentQ.concept_tag}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="py-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-500'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Select an option to proceed to the next item
                </span>
                <button
                  type="button"
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <span>{currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p>No questions found.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* EDUCATIONAL INTERVENTION (Between Pre and Post) */}
      {/* ======================================================== */}
      {phase === 'intervention' && preResult && (
        <div className="space-y-6">
          {/* Pre-Test Score Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pre-Test Results
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Baseline Score: {preResult.score_percentage}%
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Answered {preResult.correct_count} of {preResult.total_questions} items accurately.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartPostTest}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
              >
                <span>Proceed to Post-Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Educational Review of Questions */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Concept Feedback & Explanations</span>
              </h3>

              <div className="space-y-3">
                {preResult.feedback.map((f, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      f.correct ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {f.correct ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-900">Correctly Mastered</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-900">Review Opportunity</span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPLETED COMPARISON SCREEN */}
      {/* ======================================================== */}
      {phase === 'completed' && preResult && postResult && (
        <div className="space-y-6">
          {/* Comparison KPI Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Pre-Test vs Post-Test Assessment Comparison
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Evaluation Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Baseline Score</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{preResult.score_percentage}%</p>
                <span className="text-[11px] text-slate-400">Pre-intervention</span>
              </div>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                <span className="text-xs font-semibold text-teal-800 uppercase">Post-Test Score</span>
                <p className="text-3xl font-black text-teal-900 mt-1">{postResult.score_percentage}%</p>
                <span className="text-[11px] text-teal-700">Post-intervention</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Net Knowledge Shift</span>
                <p
                  className={`text-3xl font-black mt-1 ${
                    postResult.score_percentage >= preResult.score_percentage
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {postResult.score_percentage >= preResult.score_percentage ? '+' : ''}
                  {postResult.score_percentage - preResult.score_percentage} pp
                </p>
                <span className="text-[11px] text-slate-400">Percentage points</span>
              </div>
            </div>

            {/* Per-Concept Comparison BarChart */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Concept-Level Comprehension Comparison
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <XAxis dataKey="concept" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip
                      formatter={(val, name) => [`${val}%`, name]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      formatter={(v) => <span className="text-xs font-medium text-slate-700">{v}</span>}
                    />
                    <Bar dataKey="Pre-Test Score (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Post-Test Score (%)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Research Caveat / Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong>Methodological Caution:</strong>
                <p className="text-slate-700">
                  Immediate score improvement does not establish permanent cognitive learning. Testing immediately following an educational intervention reflects short-term recall; long-term behavioral transformation requires continuous risk salience in live trading conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
