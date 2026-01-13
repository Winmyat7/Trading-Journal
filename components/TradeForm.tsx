
import React, { useState, useRef } from 'react';
import { Trade, TradeSide, TradeResult, TradeSession } from '../types';

interface TradeFormProps {
  accountId: string;
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  initialData?: Trade;
}

const TIME_FRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];
const ENTRY_TYPES = [
  'Breakout', 
  'Retest', 
  'Trend Following', 
  'Reversal', 
  'Scalp', 
  'SMC/ICT',
  'Unicorn model',
  'Order Block',
  'Fvg',
  'Poi',
  'Liquidity'
];

const SUGGESTED_SYMBOLS = ['EUR/USD', 'GBP/USD', 'XAU/USD'];

const TradeForm: React.FC<TradeFormProps> = ({ accountId, onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Trade>>(initialData || {
    accountId,
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    timeFrame: '1h',
    session: TradeSession.LONDON,
    entryType: 'Retest',
    side: TradeSide.LONG,
    lotSize: 0,
    entry: 0,
    stopLoss: 0,
    takeProfit: 0,
    result: TradeResult.PENDING,
    pnl: 0,
    notes: '',
    entryImage: '',
    exitImage: ''
  });

  const fileInputEntry = useRef<HTMLInputElement>(null);
  const fileInputExit = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'entry' | 'exit') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large. Please keep it under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type === 'entry' ? 'entryImage' : 'exitImage']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trade: Trade = {
      ...formData as Trade,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      accountId
    };
    onSave(trade);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800">{initialData ? 'Edit Trade' : 'Record New Trade'}</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Trade Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pair / Symbol</label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="e.g. BTCUSDT" 
                    list="symbols-list"
                    required
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                    value={formData.symbol}
                    onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  />
                  <datalist id="symbols-list">
                    {SUGGESTED_SYMBOLS.map(s => <option key={s} value={s} />)}
                  </datalist>
                  <div className="flex gap-2">
                    {SUGGESTED_SYMBOLS.map(symbol => (
                      <button
                        key={symbol}
                        type="button"
                        onClick={() => setFormData({...formData, symbol})}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                          formData.symbol === symbol 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Time Frame</label>
                <select 
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.timeFrame}
                  onChange={e => setFormData({...formData, timeFrame: e.target.value})}
                >
                  {TIME_FRAMES.map(tf => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Trading Session</label>
                <select 
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.session}
                  onChange={e => setFormData({...formData, session: e.target.value as TradeSession})}
                >
                  {Object.values(TradeSession).map(session => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Entry Type</label>
                <select 
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.entryType}
                  onChange={e => setFormData({...formData, entryType: e.target.value})}
                >
                  {ENTRY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Side</label>
                <select 
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.side}
                  onChange={e => setFormData({...formData, side: e.target.value as TradeSide})}
                >
                  <option value={TradeSide.LONG}>Long</option>
                  <option value={TradeSide.SHORT}>Short</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Lot Size / Volume</label>
              <input 
                type="number" 
                step="any"
                placeholder="0.01"
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                value={formData.lotSize}
                onChange={e => setFormData({...formData, lotSize: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Entry Price</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.entry}
                  onChange={e => setFormData({...formData, entry: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Result</label>
                <select 
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.result}
                  onChange={e => setFormData({...formData, result: e.target.value as TradeResult})}
                >
                  <option value={TradeResult.PENDING}>Pending</option>
                  <option value={TradeResult.WIN}>Win</option>
                  <option value={TradeResult.LOSS}>Loss</option>
                  <option value={TradeResult.BREAK_EVEN}>B/E</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stop Loss</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.stopLoss}
                  onChange={e => setFormData({...formData, stopLoss: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Take Profit</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                  value={formData.takeProfit}
                  onChange={e => setFormData({...formData, takeProfit: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PnL ($)</label>
              <input 
                type="number" 
                step="any"
                placeholder="0.00"
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                value={formData.pnl}
                onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Entry Screenshot</label>
            <div 
              onClick={() => fileInputEntry.current?.click()}
              className="group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all h-40 relative overflow-hidden bg-slate-50"
            >
              {formData.entryImage ? (
                <img src={formData.entryImage} alt="Entry" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="mt-2 text-xs text-slate-400 font-medium">Click to upload entry setup</p>
                </div>
              )}
              <input ref={fileInputEntry} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'entry')} />
            </div>
            {formData.entryImage && (
              <button type="button" onClick={() => setFormData({...formData, entryImage: ''})} className="text-xs text-rose-500 font-medium hover:underline">Clear Entry Image</button>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Exit Screenshot</label>
            <div 
              onClick={() => fileInputExit.current?.click()}
              className="group border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all h-40 relative overflow-hidden bg-slate-50"
            >
              {formData.exitImage ? (
                <img src={formData.exitImage} alt="Exit" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="mt-2 text-xs text-slate-400 font-medium">Click to upload exit setup</p>
                </div>
              )}
              <input ref={fileInputExit} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'exit')} />
            </div>
            {formData.exitImage && (
              <button type="button" onClick={() => setFormData({...formData, exitImage: ''})} className="text-xs text-rose-500 font-medium hover:underline">Clear Exit Image</button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Analysis & Notes</label>
          <textarea 
            placeholder="What was your logic? How did you feel during this trade?"
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border"
            rows={4}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit" 
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Save to Journal
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
