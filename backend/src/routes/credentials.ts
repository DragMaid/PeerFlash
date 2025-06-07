import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { uploadToIPFS, getFromIPFS } from '../services/ipfs';
import User, { IUser, Credential } from '../models/User';

const router = express.Router();

interface CreateCredentialRequest {
  type: string;
  subject: string;
  score: number;
  date: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Get user credentials
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const credentials = user.credentials || [];
    res.json(credentials);
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    res.status(500).send('Server error');
  }
});

// Add new credential
router.post('/', [
  body('type').trim().notEmpty(),
  body('subject').trim().notEmpty(),
  body('score').isNumeric(),
  body('date').isISO8601()
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, subject, score, date } = req.body as CreateCredentialRequest;

    // Store credential data in IPFS
    const credentialData: Credential = {
      type,
      subject,
      score,
      date: new Date(date)
    };

    const ipfsHash = await uploadToIPFS(credentialData);

    // Add credential to user
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.credentials = user.credentials || [];
    user.credentials.push({
      ...credentialData,
      ipfsHash
    });

    await user.save();

    res.status(201).json({
      message: 'Credential added successfully',
      credential: {
        type,
        subject,
        score,
        date,
        ipfsHash
      }
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    res.status(500).send('Server error');
  }
});

// Get credential details from IPFS
router.get('/:ipfsHash', async (req: Request<{ ipfsHash: string }>, res: Response): Promise<void> => {
  try {
    const credentialData = await getFromIPFS<Credential>(req.params.ipfsHash);
    res.json(credentialData);
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    res.status(500).send('Server error');
  }
});

export default router; 