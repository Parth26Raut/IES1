import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { PositionType } from '../types';
import { formatINR } from '../utils/format';

interface PayoffChartProps {
  strike: number;
  premium: number;
  position_type: PositionType;
  spot_price: number;
  quantity: number;
  costs: number;
  breakeven?: number;
}

interface ChartPoint {
  price: number;
  pnl: number;
  positivePnl: number;
  negativePnl: number;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  strike,
  premium,
  position_type,
  spot_price,
  quantity,
  costs,
  breakeven,
}) => {
  const data = useMemo(() => {
    const points: ChartPoint[] = [];
    const minPrice = Math.max(10, Math.floor(spot_price * 0.7));
    const maxPrice = Math.ceil(spot_price * 1.3);
    const steps = 60;
    const stepSize = (maxPrice - minPrice) / steps;

    const totalPremium = premium * quantity;

    for (let i = 0; i <= steps; i++) {
      const price = Math.round(minPrice + i * stepSize);
      let grossPnl = 0;

      if (position_type === 'long_call') {
        const payoff = Math.max(0, price - strike) * quantity;
        grossPnl = payoff - totalPremium;
      } else if (position_type === 'long_put') {
        const payoff = Math.max(0, strike - price) * quantity;
        grossPnl = payoff - totalPremium;
      } else if (position_type === 'short_call') {
        const payoff = Math.max(0, price - strike) * quantity;
        grossPnl = totalPremium - payoff;
      } else if (position_type === 'short_put') {
        const payoff = Math.max(0, strike - price) * quantity;
        grossPnl = totalPremium - payoff;
      }

      const netPnl = Math.round(grossPnl - costs);
      points.push({
        price,
        pnl: netPnl,
        positivePnl: netPnl >= 0 ? netPnl : 0,
        negativePnl: netPnl < 0 ? netPnl : 0,
      });
    }

    return points;
  }, [strike, premium, position_type, spot_price, quantity, costs]);

  // Compute gradient offset
  const { maxPnl, minPnl, gradientOffset } = useMemo(() => {
    const pnls = data.map((d) => d.pnl);
    const max = Math.max(...pnls, 1);
    const min = Math.min(...pnls, -1);

    if (max <= 0) return { maxPnl: max, minPnl: min, gradientOffset: 0 };
    if (min >= 0) return { maxPnl: max, minPnl: min, gradientOffset: 1 };

    return {
      maxPnl: max,
      minPnl: min,
      gradientOffset: max / (max - min),
    };
  }, [data]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Expiry Payoff Profile</h3>
          <p className="text-xs text-slate-500">
            Net P&L (₹) vs Index spot price across a ±30% range at contract expiration
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" />
            <span className="text-slate-600 font-medium">Profit Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/80 inline-block" />
            <span className="text-slate-600 font-medium">Loss Zone</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset={`${Math.round(gradientOffset * 100)}%`} stopColor="#10b981" stopOpacity={0.05} />
                <stop offset={`${Math.round(gradientOffset * 100)}%`} stopColor="#ef4444" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="price"
              tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
              label={{
                value: 'Spot Price at Expiry (INR)',
                position: 'insideBottom',
                offset: -12,
                fontSize: 11,
                fill: '#64748b',
              }}
            />
            <YAxis
              tickFormatter={(v) => formatINR(v, true)}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
              domain={['auto', 'auto']}
            />
            <RechartsTooltip
              formatter={(value: any) => [formatINR(Number(value)), 'Net P&L']}
              labelFormatter={(label: any) => `Spot at Expiry: ₹${Number(label).toLocaleString('en-IN')}`}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
            />
            {/* Zero PnL Reference Line */}
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />

            {/* Current Spot Reference Line */}
            <ReferenceLine
              x={spot_price}
              stroke="#0284c7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Current: ₹${spot_price.toLocaleString('en-IN')}`,
                position: 'top',
                fill: '#0284c7',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Break-even Reference Line */}
            {breakeven !== undefined && breakeven > 0 && (
              <ReferenceLine
                x={Math.round(breakeven)}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `BEP: ₹${Math.round(breakeven).toLocaleString('en-IN')}`,
                  position: 'bottom',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#0f172a"
              strokeWidth={2.5}
              fill="url(#payoffGradient)"
              activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Assumes static holding to expiry (European cash settlement)</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Current Spot
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Break-even Point
          </span>
        </div>
      </div>
    </div>
  );
};
