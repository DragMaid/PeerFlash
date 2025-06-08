import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

interface JWTPayload {
  did: string;
  name: string;
  iat: number;
  exp: number;
}

// Input validation schema
const createFlashcardSetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  tags: z.array(z.string()),
  difficulty: z.number().min(1).max(5),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const headersList = headers();
    const userDid = headersList.get('x-user-did');

    if (!userDid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's flashcard sets
    const flashcardSets = await prisma.flashcardSet.findMany({
      where: {
        creatorDid: userDid,
      },
      include: {
        flashcards: true,
      },
    });

    return NextResponse.json(flashcardSets);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcard sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const userDid = headersList.get('x-user-did');

    if (!userDid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, difficulty, tags } = body;

    if (!title || !subject || !difficulty) {
      return NextResponse.json(
        { error: 'Title, subject, and difficulty are required' },
        { status: 400 }
      );
    }

    // Create a new flashcard set
    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        title,
        description: description || '',
        subject,
        difficulty,
        tags: tags || [],
        creatorDid: userDid,
        ipfsUri: '', // Will be updated when we implement IPFS
      },
    });

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard set' },
      { status: 500 }
    );
  }
} 