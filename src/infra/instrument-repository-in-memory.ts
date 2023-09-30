import Instrument from '../domain/core/instrument';
import InstrumentRepository from '../domain/core/instrument-repository';

export class InMemoryInstrumentRepository implements InstrumentRepository {
  private instruments: Instrument[] = [];

  constructor() {
    this.instruments = [];
  }
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
