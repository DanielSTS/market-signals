import EventEmitter from 'events';
import BinanceMdService from '../../../src/application/exchange/binance-md-service';
import WebsocketAdapter from '../../../src/infra/web/websocket-adapter';
import RestAdapter from '../../../src/infra/web/rest-adapter';
import Timeframe from '../../../src/domain/core/timeframe';
import Exchange from '../../../src/domain/core/exchange';

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

describe('BinanceMdService', () => {
  let eventEmitter: EventEmitter;
  let wsAdapter: WebsocketAdapter;
  let restAdapter: RestAdapter;
  let binanceMdService: BinanceMdService;
  const exchange = new Exchange('binance');

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    wsAdapter = makeWsAdapter();
    restAdapter = makeRestAdapter();
    binanceMdService = new BinanceMdService(
      eventEmitter,
      wsAdapter,
      restAdapter
    );
  });

  afterEach(() => {
    eventEmitter.removeAllListeners();
  });

  it('should subscribe to a symbol', () => {
    const symbol = 'btcusdt';

    binanceMdService.subscribeOrderBook(symbol);

    expect(wsAdapter.send).toHaveBeenCalledWith(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: [`${symbol.toLowerCase()}@bookTicker`],
        id: 1
      })
    );
  });

  it('should unsubscribe from a symbol', () => {
    const symbol = 'ethusdt';
    binanceMdService.subscribeOrderBook(symbol);
    binanceMdService.unsubscribeOrderBook(symbol);

    expect(wsAdapter.send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [`${symbol.toLowerCase()}@bookTicker`],
        id: 2
      })
    );
  });

  it('should send subscribe when processOpen', () => {
    binanceMdService.subscribeOrderBook('btcbrl');
    binanceMdService.subscribeOrderBook('ethbrl');
    binanceMdService.subscribeOrderBook('xrpbrl');

    expect(wsAdapter.send).toHaveBeenCalledTimes(3);

    binanceMdService['processOpen']();

    expect(wsAdapter.send).toHaveBeenCalledTimes(6);
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
        exchange,
        bids: [[132736.0, 31.21]],
        asks: [[132737.0, 40.66]]
      })
    );
  });

  it('should increase sequence number when subscribing', () => {
    const initialSequenceNumber = binanceMdService['sequenceNumber'];
    const symbol = 'ltcusdt';

    binanceMdService.subscribeOrderBook(symbol);

    const finalSequenceNumber = binanceMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });

  it('should increase sequence number when unsubscribing', () => {
    const symbol = 'bnbusdt';
    binanceMdService.subscribeOrderBook(symbol);
    const initialSequenceNumber = binanceMdService['sequenceNumber'];

    binanceMdService.unsubscribeOrderBook(symbol);

    const finalSequenceNumber = binanceMdService['sequenceNumber'];
    expect(finalSequenceNumber).toBeGreaterThan(initialSequenceNumber);
  });

  it('should fetch candles data', async () => {
    const symbol = 'btcusdt';
    const timeframe = new Timeframe('1h');
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

    const candles = await binanceMdService.getCandlestick(
      symbol,
      timeframe,
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
        volume: 10,
        exchange,
        symbol
      },
      {
        timestamp: new Date(1658275200000),
        open: 334.4334,
        high: 445.5445,
        low: 112.2112,
        close: 323.3223,
        volume: 20.45,
        exchange,
        symbol
      },
      {
        timestamp: new Date(1658275200000),
        open: 777.3333,
        high: 999.1111,
        low: 666.4444,
        close: 888.2222,
        volume: 30,
        exchange,
        symbol
      }
    ]);

    expect(restAdapter.get).toHaveBeenCalledWith('klines', {
      symbol: symbol.toUpperCase(),
      interval: timeframe.value,
      startTime: startTime.getTime(),
      endTime: endTime.getTime()
    });
  });
});
