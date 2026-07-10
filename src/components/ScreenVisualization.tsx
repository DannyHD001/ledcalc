import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { Circle, Wrench, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const LINE_COLOR_PALETTE = [
  '#E6194B','#3CB44B','#0082C8','#F58230','#911EB4','#46F0F0','#F032E6','#D2F53C','#FABEBE','#008080',
  '#E6BEFF','#AA6E28','#FFE119','#800000','#82B6E9','#9A6324','#A9A9A9','#FFFFFF','#000000'
];

interface ScreenVisualizationProps {
  panel: Panel | null;
  controller?: Controller | null;
  horizontalPanels: number;
  verticalPanels: number;
  numberingDirection: 'left' | 'right' | 'top' | 'bottom';
  onNumberingDirectionChange: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
  portStartOverrides?: {[portNumber: number]: number | undefined};
  onPortStartOverridesChange?: (overrides: {[portNumber: number]: number | undefined}) => void;
  processorSplitColumn?: number;
}

export function ScreenVisualization({ 
  panel,
  controller,
  horizontalPanels = 0,
  verticalPanels = 0,
  numberingDirection,
  onNumberingDirectionChange,
  portStartOverrides = {},
  onPortStartOverridesChange,
  processorSplitColumn
}: ScreenVisualizationProps) {
  const [showProcessorLines, setShowProcessorLines] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showPortOverrides, setShowPortOverrides] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get processor configuration - using controller data if available, otherwise defaults
  const getProcessorConfig = () => {
    if (controller) {
      return {
        pixelsPerPort: controller.pixelsPerPort,
        maxPorts: controller.ports
      };
    }
    
    // Fallback defaults when no controller is selected
    return {
      pixelsPerPort: 500000, // Default fallback
      maxPorts: 8
    };
  };

  const processorConfig = getProcessorConfig();

  if (!panel || horizontalPanels <= 0 || verticalPanels <= 0) {
    return null;
  }

  const PANEL_WIDTH = 100; // Width of each panel in pixels
  const PANEL_GAP = 2; // Gap between panels
  const HEADER_HEIGHT = 40; // Height of the header section

  const renderAttachmentPoint = () => (
    panel.headerConfig.attachmentType === 'shackle' ? (
      <Circle className="w-4 h-4 text-orange-500" fill="currentColor" />
    ) : (
      <Wrench className="w-4 h-4 text-orange-500" />
    )
  );

  const renderHeaders = () => {
    const headers = [];
    let position = 0;

    while (position < horizontalPanels) {
      if (position + 1 < horizontalPanels) {
        // Double header covering two panels
        const leftOffset = position * (PANEL_WIDTH + PANEL_GAP);
        const headerWidth = (PANEL_WIDTH * 2) + PANEL_GAP;
        
        headers.push(
          <div 
            key={`double-${position}`}
            className="absolute"
            style={{ 
              left: leftOffset,
              top: `-${HEADER_HEIGHT}px`,
              width: headerWidth
            }}
          >
            <div className="relative w-full" style={{ height: HEADER_HEIGHT }}>
              {/* Left attachment point */}
              <div className="absolute" style={{ left: '25%', top: 0, transform: 'translateX(-50%)' }}>
                {renderAttachmentPoint()}
              </div>
              {/* Right attachment point */}
              <div className="absolute" style={{ left: '75%', top: 0, transform: 'translateX(-50%)' }}>
                {renderAttachmentPoint()}
              </div>
              {/* Center stem */}
              <div className="absolute bg-gray-800" style={{ left: '50%', transform: 'translateX(-50%)', top: 20, width: 3, bottom: 8 }} />
              {/* Horizontal bar */}
              <div className="absolute bg-gray-800" style={{ left: 4, right: 4, bottom: 4, height: 8, borderRadius: 2 }} />
            </div>
          </div>
        );
        position += 2;
      } else {
        // Single header for the last panel
        const leftOffset = position * (PANEL_WIDTH + PANEL_GAP);
        
        headers.push(
          <div 
            key={`single-${position}`}
            className="absolute"
            style={{ 
              left: leftOffset,
              top: `-${HEADER_HEIGHT}px`,
              width: PANEL_WIDTH
            }}
          >
            <div className="relative w-full" style={{ height: HEADER_HEIGHT }}>
              {/* Center attachment point */}
              <div className="absolute" style={{ left: '50%', top: 0, transform: 'translateX(-50%)' }}>
                {renderAttachmentPoint()}
              </div>
              {/* Center stem */}
              <div className="absolute bg-gray-800" style={{ left: '50%', transform: 'translateX(-50%)', top: 20, width: 3, bottom: 8 }} />
              {/* Horizontal bar */}
              <div className="absolute bg-gray-800" style={{ left: 4, right: 4, bottom: 4, height: 8, borderRadius: 2 }} />
            </div>
          </div>
        );
        position += 1;
      }
    }

    return headers;
  };

  const getPanelNumber = (row: number, col: number) => {
    switch (numberingDirection) {
      case 'left':
        // Snake pattern starting left to right
        if (row % 2 === 0) {
          // Even rows: left to right
          return row * horizontalPanels + col + 1;
        } else {
          // Odd rows: right to left
          return row * horizontalPanels + (horizontalPanels - col);
        }
      case 'right':
        // Snake pattern starting right to left
        if (row % 2 === 0) {
          // Even rows: right to left
          return row * horizontalPanels + (horizontalPanels - col);
        } else {
          // Odd rows: left to right
          return row * horizontalPanels + col + 1;
        }
      case 'top':
        // All columns: top to bottom (no reversal)
        return col * verticalPanels + row + 1;
      case 'bottom':
        // All columns: bottom to top (no reversal)
        return col * verticalPanels + (verticalPanels - row);
      default:
        return row * horizontalPanels + col + 1;
    }
  };

  // Calculate processor line requirements
  const calculateProcessorLines = () => {
    if (!panel) return { linesNeeded: 0, pixelsPerLine: 0, panelsPerLine: 0, pixelsPerPanel: 0, totalPixels: 0 };
    
    const pixelsPerPanel = (panel.width / panel.pixelPitch) * (panel.height / panel.pixelPitch);
    const totalPanels = horizontalPanels * verticalPanels;
    const totalPixels = pixelsPerPanel * totalPanels;
    const pixelsPerLine = processorConfig.pixelsPerPort; // Use pixels per port directly
    const linesNeeded = Math.ceil(totalPixels / pixelsPerLine);
    
    // Calculate how many panels each port can handle
    const panelsPerLine = Math.floor(pixelsPerLine / pixelsPerPanel);
    
    // Make sure we don't exceed total panels
    const effectivePanelsPerLine = Math.min(panelsPerLine, totalPanels);
    
    return { 
      linesNeeded, 
      pixelsPerLine, 
      panelsPerLine: effectivePanelsPerLine, 
      pixelsPerPanel, 
      totalPixels,
      totalPanels
    };
  };

  const lineCalc = calculateProcessorLines();


  // Generate snake-ordered panel sequence
  const generateSnakeSequence = () => {
    const sequence = [];
    for (let row = 0; row < verticalPanels; row++) {
      for (let col = 0; col < horizontalPanels; col++) {
        const panelNumber = getPanelNumber(row, col);
        sequence.push({
          panelNumber,
          row,
          col,
          position: {
            x: col * (PANEL_WIDTH + PANEL_GAP) + PANEL_WIDTH / 2,
            y: row * (PANEL_WIDTH + PANEL_GAP) + PANEL_WIDTH / 2
          }
        });
      }
    }
    // Sort by panel number to get snake order
    return sequence.sort((a, b) => a.panelNumber - b.panelNumber);
  };

  // Zone-aware boundary helper
  const isBoundaryForZone = (row: number, col: number, zoneLeftCol: number, zoneRightCol: number): boolean => {
    switch (numberingDirection) {
      case 'left':
        return (row % 2 === 0 && col === zoneRightCol) || (row % 2 === 1 && col === zoneLeftCol);
      case 'right':
        return (row % 2 === 0 && col === zoneLeftCol) || (row % 2 === 1 && col === zoneRightCol);
      case 'top':
        // Non-reversing: every column ends at the bottom
        return row === verticalPanels - 1;
      case 'bottom':
        // Non-reversing: every column ends at the top
        return row === 0;
      default:
        return false;
    }
  };

  // Compute port groups (shared by panel coloring and SVG lines)
  type PanelNode = ReturnType<typeof generateSnakeSequence>[number];
  type PortGroup = { panels: PanelNode[]; processorIndex: number; portInProcessor: number; color: string; };

  const buildZoneGroups = (sequence: PanelNode[], capacity: number, leftCol: number, rightCol: number): PanelNode[][] => {
    const result: PanelNode[][] = [];
    let i = 0;
    while (i < sequence.length) {
      const start = i;
      let lastBoundaryEnd = -1;
      let count = 0;
      while (i < sequence.length && count < capacity) {
        const p = sequence[i];
        count++;
        if (isBoundaryForZone(p.row, p.col, leftCol, rightCol)) {
          lastBoundaryEnd = i + 1;
          if (count === capacity) { i++; break; }
        }
        i++;
      }
      const end = lastBoundaryEnd !== -1 ? lastBoundaryEnd : i;
      if (end <= start) break;
      result.push(sequence.slice(start, end));
      i = end;
    }
    return result;
  };

  const portGroups: PortGroup[] = useMemo(() => {
    if (lineCalc.linesNeeded === 0) return [];
    const snakeSequence = generateSnakeSequence();
    const capacity = lineCalc.panelsPerLine;
    const hasOverrides = Object.values(portStartOverrides).some(val => val !== undefined);

    if (hasOverrides) {
      const overrideEntries = Object.entries(portStartOverrides)
        .filter(([_, sp]) => sp !== undefined)
        .map(([portStr, sp]) => ({ port: parseInt(portStr), startPanel: sp! }))
        .sort((a, b) => a.startPanel - b.startPanel);
      const rawGroups: PanelNode[][] = [];
      overrideEntries.forEach((entry, idx) => {
        const startIdx = snakeSequence.findIndex(p => p.panelNumber === entry.startPanel);
        if (startIdx === -1) return;
        let endIdx;
        if (idx < overrideEntries.length - 1) {
          const nextIdx = snakeSequence.findIndex(p => p.panelNumber === overrideEntries[idx + 1].startPanel);
          endIdx = nextIdx === -1 ? snakeSequence.length : nextIdx;
        } else {
          endIdx = snakeSequence.length;
        }
        if (startIdx < endIdx) rawGroups.push(snakeSequence.slice(startIdx, endIdx));
      });
      return rawGroups.map((g, i) => ({
        panels: g, processorIndex: 0, portInProcessor: i + 1,
        color: LINE_COLOR_PALETTE[i % LINE_COLOR_PALETTE.length]
      }));
    }

    if (processorSplitColumn !== undefined && processorSplitColumn > 0 && processorSplitColumn < horizontalPanels) {
      const zoneASnake = snakeSequence.filter(p => p.col < processorSplitColumn);
      const zoneBSnake = snakeSequence.filter(p => p.col >= processorSplitColumn);
      const zoneAGroups = buildZoneGroups(zoneASnake, capacity, 0, processorSplitColumn - 1);
      const zoneBGroups = buildZoneGroups(zoneBSnake, capacity, processorSplitColumn, horizontalPanels - 1);
      return [
        ...zoneAGroups.map((g, i) => ({
          panels: g, processorIndex: 0, portInProcessor: i + 1,
          color: LINE_COLOR_PALETTE[i % LINE_COLOR_PALETTE.length]
        })),
        ...zoneBGroups.map((g, i) => ({
          panels: g, processorIndex: 1, portInProcessor: i + 1,
          color: LINE_COLOR_PALETTE[i % LINE_COLOR_PALETTE.length]
        })),
      ];
    }

    // Single zone: full screen (bug fix: no maxPorts cap so all panels are covered)
    const rawGroups = buildZoneGroups(snakeSequence, capacity, 0, horizontalPanels - 1);
    return rawGroups.map((g, i) => ({
      panels: g, processorIndex: 0, portInProcessor: i + 1,
      color: LINE_COLOR_PALETTE[i % LINE_COLOR_PALETTE.length]
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, controller, horizontalPanels, verticalPanels, numberingDirection, portStartOverrides, lineCalc.linesNeeded, lineCalc.panelsPerLine, processorSplitColumn]);

  // Map panelNumber → port color (for panel dots)
  const panelColorMap = useMemo(() => {
    const map = new Map<number, string>();
    portGroups.forEach(group => group.panels.forEach(p => map.set(p.panelNumber, group.color)));
    return map;
  }, [portGroups]);

  // Render processor lines following snake pattern with boundary-aware grouping
  const renderProcessorLines = () => {
    if (!showProcessorLines || portGroups.length === 0) return null;

    // Helper to build path
    const buildPath = (pts: {x:number,y:number}[]) => {
      if (pts.length < 2) return '';
      return pts.reduce((acc, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : acc + ` L ${p.x} ${p.y}`, '');
    };

    // Build arrow elements along a line showing direction
    const buildArrows = (linePanels: PanelNode[], color: string) => {
      const ARROW_INTERVAL = 3; // every N panel transitions
      const arrows: React.ReactNode[] = [];
      for (let k = 1; k < linePanels.length; k++) {
        if (k % ARROW_INTERVAL !== 0 && k !== linePanels.length - 1) continue;
        const prev = linePanels[k - 1];
        const curr = linePanels[k];
        const dx = curr.position.x - prev.position.x;
        const dy = curr.position.y - prev.position.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const fx = prev.position.x + dx * 0.6;
        const fy = prev.position.y + dy * 0.6;
        arrows.push(
          <g key={`arrow-${curr.panelNumber}`} transform={`translate(${fx} ${fy}) rotate(${angle})`}>
            <polygon points="0,0 -8,-4 -8,4" fill={color} opacity={0.85} />
          </g>
        );
      }
      return arrows;
    };

    const splitX = processorSplitColumn !== undefined
      ? processorSplitColumn * (PANEL_WIDTH + PANEL_GAP) - PANEL_GAP / 2
      : null;

    // For column-based directions, always place labels at the entry edge so
    // they don't scatter to top/bottom depending on snake reversal per column.
    const getLabelPosition = (firstPanel: PanelNode) => {
      switch (numberingDirection) {
        case 'bottom':
          // All port labels at bottom row
          return {
            x: firstPanel.position.x,
            y: (verticalPanels - 1) * (PANEL_WIDTH + PANEL_GAP) + PANEL_WIDTH / 2
          };
        case 'top':
          // All port labels at top row
          return { x: firstPanel.position.x, y: PANEL_WIDTH / 2 };
        default:
          return firstPanel.position;
      }
    };

    const lines = portGroups.map((group, lineIndex) => {
      const { panels: linePanels, color, processorIndex, portInProcessor } = group;
      if (!linePanels.length) return null;
      const pathPoints = linePanels.map(p => p.position);
      const pathData = buildPath(pathPoints);
      const label = processorIndex === 0
        ? `P${portInProcessor} (${linePanels[0].panelNumber}-${linePanels[linePanels.length - 1].panelNumber})`
        : `Pr2-P${portInProcessor} (${linePanels[0].panelNumber}-${linePanels[linePanels.length - 1].panelNumber})`;
      const labelPos = getLabelPosition(linePanels[0]);
      return (
        <g key={`line-${lineIndex}`}>
          <path d={pathData} stroke={color} strokeWidth="2" fill="none" opacity="0.75" />
          {buildArrows(linePanels, color)}
          {linePanels.map((p, idx) => (
            <circle key={`panel-${lineIndex}-${idx}`} cx={p.position.x} cy={p.position.y} r={3} fill={color} />
          ))}
          <text
            x={labelPos.x - 44}
            y={labelPos.y + 5}
            fill={color}
            fontSize={10}
            fontWeight="bold"
          >
            {label}
          </text>
        </g>
      );
    });

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: totalWidth, height: totalHeight }}
      >
        {lines}
        {splitX !== null && (
          <g>
            <line
              x1={splitX} y1={0}
              x2={splitX} y2={totalHeight}
              stroke="#a855f7"
              strokeWidth={3}
              strokeDasharray="10,5"
              opacity={0.9}
            />
          </g>
        )}
      </svg>
    );
  };

  const totalWidth = (horizontalPanels * PANEL_WIDTH) + ((horizontalPanels - 1) * PANEL_GAP);
  const totalHeight = (verticalPanels * PANEL_WIDTH) + ((verticalPanels - 1) * PANEL_GAP);
  
  // Calculate extra space needed for exit lines
  const getExtraSpace = () => ({ width: 0, height: 0 });

  const extraSpace = getExtraSpace();

  // Calculate fit-to-container zoom level
  const calculateFitZoom = () => {
    const containerWidth = 800; // Approximate container width
    const containerHeight = 600; // Approximate container height
    const totalContentWidth = totalWidth + extraSpace.width + 64; // Adding padding
    const totalContentHeight = totalHeight + extraSpace.height + HEADER_HEIGHT + 64; // Adding padding
    
    const scaleX = containerWidth / totalContentWidth;
    const scaleY = containerHeight / totalContentHeight;
    
    return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  };

  // Initialize zoom to fit on component mount
  useEffect(() => {
    if (horizontalPanels > 0 && verticalPanels > 0) {
      const fitZoom = calculateFitZoom();
      setZoom(fitZoom);
    }
  }, [horizontalPanels, verticalPanels]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleFitToContainer = () => setZoom(calculateFitZoom());

  return (
    <div className="space-y-3">
      {/* Controller/Port Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {controller ? `Controller: ${controller.manufacturer} ${controller.name}` : 'Port Configuration (Default)'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Pixels Per Port
            </label>
            <input
              type="number"
              value={processorConfig.pixelsPerPort}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {controller ? 'Total Ports' : 'Max Ports Per Controller'}
            </label>
            <input
              type="number"
              value={processorConfig.maxPorts}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Show Data Lines
            </label>
            <button
              onClick={() => setShowProcessorLines(!showProcessorLines)}
              className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                showProcessorLines
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {showProcessorLines ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
        
        {controller && (
          <div className="mt-3 p-3 bg-green-50 rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="font-medium text-green-700">Output Type:</span>
                <span className="ml-1 text-green-600">{controller.outputType}</span>
              </div>
              {controller.maxPixelsTotal && (
                <div>
                  <span className="font-medium text-green-700">Max Total Pixels:</span>
                  <span className="ml-1 text-green-600">{controller.maxPixelsTotal.toLocaleString()}</span>
                </div>
              )}
              {controller.description && (
                <div className="col-span-2 md:col-span-3">
                  <span className="font-medium text-green-700">Description:</span>
                  <span className="ml-1 text-green-600">{controller.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Line calculation results */}
        {lineCalc.linesNeeded > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="font-medium text-blue-700">Lines Needed:</span>
                <span className="ml-1 text-blue-600">{lineCalc.linesNeeded}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Panels/Line:</span>
                <span className="ml-1 text-blue-600">{lineCalc.panelsPerLine}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Pixels/Panel:</span>
                <span className="ml-1 text-blue-600">{Math.round(lineCalc.pixelsPerPanel || 0)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Total Pixels:</span>
                <span className="ml-1 text-blue-600">{Math.round(lineCalc.totalPixels || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Port Override Controls */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-yellow-800">Port Start Overrides</h4>
          <button
            onClick={() => setShowPortOverrides(!showPortOverrides)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              showPortOverrides
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-yellow-700 border border-yellow-300'
            }`}
          >
            {showPortOverrides ? 'Hide' : 'Show'} Overrides
          </button>
        </div>
        
        {showPortOverrides && (
          <div className="space-y-3">
            <p className="text-xs text-yellow-700">
              Override which panel number each controller port starts on. Leave empty to use automatic calculation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: processorConfig.maxPorts }, (_, i) => {
                const portNumber = i + 1;
                return (
                  <div key={portNumber}>
                    <label className="block text-xs font-medium text-yellow-700 mb-1">
                      Port {portNumber} starts at panel:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={horizontalPanels * verticalPanels}
                      value={portStartOverrides[portNumber] || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        if (onPortStartOverridesChange) {
                          onPortStartOverridesChange({
                            ...portStartOverrides,
                            [portNumber]: value
                          });
                        }
                      }}
                      placeholder="Auto"
                      className="w-full px-2 py-1 text-xs border border-yellow-300 rounded-md focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Numbering Direction Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Zoom:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitToContainer}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              title="Fit to Container"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Numbering Direction:</span>
          <div className="grid grid-cols-2 gap-1 rounded-md shadow-sm">
            <button
            className={`px-3 py-2 text-sm font-medium ${
              numberingDirection === 'left'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 rounded-tl-md`}
            onClick={() => onNumberingDirectionChange('left')}
          >
            Left→Right
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              numberingDirection === 'right'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-l-0 border-gray-300 rounded-tr-md`}
            onClick={() => onNumberingDirectionChange('right')}
          >
            Right→Left
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              numberingDirection === 'top'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-t-0 border-gray-300 rounded-bl-md`}
            onClick={() => onNumberingDirectionChange('top')}
          >
            Top→Bottom
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              numberingDirection === 'bottom'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-l-0 border-t-0 border-gray-300 rounded-br-md`}
            onClick={() => onNumberingDirectionChange('bottom')}
          >
            Bottom→Top
          </button>
        </div>
        </div>
      </div>

      <div 
        className="w-full relative overflow-auto" 
        ref={containerRef} 
        style={{ 
          height: (totalHeight + HEADER_HEIGHT + 16) * zoom,
          maxHeight: '70vh'
        }}
      >
        <div 
          className="bg-gray-100 rounded-lg p-2"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: totalWidth + 16, // 16px for padding
            height: totalHeight + HEADER_HEIGHT + 16 // 16px for padding
          }}
        >
          <div className="relative" style={{ marginTop: HEADER_HEIGHT }}>
            {renderHeaders()}
            {/* Processor zone labels — rendered as HTML bar above the grid to avoid collision with SVG port labels */}
            {processorSplitColumn !== undefined && (() => {
              const splitX = processorSplitColumn * (PANEL_WIDTH + PANEL_GAP) - PANEL_GAP / 2;
              return (
                <div className="absolute flex items-stretch" style={{ top: -20, left: 0, width: totalWidth, height: 18, zIndex: 10 }}>
                  <div className="flex items-center justify-center text-xs font-bold" style={{ width: splitX, color: '#a855f7', borderRight: '2px solid #a855f7', background: 'rgba(168,85,247,0.08)' }}>
                    Processor 1
                  </div>
                  <div className="flex items-center justify-center text-xs font-bold" style={{ flex: 1, color: '#a855f7', background: 'rgba(168,85,247,0.08)' }}>
                    Processor 2
                  </div>
                </div>
              );
            })()}
            <div 
              className="grid relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${horizontalPanels}, ${PANEL_WIDTH}px)`,
                gridTemplateRows: `repeat(${verticalPanels}, ${PANEL_WIDTH}px)`,
                gap: `${PANEL_GAP}px`,
                width: totalWidth,
                height: totalHeight
              }}
            >
              {Array.from({ length: verticalPanels }).map((_, row) => (
                Array.from({ length: horizontalPanels }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="bg-gray-800 rounded relative"
                    style={{
                      width: PANEL_WIDTH,
                      height: PANEL_WIDTH,
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-mono text-sm">
                        {getPanelNumber(row, col)}
                      </span>
                    </div>
                    <div className="absolute top-1 left-1 text-gray-400 text-xs">
                      R{row + 1}C{col + 1}
                    </div>
                    {/* Panel line indicator */}
                    {showProcessorLines && portGroups.length > 0 && (
                      <div 
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ 
                          backgroundColor: panelColorMap.get(getPanelNumber(row, col)) || '#666'
                        }}
                      />
                    )}
                  </div>
                ))
              ))}
            </div>
            {/* Processor lines overlay */}
            <div style={{ width: totalWidth, height: totalHeight }}>
              {renderProcessorLines()}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Panel numbers shown in center, row/column coordinates in top-left (R: Row, C: Column)</p>
        <p>Snake patterns: Continuous zigzag numbering following physical panel connections</p>
        <p>L→R: Start left, alternate directions each row | R→L: Start right, alternate directions each row</p>
        <p>T→B: Start top, alternate directions each column | B→T: Start bottom, alternate directions each column</p>
        {showProcessorLines && portGroups.length > 0 && (
          <>
            <p className="mt-2 font-medium text-gray-600">Processor Port Legend:</p>
            {processorSplitColumn !== undefined ? (
              <>
                <p className="text-xs font-medium text-gray-500 mt-1">Processor 1:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {portGroups.filter(g => g.processorIndex === 0).map((g, i) => (
                    <div key={`p1-${i}`} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: g.color }} />
                      <span className="text-xs">P{g.portInProcessor}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-500 mt-2">Processor 2:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {portGroups.filter(g => g.processorIndex === 1).map((g, i) => (
                    <div key={`p2-${i}`} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: g.color }} />
                      <span className="text-xs">P{g.portInProcessor}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {portGroups.map((g, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: g.color }} />
                    <span className="text-xs">Port {index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}