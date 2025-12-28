import React from 'react';
import { RepairOrder, RepairStatus } from '../types';
import { Search, Smartphone, User, Calendar, Circle, CheckCircle, Clock, AlertTriangle, XCircle, MoreHorizontal } from 'lucide-react';

interface Props {
  repairs: RepairOrder[];
  onStatusChange: (id: string, newStatus: RepairStatus) => void;
}

export const RepairList: React.FC<Props> = ({ repairs, onStatusChange }) => {
  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.RECEIVED: return 'bg-gray-100 text-gray-700 border-gray-200';
      case RepairStatus.DIAGNOSTICS: return 'bg-purple-50 text-purple-700 border-purple-200';
      case RepairStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-200';
      case RepairStatus.WAITING_PARTS: return 'bg-orange-50 text-orange-700 border-orange-200';
      case RepairStatus.READY: return 'bg-green-50 text-green-700 border-green-200';
      case RepairStatus.COMPLETED: return 'bg-slate-100 text-slate-600 border-slate-200 decoration-slate-400';
      case RepairStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: RepairStatus) => {
     switch (status) {
      case RepairStatus.RECEIVED: return <Circle className="w-3 h-3" />;
      case RepairStatus.IN_PROGRESS: return <Clock className="w-3 h-3" />;
      case RepairStatus.READY: return <CheckCircle className="w-3 h-3" />;
      case RepairStatus.WAITING_PARTS: return <AlertTriangle className="w-3 h-3" />;
      case RepairStatus.CANCELLED: return <XCircle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status: RepairStatus) => {
      const labels: Record<string, string> = {
          [RepairStatus.RECEIVED]: 'Прийнято',
          [RepairStatus.DIAGNOSTICS]: 'Діагностика',
          [RepairStatus.IN_PROGRESS]: 'В роботі',
          [RepairStatus.WAITING_PARTS]: 'Чекає запчастини',
          [RepairStatus.READY]: 'Готово',
          [RepairStatus.COMPLETED]: 'Видано',
          [RepairStatus.CANCELLED]: 'Відмова'
      };
      return labels[status] || status;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filters Header - Simplified for now */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
        <div className="relative w-full max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
           <input
            type="text"
            placeholder="Пошук ремонту (Ім'я, IMEI, модель)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">ID / Дата</th>
              <th className="px-6 py-4">Пристрій</th>
              <th className="px-6 py-4">Клієнт</th>
              <th className="px-6 py-4">Несправність / Послуги</th>
              <th className="px-6 py-4 text-center">Статус</th>
              <th className="px-6 py-4 text-right">Сума</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {repairs.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Немає активних ремонтів
                    </td>
                  </tr>
            ) : (
                repairs.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.dateReceived).toLocaleDateString()}
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{order.deviceBrand} {order.deviceModel}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Smartphone className="w-3 h-3" />
                        IMEI: {order.deviceSnImei}
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{order.clientName}</div>
                    <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                        <User className="w-3 h-3" />
                        {order.clientPhone}
                    </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-red-600 mb-1">{order.problemDescription}</div>
                       <div className="text-xs text-gray-500">
    {/* Додаємо перевірку order.services && ... */}
    {order.services && order.services.length > 0 
        ? order.services.map(s => s.name).join(', ') 
        : 'Послуги не додано'}
</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                         <div className="relative group inline-block">
                            <button className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {getStatusLabel(order.status)}
                            </button>
                            {/* Simple Status Dropdown on Hover */}
                            <div className="hidden group-hover:block absolute top-full left-0 mt-1 w-40 bg-white shadow-xl rounded-lg border border-gray-100 z-50 overflow-hidden">
                                {Object.values(RepairStatus).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => onStatusChange(order.id, status)}
                                        className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700"
                                    >
                                        {getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                        {order.totalPrice} ₴
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
