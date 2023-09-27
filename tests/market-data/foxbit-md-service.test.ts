import EventEmitter from 'events';
import { FoxbitMdService } from '../../src/infra/foxbit-md-service';
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

describe('FoxbitMdService', () => {
  let eventEmitter: EventEmitter;
  let wsAdapter: WsAdapter;
  let foxbitMdService: FoxbitMdService;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    wsAdapter = makeWsAdapter();
    foxbitMdService = new FoxbitMdService(eventEmitter, wsAdapter);
  });

  afterEach(() => {
    eventEmitter.removeAllListeners();
  });

  it('should subscribe to a symbol', () => {
    const symbol = 'btcbrl';
    const subscribeSpy = jest.spyOn(wsAdapter, 'send');

    foxbitMdService.subscribe(symbol);

    expect(subscribeSpy).toHaveBeenCalledWith(
      JSON.stringify({
        m: 2,
        i: 1,
        n: 'SubscribeLevel1',
        o: JSON.stringify({
          MarketId: symbol
        })
      })
    );
  });

  it('should unsubscribe from a symbol', () => {
    const symbol = 'ethbrl';
    const unsubscribeSpy = jest.spyOn(wsAdapter, 'send');

    foxbitMdService.unsubscribe(symbol);

    expect(unsubscribeSpy).toHaveBeenCalledWith(
      JSON.stringify({
        m: 2,
        i: 1,
        n: 'UnSubscribeLevel1',
        o: JSON.stringify({
          MarketId: symbol
        })
      })
    );
  });

  it('should process level 1 update event', () => {
    const message = {
      m: 3,
      i: 6,
      n: 'Level1UpdateEvent',
      o: JSON.stringify({
        MarketId: 'btcbrl',
        BestBid: 132653,
        BestOffer: 132882
      })
    };

    const emitOrderBookSpy = jest.spyOn(eventEmitter, 'emit');

    foxbitMdService['processMessage'](JSON.stringify(message));

    expect(emitOrderBookSpy).toHaveBeenCalledWith(
      'onOrderBook.foxbit.btcbrl',
      expect.objectContaining({
        symbol: 'btcbrl',
        exchange: 'foxbit',
        bids: [[132653, Number.MAX_SAFE_INTEGER]],
        asks: [[132882, Number.MAX_SAFE_INTEGER]]
      })
    );
  });

  it('should increase sequence number when subscribing', () => {
    const initialSequenceNumber = foxbitMdService['sequenceNumber'];
    const symbol = 'ltcbrl';

    foxbitMdService.subscribe(symbol);

    const finalSequenceNumber = foxbitMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });

  it('should increase sequence number when unsubscribing', () => {
    const initialSequenceNumber = foxbitMdService['sequenceNumber'];
    const symbol = 'ethbrl';

    foxbitMdService.unsubscribe(symbol);

    const finalSequenceNumber = foxbitMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });
});
