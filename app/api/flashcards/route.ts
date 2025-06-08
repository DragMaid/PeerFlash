import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JWTPayload {
  did: string;
  name: string;
  iat: number;
  exp: number;
}

// Input validation schema
const createFlashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  explanation: z.string().optional(),
  imageUrl: z.string().optional(),
  setId: z.string().min(1, 'Set ID is required'),
});

export async function POST(request: Request) {
  try {
    // Get user from JWT token
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    const userDid = decoded.did;

    const body = await request.json();
    
    // Validate input
    const validatedData = createFlashcardSchema.parse(body);
    
    // Verify that the user owns the flashcard set
    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { id: validatedData.setId },
    });

    if (!flashcardSet || flashcardSet.creatorDid !== userDid) {
      return NextResponse.json(
        { error: 'Flashcard set not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        ...validatedData,
      },
    });

    return NextResponse.json(flashcard, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create flashcard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get user from JWT token
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    const userDid = decoded.did;

    // Get user's flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: {
        flashcardSet: {
          creatorDid: userDid,
        },
      },
      include: {
        flashcardSet: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 