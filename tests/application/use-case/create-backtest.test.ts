import BacktestRepository from '../../../src/domain/repository/backtest-repository';
import InstrumentRepository from '../../../src/domain/repository/instrument-repository';
import InMemoryBacktestRepository from '../../../src/infra/database/backtest-repository-in-memory';
import InMemoryInstrumentRepository from '../../../src/infra/database/instrument-repository-in-memory';
import createBacktest from '../../../src/application/use-case/create-backtest';
import QueueAdapter from '../../../src/infra/queue/queue-adapter';
import { ExchangeFactory } from '../../../src/application/exchange/exchange-factory';
import { MdService } from '../../../src/domain/market-data/md.service';

function makeMdService(): MdService {
  return {
    subscribeOrderBook: jest.fn(),
    unsubscribeOrderBook: jest.fn(),
    subscribeCandlestick: jest.fn(),
    unsubscribeCandlestick: jest.fn(),
    getCandlestick: jest.fn()
  };
}

function makeMdServiceFactory(): ExchangeFactory {
  return {
    createMdService: (exchange: string) => makeMdService()
  };
}

function makeQueueAdapter(): QueueAdapter {
  return {
    add: jest.fn()
  };
}

describe('createBacktest', () => {
  let instrumentRepository: InstrumentRepository;
  let backtestRepository: BacktestRepository;
  let mdService: ExchangeFactory;
  let queue: QueueAdapter;

  beforeEach(() => {
    instrumentRepository = new InMemoryInstrumentRepository();
    backtestRepository = new InMemoryBacktestRepository();
    mdService = makeMdServiceFactory();
    queue = makeQueueAdapter();
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

    const addToQueueSpy = jest.spyOn(queue, 'add');

    const useCase = new createBacktest(
      instrumentRepository,
      backtestRepository,
      mdService,
      queue
    );

    const id = await useCase.execute(input);
    const backtest = await backtestRepository.getById(id);

    expect(backtest).toBeDefined();
    expect(addToQueueSpy).toHaveBeenCalledWith('ExecuteBacktest', {
      id
    });
  });
});
