import { useState, useEffect } from 'react';
import { Panel } from '../types/panel';
import { getAllPanels, addPanel, deletePanel, checkConnection } from '../services/db';

export function useDatabase() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  const checkApiStatus = async () => {
    try {
      const isConnected = await checkConnection();
      setApiStatus(isConnected ? 'connected' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const loadPanels = async () => {
    try {
      setLoading(true);
      const loadedPanels = await getAllPanels();
      setPanels(loadedPanels);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load panels');
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const savePanel = async (panel: Panel): Promise<boolean> => {
    try {
      setLoading(true);
      await addPanel(panel);
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
      await deletePanel(id);
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