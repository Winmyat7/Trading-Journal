
export enum TradeSide {
  LONG = 'Long',
  SHORT = 'Short'
}

export enum TradeResult {
  WIN = 'Win',
  LOSS = 'Loss',
  BREAK_EVEN = 'Break Even',
  PENDING = 'Pending'
}

export enum TradeSession {
  LONDON = 'London',
  NEW_YORK = 'New York',
  LONDON_CLOSE = 'London Close',
  OUT_OF_SESSION = 'Out of Session'
}

export interface Trade {
  id: string;
  accountId: string;
  date: string;
  symbol: string;
  timeFrame: string; // e.g., '5m', '1h', 'Daily'
  session: TradeSession;
  entryType: string; // e.g., 'Breakout', 'Retest', 'Trend Following'
  side: TradeSide;
  lotSize: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  result: TradeResult;
  pnl: number;
  rr: number;
  notes: string;
  entryImage?: string; // Base64 encoded string
  exitImage?: string;  // Base64 encoded string
}

export interface Account {
  id: string;
  name: string;
  currency: string;
  initialBalance: number;
}

export interface PerformanceStats {
  winRate: number;
  totalPnl: number;
  averageRr: number;
  tradeCount: number;
  equityCurve: { date: string; balance: number }[];
}
