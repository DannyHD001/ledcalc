import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { Download, Monitor, Weight, Cpu, Box, Network, Grid, Image } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResultsPDF } from './ResultsPDF';
import { ScreenVisualization } from './ScreenVisualization';
import { usePanelCalculator } from '../hooks/usePanelCalculator';
import { downloadPixelMap } from '../utils/pixelMapGenerator';

interface ResultsProps {
  panel: Panel | null;
  controller?: Controller | null;
  horizontalPanels: number;
  verticalPanels: number;
  logo?: string;
  numberingDirection: 'left' | 'right' | 'top' | 'bottom';
  onNumberingDirectionChange: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
  portStartOverrides?: {[portNumber: number]: number | undefined};
  onPortStartOverridesChange?: (overrides: {[portNumber: number]: number | undefined}) => void;
  processorSplitColumn?: number;
  onProcessorSplitColumnChange?: (col: number | undefined) => void;
  projectName?: string;
  projectDate?: string;
}

export function Results({ 
  panel, 
  controller, 
  horizontalPanels, 
  verticalPanels, 
  logo, 
  numberingDirection, 
  onNumberingDirectionChange,
  portStartOverrides = {},
  onPortStartOverridesChange,
  processorSplitColumn,
  onProcessorSplitColumnChange,
  projectName,
  projectDate
}: ResultsProps) {
  const calculations = usePanelCalculator({ 
    panel: panel || undefined, 
    controller: controller || undefined, 
    horizontalPanels, 
    verticalPanels 
  });
  const totalPanels = horizontalPanels * verticalPanels;

  if (!panel) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Please select a panel to see results</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
        <div className="flex items-center gap-3">
        <button
            onClick={() => downloadPixelMap({ panel, horizontalPanels, verticalPanels, numberingDirection, logoUrl: logo })}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Image className="w-4 h-4 mr-2" />
            Download Pixel Map
          </button>
        <PDFDownloadLink
          document={
            <ResultsPDF 
              panel={panel} 
              calculations={calculations}
              horizontalPanels={horizontalPanels}
              verticalPanels={verticalPanels}
              logo={logo}
              numberingDirection={numberingDirection}
              projectName={projectName}
              projectDate={projectDate}
              controller={controller}
              portStartOverrides={portStartOverrides}
              processorSplitColumn={processorSplitColumn}
            />
          }
          fileName={[
            projectName ? projectName.replace(/\s+/g, '-') : null,
            panel.name.replace(/\s+/g, '-'),
            `${horizontalPanels}x${verticalPanels}`,
            `${calculations.resolution.horizontal}x${calculations.resolution.vertical}px`,
          ].filter(Boolean).join('_').toLowerCase() + '.pdf'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </PDFDownloadLink>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {controller && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Controller</h3>
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-600">
              {controller.manufacturer} {controller.name}
            </p>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>{controller.ports} ports × {controller.pixelsPerPort.toLocaleString()} pixels</p>
              <p>Output: {controller.outputType}</p>
              {controller.maxPixelsTotal && (
                <p>Max: {controller.maxPixelsTotal.toLocaleString()} pixels</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Screen Size</h3>
            <Monitor className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {calculations.dimensions.width.toFixed(2)}×{calculations.dimensions.height.toFixed(2)}m
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {horizontalPanels}×{verticalPanels} panels ({panel.width}×{panel.height}mm each)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Resolution</h3>
            <Grid className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {calculations.resolution.horizontal.toLocaleString()}×
            {calculations.resolution.vertical.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Total: {calculations.resolution.total.toLocaleString()} pixels
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Panels</h3>
            <Grid className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {totalPanels}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {horizontalPanels}×{verticalPanels} panels
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Weight</h3>
            <Weight className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {calculations.weight.toFixed(1)} kg
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Including headers and rigging points
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Processing</h3>
            <Cpu className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {calculations.controllers.needed} Controller{calculations.controllers.needed !== 1 ? 's' : ''}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {calculations.controllers.totalPorts} port{calculations.controllers.totalPorts !== 1 ? 's' : ''} required
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Power</h3>
            <Network className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {calculations.power.toFixed(0)}W
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Total power consumption
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Power Lines: <span className="text-blue-600">{calculations.powerLines.needed}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {calculations.powerLines.panelsPerLine} panels per line (max {calculations.powerLines.maxWattsPerLine}W each)
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Rigging</h3>
            <Box className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {calculations.rigging.totalPoints} Points
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {calculations.rigging.singleHeaders} single, {calculations.rigging.doubleHeaders} double headers
          </p>
        </div>
      </div>

      {/* Processor Split Configuration — only shown when 2+ controllers are needed */}
      {calculations.controllers.needed >= 2 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Processor Split</h3>
          <p className="text-sm text-gray-500 mb-4">
            This screen requires {calculations.controllers.needed} controllers. Set the column where the screen is
            divided between Processor 1 (left) and Processor 2 (right).
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split after column
              </label>
              <input
                type="number"
                min={1}
                max={horizontalPanels - 1}
                value={processorSplitColumn ?? Math.floor(horizontalPanels / 2)}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= horizontalPanels - 1) {
                    onProcessorSplitColumnChange?.(v);
                  }
                }}
                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">1 – {horizontalPanels - 1}</p>
            </div>
            {processorSplitColumn !== undefined && (
              <div className="pb-6">
                <div className="text-sm text-purple-700 font-medium">
                  Processor 1: {processorSplitColumn} col × {verticalPanels} rows = {processorSplitColumn * verticalPanels} panels
                </div>
                <div className="text-sm text-purple-700 font-medium mt-1">
                  Processor 2: {horizontalPanels - processorSplitColumn} col × {verticalPanels} rows = {(horizontalPanels - processorSplitColumn) * verticalPanels} panels
                </div>
              </div>
            )}
            {processorSplitColumn !== undefined && (
              <button
                onClick={() => onProcessorSplitColumnChange?.(undefined)}
                className="px-3 py-2 mb-6 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear split
              </button>
            )}
            {processorSplitColumn === undefined && (
              <button
                onClick={() => onProcessorSplitColumnChange?.(Math.floor(horizontalPanels / 2))}
                className="px-3 py-2 mb-6 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Apply default split
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Screen Visualization</h3>
        <ScreenVisualization
          panel={panel}
          controller={controller}
          horizontalPanels={horizontalPanels}
          verticalPanels={verticalPanels}
          numberingDirection={numberingDirection}
          onNumberingDirectionChange={onNumberingDirectionChange}
          portStartOverrides={portStartOverrides}
          onPortStartOverridesChange={onPortStartOverridesChange}
          processorSplitColumn={processorSplitColumn}
        />
      </div>
    </div>
  );
}
