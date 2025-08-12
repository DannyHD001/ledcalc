import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, Path } from '@react-pdf/renderer';
import { Panel } from '../types/panel';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  logo: {
    width: 120,
    height: 40
  },
  title: {
    fontSize: 24,
    marginBottom: 20
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
}

export function ResultsPDF({ panel, calculations, horizontalPanels, verticalPanels, logo, numberingDirection = 'left' }: ResultsPDFProps) {
  // --- Visualization helpers (simplified mirror of on-screen logic) ---
  const getPanelNumber = (row: number, col: number) => {
    switch (numberingDirection) {
      case 'left':
        return row % 2 === 0 ? row * horizontalPanels + col + 1 : row * horizontalPanels + (horizontalPanels - col);
      case 'right':
        return row % 2 === 0 ? row * horizontalPanels + (horizontalPanels - col) : row * horizontalPanels + col + 1;
      case 'top':
        return col % 2 === 0 ? col * verticalPanels + row + 1 : (col + 1) * verticalPanels - row;
      case 'bottom':
        return col % 2 === 0 ? (col + 1) * verticalPanels - row : col * verticalPanels + row + 1;
      default:
        return row * horizontalPanels + col + 1;
    }
  };

  const pixelsPerPanel = (panel.width / panel.pixelPitch) * (panel.height / panel.pixelPitch);
  const pixelsPerPort = panel.portConfig?.pixelsPerPort || 500000;
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
  const cellSize = Math.min(
    (PAGE_INNER_WIDTH - (horizontalPanels - 1) * gap) / horizontalPanels,
    (PAGE_INNER_HEIGHT - (verticalPanels - 1) * gap) / verticalPanels
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
      const y = r * (cellSize + gap) + cellSize/2;
      snake.push({ num:n,row:r,col:c,x,y,port:getPortIndex(n)});
    }
  }
  snake.sort((a,b)=>a.num-b.num);
  const isBoundary = (row:number,col:number) => {
    switch (numberingDirection) {
      case 'left': return (row % 2 === 0 && col === horizontalPanels - 1) || (row % 2 === 1 && col === 0);
      case 'right': return (row % 2 === 0 && col === 0) || (row % 2 === 1 && col === horizontalPanels - 1);
      case 'top': return (col % 2 === 0 && row === verticalPanels - 1) || (col % 2 === 1 && row === 0);
      case 'bottom': return (col % 2 === 0 && row === 0) || (col % 2 === 1 && row === verticalPanels - 1);
      default: return false;
    }
  };
  const groups: PanelNode[][] = [];
  let i = 0; const capacity = panelsPerLine; const maxPorts = panel.portConfig?.maxPorts || 8;
  while (i < snake.length && groups.length < maxPorts) {
    const start = i; let lastBoundaryEnd = -1; let count = 0;
    while (i < snake.length && count < capacity) {
      const p = snake[i]; count++; if (isBoundary(p.row,p.col)) { lastBoundaryEnd = i+1; if (count===capacity) { i++; break; } }
      i++;
    }
    const end = lastBoundaryEnd !== -1 ? lastBoundaryEnd : i; if (end <= start) break;
    groups.push(snake.slice(start,end)); i = end;
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
  // Panels for drawing legend mapping

  return (
    <Document>
      {/* Summary Page (portrait) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <Text style={styles.title}>LED Screen Configuration</Text>
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
        <View style={{ position:'relative', width: gridWidth, height: gridHeight + 24 }}>
          <Svg width={gridWidth} height={gridHeight + 24}>
            {/* Panels first so lines drawn later appear above */}
            {snake.map(p=> {
              const x = p.col * (cellSize + gap);
              const y = p.row * (cellSize + gap);
              const color = lineColors[p.port % lineColors.length];
              return (
                <React.Fragment key={`panel-${p.num}`}>
                  <Rect x={x} y={y} width={cellSize} height={cellSize} stroke="#444" strokeWidth={0.5} fill="#0f172a" />
                  <Rect x={x+cellSize-6} y={y+cellSize-6} width={6} height={6} fill={color} />
                </React.Fragment>
              );
            })}
            {/* Data lines on top */}
            {groups.map((g,gi)=> {
              const color = lineColors[gi % lineColors.length];
              return (
                <React.Fragment key={`grp-${gi}`}>
                  <Path d={buildPath(g)} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {buildArrows(g,color)}
                </React.Fragment>
              );
            })}
            {/* Legend color boxes */}
            {groups.map((_,i)=> (
              <Rect key={`leg-${i}`} x={i*50} y={gridHeight+4} width={10} height={10} fill={lineColors[i % lineColors.length]} />
            ))}
          </Svg>
          {/* Text overlays for panel numbers & labels */}
          {snake.map(p=> {
            const x = p.col * (cellSize + gap);
            const y = p.row * (cellSize + gap);
            return (
              <Text key={`num-${p.num}`} style={{ position:'absolute', left: x, top: y, width: cellSize, height: cellSize, textAlign:'center', fontSize: Math.max(6, cellSize*0.18), color:'#ffffff', paddingTop: (cellSize/2)-4 }}>
                {p.num}
              </Text>
            );
          })}
          {groups.map((g,i)=> (
            <Text key={`lbl-${i}`} style={{ position:'absolute', left: g[0].col*(cellSize+gap), top: g[0].row*(cellSize+gap)-10, fontSize:8, color: lineColors[i % lineColors.length] }}>
              P{i+1} ({g[0].num}-{g[g.length-1].num})
            </Text>
          ))}
          {groups.map((_,i)=> (
            <Text key={`leglbl-${i}`} style={{ position:'absolute', left: i*50+14, top: gridHeight+3, fontSize:8 }}>P{i+1}</Text>
          ))}
        </View>
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 9 }}>Lines show port grouping (snake order). Arrows indicate direction. Colored square = port color.</Text>
        </View>
      </Page>
    </Document>
  );
}