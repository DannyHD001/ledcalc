import Database from 'better-sqlite3';
import { Panel } from '../types/panel';
import { DEFAULT_PANELS } from '../data/defaultPanels';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(':memory:');

    db.exec(`
      CREATE TABLE IF NOT EXISTS panels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        pixelPitch REAL NOT NULL,
        weight REAL NOT NULL,
        power INTEGER NOT NULL,
        headerConfig TEXT NOT NULL,
        controllerOutputCapacity INTEGER NOT NULL,
        flightCaseCapacity INTEGER NOT NULL
      )
    `);

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO panels (
        id, name, manufacturer, width, height, pixelPitch, weight, power,
        headerConfig, controllerOutputCapacity, flightCaseCapacity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert default panels
    for (const panel of DEFAULT_PANELS) {
      insertStmt.run(
        panel.id,
        panel.name,
        panel.manufacturer,
        panel.width,
        panel.height,
        panel.pixelPitch,
        panel.weight,
        panel.power,
        JSON.stringify(panel.headerConfig),
        panel.controllerOutputCapacity,
        panel.flightCaseCapacity
      );
    }
  }
  return db;
}

export function getAllPanels(): Panel[] {
  const db = getDb();
  const panels = db.prepare('SELECT * FROM panels').all();
  return panels.map(panel => ({
    ...panel,
    headerConfig: JSON.parse(panel.headerConfig as string)
  }));
}

export function addPanel(panel: Panel): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO panels (
      id, name, manufacturer, width, height, pixelPitch, weight, power,
      headerConfig, controllerOutputCapacity, flightCaseCapacity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    panel.id,
    panel.name,
    panel.manufacturer,
    panel.width,
    panel.height,
    panel.pixelPitch,
    panel.weight,
    panel.power,
    JSON.stringify(panel.headerConfig),
    panel.controllerOutputCapacity,
    panel.flightCaseCapacity
  );
}

export function deletePanel(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM panels WHERE id = ?').run(id);
}

// Clean up database connection when the application exits
process.on('exit', () => {
  if (db) {
    db.close();
  }
});