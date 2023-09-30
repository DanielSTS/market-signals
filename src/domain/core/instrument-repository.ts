import Instrument from './instrument';

export default interface InstrumentRepository {
  getBySymbolAndExchange(
    symbol: string,
    exchange: string
  ): Promise<Instrument | undefined>;
}
