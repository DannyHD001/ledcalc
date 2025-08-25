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
import { db, isFirebaseAvailable } from './firebase';
import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { PanelRequest, ControllerRequest } from '../types/request';
import { DuplicateNameError } from '../types/errors';

export class FirestoreService {
  private checkAvailability(): void {
    if (!isFirebaseAvailable || !db) {
      throw new Error('Firestore not available');
    }
  }

  // Utility function to fix ID field mismatches
  async fixIdMismatches(): Promise<{ panelsFixed: number; controllersFixed: number }> {
    this.checkAvailability();
    try {
      let panelsFixed = 0;
      let controllersFixed = 0;

      // Fix panels
      const panelsRef = collection(db!, 'panels');
      const panelsSnapshot = await getDocs(panelsRef);
      
      for (const docSnapshot of panelsSnapshot.docs) {
        const panelData = docSnapshot.data();
        if (panelData.id && panelData.id !== docSnapshot.id) {
          console.log(`Fixing ID mismatch for panel: ${panelData.name} (document: ${docSnapshot.id}, data: ${panelData.id})`);
          const { id: _, ...cleanData } = panelData;
          const docRef = doc(db!, 'panels', docSnapshot.id);
          await updateDoc(docRef, cleanData);
          panelsFixed++;
        }
      }

      // Fix controllers
      const controllersRef = collection(db!, 'controllers');
      const controllersSnapshot = await getDocs(controllersRef);
      
      for (const docSnapshot of controllersSnapshot.docs) {
        const controllerData = docSnapshot.data();
        if (controllerData.id && controllerData.id !== docSnapshot.id) {
          console.log(`Fixing ID mismatch for controller: ${controllerData.name} (document: ${docSnapshot.id}, data: ${controllerData.id})`);
          const { id: _, ...cleanData } = controllerData;
          const docRef = doc(db!, 'controllers', docSnapshot.id);
          await updateDoc(docRef, cleanData);
          controllersFixed++;
        }
      }

      console.log(`✅ ID fix completed: ${panelsFixed} panels and ${controllersFixed} controllers fixed`);
      return { panelsFixed, controllersFixed };
    } catch (error) {
      console.error('Error during ID fix:', error);
      throw error;
    }
  }

  // Utility function to clean up duplicate documents and ensure ID consistency
  async cleanupDuplicates(): Promise<{ panelsDeleted: number; controllersDeleted: number }> {
    this.checkAvailability();
    try {
      let panelsDeleted = 0;
      let controllersDeleted = 0;

      // Clean up panels
      const panelsRef = collection(db!, 'panels');
      const panelsSnapshot = await getDocs(panelsRef);
      const panelsByName = new Map<string, any[]>();

      // Group panels by name+manufacturer combination and clean up id fields
      for (const docSnapshot of panelsSnapshot.docs) {
        const panelData = docSnapshot.data();
        const key = `${panelData.name}-${panelData.manufacturer}`.toLowerCase();
        
        // Remove id field from document data if it exists and doesn't match document ID
        if (panelData.id && panelData.id !== docSnapshot.id) {
          console.log(`Removing mismatched id field from panel: ${panelData.name}`);
          const { id: _, ...cleanData } = panelData;
          const docRef = doc(db!, 'panels', docSnapshot.id);
          await updateDoc(docRef, cleanData);
        }
        
        if (!panelsByName.has(key)) {
          panelsByName.set(key, []);
        }
        panelsByName.get(key)!.push({ id: docSnapshot.id, data: panelData });
      }

      // Remove duplicates (keep the first one, delete the rest)
      for (const [key, panels] of panelsByName) {
        if (panels.length > 1) {
          console.log(`Found ${panels.length} duplicate panels for: ${key}`);
          // Keep the first one, delete the rest
          for (let i = 1; i < panels.length; i++) {
            await deleteDoc(doc(db!, 'panels', panels[i].id));
            panelsDeleted++;
          }
        }
      }

      // Clean up controllers
      const controllersRef = collection(db!, 'controllers');
      const controllersSnapshot = await getDocs(controllersRef);
      const controllersByName = new Map<string, any[]>();

      // Group controllers by name+manufacturer combination and clean up id fields
      for (const docSnapshot of controllersSnapshot.docs) {
        const controllerData = docSnapshot.data();
        const key = `${controllerData.name}-${controllerData.manufacturer}`.toLowerCase();
        
        // Remove id field from document data if it exists and doesn't match document ID
        if (controllerData.id && controllerData.id !== docSnapshot.id) {
          console.log(`Removing mismatched id field from controller: ${controllerData.name}`);
          const { id: _, ...cleanData } = controllerData;
          const docRef = doc(db!, 'controllers', docSnapshot.id);
          await updateDoc(docRef, cleanData);
        }
        
        if (!controllersByName.has(key)) {
          controllersByName.set(key, []);
        }
        controllersByName.get(key)!.push({ id: docSnapshot.id, data: controllerData });
      }

      // Remove duplicates
      for (const [key, controllers] of controllersByName) {
        if (controllers.length > 1) {
          console.log(`Found ${controllers.length} duplicate controllers for: ${key}`);
          // Keep the first one, delete the rest
          for (let i = 1; i < controllers.length; i++) {
            await deleteDoc(doc(db!, 'controllers', controllers[i].id));
            controllersDeleted++;
          }
        }
      }

      console.log(`✅ Cleanup completed: ${panelsDeleted} duplicate panels and ${controllersDeleted} duplicate controllers removed`);
      return { panelsDeleted, controllersDeleted };
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  // Panel operations
  async getPanels(): Promise<Panel[]> {
    this.checkAvailability();
    try {
      const panelsRef = collection(db!, 'panels');
      const q = query(panelsRef, orderBy('manufacturer'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const panels = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Panel));
      
      console.log('📋 Panels fetched from Firestore:', panels.map(p => ({ name: p.name, id: p.id })));
      
      return panels;
    } catch (error) {
      console.error('Error fetching panels from Firestore:', error);
      throw error;
    }
  }

  async getPanelById(id: string): Promise<Panel | null> {
    this.checkAvailability();
    try {
      const panelRef = doc(db!, 'panels', id);
      const docSnap = await getDoc(panelRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Panel;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching panel from Firestore:', error);
      throw error;
    }
  }

  async savePanel(panel: Omit<Panel, 'id'>): Promise<string> {
    this.checkAvailability();
    try {
      const panelsRef = collection(db!, 'panels');
      const docRef = await addDoc(panelsRef, panel);
      console.log('✅ Panel saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving panel to Firestore:', error);
      throw error;
    }
  }

  async createPanel(panel: Omit<Panel, 'id'>): Promise<Panel> {
    this.checkAvailability();
    try {
      // Check for duplicate panel name
      const panelsRef = collection(db!, 'panels');
      const existingPanels = await getDocs(panelsRef);
      const duplicateName = existingPanels.docs.find(doc => 
        doc.data().name.toLowerCase() === panel.name.toLowerCase()
      );
      
      if (duplicateName) {
        throw new DuplicateNameError('Panel', panel.name);
      }

      const docRef = await addDoc(panelsRef, panel);
      console.log('✅ Panel created in Firestore with ID:', docRef.id);
      return {
        id: docRef.id,
        ...panel
      };
    } catch (error) {
      console.error('Error creating panel in Firestore:', error);
      throw error;
    }
  }

  async updatePanel(id: string, panel: Partial<Panel>): Promise<void> {
    this.checkAvailability();
    try {
      const panelRef = doc(db!, 'panels', id);
      
      // Remove the id field from the data - document ID is the source of truth
      const { id: _, ...panelData } = panel;
      
      // For updates, the document should exist - just update it
      await updateDoc(panelRef, panelData);
      console.log('✅ Panel updated in Firestore:', id);
    } catch (error: any) {
      console.error('Error updating panel in Firestore:', error);
      if (error.code === 'not-found') {
        throw new Error(`Panel with ID ${id} not found for update`);
      }
      throw error;
    }
  }

  async deletePanel(id: string): Promise<void> {
    this.checkAvailability();
    try {
      const panelRef = doc(db!, 'panels', id);
      await deleteDoc(panelRef);
      console.log('✅ Panel deleted from Firestore:', id);
    } catch (error) {
      console.error('Error deleting panel from Firestore:', error);
      throw error;
    }
  }

  async searchPanels(searchTerm: string): Promise<Panel[]> {
    const panels = await this.getPanels();
    if (!searchTerm.trim()) return panels;
    
    const term = searchTerm.toLowerCase();
    return panels.filter(panel => 
      panel.name.toLowerCase().includes(term) ||
      panel.manufacturer.toLowerCase().includes(term)
    );
  }

  // Controller operations
  async getControllers(): Promise<Controller[]> {
    this.checkAvailability();
    try {
      const controllersRef = collection(db!, 'controllers');
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
    this.checkAvailability();
    try {
      const controllerRef = doc(db!, 'controllers', id);
      const docSnap = await getDoc(controllerRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Controller;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching controller from Firestore:', error);
      throw error;
    }
  }

  async saveController(controller: Omit<Controller, 'id'>): Promise<string> {
    this.checkAvailability();
    try {
      const controllersRef = collection(db!, 'controllers');
      const docRef = await addDoc(controllersRef, controller);
      console.log('✅ Controller saved to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving controller to Firestore:', error);
      throw error;
    }
  }

  async createController(controller: Omit<Controller, 'id'>): Promise<Controller> {
    this.checkAvailability();
    try {
      // Check for duplicate controller name
      const controllersRef = collection(db!, 'controllers');
      const existingControllers = await getDocs(controllersRef);
      const duplicateName = existingControllers.docs.find(doc => 
        doc.data().name.toLowerCase() === controller.name.toLowerCase()
      );
      
      if (duplicateName) {
        throw new DuplicateNameError('Controller', controller.name);
      }

      const docRef = await addDoc(controllersRef, controller);
      console.log('✅ Controller created in Firestore with ID:', docRef.id);
      return {
        id: docRef.id,
        ...controller
      };
    } catch (error) {
      console.error('Error creating controller in Firestore:', error);
      throw error;
    }
  }

  async updateController(id: string, controller: Partial<Controller>): Promise<void> {
    this.checkAvailability();
    try {
      const controllerRef = doc(db!, 'controllers', id);
      
      // Remove the id field from the data - document ID is the source of truth
      const { id: _, ...controllerData } = controller;
      
      // For updates, the document should exist - just update it
      await updateDoc(controllerRef, controllerData);
      console.log('✅ Controller updated in Firestore:', id);
    } catch (error: any) {
      console.error('Error updating controller in Firestore:', error);
      if (error.code === 'not-found') {
        throw new Error(`Controller with ID ${id} not found for update`);
      }
      throw error;
    }
  }

  async deleteController(id: string): Promise<void> {
    this.checkAvailability();
    try {
      const controllerRef = doc(db!, 'controllers', id);
      await deleteDoc(controllerRef);
      console.log('✅ Controller deleted from Firestore:', id);
    } catch (error) {
      console.error('Error deleting controller from Firestore:', error);
      throw error;
    }
  }

  async searchControllers(searchTerm: string): Promise<Controller[]> {
    const controllers = await this.getControllers();
    if (!searchTerm.trim()) return controllers;
    
    const term = searchTerm.toLowerCase();
    return controllers.filter(controller => 
      controller.name.toLowerCase().includes(term) ||
      controller.manufacturer.toLowerCase().includes(term) ||
      (controller.outputType && controller.outputType.toLowerCase().includes(term))
    );
  }

  // Panel Request Methods
  async createPanelRequest(panelRequest: Omit<PanelRequest, 'id'>): Promise<PanelRequest> {
    this.checkAvailability();
    try {
      const requestsRef = collection(db!, 'panelRequests');
      const docRef = await addDoc(requestsRef, {
        ...panelRequest,
        requestedAt: new Date(),
        status: 'pending'
      });
      console.log('✅ Panel request created in Firestore with ID:', docRef.id);
      return {
        id: docRef.id,
        ...panelRequest,
        requestedAt: new Date(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Error creating panel request in Firestore:', error);
      throw error;
    }
  }

  async getPanelRequests(): Promise<PanelRequest[]> {
    this.checkAvailability();
    try {
      const requestsRef = collection(db!, 'panelRequests');
      const q = query(requestsRef, orderBy('requestedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      })) as PanelRequest[];
      console.log('✅ Panel requests fetched from Firestore:', requests.length);
      return requests;
    } catch (error) {
      console.error('Error fetching panel requests from Firestore:', error);
      throw error;
    }
  }

  async updatePanelRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    adminNotes?: string,
    reviewedBy?: string
  ): Promise<void> {
    this.checkAvailability();
    try {
      const requestRef = doc(db!, 'panelRequests', id);
      await updateDoc(requestRef, {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: reviewedBy || '',
        reviewedAt: new Date()
      });
      console.log('✅ Panel request status updated in Firestore:', id, status);
    } catch (error) {
      console.error('Error updating panel request status in Firestore:', error);
      throw error;
    }
  }

  // Controller Request Methods
  async createControllerRequest(controllerRequest: Omit<ControllerRequest, 'id'>): Promise<ControllerRequest> {
    this.checkAvailability();
    try {
      const requestsRef = collection(db!, 'controllerRequests');
      const docRef = await addDoc(requestsRef, {
        ...controllerRequest,
        requestedAt: new Date(),
        status: 'pending'
      });
      console.log('✅ Controller request created in Firestore with ID:', docRef.id);
      return {
        id: docRef.id,
        ...controllerRequest,
        requestedAt: new Date(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Error creating controller request in Firestore:', error);
      throw error;
    }
  }

  async getControllerRequests(): Promise<ControllerRequest[]> {
    this.checkAvailability();
    try {
      const requestsRef = collection(db!, 'controllerRequests');
      const q = query(requestsRef, orderBy('requestedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      })) as ControllerRequest[];
      console.log('✅ Controller requests fetched from Firestore:', requests.length);
      return requests;
    } catch (error) {
      console.error('Error fetching controller requests from Firestore:', error);
      throw error;
    }
  }

  async updateControllerRequestStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    adminNotes?: string,
    reviewedBy?: string
  ): Promise<void> {
    this.checkAvailability();
    try {
      const requestRef = doc(db!, 'controllerRequests', id);
      await updateDoc(requestRef, {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: reviewedBy || '',
        reviewedAt: new Date()
      });
      console.log('✅ Controller request status updated in Firestore:', id, status);
    } catch (error) {
      console.error('Error updating controller request status in Firestore:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
