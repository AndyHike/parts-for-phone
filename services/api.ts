import { Part } from "../types";

// Базова URL адреса вашого бекенду. 
// У реальному проекті це часто береться з змінних середовища: process.env.REACT_APP_API_URL
// Змініть це в api.ts:
const API_URL = '/api';

class ApiService {
  async getParts(): Promise<Part[]> {
    const response = await fetch(`${API_URL}/parts`);
    if (!response.ok) throw new Error('Failed to fetch parts');
    return response.json();
  }

  async createPart(part: Part): Promise<Part> {
    const response = await fetch(`${API_URL}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!response.ok) throw new Error('Failed to create part');
    return response.json();
  }

  async updatePart(part: Part): Promise<Part> {
    const response = await fetch(`${API_URL}/parts/${part.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!response.ok) throw new Error('Failed to update part');
    return response.json();
  }

  async deletePart(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/parts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete part');
  }
}

export const api = new ApiService();
