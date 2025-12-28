import React, { useState, useEffect } from 'react';
import { Part, PartCondition, Category } from '../types';
import { parsePartDescription } from '../services/geminiService';
import { Sparkles, Loader2, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onSave: (part: Part) => Promise<void>; // Updated to return Promise
  onCancel: () => void;
  initialData?: Part | null;
  isSaving: boolean; // New prop
}

export const AddPartForm: React.FC<Props> = ({ onSave, onCancel, initialData, isSaving }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState<Partial<Part>>({
    name: '',
    category: Category.OTHER,
    condition: PartCondition.NEW,
    quantity: 1,
    priceBuy: 0,
    priceSell: 0,
    location: '',
    compatibility: [],
    description: '',
    sourceInfo: ''
  });

  const [modelsInput, setModelsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setModelsInput(initialData.compatibility.join(', '));
    }
  }, [initialData]);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setErrorMsg('');
    const result = await parsePartDescription(aiPrompt);
    setIsAiLoading(false);

    if (result) {
      setFormData(prev => ({
        ...prev,
        ...result,
        // IMPORTANT: We use the AI result quantity if available, otherwise fall back to previous state.
        // Previously there was a bug where 'prev.quantity || 1' overwrote the AI result.
        quantity: result.quantity !== undefined ? result.quantity : (prev.quantity || 1),
        priceBuy: result.priceBuy !== undefined ? result.priceBuy : (prev.priceBuy || 0),
        priceSell: result.priceSell !== undefined ? result.priceSell : (prev.priceSell || 0),
        description: result.description || aiPrompt
      }));
      if (result.compatibility) {
        setModelsInput(result.compatibility.join(', '));
      }
    } else {
        setErrorMsg('Не вдалося розпізнати опис. Спробуйте ще раз або заповніть вручну.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partToSave: Part = {
      // Use existing ID if editing, otherwise new ID (backend might ignore ID on create depending on implementation)
      id: initialData?.id || uuidv4(),
      // Keep existing date or new date
      dateAdded: initialData?.dateAdded || new Date().toISOString(),
      compatibility: modelsInput.split(',').map(s => s.trim()).filter(Boolean),
      ...formData as any
    };
    await onSave(partToSave);
  };

  const inputClass = "w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-100";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Редагувати запчастину' : 'Додати нову запчастину'}
            </h2>
            <p className="text-sm text-gray-500">
              {initialData ? 'Внесіть зміни у поля нижче' : 'Заповніть форму вручну або використайте AI'}
            </p>
          </div>
          <button onClick={onCancel} disabled={isSaving} className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* AI Section - only show if creating new or explicitly wanting to use AI */}
          {!initialData && (
            <div className="mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Швидке заповнення
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Наприклад: Дисплей iPhone 11 оригінал знятий з донора, невелика подряпина"
                  className={`${inputClass} border-blue-200 focus:ring-blue-500`}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                  disabled={isSaving}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiPrompt || isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shrink-0"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Заповнити'}
                </button>
              </div>
              {errorMsg && <p className="text-xs text-red-500 mt-2">{errorMsg}</p>}
              <p className="text-xs text-blue-400 mt-2">AI автоматично визначить категорію, модель та стан деталі.</p>
            </div>
          )}

          <form id="add-part-form" onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={isSaving} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Назва деталі</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={inputClass}
                    placeholder="Дисплейний модуль..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                      className={inputClass}
                    >
                      {Object.values(Category).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Кількість</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сумісність (через кому)</label>
                  <input
                    type="text"
                    value={modelsInput}
                    onChange={(e) => setModelsInput(e.target.value)}
                    placeholder="iPhone X, iPhone XS..."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ціна закупівлі (₴)</label>
                    <input
                      type="number"
                      value={formData.priceBuy}
                      onChange={(e) => setFormData({...formData, priceBuy: parseFloat(e.target.value)})}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ціна продажу (₴)</label>
                    <input
                      type="number"
                      value={formData.priceSell}
                      onChange={(e) => setFormData({...formData, priceSell: parseFloat(e.target.value)})}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Стан деталі</label>
                    <div className="space-y-2">
                      {Object.values(PartCondition).map((cond) => (
                        <label key={cond} className={`flex items-center p-2 rounded-md border cursor-pointer transition-all ${formData.condition === cond ? 'bg-white border-blue-500 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                          <input
                            type="radio"
                            name="condition"
                            value={cond}
                            checked={formData.condition === cond}
                            onChange={() => setFormData({...formData, condition: cond as PartCondition})}
                            className="w-4 h-4 text-blue-600 mr-3"
                          />
                          <span className="text-sm text-gray-700">
                            {cond === PartCondition.NEW && '✨ Нова (New)'}
                            {cond === PartCondition.USED_EXCELLENT && '💎 Б/У Ідеал (Original pulled)'}
                            {cond === PartCondition.USED_GOOD && '✅ Б/У Робоча (Working)'}
                            {cond === PartCondition.USED_DAMAGED && '⚠️ Б/У З дефектом (Damaged)'}
                            {cond === PartCondition.FOR_PARTS && '🔧 Донор (For parts)'}
                          </span>
                        </label>
                      ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Джерело / Info</label>
                    <input
                      type="text"
                      value={formData.sourceInfo}
                      onChange={(e) => setFormData({...formData, sourceInfo: e.target.value})}
                      placeholder="Знято з IMEI ..., Постачальник 'PartStore'"
                      className={inputClass}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Локація (Полиця/Коробка)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="A-12"
                      className={inputClass}
                    />
                 </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Примітки</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className={inputClass}
                placeholder="Додаткова інформація про стан..."
              />
            </div>
            </fieldset>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            type="submit"
            form="add-part-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  );
};