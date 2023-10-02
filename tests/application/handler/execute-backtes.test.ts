import ExecuteBacktest from '../../../src/application/handler/execute-backtest';
import BacktestRepository from '../../../src/domain/repository/backtest-repository';

describe('ExecuteBacktest', () => {
  it('should execute a backtest', async () => {
    const backtest = {
      id: 'backtest-id',
      startTime: new Date(),
      endTime: new Date(),
      timeframe: {
        value: '1h'
      },
      instrument: {
        exchange: {
          value: 'foxbit'
        },
        symbol: 'btcbrl',
        minQuantity: 1,
        priceIncrement: 0.01
      },
      strategyType: 'my-strategy',
      strategyParams: { param1: 'value1', param2: 'value2' },
      start: jest.fn()
    };

    const backtestRepositoryMock: BacktestRepository = {
      save: jest.fn(),
      update: jest.fn(),
      getById: jest.fn().mockResolvedValue(backtest)
    };

    const executeBacktestHandler = new ExecuteBacktest(backtestRepositoryMock);

    await executeBacktestHandler.handle({ id: 'backtest-id' });

    expect(backtestRepositoryMock.getById).toHaveBeenCalledWith('backtest-id');
    expect(backtest.start).toHaveBeenCalled();
    expect(backtestRepositoryMock.update).toHaveBeenCalledWith(backtest);
  });
});
