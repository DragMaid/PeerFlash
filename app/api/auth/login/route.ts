import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Input validation schema
const loginSchema = z.object({
  did: z.string().min(1, 'DID is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { did: validatedData.did },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a random nonce
    const nonce = randomBytes(32).toString('hex');
    
    // Store the nonce in the database with an expiration time
    await prisma.user.update({
      where: { did: validatedData.did },
      data: {
        nonce,
        nonceExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
      },
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 