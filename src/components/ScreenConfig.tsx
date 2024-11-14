import React, { useState, useEffect } from 'react';
import { Panel } from '../types/panel';
import { Info } from 'lucide-react';

interface ScreenConfigProps {
  horizontalPanels: number;
  verticalPanels: number;
  selectedPanel: Panel | undefined;
  onHorizontalChange: (value: number) => void;
  onVerticalChange: (value: number) => void;
}

export const ScreenConfig: React.FC<ScreenConfigProps> = ({
  horizontalPanels,
  verticalPanels,
  selectedPanel,
  onHorizontalChange,
  onVerticalChange
}) => {
  if (!selectedPanel) return null;

  // State for free-form dimension inputs
  const [desiredWidth, setDesiredWidth] = useState<string>(((horizontalPanels * selectedPanel.width) / 10).toString());
  const [desiredHeight, setDesiredHeight] = useState<string>(((verticalPanels * selectedPanel.height) / 10).toString());

  // Update dimension inputs when panel counts change
  useEffect(() => {
    setDesiredWidth(((horizontalPanels * selectedPanel.width) / 10).toString());
    setDesiredHeight(((verticalPanels * selectedPanel.height) / 10).toString());
  }, [horizontalPanels, verticalPanels, selectedPanel]);

  const handleDimensionChange = (
    value: string,
    dimension: 'width' | 'height'
  ) => {
    const numValue = parseFloat(value) || 0;
    const mmValue = numValue * 10; // Convert cm to mm
    const panelSize = dimension === 'width' ? selectedPanel.width : selectedPanel.height;
    const panels = Math.max(1, Math.round(mmValue / panelSize));
    
    if (dimension === 'width') {
      setDesiredWidth(value);
      onHorizontalChange(panels);
    } else {
      setDesiredHeight(value);
      onVerticalChange(panels);
    }
  };

  // Calculate actual dimensions based on panel count
  const actualWidth = (horizontalPanels * selectedPanel.width) / 10;
  const actualHeight = (verticalPanels * selectedPanel.height) / 10;

  // Calculate differences
  const widthDiff = Math.abs(parseFloat(desiredWidth) - actualWidth);
  const heightDiff = Math.abs(parseFloat(desiredHeight) - actualHeight);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Screen Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Desired Dimensions</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="screenWidth" className="block text-sm font-medium text-gray-600">
                Width (cm)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="screenWidth"
                  value={desiredWidth}
                  onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">cm</span>
                </div>
              </div>
              {widthDiff > 0.1 && (
                <div className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Actual width will be {actualWidth.toFixed(1)} cm
                </div>
              )}
            </div>
            <div>
              <label htmlFor="screenHeight" className="block text-sm font-medium text-gray-600">
                Height (cm)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="screenHeight"
                  value={desiredHeight}
                  onChange={(e) => handleDimensionChange(e.target.value, 'height')}
                  className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">cm</span>
                </div>
              </div>
              {heightDiff > 0.1 && (
                <div className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Actual height will be {actualHeight.toFixed(1)} cm
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Panel Configuration</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="horizontalPanels" className="block text-sm font-medium text-gray-600">
                Horizontal Panels
              </label>
              <input
                type="number"
                id="horizontalPanels"
                value={horizontalPanels}
                onChange={(e) => onHorizontalChange(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="verticalPanels" className="block text-sm font-medium text-gray-600">
                Vertical Panels
              </label>
              <input
                type="number"
                id="verticalPanels"
                value={verticalPanels}
                onChange={(e) => onVerticalChange(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-700 mb-2">Final Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Actual Width:</span> {actualWidth.toFixed(1)} cm ({horizontalPanels} panels)
          </div>
          <div>
            <span className="font-medium">Actual Height:</span> {actualHeight.toFixed(1)} cm ({verticalPanels} panels)
          </div>
          <div className="md:col-span-2">
            <span className="font-medium">Panel Size:</span> {(selectedPanel.width / 10).toFixed(1)} × {(selectedPanel.height / 10).toFixed(1)} cm
          </div>
        </div>
      </div>
    </div>
  );
};