import React, { useState } from 'react';
import { RepairOrder, RepairStatus, RepairServiceItem } from '../types';
import { Save, X, Plus, Trash2, Smartphone, User, Wrench } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onSave: (order: RepairOrder) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const AddRepairForm: React.FC<Props> = ({ onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<RepairOrder>>({
    clientName: '',
    clientPhone: '',
    deviceBrand: '',
    deviceModel: '',
    deviceSnImei: '',
    deviceCondition: '',
    problemDescription: '',
    status: RepairStatus.RECEIVED,
    services: [],
    notes: '',
  });

  // State for adding a new service line item locally
  const [newService, setNewService] = useState<RepairServiceItem>({ name: '', price: 0, cost: 0 });

  const addService = () => {
    if (newService.name.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), { ...newService }]
      }));
      setNewService({ name: '', price: 0, cost: 0 }); // Reset input
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.services?.reduce((sum, item) => sum + item.price, 0) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderToSave: RepairOrder = {
      id: uuidv4(),
      dateReceived: new Date().toISOString(),
      totalPrice: calculateTotal(),
      services: formData.services || [],
      ...formData as any
    };
    await onSave(orderToSave);
  };

  const inputClass = "w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Нове замовлення на ремонт</h2>
            <p className="text-sm text-gray-500">Заповніть дані клієнта та пристрою</p>
          </div>
          <button onClick={onCancel} disabled={isSaving} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="add-repair-form" onSubmit={handleSubmit} className="space-y-8">
            <fieldset disabled={isSaving}>
              
              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                  <User className="w-4 h-4 text-blue-500" /> Клієнт
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ім'я Клієнта</label>
                    <input
                      required
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className={inputClass}
                      placeholder="Іван Іванов"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Телефон</label>
                    <input
                      required
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className={inputClass}
                      placeholder="+380..."
                    />
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-4 mt-6">
                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                  <Smartphone className="w-4 h-4 text-blue-500" /> Пристрій
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Бренд</label>
                    <input
                      required
                      type="text"
                      value={formData.deviceBrand}
                      onChange={(e) => setFormData({...formData, deviceBrand: e.target.value})}
                      className={inputClass}
                      placeholder="Apple, Samsung..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Модель</label>
                    <input
                      required
                      type="text"
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                      className={inputClass}
                      placeholder="iPhone 11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">S/N або IMEI</label>
                    <input
                      required
                      type="text"
                      value={formData.deviceSnImei}
                      onChange={(e) => setFormData({...formData, deviceSnImei: e.target.value})}
                      className={inputClass}
                      placeholder="3542..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Заявлена несправність</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.problemDescription}
                      onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                      className={inputClass}
                      placeholder="Не вмикається, розбитий екран..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Зовнішній стан (при прийомі)</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.deviceCondition}
                      onChange={(e) => setFormData({...formData, deviceCondition: e.target.value})}
                      className={inputClass}
                      placeholder="Подряпини на корпусі, вм'ятина..."
                    />
                  </div>
                </div>
              </div>

              {/* Services & Cost */}
              <div className="space-y-4 mt-6">
                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                  <Wrench className="w-4 h-4 text-blue-500" /> Послуги та Роботи
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-2 items-end mb-4">
                    <div className="flex-grow">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Назва послуги</label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        className={inputClass}
                        placeholder="Заміна дисплею..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ціна (клієнту)</label>
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                        className={inputClass}
                      />
                    </div>
                     <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Собівартість</label>
                      <input
                        type="number"
                        value={newService.cost}
                        onChange={(e) => setNewService({...newService, cost: parseFloat(e.target.value) || 0})}
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addService}
                      className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Services List */}
                  {formData.services && formData.services.length > 0 ? (
                    <div className="space-y-2">
                      {formData.services.map((service, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 shadow-sm">
                          <span className="text-sm font-medium text-gray-800">{service.name}</span>
                          <div className="flex items-center gap-4">
                             <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{service.price} ₴</div>
                                <div className="text-xs text-gray-400">Собівартість: {service.cost} ₴</div>
                             </div>
                             <button type="button" onClick={() => removeService(idx)} className="text-red-400 hover:text-red-600">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                        <span className="font-bold text-gray-700">Всього до оплати:</span>
                        <span className="text-xl font-bold text-blue-600">{calculateTotal()} ₴</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">Послуги ще не додані</p>
                  )}
                </div>
              </div>

              {/* Notes */}
               <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Внутрішні нотатки</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={inputClass}
                    placeholder="Пароль: 1234, Клієнт просив зберегти дані..."
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
            className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            form="add-repair-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Створення...' : 'Створити замовлення'}
          </button>
        </div>
      </div>
    </div>
  );
};
