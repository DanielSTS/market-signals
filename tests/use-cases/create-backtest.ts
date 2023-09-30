import BacktestRepository from '../../src/domain/core/backtest-repository';
import InstrumentRepository from '../../src/domain/core/instrument-repository';
import { MdService } from '../../src/domain/market-data/md.service';
import { InMemoryBacktestRepository } from '../../src/infra/backtest-repository-in-memory';
import { InMemoryInstrumentRepository } from '../../src/infra/instrument-repository-in-memory';
import createBacktest from '../../src/use-cases/create-backtest';

function makeMdService(): MdService {
  return {
    subscribeOrderBook: jest.fn(),
    unsubscribeOrderBook: jest.fn(),
    subscribeCandlestick: jest.fn(),
    unsubscribeCandlestick: jest.fn(),
    getCandlestick: jest.fn()
  };
}

describe('createBacktest', () => {
  let instrumentRepository: InstrumentRepository;
  let backtestRepository: BacktestRepository;
  let mdService: MdService;

  beforeEach(() => {
    instrumentRepository = new InMemoryInstrumentRepository();
    backtestRepository = new InMemoryBacktestRepository();
    mdService = makeMdService();
  });

  it('should create a new backtest and save it in the repository', () => {
    const input = {
      exchange: 'binance',
      symbol: 'btcbrl',
      timeframe: '1h',
      startTime: new Date('2022-01-01'),
      endTime: new Date('2022-02-01'),
      strategyType: 'bollinger-bands',
      strategyParams: {
        period: 20,
        deviation: 2
      }
    };

    const useCase = new createBacktest(
      instrumentRepository,
      backtestRepository,
      mdService
    );

    useCase.execute(input);
  });
});
