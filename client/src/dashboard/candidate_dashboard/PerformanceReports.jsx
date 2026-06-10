import React from 'react';
import { TrendingUp, Award, Clock, ArrowUpRight } from 'lucide-react';

const PerformanceReports = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Performance Metrics</h1>
        <p className="text-xs text-slate-400 mt-1">Track history records of accuracy curves and problem-solving response pacing logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Technical Accuracy', value: '78%', sub: '+4% vs last week', icon: TrendingUp, color: 'text-indigo-400' },
          { label: 'Communication Index', value: 'B+', sub: 'Consistent delivery', icon: Award, color: 'text-emerald-400' },
          { label: 'Average Response Time', value: '1.4m', sub: '-12s optimization', icon: Clock, color: 'text-amber-400' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-200">{stat.value}</span>
                <span className="text-[10px] text-slate-500 font-medium">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceReports;