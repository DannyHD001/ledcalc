import { Controller } from '../types/controller';

export const defaultControllers: Controller[] = [
  {
    id: 'novastar-mctrl4k',
    name: 'MCTRL4K',
    manufacturer: 'NovaStar',
    ports: 4,
    pixelsPerPort: 650000,
    maxPixelsTotal: 2600000,
    outputType: 'SFP',
    description: '4K LED controller with 4 SFP outputs, supporting up to 2.6M pixels total'
  },
  {
    id: 'novastar-mctrl660',
    name: 'MCTRL660',
    manufacturer: 'NovaStar',
    ports: 8,
    pixelsPerPort: 650000,
    maxPixelsTotal: 2600000,
    outputType: 'RJ45',
    description: '8-port LED controller with RJ45 outputs, supporting up to 2.6M pixels total'
  },
  {
    id: 'colorlight-x16',
    name: 'X16',
    manufacturer: 'Colorlight',
    ports: 16,
    pixelsPerPort: 65536,
    maxPixelsTotal: 1048576,
    outputType: 'RJ45',
    description: '16-port LED controller with RJ45 outputs, supporting up to 1M pixels total'
  },
  {
    id: 'colorlight-x8',
    name: 'X8',
    manufacturer: 'Colorlight',
    ports: 8,
    pixelsPerPort: 65536,
    maxPixelsTotal: 524288,
    outputType: 'RJ45',
    description: '8-port LED controller with RJ45 outputs, supporting up to 512K pixels total'
  },
  {
    id: 'brompton-tessera-sx40',
    name: 'Tessera SX40',
    manufacturer: 'Brompton Technology',
    ports: 4,
    pixelsPerPort: 524288,
    maxPixelsTotal: 2097152,
    outputType: 'SFP',
    description: '4K Tessera processor with 4 SFP outputs, supporting up to 2M pixels total'
  },
  {
    id: 'linsn-ts852d',
    name: 'TS852D',
    manufacturer: 'Linsn',
    ports: 8,
    pixelsPerPort: 655360,
    maxPixelsTotal: 1310720,
    outputType: 'RJ45',
    description: '8-port LED controller with RJ45 outputs, supporting up to 1.3M pixels total'
  }
];
