import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { defaultControllers } from '../data/defaultControllers';

const API_BASE_URL = 'http://localhost:3001/api';
const PANELS_STORAGE_KEY = 'ledcalc_panels';
const CONTROLLERS_STORAGE_KEY = 'ledcalc_controllers';

// Fallback to localStorage when API is not available
let useLocalStorage = false;

// API helper function with fallback to localStorage
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (useLocalStorage) {
    return handleLocalStorageRequest<T>(endpoint, options);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('API request failed, falling back to localStorage:', error);
    useLocalStorage = true;
    return handleLocalStorageRequest<T>(endpoint, options);
  }
}

// Handle localStorage operations
function handleLocalStorageRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : null;

      if (endpoint.includes('/panels')) {
        const panels = getLocalStoragePanels();
        
        switch (method) {
          case 'GET':
            resolve(panels as T);
            break;
          case 'POST':
            if (body) {
              panels.push(body);
              localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(panels));
              resolve({ success: true } as T);
            }
            break;
          case 'PUT':
            if (body) {
              const index = panels.findIndex(p => p.id === body.id);
              if (index >= 0) {
                panels[index] = body;
                localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(panels));
              }
              resolve({ success: true } as T);
            }
            break;
          case 'DELETE':
            const id = endpoint.split('/').pop();
            const filteredPanels = panels.filter(p => p.id !== id);
            localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(filteredPanels));
            resolve({ success: true } as T);
            break;
        }
      } else if (endpoint.includes('/controllers')) {
        const controllers = getLocalStorageControllers();
        
        switch (method) {
          case 'GET':
            resolve(controllers as T);
            break;
          case 'POST':
            if (body) {
              controllers.push(body);
              localStorage.setItem(CONTROLLERS_STORAGE_KEY, JSON.stringify(controllers));
              resolve({ success: true } as T);
            }
            break;
          case 'PUT':
            if (body) {
              const index = controllers.findIndex(c => c.id === body.id);
              if (index >= 0) {
                controllers[index] = body;
                localStorage.setItem(CONTROLLERS_STORAGE_KEY, JSON.stringify(controllers));
              }
              resolve({ success: true } as T);
            }
            break;
          case 'DELETE':
            const id = endpoint.split('/').pop();
            const filteredControllers = controllers.filter(c => c.id !== id);
            localStorage.setItem(CONTROLLERS_STORAGE_KEY, JSON.stringify(filteredControllers));
            resolve({ success: true } as T);
            break;
        }
      } else if (endpoint === '/health') {
        resolve({ status: 'OK (localStorage)', timestamp: new Date().toISOString() } as T);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getLocalStoragePanels(): Panel[] {
  try {
    const stored = localStorage.getItem(PANELS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getLocalStorageControllers(): Controller[] {
  try {
    const stored = localStorage.getItem(CONTROLLERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with default controllers if not present
      localStorage.setItem(CONTROLLERS_STORAGE_KEY, JSON.stringify(defaultControllers));
      return defaultControllers;
    }
  } catch {
    return defaultControllers;
  }
}

// Panel functions
export async function getAllPanels(): Promise<Panel[]> {
  try {
    return await apiRequest<Panel[]>('/panels');
  } catch (error) {
    console.error('Failed to fetch panels:', error);
    throw error;
  }
}

export async function addPanel(panel: Panel): Promise<void> {
  try {
    await apiRequest('/panels', {
      method: 'POST',
      body: JSON.stringify(panel),
    });
  } catch (error) {
    console.error('Failed to add panel:', error);
    throw error;
  }
}

export async function updatePanel(panel: Panel): Promise<void> {
  try {
    await apiRequest(`/panels/${panel.id}`, {
      method: 'PUT',
      body: JSON.stringify(panel),
    });
  } catch (error) {
    console.error('Failed to update panel:', error);
    throw error;
  }
}

export async function deletePanel(id: string): Promise<void> {
  try {
    await apiRequest(`/panels/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete panel:', error);
    throw error;
  }
}

// Controller functions
export async function getAllControllers(): Promise<Controller[]> {
  try {
    return await apiRequest<Controller[]>('/controllers');
  } catch (error) {
    console.error('Failed to fetch controllers:', error);
    throw error;
  }
}

export async function addController(controller: Controller): Promise<void> {
  try {
    await apiRequest('/controllers', {
      method: 'POST',
      body: JSON.stringify(controller),
    });
  } catch (error) {
    console.error('Failed to add controller:', error);
    throw error;
  }
}

export async function updateController(controller: Controller): Promise<void> {
  try {
    await apiRequest(`/controllers/${controller.id}`, {
      method: 'PUT',
      body: JSON.stringify(controller),
    });
  } catch (error) {
    console.error('Failed to update controller:', error);
    throw error;
  }
}

export async function deleteController(id: string): Promise<void> {
  try {
    await apiRequest(`/controllers/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete controller:', error);
    throw error;
  }
}

// Health check function
export async function checkApiHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    return await apiRequest('/health');
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
}