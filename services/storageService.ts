
import { Account, Trade, TradeResult } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'tradeflow_accounts',
  TRADES: 'tradeflow_trades',
  ONBOARDED: 'pseudo_whales_onboarded'
};

export const storageService = {
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      const defaultAcc: Account = { id: 'default', name: 'Main Portfolio', currency: 'USD', initialBalance: 10000 };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([defaultAcc]));
      return [defaultAcc];
    }
    return JSON.parse(data);
  },

  saveAccount: (account: Account) => {
    const accounts = storageService.getAccounts();
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getTrades: (accountId: string): Trade[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (!data) return [];
    const allTrades: Trade[] = JSON.parse(data);
    return allTrades.filter(t => t.accountId === accountId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveTrade: (trade: Trade) => {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    const allTrades: Trade[] = data ? JSON.parse(data) : [];
    const existingIndex = allTrades.findIndex(t => t.id === trade.id);
    
    // Calculate RR and PnL helper (basic logic)
    const risk = Math.abs(trade.entry - trade.stopLoss);
    const reward = Math.abs(trade.takeProfit - trade.entry);
    trade.rr = risk === 0 ? 0 : Number((reward / risk).toFixed(2));

    if (existingIndex >= 0) {
      allTrades[existingIndex] = trade;
    } else {
      allTrades.push(trade);
    }
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(allTrades));
  },

  deleteTrade: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (!data) return;
    const allTrades: Trade[] = JSON.parse(data);
    const filtered = allTrades.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(filtered));
  },

  isOnboarded: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  },

  setOnboarded: (value: boolean) => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(value));
  }
};
