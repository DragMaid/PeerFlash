import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const signUpSchema = z.object({
  did: z.string().min(1, 'DID is required'),
  name: z.string().min(1, 'Name is required'),
  major: z.string().min(1, 'Major is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    
    // Check if user with DID already exists
    const existingUser = await prisma.user.findUnique({
      where: { did: validatedData.did },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this DID already exists' },
        { status: 400 }
      );
    }
    
    // Create new user with provided DID
    const user = await prisma.user.create({
      data: {
        did: validatedData.did,
        displayName: validatedData.name,
        major: validatedData.major,
      },
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          did: user.did,
          displayName: user.displayName,
          major: user.major,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 