import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { signCredential } from '@/lib/did';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { type, subjectDid, issuerDid, privateKey } = req.body;

      if (!type || !subjectDid || !issuerDid || !privateKey) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create credential payload
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', type],
        issuer: issuerDid,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: subjectDid,
          type,
        },
      };

      // Sign credential
      const signedCredential = await signCredential(credential, privateKey);

      // Store credential in database
      const storedCredential = await prisma.credential.create({
        data: {
          type,
          subjectDid,
          issuerDid,
          credentialId: signedCredential,
        },
      });

      return res.status(200).json({ credential: storedCredential });
    } catch (error) {
      console.error('Error creating credential:', error);
      return res.status(500).json({ error: 'Failed to create credential' });
    }
  } else if (req.method === 'GET') {
    try {
      const { subjectDid } = req.query;

      if (!subjectDid || typeof subjectDid !== 'string') {
        return res.status(400).json({ error: 'Invalid subject DID' });
      }

      const credentials = await prisma.credential.findMany({
        where: { subjectDid },
        orderBy: {
          issuedAt: 'desc',
        },
      });

      return res.status(200).json({ credentials });
    } catch (error) {
      console.error('Error fetching credentials:', error);
      return res.status(500).json({ error: 'Failed to fetch credentials' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 