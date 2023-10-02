import BacktestRepository from '../../src/domain/repository/backtest-repository';
import InstrumentRepository from '../../src/domain/repository/instrument-repository';
import { MdService } from '../../src/domain/market-data/md.service';
import InMemoryBacktestRepository from '../../src/infra/database/backtest-repository-in-memory';
import InMemoryInstrumentRepository from '../../src/infra/database/instrument-repository-in-memory';
import createBacktest from '../../src/application/use-case/create-backtest';
import QueueAdapter from '../../src/infra/queue/queue-adapter';

function makeMdService(): MdService {
  return {
    subscribeOrderBook: jest.fn(),
    unsubscribeOrderBook: jest.fn(),
    subscribeCandlestick: jest.fn(),
    unsubscribeCandlestick: jest.fn(),
    getCandlestick: jest.fn()
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
  let mdService: MdService;
  let queue: QueueAdapter;

  beforeEach(() => {
    instrumentRepository = new InMemoryInstrumentRepository();
    backtestRepository = new InMemoryBacktestRepository();
    mdService = makeMdService();
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
      id,
      instrument: {
        exchange: { value: input.exchange },
        minQuantity: 1,
        priceIncrement: 0.01,
        symbol: 'btcbrl'
      },
      timeframe: { value: input.timeframe },
      startTime: input.startTime,
      endTime: input.endTime,
      strategyType: input.strategyType,
      strategyParams: input.strategyParams
    });
  });
});
