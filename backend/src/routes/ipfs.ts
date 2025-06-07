import express, { Response, RequestHandler } from 'express';
import { body, param } from 'express-validator';
import { uploadToIPFS, getFromIPFS } from '../services/ipfs.js';

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
  };
}

// Upload data to IPFS
router.post(
  '/upload',
  [
    body('data').notEmpty().withMessage('Data is required'),
  ],
  (async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { data } = req.body;
      const ipfsHash = await uploadToIPFS(data);
      res.json({ ipfsHash });
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
  }) as RequestHandler
);

// Get data from IPFS
router.get(
  '/:hash',
  [
    param('hash').notEmpty().withMessage('IPFS hash is required'),
  ],
  (async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { hash } = req.params;
      const data = await getFromIPFS(hash);
      res.json(data);
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      res.status(500).json({ error: 'Failed to retrieve from IPFS' });
    }
  }) as RequestHandler
);

export default router; 