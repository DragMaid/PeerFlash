let DIDKit = require('@spruceid/didkit-wasm');

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
  
  return { did, privateKey: key };
};

export const getDIDFromLocalStorage = (): { did: string; privateKey: string } | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const did = window.localStorage.getItem('user_did');
    const privateKey = window.localStorage.getItem('user_private_key');
    
    if (!did || !privateKey) return null;
    
    return { did, privateKey };
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const saveDIDToLocalStorage = (did: string, privateKey: string) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('user_did', did);
    window.localStorage.setItem('user_private_key', privateKey);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
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