
export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TradeResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BREAKEVEN = 'BREAKEVEN'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Trade {
  id: string;
  userId: string; // Foreign key para o usuário
  date: string; // ISO Date string YYYY-MM-DD
  asset: string; // Ticker
  direction: TradeDirection;
  marketType: 'SPOT' | 'FUTURES' | 'OPTIONS';
  
  // Financeiro
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  investedValue: number; // Valor Investido
  pnl: number;
  
  // Gestão de Risco
  stopLoss: number;
  takeProfit: number;
  
  // Psicologia/Estratégia
  entryReason: string;
  exitReason: string;
  notes: string;
  
  imageUrl?: string; // Base64 or URL
  strategy?: string;
}

export interface UserSettings {
  initialCapital: number;
  monthlyGoal: number;
  riskPerTrade: number; // percentage
}

export enum ChatMode {
  STANDARD = 'STANDARD',
  THINKING = 'THINKING',
  SEARCH = 'SEARCH'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string;
  isThinking?: boolean;
}

export interface BehavioralMetrics {
  score: number; // 0-100
  verdict: 'APTO' | 'CAUTELA' | 'NAO_RECOMENDADO';
  winRate: number;
  profitFactor: number;
  consecutiveLosses: number;
  totalTrades: number;
  feedback: string[];
}
