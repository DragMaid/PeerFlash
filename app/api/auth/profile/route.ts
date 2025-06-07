import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const did = searchParams.get('did');

    if (!did) {
      return NextResponse.json(
        { error: 'DID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { did },
      select: {
        id: true,
        did: true,
        displayName: true,
        major: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 