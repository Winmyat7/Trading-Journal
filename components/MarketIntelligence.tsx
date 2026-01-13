
import React, { useState } from 'react';
import { searchMarketIntelligence, SearchResult } from '../services/geminiService';

const MarketIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const data = await searchMarketIntelligence(query);
    setResult(data);
    setLoading(false);
  };

  const SUGGESTIONS = [
    "Institutional sentiment on BTC today",
    "Current EURUSD retail vs institutional positioning",
    "Latest ICT Silver Bullet strategy variations",
    "Top performing altcoin sectors this week"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h3 className="text-lg font-bold">Global Intelligence Hub</h3>
        </div>
        <p className="text-blue-100 text-sm mb-6">Scan the web for real-time trader sentiment, institutional news, and public setups.</p>
        
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search the web for trader wisdom..." 
            className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3 pr-12 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 p-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )}
          </button>
        </form>

        {!result && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => setQuery(s)}
                className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full border border-white/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
            <div className="h-24 bg-slate-50 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-slate-100 rounded-full w-20"></div>
              <div className="h-6 bg-slate-100 rounded-full w-24"></div>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Community Intelligence Summary</h4>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                {result.text}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Grounding Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold"
                    >
                      <span>{source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}</span>
                      <svg className="w-3 h-3 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Search the web for real-time market data and trader insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketIntelligence;
