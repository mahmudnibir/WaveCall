import { SignalingMessage } from '../types';
import { WS_URL } from '../constants';

type MessageHandler = (msg: SignalingMessage) => void;

class SignalingService {
  private socket: WebSocket | null = null;
  private messageQueue: SignalingMessage[] = [];
  private onMessageCallback: MessageHandler | null = null;
  private isConnected = false;
  
  // For local demo simulation (tab-to-tab)
  private broadcastChannel: BroadcastChannel | null = null;
  private useSimulation = false;

  constructor() {
    // Attempt to detect if we should use simulation (if WS fails or manual toggle)
    // For this environment, we default to simulation for immediate gratification,
    // but the code supports real WS.
    this.useSimulation = true; 
    
    if (this.useSimulation) {
      this.initSimulation();
    } else {
      this.connect();
    }
  }

  public setSimulationMode(enabled: boolean) {
    this.useSimulation = enabled;
    if (enabled) {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      this.initSimulation();
    } else {
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
        this.broadcastChannel = null;
      }
      this.connect();
    }
  }

  private initSimulation() {
    console.log('[Signaling] Starting in Simulation Mode (BroadcastChannel)');
    this.broadcastChannel = new BroadcastChannel('waveapp_signal');
    this.broadcastChannel.onmessage = (event) => {
      const msg = event.data as SignalingMessage;
      if (this.onMessageCallback) {
        this.onMessageCallback(msg);
      }
    };
    this.isConnected = true;
  }

  private connect() {
    console.log(`[Signaling] Connecting to ${WS_URL}...`);
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('[Signaling] Connected');
      this.isConnected = true;
      this.flushQueue();
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as SignalingMessage;
        if (this.onMessageCallback) {
          this.onMessageCallback(msg);
        }
      } catch (e) {
        console.error('Failed to parse signaling message', e);
      }
    };

    this.socket.onerror = (err) => {
      console.warn('[Signaling] WebSocket error. Fallback handling recommended.', err);
    };

    this.socket.onclose = () => {
      console.log('[Signaling] Disconnected');
      this.isConnected = false;
      // Simple reconnect logic could go here
    };
  }

  public onMessage(callback: MessageHandler) {
    this.onMessageCallback = callback;
  }

  public send(msg: SignalingMessage) {
    if (this.useSimulation && this.broadcastChannel) {
      this.broadcastChannel.postMessage(msg);
      return;
    }

    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(msg));
    } else {
      this.messageQueue.push(msg);
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift();
      if (msg) this.socket.send(JSON.stringify(msg));
    }
  }
}

export const signalingService = new SignalingService();
