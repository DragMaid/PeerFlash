import * as nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';

// Convert a Uint8Array to a base64 string
const encodeBase64 = (data: Uint8Array): string => {
  return util.encodeBase64(data);
};

// Convert a base64 string to a Uint8Array
const decodeBase64 = (str: string): Uint8Array => {
  return util.decodeBase64(str);
};

// Generate a new DID and key pair
export const generateDID = async (): Promise<{ did: string; privateKey: string }> => {
  // Generate a new Ed25519 key pair
  const keyPair = nacl.sign.keyPair();
  
  // Convert the public key to base64
  const publicKeyBase64 = encodeBase64(keyPair.publicKey);
  
  // Create a did:key identifier
  const did = `did:key:z${publicKeyBase64}`;
  
  // Convert the private key to base64 for storage
  const privateKeyBase64 = encodeBase64(keyPair.secretKey);
  
  console.log('Generated DID:', did);
  return { did, privateKey: privateKeyBase64 };
};

// Get DID and private key from localStorage
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

// Save DID and private key to localStorage
export const saveDIDToLocalStorage = (did: string, privateKey: string) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('user_did', did);
    window.localStorage.setItem('user_private_key', privateKey);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Sign a credential
export const signCredential = async (
  credential: any,
  privateKey: string
): Promise<string> => {
  try {
    // Convert the private key from base64 to Uint8Array
    const privateKeyBytes = decodeBase64(privateKey);
    
    // Create a key pair from the private key
    const keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);
    
    // Convert the credential to a string
    const credentialString = JSON.stringify(credential);
    
    // Convert the string to bytes
    const messageBytes = util.decodeUTF8(credentialString);
    
    // Sign the message
    const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);
    
    // Convert the signature to base64
    const signatureBase64 = encodeBase64(signature);
    
    // Create a signed credential
    const signedCredential = {
      ...credential,
      proof: {
        type: 'Ed25519Signature2018',
        created: new Date().toISOString(),
        verificationMethod: credential.issuer,
        proofPurpose: 'assertionMethod',
        signature: signatureBase64
      }
    };
    
    return JSON.stringify(signedCredential);
  } catch (error) {
    console.error('Error in signCredential:', error);
    throw error;
  }
};

export const verifyCredential = async (
  credential: string
): Promise<boolean> => {
  const agent = await initializeAgent();
  const proofOptions = JSON.stringify({});
  return agent.verifyCredential(credential, proofOptions);
}; 