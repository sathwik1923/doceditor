const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

// Import y-websocket utilities
let setupWSConnection;
try {
  setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
} catch (error) {
  console.error('Error importing y-websocket:', error);
  console.log('Please install y-websocket: npm install y-websocket');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    websocket: 'Available',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Image upload endpoint
app.post('/upload-image', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (error) {
      console.error('Response error:', error);
      res.status(500).json({ error: 'Upload processing failed' });
    }
  });
});

// WebSocket server for Yjs collaboration
const wss = new WebSocket.Server({ 
  server,
  verifyClient: (info) => {
    return true;
  }
});

// Track connected clients
const connectedClients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = Date.now() + '-' + Math.random();
  connectedClients.set(clientId, ws);
  
  console.log(`🔌 New WebSocket connection (${clientId})`);
  console.log(`👥 Total connected clients: ${connectedClients.size}`);

  // Setup Yjs WebSocket connection
  try {
    setupWSConnection(ws, req, {
      docName: req.url?.slice(1) || 'default-doc',
      gc: true
    });
  } catch (error) {
    console.error('Error setting up Yjs connection:', error);
    ws.close(1011, 'Setup failed');
    return;
  }

  ws.on('close', (code, reason) => {
    connectedClients.delete(clientId);
    console.log(`🔌 WebSocket connection closed (${clientId}): ${code} ${reason}`);
    console.log(`👥 Total connected clients: ${connectedClients.size}`);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error (${clientId}):`, error);
    connectedClients.delete(clientId);
  });

  try {
    ws.send(JSON.stringify({
      type: 'connection-established',
      clientId: clientId,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending connection confirmation:', error);
  }
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// API endpoint to check server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    connections: connectedClients.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Collaborative Editor Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 File uploads: http://localhost:${PORT}/uploads/`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/api/status`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📄 Documents API: http://localhost:${PORT}/api/documents`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });
  
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
  });
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});