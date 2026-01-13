
import React, { useState, useEffect } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const STEPS: TourStep[] = [
  {
    targetId: 'app-header',
    title: 'Welcome to Pseudo-Whales',
    content: 'The ultimate cockpit for elite traders. Let\'s take a 30-second tour of your new edge.',
    position: 'center'
  },
  {
    targetId: 'tour-stats',
    title: 'Executive Metrics',
    content: 'Track your Net Profit, Win Rate, and Average Risk/Reward ratio across all your accounts in real-time.',
    position: 'bottom'
  },
  {
    targetId: 'tour-equity',
    title: 'Growth Visualizer',
    content: 'Your equity curve shows the compounding power of your edge. Consistency over intensity.',
    position: 'bottom'
  },
  {
    targetId: 'tour-psychology',
    title: 'Psychological Analysis',
    content: 'Identify your emotional "leaks". We use AI to scan your notes and find behaviors that cost you money.',
    position: 'top'
  },
  {
    targetId: 'tour-intelligence',
    title: 'Global Intelligence Hub',
    content: 'Use Gemini AI to scan the web for institutional news, retail sentiment, and public setups.',
    position: 'top'
  },
  {
    targetId: 'tour-ai-coach',
    title: 'Trade Wisdom (AI Coach)',
    content: 'Record your charts and notes. Our AI Coach analyzes your psychology and technical execution to find leaks in your game.',
    position: 'left'
  },
  {
    targetId: 'tour-journal',
    title: 'Precision Journaling',
    content: 'The most detailed trade log in the industry. Filter, edit, and review every execution with ease.',
    position: 'top'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const step = STEPS[currentStepIndex];

  useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (step.position === 'center') {
        setCoords({ top: 0, left: 0, width: 0, height: 0 });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStepIndex, step.targetId, step.position]);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto transition-all duration-500" 
           style={{ 
             clipPath: step.position === 'center' 
               ? 'none' 
               : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)` 
           }} 
           onClick={handleNext}
      />

      {step.position !== 'center' && (
        <div 
          className="absolute border-2 border-blue-400 rounded-xl transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16
          }}
        />
      )}

      <div 
        className={`absolute pointer-events-auto transition-all duration-500 flex items-center justify-center ${step.position === 'center' ? 'inset-0' : ''}`}
        style={step.position !== 'center' ? {
          top: step.position === 'bottom' ? coords.top + coords.height + 24 : step.position === 'top' ? coords.top - 200 : coords.top,
          left: step.position === 'right' ? coords.left + coords.width + 24 : step.position === 'left' ? coords.left - 340 : coords.left + (coords.width / 2) - 160,
          width: '320px'
        } : {}}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Step {currentStepIndex + 1} of {STEPS.length}</span>
            <button onClick={onComplete} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {step.content}
          </p>
          <div className="flex justify-between items-center">
            <button 
              onClick={onComplete}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex space-x-2">
              {currentStepIndex > 0 && (
                <button 
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                {currentStepIndex === STEPS.length - 1 ? 'Finish' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
