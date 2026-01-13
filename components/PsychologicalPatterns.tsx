
import React, { useState, useEffect } from 'react';
import { Trade } from '../types';
import { analyzePsychologicalPatterns, PsychologicalTheme } from '../services/geminiService';

interface PsychologicalPatternsProps {
  trades: Trade[];
}

const PsychologicalPatterns: React.FC<PsychologicalPatternsProps> = ({ trades }) => {
  const [patterns, setPatterns] = useState<PsychologicalTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performAnalysis = async () => {
    setIsLoading(true);
    const results = await analyzePsychologicalPatterns(trades);
    setPatterns(results);
    setIsLoading(false);
    setHasSearched(true);
  };

  const getLeak = () => {
    if (patterns.length === 0) return null;
    return patterns.reduce((prev, current) => {
      const prevLossRatio = prev.lossCount / (prev.winCount + prev.lossCount || 1);
      const currLossRatio = current.lossCount / (current.winCount + current.lossCount || 1);
      return (currLossRatio > prevLossRatio && current.totalPnL < prev.totalPnL) ? current : prev;
    });
  };

  const mainLeak = getLeak();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="tour-psychology">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Psychological Mindset Map</h3>
          <p className="text-xs text-slate-400 mt-1">Correlation between your mental state and execution outcomes.</p>
        </div>
        {!hasSearched && !isLoading && (
          <button 
            onClick={performAnalysis}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center space-x-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span>Scan Mindset Patterns</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-slate-50 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-40 bg-slate-50 rounded-xl"></div>
              <div className="h-40 bg-slate-50 rounded-xl"></div>
            </div>
          </div>
        ) : hasSearched && patterns.length > 0 ? (
          <div className="space-y-8">
            {mainLeak && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-start space-x-4">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 uppercase tracking-tight">Primary Profit Leak: {mainLeak.theme}</h4>
                  <p className="text-sm text-rose-700/80 mt-1 leading-relaxed">{mainLeak.recommendation}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patterns.map((item, idx) => {
                const total = item.winCount + item.lossCount;
                const winRate = total > 0 ? (item.winCount / total) * 100 : 0;
                
                return (
                  <div key={idx} className="group p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{item.theme}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{total} Instances</span>
                      </div>
                      <span className={`text-xs font-black ${item.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.totalPnL >= 0 ? '+' : ''}${Math.round(item.totalPnL).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Win Rate: {winRate.toFixed(1)}%</span>
                        <span>{item.winCount}W - {item.lossCount}L</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${winRate}%` }}></div>
                        <div className="bg-rose-500 h-full" style={{ width: `${100 - winRate}%` }}></div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                      "{item.description}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">Not enough data to map patterns. Journal more trades with detailed emotional notes.</p>
          </div>
        ) : (
          <div className="text-center py-12 group cursor-pointer" onClick={performAnalysis}>
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <p className="text-slate-500 font-bold">Map Your Mindset</p>
            <p className="text-slate-400 text-xs mt-1">Unlock AI analysis of your journal notes to see which emotions cause your biggest losses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologicalPatterns;
