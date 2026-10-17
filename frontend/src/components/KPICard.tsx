import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge = 'Demo Data',
  trend,
  variant = 'default',
}) => {
  let iconBg = 'bg-slate-100 text-slate-700';
  if (variant === 'danger') iconBg = 'bg-red-50 text-red-600';
  if (variant === 'warning') iconBg = 'bg-amber-50 text-amber-600';
  if (variant === 'success') iconBg = 'bg-emerald-50 text-emerald-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trend.positive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
