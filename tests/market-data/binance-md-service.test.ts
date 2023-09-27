import EventEmitter from 'events';
import { BinanceMdService } from '../../src/infra/binance-md-service';
import { WsAdapter } from '../../src/infra/websocket';

function makeWsAdapter(): WsAdapter {
  return {
    open: jest.fn(),
    close: jest.fn(),
    send: jest.fn(),
    onMessage: jest.fn(),
    onError: jest.fn(),
    onOpen: jest.fn(),
    onClose: jest.fn()
  };
}

describe('BinanceMdService', () => {
  let eventEmitter: EventEmitter;
  let wsAdapter: WsAdapter;
  let binanceMdService: BinanceMdService;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    wsAdapter = makeWsAdapter();
    binanceMdService = new BinanceMdService(eventEmitter, wsAdapter);
  });

  afterEach(() => {
    eventEmitter.removeAllListeners();
  });

  it('should subscribe to a symbol', () => {
    const symbol = 'btcusdt';
    const subscribeSpy = jest.spyOn(wsAdapter, 'send');

    binanceMdService.subscribe(symbol);

    expect(subscribeSpy).toHaveBeenCalledWith(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: [`${symbol.toLowerCase()}@bookTicker`],
        id: 1
      })
    );
  });

  it('should unsubscribe from a symbol', () => {
    const symbol = 'ethusdt';
    const unsubscribeSpy = jest.spyOn(wsAdapter, 'send');

    binanceMdService.unsubscribe(symbol);

    expect(unsubscribeSpy).toHaveBeenCalledWith(
      JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [`${symbol.toLowerCase()}@bookTicker`],
        id: 1
      })
    );
  });

  it('should process depth update event', () => {
    const payload = {
      u: 123456,
      s: 'BTCUSDT',
      b: '132736.00000000',
      B: '31.21000000',
      a: '132737.00000000',
      A: '40.66000000'
    };

    const emitOrderBookSpy = jest.spyOn(eventEmitter, 'emit');

    binanceMdService['processMessage'](JSON.stringify(payload));

    expect(emitOrderBookSpy).toHaveBeenCalledWith(
      'onOrderBook.binance.btcusdt',
      expect.objectContaining({
        symbol: 'btcusdt',
        exchange: 'binance',
        bids: [[132736.0, 31.21]],
        asks: [[132737.0, 40.66]]
      })
    );
  });

  it('should increase sequence number when subscribing', () => {
    const initialSequenceNumber = binanceMdService['sequenceNumber'];
    const symbol = 'ltcusdt';

    binanceMdService.subscribe(symbol);

    const finalSequenceNumber = binanceMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });

  it('should increase sequence number when unsubscribing', () => {
    const initialSequenceNumber = binanceMdService['sequenceNumber'];
    const symbol = 'bnbusdt';

    binanceMdService.unsubscribe(symbol);

    const finalSequenceNumber = binanceMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });
});
