import { useMemo } from 'react';
import { Panel } from '../types/panel';

interface CalculatorConfig {
  panel?: Panel;
  horizontalPanels: number;
  verticalPanels: number;
}

interface CalculationResult {
  dimensions: {
    width: number;
    height: number;
  };
  resolution: {
    horizontal: number;
    vertical: number;
    total: number;
  };
  weight: number;
  power: number;
  powerLines: {
    needed: number;
    maxWattsPerLine: number;
    panelsPerLine: number;
    totalPowerLoad: number;
  };
  rigging: {
    singleHeaders: number;
    doubleHeaders: number;
    totalPoints: number;
  };
  controllers: {
    needed: number;
    portsPerController: number;
    totalPorts: number;
  };
  flightCases: number;
}

const defaultResult: CalculationResult = {
  dimensions: { width: 0, height: 0 },
  resolution: { horizontal: 0, vertical: 0, total: 0 },
  weight: 0,
  power: 0,
  powerLines: {
    needed: 0,
    maxWattsPerLine: 3600,
    panelsPerLine: 0,
    totalPowerLoad: 0
  },
  rigging: {
    singleHeaders: 0,
    doubleHeaders: 0,
    totalPoints: 0
  },
  controllers: {
    needed: 0,
    portsPerController: 0,
    totalPorts: 0
  },
  flightCases: 0
};

export function usePanelCalculator({ panel, horizontalPanels, verticalPanels }: CalculatorConfig): CalculationResult {
  return useMemo(() => {
    if (!panel) {
      return defaultResult;
    }

    const totalPanels = horizontalPanels * verticalPanels;
    const screenWidth = (horizontalPanels * panel.width) / 1000;
    const screenHeight = (verticalPanels * panel.height) / 1000;

    // Calculate resolution
    const horizontalResolution = Math.floor(horizontalPanels * (panel.width / panel.pixelPitch));
    const verticalResolution = Math.floor(verticalPanels * (panel.height / panel.pixelPitch));
    const totalPixels = horizontalResolution * verticalResolution;

    // Calculate rigging requirements
    let singleHeaders = 0;
    let doubleHeaders = 0;

    if (horizontalPanels === 1) {
      singleHeaders = 1;
    } else if (horizontalPanels === 2) {
      doubleHeaders = 1;
    } else if (horizontalPanels % 2 === 0) {
      doubleHeaders = horizontalPanels / 2;
    } else {
      doubleHeaders = Math.floor(horizontalPanels / 2);
      singleHeaders = 1;
    }

    const totalRiggingPoints = 
      (singleHeaders * panel.headerConfig.single.points) + 
      (doubleHeaders * panel.headerConfig.double.points);

    const riggingWeight = 
      (singleHeaders * panel.headerConfig.single.weight) + 
      (doubleHeaders * panel.headerConfig.double.weight);

    const totalWeight = (totalPanels * panel.weight) + riggingWeight;
    const totalPower = totalPanels * panel.power;

    // Calculate controller and port requirements
    const pixelsPerPanel = Math.floor((panel.width / panel.pixelPitch) * (panel.height / panel.pixelPitch));
    const pixelsPerPort = panel.portConfig?.pixelsPerPort || pixelsPerPanel;
    const maxPorts = panel.portConfig?.maxPorts || 16;
    const panelsPerPort = Math.floor(pixelsPerPort / pixelsPerPanel);
    const totalPorts = Math.ceil(totalPanels / panelsPerPort);
    const controllersNeeded = Math.ceil(totalPorts / maxPorts);

    // Calculate power line requirements
    const maxWattsPerLine = panel.powerConfig?.maxWattsPerLine || 3600;
    const panelsPerPowerLine = Math.floor(maxWattsPerLine / panel.power);
    const powerLinesNeeded = Math.ceil(totalPanels / panelsPerPowerLine);

    return {
      dimensions: { width: screenWidth, height: screenHeight },
      resolution: { 
        horizontal: horizontalResolution, 
        vertical: verticalResolution,
        total: totalPixels
      },
      weight: totalWeight,
      power: totalPower,
      powerLines: {
        needed: powerLinesNeeded,
        maxWattsPerLine,
        panelsPerLine: panelsPerPowerLine,
        totalPowerLoad: totalPower
      },
      rigging: {
        singleHeaders,
        doubleHeaders,
        totalPoints: totalRiggingPoints
      },
      controllers: {
        needed: controllersNeeded,
        portsPerController: maxPorts,
        totalPorts
      },
      flightCases: Math.ceil(totalPanels / panel.flightCaseCapacity)
    };
  }, [horizontalPanels, verticalPanels, panel]);
}