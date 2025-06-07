import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult, ValidationChain } from 'express-validator';
import User, { IUser } from '../models/User.js';
import { Client, Wallet } from 'xrpl';

const router = express.Router();

// Initialize XRPL client
const xrplClient = new Client(process.env.XRPL_NODE_URL || 'wss://s.altnet.rippletest.net:51233');

interface UserPayload {
  user: {
    id: string;
  };
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  xrplAddress: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  xrplAddress: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Middleware to validate request
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Register new user
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('xrplAddress').trim().isLength({ min: 25 }).escape()
], async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password, xrplAddress } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create XRPL wallet
    const { wallet } = await xrplClient.fundWallet();
    
    // Create new user
    user = new User({
      username,
      email,
      password,
      xrplAddress: wallet.address,
      xrplSecret: wallet.seed
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload: UserPayload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
      (err: Error | null, token?: string) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            xrplAddress: user.xrplAddress
          } as UserResponse
        });
      }
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create JWT token
    const payload: UserPayload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
      (err: Error | null, token?: string) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            xrplAddress: user.xrplAddress
          } as UserResponse
        });
      }
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as UserPayload;
    const user = await User.findById(decoded.user.id).select('-password -xrplSecret');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

export default router; 