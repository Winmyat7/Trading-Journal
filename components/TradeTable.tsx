
import React, { useState } from 'react';
import { Trade, TradeResult, TradeSide } from '../types';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onAnalyze: (trade: Trade) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onEdit, onDelete, onAnalyze }) => {
  const [filterResult, setFilterResult] = useState<string>('All');

  const getResultColor = (result: TradeResult) => {
    switch (result) {
      case TradeResult.WIN: return 'bg-emerald-100 text-emerald-700';
      case TradeResult.LOSS: return 'bg-rose-100 text-rose-700';
      case TradeResult.BREAK_EVEN: return 'bg-slate-100 text-slate-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getSessionBadge = (session: string) => {
    switch (session) {
      case 'London': return 'bg-blue-50 text-blue-600';
      case 'New York': return 'bg-indigo-50 text-indigo-600';
      case 'London Close': return 'bg-violet-50 text-violet-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (filterResult === 'All') return true;
    return trade.result === filterResult;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h4 className="text-sm font-bold text-slate-700">Recent Activity</h4>
        <div className="flex items-center space-x-2">
          <label htmlFor="result-filter" className="text-xs font-semibold text-slate-500 uppercase">Filter by Result:</label>
          <select 
            id="result-filter"
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <option value="All">All Results</option>
            <option value={TradeResult.WIN}>Win</option>
            <option value={TradeResult.LOSS}>Loss</option>
            <option value={TradeResult.BREAK_EVEN}>Break Even</option>
            <option value={TradeResult.PENDING}>Pending</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset / Lot</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">TF / Session / Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Side</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entry / SL / TP</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">RR</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PnL</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Media</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{trade.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-900">{trade.symbol}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Lot: {trade.lotSize || '0.00'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-bold uppercase">{trade.timeFrame || '-'}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${getSessionBadge(trade.session)}`}>
                      {trade.session || 'N/A'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">{trade.entryType || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${trade.side === TradeSide.LONG ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs font-bold text-slate-700">{trade.entry?.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">
                    <span className="text-rose-400">S: {trade.stopLoss?.toLocaleString() || '-'}</span>
                    <span className="mx-1 text-slate-300">|</span>
                    <span className="text-emerald-400">T: {trade.takeProfit?.toLocaleString() || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                  {trade.rr || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(trade.result)}`}>
                    {trade.result}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trade.pnl !== 0 ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-1">
                    {trade.entryImage && (
                      <span title="Entry Image" className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                      </span>
                    )}
                    {trade.exitImage && (
                      <span title="Exit Image" className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => onAnalyze(trade)}
                      className="flex items-center space-x-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase">Analyze</span>
                    </button>
                    <button 
                      onClick={() => onEdit(trade)} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Trade"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDelete(trade.id)} 
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Trade"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTrades.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {filterResult === 'All' ? 'No trades recorded yet.' : `No trades found with result: ${filterResult}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;
