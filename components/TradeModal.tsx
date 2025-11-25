import React, { useState, useEffect } from 'react';
import { Trade, TradeDirection } from '../types';
import { X, Upload, Loader2, DollarSign } from 'lucide-react';
import { uploadTradeImage } from '../services/storageService';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  onDelete: (id: string) => void;
  initialDate: string;
  tradeToEdit?: Trade;
  userId: string;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSave, onDelete, initialDate, tradeToEdit, userId }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: initialDate,
    asset: '',
    direction: TradeDirection.LONG,
    marketType: 'SPOT',
    investedValue: 0,
    quantity: 0,
    entryPrice: 0,
    exitPrice: 0,
    pnl: 0,
    notes: '',
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (tradeToEdit) {
      setFormData(tradeToEdit);
    } else {
      setFormData({
        date: initialDate,
        asset: '',
        direction: TradeDirection.LONG,
        marketType: 'SPOT',
        quantity: 0,
        entryPrice: 0,
        exitPrice: 0,
        pnl: 0,
        notes: '',
        imageUrl: undefined
      });
    }
  }, [tradeToEdit, initialDate, isOpen]);

  // Auto-calculate PnL when values change
  useEffect(() => {
    if (formData.quantity && formData.entryPrice && formData.exitPrice) {
      let calcPnL = 0;
      if (formData.direction === TradeDirection.LONG) {
        calcPnL = (Number(formData.exitPrice) - Number(formData.entryPrice)) * Number(formData.quantity);
      } else {
        calcPnL = (Number(formData.entryPrice) - Number(formData.exitPrice)) * Number(formData.quantity);
      }
      setFormData(prev => ({ ...prev, pnl: Number(calcPnL.toFixed(2)) }));
    }
  }, [formData.quantity, formData.entryPrice, formData.exitPrice, formData.direction]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['quantity', 'entryPrice', 'exitPrice', 'pnl'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await uploadTradeImage(file);
        if (publicUrl) {
           setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        } else {
            alert("Erro ao fazer upload da imagem. Verifique se o bucket 'trade-images' existe no Supabase e é público.");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao fazer upload.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Invested Value Calculation (approx)
    const invested = (formData.entryPrice || 0) * (formData.quantity || 0);
    
    onSave({
      ...formData as Trade,
      investedValue: invested,
      userId,
      stopLoss: 0, // Default as removed from UI
      takeProfit: 0, // Default as removed from UI
      entryReason: '',
      exitReason: '',
      id: tradeToEdit ? tradeToEdit.id : Date.now().toString()
    });
    onClose();
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-100 shadow-2xl animate-fade-in-up my-auto">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">
            {tradeToEdit ? 'Editar Trade' : 'Novo Registro'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Asset & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ativo (Ticker)</label>
              <input type="text" name="asset" required value={formData.asset} onChange={handleChange} placeholder="Ex: BTCUSDT" className={`${inputClass} uppercase`} />
            </div>
          </div>

          {/* Row 2: Operation & Market */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className={labelClass}>Operação</label>
              <div className="flex gap-2">
                 <button 
                   type="button" 
                   onClick={() => setFormData(p => ({...p, direction: TradeDirection.LONG}))}
                   className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${formData.direction === TradeDirection.LONG ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200'}`}
                 >
                   Compra
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setFormData(p => ({...p, direction: TradeDirection.SHORT}))}
                   className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${formData.direction === TradeDirection.SHORT ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-500 border-gray-200'}`}
                 >
                   Venda
                 </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Mercado</label>
              <select name="marketType" value={formData.marketType} onChange={handleChange} className={inputClass}>
                <option value="SPOT">Spot</option>
                <option value="FUTURES">Futuros</option>
              </select>
            </div>
          </div>

          {/* Row 3: Financials (Simplified Layout) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase">Dados da Execução</label>
              <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="text-[10px] text-gray-500 font-semibold mb-1 block">Quantidade</label>
                    <input type="number" step="0.0001" name="quantity" placeholder="0.00" value={formData.quantity} onChange={handleChange} className={inputClass} required />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 font-semibold mb-1 block">Preço Entrada</label>
                    <input type="number" step="0.01" name="entryPrice" placeholder="0.00" value={formData.entryPrice} onChange={handleChange} className={inputClass} required />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 font-semibold mb-1 block">Preço Saída</label>
                    <input type="number" step="0.01" name="exitPrice" placeholder="0.00" value={formData.exitPrice} onChange={handleChange} className={inputClass} required />
                 </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-sm font-semibold text-gray-600">Resultado (P&L):</span>
                  <span className={`text-lg font-bold ${Number(formData.pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {Number(formData.pnl).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
              </div>
          </div>

          {/* Row 4: Notes */}
          <div>
            <label className={labelClass}>Observações</label>
            <textarea 
               name="notes" 
               value={formData.notes} 
               onChange={handleChange} 
               rows={3}
               placeholder="Detalhes sobre a operação..."
               className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:border-gray-900 outline-none resize-none transition-all"
             ></textarea>
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={isUploading}/>
            {isUploading ? (
               <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                  <span className="text-xs text-gray-400 mt-2">Enviando imagem...</span>
               </div>
            ) : formData.imageUrl ? (
              <div className="relative h-32 w-full">
                <img src={formData.imageUrl} alt="Print" className="h-full w-full object-contain rounded-lg" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                   <span className="text-white text-xs font-medium">Clique para alterar</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2 py-2">
                <Upload size={24}/>
                <span className="text-xs font-medium">Anexar Print (Supabase)</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {tradeToEdit && (
              <button 
                type="button" 
                onClick={() => onDelete(tradeToEdit.id)}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 py-3 rounded-xl text-sm font-semibold transition-colors border border-red-100"
              >
                Excluir
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors border border-gray-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-gray-200"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
