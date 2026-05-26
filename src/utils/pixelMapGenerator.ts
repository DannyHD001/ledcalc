import { Panel } from '../types/panel';

// Same high-contrast palette used in ScreenVisualization and PDF
const PORT_COLORS = [
  '#E6194B', '#3CB44B', '#0082C8', '#F58230', '#911EB4',
  '#46F0F0', '#F032E6', '#D2F53C', '#FABEBE', '#008080',
  '#E6BEFF', '#AA6E28', '#FFE119', '#800000', '#82B6E9',
  '#9A6324', '#A9A9A9', '#FFFFFF', '#000000',
];

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** Proper version with verticalPanels captured */
function getPanelPortIndex(
  col: number,
  row: number,
  horizontalPanels: number,
  verticalPanels: number,
  panelsPerPort: number,
  numberingDirection: 'left' | 'right' | 'top' | 'bottom'
): number {
  let linearIndex: number;

  if (numberingDirection === 'left' || numberingDirection === 'right') {
    const isEvenRow = row % 2 === 0;
    const colIndex = numberingDirection === 'left'
      ? (isEvenRow ? col : horizontalPanels - 1 - col)
      : (isEvenRow ? horizontalPanels - 1 - col : col);
    linearIndex = row * horizontalPanels + colIndex;
  } else {
    const isEvenCol = col % 2 === 0;
    const rowIndex = numberingDirection === 'top'
      ? (isEvenCol ? row : verticalPanels - 1 - row)
      : (isEvenCol ? verticalPanels - 1 - row : row);
    linearIndex = col * verticalPanels + rowIndex;
  }

  return Math.floor(linearIndex / panelsPerPort);
}

export interface PixelMapOptions {
  panel: Panel;
  horizontalPanels: number;
  verticalPanels: number;
  numberingDirection: 'left' | 'right' | 'top' | 'bottom';
}

export function generatePixelMap(options: PixelMapOptions): HTMLCanvasElement {
  const { panel, horizontalPanels, verticalPanels, numberingDirection } = options;

  // Pixel resolution per panel
  const pixelsPerPanelW = Math.round(panel.width / panel.pixelPitch);
  const pixelsPerPanelH = Math.round(panel.height / panel.pixelPitch);

  const canvasW = horizontalPanels * pixelsPerPanelW;
  const canvasH = verticalPanels * pixelsPerPanelH;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  // Port grouping
  const pixelsPerPanel = pixelsPerPanelW * pixelsPerPanelH;
  const pixelsPerPort = panel.portConfig?.pixelsPerPort || pixelsPerPanel;
  const panelsPerPort = Math.max(1, Math.floor(pixelsPerPort / pixelsPerPanel));

  // ── Draw each panel ──────────────────────────────────────────────────────────
  for (let row = 0; row < verticalPanels; row++) {
    for (let col = 0; col < horizontalPanels; col++) {
      const portIdx = getPanelPortIndex(col, row, horizontalPanels, verticalPanels, panelsPerPort, numberingDirection);
      const baseColor = PORT_COLORS[portIdx % PORT_COLORS.length];
      const [r, g, b] = hexToRgb(baseColor);

      const x = col * pixelsPerPanelW;
      const y = row * pixelsPerPanelH;

      // Fill panel background
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, pixelsPerPanelW, pixelsPerPanelH);

      // Slightly darker shade for the X diagonal stripes
      const darkerColor = `rgba(${Math.max(0, r - 60)},${Math.max(0, g - 60)},${Math.max(0, b - 60)},0.85)`;
      const stripeWidth = Math.max(1, Math.round(Math.min(pixelsPerPanelW, pixelsPerPanelH) * 0.07));

      ctx.save();
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = stripeWidth;
      ctx.lineCap = 'round';

      // Diagonal \ 
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + pixelsPerPanelW, y + pixelsPerPanelH);
      ctx.stroke();

      // Diagonal /
      ctx.beginPath();
      ctx.moveTo(x + pixelsPerPanelW, y);
      ctx.lineTo(x, y + pixelsPerPanelH);
      ctx.stroke();

      ctx.restore();

      // Panel border (bright line)
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1, Math.round(Math.min(pixelsPerPanelW, pixelsPerPanelH) * 0.025));
      ctx.strokeRect(x + 0.5, y + 0.5, pixelsPerPanelW - 1, pixelsPerPanelH - 1);
    }
  }

  // ── Central badge ────────────────────────────────────────────────────────────
  const screenWidthMm = horizontalPanels * panel.width;
  const screenHeightMm = verticalPanels * panel.height;
  const dimensionText = `W ${screenWidthMm} X H ${screenHeightMm}`;

  const badgeCX = canvasW / 2;
  const badgeCY = canvasH / 2;
  const badgeR = Math.round(Math.min(canvasW, canvasH) * 0.18);
  const fontSize = Math.max(8, Math.round(badgeR * 0.22));
  const smallFontSize = Math.max(6, Math.round(badgeR * 0.17));

  // Dashed circle behind badge
  ctx.save();
  ctx.setLineDash([Math.max(2, badgeR * 0.1), Math.max(2, badgeR * 0.08)]);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = Math.max(1, Math.round(badgeR * 0.04));
  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, badgeR * 1.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Hexagon badge shape
  ctx.save();
  const hexR = badgeR * 0.88;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = badgeCX + hexR * Math.cos(angle);
    const hy = badgeCY + hexR * Math.sin(angle);
    i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(20,20,20,0.88)';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, Math.round(hexR * 0.04));
  ctx.stroke();
  ctx.restore();

  // "- LEDSCREEN -" top label
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('- LEDSCREEN -', badgeCX, badgeCY - fontSize * 0.55);

  // White separator line
  const lineHalfW = hexR * 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(badgeCX - lineHalfW, badgeCY - fontSize * 0.05, lineHalfW * 2, Math.max(1, Math.round(fontSize * 0.08)));

  // Dimension text bottom
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${smallFontSize}px sans-serif`;
  ctx.fillText(dimensionText, badgeCX, badgeCY + fontSize * 0.65);
  ctx.restore();

  return canvas;
}

export function downloadPixelMap(options: PixelMapOptions): void {
  const canvas = generatePixelMap(options);
  const link = document.createElement('a');
  link.download = `pixelmap-${options.horizontalPanels}x${options.verticalPanels}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
