import React, { useState } from 'react';
import { Panel } from '../types/panel';

interface PanelFormProps {
  panel: Panel | null;
  onSubmit: (panel: Panel) => void;
  onCancel: () => void;
}

export function PanelForm({ panel, onSubmit, onCancel }: PanelFormProps) {
  const [formData, setFormData] = useState<Panel>({
    id: panel?.id || crypto.randomUUID(),
    name: panel?.name || '',
    manufacturer: panel?.manufacturer || '',
    width: panel?.width || 500,
    height: panel?.height || 500,
    pixelPitch: panel?.pixelPitch || 2.6,
    weight: panel?.weight || 6.5,
    power: panel?.power || 150,
    headerConfig: panel?.headerConfig || {
      single: {
        weight: 0.8,
        points: 1
      },
      double: {
        weight: 1.2,
        points: 2
      },
      attachmentType: 'shackle'
    },
    portConfig: panel?.portConfig || {
      pixelsPerPort: 65536,
      maxPorts: 16
    },
    controllerOutputCapacity: panel?.controllerOutputCapacity || 655360,
    flightCaseCapacity: panel?.flightCaseCapacity || 8
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleHeaderConfigChange = (
    type: 'single' | 'double',
    field: 'weight' | 'points',
    value: number
  ) => {
    setFormData(prev => ({
      ...prev,
      headerConfig: {
        ...prev.headerConfig,
        [type]: {
          ...prev.headerConfig[type],
          [field]: value
        }
      }
    }));
  };

  const handlePortConfigChange = (field: keyof Panel['portConfig'], value: number) => {
    setFormData(prev => ({
      ...prev,
      portConfig: {
        ...prev.portConfig,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Panel Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manufacturer
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Width (mm)
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="1"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Height (mm)
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="1"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pixel Pitch (mm)
            <input
              type="number"
              name="pixelPitch"
              value={formData.pixelPitch}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="0.1"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (kg)
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="0.1"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Power (W)
            <input
              type="number"
              name="power"
              value={formData.power}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="1"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Flight Case Capacity
            <input
              type="number"
              name="flightCaseCapacity"
              value={formData.flightCaseCapacity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="0"
              step="1"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Port Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pixels Per Port
              <input
                type="number"
                value={formData.portConfig.pixelsPerPort}
                onChange={(e) => handlePortConfigChange('pixelsPerPort', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="1"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Ports Per Controller
              <input
                type="number"
                value={formData.portConfig.maxPorts}
                onChange={(e) => handlePortConfigChange('maxPorts', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="1"
                step="1"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Header Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Single Header</h4>
            <div>
              <label className="block text-sm text-gray-500">
                Weight (kg)
                <input
                  type="number"
                  value={formData.headerConfig.single.weight}
                  onChange={(e) => handleHeaderConfigChange('single', 'weight', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-500">
                Points
                <input
                  type="number"
                  value={formData.headerConfig.single.points}
                  onChange={(e) => handleHeaderConfigChange('single', 'points', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  max="4"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Double Header</h4>
            <div>
              <label className="block text-sm text-gray-500">
                Weight (kg)
                <input
                  type="number"
                  value={formData.headerConfig.double.weight}
                  onChange={(e) => handleHeaderConfigChange('double', 'weight', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-500">
                Points
                <input
                  type="number"
                  value={formData.headerConfig.double.points}
                  onChange={(e) => handleHeaderConfigChange('double', 'points', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="2"
                  max="4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {panel ? 'Update Panel' : 'Add Panel'}
        </button>
      </div>
    </form>
  );
}