import mysql from 'mysql2/promise';
import { Panel } from '../types/panel';

const dbConfig = {
  host: 'avteknikk.com',
  user: 'avteknikk_comledcalc',
  password: '@CalcLED24',
  database: 'avteknikk_comledcalc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool: mysql.Pool | null = null;

export async function initializePool() {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      console.log('Database pool initialized successfully');
      
      // Test the connection
      const connection = await pool.getConnection();
      await connection.ping();
      console.log('Successfully connected to database');
      connection.release();
    }
    return pool;
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
    throw error;
  }
}

export async function executeQuery<T>(
  query: string, 
  params?: any[]
): Promise<T> {
  if (!pool) {
    await initializePool();
  }

  try {
    const [results] = await pool!.execute(query, params);
    return results as T;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS panels (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        width INT NOT NULL,
        height INT NOT NULL,
        pixelPitch DECIMAL(10,2) NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        power INT NOT NULL,
        headerConfig JSON NOT NULL,
        controllerOutputCapacity INT NOT NULL,
        flightCaseCapacity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getAllPanels(): Promise<Panel[]> {
  try {
    const panels = await executeQuery<any[]>('SELECT * FROM panels');
    return panels.map(row => ({
      ...row,
      headerConfig: typeof row.headerConfig === 'string' 
        ? JSON.parse(row.headerConfig)
        : row.headerConfig
    }));
  } catch (error) {
    console.error('Failed to fetch panels:', error);
    throw error;
  }
}

export async function addPanel(panel: Panel): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO panels (
        id, name, manufacturer, width, height, pixelPitch, weight, power,
        headerConfig, controllerOutputCapacity, flightCaseCapacity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        panel.id,
        panel.name,
        panel.manufacturer || '',
        panel.width,
        panel.height,
        panel.pixelPitch,
        panel.weight,
        panel.power,
        JSON.stringify(panel.headerConfig),
        panel.controllerOutputCapacity,
        panel.flightCaseCapacity
      ]
    );
  } catch (error) {
    console.error('Failed to add panel:', error);
    throw error;
  }
}

export async function updatePanel(panel: Panel): Promise<void> {
  try {
    await executeQuery(
      `UPDATE panels SET
        name = ?,
        manufacturer = ?,
        width = ?,
        height = ?,
        pixelPitch = ?,
        weight = ?,
        power = ?,
        headerConfig = ?,
        controllerOutputCapacity = ?,
        flightCaseCapacity = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        panel.name,
        panel.manufacturer || '',
        panel.width,
        panel.height,
        panel.pixelPitch,
        panel.weight,
        panel.power,
        JSON.stringify(panel.headerConfig),
        panel.controllerOutputCapacity,
        panel.flightCaseCapacity,
        panel.id
      ]
    );
  } catch (error) {
    console.error('Failed to update panel:', error);
    throw error;
  }
}

export async function deletePanel(id: string): Promise<void> {
  try {
    await executeQuery('DELETE FROM panels WHERE id = ?', [id]);
  } catch (error) {
    console.error('Failed to delete panel:', error);
    throw error;
  }
}

// Initialize the database when the module is imported
initializeDatabase().catch(console.error);