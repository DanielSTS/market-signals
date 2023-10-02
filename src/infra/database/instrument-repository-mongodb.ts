import { Collection, Db } from 'mongodb';
import Instrument from '../../domain/core/instrument';
import Exchange from '../../domain/core/exchange';
import InstrumentRepository from '../../domain/repository/instrument-repository';

export default class InstrumentRepositoryMongoDb
  implements InstrumentRepository
{
  private readonly collection: Collection;
  constructor(db: Db) {
    this.collection = db.collection('instruments');
  }

  async getBySymbolAndExchange(
    symbol: string,
    exchange: string
  ): Promise<Instrument> {
    try {
      const instrument = await this.collection.findOne({ symbol, exchange });
      if (instrument) {
        return new Instrument(
          instrument.symbol,
          new Exchange(instrument.exchange),
          instrument.minQuantity,
          instrument.priceIncrement
        );
      }
      throw new Error('Instrument not found');
    } catch (error) {
      throw new Error(`Error getting instrument from MongoDB ${error}`);
    }
  }
}
