import React, { useState, useEffect } from 'react';
import { Panel } from '../types/panel';

interface PanelFormProps {
  panel: Panel | null;
  onSubmit: (panel: Panel) => void;
  onCancel: () => void;
}

// Form data type that allows string values for number inputs to preserve typing state
type FormDataType = Omit<Panel, 'width' | 'height' | 'pixelPitch' | 'weight' | 'power' | 'headerConfig' | 'powerConfig'> & {
  width: string | number;
  height: string | number;
  pixelPitch: string | number;
  weight: string | number;
  power: string | number;
  powerConfig: {
    maxWattsPerLine: string | number;
  };
  headerConfig: {
    single: {
      weight: string | number;
      points: string | number;
    };
    double: {
      weight: string | number;
      points: string | number;
    };
    attachmentType: 'shackle' | 'clamp';
  };
};

export function PanelForm({ panel, onSubmit, onCancel }: PanelFormProps) {
  const getInitialFormData = (panelData?: Panel | null): FormDataType => ({
    id: panelData?.id || crypto.randomUUID(),
    name: panelData?.name || '',
    manufacturer: panelData?.manufacturer || '',
    width: panelData?.width || 500,
    height: panelData?.height || 500,
    pixelPitch: panelData?.pixelPitch || 2.6,
    weight: panelData?.weight || 6.5,
    power: panelData?.power || 150,
    headerConfig: {
      single: {
        weight: panelData?.headerConfig?.single?.weight || 0.8,
        points: panelData?.headerConfig?.single?.points || 1
      },
      double: {
        weight: panelData?.headerConfig?.double?.weight || 1.2,
        points: panelData?.headerConfig?.double?.points || 2
      },
      attachmentType: panelData?.headerConfig?.attachmentType || 'shackle'
    },
    powerConfig: {
      maxWattsPerLine: panelData?.powerConfig?.maxWattsPerLine || 3600
    },
    flightCaseCapacity: panelData?.flightCaseCapacity || 8
  });

  const [formData, setFormData] = useState<FormDataType>(() => {
    // Try to restore from localStorage first, then use panel data or defaults
    const savedData = localStorage.getItem('panel-form-draft');
    if (savedData && !panel) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        // If parsing fails, fall back to default
      }
    }
    return getInitialFormData(panel);
  });

  // Save form data to localStorage whenever it changes (for draft persistence)
  useEffect(() => {
    if (!panel) { // Only save drafts for new panels, not when editing existing ones
      localStorage.setItem('panel-form-draft', JSON.stringify(formData));
    }
  }, [formData, panel]);

  const safeParseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to Panel type with proper number values
    const panelData: Panel = {
      ...formData,
      width: safeParseNumber(formData.width),
      height: safeParseNumber(formData.height),
      pixelPitch: safeParseNumber(formData.pixelPitch),
      weight: safeParseNumber(formData.weight),
      power: safeParseNumber(formData.power),
      powerConfig: {
        maxWattsPerLine: safeParseNumber(formData.powerConfig.maxWattsPerLine)
      },
      headerConfig: {
        single: {
          weight: safeParseNumber(formData.headerConfig.single.weight),
          points: safeParseNumber(formData.headerConfig.single.points)
        },
        double: {
          weight: safeParseNumber(formData.headerConfig.double.weight),
          points: safeParseNumber(formData.headerConfig.double.points)
        },
        attachmentType: formData.headerConfig.attachmentType
      }
    };
    
    onSubmit(panelData);
  };

  const handleChange = (field: keyof FormDataType, value: string | number) => {
    // For number inputs, preserve the string value during typing
    if (typeof value === 'string' && field !== 'name' && field !== 'manufacturer') {
      // Only allow valid decimal number patterns
      if (!/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid pattern
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePowerConfigChange = (field: keyof FormDataType['powerConfig'], value: string | number) => {
    // For number inputs, preserve the string value during typing
    if (typeof value === 'string') {
      // Only allow valid decimal number patterns
      if (!/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid pattern
      }
    }
    
    setFormData(prev => ({
      ...prev,
      powerConfig: {
        ...prev.powerConfig,
        [field]: value
      }
    }));
  };

  const handleHeaderConfigChange = (
    type: 'single' | 'double',
    field: keyof FormDataType['headerConfig']['single'],
    value: string | number
  ) => {
    // For number inputs, preserve the string value during typing
    if (typeof value === 'string') {
      // Only allow valid decimal number patterns
      if (!/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid pattern
      }
    }
    
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

  const handleAttachmentTypeChange = (value: 'shackle' | 'clamp') => {
    setFormData(prev => ({
      ...prev,
      headerConfig: {
        ...prev.headerConfig,
        attachmentType: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {panel ? 'Edit Panel' : 'Add New Panel'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Panel Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Panel Name
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
          </div>

          {/* Panel Dimensions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Width (mm)
                <input
                  type="text"
                  value={formData.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (mm)
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pixel Pitch (mm)
                <input
                  type="text"
                  value={formData.pixelPitch}
                  onChange={(e) => handleChange('pixelPitch', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
          </div>

          {/* Panel Specifications */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight (kg)
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Power (W)
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => handleChange('power', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Flight Case Capacity
              <input
                type="text"
                value={formData.flightCaseCapacity}
                onChange={(e) => handleChange('flightCaseCapacity', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          {/* Power Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Power Configuration</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Watts Per Power Line
                  <input
                    type="text"
                    value={formData.powerConfig.maxWattsPerLine}
                    onChange={(e) => handlePowerConfigChange('maxWattsPerLine', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum watts that can be connected to a single power line (default: 3600W)
                </p>
              </div>
            </div>
          </div>

          {/* Header Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Header Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachment Type
                <select
                  value={formData.headerConfig.attachmentType}
                  onChange={(e) => handleAttachmentTypeChange(e.target.value as 'shackle' | 'clamp')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="shackle">Shackle</option>
                  <option value="clamp">Clamp</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Single Header */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-600">Single Header</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                    <input
                      type="text"
                      value={formData.headerConfig.single.weight}
                      onChange={(e) => handleHeaderConfigChange('single', 'weight', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Points
                    <input
                      type="text"
                      value={formData.headerConfig.single.points}
                      onChange={(e) => handleHeaderConfigChange('single', 'points', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Double Header */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-600">Double Header</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                    <input
                      type="text"
                      value={formData.headerConfig.double.weight}
                      onChange={(e) => handleHeaderConfigChange('double', 'weight', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Points
                    <input
                      type="text"
                      value={formData.headerConfig.double.points}
                      onChange={(e) => handleHeaderConfigChange('double', 'points', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {panel ? 'Update' : 'Add'} Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}