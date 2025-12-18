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
