import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Panel } from '../types/panel';
import { Controller } from '../types/controller';

export class FirestoreService {
  // Panel operations
  async getPanels(): Promise<Panel[]> {
    try {
      const panelsRef = collection(db, 'panels');
      const q = query(panelsRef, orderBy('manufacturer'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Panel));
    } catch (error) {
      console.error('Error fetching panels from Firestore:', error);
      throw error;
    }
  }

  async getPanelById(id: string): Promise<Panel | null> {
    try {
      const panelRef = doc(db, 'panels', id);
      const panelSnap = await getDoc(panelRef);
      
      if (panelSnap.exists()) {
        return {
          id: panelSnap.id,
          ...panelSnap.data()
        } as Panel;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching panel by ID:', error);
      throw error;
    }
  }

  async createPanel(panel: Omit<Panel, 'id'>): Promise<Panel> {
    try {
      const panelsRef = collection(db, 'panels');
      const docRef = await addDoc(panelsRef, panel);
      
      return {
        id: docRef.id,
        ...panel
      } as Panel;
    } catch (error) {
      console.error('Error creating panel:', error);
      throw error;
    }
  }

  async updatePanel(id: string, panel: Partial<Panel>): Promise<Panel> {
    try {
      const panelRef = doc(db, 'panels', id);
      await updateDoc(panelRef, panel);
      
      const updatedPanel = await this.getPanelById(id);
      if (!updatedPanel) {
        throw new Error('Panel not found after update');
      }
      
      return updatedPanel;
    } catch (error) {
      console.error('Error updating panel:', error);
      throw error;
    }
  }

  async deletePanel(id: string): Promise<void> {
    try {
      const panelRef = doc(db, 'panels', id);
      await deleteDoc(panelRef);
    } catch (error) {
      console.error('Error deleting panel:', error);
      throw error;
    }
  }

  async searchPanels(searchTerm: string): Promise<Panel[]> {
    try {
      const panels = await this.getPanels();
      
      if (!searchTerm.trim()) {
        return panels;
      }
      
      const term = searchTerm.toLowerCase();
      return panels.filter(panel => 
        panel.name.toLowerCase().includes(term) ||
        panel.manufacturer.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching panels:', error);
      throw error;
    }
  }

  // Controller operations
  async getControllers(): Promise<Controller[]> {
    try {
      const controllersRef = collection(db, 'controllers');
      const q = query(controllersRef, orderBy('manufacturer'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Controller));
    } catch (error) {
      console.error('Error fetching controllers from Firestore:', error);
      throw error;
    }
  }

  async getControllerById(id: string): Promise<Controller | null> {
    try {
      const controllerRef = doc(db, 'controllers', id);
      const controllerSnap = await getDoc(controllerRef);
      
      if (controllerSnap.exists()) {
        return {
          id: controllerSnap.id,
          ...controllerSnap.data()
        } as Controller;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching controller by ID:', error);
      throw error;
    }
  }

  async createController(controller: Omit<Controller, 'id'>): Promise<Controller> {
    try {
      const controllersRef = collection(db, 'controllers');
      const docRef = await addDoc(controllersRef, controller);
      
      return {
        id: docRef.id,
        ...controller
      } as Controller;
    } catch (error) {
      console.error('Error creating controller:', error);
      throw error;
    }
  }

  async updateController(id: string, controller: Partial<Controller>): Promise<Controller> {
    try {
      const controllerRef = doc(db, 'controllers', id);
      await updateDoc(controllerRef, controller);
      
      const updatedController = await this.getControllerById(id);
      if (!updatedController) {
        throw new Error('Controller not found after update');
      }
      
      return updatedController;
    } catch (error) {
      console.error('Error updating controller:', error);
      throw error;
    }
  }

  async deleteController(id: string): Promise<void> {
    try {
      const controllerRef = doc(db, 'controllers', id);
      await deleteDoc(controllerRef);
    } catch (error) {
      console.error('Error deleting controller:', error);
      throw error;
    }
  }

  async searchControllers(searchTerm: string): Promise<Controller[]> {
    try {
      const controllers = await this.getControllers();
      
      if (!searchTerm.trim()) {
        return controllers;
      }
      
      const term = searchTerm.toLowerCase();
      return controllers.filter(controller => 
        controller.name.toLowerCase().includes(term) ||
        controller.manufacturer.toLowerCase().includes(term) ||
        (controller.outputType && controller.outputType.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching controllers:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
