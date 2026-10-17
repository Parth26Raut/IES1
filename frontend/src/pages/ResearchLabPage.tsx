import React, { useState, useEffect } from 'react';
import {
  Microscope,
  Users,
  BarChart3,
  Download,
  PlusCircle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
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
import { ResearchParticipant, ResearchSummary } from '../types';
import { api } from '../services/api';
import { storage } from '../utils/localStorage';
import { EmptyState } from '../components/EmptyState';

export const ResearchLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design' | 'participants' | 'results' | 'export'>('results');
  const [summary, setSummary] = useState<ResearchSummary | null>(null);
  const [participants, setParticipants] = useState<ResearchParticipant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state for adding participant
  const [ageBand, setAgeBand] = useState('25-34');
  const [experienceLevel, setExperienceLevel] = useState('Novice (<1 yr)');
  const [studyGroup, setStudyGroup] = useState<'control' | 'intervention'>('intervention');
  const [baselineScore, setBaselineScore] = useState<number>(45);
  const [posttestScore, setPosttestScore] = useState<number>(75);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const summ = await api.getResearchSummary();
    setSummary(summ);
    const pList = storage.getResearchParticipants();
    setParticipants(pList);
    setLoading(false);
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    await api.seedDemoData();
    await loadData();
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createParticipant({
      age_band: ageBand,
      experience_level: experienceLevel,
      study_group: studyGroup,
      baseline_score: baselineScore,
      posttest_score: posttestScore,
    });
    await loadData();
  };

  const handleDownloadCSV = async () => {
    try {
      const blob = await api.exportResearch();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riskwise_research_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleClearParticipants = () => {
    storage.saveResearchParticipants([]);
    loadData();
  };

  // Bar chart comparing groups
  const comparisonData = summary
    ? [
        {
          group: 'Control Group',
          Baseline: summary.control_baseline_mean || 0,
          Posttest: summary.control_posttest_mean || 0,
        },
        {
          group: 'Intervention Group',
          Baseline: summary.intervention_baseline_mean || 0,
          Posttest: summary.intervention_posttest_mean || 0,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Behavioral Research Lab
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              RCT Protocol Environment
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Empirical randomized controlled trial (RCT) measuring the efficacy of pre-trade risk salience interventions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'design' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Design
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'participants' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Participants ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'results' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trial Results
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'export' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Export
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDY DESIGN */}
      {/* ======================================================== */}
      {activeTab === 'design' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Experimental Protocol & Hypothesis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Methodological design framework for pre-trade risk salience trials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Control Arm Protocol</h3>
              <p>
                Participants enter simulated options trades under conventional broker interface framing: nominal contract price, percentage leverage, and standard order buttons without mandatory maximum loss calculation.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Standard options chain display</li>
                <li>No automated worst-case rupee loss calculation</li>
                <li>Standard regulatory risk disclaimer banner</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
              <h3 className="font-bold text-teal-950 text-sm">Intervention Arm Protocol</h3>
              <p>
                Participants are exposed to RISKWISE’s pre-trade intelligence interface: deterministic worst-case rupee loss calculations, interactive payoff curve charts, and cognitive reflection prompts.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-teal-900">
                <li>Deterministic worst-case loss framing in INR (₹)</li>
                <li>Visual asymmetric payoff charts before submission</li>
                <li>Explicit behavioural FOMO & revenge reflection checks</li>
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 text-slate-100 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Primary Outcome Metric</span>
            </div>
            <p className="text-sm font-semibold leading-relaxed">
              Between-group difference in post-test Risk Literacy & Loss Comprehension Score (percentage points change relative to baseline).
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <strong>Secondary Outcomes:</strong> Incidence of unhedged naked short order cancellations; average lot sizing reductions; self-reported FOMO resistance index.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PARTICIPANTS */}
      {/* ======================================================== */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Add Participant Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>Enroll Trial Participant</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSeedDemo}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  Seed Demo Cohort (12 Participants)
                </button>
                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearParticipants}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Clear all participants"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleAddParticipant} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age Band</label>
                <select
                  value={ageBand}
                  onChange={(e) => setAgeBand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trading Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Novice (<1 yr)">Novice (&lt;1 yr)</option>
                  <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                  <option value="Experienced (3+ yrs)">Experienced (3+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Study Group</label>
                <select
                  value={studyGroup}
                  onChange={(e) => setStudyGroup(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="intervention">Intervention Group</option>
                  <option value="control">Control Group</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Baseline Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={baselineScore}
                  onChange={(e) => setBaselineScore(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Add Participant
                </button>
              </div>
            </form>
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Enrolled Participants ({participants.length})
              </span>
              <span className="text-xs text-slate-400">Anonymized Subject IDs</span>
            </div>

            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Subject ID</th>
                      <th className="py-2.5 px-4">Age Band</th>
                      <th className="py-2.5 px-4">Experience</th>
                      <th className="py-2.5 px-4">Study Group</th>
                      <th className="py-2.5 px-4">Baseline Score</th>
                      <th className="py-2.5 px-4">Posttest Score</th>
                      <th className="py-2.5 px-4 text-right">Delta Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    {participants.map((p) => {
                      const delta =
                        p.posttest_score !== null && p.baseline_score !== null
                          ? p.posttest_score - p.baseline_score
                          : null;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{p.id}</td>
                          <td className="py-3 px-4 font-sans">{p.age_band}</td>
                          <td className="py-3 px-4 font-sans">{p.experience_level}</td>
                          <td className="py-3 px-4 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                p.study_group === 'intervention'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {p.study_group}
                            </span>
                          </td>
                          <td className="py-3 px-4">{p.baseline_score ?? '—'}%</td>
                          <td className="py-3 px-4">{p.posttest_score ?? '—'}%</td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              delta && delta > 0 ? 'text-emerald-600' : 'text-slate-500'
                            }`}
                          >
                            {delta !== null ? `${delta > 0 ? '+' : ''}${delta} pp` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No Trial Participants Enrolled"
                description="Click 'Seed Demo Cohort' to populate the trial with simulated study subjects, or enter participants manually."
                actionLabel="Seed Demo Cohort"
                onAction={handleSeedDemo}
              />
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TRIAL RESULTS */}
      {/* ======================================================== */}
      {activeTab === 'results' && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Total Participants</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{summary.total_participants}</p>
              <div className="flex gap-2 text-xs text-slate-500 mt-2">
                <span>Intervention: {summary.intervention_count}</span>
                <span>•</span>
                <span>Control: {summary.control_count}</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Intervention Shift</span>
              <p className="text-2xl font-black text-teal-600 mt-1">
                {summary.intervention_change !== null
                  ? `${summary.intervention_change > 0 ? '+' : ''}${summary.intervention_change} pp`
                  : 'N/A'}
              </p>
              <span className="text-xs text-slate-500">
                Baseline {summary.intervention_baseline_mean ?? '—'}% → Post {summary.intervention_posttest_mean ?? '—'}%
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Control Shift</span>
              <p className="text-2xl font-black text-slate-600 mt-1">
                {summary.control_change !== null
                  ? `${summary.control_change > 0 ? '+' : ''}${summary.control_change} pp`
                  : 'N/A'}
              </p>
              <span className="text-xs text-slate-500">
                Baseline {summary.control_baseline_mean ?? '—'}% → Post {summary.control_posttest_mean ?? '—'}%
              </span>
            </div>

            <div className="p-5 bg-teal-50 rounded-xl border border-teal-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-teal-800">Between-Group Diff (ATE)</span>
              <p className="text-2xl font-black text-teal-900 mt-1">
                {summary.between_group_difference !== null
                  ? `+${summary.between_group_difference} pp`
                  : 'N/A'}
              </p>
              <span className="text-xs text-teal-700">Estimated Average Treatment Effect</span>
            </div>
          </div>

          {/* Group Comparison Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Baseline vs Post-Intervention Score Comparison
              </h3>
              <span className="text-xs text-slate-400">Mean Percentage Score</span>
            </div>

            {summary.total_participants > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#334155' }} />
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
                    <Legend />
                    <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Posttest" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No Trial Data to Visualize"
                description="Seed demo participants to view comparative group distributions."
                actionLabel="Seed Demo Data"
                onAction={handleSeedDemo}
              />
            )}
          </div>

          {/* Limitations Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Trial Limitations & Hawthorne Effect:</strong>
              <p className="text-slate-700 leading-relaxed">
                Observed test score shifts represent short-term synthetic evaluation under research conditions. Subject awareness of being monitored (Hawthorne effect) and lack of live financial jeopardy may moderate true trading execution behavior.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATA EXPORT */}
      {/* ======================================================== */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              <span>Research Dataset Export</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download anonymized trial observations in standard CSV format for econometric analysis in R, Python, or Stata.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900">Included Variables:</h3>
            <p className="font-mono text-[11px] text-slate-600">
              subject_id, age_band, experience_level, study_group, baseline_score, posttest_score, timestamp
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Research Dataset (.CSV)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2">
            <strong>Data Privacy & Consent:</strong>
            <p>
              In accordance with ethical academic guidelines, exported records contain no Personally Identifiable Information (PII), IP addresses, or broker credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
