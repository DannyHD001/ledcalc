import React, { useState } from 'react';
import { Panel } from '../types/panel';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { PanelForm } from './PanelForm';

interface PanelSelectorProps {
  panels: Panel[];
  selectedPanel: Panel | null;
  onPanelSelect: (panel: Panel) => void;
  onSavePanel: (panel: Panel) => Promise<boolean>;
  onDeletePanel: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function PanelSelector({
  panels,
  selectedPanel,
  onPanelSelect,
  onSavePanel,
  onDeletePanel,
  loading,
  error
}: PanelSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading panels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const handleSavePanel = async (panel: Panel) => {
    const success = await onSavePanel(panel);
    if (success) {
      setShowForm(false);
      setEditingPanel(null);
      onPanelSelect(panel);
    }
  };

  const handleDeletePanel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this panel?')) {
      const success = await onDeletePanel(id);
      if (success && selectedPanel?.id === id) {
        onPanelSelect(panels[0]);
      }
    }
  };

  if (showForm) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {editingPanel ? 'Edit Panel' : 'Add New Panel'}
        </h2>
        <PanelForm
          panel={editingPanel}
          onSubmit={handleSavePanel}
          onCancel={() => {
            setShowForm(false);
            setEditingPanel(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">LED Panel Selection</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Panel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel) => (
          <div
            key={panel.id}
            onClick={() => onPanelSelect(panel)}
            className={`p-4 rounded-lg border-2 cursor-pointer ${
              selectedPanel?.id === panel.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-900">{panel.manufacturer}" "{panel.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPanel(panel);
                    setShowForm(true);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeletePanel(panel.id, e)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Size</dt>
                <dd className="font-medium text-gray-900">
                  {panel.width}x{panel.height}mm
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Pixel Pitch</dt>
                <dd className="font-medium text-gray-900">{panel.pixelPitch}mm</dd>
              </div>
              <div>
                <dt className="text-gray-500">Weight</dt>
                <dd className="font-medium text-gray-900">{panel.weight}kg</dd>
              </div>
              <div>
                <dt className="text-gray-500">Power</dt>
                <dd className="font-medium text-gray-900">{panel.power}W</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
