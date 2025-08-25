import { useState, useEffect } from 'react';
import { Controller } from '../types/controller';
import { databaseService } from '../services/database';
import { DuplicateNameError, ValidationError } from '../types/errors';

export function useControllerDatabase() {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  const clearError = () => {
    setError(null);
    setShowErrorModal(false);
  };

  const saveController = async (controller: Controller): Promise<boolean> => {
    try {
      setError(null);
      const existingController = controllers.find(c => c.id === controller.id);
      
      if (existingController) {
        // For updates, remove the id field from the data before sending to Firestore
        const { id: _, ...controllerData } = controller;
        await databaseService.updateController(controller.id, controllerData);
      } else {
        // For creates, remove the id field from the data before sending to Firestore
        const { id: _, ...controllerData } = controller;
        await databaseService.createController(controllerData);
      }
      
      await loadControllers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save controller';
      setError(errorMessage);
      
      if (err instanceof ValidationError || err instanceof DuplicateNameError) {
        setShowErrorModal(true);
      }
      
      return false;
    }
  };

  const removeController = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await databaseService.deleteController(id);
      await loadControllers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete controller';
      setError(errorMessage);
      setShowErrorModal(true);
      return false;
    }
  };

  useEffect(() => {
    loadControllers();
  }, []);

  return {
    controllers,
    loading,
    error,
    showErrorModal,
    clearError,
    saveController,
    removeController,
    refreshControllers: loadControllers
  };
}
