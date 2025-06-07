import * as DIDKit from '@spruceid/didkit-wasm';

let didkit: typeof DIDKit | null = null;

const initializeDIDKit = async () => {
  if (!didkit) {
    didkit = await DIDKit;
  }
  return didkit;
};

export const generateDID = async (): Promise<{ did: string; privateKey: string }> => {
  const didkit = await initializeDIDKit();
  const key = didkit.generateEd25519Key();
  const did = didkit.keyToDID('key', key);
  
  // Store private key securely (in production, use proper encryption)
  localStorage.setItem('did_private_key', key);
  
  return { did, privateKey: key };
};

export const loadDID = async (): Promise<string | null> => {
  const privateKey = localStorage.getItem('did_private_key');
  if (!privateKey) return null;
  
  const didkit = await initializeDIDKit();
  return didkit.keyToDID('key', privateKey);
};

export const signCredential = async (
  credential: any,
  privateKey: string
): Promise<string> => {
  const didkit = await initializeDIDKit();
  const did = didkit.keyToDID('key', privateKey);
  
  const proofOptions = {
    verificationMethod: didkit.keyToVerificationMethod('key', privateKey),
    proofPurpose: 'assertionMethod',
  };
  
  return didkit.issueCredential(
    JSON.stringify(credential),
    JSON.stringify(proofOptions),
    privateKey
  );
};

export const verifyCredential = async (
  credential: string
): Promise<boolean> => {
  const didkit = await initializeDIDKit();
  const proofOptions = JSON.stringify({});
  return didkit.verifyCredential(credential, proofOptions);
}; 