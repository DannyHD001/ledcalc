import { Panel } from '../types/panel';

const STORAGE_KEY = 'led-panels';

export function getPanels(): Panel[] {
  try {
    const panels = localStorage.getItem(STORAGE_KEY);
    return panels ? JSON.parse(panels) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function savePanel(panel: Panel): void {
  try {
    const panels = getPanels();
    const existingIndex = panels.findIndex(p => p.id === panel.id);
    
    if (existingIndex >= 0) {
      panels[existingIndex] = panel;
    } else {
      panels.push(panel);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save panel');
  }
}

export function deletePanel(id: string): void {
  try {
    const panels = getPanels();
    const filteredPanels = panels.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPanels));
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    throw new Error('Failed to delete panel');
  }
}