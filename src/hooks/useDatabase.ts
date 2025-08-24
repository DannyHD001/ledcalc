import { useState, useEffect } from 'react';
import { Panel } from '../types/panel';
import { databaseService } from '../services/database';

export function useDatabase() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  const checkApiStatus = async () => {
    try {
      // Try to get panels to test Firestore connection
      await databaseService.getPanels();
      setApiStatus(databaseService.isUsingFirestore() ? 'connected' : 'disconnected');
    } catch {
      setApiStatus('error');
    }
  };

  const loadPanels = async () => {
    try {
      setLoading(true);
      console.log('🔄 useDatabase: Loading panels from database...');
      const loadedPanels = await databaseService.getPanels();
      console.log(`✅ useDatabase: Loaded ${loadedPanels.length} panels`);
      setPanels(loadedPanels);
      setError(null);
    } catch (err) {
      console.error('❌ useDatabase: Failed to load panels:', err);
      setError(err instanceof Error ? err.message : 'Failed to load panels');
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const savePanel = async (panel: Panel): Promise<boolean> => {
    try {
      setLoading(true);
      const existingPanel = panels.find(p => p.id === panel.id);
      
      if (existingPanel) {
        await databaseService.updatePanel(panel.id, panel);
      } else {
        await databaseService.createPanel(panel);
      }
      
      await loadPanels();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save panel');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removePanel = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await databaseService.deletePanel(id);
      await loadPanels();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete panel');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
    loadPanels();

    const statusInterval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  return {
    panels,
    loading,
    error,
    apiStatus,
    savePanel,
    removePanel,
    refreshPanels: loadPanels,
  };
}