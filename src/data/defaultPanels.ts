import { Panel } from '../types/panel';

export const DEFAULT_PANELS: Panel[] = [
  {
    id: 'bp2v2',
    name: 'ROE Black Pearl BP2V2',
    manufacturer: 'ROE Visual',
    width: 500,
    height: 1000,
    pixelPitch: 2.8,
    weight: 11.8,
    power: 180,
    headerConfig: {
      single: {
        weight: 0.8,
        points: 1
      },
      double: {
        weight: 1.2,
        points: 2
      },
      attachmentType: 'shackle'
    },
    portConfig: {
      pixelsPerPort: 65536,
      maxPorts: 16
    },
    powerConfig: {
      maxWattsPerLine: 3600
    },
    controllerOutputCapacity: 655360,
    flightCaseCapacity: 8
  },
  {
    id: 'pl2.5pro',
    name: 'Absen PL2.5 Pro',
    manufacturer: 'Absen',
    width: 500,
    height: 500,
    pixelPitch: 2.5,
    weight: 6.2,
    power: 160,
    headerConfig: {
      single: {
        weight: 0.6,
        points: 1
      },
      double: {
        weight: 1.0,
        points: 2
      },
      attachmentType: 'shackle'
    },
    portConfig: {
      pixelsPerPort: 65536,
      maxPorts: 16
    },
    powerConfig: {
      maxWattsPerLine: 3600
    },
    controllerOutputCapacity: 655360,
    flightCaseCapacity: 12
  },
  {
    id: 'cb8',
    name: 'ROE Carbon CB8',
    manufacturer: 'ROE Visual',
    width: 500,
    height: 1000,
    pixelPitch: 8.0,
    weight: 28,
    power: 750,
    headerConfig: {
      single: {
        weight: 1.2,
        points: 1
      },
      double: {
        weight: 1.8,
        points: 2
      },
      attachmentType: 'shackle'
    },
    portConfig: {
      pixelsPerPort: 65536,
      maxPorts: 16
    },
    powerConfig: {
      maxWattsPerLine: 3600
    },
    controllerOutputCapacity: 655360,
    flightCaseCapacity: 4
  },
  {
    id: 'face5hc',
    name: 'Martin Face 5 HC',
    manufacturer: 'Martin Professional',
    width: 400,
    height: 400,
    pixelPitch: 5.0,
    weight: 7.5,
    power: 140,
    headerConfig: {
      single: {
        weight: 0.7,
        points: 1
      },
      double: {
        weight: 1.1,
        points: 2
      },
      attachmentType: 'shackle'
    },
    portConfig: {
      pixelsPerPort: 65536,
      maxPorts: 16
    },
    powerConfig: {
      maxWattsPerLine: 3600
    },
    controllerOutputCapacity: 655360,
    flightCaseCapacity: 10
  }
];