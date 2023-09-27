import { WebSocket } from 'ws';
import { WsAdapter } from './websocket';

export class ResilientWsAdapter implements WsAdapter {
  private ws?: WebSocket;
  private readonly url: string;
  private readonly reconnectDelay: number;
  private onMessageCallback?: (data: string) => void;
  private onErrorCallback?: (error: Error) => void;
  private onOpenCallback?: () => void;
  private onCloseCallback?: (code: number, reason: string) => void;

  constructor(url: string, reconnectDelay: number = 10 * 1000) {
    this.url = url;
    this.reconnectDelay = reconnectDelay;
  }

  open(): void {
    this.connect();
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(data);
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
}
