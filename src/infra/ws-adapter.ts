import { WebSocket } from 'ws';
import { WebsocketAdapter } from './websocket-adapter';

export class WsAdapter implements WebsocketAdapter {
  private ws?: WebSocket;
  private pingInterval?: NodeJS.Timeout;
  private onMessageCallback?: (data: string) => void;
  private onErrorCallback?: (error: Error) => void;
  private onOpenCallback?: () => void;
  private onCloseCallback?: (code: number, reason: string) => void;

  constructor(
    private readonly url: string,
    private readonly reconnectDelay = 10 * 1000,
    private readonly pingTime = 30 * 1000
  ) {}

  open(): void {
    this.connect();
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, this.pingTime);
  }

  close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.ws) {
      this.ws.close();
    }
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  onMessage(callback: (data: string) => void): void {
    this.onMessageCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  onClose(callback: (code: number, reason: string) => void): void {
    this.onCloseCallback = callback;
  }

  private connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      if (this.onOpenCallback) {
        this.onOpenCallback();
      }
    });

    this.ws.on('message', data => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.toString());
      }
    });

    this.ws.on('error', error => {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
      setTimeout(this.connect, this.reconnectDelay);
    });

    this.ws.on('close', (code, reason) => {
      if (this.onCloseCallback) {
        this.onCloseCallback(code, reason.toString());
      }
      setTimeout(this.connect, this.reconnectDelay);
    });
  }

  private sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.ping();
    }
  }
}
