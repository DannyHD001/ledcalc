import React, { useState } from 'react';
import { Panel } from '../types/panel';
import { Circle, Wrench } from 'lucide-react';

interface ScreenVisualizationProps {
  panel: Panel | null;
  horizontalPanels: number;
  verticalPanels: number;
  numberingDirection: 'left' | 'right' | 'top' | 'bottom';
  onNumberingDirectionChange: (direction: 'left' | 'right' | 'top' | 'bottom') => void;
}

export function ScreenVisualization({ 
  panel,
  horizontalPanels = 0,
  verticalPanels = 0,
  numberingDirection,
  onNumberingDirectionChange
}: ScreenVisualizationProps) {
  const [showProcessorLines, setShowProcessorLines] = useState(true);
  
  // Get processor configuration from panel
  const getProcessorConfig = () => {
    if (!panel || !panel.portConfig) {
      return {
        pixelsPerPort: 500000, // Default fallback
        maxPorts: 8
      };
    }
    return {
      pixelsPerPort: panel.portConfig.pixelsPerPort,
      maxPorts: panel.portConfig.maxPorts
    };
  };

  const processorConfig = getProcessorConfig();

  if (!panel || horizontalPanels <= 0 || verticalPanels <= 0) {
    return null;
  }

  const PANEL_WIDTH = 100; // Width of each panel in pixels
  const PANEL_GAP = 2; // Gap between panels
  const HEADER_HEIGHT = 24; // Height of the header section

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
            <div className="relative w-full">
              <div className="absolute left-1/4 -top-2">
                {renderAttachmentPoint()}
              </div>
              <div className="absolute right-1/4 -top-2">
                {renderAttachmentPoint()}
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className="h-4 w-1 bg-gray-800" />
              </div>
              <div className="w-full h-1 bg-gray-800 mt-3" />
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
            <div className="relative w-full">
              <div className="absolute left-1/2 -top-2 transform -translate-x-1/2">
                {renderAttachmentPoint()}
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className="h-4 w-1 bg-gray-800" />
              </div>
              <div className="w-full h-1 bg-gray-800 mt-3" />
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
        // Snake pattern starting top to bottom, column by column
        if (col % 2 === 0) {
          // Even columns: top to bottom
          return col * verticalPanels + row + 1;
        } else {
          // Odd columns: bottom to top
          return (col + 1) * verticalPanels - row;
        }
      case 'bottom':
        // Snake pattern starting bottom to top, column by column
        if (col % 2 === 0) {
          // Even columns: bottom to top
          return (col + 1) * verticalPanels - row;
        } else {
          // Odd columns: top to bottom
          return col * verticalPanels + row + 1;
        }
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

  // Generate colors for processor lines
  const generateLineColors = (count: number) => {
    // High-contrast color-blind friendly palette (same as PDF)
    const colors = [
      '#E6194B','#3CB44B','#0082C8','#F58230','#911EB4','#46F0F0','#F032E6','#D2F53C','#FABEBE','#008080',
      '#E6BEFF','#AA6E28','#FFE119','#800000','#82B6E9','#9A6324','#A9A9A9','#FFFFFF','#000000'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const lineColors = generateLineColors(lineCalc.linesNeeded);

  // Get which line a panel belongs to based on snake order
  const getPanelLine = (panelNumber: number) => {
    // Panel numbers are 1-based, so subtract 1 to make them 0-based for calculation
    const panelsPerLine = lineCalc.panelsPerLine;
    return Math.floor((panelNumber - 1) / panelsPerLine);
  };

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

  // Render processor lines following snake pattern with boundary-aware grouping
  const renderProcessorLines = () => {
    if (!showProcessorLines || lineCalc.linesNeeded === 0) return null;

    const snakeSequence = generateSnakeSequence();
    type PanelNode = typeof snakeSequence[number];
    const capacity = lineCalc.panelsPerLine; // maximum panels per port (may use fewer to end at boundary)

    const isBoundaryPanel = (row: number, col: number) => {
      switch (numberingDirection) {
        case 'left':
          return (row % 2 === 0 && col === horizontalPanels - 1) || (row % 2 === 1 && col === 0);
        case 'right':
          return (row % 2 === 0 && col === 0) || (row % 2 === 1 && col === horizontalPanels - 1);
        case 'top':
          return (col % 2 === 0 && row === verticalPanels - 1) || (col % 2 === 1 && row === 0);
        case 'bottom':
          return (col % 2 === 0 && row === 0) || (col % 2 === 1 && row === verticalPanels - 1);
        default:
          return false;
      }
    };

    const groups: PanelNode[][] = [];
    let i = 0;
    while (i < snakeSequence.length && groups.length < processorConfig.maxPorts) {
      const start = i;
      let lastBoundaryEnd = -1; // exclusive index after boundary panel
      let count = 0;
      while (i < snakeSequence.length && count < capacity) {
        const p = snakeSequence[i];
        count++;
        if (isBoundaryPanel(p.row, p.col)) {
          lastBoundaryEnd = i + 1;
          if (count === capacity) {
            i++;
            break;
          }
        }
        i++;
      }
      const end = lastBoundaryEnd !== -1 ? lastBoundaryEnd : i;
      if (end <= start) break;
      groups.push(snakeSequence.slice(start, end));
      i = end;
    }

    // Helper to build path that ends on the last panel only
    const buildPath = (pts: {x:number,y:number}[]) => {
      if (pts.length < 2) return '';
      return pts.reduce((acc, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : acc + ` L ${p.x} ${p.y}`, '');
    };

    // Build arrow elements along a line showing direction
    const buildArrows = (linePanels: PanelNode[], color: string) => {
      const ARROW_INTERVAL = 3; // every N panel transitions
      const arrows: React.ReactNode[] = [];
      for (let k = 1; k < linePanels.length; k++) {
        if (k % ARROW_INTERVAL !== 0 && k !== linePanels.length - 1) continue; // place at interval and always at last segment
        const prev = linePanels[k - 1];
        const curr = linePanels[k];
        const dx = curr.position.x - prev.position.x;
        const dy = curr.position.y - prev.position.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const fx = prev.position.x + dx * 0.6; // arrow placement (60% along segment)
        const fy = prev.position.y + dy * 0.6;
        arrows.push(
          <g key={`arrow-${curr.panelNumber}`} transform={`translate(${fx} ${fy}) rotate(${angle})`}>
            <polygon points="0,0 -8,-4 -8,4" fill={color} opacity={0.85} />
          </g>
        );
      }
      return arrows;
    };

    const lines = groups.map((linePanels, lineIndex) => {
      if (!linePanels.length) return null;
      const color = lineColors[lineIndex % lineColors.length];
      const pathPoints = linePanels.map(p => p.position); // no exit point
      const pathData = buildPath(pathPoints);
      return (
        <g key={`line-${lineIndex}`}>
          <path d={pathData} stroke={color} strokeWidth="2" fill="none" opacity="0.75" />
          {buildArrows(linePanels, color)}
          {linePanels.map((p, idx) => (
            <circle key={`panel-${lineIndex}-${idx}`} cx={p.position.x} cy={p.position.y} r={3} fill={color} />
          ))}
          <text
            x={linePanels[0].position.x - 34}
            y={linePanels[0].position.y + 5}
            fill={color}
            fontSize={10}
            fontWeight="bold"
          >
            P{lineIndex + 1} ({linePanels[0].panelNumber}-{linePanels[linePanels.length - 1].panelNumber})
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
      </svg>
    );
  };

  const totalWidth = (horizontalPanels * PANEL_WIDTH) + ((horizontalPanels - 1) * PANEL_GAP);
  const totalHeight = (verticalPanels * PANEL_WIDTH) + ((verticalPanels - 1) * PANEL_GAP);
  
  // Calculate extra space needed for exit lines
  const getExtraSpace = () => ({ width: 0, height: 0 });

  const extraSpace = getExtraSpace();

  return (
    <div className="space-y-4">
      {/* Processor Configuration */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Port Configuration</h4>
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
              Max Ports Per Controller
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

      {/* Numbering Direction Controls */}
      <div className="flex items-center justify-end space-x-4">
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

      <div className="w-full overflow-x-auto">
        <div 
          className="relative inline-block bg-gray-100 rounded-lg p-8"
          style={{ 
            minWidth: totalWidth + extraSpace.width + 32,
            minHeight: totalHeight + extraSpace.height + HEADER_HEIGHT + 32
          }}
        >
          <div className="relative">
            {renderHeaders()}
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
                    {showProcessorLines && lineCalc.linesNeeded > 0 && (
                      <div 
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ 
                          backgroundColor: lineColors[getPanelLine(getPanelNumber(row, col))] || '#gray'
                        }}
                      />
                    )}
                  </div>
                ))
              ))}
            </div>
            {/* Processor lines overlay */}
            <div style={{ width: totalWidth + extraSpace.width, height: totalHeight + extraSpace.height }}>
              {renderProcessorLines()}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        <p>Panel numbers shown in center, row/column coordinates in top-left (R: Row, C: Column)</p>
        <p>Snake patterns: Continuous zigzag numbering following physical panel connections</p>
        <p>L→R: Start left, alternate directions each row | R→L: Start right, alternate directions each row</p>
        <p>T→B: Start top, alternate directions each column | B→T: Start bottom, alternate directions each column</p>
        {showProcessorLines && lineCalc.linesNeeded > 0 && (
          <>
            <p className="mt-2 font-medium text-gray-600">Processor Port Legend:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {lineColors.slice(0, lineCalc.linesNeeded).map((color, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs">Port {index + 1}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}