import React from 'react';
import { Part, PartCondition } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Package, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  parts: Part[];
}

export const DashboardStats: React.FC<Props> = ({ parts }) => {
  // Виправлені розрахунки з захистом від некоректних даних (NaN)
  const totalItems = parts.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const totalValueBuy = parts.reduce((acc, p) => acc + (Number(p.priceBuy || 0) * Number(p.quantity || 0)), 0);
  const totalValueSell = parts.reduce((acc, p) => acc + (Number(p.priceSell || 0) * Number(p.quantity || 0)), 0);
  
  const usedCount = parts.filter(p => p.condition !== PartCondition.NEW).length;

  const conditionData = [
    { name: 'Нові', value: parts.filter(p => p.condition === PartCondition.NEW).length, color: '#22c55e' },
    { name: 'Б/У Ідеал', value: parts.filter(p => p.condition === PartCondition.USED_EXCELLENT).length, color: '#3b82f6' },
    { name: 'Б/У Роб.', value: parts.filter(p => p.condition === PartCondition.USED_GOOD).length, color: '#eab308' },
    { name: 'Пошкоджені', value: parts.filter(p => [PartCondition.USED_DAMAGED, PartCondition.FOR_PARTS].includes(p.condition)).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Всього запчастин" 
        value={totalItems} 
        sub={`${usedCount} позицій Б/У`}
        icon={Package} 
        color="bg-blue-500" 
      />
      <StatCard 
        title="Вартість складу (Закуп)" 
        value={`${totalValueBuy.toLocaleString()} ₴`} 
        sub={`Продаж: ${totalValueSell.toLocaleString()} ₴`}
        icon={DollarSign} 
        color="bg-green-500" 
      />
      <StatCard 
        title="Категорій" 
        value={new Set(parts.map(p => p.category)).size} 
        icon={Layers} 
        color="bg-purple-500" 
      />
       <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-32 md:h-auto">
         <h4 className="text-xs text-gray-500 absolute top-3 left-4">Стан складу</h4>
         <div className="w-full h-full min-h-[100px]">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conditionData}
                innerRadius={25}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
         </div>
       </div>
    </div>
  );
};
