import React, { useState } from 'react';
import { Part, PartCondition, Category } from '../types';
import { Search, Filter, Smartphone, MapPin, Tag, Trash2, Edit } from 'lucide-react';

interface Props {
  parts: Part[];
  onDelete: (id: string) => void;
  onEdit: (part: Part) => void;
}

export const PartList: React.FC<Props> = ({ parts, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredParts = parts.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.compatibility.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
      part.sourceInfo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || part.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getConditionBadge = (cond: PartCondition) => {
    switch (cond) {
      case PartCondition.NEW:
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Нова</span>;
      case PartCondition.USED_EXCELLENT:
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Б/У Ідеал</span>;
      case PartCondition.USED_GOOD:
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Б/У Робоча</span>;
      case PartCondition.USED_DAMAGED:
        return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Б/У Дефект</span>;
      case PartCondition.FOR_PARTS:
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">На запчастини</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Пошук (назва, модель, джерело)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Всі категорії</option>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Назва / Опис</th>
              <th className="px-6 py-4">Моделі</th>
              <th className="px-6 py-4">Стан</th>
              <th className="px-6 py-4 text-center">К-сть</th>
              <th className="px-6 py-4 text-right">Ціна (Прод.)</th>
              <th className="px-6 py-4 text-center">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredParts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              filteredParts.map((part) => (
                <tr key={part.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{part.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Tag className="w-3 h-3" /> {part.category}
                        {part.location && (
                          <>
                            <span className="text-gray-300">|</span>
                            <MapPin className="w-3 h-3 text-gray-400" /> {part.location}
                          </>
                        )}
                      </div>
                      {part.sourceInfo && <span className="text-xs text-blue-500 mt-1">{part.sourceInfo}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {part.compatibility.slice(0, 3).map((m, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <Smartphone className="w-3 h-3 mr-1 text-gray-400" />
                          {m}
                        </span>
                      ))}
                      {part.compatibility.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">+{part.compatibility.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getConditionBadge(part.condition)}
                    {part.description && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={part.description}>
                        {part.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${part.quantity < 2 ? 'text-red-500' : 'text-gray-700'}`}>
                      {part.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {part.priceSell} ₴
                    <div className="text-xs text-gray-400">Вхід: {part.priceBuy} ₴</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                        onClick={() => onEdit(part)}
                        title="Редагувати"
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(part.id);
                        }}
                        title="Видалити"
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};