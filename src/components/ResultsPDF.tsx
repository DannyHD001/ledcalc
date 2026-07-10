import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, Path, Circle, G, Tspan } from '@react-pdf/renderer';
import { Panel } from '../types/panel';
import { Controller } from '../types/controller';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 150,
    height: 60,
    marginRight: 20
  },
  headerContent: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 0,
    textAlign: 'center'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  column: {
    flex: 1
  },
  label: {
    fontSize: 10,
    color: '#666'
  },
  value: {
    fontSize: 12,
    marginTop: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666'
  }
});

interface ResultsPDFProps {
  panel: Panel;
  calculations: any;
  horizontalPanels: number;
  verticalPanels: number;
  logo?: string;
  numberingDirection?: 'left' | 'right' | 'top' | 'bottom';
  projectName?: string;
  projectDate?: string;
  controller?: Controller | null;
  portStartOverrides?: {[portNumber: number]: number | undefined};
  processorSplitColumn?: number;
  powerLines?: Array<{from: number; to: number}>;
}

export function ResultsPDF({ panel, calculations, horizontalPanels, verticalPanels, logo, numberingDirection = 'left', projectName, projectDate, controller, portStartOverrides = {}, processorSplitColumn, powerLines = [] }: ResultsPDFProps) {
  // Debug: Log logo prop
  console.log('ResultsPDF - Logo prop:', logo);
  // --- Visualization helpers (simplified mirror of on-screen logic) ---
  const getPanelNumber = (row: number, col: number) => {
    switch (numberingDirection) {
      case 'left':
        return row % 2 === 0 ? row * horizontalPanels + col + 1 : row * horizontalPanels + (horizontalPanels - col);
      case 'right':
        return row % 2 === 0 ? row * horizontalPanels + (horizontalPanels - col) : row * horizontalPanels + col + 1;
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

  const pixelsPerPanel = (panel.width / panel.pixelPitch) * (panel.height / panel.pixelPitch);
  const pixelsPerPort = controller ? controller.pixelsPerPort : 500000;
  const maxPortsFromController = controller ? controller.ports : 8;
  const panelsPerLine = Math.max(1, Math.floor(pixelsPerPort / pixelsPerPanel));
  // High-contrast color-blind friendly palette (extended)
  const lineColors = [
    '#E6194B','#3CB44B','#0082C8','#F58230','#911EB4','#46F0F0','#F032E6','#D2F53C','#FABEBE','#008080',
    '#E6BEFF','#AA6E28','#FFE119','#800000','#82B6E9','#9A6324','#A9A9A9','#FFFFFF','#000000'
  ];
  const getPortIndex = (panelNumber: number) => Math.floor((panelNumber - 1) / panelsPerLine);

  // Layout sizing for PDF (landscape A4 approx 842x595 minus padding)
  const PAGE_INNER_WIDTH = 842 - 60; // padding already in page style
  const PAGE_INNER_HEIGHT = 595 - 60;
  const gap = 2;
  const pdfHeaderH = 24; // space above grid for rigging header bars
  const cellSize = Math.min(
    (PAGE_INNER_WIDTH - (horizontalPanels - 1) * gap) / horizontalPanels,
    (PAGE_INNER_HEIGHT - pdfHeaderH - (verticalPanels - 1) * gap) / verticalPanels
  );
  const gridWidth = horizontalPanels * cellSize + (horizontalPanels - 1) * gap;
  const gridHeight = verticalPanels * cellSize + (verticalPanels - 1) * gap;

  // Precompute panels sequence for optional future path lines (currently only coloring panels)
  const panels: { num: number; row: number; col: number; port: number }[] = [];
  for (let r = 0; r < verticalPanels; r++) {
    for (let c = 0; c < horizontalPanels; c++) {
      const n = getPanelNumber(r, c);
      panels.push({ num: n, row: r, col: c, port: getPortIndex(n) });
    }
  }
  panels.sort((a, b) => a.num - b.num);

  // Build snake ordered sequence for lines
  interface PanelNode { num:number; row:number; col:number; x:number; y:number; port:number; }
  const snake: PanelNode[] = [];
  for (let r = 0; r < verticalPanels; r++) {
    for (let c = 0; c < horizontalPanels; c++) {
      const n = getPanelNumber(r,c);
      const x = c * (cellSize + gap) + cellSize/2;
      const y = r * (cellSize + gap) + cellSize/2 + pdfHeaderH;
      snake.push({ num:n,row:r,col:c,x,y,port:getPortIndex(n)});
    }
  }
  snake.sort((a,b)=>a.num-b.num);
  const groups: PanelNode[][] = [];
  const hasOverrides = Object.values(portStartOverrides).some(val => val !== undefined);

  // Zone-aware boundary helper
  const isBoundary = (row:number, col:number, zoneLeftCol: number, zoneRightCol: number) => {
    switch (numberingDirection) {
      case 'left': return (row % 2 === 0 && col === zoneRightCol) || (row % 2 === 1 && col === zoneLeftCol);
      case 'right': return (row % 2 === 0 && col === zoneLeftCol) || (row % 2 === 1 && col === zoneRightCol);
      case 'top': return row === verticalPanels - 1; // non-reversing: every col ends at bottom
      case 'bottom': return row === 0;               // non-reversing: every col ends at top
      default: return false;
    }
  };

  const buildZoneGroups = (sequence: PanelNode[], capacity: number, leftCol: number, rightCol: number): PanelNode[][] => {
    const result: PanelNode[][] = [];
    let i = 0;
    while (i < sequence.length) {
      const start = i; let lastBoundaryEnd = -1; let count = 0;
      while (i < sequence.length && count < capacity) {
        const p = sequence[i]; count++;
        if (isBoundary(p.row, p.col, leftCol, rightCol)) { lastBoundaryEnd = i + 1; if (count === capacity) { i++; break; } }
        i++;
      }
      const end = lastBoundaryEnd !== -1 ? lastBoundaryEnd : i; if (end <= start) break;
      result.push(sequence.slice(start, end)); i = end;
    }
    return result;
  };

  // processorIndex per group (0 = Processor 1, 1 = Processor 2) and port label within processor
  const groupMeta: { processorIndex: number; portInProcessor: number }[] = [];

  if (hasOverrides) {
    const overrideEntries = Object.entries(portStartOverrides)
      .filter(([_, sp]) => sp !== undefined)
      .map(([portStr, sp]) => ({ port: parseInt(portStr), startPanel: sp! }))
      .sort((a, b) => a.startPanel - b.startPanel);
    overrideEntries.forEach((entry, idx) => {
      const startIdx = snake.findIndex(p => p.num === entry.startPanel);
      if (startIdx === -1) return;
      let endIdx: number;
      if (idx < overrideEntries.length - 1) {
        const nextIdx = snake.findIndex(p => p.num === overrideEntries[idx + 1].startPanel);
        endIdx = nextIdx === -1 ? snake.length : nextIdx;
      } else {
        endIdx = snake.length;
      }
      if (startIdx < endIdx) groups.push(snake.slice(startIdx, endIdx));
    });
    groups.forEach((_, i) => groupMeta.push({ processorIndex: 0, portInProcessor: i + 1 }));
  } else if (processorSplitColumn !== undefined && processorSplitColumn > 0 && processorSplitColumn < horizontalPanels) {
    const zoneASnake = snake.filter(p => p.col < processorSplitColumn);
    const zoneBSnake = snake.filter(p => p.col >= processorSplitColumn);
    const zoneAGroups = buildZoneGroups(zoneASnake, panelsPerLine, 0, processorSplitColumn - 1);
    const zoneBGroups = buildZoneGroups(zoneBSnake, panelsPerLine, processorSplitColumn, horizontalPanels - 1);
    zoneAGroups.forEach(g => groups.push(g));
    zoneBGroups.forEach(g => groups.push(g));
    zoneAGroups.forEach((_, i) => groupMeta.push({ processorIndex: 0, portInProcessor: i + 1 }));
    zoneBGroups.forEach((_, i) => groupMeta.push({ processorIndex: 1, portInProcessor: i + 1 }));
  } else {
    const rawGroups = buildZoneGroups(snake, panelsPerLine, 0, horizontalPanels - 1);
    rawGroups.forEach(g => groups.push(g));
    groups.forEach((_, i) => groupMeta.push({ processorIndex: 0, portInProcessor: i + 1 }));
  }
  // Build path string for group
  const buildPath = (g: PanelNode[]) => g.reduce((acc,p,idx)=> idx===0 ? `M ${p.x} ${p.y}` : acc+` L ${p.x} ${p.y}`,'');
  // Arrow generation along path
  const buildArrows = (g: PanelNode[], color:string) => {
    const ARROW_INTERVAL = 3; const size = 5; const arrows: JSX.Element[] = [];
    for (let k=1;k<g.length;k++) {
      if (k % ARROW_INTERVAL !== 0 && k !== g.length -1) continue;
      const a = g[k-1], b = g[k]; const dx = b.x - a.x, dy = b.y - a.y; const len = Math.sqrt(dx*dx+dy*dy) || 1;
      const ux = dx/len, uy = dy/len; // unit
      const px = -uy, py = ux; // perpendicular
      const cx = a.x + dx*0.6, cy = a.y + dy*0.6; // center for arrow
      const tipx = cx + ux*size; const tipy = cy + uy*size;
      const leftx = cx - ux*size*0.6 + px*size*0.6; const lefty = cy - uy*size*0.6 + py*size*0.6;
      const rightx = cx - ux*size*0.6 - px*size*0.6; const righty = cy - uy*size*0.6 - py*size*0.6;
      const d = `M ${tipx} ${tipy} L ${leftx} ${lefty} L ${rightx} ${righty} Z`;
      arrows.push(<Path key={`arr-${g[k].num}`} d={d} fill={color} />);
    }
    return arrows;
  };
  // Pre-compute rigging header elements for PDF
  const pdfRiggingHeaders: JSX.Element[] = [];
  {
    let pos = 0;
    const hInset = 3;      // inset bar from panel edges so adjacent headers have visible gap
    const barH = 5;        // thick horizontal bar
    const stemW = 2.5;     // wide vertical stem
    const dotR = Math.max(4.5, cellSize * 0.07);
    const barY = pdfHeaderH - barH - 1;
    const dotCY = dotR + 1;
    const stemTop = dotCY + dotR;
    while (pos < horizontalPanels) {
      const x = pos * (cellSize + gap);
      if (pos + 1 < horizontalPanels) {
        const w = cellSize * 2 + gap;
        // horizontal bar
        pdfRiggingHeaders.push(<Rect key={`hbar-${pos}`} x={x + hInset} y={barY} width={w - hInset * 2} height={barH} fill="#1f2937" />);
        // center stem
        const stemX = x + w / 2 - stemW / 2;
        pdfRiggingHeaders.push(<Rect key={`hvc-${pos}`} x={stemX} y={stemTop} width={stemW} height={barY - stemTop} fill="#1f2937" />);
        // two attachment dots
        const dot1x = x + w * 0.25;
        const dot2x = x + w * 0.75;
        pdfRiggingHeaders.push(<Path key={`hdl-${pos}`} d={`M ${dot1x - dotR},${dotCY} a ${dotR},${dotR} 0 1,0 ${dotR * 2},0 a ${dotR},${dotR} 0 1,0 ${-dotR * 2},0`} fill="#f97316" />);
        pdfRiggingHeaders.push(<Path key={`hdrr-${pos}`} d={`M ${dot2x - dotR},${dotCY} a ${dotR},${dotR} 0 1,0 ${dotR * 2},0 a ${dotR},${dotR} 0 1,0 ${-dotR * 2},0`} fill="#f97316" />);
        pos += 2;
      } else {
        // single header
        pdfRiggingHeaders.push(<Rect key={`hbar-${pos}`} x={x + hInset} y={barY} width={cellSize - hInset * 2} height={barH} fill="#1f2937" />);
        const stemX = x + cellSize / 2 - stemW / 2;
        pdfRiggingHeaders.push(<Rect key={`hvc-${pos}`} x={stemX} y={stemTop} width={stemW} height={barY - stemTop} fill="#1f2937" />);
        const dotCx = x + cellSize / 2;
        pdfRiggingHeaders.push(<Path key={`hds-${pos}`} d={`M ${dotCx - dotR},${dotCY} a ${dotR},${dotR} 0 1,0 ${dotR * 2},0 a ${dotR},${dotR} 0 1,0 ${-dotR * 2},0`} fill="#f97316" />);
        pos += 1;
      }
    }
  }

  return (
    <Document>
      {/* Summary Page (portrait) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo ? (
            <Image src={logo} style={styles.logo} />
          ) : (
            <View style={styles.logo}>
              <Text style={{ fontSize: 12, textAlign: 'center' }}>AV-teknikk</Text>
            </View>
          )}
          <View style={styles.headerContent}>
            <Text style={styles.title}>LED Screen Configuration</Text>
            {projectName ? <Text style={{ fontSize: 13, textAlign: 'center', marginTop: 4, color: '#333' }}>{projectName}</Text> : null}
            {projectDate ? <Text style={{ fontSize: 10, textAlign: 'center', marginTop: 2, color: '#666' }}>{projectDate}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panel Information</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Model</Text>
              <Text style={styles.value}>{panel.name}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Manufacturer</Text>
              <Text style={styles.value}>{panel.manufacturer}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screen Configuration</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Panel Layout</Text>
              <Text style={styles.value}>{horizontalPanels} × {verticalPanels} panels</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Panels</Text>
              <Text style={styles.value}>{horizontalPanels * verticalPanels}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Size</Text>
              <Text style={styles.value}>
                {calculations.dimensions.width.toFixed(2)}m × {calculations.dimensions.height.toFixed(2)}m
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Resolution</Text>
              <Text style={styles.value}>
                {calculations.resolution.horizontal.toLocaleString()} × {calculations.resolution.vertical.toLocaleString()}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Pixels</Text>
              <Text style={styles.value}>{calculations.resolution.total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Requirements</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Weight</Text>
              <Text style={styles.value}>{calculations.weight.toFixed(1)} kg</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Power Consumption</Text>
              <Text style={styles.value}>{calculations.power.toFixed(0)} W</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Controllers Required</Text>
              <Text style={styles.value}>{calculations.controllers.needed}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Ports</Text>
              <Text style={styles.value}>{calculations.controllers.totalPorts}</Text>
            </View>
          </View>
          {processorSplitColumn !== undefined && (
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Processor 1 Columns</Text>
                <Text style={styles.value}>{processorSplitColumn} col × {verticalPanels} rows ({processorSplitColumn * verticalPanels} panels)</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Processor 2 Columns</Text>
                <Text style={styles.value}>{horizontalPanels - processorSplitColumn} col × {verticalPanels} rows ({(horizontalPanels - processorSplitColumn) * verticalPanels} panels)</Text>
              </View>
            </View>
          )}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Power Lines Required</Text>
              <Text style={styles.value}>{calculations.powerLines.needed}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Panels per Power Line</Text>
              <Text style={styles.value}>{calculations.powerLines.panelsPerLine} (max {calculations.powerLines.maxWattsPerLine}W)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rigging Information</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Single Headers</Text>
              <Text style={styles.value}>{calculations.rigging.singleHeaders}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Double Headers</Text>
              <Text style={styles.value}>{calculations.rigging.doubleHeaders}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Total Attachment Points</Text>
              <Text style={styles.value}>{calculations.rigging.totalPoints}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by AV Teknikk LED Panel Calculator • {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Visualization Page (landscape) */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Screen Visualization</Text>
        <Text style={{ fontSize: 10, marginBottom: 6 }}>Numbering Direction: {numberingDirection.toUpperCase()}</Text>
        <View style={{ position:'relative', width: gridWidth, height: pdfHeaderH + gridHeight + (processorSplitColumn !== undefined ? 36 : 24) }}>
          <Svg width={gridWidth} height={pdfHeaderH + gridHeight + (processorSplitColumn !== undefined ? 36 : 24)}>
            {/* Rigging headers */}
            {pdfRiggingHeaders}
            {/* Panels first so lines drawn later appear above */}
            {snake.map(p=> {
              const x = p.col * (cellSize + gap);
              const y = p.row * (cellSize + gap) + pdfHeaderH;
              return (
                <Rect key={`panel-${p.num}`} x={x} y={y} width={cellSize} height={cellSize} stroke="#444" strokeWidth={0.5} fill="#0f172a" />
              );
            })}
            {/* Data lines on top */}
            {groups.map((g,gi)=> {
              const meta = groupMeta[gi] || { processorIndex: 0, portInProcessor: gi + 1 };
              const color = lineColors[( meta.portInProcessor - 1) % lineColors.length];
              return (
                <React.Fragment key={`grp-${gi}`}>
                  <Path d={buildPath(g)} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {buildArrows(g,color)}
                </React.Fragment>
              );
            })}
            {/* Processor split line */}
            {processorSplitColumn !== undefined && (() => {
              const splitX = processorSplitColumn * (cellSize + gap) - gap / 2;
              return (
                <React.Fragment key="split-line">
                  <Rect x={splitX - 1} y={0} width={3} height={pdfHeaderH + gridHeight} fill="#7c3aed" />
                </React.Fragment>
              );
            })()}
            {/* Power lines — drawn at y+22 offset to stay below data routing lines */}
            {powerLines.map((pl, i) => {
              const pts = pl.panels.map(n => {
                const entry = snake.find(p => p.num === n);
                if (!entry) return null;
                return {
                  x: entry.col * (cellSize + gap) + cellSize / 2,
                  y: entry.row * (cellSize + gap) + pdfHeaderH + cellSize / 2 + (cellSize * 0.22)
                };
              }).filter((p): p is {x:number;y:number} => !!p);
              if (pts.length < 2) return null;
              const pathD = pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const groupNum = plGroupMap[i] ?? (i + 1);
              const midIdx = Math.floor((pts.length - 1) / 2);
              const mx = (pts[midIdx].x + pts[midIdx + 1].x) / 2;
              const my = (pts[midIdx].y + pts[midIdx + 1].y) / 2;
              return (
                <React.Fragment key={`pwrline-${i}`}>
                  <Path d={pathD} stroke="#facc15" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <Path d={pathD} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <Circle cx={mx} cy={my} r={5} fill="#1e293b" stroke="#facc15" strokeWidth={1.5} />
                  <Text style={{ position:'absolute', left: mx - 4, top: my - 4, fontSize: 5, fontWeight: 'bold', color: '#facc15', width: 8, textAlign: 'center' }}>{String(groupNum)}</Text>
                </React.Fragment>
              );
            })}
            {/* Legend color boxes */}
            {groups.map((_,i)=> {
              const meta = groupMeta[i] || { processorIndex: 0, portInProcessor: i + 1 };
              const isSplit = processorSplitColumn !== undefined;
              const xPos = isSplit ? 56 + (meta.portInProcessor - 1) * 40 : i * 55;
              const yPos = isSplit && meta.processorIndex === 1
                ? pdfHeaderH + gridHeight + 14
                : pdfHeaderH + gridHeight + 4;
              return (
                <Rect key={`leg-${i}`} x={xPos} y={yPos} width={10} height={10} fill={lineColors[(meta.portInProcessor - 1) % lineColors.length]} />
              );
            })}
          </Svg>
          {/* Text overlays for panel numbers & labels */}
          {snake.map(p=> {
            const x = p.col * (cellSize + gap);
            const y = p.row * (cellSize + gap) + pdfHeaderH;
            return (
              <Text key={`num-${p.num}`} style={{ position:'absolute', left: x, top: y, width: cellSize, height: cellSize, textAlign:'center', fontSize: Math.max(6, cellSize*0.18), color:'#ffffff', paddingTop: (cellSize/2)-4 }}>
                {p.num}
              </Text>
            );
          })}
          {groups.map((g,i)=> {
            const meta = groupMeta[i] || { processorIndex: 0, portInProcessor: i + 1 };
            const color = lineColors[(meta.portInProcessor - 1) % lineColors.length];
            const label = meta.processorIndex === 0
              ? `P${meta.portInProcessor} (${g[0].num}-${g[g.length-1].num})`
              : `Pr2-P${meta.portInProcessor} (${g[0].num}-${g[g.length-1].num})`;
            // For column-based directions always pin label to entry edge row
            const labelRow = numberingDirection === 'bottom'
              ? verticalPanels - 1
              : numberingDirection === 'top'
                ? 0
                : g[0].row;
            const labelTop = labelRow * (cellSize + gap) - 10 + pdfHeaderH;
            return (
              <Text key={`lbl-${i}`} style={{ position:'absolute', left: g[0].col*(cellSize+gap), top: labelTop, fontSize:7, color }}>
                {label}
              </Text>
            );
          })}
          {processorSplitColumn !== undefined && (() => {
            const splitX = processorSplitColumn * (cellSize + gap) - gap / 2;
            return (
              <>
                <Text key="split-lbl-1" style={{ position:'absolute', left: splitX / 2 - 20, top: pdfHeaderH + gridHeight + (processorSplitColumn !== undefined ? 24 : 12), fontSize: 8, fontWeight: 'bold', color: '#7c3aed' }}>◀ Processor 1</Text>
                <Text key="split-lbl-2" style={{ position:'absolute', left: splitX + (gridWidth - splitX) / 2 - 20, top: pdfHeaderH + gridHeight + (processorSplitColumn !== undefined ? 24 : 12), fontSize: 8, fontWeight: 'bold', color: '#7c3aed' }}>Processor 2 ▶</Text>
              </>
            );
          })()}
          {/* Legend labels */}
          {processorSplitColumn !== undefined && (
            <>
              <Text style={{ position:'absolute', left: 0, top: pdfHeaderH+gridHeight+3, fontSize: 7, fontWeight: 'bold', color: '#7c3aed' }}>Pr1:</Text>
              <Text style={{ position:'absolute', left: 0, top: pdfHeaderH+gridHeight+15, fontSize: 7, fontWeight: 'bold', color: '#7c3aed' }}>Pr2:</Text>
            </>
          )}
          {groups.map((_,i)=> {
            const meta = groupMeta[i] || { processorIndex: 0, portInProcessor: i + 1 };
            const isSplit = processorSplitColumn !== undefined;
            const xPos = isSplit ? 70 + (meta.portInProcessor - 1) * 40 : i * 55 + 14;
            const yPos = isSplit && meta.processorIndex === 1
              ? pdfHeaderH + gridHeight + 15
              : pdfHeaderH + gridHeight + 3;
            return (
              <Text key={`leglbl-${i}`} style={{ position:'absolute', left: xPos, top: yPos, fontSize: 7 }}>P{meta.portInProcessor}</Text>
            );
          })}
        </View>
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 9 }}>Lines show port grouping (snake order). Arrows indicate direction. Colored square = port color.</Text>
        </View>
      </Page>
    </Document>
  );
}