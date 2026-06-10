import React from 'react';
import { Video, Calendar, ShieldCheck, Play } from 'lucide-react';

const MockInterview = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Simulate Mock Interview</h1>
        <p className="text-xs text-slate-400 mt-1">Launch an automated technical simulator tailored to your tech stack profile rules.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-200">Full Stack Engineering Simulator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Focus areas: JavaScript logic, React lifecycles, and relational database paradigms.</p>
          </div>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 whitespace-nowrap">
          <Play className="w-3.5 h-3.5 fill-current" /> Initialize Session
        </button>
      </div>
    </div>
  );
};

export default MockInterview;