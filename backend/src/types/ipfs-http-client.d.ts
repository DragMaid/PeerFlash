declare module 'ipfs-http-client' {
  interface IPFSClient {
    add(data: string | Buffer): Promise<{ path: string }>;
    cat(hash: string): AsyncIterable<Buffer>;
  }

  interface CreateOptions {
    host: string;
    port: number;
    protocol: string;
  }

  export function create(options: CreateOptions): IPFSClient;
} 