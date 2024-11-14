import { Panel } from '../types/panel';
import { DEFAULT_PANELS } from '../data/defaultPanels';

const STORAGE_KEY = 'led-panels';

export async function checkConnection(): Promise<boolean> {
  try {
    localStorage.getItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function getAllPanels(): Promise<Panel[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with default panels
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PANELS));
      return DEFAULT_PANELS;
    }
    const panels = JSON.parse(stored);
    return Array.isArray(panels) ? panels : DEFAULT_PANELS;
  } catch (error) {
    console.error('Failed to get panels:', error);
    return DEFAULT_PANELS;
  }
}

export async function addPanel(panel: Panel): Promise<void> {
  try {
    const panels = await getAllPanels();
    const index = panels.findIndex(p => p.id === panel.id);
    
    if (index >= 0) {
      panels[index] = panel;
    } else {
      panel.id = panel.id || crypto.randomUUID();
      panels.push(panel);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
  } catch (error) {
    console.error('Failed to add panel:', error);
    throw error;
  }
}

export async function deletePanel(id: string): Promise<void> {
  try {
    const panels = await getAllPanels();
    const filtered = panels.filter(p => p.id !== id);
    if (filtered.length === 0) {
      // If all panels were deleted, restore defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PANELS));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to delete panel:', error);
    throw error;
  }
}