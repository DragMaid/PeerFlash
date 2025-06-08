import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || '' });

export const uploadToIPFS = async (data: any): Promise<string> => {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'flashcards.json', { type: 'application/json' });
    
    const cid = await client.put([file], {
      name: 'flashcards',
      maxRetries: 3,
    });
    
    return `ipfs://${cid}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const retrieveFromIPFS = async (ipfsUri: string): Promise<any> => {
  try {
    const cid = ipfsUri.replace('ipfs://', '');
    const res = await client.get(cid);
    
    if (!res?.ok) {
      throw new Error('Failed to retrieve from IPFS');
    }
    
    const files = await res.files();
    const file = files[0];
    
    if (!file) {
      throw new Error('No file found in IPFS response');
    }
    
    const text = await file.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
}; 