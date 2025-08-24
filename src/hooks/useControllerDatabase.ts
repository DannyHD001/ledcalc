import { useState, useEffect } from 'react';
import { Controller } from '../types/controller';
import { databaseService } from '../services/database';

export function useControllerDatabase() {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadControllers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useControllerDatabase: Loading controllers from database...');
      const fetchedControllers = await databaseService.getControllers();
      console.log(`✅ useControllerDatabase: Loaded ${fetchedControllers.length} controllers`);
      setControllers(fetchedControllers);
    } catch (err) {
      console.error('❌ useControllerDatabase: Failed to load controllers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load controllers');
    } finally {
      setLoading(false);
    }
  };

  const saveController = async (controller: Controller) => {
    try {
      setError(null);
      const existingController = controllers.find(c => c.id === controller.id);
      
      if (existingController) {
        await databaseService.updateController(controller.id, controller);
      } else {
        await databaseService.createController(controller);
      }
      
      await loadControllers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save controller');
      throw err;
    }
  };

  const removeController = async (id: string) => {
    try {
      setError(null);
      await databaseService.deleteController(id);
      await loadControllers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete controller');
      throw err;
    }
  };

  useEffect(() => {
    loadControllers();
  }, []);

  return {
    controllers,
    loading,
    error,
    saveController,
    removeController,
    refreshControllers: loadControllers
  };
}
