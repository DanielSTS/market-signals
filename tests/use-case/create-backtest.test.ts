import BacktestRepository from '../../src/domain/repository/backtest-repository';
import InstrumentRepository from '../../src/domain/repository/instrument-repository';
import { MdService } from '../../src/domain/market-data/md.service';
import InMemoryBacktestRepository from '../../src/infra/backtest-repository-in-memory';
import InMemoryInstrumentRepository from '../../src/infra/instrument-repository-in-memory';
import QueueAdapter from '../../src/infra/queue-adapter';

import createBacktest from '../../src/application/use-case/create-backtest';
import { ExecuteBacktest } from '../../src/application/job';
import { BullMQAdapter } from '../../src/infra/bullmq-adapter';

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
  let bullQueue: QueueAdapter;

  beforeEach(() => {
    instrumentRepository = new InMemoryInstrumentRepository();
    backtestRepository = new InMemoryBacktestRepository();
    mdService = makeMdService();
    bullQueue = new BullMQAdapter(ExecuteBacktest.key);
  });

  afterEach(() => {
    bullQueue.close();
  });

  it('should create a new backtest and save it in the repository', async () => {
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
      mdService,
      bullQueue
    );

    const id = await useCase.execute(input);
    const backtest = await backtestRepository.getById(id);

    expect(backtest).toBeDefined();
  });
});
