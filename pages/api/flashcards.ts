import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { uploadToIPFS } from '@/lib/ipfs';
import { mintMPTToken } from '@/lib/xrpl';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const {
        title,
        subject,
        tags,
        difficulty,
        description,
        creatorDid,
        flashcards,
      } = req.body;

      if (!title || !subject || !tags || !difficulty || !creatorDid || !flashcards) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Upload flashcards to IPFS
      const ipfsUri = await uploadToIPFS(flashcards);

      // Mint MPT token
      const mptTokenId = await mintMPTToken({
        creatorDid,
        ipfsUri,
        tags,
        deckHash: ipfsUri,
      });

      // Create flashcard set in database
      const flashcardSet = await prisma.flashcardSet.create({
        data: {
          title,
          subject,
          tags,
          difficulty,
          description,
          creatorDid,
          ipfsUri,
          mptTokenId,
          flashcards: {
            create: flashcards.map((card: any) => ({
              question: card.question,
              answer: card.answer,
              explanation: card.explanation,
              imageUrl: card.imageUrl,
            })),
          },
        },
        include: {
          flashcards: true,
        },
      });

      return res.status(200).json({ flashcardSet });
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      return res.status(500).json({ error: 'Failed to create flashcard set' });
    }
  } else if (req.method === 'GET') {
    try {
      const {
        subject,
        tags,
        difficulty,
        creatorDid,
        page = '1',
        limit = '10',
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = {};
      if (subject) where.subject = subject;
      if (tags) where.tags = { hasSome: (tags as string).split(',') };
      if (difficulty) where.difficulty = parseInt(difficulty as string);
      if (creatorDid) where.creatorDid = creatorDid;

      const [flashcardSets, total] = await Promise.all([
        prisma.flashcardSet.findMany({
          where,
          skip,
          take,
          include: {
            flashcards: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.flashcardSet.count({ where }),
      ]);

      return res.status(200).json({
        flashcardSets,
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / take),
      });
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      return res.status(500).json({ error: 'Failed to fetch flashcard sets' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 