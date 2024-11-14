import React from 'react';
import { Panel } from '../types/panel';
import { Download, Monitor, Weight, Cpu, Box, Network, Grid } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResultsPDF } from './ResultsPDF';
import { ScreenVisualization } from './ScreenVisualization';
import { usePanelCalculator } from '../hooks/usePanelCalculator';

interface ResultsProps {
  panel: Panel | null;
  horizontalPanels: number;
  verticalPanels: number;
  logo?: string;
}

export function Results({ panel, horizontalPanels, verticalPanels, logo }: ResultsProps) {
  if (!panel) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Please select a panel to see results</p>
      </div>
    );
  }

  const calculations = usePanelCalculator({ panel, horizontalPanels, verticalPanels });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
        <PDFDownloadLink
          document={
            <ResultsPDF 
              panel={panel} 
              calculations={calculations}
              horizontalPanels={horizontalPanels}
              verticalPanels={verticalPanels}
              logo={logo}
            />
          }
          fileName={`led-screen-configuration-${panel.name.toLowerCase().replace(/\s+/g, '-')}.pdf`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {({ loading }) => (
            <>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </>
          )}
        </PDFDownloadLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Screen Visualization</h3>
        <ScreenVisualization
          panel={panel}
          horizontalPanels={horizontalPanels}
          verticalPanels={verticalPanels}
        />
      </div>
    </div>
  );
}