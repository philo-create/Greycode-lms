'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { generateDeepDiveReport } from '@/app/actions';
import Markdown from 'react-markdown';

interface DeepDiveAIReportProps {
  studentName: string;
  subjectName: string;
  marks: any[];
  progressData: any[];
  role: 'teacher' | 'parent';
  initialBasicRecommendation?: string;
}

export function DeepDiveAIReport({
  studentName,
  subjectName,
  marks,
  progressData,
  role,
  initialBasicRecommendation
}: DeepDiveAIReportProps) {
  const [reportText, setReportText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateDeepDiveReport(studentName, subjectName, marks, progressData);
      if (res.success && res.text) {
        setReportText(res.text);
      } else {
        setError(res.error || 'Failed to generate report.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic Recommendation shown if no deep dive is generated yet */}
      {!reportText && initialBasicRecommendation && (
        <div className="p-4.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 shrink-0 animate-pulse" />
          <div>
            <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">LMS Diagnostic Commentary</h4>
            <p className="text-xs text-indigo-700 font-bold mt-1.5 leading-relaxed">
              {initialBasicRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!reportText && (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-2xl border border-indigo-500/30 shadow-[0_0_40px_-10px_rgba(79,70,229,0.3)] relative overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
            <Sparkles className="w-32 h-32 text-indigo-400" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4 z-10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Premium AI Analysis</span>
          </div>

          <h4 className="text-white font-extrabold text-lg mb-2 text-center z-10 tracking-tight">
            {role === 'parent' ? 'Unlock Deep Diagnostic Insights' : 'Generate Strategic Intervention Plan'}
          </h4>
          <p className="text-slate-400 text-xs text-center max-w-md mb-6 z-10 leading-relaxed font-medium">
            {role === 'parent' 
              ? `Go beyond the report card. Our advanced AI evaluates ${studentName}'s performance patterns to provide you with a profound understanding of their cognitive development and an actionable home strategy.`
              : `Run a comprehensive "Super Mode" analysis on ${studentName}'s data to identify hidden learning gaps, track cognitive milestones, and formulate a targeted instructional plan.`}
          </p>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (marks.length === 0 && progressData.length === 0)}
            className="z-10 flex items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-950 font-black text-sm px-6 py-3 rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                Synthesizing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-600 group-hover/btn:animate-pulse" />
                {role === 'parent' ? 'Unlock AI Deep Dive' : 'Run Super Mode Analysis'}
              </>
            )}
          </button>
          
          {(marks.length === 0 && progressData.length === 0) && !isGenerating && (
            <p className="text-[10px] text-rose-400 mt-4 z-10 text-center font-bold">
              Insufficient data to generate a reliable AI diagnostic.
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Generated Report */}
      {reportText && (
        <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md shadow-indigo-100/50">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-4 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-50">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Advanced Performance Diagnostic</h3>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">AI-Generated Analysis for {subjectName}</p>
            </div>
          </div>
          
          <div className="p-6 prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-a:text-indigo-600 prose-strong:text-slate-800">
            <div className="markdown-body">
              <Markdown>{reportText}</Markdown>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-medium italic">
              This report is AI-generated and should be reviewed alongside standard academic reports.
            </p>
            <button
              onClick={() => setReportText(null)}
              className="text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-wider"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
