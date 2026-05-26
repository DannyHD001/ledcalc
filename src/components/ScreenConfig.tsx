import React, { useState, useEffect } from 'react';
import { Panel } from '../types/panel';
import { Info, Calculator } from 'lucide-react';

const ASPECT_RATIOS = [
  { label: 'Free (no ratio)', value: '' },
  { label: '16:9 — Landscape HD', value: '16:9' },
  { label: '16:10 — Landscape WUXGA', value: '16:10' },
  { label: '9:16 — Portrait', value: '9:16' },
  { label: '4:3 — Standard', value: '4:3' },
  { label: '1:1 — Square', value: '1:1' },
];

function parseRatio(value: string): { w: number; h: number } | null {
  if (!value) return null;
  const [w, h] = value.split(':').map(Number);
  return { w, h };
}

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
  const [desiredWidth, setDesiredWidth] = useState<string>('');
  const [desiredHeight, setDesiredHeight] = useState<string>('');
  const [horizontalPanelInput, setHorizontalPanelInput] = useState<string>(horizontalPanels.toString());
  const [verticalPanelInput, setVerticalPanelInput] = useState<string>(verticalPanels.toString());
  const [calculationsPending, setCalculationsPending] = useState<boolean>(false);
  const [aspectRatioValue, setAspectRatioValue] = useState<string>('');

  useEffect(() => {
    if (!selectedPanel) return;
    setDesiredWidth(((horizontalPanels * selectedPanel.width) / 10).toString());
    setDesiredHeight(((verticalPanels * selectedPanel.height) / 10).toString());
    setHorizontalPanelInput(horizontalPanels.toString());
    setVerticalPanelInput(verticalPanels.toString());
    setCalculationsPending(false);
  }, [horizontalPanels, verticalPanels, selectedPanel]);

  if (!selectedPanel) return null;

  const ratio = parseRatio(aspectRatioValue);

  const handlePanelCountChange = (value: string, type: 'horizontal' | 'vertical') => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (type === 'horizontal') setHorizontalPanelInput(value);
    else setVerticalPanelInput(value);
    if (value !== '' && !isNaN(parseInt(value))) {
      const numValue = Math.max(1, parseInt(value));
      if (type === 'horizontal') onHorizontalChange(numValue);
      else onVerticalChange(numValue);
    }
  };

  const handleWidthChange = (value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setDesiredWidth(value);
    setCalculationsPending(true);
    // Derive height directly from width using the ratio (pure cm math, no panel snapping)
    if (ratio && value !== '' && !isNaN(parseFloat(value))) {
      const wCm = parseFloat(value);
      setDesiredHeight((wCm * (ratio.h / ratio.w)).toFixed(2));
    }
  };

  const handleHeightChange = (value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setDesiredHeight(value);
    setCalculationsPending(true);
    // Derive width directly from height using the ratio (pure cm math, no panel snapping)
    if (ratio && value !== '' && !isNaN(parseFloat(value))) {
      const hCm = parseFloat(value);
      setDesiredWidth((hCm * (ratio.w / ratio.h)).toFixed(2));
    }
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatioValue(value);
    const r = parseRatio(value);
    if (!r) return;
    // Derive height directly from current width using the ratio
    if (desiredWidth !== '' && !isNaN(parseFloat(desiredWidth))) {
      const wCm = parseFloat(desiredWidth);
      setDesiredHeight((wCm * (r.h / r.w)).toFixed(2));
      setCalculationsPending(true);
    }
  };

  const calculatePanelsFromDimensions = () => {
    if (desiredWidth !== '' && !isNaN(parseFloat(desiredWidth))) {
      onHorizontalChange(Math.max(1, Math.round((parseFloat(desiredWidth) * 10) / selectedPanel.width)));
    }
    if (desiredHeight !== '' && !isNaN(parseFloat(desiredHeight))) {
      onVerticalChange(Math.max(1, Math.round((parseFloat(desiredHeight) * 10) / selectedPanel.height)));
    }
    setCalculationsPending(false);
  };

  const actualWidth = (horizontalPanels * selectedPanel.width) / 10;
  const actualHeight = (verticalPanels * selectedPanel.height) / 10;
  const totalPanels = horizontalPanels * verticalPanels;

  // Compute actual ratio for display
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const g = gcd(horizontalPanels, verticalPanels);
  const actualRatioStr = `${horizontalPanels / g}:${verticalPanels / g}`;

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

            {/* Aspect Ratio Dropdown */}
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-blue-700">
                Aspect Ratio (optional)
              </label>
              <select
                id="aspectRatio"
                value={aspectRatioValue}
                onChange={(e) => handleAspectRatioChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-blue-300 bg-white pl-3 pr-8 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {ASPECT_RATIOS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {ratio && (
                <p className="mt-1 text-xs text-blue-500">
                  Editing width or height will auto-calculate the other dimension to match {aspectRatioValue}.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="screenWidth" className="block text-sm font-medium text-blue-700">
                Desired Width (cm)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="screenWidth"
                  value={desiredWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
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
                  onChange={(e) => handleHeightChange(e.target.value)}
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

            <div className="text-center pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-500">Panel Grid Ratio</div>
              <div className="text-base font-semibold text-gray-700">{actualRatioStr}</div>
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
