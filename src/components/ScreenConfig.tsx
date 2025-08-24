import React, { useState, useEffect } from 'react';
import { Panel } from '../types/panel';
import { Info, Calculator } from 'lucide-react';

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
  
  // State for panel count inputs to allow string-based editing
  const [horizontalPanelInput, setHorizontalPanelInput] = useState<string>(horizontalPanels.toString());
  const [verticalPanelInput, setVerticalPanelInput] = useState<string>(verticalPanels.toString());
  
  // Track if calculations are pending
  const [calculationsPending, setCalculationsPending] = useState<boolean>(false);

  // Update dimension inputs when panel counts change
  useEffect(() => {
    setDesiredWidth(((horizontalPanels * selectedPanel.width) / 10).toString());
    setDesiredHeight(((verticalPanels * selectedPanel.height) / 10).toString());
    setHorizontalPanelInput(horizontalPanels.toString());
    setVerticalPanelInput(verticalPanels.toString());
    setCalculationsPending(false);
  }, [horizontalPanels, verticalPanels, selectedPanel]);

  const handlePanelCountChange = (value: string, type: 'horizontal' | 'vertical') => {
    // Only allow valid integer patterns, but also allow empty string
    if (value !== '' && !/^\d+$/.test(value)) {
      return; // Don't update if invalid pattern
    }

    // Update the display value immediately
    if (type === 'horizontal') {
      setHorizontalPanelInput(value);
    } else {
      setVerticalPanelInput(value);
    }

    // Only update the actual value if we have a valid number
    if (value !== '' && !isNaN(parseInt(value))) {
      const numValue = Math.max(1, parseInt(value));
      if (type === 'horizontal') {
        onHorizontalChange(numValue);
      } else {
        onVerticalChange(numValue);
      }
    }
  };

  const handleDimensionChange = (
    value: string,
    dimension: 'width' | 'height'
  ) => {
    // Allow empty string and any valid decimal number (including large numbers like 800)
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return; // Don't update if invalid pattern
    }

    // Update the display value immediately
    if (dimension === 'width') {
      setDesiredWidth(value);
    } else {
      setDesiredHeight(value);
    }

    // Mark that calculations are pending
    setCalculationsPending(true);
  };

  const calculatePanelsFromDimensions = () => {
    // Calculate horizontal panels from width
    if (desiredWidth !== '' && !isNaN(parseFloat(desiredWidth))) {
      const numValue = parseFloat(desiredWidth);
      const mmValue = numValue * 10; // Convert cm to mm
      const panels = Math.max(1, Math.round(mmValue / selectedPanel.width));
      onHorizontalChange(panels);
    }

    // Calculate vertical panels from height
    if (desiredHeight !== '' && !isNaN(parseFloat(desiredHeight))) {
      const numValue = parseFloat(desiredHeight);
      const mmValue = numValue * 10; // Convert cm to mm
      const panels = Math.max(1, Math.round(mmValue / selectedPanel.height));
      onVerticalChange(panels);
    }

    setCalculationsPending(false);
  };

  // Calculate actual dimensions based on panel count
  const actualWidth = (horizontalPanels * selectedPanel.width) / 10;
  const actualHeight = (verticalPanels * selectedPanel.height) / 10;

  // Calculate total panels
  const totalPanels = horizontalPanels * verticalPanels;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Screen Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Enter Desired Dimensions
          </h4>
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div>
              <label htmlFor="screenWidth" className="block text-sm font-medium text-blue-700">
                Desired Width (cm)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="screenWidth"
                  value={desiredWidth}
                  onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                  className="block w-full rounded-md border-blue-300 pl-3 pr-12 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Enter desired width (e.g., 400)"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-blue-500 sm:text-sm font-medium">cm</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="screenHeight" className="block text-sm font-medium text-blue-700">
                Desired Height (cm)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="screenHeight"
                  value={desiredHeight}
                  onChange={(e) => handleDimensionChange(e.target.value, 'height')}
                  className="block w-full rounded-md border-blue-300 pl-3 pr-12 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Enter desired height (e.g., 300)"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-blue-500 sm:text-sm font-medium">cm</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                onClick={calculatePanelsFromDimensions}
                disabled={!calculationsPending}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  calculationsPending
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Calculator className="w-4 h-4" />
                {calculationsPending ? 'Calculate Panels' : 'No Changes to Calculate'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Calculated Panel Count</h4>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="text-center space-y-2 pb-4 border-b border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{totalPanels}</div>
              <div className="text-sm text-gray-600">Total Panels Required</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">{horizontalPanels}</div>
                <div className="text-gray-600">Horizontal</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">{verticalPanels}</div>
                <div className="text-gray-600">Vertical</div>
              </div>
            </div>
          </div>
          
          {/* Manual override section */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-600">Manual Override (Optional)</h5>
            <div className="space-y-3">
              <div>
                <label htmlFor="horizontalPanels" className="block text-xs font-medium text-gray-500">
                  Override Horizontal Panels
                </label>
                <input
                  type="text"
                  id="horizontalPanels"
                  value={horizontalPanelInput}
                  onChange={(e) => handlePanelCountChange(e.target.value, 'horizontal')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Auto-calculated"
                />
              </div>
              <div>
                <label htmlFor="verticalPanels" className="block text-xs font-medium text-gray-500">
                  Override Vertical Panels
                </label>
                <input
                  type="text"
                  id="verticalPanels"
                  value={verticalPanelInput}
                  onChange={(e) => handlePanelCountChange(e.target.value, 'vertical')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Final Screen Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
              <span className="font-medium text-gray-700">Actual Width:</span> 
              <span className="font-bold text-blue-600">{actualWidth.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
              <span className="font-medium text-gray-700">Actual Height:</span> 
              <span className="font-bold text-blue-600">{actualHeight.toFixed(1)} cm</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
              <span className="font-medium text-gray-700">Total Panels:</span> 
              <span className="font-bold text-blue-600">{totalPanels}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
              <span className="font-medium text-gray-700">Panel Size:</span> 
              <span className="font-bold text-blue-600">{(selectedPanel.width / 10).toFixed(1)} × {(selectedPanel.height / 10).toFixed(1)} cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
