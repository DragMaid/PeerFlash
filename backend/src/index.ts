import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Client } from 'xrpl';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import flashcardRoutes from './routes/flashcards';
import credentialRoutes from './routes/credentials';
import ipfsRoutes from './routes/ipfs';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// XRPL Client setup
const xrplClient = new Client(process.env.XRPL_NODE_URL || 'wss://s.altnet.rippletest.net:51233');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/peerflash';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/ipfs', ipfsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to XRPL
async function connectXRPL(): Promise<void> {
  try {
    await xrplClient.connect();
    console.log('Connected to XRPL');
  } catch (error) {
    console.error('XRPL connection error:', error);
  }
}

connectXRPL();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing connections...');
  await xrplClient.disconnect();
  await mongoose.connection.close();
  process.exit(0);
}); 