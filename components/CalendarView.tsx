import React, { useState, useEffect } from 'react';
import { Trade } from '../types';
import { ChevronLeft, ChevronRight, Plus, Bot, Edit2, X } from 'lucide-react';
import { getChatUsageDates, getCurrentSessionUser } from '../services/storageService';

interface CalendarViewProps {
  trades: Trade[];
  onAddTrade: (date: string) => void;
  onEditTrade: (trade: Trade) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades, onAddTrade, onEditTrade }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chatDates, setChatDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentSessionUser().then(u => {
        if (u) {
            setUserId(u.id);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            getChatUsageDates(u.id, year, month).then(dates => {
                setChatDates(new Set(dates));
            });
        }
    });
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
      setCurrentDate(new Date(year, month - 1, 1));
      setSelectedDate(null);
  };
  const nextMonth = () => {
      setCurrentDate(new Date(year, month + 1, 1));
      setSelectedDate(null);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getTradesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return trades.filter(t => t.date === dateStr);
  };

  const handleDateClick = (dateStr: string) => {
    const dayTrades = trades.filter(t => t.date === dateStr);
    if (dayTrades.length > 0) {
      setSelectedDate(dateStr);
    } else {
      setSelectedDate(null);
      onAddTrade(dateStr);
    }
  };

  const selectedDateTrades = selectedDate ? trades.filter(t => t.date === selectedDate) : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-100 shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 capitalize">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100 shrink-0">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
          <div key={day} className="text-center py-2 md:py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 flex-1 bg-white overflow-y-auto auto-rows-fr min-h-0">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="bg-gray-50/20 border-r border-b border-gray-100/50" />
        ))}
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTrades = getTradesForDay(day);
          const dayPnL = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
          const hasChat = chatDates.has(dateStr);
          const isSelected = selectedDate === dateStr;

          // Minimalist Color Logic
          let bgClass = isSelected ? 'bg-gray-100 ring-2 ring-inset ring-gray-900' : 'bg-white hover:bg-gray-50';
          let textClass = 'text-gray-900';
          
          if (dayTrades.length > 0) {
              if (dayPnL > 0) {
                  bgClass = isSelected ? 'bg-emerald-600 ring-2 ring-inset ring-gray-900' : 'bg-emerald-500 hover:bg-emerald-600';
                  textClass = 'text-white';
              } else if (dayPnL < 0) {
                  bgClass = isSelected ? 'bg-rose-600 ring-2 ring-inset ring-gray-900' : 'bg-rose-500 hover:bg-rose-600';
                  textClass = 'text-white';
              } else {
                  bgClass = isSelected ? 'bg-gray-500 ring-2 ring-inset ring-gray-900' : 'bg-gray-400 hover:bg-gray-500';
                  textClass = 'text-white';
              }
          }

          return (
            <div 
              key={day} 
              className={`${bgClass} border-r border-b border-gray-100 p-1 md:p-2 min-h-[60px] md:min-h-[80px] relative transition-all cursor-pointer flex flex-col items-center justify-center`}
              onClick={() => handleDateClick(dateStr)}
            >
              <div className={`absolute top-1 left-1 md:top-2 md:left-2 text-[10px] md:text-xs font-bold ${textClass}`}>
                {day}
              </div>

              {hasChat && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2">
                     <Bot size={14} className={dayTrades.length > 0 ? 'text-white' : 'text-violet-500'} />
                  </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Section */}
      {selectedDate && (
        <div className="bg-gray-50 border-t border-gray-200 p-6 shrink-0 max-h-[40%] overflow-y-auto animate-fade-in-up shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm font-bold">
                      {new Date(selectedDate).getDate()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', month: 'long' })}
                  </h3>
              </div>
              <div className="flex gap-2">
                 <button 
                    onClick={() => setSelectedDate(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors md:hidden"
                 >
                    <X size={20} />
                 </button>
                 <button 
                     onClick={() => onAddTrade(selectedDate)}
                     className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                 >
                     <Plus size={16} /> <span className="hidden sm:inline">Adicionar Trade</span><span className="sm:hidden">Novo</span>
                 </button>
              </div>
           </div>

           <div className="space-y-3">
               {selectedDateTrades.map(trade => (
                   <div key={trade.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors group">
                       <div className="flex items-center gap-4">
                            <div className={`w-1.5 h-10 rounded-full ${trade.pnl > 0 ? 'bg-emerald-500' : trade.pnl < 0 ? 'bg-rose-500' : 'bg-gray-300'}`}></div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 text-lg leading-none">{trade.asset}</p>
                                    {trade.imageUrl && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">IMG</span>}
                                </div>
                                <p className="text-xs text-gray-500 font-medium uppercase mt-1">{trade.direction === 'LONG' ? 'Compra' : 'Venda'} • {trade.marketType === 'SPOT' ? 'Spot' : 'Futuros'}</p>
                            </div>
                       </div>
                       <div className="flex items-center gap-4 sm:gap-6">
                           <div className="text-right">
                               <p className={`font-bold text-base ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                   {trade.pnl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                               </p>
                               <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Resultado</p>
                           </div>
                           <button 
                               onClick={() => onEditTrade(trade)}
                               className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"
                               title="Editar"
                           >
                               <Edit2 size={16} />
                           </button>
                       </div>
                   </div>
               ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;