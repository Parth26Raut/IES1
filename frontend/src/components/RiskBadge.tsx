import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export type RiskLevel = 'info' | 'warning' | 'elevated' | 'severe' | 'Lower' | 'Moderate' | 'Elevated' | 'Severe' | string;

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', showIcon = true }) => {
  const normalized = level.toLowerCase();

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Info;
  let label = level;

  if (normalized === 'severe') {
    bgClass = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20';
    IconComponent = ShieldAlert;
    label = 'Severe Risk';
  } else if (normalized === 'elevated') {
    bgClass = 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/20';
    IconComponent = AlertTriangle;
    label = 'Elevated Risk';
  } else if (normalized === 'warning' || normalized === 'moderate') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    IconComponent = AlertCircle;
    label = normalized === 'moderate' ? 'Moderate Risk' : 'Warning';
  } else if (normalized === 'info' || normalized === 'lower' || normalized === 'low') {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    IconComponent = ShieldCheck;
    label = normalized === 'info' ? 'Information' : 'Lower Risk';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </span>
  );
};
