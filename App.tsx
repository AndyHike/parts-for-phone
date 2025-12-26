import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PartList } from './components/PartList';
import { AddPartForm } from './components/AddPartForm';
import { RepairList } from './components/RepairList';
import { AddRepairForm } from './components/AddRepairForm';
import { Part, RepairOrder, RepairStatus } from './types';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { api } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'repairs'>('inventory');
  
  // Inventory State
  const [parts, setParts] = useState<Part[]>([]);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  
  // Repairs State
  const [repairs, setRepairs] = useState<RepairOrder[]>([]);
  const [isAddRepairModalOpen, setIsAddRepairModalOpen] = useState(false);

  // Common State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'inventory') {
        const data = await api.getParts();
        setParts(data);
      } else {
        const data = await api.getRepairs();
        setRepairs(data);
      }
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити дані. Переконайтеся, що бекенд запущено.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Parts Handlers ---
  const handleSavePart = async (partToSave: Part) => {
    setIsSaving(true);
    try {
      if (editingPart) {
        const updatedPart = await api.updatePart(partToSave);
        setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
      } else {
        const newPart = await api.createPart(partToSave);
        setParts(prev => [newPart, ...prev]);
      }
      closePartModal();
    } catch (err) {
      console.error(err);
      alert('Помилка при збереженні запчастини.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePart = async (id: string) => {
    try {
      await api.deletePart(id);
      setParts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Не вдалося видалити запис.');
    }
  };

  const closePartModal = () => {
    setIsAddPartModalOpen(false);
    setEditingPart(null);
  };

  // --- Repairs Handlers ---
  const handleCreateRepair = async (order: RepairOrder) => {
    setIsSaving(true);
    try {
        const newOrder = await api.createRepair(order);
        setRepairs(prev => [newOrder, ...prev]);
        setIsAddRepairModalOpen(false);
    } catch (err) {
        console.error(err);
        alert('Помилка при створенні замовлення.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleRepairStatusChange = async (id: string, newStatus: RepairStatus) => {
      // Optimistic Update
      const oldRepairs = [...repairs];
      setRepairs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

      try {
          await api.updateRepairStatus(id, newStatus);
      } catch (err) {
          console.error(err);
          setRepairs(oldRepairs); // Revert
          alert('Не вдалося оновити статус.');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans pb-10">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'inventory' ? 'Склад запчастин' : 'Ремонтні замовлення'}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeTab === 'inventory' 
                ? 'Керуйте наявністю, додавайте нові та Б/У деталі' 
                : 'Керуйте замовленнями, статусами та послугами'}
            </p>
          </div>
          
          {activeTab === 'inventory' ? (
             <button 
                onClick={() => { setEditingPart(null); setIsAddPartModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Додати деталь
              </button>
          ) : (
              <button 
                onClick={() => setIsAddRepairModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Нове замовлення
              </button>
          )}
        </div>

        {error && (
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
             <AlertCircle className="w-5 h-5" /> {error}
           </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
            <p>Завантаження даних...</p>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' ? (
                <>
                    <DashboardStats parts={parts} />
                    <PartList 
                        parts={parts} 
                        onDelete={handleDeletePart} 
                        onEdit={(part) => { setEditingPart(part); setIsAddPartModalOpen(true); }}
                    />
                </>
            ) : (
                <RepairList repairs={repairs} onStatusChange={handleRepairStatusChange} />
            )}
          </>
        )}
        
      </main>

      {/* Modal*/}
      {isAddPartModalOpen && (
        <AddPartForm 
          onSave={handleSavePart} 
          onCancel={closePartModal}
          initialData={editingPart}
          isSaving={isSaving}
        />
      )}

      {isAddRepairModalOpen && (
        <AddRepairForm 
          onSave={handleCreateRepair} 
          onCancel={() => setIsAddRepairModalOpen(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}; 

export default App;
