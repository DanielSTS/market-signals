import { FoxbitMdService } from './infra/foxbit-md-service';
import EventEmitter from 'events';
import { ResilientWsAdapter } from './infra/ws-adapter';
import { BinanceMdService } from './infra/binance-md-service';

async function main() {
  const eventEmiter = new EventEmitter();
  eventEmiter.on('onOrderBook.foxbit.btcbrl', data => {
    console.log(data);
  });
  eventEmiter.on('onOrderBook.binance.btcbrl', data => {
    console.log(data);
  });
  const ws = new ResilientWsAdapter('wss://api.foxbit.com.br/');
  const md = new FoxbitMdService(eventEmiter, ws);
  md.subscribe('btcbrl');

  const wsBinance = new ResilientWsAdapter('wss://stream.binance.com:9443/ws');
  const mdBinance = new BinanceMdService(eventEmiter, wsBinance);
  mdBinance.subscribe('btcbrl');
}

main();
