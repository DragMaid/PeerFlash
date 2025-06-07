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
        originalSetId,
        creatorDid,
        modifications,
      } = req.body;

      if (!originalSetId || !creatorDid) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get original flashcard set
      const originalSet = await prisma.flashcardSet.findUnique({
        where: { id: originalSetId },
        include: { flashcards: true },
      });

      if (!originalSet) {
        return res.status(404).json({ error: 'Original flashcard set not found' });
      }

      // Apply modifications if any
      const modifiedFlashcards = modifications
        ? originalSet.flashcards.map((card, index) => ({
            ...card,
            ...(modifications[index] || {}),
          }))
        : originalSet.flashcards;

      // Upload modified flashcards to IPFS
      const ipfsUri = await uploadToIPFS(modifiedFlashcards);

      // Mint new MPT token
      const mptTokenId = await mintMPTToken({
        creatorDid,
        ipfsUri,
        tags: originalSet.tags,
        deckHash: ipfsUri,
      });

      // Create new flashcard set
      const newSet = await prisma.flashcardSet.create({
        data: {
          title: `${originalSet.title} (Adapted)`,
          subject: originalSet.subject,
          tags: originalSet.tags,
          difficulty: originalSet.difficulty,
          description: originalSet.description,
          creatorDid,
          ipfsUri,
          mptTokenId,
          parentTokenId: originalSet.mptTokenId,
          flashcards: {
            create: modifiedFlashcards.map((card) => ({
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

      // Update original set's reuse count and trust score
      await prisma.flashcardSet.update({
        where: { id: originalSetId },
        data: {
          reuseCount: { increment: 1 },
          trustScore: { increment: 0.1 }, // Simple trust score increment
        },
      });

      return res.status(200).json({
        flashcardSet: newSet,
        originalSet: {
          id: originalSet.id,
          title: originalSet.title,
          creatorDid: originalSet.creatorDid,
        },
      });
    } catch (error) {
      console.error('Error reusing flashcard set:', error);
      return res.status(500).json({ error: 'Failed to reuse flashcard set' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 