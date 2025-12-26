import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PartList } from './components/PartList';
import { AddPartForm } from './components/AddPartForm';
import { Part, Category, PartCondition } from './types';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { api } from './services/api';

const App: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  
  // New States for Async operations
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load parts from Backend on Mount
  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getParts();
      setParts(data);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити дані з сервера. Переконайтеся, що бекенд запущено.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePart = async (partToSave: Part) => {
    setIsSaving(true);
    try {
      if (editingPart) {
        // Update existing on Backend
        const updatedPart = await api.updatePart(partToSave);
        setParts(prev => prev.map(p => p.id === updatedPart.id ? updatedPart : p));
      } else {
        // Create new on Backend
        const newPart = await api.createPart(partToSave);
        setParts(prev => [newPart, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Помилка при збереженні даних. Спробуйте ще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setIsAddModalOpen(true);
  };

  const handleDeletePart = async (id: string) => {
    // Optimistic UI update or wait for server? Let's wait for server to be safe.
    try {
      await api.deletePart(id);
      setParts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Не вдалося видалити запис. Перевірте з\'єднання.');
    }
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
            <p className="text-gray-500 mt-1">Керуйте наявністю, додавайте нові та Б/У деталі (PostgreSQL)</p>
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

        {error && (
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
             <AlertCircle className="w-5 h-5" />
             {error}
           </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
            <p>Завантаження даних складу...</p>
          </div>
        ) : (
          <>
            <DashboardStats parts={parts} />
            <PartList 
              parts={parts} 
              onDelete={handleDeletePart} 
              onEdit={handleEditPart}
            />
          </>
        )}
        
      </main>

      {isAddModalOpen && (
        <AddPartForm 
          onSave={handleSavePart} 
          onCancel={closeModal}
          initialData={editingPart}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default App;