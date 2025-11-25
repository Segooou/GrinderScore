import React, { useMemo } from 'react';
import { Trade, UserSettings, BehavioralMetrics } from '../types';
import { Brain, AlertTriangle, CheckCircle, XCircle, TrendingUp, Activity, ShieldAlert } from 'lucide-react';

interface BehavioralAnalyticsProps {
  trades: Trade[];
  settings: UserSettings;
}

const BehavioralAnalytics: React.FC<BehavioralAnalyticsProps> = ({ trades, settings }) => {
  const currentMonthMetrics = useMemo((): BehavioralMetrics => {
    const now = new Date();
    const currentMonthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (currentMonthTrades.length === 0) {
      return {
        score: 50,
        verdict: 'CAUTELA',
        winRate: 0,
        profitFactor: 0,
        consecutiveLosses: 0,
        totalTrades: 0,
        feedback: ['Sem dados suficientes neste mês para análise precisa.']
      };
    }

    const wins = currentMonthTrades.filter(t => t.pnl > 0);
    const losses = currentMonthTrades.filter(t => t.pnl <= 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));

    const winRate = (wins.length / currentMonthTrades.length) * 100;
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Calculate Max Consecutive Losses
    let maxConsecutiveLosses = 0;
    let currentStreak = 0;
    const sortedTrades = [...currentMonthTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTrades.forEach(t => {
      if (t.pnl < 0) {
        currentStreak++;
      } else {
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
        currentStreak = 0;
      }
    });
    maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);

    // Scoring Algorithm
    let score = 50; // Start neutral
    const feedback: string[] = [];

    // Win Rate Impact
    if (winRate > 60) {
        score += 20;
        feedback.push('Ótima taxa de acerto.');
    } else if (winRate < 40) {
        score -= 10;
        feedback.push('Taxa de acerto abaixo do ideal.');
    }

    // Profit Factor Impact
    if (profitFactor > 1.5) {
        score += 20;
        feedback.push('Fator de lucro saudável (ganhos superam perdas).');
    } else if (profitFactor < 1.0) {
        score -= 20;
        feedback.push('Fator de lucro negativo. Você está perdendo mais do que ganha.');
    }

    // Streak Impact
    if (maxConsecutiveLosses > 3) {
        score -= 15;
        feedback.push('Cuidado: Sequência de perdas detectada (Tilt).');
    }

    // Volume Impact
    if (currentMonthTrades.length > 50) {
        score -= 10;
        feedback.push('Volume excessivo de trades (Overtrading).');
    }

    score = Math.min(Math.max(score, 0), 100);

    let verdict: 'APTO' | 'CAUTELA' | 'NAO_RECOMENDADO' = 'CAUTELA';
    if (score >= 75) verdict = 'APTO';
    else if (score <= 40) verdict = 'NAO_RECOMENDADO';

    return {
      score,
      verdict,
      winRate,
      profitFactor,
      consecutiveLosses: maxConsecutiveLosses,
      totalTrades: currentMonthTrades.length,
      feedback
    };
  }, [trades]);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APTO': return 'bg-emerald-500 text-white';
      case 'NAO_RECOMENDADO': return 'bg-rose-500 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'APTO': return <CheckCircle size={32} />;
      case 'NAO_RECOMENDADO': return <XCircle size={32} />;
      default: return <AlertTriangle size={32} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Verdict Card */}
      <div className={`rounded-2xl p-8 shadow-lg transition-all ${getVerdictColor(currentMonthMetrics.verdict)}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                {getVerdictIcon(currentMonthMetrics.verdict)}
             </div>
             <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {currentMonthMetrics.verdict === 'APTO' && 'Apto para Operar'}
                    {currentMonthMetrics.verdict === 'CAUTELA' && 'Opere com Cautela'}
                    {currentMonthMetrics.verdict === 'NAO_RECOMENDADO' && 'Pausa Recomendada'}
                </h2>
                <p className="text-white/90 font-medium mt-1">Score Comportamental: {currentMonthMetrics.score.toFixed(0)}/100</p>
             </div>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[200px]">
             <div className="text-sm font-medium text-white/80">Profit Factor (Mês)</div>
             <div className="text-3xl font-bold">{currentMonthMetrics.profitFactor.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="mb-3 p-3 bg-blue-50 text-blue-600 rounded-full">
                <TrendingUp size={24} />
            </div>
            <span className="text-gray-500 text-sm font-medium">Taxa de Acerto</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{currentMonthMetrics.winRate.toFixed(1)}%</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="mb-3 p-3 bg-violet-50 text-violet-600 rounded-full">
                <Activity size={24} />
            </div>
            <span className="text-gray-500 text-sm font-medium">Trades no Mês</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{currentMonthMetrics.totalTrades}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="mb-3 p-3 bg-rose-50 text-rose-600 rounded-full">
                <ShieldAlert size={24} />
            </div>
            <span className="text-gray-500 text-sm font-medium">Seq. de Perdas</span>
            <span className={`text-2xl font-bold mt-1 ${currentMonthMetrics.consecutiveLosses > 2 ? 'text-rose-600' : 'text-gray-900'}`}>
                {currentMonthMetrics.consecutiveLosses}
            </span>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
            <Brain className="text-gray-900" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Análise da IA</h3>
         </div>
         <div className="space-y-3">
            {currentMonthMetrics.feedback.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    <p className="text-sm text-gray-700 font-medium">{item}</p>
                </div>
            ))}
            {currentMonthMetrics.feedback.length === 0 && (
                <p className="text-gray-500 italic">Nenhum feedback específico no momento.</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default BehavioralAnalytics;
