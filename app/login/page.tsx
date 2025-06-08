'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDIDFromLocalStorage } from '@/lib/did';
import { log } from '@/lib/logger';
import * as nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get DID and private key from local storage
      const didData = getDIDFromLocalStorage();
      log('DID data', { did: didData?.did, privateKeyLength: didData?.privateKey?.length });

      if (!didData?.did || !didData?.privateKey) {
        throw new Error('No DID or private key found. Please sign up first.');
      }

      const { did, privateKey } = didData;

      // Request nonce from server
      const nonceResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ did }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce } = await nonceResponse.json();
      log('Received nonce', { nonce });

      // Create credential with nonce
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        issuer: did,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: did,
          nonce: nonce,
        },
      };

      log('Credential to sign', { credential });

      // Convert private key from base64 to Uint8Array
      const privateKeyBytes = util.decodeBase64(privateKey);
      log('Private key bytes length', { length: privateKeyBytes.length });

      // Create key pair from private key
      const keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);
      log('Public key bytes length', { length: keyPair.publicKey.length });

      // Sign the credential
      const message = util.decodeUTF8(JSON.stringify(credential));
      const signature = nacl.sign.detached(message, keyPair.secretKey);
      const signatureBase64 = util.encodeBase64(signature);
      log('Signature bytes length', { length: signature.length });

      // Create signed credential
      const signedCredential = {
        ...credential,
        proof: {
          type: 'Ed25519Signature2018',
          created: new Date().toISOString(),
          verificationMethod: `${did}#keys-1`,
          proofPurpose: 'authentication',
          signature: signatureBase64,
        },
      };

      log('Sending to verify endpoint', { signedCredential });

      // Send to verify endpoint
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did,
          credential: signedCredential,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      log('Login successful, redirecting to dashboard');
      
      // Force a hard navigation to the dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      log('Login error', { error: err instanceof Error ? err.message : 'Unknown error' });
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Using your decentralized identity
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in with DID'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 