import 'dotenv/config';
import UseCaseFactory from './use-case-factory';

async function main() {
  const createBacktest = await UseCaseFactory.CreateBacktest();
  await createBacktest.execute({
    exchange: 'foxbit',
    symbol: 'btcbrl',
    timeframe: '1h',
    startTime: new Date('2022-07-18T00:00'),
    endTime: new Date('2023-08-19T12:00'),
    strategyType: 'bollinger-bands',
    strategyParams: {}
  });
  console.log('Backtest created and job added successfully!');
}

main();
