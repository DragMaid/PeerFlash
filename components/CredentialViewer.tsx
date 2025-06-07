import React from 'react';
import { verifyCredential } from '@/lib/did';

interface Credential {
  id: string;
  type: string;
  subjectDid: string;
  issuerDid: string;
  credentialId: string;
  issuedAt: string;
}

interface CredentialViewerProps {
  credentials: Credential[];
  onVerify?: (credentialId: string, isValid: boolean) => void;
}

export default function CredentialViewer({
  credentials,
  onVerify,
}: CredentialViewerProps) {
  const handleVerify = async (credentialId: string) => {
    try {
      const isValid = await verifyCredential(credentialId);
      if (onVerify) {
        onVerify(credentialId, isValid);
      }
    } catch (error) {
      console.error('Error verifying credential:', error);
      if (onVerify) {
        onVerify(credentialId, false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Credentials</h2>
      <div className="space-y-4">
        {credentials.map((credential) => (
          <div
            key={credential.id}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {credential.type} Credential
                </h3>
                <p className="text-gray-600 mb-1">
                  Issued by: {credential.issuerDid}
                </p>
                <p className="text-gray-600 mb-1">
                  Subject: {credential.subjectDid}
                </p>
                <p className="text-gray-600">
                  Issued on: {formatDate(credential.issuedAt)}
                </p>
              </div>
              <button
                onClick={() => handleVerify(credential.credentialId)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Verify
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 break-all">
                Credential ID: {credential.credentialId}
              </p>
            </div>
          </div>
        ))}

        {credentials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              No credentials found. Complete flashcard sets to earn credentials!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 