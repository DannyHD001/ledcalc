import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { firestoreService } from './firestore';

// Fallback storage service for offline mode
class LocalStorageService {
  private PANELS_KEY = 'ledcalc_panels';
  private CONTROLLERS_KEY = 'ledcalc_controllers';

  private getLocalPanels(): Panel[] {
    const panels = localStorage.getItem(this.PANELS_KEY);
    return panels ? JSON.parse(panels) : [];
  }

  private saveLocalPanels(panels: Panel[]): void {
    localStorage.setItem(this.PANELS_KEY, JSON.stringify(panels));
  }

  private getLocalControllers(): Controller[] {
    const controllers = localStorage.getItem(this.CONTROLLERS_KEY);
    return controllers ? JSON.parse(controllers) : [];
  }

  private saveLocalControllers(controllers: Controller[]): void {
    localStorage.setItem(this.CONTROLLERS_KEY, JSON.stringify(controllers));
  }

  // Panel methods
  async getPanels(): Promise<Panel[]> {
    return this.getLocalPanels();
  }

  async getPanelById(id: string): Promise<Panel | null> {
    const panels = this.getLocalPanels();
    return panels.find(panel => panel.id === id) || null;
  }

  async createPanel(panel: Omit<Panel, 'id'>): Promise<Panel> {
    const panels = this.getLocalPanels();
    const newPanel = { ...panel, id: Date.now().toString() };
    panels.push(newPanel);
    this.saveLocalPanels(panels);
    return newPanel;
  }

  async updatePanel(id: string, panelUpdate: Partial<Panel>): Promise<Panel> {
    const panels = this.getLocalPanels();
    const index = panels.findIndex(panel => panel.id === id);
    if (index === -1) throw new Error('Panel not found');
    
    panels[index] = { ...panels[index], ...panelUpdate };
    this.saveLocalPanels(panels);
    return panels[index];
  }

  async deletePanel(id: string): Promise<void> {
    const panels = this.getLocalPanels();
    const filtered = panels.filter(panel => panel.id !== id);
    this.saveLocalPanels(filtered);
  }

  async searchPanels(searchTerm: string): Promise<Panel[]> {
    const panels = this.getLocalPanels();
    if (!searchTerm.trim()) return panels;
    
    const term = searchTerm.toLowerCase();
    return panels.filter(panel => 
      panel.name.toLowerCase().includes(term) ||
      panel.manufacturer.toLowerCase().includes(term)
    );
  }

  // Controller methods
  async getControllers(): Promise<Controller[]> {
    return this.getLocalControllers();
  }

  async getControllerById(id: string): Promise<Controller | null> {
    const controllers = this.getLocalControllers();
    return controllers.find(controller => controller.id === id) || null;
  }

  async createController(controller: Omit<Controller, 'id'>): Promise<Controller> {
    const controllers = this.getLocalControllers();
    const newController = { ...controller, id: Date.now().toString() };
    controllers.push(newController);
    this.saveLocalControllers(controllers);
    return newController;
  }

  async updateController(id: string, controllerUpdate: Partial<Controller>): Promise<Controller> {
    const controllers = this.getLocalControllers();
    const index = controllers.findIndex(controller => controller.id === id);
    if (index === -1) throw new Error('Controller not found');
    
    controllers[index] = { ...controllers[index], ...controllerUpdate };
    this.saveLocalControllers(controllers);
    return controllers[index];
  }

  async deleteController(id: string): Promise<void> {
    const controllers = this.getLocalControllers();
    const filtered = controllers.filter(controller => controller.id !== id);
    this.saveLocalControllers(filtered);
  }

  async searchControllers(searchTerm: string): Promise<Controller[]> {
    const controllers = this.getLocalControllers();
    if (!searchTerm.trim()) return controllers;
    
    const term = searchTerm.toLowerCase();
    return controllers.filter(controller => 
      controller.name.toLowerCase().includes(term) ||
      controller.manufacturer.toLowerCase().includes(term) ||
      (controller.outputType && controller.outputType.toLowerCase().includes(term))
    );
  }
}

// Database service with Firestore primary and localStorage fallback
class DatabaseService {
  private localStorageService = new LocalStorageService();
  private useFirestore = true;

  private async withFallback<T>(
    firestoreOperation: () => Promise<T>,
    localStorageOperation: () => Promise<T>
  ): Promise<T> {
    if (!this.useFirestore) {
      return localStorageOperation();
    }

    try {
      return await firestoreOperation();
    } catch (error) {
      console.warn('Firestore operation failed, falling back to localStorage:', error);
      this.useFirestore = false;
      return localStorageOperation();
    }
  }

  // Panel operations
  async getPanels(): Promise<Panel[]> {
    return this.withFallback(
      () => firestoreService.getPanels(),
      () => this.localStorageService.getPanels()
    );
  }

  async getPanelById(id: string): Promise<Panel | null> {
    return this.withFallback(
      () => firestoreService.getPanelById(id),
      () => this.localStorageService.getPanelById(id)
    );
  }

  async createPanel(panel: Omit<Panel, 'id'>): Promise<Panel> {
    return this.withFallback(
      () => firestoreService.createPanel(panel),
      () => this.localStorageService.createPanel(panel)
    );
  }

  async updatePanel(id: string, panel: Partial<Panel>): Promise<Panel> {
    return this.withFallback(
      () => firestoreService.updatePanel(id, panel),
      () => this.localStorageService.updatePanel(id, panel)
    );
  }

  async deletePanel(id: string): Promise<void> {
    return this.withFallback(
      () => firestoreService.deletePanel(id),
      () => this.localStorageService.deletePanel(id)
    );
  }

  async searchPanels(searchTerm: string): Promise<Panel[]> {
    return this.withFallback(
      () => firestoreService.searchPanels(searchTerm),
      () => this.localStorageService.searchPanels(searchTerm)
    );
  }

  // Controller operations
  async getControllers(): Promise<Controller[]> {
    return this.withFallback(
      () => firestoreService.getControllers(),
      () => this.localStorageService.getControllers()
    );
  }

  async getControllerById(id: string): Promise<Controller | null> {
    return this.withFallback(
      () => firestoreService.getControllerById(id),
      () => this.localStorageService.getControllerById(id)
    );
  }

  async createController(controller: Omit<Controller, 'id'>): Promise<Controller> {
    return this.withFallback(
      () => firestoreService.createController(controller),
      () => this.localStorageService.createController(controller)
    );
  }

  async updateController(id: string, controller: Partial<Controller>): Promise<Controller> {
    return this.withFallback(
      () => firestoreService.updateController(id, controller),
      () => this.localStorageService.updateController(id, controller)
    );
  }

  async deleteController(id: string): Promise<void> {
    return this.withFallback(
      () => firestoreService.deleteController(id),
      () => this.localStorageService.deleteController(id)
    );
  }

  async searchControllers(searchTerm: string): Promise<Controller[]> {
    return this.withFallback(
      () => firestoreService.searchControllers(searchTerm),
      () => this.localStorageService.searchControllers(searchTerm)
    );
  }

  // Check if using Firestore
  isUsingFirestore(): boolean {
    return this.useFirestore;
  }

  // Force enable Firestore (for retry scenarios)
  enableFirestore(): void {
    this.useFirestore = true;
  }
}

export const databaseService = new DatabaseService();
