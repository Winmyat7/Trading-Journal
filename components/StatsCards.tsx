
import React from 'react';
import { Trade, TradeResult } from '../types';

interface StatsCardsProps {
  trades: Trade[];
  initialBalance: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ trades, initialBalance }) => {
  const closedTrades = trades.filter(t => t.result !== TradeResult.PENDING);
  const wins = closedTrades.filter(t => t.result === TradeResult.WIN).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const currentBalance = initialBalance + totalPnL;
  const avgRR = closedTrades.length > 0 ? closedTrades.reduce((acc, t) => acc + (t.rr || 0), 0) / closedTrades.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Equity</p>
        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          ${currentBalance.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 mt-1">Initial: ${initialBalance.toLocaleString()}</p>
      </div>
      
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Win Rate</p>
        <p className="text-2xl font-bold text-slate-800">{winRate.toFixed(1)}%</p>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${winRate}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Net Profit</p>
        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 mt-1">{closedTrades.length} trades closed</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Avg R:R</p>
        <p className="text-2xl font-bold text-slate-800">{avgRR.toFixed(2)}</p>
        <p className="text-xs text-slate-400 mt-1">Reward/Risk ratio</p>
      </div>
    </div>
  );
};

export default StatsCards;
