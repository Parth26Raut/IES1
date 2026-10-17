import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Shield,
  Telescope,
  GraduationCap,
  Microscope,
  BookOpen,
  Settings,
  Menu,
  X,
  ShieldAlert,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyse a Trade', to: '/trade-lab', icon: FlaskConical },
  { name: 'Risk Intelligence', to: '/risk-intelligence', icon: Shield },
  { name: 'Wealth Trap Observatory', to: '/wealth-trap', icon: Telescope },
  { name: 'Learn Risk', to: '/learn-risk', icon: GraduationCap },
  { name: 'Research Lab', to: '/research-lab', icon: Microscope },
  { name: 'Methodology & Sources', to: '/methodology', icon: BookOpen },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-100 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <NavLink
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-900/30 group-hover:bg-teal-500 transition-colors">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white">RISKWISE</span>
                <p className="text-[10px] uppercase font-semibold text-teal-400 tracking-wider">
                  Pre-Trade Intelligence
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
              aria-label="Close navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Platform Modules
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer & Disclaimer */}
          <div className="p-4 m-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Academic & Risk Research</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              RISKWISE provides deterministic risk analysis and behavioural reflection. Not SEBI registered advisory. No order execution.
            </p>
            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>v1.0.0 (Research Build)</span>
              <NavLink to="/methodology" className="hover:text-teal-400 flex items-center gap-0.5">
                Docs <ArrowUpRight className="w-2.5 h-2.5" />
              </NavLink>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar for mobile header & breadcrumb */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1 rounded-md focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <NavLink to="/" className="hover:text-slate-900">
                Riskwise
              </NavLink>
              <span>/</span>
              <span className="font-semibold text-slate-900 capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Home'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Risk Engine Online</span>
            </div>

            <NavLink
              to="/trade-lab"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
