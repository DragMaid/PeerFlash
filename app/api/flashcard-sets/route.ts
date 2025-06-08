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
  description: z.string().optional(),
  flashcards: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    explanation: z.string().optional(),
    imageUrl: z.string().optional(),
  })),
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
    const { title, description, subject, tags, flashcards } = body;

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      );
    }

    // Validate input using zod schema
    const validatedData = createFlashcardSetSchema.parse({
      title,
      description,
      subject,
      tags,
      flashcards,
    });

    // Create a new flashcard set with its flashcards
    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        subject: validatedData.subject,
        tags: validatedData.tags,
        creatorDid: userDid,
        ipfsUri: '', // Will be updated when we implement IPFS
        flashcards: {
          create: validatedData.flashcards.map(card => ({
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

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create flashcard set' },
      { status: 500 }
    );
  }
} 