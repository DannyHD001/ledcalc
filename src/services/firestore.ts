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
      await updateDoc(panelRef, panel);
      console.log('✅ Panel updated in Firestore:', id);
    } catch (error) {
      console.error('Error updating panel in Firestore:', error);
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
      await updateDoc(controllerRef, controller);
      console.log('✅ Controller updated in Firestore:', id);
    } catch (error) {
      console.error('Error updating controller in Firestore:', error);
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
