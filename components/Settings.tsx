import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Save, Target } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: Number(e.target.value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    // Simple feedback
    alert('Configurações salvas!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Parâmetros da Conta</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Capital Inicial (BRL)</label>
          <input 
            type="number" 
            name="initialCapital" 
            value={formData.initialCapital} 
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all shadow-sm"
          />
          <p className="text-xs text-gray-400 mt-2">Base para o cálculo de crescimento patrimonial.</p>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
             <Target size={16} className="text-blue-600"/>
             <label className="block text-sm font-bold text-blue-900">Meta Mensal (BRL)</label>
          </div>
          <input 
            type="number" 
            name="monthlyGoal" 
            value={formData.monthlyGoal} 
            onChange={handleChange}
            className="w-full bg-white border border-blue-200 rounded-xl p-3.5 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
          <p className="text-xs text-blue-600/80 mt-2">
            Este valor será usado para calcular o progresso no card "Meta Mensal" da Dashboard.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Risco Máximo (%)</label>
          <input 
            type="number" 
            step="0.1"
            name="riskPerTrade" 
            value={formData.riskPerTrade} 
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all shadow-sm"
          />
           <p className="text-xs text-gray-400 mt-2">Parâmetro utilizado pela IA para gestão de risco.</p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-200"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;