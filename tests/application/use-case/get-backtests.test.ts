import BacktestDao from '../../../src/application/dao/backtest-dao';
import GetBacktests from '../../../src/application/use-case/get-backtests';

describe('GetBacktests', () => {
  it('should return an array of backtests', async () => {
    const backtests = [
      {
        id: 'backtest-id-1',
        startTime: new Date(),
        endTime: new Date(),
        symbol: 'btc',
        exchange: 'foxbit',
        timeframe: '1h',
        strategyType: 'my-strategy',
        strategyParams: { param1: 'value1', param2: 'value2' },
        state: 'running',
        positions: [
          {
            state: 'open',
            enterTrade: {
              price: 10000,
              time: new Date(),
              quantity: 1
            },
            id: 'position-id-1',
            exitTrade: {
              price: 11000,
              time: new Date(),
              quantity: 1
            }
          }
        ]
      },
      {
        id: 'backtest-id-2',
        startTime: new Date(),
        endTime: new Date(),
        symbol: 'eth',
        exchange: 'binance',
        timeframe: '4h',
        strategyType: 'my-strategy',
        strategyParams: { param1: 'value1', param2: 'value2' },
        state: 'completed',
        positions: [
          {
            state: 'closed',
            enterTrade: {
              price: 2000,
              time: new Date(),
              quantity: 2
            },
            id: 'position-id-2',
            exitTrade: {
              price: 2200,
              time: new Date(),
              quantity: 2
            }
          }
        ]
      }
    ];

    const backtestDao: BacktestDao = {
      getDtoById: jest.fn(),
      getAllDto: jest.fn().mockResolvedValue(backtests)
    };

    const getBacktests = new GetBacktests(backtestDao);

    const result = await getBacktests.execute();

    expect(backtestDao.getAllDto).toHaveBeenCalled();
    expect(result).toEqual(backtests);
  });
});
