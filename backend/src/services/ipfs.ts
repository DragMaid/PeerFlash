import { create } from 'ipfs-http-client';
import { FlashcardDeck, Credential } from '../models/User.js';

export type IPFSData = FlashcardDeck | Credential;

const ipfs = create({
  host: process.env.IPFS_HOST || 'localhost',
  port: parseInt(process.env.IPFS_PORT || '5001'),
  protocol: process.env.IPFS_PROTOCOL || 'http'
});

export async function uploadToIPFS(data: IPFSData): Promise<string> {
  const result = await ipfs.add(JSON.stringify(data));
  return result.path;
}

export async function getFromIPFS<T extends IPFSData>(hash: string): Promise<T> {
  const stream = ipfs.cat(hash);
  let data = '';
  for await (const chunk of stream) {
    data += chunk.toString();
  }
  return JSON.parse(data) as T;
} 