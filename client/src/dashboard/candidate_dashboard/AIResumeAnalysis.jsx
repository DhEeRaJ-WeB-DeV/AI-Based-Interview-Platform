import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

const AIResumeAnalysis = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">AI Structural Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">Deep learning evaluation of your resume layout framework, readability metrics, and impact phrases.</p>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Core Score: 84/100
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl space-y-3">
          <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Structural Strengths
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Strong action verbs used in software development history blocks.</li>
            <li>Clear demarcation of skills indexing (MERN stack, Python, SQL).</li>
          </ul>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl space-y-3">
          <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Recommended Revisions
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Quantify SEO metrics under the Acko internship block.</li>
            <li>Shorten summary statement to maximize primary viewport index reading.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIResumeAnalysis;