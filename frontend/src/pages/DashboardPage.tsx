import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ShieldAlert,
  GraduationCap,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Clock,
  History,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { storage } from '../utils/localStorage';
import { formatINR, formatDate } from '../utils/format';
import { DashboardData } from '../types';

const CLASSIFICATION_COLORS: Record<string, string> = {
  Lower: '#10b981',
  Moderate: '#f59e0b',
  Elevated: '#f97316',
  Severe: '#ef4444',
};

const BEHAVIOURAL_TRIGGERS_DATA = [
  { trigger: 'Social Media Hype', count: 11 },
  { trigger: 'Loss Chasing / Revenge', count: 8 },
  { trigger: 'Fear of Missing Out (FOMO)', count: 14 },
  { trigger: 'Ignored Max Loss Calculation', count: 9 },
  { trigger: 'Essential Capital At Risk', count: 4 },
];

const OUTCOMES_DATA = [
  { scenario: 'Big Rally (+10%)', gain: 32000, loss: 0 },
  { scenario: 'Modest Up (+5%)', gain: 14500, loss: 0 },
  { scenario: 'Unchanged (0%)', gain: 0, loss: -7500 },
  { scenario: 'Modest Down (-5%)', gain: 0, loss: -18200 },
  { scenario: 'Crash (-10%)', gain: 0, loss: -46000 },
];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData>(() => storage.getDashboardData());

  useEffect(() => {
    setData(storage.getDashboardData());
  }, []);

  const handleResetData = () => {
    storage.clearAll();
    const fresh = storage.getDashboardData();
    setData(fresh);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Risk Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated pre-trade simulations, downside liability metrics, and cognitive risk posture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Reset to default demo dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <NavLink
            to="/trade-lab"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate New Trade</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Trades Analysed"
          value={data.trades_analysed}
          icon={BarChart3}
          subtitle="Simulations stored"
          badge="Demo Data"
          trend={{ value: '+4 this week', positive: true }}
        />
        <KPICard
          title="High-Risk Trades"
          value={data.high_risk_trades}
          icon={ShieldAlert}
          variant="danger"
          subtitle="Elevated / Severe risk detected"
          badge="Demo Data"
        />
        <KPICard
          title="Risk Comprehension Score"
          value={`${data.risk_comprehension_score}%`}
          icon={GraduationCap}
          variant="success"
          subtitle="Assessed literacy index"
          badge="Demo Data"
          trend={{ value: '+8% vs baseline', positive: true }}
        />
        <KPICard
          title="Potential Losses Examined"
          value={formatINR(data.potential_losses_examined)}
          icon={TrendingDown}
          variant="warning"
          subtitle="Cumulative worst-case downside"
          badge="Demo Data"
        />
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Risk Classification Distribution
              </h3>
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Demo Sample
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Proportion of analyzed options contracts categorized by severity of capital liability.
            </p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  dataKey="count"
                  nameKey="classification"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {data.risk_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLASSIFICATION_COLORS[entry.classification] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val, name) => [`${val} trades`, `${name}`]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Severe: Unbounded downside</span>
            <span>Lower: Strictly capped loss</span>
          </div>
        </div>

        {/* Simulated Outcomes Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Simulated Asymmetric Payoff Curve
              </h3>
              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Hypothetical Scenarios
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Net gains vs downside drawdowns across representative market move scenarios.
            </p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OUTCOMES_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <XAxis
                  dataKey="scenario"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <RechartsTooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Net P&L']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="gain" name="Gain" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" name="Loss" fill="#ef4444" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Positive move payoff</span>
            <span className="text-red-600 font-medium">Downside cliff exposure</span>
          </div>
        </div>
      </div>

      {/* Behavioural Trigger Summary Horizontal Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Behavioural Trigger Frequency
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Psychological drivers and decision heuristics identified during pre-trade reflections.
            </p>
          </div>
          <NavLink
            to="/risk-intelligence"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Open Behavioural Check <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="h-56 w-full my-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={BEHAVIOURAL_TRIGGERS_DATA}
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                dataKey="trigger"
                type="category"
                tick={{ fontSize: 11, fill: '#334155' }}
                width={130}
              />
              <RechartsTooltip
                formatter={(val) => [`${val} flags recorded`, 'Frequency']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analysis History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Recent Trade Simulations</h3>
          </div>
          <NavLink
            to="/trade-lab"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Launch Lab <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {data.recent_analyses && data.recent_analyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Timestamp (IST)</th>
                  <th className="py-3 px-6">Underlying</th>
                  <th className="py-3 px-6">Position</th>
                  <th className="py-3 px-6">Maximum Possible Loss</th>
                  <th className="py-3 px-6">Risk Classification</th>
                  <th className="py-3 px-6 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.recent_analyses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(item.timestamp || new Date())}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {item.underlying || item.trade_summary?.underlying || 'NIFTY'}
                    </td>
                    <td className="py-4 px-6 uppercase text-xs font-mono font-medium whitespace-nowrap">
                      {(item.position_type || item.trade_summary?.position_type || 'long_call').replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 font-bold whitespace-nowrap">
                      {item.payoff_metrics?.max_loss === null ? (
                        <span className="text-red-600 font-extrabold flex items-center gap-1">
                          Theoretically Unlimited
                        </span>
                      ) : (
                        <span className="text-slate-900">{formatINR(item.payoff_metrics?.max_loss)}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <RiskBadge level={item.risk_classification} />
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.risk_score}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Trade Analyses Yet"
            description="Use the Trade Lab to evaluate your first options setup with deterministic payoff models."
            actionLabel="Analyse First Trade"
            onAction={() => {
              window.location.href = '/trade-lab';
            }}
          />
        )}
      </div>
    </div>
  );
};
