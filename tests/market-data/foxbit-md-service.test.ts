import EventEmitter from 'events';
import { FoxbitMdService } from '../../src/infra/foxbit-md-service';
import { WebsocketAdapter } from '../../src/infra/websocket-adapter';
import { RestAdapter } from '../../src/infra/rest-adapter';

function makeWsAdapter(): WebsocketAdapter {
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

function makeRestAdapter(): RestAdapter {
  return {
    get: jest.fn(),
    post: jest.fn()
  };
}

describe('FoxbitMdService', () => {
  let eventEmitter: EventEmitter;
  let wsAdapter: WebsocketAdapter;
  let restAdapter: RestAdapter;
  let foxbitMdService: FoxbitMdService;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    wsAdapter = makeWsAdapter();
    restAdapter = makeRestAdapter();
    foxbitMdService = new FoxbitMdService(eventEmitter, wsAdapter, restAdapter);
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
    foxbitMdService.subscribe(symbol);

    foxbitMdService.unsubscribe(symbol);

    expect(unsubscribeSpy).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({
        m: 2,
        i: 2,
        n: 'UnSubscribeLevel1',
        o: JSON.stringify({
          MarketId: symbol
        })
      })
    );
  });

  it('should send subscribe when processOpen', () => {
    const subscribeSpy = jest.spyOn(wsAdapter, 'send');

    foxbitMdService.subscribe('btcbrl');
    foxbitMdService.subscribe('ethbrl');
    foxbitMdService.subscribe('xrpbrl');

    expect(subscribeSpy).toHaveBeenCalledTimes(3);

    foxbitMdService['processOpen']();

    expect(subscribeSpy).toHaveBeenCalledTimes(6);
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
    const symbol = 'ethbrl';
    foxbitMdService.subscribe(symbol);
    const initialSequenceNumber = foxbitMdService['sequenceNumber'];

    foxbitMdService.unsubscribe(symbol);

    const finalSequenceNumber = foxbitMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });

  it('should fetch candles data', async () => {
    const symbol = 'btcbrl';
    const interval = '1h';
    const startTime = new Date('2022-07-18T00:00');
    const endTime = new Date('2022-08-19T12:00');

    const expectedCandles = [
      ['1658275200000', '333.0303', '444.0404', '111.0101', '222.0202', '10'],
      [
        '1658275200000',
        '334.4334',
        '445.5445',
        '112.2112',
        '323.3223',
        '20.45'
      ],
      ['1658275200000', '777.3333', '999.1111', '666.4444', '888.2222', '30']
    ];

    jest
      .spyOn(restAdapter, 'get')
      .mockReturnValueOnce(Promise.resolve(expectedCandles));

    const candles = await foxbitMdService.getCandles(
      symbol,
      interval,
      startTime,
      endTime
    );

    expect(candles).toEqual([
      {
        timestamp: new Date(1658275200000),
        open: 333.0303,
        high: 444.0404,
        low: 111.0101,
        close: 222.0202,
        volume: 10
      },
      {
        timestamp: new Date(1658275200000),
        open: 334.4334,
        high: 445.5445,
        low: 112.2112,
        close: 323.3223,
        volume: 20.45
      },
      {
        timestamp: new Date(1658275200000),
        open: 777.3333,
        high: 999.1111,
        low: 666.4444,
        close: 888.2222,
        volume: 30
      }
    ]);

    expect(restAdapter.get).toHaveBeenCalledWith('markets/btcbrl/candles', {
      interval: interval,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    });
  });
});
