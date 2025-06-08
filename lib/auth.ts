import { DID } from '@spruceid/didkit-wasm';

export async function generateDID(): Promise<{ did: string; privateKey: string }> {
  try {
    // Generate a new DID
    const did = await DID.new();
    const privateKey = await did.export();

    return {
      did: did.toString(),
      privateKey,
    };
  } catch (error) {
    console.error('Error generating DID:', error);
    throw new Error('Failed to generate decentralized identity');
  }
}

export function getDIDFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('did');
}

export function getPrivateKeyFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('privateKey');
}

export function getUserNameFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userName');
}

export function getUserMajorFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userMajor');
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('did');
  localStorage.removeItem('privateKey');
  localStorage.removeItem('userName');
  localStorage.removeItem('userMajor');
} 