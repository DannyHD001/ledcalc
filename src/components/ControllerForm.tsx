import React, { useState } from 'react';
import { Controller } from '../types/controller';

interface ControllerFormProps {
  controller: Controller | null;
  onSubmit: (controller: Controller) => void;
  onCancel: () => void;
}

type FormDataType = Omit<Controller, 'ports' | 'pixelsPerPort' | 'maxPixelsTotal'> & {
  ports: string | number;
  pixelsPerPort: string | number;
  maxPixelsTotal: string | number | undefined;
};

export function ControllerForm({ controller, onSubmit, onCancel }: ControllerFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    id: controller?.id || crypto.randomUUID(),
    name: controller?.name || '',
    manufacturer: controller?.manufacturer || '',
    ports: controller?.ports || 16,
    pixelsPerPort: controller?.pixelsPerPort || 65536,
    maxPixelsTotal: controller?.maxPixelsTotal || undefined,
    outputType: controller?.outputType || 'RJ45',
    description: controller?.description || ''
  });

  const safeParseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData: Controller = {
      ...formData,
      ports: safeParseNumber(formData.ports),
      pixelsPerPort: safeParseNumber(formData.pixelsPerPort),
      maxPixelsTotal: formData.maxPixelsTotal ? safeParseNumber(formData.maxPixelsTotal) : undefined
    };

    onSubmit(submissionData);
  };

  const handleChange = (field: keyof FormDataType, value: string | number | undefined) => {
    // For number inputs, preserve the string value during typing
    if (typeof value === 'string' && ['ports', 'pixelsPerPort', 'maxPixelsTotal'].includes(field)) {
      // Only allow valid number patterns
      if (!/^\d*\.?\d*$/.test(value) && value !== '') {
        return; // Don't update if invalid pattern
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {controller ? 'Edit Controller' : 'Add New Controller'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
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
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Ports
                <input
                  type="text"
                  value={formData.ports}
                  onChange={(e) => handleChange('ports', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pixels per Port
                <input
                  type="text"
                  value={formData.pixelsPerPort}
                  onChange={(e) => handleChange('pixelsPerPort', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Total Pixels (Optional)
                <input
                  type="text"
                  value={formData.maxPixelsTotal || ''}
                  onChange={(e) => handleChange('maxPixelsTotal', e.target.value === '' ? undefined : e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Leave empty if no limit"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Output Type
                <select
                  value={formData.outputType}
                  onChange={(e) => handleChange('outputType', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="RJ45">RJ45</option>
                  <option value="SFP">SFP</option>
                  <option value="Custom">Custom</option>
                  <option value="Fiber">Fiber</option>
                  <option value="USB">USB</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Optional description..."
              />
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {controller ? 'Update' : 'Add'} Controller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
