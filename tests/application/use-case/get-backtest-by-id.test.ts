import BacktestDao from '../../../src/application/dao/backtest-dao';
import GetBacktestById from '../../../src/application/use-case/get-backtests-by-id';

describe('GetBacktestById', () => {
  it('should return the backtest with the given ID', async () => {
    const backtestId = 'backtest-id-1';
    const backtest = {
      id: backtestId,
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
    };

    const backtestDao: BacktestDao = {
      getAllDto: jest.fn(),
      getDtoById: jest.fn().mockResolvedValue(backtest)
    };

    const getBacktestById = new GetBacktestById(backtestDao);

    const result = await getBacktestById.execute({ id: backtestId });

    expect(backtestDao.getDtoById).toHaveBeenCalledWith(backtestId);
    expect(result).toEqual(backtest);
  });

  it('should throw an error if the backtest is not found', async () => {
    const backtestId = 'non-existent-backtest-id';
    const backtestDao: BacktestDao = {
      getAllDto: jest.fn(),
      getDtoById: jest
        .fn()
        .mockResolvedValue(Promise.reject(new Error('Backtest not found')))
    };

    const getBacktestById = new GetBacktestById(backtestDao);

    await expect(
      getBacktestById.execute({ id: backtestId })
    ).rejects.toThrowError('Backtest not found');
    expect(backtestDao.getDtoById).toHaveBeenCalledWith(backtestId);
  });
});
