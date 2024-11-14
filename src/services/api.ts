import { Panel } from '../types/panel';
import { getAllPanels, addPanel, deletePanel, checkConnection } from './db';

export const api = {
  async checkStatus(): Promise<boolean> {
    try {
      return await checkConnection();
    } catch (error) {
      console.error('Status check failed:', error);
      return false;
    }
  },

  async getPanels(): Promise<{ success: boolean; data?: Panel[]; error?: string }> {
    try {
      const panels = await getAllPanels();
      return {
        success: true,
        data: panels
      };
    } catch (error) {
      console.error('Failed to fetch panels:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch panels'
      };
    }
  },

  async savePanel(panel: Panel): Promise<{ success: boolean; data?: Panel; error?: string }> {
    try {
      if (!panel.id) {
        panel.id = crypto.randomUUID();
      }
      await addPanel(panel);
      return {
        success: true,
        data: panel
      };
    } catch (error) {
      console.error('Failed to save panel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save panel'
      };
    }
  },

  async deletePanel(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deletePanel(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete panel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete panel'
      };
    }
  }
};