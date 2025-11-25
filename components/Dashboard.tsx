import React, { useMemo } from 'react';
import { Trade, UserSettings } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  settings: UserSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, settings }) => {
  
  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const breakeven = trades.filter(t => t.pnl === 0).length;
    
    const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
    
    // Calculate P&L Curve
    let currentCapital = settings.initialCapital;
    const pnlData = trades.slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
      currentCapital += t.pnl;
      return {
        date: t.date,
        balance: currentCapital,
        pnl: t.pnl
      };
    });

    // Initial point
    if (pnlData.length > 0) {
      pnlData.unshift({ date: 'Start', balance: settings.initialCapital, pnl: 0 });
    } else {
         pnlData.push({ date: 'Start', balance: settings.initialCapital, pnl: 0 });
    }

    return { totalTrades, wins, losses, breakeven, totalPnL, pnlData };
  }, [trades, settings.initialCapital]);

  const currentBalance = settings.initialCapital + stats.totalPnL;
  const variation = settings.initialCapital > 0 ? (stats.totalPnL / settings.initialCapital) * 100 : 0;
  
  // Goal Calculations
  const monthlyGoal = settings.monthlyGoal || 1; 
  const progressPercent = Math.min(Math.max((stats.totalPnL / monthlyGoal) * 100, 0), 100);
  const remainingGoal = Math.max(monthlyGoal - stats.totalPnL, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Section: Wallet & Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Saldo da Carteira Manual */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="mb-4">
                <h3 className="text-gray-900 font-bold text-lg">Saldo da Carteira Manual</h3>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Saldo Atual:</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-medium">Lucro e Perda Total:</span>
                    <span className={`font-bold ${stats.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(stats.totalPnL)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Variação:</span>
                    <div className={`flex items-center font-bold ${variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {variation >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                         {Math.abs(variation).toFixed(2)}%
                    </div>
                </div>
            </div>
        </div>

        {/* Card 2: Meta Mensal */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-900 font-bold text-lg">Meta Mensal</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">Últimos 7 dias</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Target size={20} />
                </div>
            </div>
            
            <div className="mt-auto">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-gray-500 font-medium">Progresso</span>
                    <span className="text-2xl font-bold text-gray-900">{progressPercent.toFixed(1)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out" 
                        style={{width: `${progressPercent}%`}}
                    ></div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Faltam:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(remainingGoal)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Centralized Win/Loss Bar - DARK THEME APPLIED HERE */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-sm p-4 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-white transform hover:scale-[1.01] transition-transform">
           <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
               <span className="text-sm font-semibold text-gray-300">Wins: <span className="text-white">{stats.wins}</span></span>
           </div>
           <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
               <span className="text-sm font-semibold text-gray-300">Losses: <span className="text-white">{stats.losses}</span></span>
           </div>
           <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-gray-500 shadow-sm shadow-gray-500/50"></div>
               <span className="text-sm font-semibold text-gray-300">Breakeven: <span className="text-white">{stats.breakeven}</span></span>
           </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Curva de Patrimônio</h3>
            <p className="text-sm text-gray-500">Evolução do capital ao longo do tempo.</p>
        </div>

        <div className="w-full h-[350px] sm:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.pnlData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val === 'Start' ? '' : val.split('-').slice(1).join('/')} 
                dy={10}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e5e7eb', 
                    color: '#111827',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                    fontSize: '12px'
                }}
                itemStyle={{ color: '#000000', fontWeight: 600 }}
                labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                labelFormatter={(label) => label === 'Start' ? 'Início' : label}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#000000" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                activeDot={{ r: 4, strokeWidth: 0, fill: '#000000' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;