import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PartList } from './components/PartList';
import { AddPartForm } from './components/AddPartForm';
import { RepairList } from './components/RepairList';
import { AddRepairForm } from './components/AddRepairForm';
import { BulkImportModal } from './components/BulkImportModal';
import { Part, RepairOrder, RepairStatus } from './types';
import { Plus, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from './services/api';
import { normalizePartsData } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'repairs'>('inventory');
  
  // Inventory State
  const [parts, setParts] = useState<Part[]>([]);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isNormalizing, setIsNormalizing] = useState(false); // New state
  
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

  const handleBulkSaveParts = async (newParts: Part[]) => {
      // In a real app, you might want a bulk_create endpoint.
      // Here we will loop for simplicity, or we could add a bulk method to API.
      try {
          // Creating promises array
          const promises = newParts.map(part => api.createPart(part));
          await Promise.all(promises);
          
          // Refresh list
          const data = await api.getParts();
          setParts(data);
          
          setIsBulkImportModalOpen(false);
      } catch (err) {
          console.error("Bulk save error", err);
          alert('Помилка при масовому збереженні.');
      }
  };

  const handleNormalizeParts = async () => {
    if (parts.length === 0) return;
    if (!window.confirm("AI проаналізує всі назви та категорії товарів і виправить помилки. Це може зайняти час. Продовжити?")) return;

    setIsNormalizing(true);
    try {
      // 1. Get corrections from AI
      const corrections = await normalizePartsData(parts);
      
      if (!corrections || corrections.length === 0) {
        alert("AI не знайшов, що виправляти, або виникла помилка.");
        return;
      }

      // 2. Apply updates one by one (or batch if API supported)
      let updatedCount = 0;
      for (const correction of corrections) {
        const originalPart = parts.find(p => p.id === correction.id);
        
        // Update only if changed
        if (originalPart && (originalPart.name !== correction.name || originalPart.category !== correction.category)) {
          const updatedPart = { ...originalPart, name: correction.name, category: correction.category };
          
          // Call API
          await api.updatePart(updatedPart);
          
          // Update State locally to reflect changes immediately in UI
          setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        alert(`Успішно оновлено ${updatedCount} товарів!`);
      } else {
        alert("Всі товари вже мають правильні назви.");
      }

    } catch (err) {
      console.error(err);
      alert("Помилка при нормалізації даних.");
    } finally {
      setIsNormalizing(false);
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
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsBulkImportModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-5 h-5" /> AI Імпорт (Голос)
                </button>
                <button 
                  onClick={() => { setEditingPart(null); setIsAddPartModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" /> Додати деталь
                </button>
             </div>
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
                        onNormalize={handleNormalizeParts}
                        isNormalizing={isNormalizing}
                    />
                </>
            ) : (
                <RepairList repairs={repairs} onStatusChange={handleRepairStatusChange} />
            )}
          </>
        )}
        
      </main>

      {/* Modals */}
      {isAddPartModalOpen && (
        <AddPartForm 
          onSave={handleSavePart} 
          onCancel={closePartModal}
          initialData={editingPart}
          isSaving={isSaving}
        />
      )}

      {isBulkImportModalOpen && (
        <BulkImportModal
            onSave={handleBulkSaveParts}
            onCancel={() => setIsBulkImportModalOpen(false)}
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