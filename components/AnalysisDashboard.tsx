
import React from 'react';
import { Trade, TradeResult } from '../types';

interface AnalysisDashboardProps {
  trades: Trade[];
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ trades }) => {
  const closedTrades = trades.filter(t => t.result !== TradeResult.PENDING);

  if (closedTrades.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <div className="mb-3 text-slate-300">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <p className="text-slate-500 font-medium">No Performance Data Yet</p>
        <p className="text-slate-400 text-sm">Close some trades to unlock strategy and session analytics.</p>
      </div>
    );
  }

  const getStatsByField = (field: keyof Trade | 'day') => {
    const stats: Record<string, { total: number; wins: number; pnl: number }> = {};
    
    closedTrades.forEach(t => {
      let key = 'Unknown';
      if (field === 'day') {
        const date = new Date(t.date + 'T00:00:00'); // Ensure local time parsing
        key = date.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        const value = t[field];
        key = (value === undefined || value === null || value === '') ? 'Unknown' : String(value);
      }
      
      if (!stats[key]) stats[key] = { total: 0, wins: 0, pnl: 0 };
      stats[key].total += 1;
      if (t.result === TradeResult.WIN) stats[key].wins += 1;
      stats[key].pnl += (Number(t.pnl) || 0);
    });

    const entries = Object.entries(stats);
    
    // Custom sort for days of the week if field is 'day'
    if (field === 'day') {
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      return entries.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));
    }

    return entries.sort((a, b) => b[1].pnl - a[1].pnl);
  };

  const strategyStats = getStatsByField('entryType');
  const sessionStats = getStatsByField('session');
  const symbolStats = getStatsByField('symbol');
  const dayStats = getStatsByField('day');

  const StatSection = ({ title, data }: { title: string; data: [string, { total: number; wins: number; pnl: number }][] }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">{title}</h4>
      <div className="space-y-4">
        {data.slice(0, 7).map(([key, stat]) => {
          const winRate = stat.total > 0 ? (stat.wins / stat.total) * 100 : 0;
          return (
            <div key={key}>
              <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]" title={key}>{key}</span>
                  <span className="text-[10px] text-slate-400">{stat.total} trades</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold block ${stat.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.pnl >= 0 ? '+' : ''}${Math.round(stat.pnl).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${winRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400 font-medium">Win Rate</span>
                <span className="text-[9px] text-slate-500 font-bold">{winRate.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
        {data.length === 0 && <p className="text-xs text-slate-400 italic">No data available for this metric.</p>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatSection title="Strategy Efficacy" data={strategyStats} />
      <StatSection title="Session Edge" data={sessionStats} />
      <StatSection title="Top Assets" data={symbolStats} />
      <StatSection title="Performance by Day" data={dayStats} />
    </div>
  );
};

export default AnalysisDashboard;
