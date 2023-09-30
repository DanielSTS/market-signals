import Instrument from '../core/instrument';

export default interface InstrumentRepository {
  getBySymbolAndExchange(
    symbol: string,
    exchange: string
  ): Promise<Instrument | undefined>;
}
