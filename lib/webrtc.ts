import SimplePeer from 'simple-peer';

interface PeerConnection {
  peer: SimplePeer.Instance;
  id: string;
}

class WebRTCManager {
  private peers: Map<string, PeerConnection> = new Map();
  private onDataCallback: ((data: any) => void) | null = null;

  constructor() {
    this.setupPeerListeners();
  }

  private setupPeerListeners() {
    this.peers.forEach(({ peer }) => {
      peer.on('data', (data) => {
        if (this.onDataCallback) {
          try {
            const parsedData = JSON.parse(data.toString());
            this.onDataCallback(parsedData);
          } catch (error) {
            console.error('Error parsing peer data:', error);
          }
        }
      });
    });
  }

  public setOnDataCallback(callback: (data: any) => void) {
    this.onDataCallback = callback;
  }

  public async createPeerConnection(peerId: string, initiator: boolean): Promise<string> {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
    });

    const connection: PeerConnection = {
      peer,
      id: peerId,
    };

    this.peers.set(peerId, connection);
    this.setupPeerListeners();

    return new Promise((resolve, reject) => {
      peer.on('signal', (data) => {
        resolve(JSON.stringify(data));
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        reject(err);
      });
    });
  }

  public async connectToPeer(peerId: string, signalData: string): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection) {
      throw new Error(`No peer connection found for ID: ${peerId}`);
    }

    return new Promise((resolve, reject) => {
      connection.peer.signal(JSON.parse(signalData));
      
      connection.peer.on('connect', () => {
        console.log(`Connected to peer: ${peerId}`);
        resolve();
      });

      connection.peer.on('error', (err) => {
        console.error(`Error connecting to peer ${peerId}:`, err);
        reject(err);
      });
    });
  }

  public sendToPeer(peerId: string, data: any): void {
    const connection = this.peers.get(peerId);
    if (!connection) {
      throw new Error(`No peer connection found for ID: ${peerId}`);
    }

    connection.peer.send(JSON.stringify(data));
  }

  public broadcast(data: any): void {
    this.peers.forEach(({ peer }) => {
      peer.send(JSON.stringify(data));
    });
  }

  public disconnectPeer(peerId: string): void {
    const connection = this.peers.get(peerId);
    if (connection) {
      connection.peer.destroy();
      this.peers.delete(peerId);
    }
  }

  public disconnectAll(): void {
    this.peers.forEach(({ peer }) => {
      peer.destroy();
    });
    this.peers.clear();
  }
}

export const webrtcManager = new WebRTCManager(); 