import React, { useState, useRef, useEffect } from 'react';
import { Part, PartCondition, Category } from '../types';
import { parseMultiplePartsDescription } from '../services/geminiService';
import { Mic, MicOff, Sparkles, Loader2, Save, X, Trash2, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onSave: (parts: Part[]) => Promise<void>;
  onCancel: () => void;
}

export const BulkImportModal: React.FC<Props> = ({ onSave, onCancel }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [parsedParts, setParsedParts] = useState<Partial<Part>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'uk-UA';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
             setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
          if (isListening) {
              // specific logic if needed to auto-restart, but usually manual toggle is safer
          }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleAiProcess = async () => {
    if (!text.trim()) return;
    setIsAiLoading(true);
    const results = await parseMultiplePartsDescription(text);
    if (results && Array.isArray(results)) {
        // Enrich with defaults
        const enriched = results.map(p => ({
            ...p,
            quantity: p.quantity || 1,
            priceBuy: p.priceBuy || 0,
            priceSell: p.priceSell || 0,
            compatibility: p.compatibility || [],
            category: p.category || Category.OTHER,
            condition: p.condition || PartCondition.USED_GOOD
        }));
        setParsedParts(enriched);
    }
    setIsAiLoading(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const partsToSave: Part[] = parsedParts.map(p => ({
        id: uuidv4(),
        dateAdded: new Date().toISOString(),
        name: p.name || 'Unknown Part',
        category: p.category || Category.OTHER,
        condition: p.condition || PartCondition.USED_GOOD,
        compatibility: p.compatibility || [],
        quantity: p.quantity || 1,
        priceBuy: p.priceBuy || 0,
        priceSell: p.priceSell || 0,
        location: p.location || '',
        description: p.description || '',
        sourceInfo: p.sourceInfo || 'AI Import'
    }));

    await onSave(partsToSave);
    setIsSaving(false);
  };

  const removePart = (index: number) => {
    setParsedParts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Масовий AI Імпорт
            </h2>
            <p className="text-sm text-gray-500">
              Надиктуйте список запчастин (наприклад: "Екран айфон 11 2 штуки, батарея самсунг с20, корпус редмі...").
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Input Section */}
            <div className="w-full md:w-1/3 p-6 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="flex-grow flex flex-col gap-4">
                    <label className="text-sm font-medium text-gray-700">Текст для обробки</label>
                    <textarea 
                        className="w-full flex-grow p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm text-gray-700"
                        placeholder="Натисніть мікрофон і говоріть..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={toggleListening}
                            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                                isListening 
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                : 'bg-gray-800 hover:bg-gray-900 text-white'
                            }`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            {isListening ? 'Стоп' : 'Диктувати'}
                        </button>
                        <button 
                             onClick={handleAiProcess}
                             disabled={!text || isAiLoading}
                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                             {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                             Розпізнати
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="w-full md:w-2/3 p-6 flex flex-col overflow-hidden bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Результат ({parsedParts.length})</h3>
                    {parsedParts.length > 0 && (
                        <button 
                            onClick={() => setParsedParts([])} 
                            className="text-xs text-red-500 hover:underline"
                        >
                            Очистити все
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar border rounded-xl border-gray-200">
                    {parsedParts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <Sparkles className="w-12 h-12 mb-4 text-gray-200" />
                            <p>Тут з'являться розпізнані товари.</p>
                            <p className="text-sm">Спробуйте: "Дисплей iPhone X оригінал, Батарея Xiaomi Note 8"</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                                <tr>
                                    <th className="p-3">Назва</th>
                                    <th className="p-3">Моделі</th>
                                    <th className="p-3">К-сть</th>
                                    <th className="p-3">Стан</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parsedParts.map((part, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50">
                                        <td className="p-3 font-medium text-gray-800">{part.name}</td>
                                        <td className="p-3 text-gray-600">{part.compatibility?.join(', ')}</td>
                                        <td className="p-3">
                                            <input 
                                                type="number" 
                                                value={part.quantity}
                                                onChange={(e) => {
                                                    const newParts = [...parsedParts];
                                                    newParts[idx].quantity = parseInt(e.target.value);
                                                    setParsedParts(newParts);
                                                }}
                                                className="w-16 border rounded p-1 text-center"
                                            />
                                        </td>
                                        <td className="p-3 text-xs">
                                            <span className="bg-gray-100 px-2 py-1 rounded-md">{part.condition}</span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => removePart(idx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveAll}
                        disabled={parsedParts.length === 0 || isSaving}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Зберегти все до бази
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
