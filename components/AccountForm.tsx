
import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AccountFormProps {
  onSave: (account: Account) => void;
  onCancel: () => void;
  initialData?: Account | null;
}

const AccountForm: React.FC<AccountFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    currency: 'USD',
    initialBalance: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        currency: initialData.currency,
        initialBalance: initialData.initialBalance
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const account: Account = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      currency: formData.currency || 'USD',
      initialBalance: formData.initialBalance || 0
    };
    onSave(account);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          {initialData ? 'Edit Portfolio' : 'Add Trading Portfolio'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio Name</label>
          <input 
            type="text" 
            placeholder="e.g. Binance Futures, Personal Spot" 
            required
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Currency</label>
            <input 
              type="text" 
              placeholder="USD" 
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border text-center uppercase"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Capital</label>
            <input 
              type="number" 
              step="any"
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              value={formData.initialBalance}
              onChange={e => setFormData({...formData, initialBalance: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100 mt-6">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {initialData ? 'Update Portfolio' : 'Create Portfolio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
