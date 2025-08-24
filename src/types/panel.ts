export interface HeaderConfig {
  single: {
    weight: number;
    points: number;
  };
  double: {
    weight: number;
    points: number;
  };
  attachmentType: 'shackle' | 'clamp';
}

export interface PowerConfig {
  maxWattsPerLine: number;
}

export interface Panel {
  id: string;
  name: string;
  manufacturer: string;
  width: number;
  height: number;
  pixelPitch: number;
  weight: number;
  power: number;
  headerConfig: HeaderConfig;
  powerConfig?: PowerConfig;
  flightCaseCapacity: number;
}