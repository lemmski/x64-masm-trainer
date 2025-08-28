import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { initializeDatabase } from './database';
import { seedDatabase } from './seedData';
import lessonRoutes from './routes/lessons';
import exerciseRoutes from './routes/exercises';
import userRoutes from './routes/users';
import assemblerRoutes from './routes/assembler';
import testingRoutes from './routes/testing';
import { setupWebSocket } from './websocket';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assembler', assemblerRoutes);
app.use('/api/testing', testingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocketServer({ server });
setupWebSocket(wss);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`🚀 x64 MASM Trainer server running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
