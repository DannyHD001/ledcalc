import { useState } from 'react';
import { Controller } from '../types/controller';
import { ControllerForm } from './ControllerForm';
import { useAuth } from '../hooks/useAuth';

interface ControllerSelectorProps {
  controllers: Controller[];
  selectedController: Controller | null;
  onControllerSelect: (controller: Controller | null) => void;
  onSaveController: (controller: Controller) => void;
  onDeleteController: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function ControllerSelector({
  controllers,
  selectedController,
  onControllerSelect,
  onSaveController,
  onDeleteController,
  loading,
  error
}: ControllerSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingController, setEditingController] = useState<Controller | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const filteredControllers = controllers.filter(controller =>
    controller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    controller.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingController(null);
    setShowForm(true);
  };

  const handleEdit = (controller: Controller) => {
    setEditingController(controller);
    setShowForm(true);
  };

  const handleFormSubmit = async (controller: Controller) => {
    try {
      await onSaveController(controller);
      setShowForm(false);
      setEditingController(null);
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingController(null);
  };

  const handleDelete = async (controller: Controller) => {
    if (window.confirm(`Are you sure you want to delete "${controller.name}"?`)) {
      try {
        await onDeleteController(controller.id);
        if (selectedController?.id === controller.id) {
          onControllerSelect(null);
        }
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading controllers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Select Controller</h2>
        {isAuthenticated && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Add New Controller
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search controllers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <select
          value={selectedController?.id || ''}
          onChange={(e) => {
            const controller = controllers.find(c => c.id === e.target.value);
            onControllerSelect(controller || null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a controller...</option>
          {filteredControllers.map((controller) => (
            <option key={controller.id} value={controller.id}>
              {controller.manufacturer} {controller.name} ({controller.ports} ports, {controller.pixelsPerPort} pixels/port)
            </option>
          ))}
        </select>
      </div>

      {selectedController && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900">
              {selectedController.manufacturer} {selectedController.name}
            </h3>
            {isAuthenticated && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(selectedController)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedController)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Ports:</span> {selectedController.ports}
            </div>
            <div>
              <span className="font-medium">Pixels per Port:</span> {selectedController.pixelsPerPort.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Output Type:</span> {selectedController.outputType}
            </div>
            {selectedController.maxPixelsTotal && (
              <div>
                <span className="font-medium">Max Total Pixels:</span> {selectedController.maxPixelsTotal.toLocaleString()}
              </div>
            )}
          </div>
          
          {selectedController.description && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Description:</span> {selectedController.description}
            </div>
          )}
        </div>
      )}

      {controllers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No controllers available. Add your first controller to get started.
        </div>
      )}

      {showForm && (
        <ControllerForm
          controller={editingController}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
