import EventEmitter from 'events';
import FoxbitMdService from './foxbit-md-service';
import WsAdapter from '../../infra/web/ws-adapter';
import AxiosAdapter from '../../infra/web/axios-adapter';
import BinanceMdService from './binance-md-service';
import { MdService } from '../../domain/market-data/md.service';

export interface ExchangeFactory {
  createMdService(exchange: string): MdService;
}

export default class MdServiceFactory implements ExchangeFactory {
  constructor(private readonly eventEmitter: EventEmitter) {}

  createMdService(exchange: string): MdService {
    switch (exchange) {
      case 'foxbit': {
        const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
        const restFoxbit = new AxiosAdapter(
          'https://api.foxbit.com.br/rest/v3/'
        );
        return new FoxbitMdService(this.eventEmitter, wsFoxbit, restFoxbit);
      }

      case 'binance': {
        const wsBinance = new WsAdapter('wss://api.binance.com/');
        const restBinance = new AxiosAdapter('https://api.binance.com/');
        return new BinanceMdService(this.eventEmitter, wsBinance, restBinance);
      }

      default:
        throw new Error('Unsupported exchange');
    }
  }
}
