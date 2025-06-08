import { Client, Wallet, xrpToDrops, convertStringToHex } from 'xrpl';

interface TokenMetadata {
  creatorDid: string;
  ipfsUri: string;
  tags: string[];
  contentHash: string;
}

export async function mintMPTToken(
  metadata: TokenMetadata,
  wallet: Wallet
): Promise<string> {
  const client = new Client('wss://s.altnet.rippletest.net:51233'); // Testnet
  await client.connect();

  try {
    // Convert metadata to hex
    const metadataHex = convertStringToHex(JSON.stringify(metadata));

    // Prepare token minting transaction
    const transaction = {
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      URI: metadataHex,
      Flags: 8, // Transferable
      TokenTaxon: 0, // Required, but can be 0
    };

    // Submit and wait for validation
    const response = await client.submitAndWait(transaction, {
      wallet: wallet,
    });

    if (response.result.meta?.TransactionResult !== 'tesSUCCESS') {
      throw new Error('Failed to mint token');
    }

    // Get the token ID from the transaction
    const tokenID = response.result.meta?.nftokenID;
    if (!tokenID) {
      throw new Error('Token ID not found in response');
    }

    return tokenID;
  } finally {
    await client.disconnect();
  }
}

export async function getWalletFromSeed(seed: string): Promise<Wallet> {
  return Wallet.fromSeed(seed);
}

export async function getTokenMetadata(tokenID: string): Promise<TokenMetadata> {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  try {
    const response = await client.request({
      command: 'nft_info',
      nft_id: tokenID,
    });

    if (!response.result.uri) {
      throw new Error('No metadata found for token');
    }

    // Convert hex URI back to string
    const metadataHex = response.result.uri;
    const metadataString = Buffer.from(metadataHex, 'hex').toString('utf-8');
    return JSON.parse(metadataString);
  } finally {
    await client.disconnect();
  }
}

// Mock function for token verification
export const verifyMPTToken = async (tokenId: string): Promise<boolean> => {
  // In a real implementation, this would:
  // 1. Query the XRPL network
  // 2. Verify the token exists and is valid
  // 3. Return the verification result
  
  // For now, we'll just return true for any token ID
  return true;
};

// Mock function for token transfer
export const transferMPTToken = async (
  tokenId: string,
  fromDid: string,
  toDid: string
): Promise<boolean> => {
  // In a real implementation, this would:
  // 1. Connect to XRPL
  // 2. Create and sign a transfer transaction
  // 3. Submit to the network
  // 4. Return the transaction result
  
  // For now, we'll just return true
  console.log('Mock MPT Token Transfer:', {
    tokenId,
    fromDid,
    toDid,
  });
  
  return true;
}; 