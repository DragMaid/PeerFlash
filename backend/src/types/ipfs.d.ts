import { FlashcardDeck, Credential } from '../models/User';

export type IPFSData = FlashcardDeck | Credential;

export function uploadToIPFS(data: IPFSData): Promise<string>;
export function getFromIPFS<T extends IPFSData>(hash: string): Promise<T>; 