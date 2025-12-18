import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PartList } from './components/PartList';
import { AddPartForm } from './components/AddPartForm';
import { Part, Category, PartCondition } from './types';
import { Plus } from 'lucide-react';

const MOCK_DATA: Part[] = [
  {
    id: '1',
    name: 'Дисплей iPhone 11',
    category: Category.SCREEN,
    compatibility: ['iPhone 11'],
    condition: PartCondition.USED_EXCELLENT,
    quantity: 1,
    priceBuy: 1200,
    priceSell: 2500,
    location: 'A-01',
    sourceInfo: 'Знятий з донора IMEI 354...',
    description: 'Оригінал, без подряпин, трутон є',
    dateAdded: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Акумулятор Samsung S21',
    category: Category.BATTERY,
    compatibility: ['Samsung S21', 'Samsung S21 5G'],
    condition: PartCondition.NEW,
    quantity: 5,
    priceBuy: 400,
    priceSell: 900,
    location: 'B-05',
    dateAdded: new Date().toISOString(),
    description: 'Сервісний оригінал pack'
  },
  {
    id: '3',
    name: 'Корпус iPhone XR Black',
    category: Category.HOUSING,
    compatibility: ['iPhone XR'],
    condition: PartCondition.USED_DAMAGED,
    quantity: 1,
    priceBuy: 200,
    priceSell: 600,
    location: 'S-Box-2',
    sourceInfo: 'Клієнт відмовився',
    description: 'Глибока подряпина біля розєму, скло камери ціле',
    dateAdded: new Date().toISOString()
  }
];

const App: React.FC = () => {
  const [parts, setParts] = useState<Part[]>(() => {
    const saved = localStorage.getItem('inventory_parts');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  useEffect(() => {
    localStorage.setItem('inventory_parts', JSON.stringify(parts));
  }, [parts]);

  const handleSavePart = (partToSave: Part) => {
    if (editingPart) {
      // Update existing
      setParts(prev => prev.map(p => p.id === partToSave.id ? partToSave : p));
    } else {
      // Add new
      setParts(prev => [partToSave, ...prev]);
    }
    closeModal();
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setIsAddModalOpen(true);
  };

  const handleDeletePart = (id: string) => {
    // Removed window.confirm to ensure deletion works if browser blocks dialogs.
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingPart(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans pb-10">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Склад запчастин</h2>
            <p className="text-gray-500 mt-1">Керуйте наявністю, додавайте нові та Б/У деталі</p>
          </div>
          <button 
            onClick={() => {
              setEditingPart(null);
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Додати деталь
          </button>
        </div>

        <DashboardStats parts={parts} />
        
        <PartList 
          parts={parts} 
          onDelete={handleDeletePart} 
          onEdit={handleEditPart}
        />
        
      </main>

      {isAddModalOpen && (
        <AddPartForm 
          onSave={handleSavePart} 
          onCancel={closeModal}
          initialData={editingPart}
        />
      )}
    </div>
  );
};

export default App;