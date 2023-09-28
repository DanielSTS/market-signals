export interface WebsocketAdapter {
  open(): void;
  close(): void;
  send(data: string): void;
  onMessage(callback: (data: string) => void): void;
  onError(callback: (error: Error) => void): void;
  onOpen(callback: () => void): void;
  onClose(callback: (code: number, reason: string) => void): void;
}
