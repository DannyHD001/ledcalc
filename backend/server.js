const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
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

let pool = null;

// Initialize database connection
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Database pool initialized successfully');
    
    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    console.log('Successfully connected to database');
    connection.release();

    // Create tables if they don't exist
    await createTables();
    await populateDefaultControllers();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function createTables() {
  try {
    await pool.execute(`
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

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS controllers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        ports INT NOT NULL,
        pixelsPerPort INT NOT NULL,
        maxPixelsTotal INT,
        outputType VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
}

async function populateDefaultControllers() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM controllers');
    if (rows[0].count === 0) {
      console.log('Populating default controllers...');
      
      const defaultControllers = [
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

      for (const controller of defaultControllers) {
        await pool.execute(
          `INSERT INTO controllers (id, name, manufacturer, ports, pixelsPerPort, maxPixelsTotal, outputType, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            controller.id,
            controller.name,
            controller.manufacturer,
            controller.ports,
            controller.pixelsPerPort,
            controller.maxPixelsTotal,
            controller.outputType,
            controller.description
          ]
        );
      }
      console.log('Default controllers populated successfully');
    }
  } catch (error) {
    console.error('Failed to populate default controllers:', error);
  }
}

// Panel routes
app.get('/api/panels', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM panels ORDER BY manufacturer, name');
    const panels = rows.map(row => ({
      ...row,
      headerConfig: typeof row.headerConfig === 'string' 
        ? JSON.parse(row.headerConfig)
        : row.headerConfig
    }));
    res.json(panels);
  } catch (error) {
    console.error('Error fetching panels:', error);
    res.status(500).json({ error: 'Failed to fetch panels' });
  }
});

app.post('/api/panels', async (req, res) => {
  try {
    const panel = req.body;
    await pool.execute(
      `INSERT INTO panels (id, name, manufacturer, width, height, pixelPitch, weight, power,
       headerConfig, controllerOutputCapacity, flightCaseCapacity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding panel:', error);
    res.status(500).json({ error: 'Failed to add panel' });
  }
});

app.put('/api/panels/:id', async (req, res) => {
  try {
    const panel = req.body;
    await pool.execute(
      `UPDATE panels SET name = ?, manufacturer = ?, width = ?, height = ?, pixelPitch = ?,
       weight = ?, power = ?, headerConfig = ?, controllerOutputCapacity = ?, 
       flightCaseCapacity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
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
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating panel:', error);
    res.status(500).json({ error: 'Failed to update panel' });
  }
});

app.delete('/api/panels/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM panels WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting panel:', error);
    res.status(500).json({ error: 'Failed to delete panel' });
  }
});

// Controller routes
app.get('/api/controllers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM controllers ORDER BY manufacturer, name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching controllers:', error);
    res.status(500).json({ error: 'Failed to fetch controllers' });
  }
});

app.post('/api/controllers', async (req, res) => {
  try {
    const controller = req.body;
    await pool.execute(
      `INSERT INTO controllers (id, name, manufacturer, ports, pixelsPerPort, maxPixelsTotal, outputType, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        controller.id,
        controller.name,
        controller.manufacturer,
        controller.ports,
        controller.pixelsPerPort,
        controller.maxPixelsTotal || null,
        controller.outputType,
        controller.description || null
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding controller:', error);
    res.status(500).json({ error: 'Failed to add controller' });
  }
});

app.put('/api/controllers/:id', async (req, res) => {
  try {
    const controller = req.body;
    await pool.execute(
      `UPDATE controllers SET name = ?, manufacturer = ?, ports = ?, pixelsPerPort = ?,
       maxPixelsTotal = ?, outputType = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        controller.name,
        controller.manufacturer,
        controller.ports,
        controller.pixelsPerPort,
        controller.maxPixelsTotal || null,
        controller.outputType,
        controller.description || null,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating controller:', error);
    res.status(500).json({ error: 'Failed to update controller' });
  }
});

app.delete('/api/controllers/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM controllers WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting controller:', error);
    res.status(500).json({ error: 'Failed to delete controller' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
