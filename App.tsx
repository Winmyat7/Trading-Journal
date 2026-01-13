
import React, { useState, useEffect, useCallback } from 'react';
import { Trade, Account } from './types';
import { storageService } from './services/storageService';
import { analyzeTradeWithAI } from './services/geminiService';
import StatsCards from './components/StatsCards';
import TradeTable from './components/TradeTable';
import TradeForm from './components/TradeForm';
import AccountForm from './components/AccountForm';
import PnLCalendar from './components/PnLCalendar';
import AnalysisDashboard from './components/AnalysisDashboard';
import MarketIntelligence from './components/MarketIntelligence';
import OnboardingTour from './components/OnboardingTour';
import PsychologicalPatterns from './components/PsychologicalPatterns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ id: string; content: string; trade?: Trade } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    const accs = storageService.getAccounts();
    setAccounts(accs);
    if (accs.length > 0) {
      setSelectedAccount(accs[0]);
    }

    // Trigger onboarding tour if never seen
    if (!storageService.isOnboarded()) {
      setShowTour(true);
    }
  }, []);

  // Load trades when account changes
  useEffect(() => {
    if (selectedAccount) {
      const accTrades = storageService.getTrades(selectedAccount.id);
      setTrades(accTrades);
    }
  }, [selectedAccount]);

  const handleSaveTrade = (trade: Trade) => {
    storageService.saveTrade(trade);
    if (selectedAccount) {
      setTrades(storageService.getTrades(selectedAccount.id));
    }
    setShowForm(false);
    setEditingTrade(undefined);
    // If we were analyzing this specific trade, update the analysis reference
    if (aiAnalysis?.id === trade.id) {
      setAiAnalysis({ ...aiAnalysis, trade });
    }
  };

  const handleSaveAccount = (account: Account) => {
    storageService.saveAccount(account);
    const updatedAccounts = storageService.getAccounts();
    setAccounts(updatedAccounts);
    setSelectedAccount(account);
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      storageService.deleteTrade(id);
      if (selectedAccount) {
        setTrades(storageService.getTrades(selectedAccount.id));
      }
      if (aiAnalysis?.id === id) {
        setAiAnalysis(null);
      }
    }
  };

  const handleAnalyzeTrade = async (trade: Trade) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await analyzeTradeWithAI(trade);
    setAiAnalysis({ id: trade.id, content: analysis, trade });
    setIsAnalyzing(false);
  };

  const handleCompleteTour = () => {
    setShowTour(false);
    storageService.setOnboarded(true);
  };

  // Prepare Chart Data
  const getChartData = () => {
    if (!selectedAccount) return [];
    let currentBalance = selectedAccount.initialBalance;
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return [
      { date: 'Initial', balance: selectedAccount.initialBalance },
      ...sortedTrades.map(t => {
        currentBalance += t.pnl || 0;
        return { date: t.date, balance: currentBalance };
      })
    ];
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {showTour && <OnboardingTour onComplete={handleCompleteTour} />}

      <nav id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Pseudo-Whales</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
                  value={selectedAccount?.id}
                  onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value) || null)}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <div className="flex space-x-0.5">
                  <button 
                    onClick={() => { setEditingAccount(null); setShowAccountForm(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Portfolio"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <button 
                    onClick={() => { setEditingAccount(selectedAccount); setShowAccountForm(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Current Portfolio"
                    disabled={!selectedAccount}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button 
                    onClick={() => setShowTour(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Restart Tour"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <button 
                onClick={() => { setEditingTrade(undefined); setShowForm(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                + New Trade
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedAccount && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Portfolio</h2>
            <p className="text-2xl font-bold text-blue-600">{selectedAccount.name}</p>
          </div>
        )}
        
        <div id="tour-stats">
          {selectedAccount && <StatsCards trades={trades} initialBalance={selectedAccount.initialBalance} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <div id="tour-equity" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Equity Curve</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{fontSize: 12}} 
                      tickFormatter={(val) => `$${val}`} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div id="tour-intelligence">
              <MarketIntelligence />
            </div>
          </div>

          <div className="space-y-8">
            <PnLCalendar trades={trades} />

            <div id="tour-ai-coach" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Trade Wisdom</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded">AI Coach</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isAnalyzing ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded"></div>
                    <div className="h-32 bg-slate-100 rounded"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    {(aiAnalysis.trade?.entryImage || aiAnalysis.trade?.exitImage) && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {aiAnalysis.trade?.entryImage && (
                          <div className="group relative">
                            <img src={aiAnalysis.trade.entryImage} className="rounded-lg h-24 w-full object-cover border border-slate-200" alt="Entry" />
                            <span className="absolute bottom-1 left-1 bg-black/50 text-[8px] text-white px-1 rounded">ENTRY</span>
                          </div>
                        )}
                        {aiAnalysis.trade?.exitImage && (
                          <div className="group relative">
                            <img src={aiAnalysis.trade.exitImage} className="rounded-lg h-24 w-full object-cover border border-slate-200" alt="Exit" />
                            <span className="absolute bottom-1 left-1 bg-black/50 text-[8px] text-white px-1 rounded">EXIT</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="whitespace-pre-wrap">{aiAnalysis.content}</p>
                      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                        <button 
                          onClick={() => { setEditingTrade(aiAnalysis.trade); setShowForm(true); }}
                          className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          <span>Correct Trade Details</span>
                        </button>
                        <button onClick={() => setAiAnalysis(null)} className="text-[10px] font-semibold text-slate-400 hover:text-slate-600">Dismiss</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-blue-200 mb-3 flex justify-center">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm px-4">Select <b>Analyze</b> on any trade to see visual chart analysis and institutional feedback.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 space-y-8">
          <PsychologicalPatterns trades={trades} />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Performance Breakdown</h3>
            </div>
            <AnalysisDashboard trades={trades} />
          </div>
        </div>

        <div id="tour-journal" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Journal Entries</h3>
          </div>
          <TradeTable 
            trades={trades} 
            onEdit={(t) => { setEditingTrade(t); setShowForm(true); }}
            onDelete={handleDeleteTrade}
            onAnalyze={handleAnalyzeTrade}
          />
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-200">
            <TradeForm 
              accountId={selectedAccount?.id || 'default'} 
              onSave={handleSaveTrade} 
              onCancel={() => { setShowForm(false); setEditingTrade(undefined); }}
              initialData={editingTrade}
            />
          </div>
        </div>
      )}

      {showAccountForm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <AccountForm 
              onSave={handleSaveAccount} 
              onCancel={() => { setShowAccountForm(false); setEditingAccount(null); }}
              initialData={editingAccount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
