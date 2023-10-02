import Instrument from '../../domain/core/instrument';
import InstrumentRepository from '../../domain/repository/instrument-repository';

export default class InMemoryInstrumentRepository
  implements InstrumentRepository
{
  private instruments: Instrument[] = [
    {
      exchange: { value: 'foxbit' },
      symbol: 'btcbrl',
      minQuantity: 1,
      priceIncrement: 0.01
    },
    {
      exchange: { value: 'binance' },
      symbol: 'btcbrl',
      minQuantity: 1,
      priceIncrement: 0.01
    }
  ];

  async getBySymbolAndExchange(
    symbol: string,
    exchange: string
  ): Promise<Instrument> {
    const instrument = this.instruments.find(
      instrument =>
        instrument.symbol === symbol && instrument.exchange.value === exchange
    );
    if (instrument) {
      return instrument;
    }
    throw new Error('Instrument not found');
  }
}
