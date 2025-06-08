import { NextApiRequest, NextApiResponse } from 'next';
import { generateDID, loadDID } from '@/lib/did';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { displayName, major } = req.body;

      if (!displayName || !major) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate new DID
      const { did, privateKey } = await generateDID();

      // Create user in database
      const user = await prisma.user.create({
        data: {
          did,
          displayName,
          major,
        },
      });

      return res.status(200).json({
        did,
        privateKey, // In production, this should be handled more securely
        user,
      });
    } catch (error) {
      console.error('Error creating DID:', error);
      return res.status(500).json({ error: 'Failed to create DID' });
    }
  } else if (req.method === 'GET') {
    try {
      const { did } = req.query;

      if (!did || typeof did !== 'string') {
        return res.status(400).json({ error: 'Invalid DID' });
      }

      const user = await prisma.user.findUnique({
        where: { did },
        include: {
          credentials: true,
          flashcardSets: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 