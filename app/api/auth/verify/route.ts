import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import * as nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// Convert a base64 string to a Uint8Array
const decodeBase64 = (str: string): Uint8Array => {
  try {
    return util.decodeBase64(str);
  } catch (error) {
    console.error('Error decoding base64:', error);
    throw new Error('Invalid base64 string');
  }
};

// Convert a Uint8Array to a base64 string
const encodeBase64 = (data: Uint8Array): string => {
  return util.encodeBase64(data);
};

// Input validation schema
const verifySchema = z.object({
  did: z.string(),
  credential: z.object({
    '@context': z.array(z.string()),
    type: z.array(z.string()),
    issuer: z.string(),
    issuanceDate: z.string(),
    credentialSubject: z.object({
      id: z.string(),
      nonce: z.string()
    }),
    proof: z.object({
      type: z.string(),
      created: z.string(),
      verificationMethod: z.string(),
      proofPurpose: z.string(),
      signature: z.string()
    })
  })
});

// JWT payload interface
interface JWTPayload {
  did: string;
  iat: number;
  exp: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    log('Received verify request', { body });

    // Validate input
    const validatedInput = verifySchema.parse(body);
    log('Validated input', { validatedInput });

    const { did, credential } = validatedInput;

    // Find the user by DID
    const user = await prisma.user.findUnique({
      where: { did },
      select: { id: true, did: true, nonce: true, nonceExpiresAt: true },
    });

    if (!user) {
      log('User not found', { did });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    log('Found user', { user });

    // Check if nonce is valid and not expired
    if (!user.nonce || !user.nonceExpiresAt || new Date() > user.nonceExpiresAt) {
      log('Invalid or expired nonce', { 
        hasNonce: !!user.nonce, 
        nonceExpiresAt: user.nonceExpiresAt,
        currentTime: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      );
    }

    // Verify the nonce matches
    if (user.nonce !== credential.credentialSubject.nonce) {
      log('Nonce mismatch', { 
        expected: user.nonce, 
        received: credential.credentialSubject.nonce 
      });
      return NextResponse.json(
        { error: 'Invalid nonce' },
        { status: 400 }
      );
    }

    try {
      // Extract the signature from the credential
      const signature = credential.proof.signature;
      log('Decoded signature length', { length: signature.length });

      // Get the public key from the DID
      // The DID format is did:key:z{base64PublicKey}
      const publicKeyBase64 = did.split(':').pop()?.split('#')[0];
      if (!publicKeyBase64) {
        log('Invalid DID format', { did });
        return NextResponse.json(
          { error: 'Invalid DID format' },
          { status: 400 }
        );
      }

      const publicKey = decodeBase64(publicKeyBase64);
      log('Decoded public key length', { length: publicKey.length });

      // Verify the signature
      const message = util.decodeUTF8(JSON.stringify({
        '@context': credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: credential.credentialSubject,
      }));

      const isValid = nacl.sign.detached.verify(
        message,
        decodeBase64(signature),
        publicKey
      );

      if (!isValid) {
        log('Invalid signature', { 
          messageLength: message.length,
          signatureLength: signature.length,
          publicKeyLength: publicKey.length
        });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } catch (error) {
      log('Error during signature verification', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return NextResponse.json(
        { error: 'Error verifying signature', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Clear the nonce
    await prisma.user.update({
      where: { id: user.id },
      data: {
        nonce: null,
        nonceExpiresAt: null
      }
    });

    log('Cleared nonce for user', { userId: user.id });

    // Generate JWT token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const token = await new SignJWT({ did: user.did })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    log('Generated JWT token');

    // Create the response
    const response = NextResponse.json({ success: true });

    // Set the token in an HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    log('Set token cookie');
    return response;
  } catch (error) {
    log('Error in verify endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    if (error instanceof z.ZodError) {
      log('Validation error details', { errors: error.errors });
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 