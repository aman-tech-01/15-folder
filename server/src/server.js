import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './sockets/socketHandler.js';
import { initSensorSimulator } from './services/sensorSimulator.js';
import { seedDatabase } from './seed/seed.js';
import { User } from './models/User.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);
registerSocketHandlers(io);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Smart Campus Command Core', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Central error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Empty database detected. Running automatic seeder...');
      await seedDatabase();
    }

    // Start IoT sensor telemetry simulation
    initSensorSimulator(io);

    server.listen(PORT, () => {
      console.log(`[SmartCampus Core] Server running on http://localhost:${PORT}`);
      console.log(`[SmartCampus Core] Realtime Socket.IO and REST APIs active.`);
    });
  } catch (err) {
    console.error('[Fatal] Server failed to start:', err);
    process.exit(1);
  }
};

startServer();
