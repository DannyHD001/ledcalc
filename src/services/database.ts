import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { firestoreService } from './firestore';
import { isFirebaseAvailable } from './firebase';

// Database service using Firestore only
class DatabaseService {
  private checkFirestore(): void {
    if (!isFirebaseAvailable) {
      throw new Error('Firestore is not available. Please check your Firebase configuration.');
    }
  }

  // Panel operations
  async getPanels(): Promise<Panel[]> {
    this.checkFirestore();
    return firestoreService.getPanels();
  }

  async getPanelById(id: string): Promise<Panel | null> {
    this.checkFirestore();
    return firestoreService.getPanelById(id);
  }

  async createPanel(panel: Omit<Panel, 'id'>): Promise<Panel> {
    this.checkFirestore();
    return firestoreService.createPanel(panel);
  }

  async updatePanel(id: string, panel: Partial<Panel>): Promise<Panel> {
    this.checkFirestore();
    await firestoreService.updatePanel(id, panel);
    // Return the updated panel
    const updatedPanel = await firestoreService.getPanelById(id);
    if (!updatedPanel) {
      throw new Error('Panel not found after update');
    }
    return updatedPanel;
  }

  async deletePanel(id: string): Promise<void> {
    this.checkFirestore();
    return firestoreService.deletePanel(id);
  }

  async searchPanels(searchTerm: string): Promise<Panel[]> {
    this.checkFirestore();
    const panels = await firestoreService.getPanels();
    if (!searchTerm.trim()) return panels;
    
    const term = searchTerm.toLowerCase();
    return panels.filter(panel => 
      panel.name.toLowerCase().includes(term) ||
      panel.manufacturer.toLowerCase().includes(term)
    );
  }

  // Controller operations
  async getControllers(): Promise<Controller[]> {
    this.checkFirestore();
    return firestoreService.getControllers();
  }

  async getControllerById(id: string): Promise<Controller | null> {
    this.checkFirestore();
    return firestoreService.getControllerById(id);
  }

  async createController(controller: Omit<Controller, 'id'>): Promise<Controller> {
    this.checkFirestore();
    return firestoreService.createController(controller);
  }

  async updateController(id: string, controller: Partial<Controller>): Promise<Controller> {
    this.checkFirestore();
    await firestoreService.updateController(id, controller);
    // Return the updated controller
    const updatedController = await firestoreService.getControllerById(id);
    if (!updatedController) {
      throw new Error('Controller not found after update');
    }
    return updatedController;
  }

  async deleteController(id: string): Promise<void> {
    this.checkFirestore();
    return firestoreService.deleteController(id);
  }

  async searchControllers(searchTerm: string): Promise<Controller[]> {
    this.checkFirestore();
    const controllers = await firestoreService.getControllers();
    if (!searchTerm.trim()) return controllers;
    
    const term = searchTerm.toLowerCase();
    return controllers.filter(controller => 
      controller.name.toLowerCase().includes(term) ||
      controller.manufacturer.toLowerCase().includes(term) ||
      (controller.outputType && controller.outputType.toLowerCase().includes(term))
    );
  }

  // Check if using Firestore (always true now)
  isUsingFirestore(): boolean {
    return true;
  }
}

export const databaseService = new DatabaseService();
