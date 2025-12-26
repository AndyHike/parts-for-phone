
export enum PartCondition {
  NEW = 'NEW',
  USED_EXCELLENT = 'USED_EXCELLENT', // Б/У ідеал (знятий з нового)
  USED_GOOD = 'USED_GOOD', // Б/У робочий (потертості)
  USED_DAMAGED = 'USED_DAMAGED', // Б/У з дефектом (наприклад, тріщина на склі, але сенсор ок)
  FOR_PARTS = 'FOR_PARTS' // Донор (плата, шлейфи)
}

export enum Category {
  SCREEN = 'SCREEN',
  BATTERY = 'BATTERY',
  HOUSING = 'HOUSING',
  CAMERA = 'CAMERA',
  BOARD = 'BOARD',
  CABLE = 'CABLE',
  OTHER = 'OTHER'
}

export interface Part {
  id: string;
  name: string;
  description: string;
  category: Category;
  compatibility: string[]; // Моделі телефонів
  condition: PartCondition;
  priceBuy: number;
  priceSell: number;
  quantity: number;
  location: string; // Полиця/Коробка
  sourceInfo?: string; // Звідки взято (наприклад "IMEI 3543...")
  dateAdded: string;
}

export interface DashboardStats {
  totalItems: number;
  totalValueBuy: number;
  totalValueSell: number;
  lowStockCount: number;
}

// --- Repair Types ---

export enum RepairStatus {
  RECEIVED = 'RECEIVED',       // Прийнято
  DIAGNOSTICS = 'DIAGNOSTICS', // Діагностика
  IN_PROGRESS = 'IN_PROGRESS', // В роботі
  WAITING_PARTS = 'WAITING_PARTS', // Очікує запчастини
  READY = 'READY',             // Готово до видачі
  COMPLETED = 'COMPLETED',     // Видано/Оплачено
  CANCELLED = 'CANCELLED'      // Відмова
}

export interface RepairServiceItem {
  name: string;
  price: number;
  cost: number; // Собівартість (наприклад, зарплата майстра або ціна деталі)
}

export interface RepairOrder {
  id: string;
  // Client Info
  clientName: string;
  clientPhone: string;
  
  // Device Info
  deviceBrand: string;
  deviceModel: string;
  deviceSnImei: string; // Serial / IMEI
  deviceCondition: string; // Scratches, cracks visible on intake
  problemDescription: string; // Customer complaint
  
  // Repair Info
  status: RepairStatus;
  services: RepairServiceItem[];
  notes?: string; // Internal notes
  
  dateReceived: string;
  dateCompleted?: string;
  totalPrice: number;
}
