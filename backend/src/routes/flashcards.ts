import express, { Response, RequestHandler } from 'express';
import { body, param } from 'express-validator';
import User, { Flashcard, FlashcardDeck } from '../models/User';
import { uploadToIPFS, getFromIPFS } from '../services/ipfs';

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
  };
}

interface CreateFlashcardRequest extends AuthenticatedRequest {
  body: {
    title: string;
    subject: string;
    cards: Flashcard[];
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

// Get user's flashcards
router.get('/', (async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.flashcards);
  } catch (error) {
    console.error('Error getting flashcards:', error);
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Create new flashcard deck
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('cards').isArray().withMessage('Cards must be an array'),
    body('cards.*.front').notEmpty().withMessage('Card front is required'),
    body('cards.*.back').notEmpty().withMessage('Card back is required'),
  ],
  (async (req: CreateFlashcardRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { title, subject, cards, tags, difficulty } = req.body;

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS({
        title,
        subject,
        cards,
        tags,
        difficulty,
        createdAt: new Date(),
      });

      // Add to user's flashcards
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.flashcards.push({
        title,
        subject,
        cards,
        tags,
        difficulty,
        ipfsHash,
        createdAt: new Date(),
      });

      await user.save();

      res.status(201).json({ message: 'Flashcard deck created successfully' });
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }) as RequestHandler
);

// Get flashcard details from IPFS
router.get(
  '/:hash',
  [
    param('hash').notEmpty().withMessage('IPFS hash is required'),
  ],
  (async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hash } = req.params;
      const flashcardDeck = await getFromIPFS<FlashcardDeck>(hash);
      res.json(flashcardDeck);
    } catch (error) {
      console.error('Error retrieving flashcard deck:', error);
      res.status(500).json({ error: 'Failed to retrieve flashcard deck' });
    }
  }) as RequestHandler
);

export default router; 