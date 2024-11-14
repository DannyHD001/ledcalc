import React, { useState } from 'react';
import { Panel } from '../types/panel';
import { Circle, Wrench } from 'lucide-react';

interface ScreenVisualizationProps {
  panel: Panel | null;
  horizontalPanels: number;
  verticalPanels: number;
}

export function ScreenVisualization({ 
  panel,
  horizontalPanels = 0,
  verticalPanels = 0
}: ScreenVisualizationProps) {
  const [numberingDirection, setNumberingDirection] = useState<'left' | 'right'>('left');

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
    if (numberingDirection === 'left') {
      return row * horizontalPanels + col + 1;
    } else {
      return row * horizontalPanels + (horizontalPanels - col);
    }
  };

  const totalWidth = (horizontalPanels * PANEL_WIDTH) + ((horizontalPanels - 1) * PANEL_GAP);
  const totalHeight = (verticalPanels * PANEL_WIDTH) + ((verticalPanels - 1) * PANEL_GAP);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-4">
        <span className="text-sm text-gray-600">Numbering Direction:</span>
        <div className="flex rounded-md shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              numberingDirection === 'left'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 rounded-l-md`}
            onClick={() => setNumberingDirection('left')}
          >
            Left to Right
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              numberingDirection === 'right'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-l-0 border-gray-300 rounded-r-md`}
            onClick={() => setNumberingDirection('right')}
          >
            Right to Left
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div 
          className="relative inline-block bg-gray-100 rounded-lg p-8"
          style={{ 
            minWidth: totalWidth + 32,
            minHeight: totalHeight + HEADER_HEIGHT + 32
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
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        <p>Panel numbers shown in center, row/column coordinates in top-left (R: Row, C: Column)</p>
      </div>
    </div>
  );
}