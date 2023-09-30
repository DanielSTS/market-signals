import Instrument from '../domain/core/instrument';
import InstrumentRepository from '../domain/repository/instrument-repository';

export default class InMemoryInstrumentRepository
  implements InstrumentRepository
{
  private instruments: Instrument[] = [
    {
      exchange: { value: 'foxbit' },
      symbol: 'btcbrl',
      minQuantity: 1,
      priceIncrement: 0.01
    }
  ];

  async getBySymbolAndExchange(
    symbol: string,
    exchange: string
  ): Promise<Instrument | undefined> {
    return this.instruments.find(
      instrument =>
        instrument.symbol === symbol && instrument.exchange.value === exchange
    );
  }
}
