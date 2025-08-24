import { Panel } from '../types/panel';
import { Controller } from '../types/controller';
import { databaseService } from './database';

// Default panels data
const defaultPanels: Omit<Panel, 'id'>[] = [
  {
    name: 'P2.6 Indoor',
    manufacturer: 'Nova Star',
    width: 250,
    height: 250,
    pixelPitch: 2.6,
    weight: 6.5,
    power: 45,
    controllerOutputCapacity: 9216,
    flightCaseCapacity: 12,
    headerConfig: {
      single: { weight: 2.5, points: 4 },
      double: { weight: 5.0, points: 8 },
      attachmentType: 'shackle'
    },
    powerConfig: { maxWattsPerLine: 800 }
  },
  {
    name: 'P3.9 Indoor',
    manufacturer: 'Nova Star',
    width: 500,
    height: 500,
    pixelPitch: 3.9,
    weight: 12.0,
    power: 85,
    controllerOutputCapacity: 16384,
    flightCaseCapacity: 8,
    headerConfig: {
      single: { weight: 3.5, points: 4 },
      double: { weight: 7.0, points: 8 },
      attachmentType: 'shackle'
    },
    powerConfig: { maxWattsPerLine: 1200 }
  },
  {
    name: 'P4.8 Outdoor',
    manufacturer: 'Leyard',
    width: 960,
    height: 960,
    pixelPitch: 4.8,
    weight: 28.0,
    power: 180,
    controllerOutputCapacity: 40000,
    flightCaseCapacity: 6,
    headerConfig: {
      single: { weight: 5.0, points: 6 },
      double: { weight: 10.0, points: 12 },
      attachmentType: 'clamp'
    },
    powerConfig: { maxWattsPerLine: 2000 }
  }
];

// Default controllers data
const defaultControllers: Omit<Controller, 'id'>[] = [
  {
    name: 'VX4S',
    manufacturer: 'Nova Star',
    ports: 4,
    pixelsPerPort: 650000,
    outputType: 'Ethernet',
    maxPixelsTotal: 2600000,
    description: 'Professional LED processor for large-scale displays'
  },
  {
    name: 'VX16S',
    manufacturer: 'Nova Star',
    ports: 16,
    pixelsPerPort: 650000,
    outputType: 'Ethernet',
    maxPixelsTotal: 10400000,
    description: 'High-capacity LED processor for stadium and arena displays'
  },
  {
    name: 'Colorlight 5A',
    manufacturer: 'Colorlight',
    ports: 8,
    pixelsPerPort: 512000,
    outputType: 'Ethernet',
    maxPixelsTotal: 4096000,
    description: 'Versatile LED controller for medium to large displays'
  },
  {
    name: 'LinsN RV908',
    manufacturer: 'LinsN',
    ports: 12,
    pixelsPerPort: 256000,
    outputType: 'HUB75',
    maxPixelsTotal: 3072000,
    description: 'Reliable LED receiving card for modular installations'
  }
];

export class DataMigrationService {
  async migrateDefaultData(): Promise<void> {
    try {
      console.log('Starting data migration...');

      // Migrate panels
      console.log('Migrating panels...');
      for (const panel of defaultPanels) {
        try {
          await databaseService.createPanel(panel);
          console.log(`✅ Created panel: ${panel.manufacturer} ${panel.name}`);
        } catch (error) {
          console.error(`❌ Failed to create panel ${panel.name}:`, error);
        }
      }

      // Migrate controllers
      console.log('Migrating controllers...');
      for (const controller of defaultControllers) {
        try {
          await databaseService.createController(controller);
          console.log(`✅ Created controller: ${controller.manufacturer} ${controller.name}`);
        } catch (error) {
          console.error(`❌ Failed to create controller ${controller.name}:`, error);
        }
      }

      console.log('✅ Data migration completed successfully!');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      console.log('Clearing all data...');

      // Get and delete all panels
      const panels = await databaseService.getPanels();
      for (const panel of panels) {
        await databaseService.deletePanel(panel.id);
        console.log(`🗑️ Deleted panel: ${panel.name}`);
      }

      // Get and delete all controllers
      const controllers = await databaseService.getControllers();
      for (const controller of controllers) {
        await databaseService.deleteController(controller.id);
        console.log(`🗑️ Deleted controller: ${controller.name}`);
      }

      console.log('✅ All data cleared successfully!');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }

  async checkDataExists(): Promise<{ panels: number; controllers: number }> {
    try {
      const panels = await databaseService.getPanels();
      const controllers = await databaseService.getControllers();
      
      return {
        panels: panels.length,
        controllers: controllers.length
      };
    } catch (error) {
      console.error('Failed to check existing data:', error);
      return { panels: 0, controllers: 0 };
    }
  }
}

export const dataMigrationService = new DataMigrationService();
