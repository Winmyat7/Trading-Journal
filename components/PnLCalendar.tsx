
import React, { useState } from 'react';
import { Trade } from '../types';

interface PnLCalendarProps {
  trades: Trade[];
}

const PnLCalendar: React.FC<PnLCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group trades by date string (YYYY-MM-DD)
  const pnlByDate = trades.reduce((acc, trade) => {
    const dateStr = trade.date; // already YYYY-MM-DD
    acc[dateStr] = (acc[dateStr] || 0) + (trade.pnl || 0);
    return acc;
  }, {} as Record<string, number>);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const calendarDays: (number | null)[] = [];

  // Fill empty slots for previous month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  // Fill actual days
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d);
  }

  // Group into weeks (rows of 7)
  const rows: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  const calculateWeekPnL = (week: (number | null)[]) => {
    return week.reduce((sum, day) => {
      if (day === null) return sum;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return sum + (pnlByDate[dateStr] || 0);
    }, 0);
  };

  const hasTradesInWeek = (week: (number | null)[]) => {
    return week.some(day => {
      if (day === null) return false;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return pnlByDate[dateStr] !== undefined;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">P&L Calendar</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-slate-600">{monthNames[month]} {year}</span>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded transition-all">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded transition-all">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-400 py-2">
            {day}
          </div>
        ))}
        <div className="text-center text-[10px] uppercase font-bold text-blue-500 py-2">
          Weekly
        </div>
        
        {rows.map((week, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {week.map((day, idx) => {
              if (day === null) return <div key={`empty-${rowIndex}-${idx}`} className="aspect-square"></div>;

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dailyPnL = pnlByDate[dateStr];
              const hasTrades = dailyPnL !== undefined;

              let bgColor = 'bg-slate-50';
              let textColor = 'text-slate-400';
              let pnlColor = 'text-slate-400';

              if (hasTrades) {
                if (dailyPnL > 0) {
                  bgColor = 'bg-emerald-50 border border-emerald-100';
                  textColor = 'text-emerald-900';
                  pnlColor = 'text-emerald-600';
                } else if (dailyPnL < 0) {
                  bgColor = 'bg-rose-50 border border-rose-100';
                  textColor = 'text-rose-900';
                  pnlColor = 'text-rose-600';
                } else {
                  bgColor = 'bg-slate-100 border border-slate-200';
                  textColor = 'text-slate-900';
                  pnlColor = 'text-slate-500';
                }
              }

              return (
                <div 
                  key={dateStr} 
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all hover:scale-105 cursor-default ${bgColor}`}
                >
                  <span className={`text-[10px] font-bold ${textColor}`}>{day}</span>
                  {hasTrades && (
                    <span className={`text-[9px] font-extrabold truncate w-full text-center ${pnlColor}`}>
                      {dailyPnL > 0 ? '+' : ''}{Math.round(dailyPnL)}
                    </span>
                  )}
                </div>
              );
            })}
            
            {/* Weekly Summary Column */}
            {(() => {
              const weekPnL = calculateWeekPnL(week);
              const activeWeek = hasTradesInWeek(week);
              
              let weekBg = 'bg-slate-100/50';
              let weekPnlColor = 'text-slate-400';
              
              if (activeWeek) {
                if (weekPnL > 0) {
                  weekBg = 'bg-blue-50 border border-blue-100 shadow-sm';
                  weekPnlColor = 'text-emerald-600';
                } else if (weekPnL < 0) {
                  weekBg = 'bg-slate-100 border border-slate-200';
                  weekPnlColor = 'text-rose-600';
                }
              }

              return (
                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 border-l-2 border-slate-200/50 ${weekBg}`}>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                  <span className={`text-[10px] font-black truncate w-full text-center ${weekPnlColor}`}>
                    {activeWeek ? `${weekPnL > 0 ? '+' : ''}${Math.round(weekPnL)}` : '-'}
                  </span>
                </div>
              );
            })()}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center space-x-4 text-[10px] font-medium text-slate-400">
        <div className="flex items-center"><div className="w-3 h-3 bg-emerald-100 rounded mr-1"></div> Profit</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-rose-100 rounded mr-1"></div> Loss</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded mr-1"></div> Strong Week</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-slate-50 border border-slate-100 rounded mr-1"></div> No Activity</div>
      </div>
    </div>
  );
};

export default PnLCalendar;
