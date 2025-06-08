import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Initialize IPFS client with Infura
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    // Convert data to Buffer
    const buffer = Buffer.from(JSON.stringify(data));

    // Upload to IPFS
    const result = await client.add(buffer);

    // Return the IPFS URI
    return `ipfs://${result.path}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function getFromIPFS(ipfsUri: string): Promise<any> {
  try {
    // Extract the IPFS hash from the URI
    const hash = ipfsUri.replace('ipfs://', '');

    // Get the data from IPFS
    const stream = client.cat(hash);
    let data = '';

    for await (const chunk of stream) {
      data += chunk.toString();
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch from IPFS');
  }
} 