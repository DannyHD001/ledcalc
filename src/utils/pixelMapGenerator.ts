import { Panel } from '../types/panel';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export interface PixelMapOptions {
  panel: Panel;
  horizontalPanels: number;
  verticalPanels: number;
  numberingDirection: 'left' | 'right' | 'top' | 'bottom';
  /** Single fill color for all panels, e.g. '#E6194B'. Defaults to red. */
  panelColor?: string;
  /** URL / data-URL of the logo to embed in the top-left corner */
  logoUrl?: string;
}

export function generatePixelMap(options: PixelMapOptions): HTMLCanvasElement {
  const { panel, horizontalPanels, verticalPanels, panelColor = '#E6194B', logoUrl } = options;

  // Pixel resolution per panel
  const pixelsPerPanelW = Math.round(panel.width / panel.pixelPitch);
  const pixelsPerPanelH = Math.round(panel.height / panel.pixelPitch);

  const canvasW = horizontalPanels * pixelsPerPanelW;
  const canvasH = verticalPanels * pixelsPerPanelH;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  const [r, g, b] = hexToRgb(panelColor);
  const darkerColor = `rgba(${Math.max(0, r - 60)},${Math.max(0, g - 60)},${Math.max(0, b - 60)},0.85)`;

  // ── Draw each panel with single color ───────────────────────────────────────
  for (let row = 0; row < verticalPanels; row++) {
    for (let col = 0; col < horizontalPanels; col++) {
      const x = col * pixelsPerPanelW;
      const y = row * pixelsPerPanelH;

      // Fill panel background
      ctx.fillStyle = panelColor;
      ctx.fillRect(x, y, pixelsPerPanelW, pixelsPerPanelH);

      // Diagonal X stripes in darker shade
      const stripeWidth = Math.max(1, Math.round(Math.min(pixelsPerPanelW, pixelsPerPanelH) * 0.07));
      ctx.save();
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = stripeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + pixelsPerPanelW, y + pixelsPerPanelH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + pixelsPerPanelW, y);
      ctx.lineTo(x, y + pixelsPerPanelH);
      ctx.stroke();
      ctx.restore();

      // Panel border
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1, Math.round(Math.min(pixelsPerPanelW, pixelsPerPanelH) * 0.025));
      ctx.strokeRect(x + 0.5, y + 0.5, pixelsPerPanelW - 1, pixelsPerPanelH - 1);
    }
  }

  // ── Central badge ────────────────────────────────────────────────────────────
  const dimensionText = `${canvasW} x ${canvasH} px`;

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

  // ── Logo (top-left corner) ───────────────────────────────────────────────────
  if (logoUrl) {
    const img = new Image();
    img.src = logoUrl;
    // Draw synchronously if already loaded (data-URLs load instantly)
    const logoH = Math.round(Math.min(canvasH * 0.12, 80));
    const logoW = Math.round(logoH * 3.5); // approximate aspect ratio
    const pad = Math.round(logoH * 0.3);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, pad, pad, logoW, logoH);
    ctx.restore();
  }

  return canvas;
}

export function downloadPixelMap(options: PixelMapOptions): void {
  if (options.logoUrl) {
    // Must wait for the logo image to load before drawing
    const img = new Image();
    img.onload = () => {
      const canvas = generatePixelMap(options);
      // Re-draw logo now that it is loaded
      const ctx = canvas.getContext('2d')!;
      const logoH = Math.round(Math.min(canvas.height * 0.12, 80));
      const logoW = Math.round(logoH * 3.5);
      const pad = Math.round(logoH * 0.3);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, pad, pad, logoW, logoH);
      ctx.restore();
      triggerDownload(canvas, options);
    };
    img.src = options.logoUrl;
  } else {
    triggerDownload(generatePixelMap(options), options);
  }
}

function triggerDownload(canvas: HTMLCanvasElement, options: PixelMapOptions): void {
  const link = document.createElement('a');
  link.download = `pixelmap-${options.horizontalPanels}x${options.verticalPanels}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
