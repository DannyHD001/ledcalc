export interface Controller {
  id: string;
  name: string;
  manufacturer: string;
  ports: number;
  pixelsPerPort: number;
  maxPixelsTotal?: number;
  outputType: string; // e.g., 'RJ45', 'SFP', 'Custom'
  description?: string;
}
