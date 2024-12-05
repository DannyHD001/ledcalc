import React from 'react';
import { Panel } from '../types/panel';
import { Monitor, Weight, Zap, Ruler, Cpu } from 'lucide-react';
import ResultCard from './ResultCard';

interface ResultsPanelProps {
  horizontalPanels: number;
  verticalPanels: number;
  selectedPanel: Panel;
  calculations: {
    rigging: {
      singleHeaders: number;
      doubleHeaders: number;
      shackles: number;
      totalWeight: number;
    };
    controller: {
      totalPixels: number;
      controllersNeeded: number;
      outputsNeeded: number;
    };
  };
  voltage: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  horizontalPanels,
  verticalPanels,
  selectedPanel,
  calculations,
  voltage
}) => {
  const screenWidth = (horizontalPanels * selectedPanel.width) / 1000;
  const screenHeight = (verticalPanels * selectedPanel.height) / 1000;
  const resolutionH = Math.floor(selectedPanel.width / selectedPanel.pitch) * horizontalPanels;
  const resolutionV = Math.floor(selectedPanel.height / selectedPanel.pitch) * verticalPanels;
  const totalPower = horizontalPanels * verticalPanels * selectedPanel.power;
  const powerPerPhase = totalPower / (voltage === 230 ? 1 : Math.sqrt(3));
  const current = powerPerPhase / voltage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ResultCard
        title="Screen Dimensions"
        value={`${screenWidth.toFixed(2)}m × ${screenHeight.toFixed(2)}m`}
        icon={Ruler}
      />
      <ResultCard
        title="Resolution"
        value={`${resolutionH}×${resolutionV} (${(resolutionH * resolutionV).toLocaleString()} px)`}
        icon={Monitor}
      />
      <ResultCard
        title="Total Weight"
        value={`${calculations.rigging.totalWeight.toFixed(1)} kg`}
        icon={Weight}
      />
      <ResultCard
        title="Power Requirements"
        value={`${totalPower}W (${Math.ceil(current)}A @ ${voltage}V)`}
        icon={Zap}
      />
      <ResultCard
        title="Controllers"
        value={`${calculations.controller.controllersNeeded} (${calculations.controller.outputsNeeded} outputs)`}
        icon={Cpu}
      />
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rigging Details</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>Single Headers: {calculations.rigging.singleHeaders}</li>
          <li>Double Headers: {calculations.rigging.doubleHeaders}</li>
          <li>Attachment Points: {calculations.rigging.shackles}</li>
        </ul>
      </div>
    </div>
  );
};

export default ResultsPanel;