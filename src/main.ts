import { FoxbitMdService } from './infra/foxbit-md-service';
import EventEmitter from 'events';
import { ResilientWsAdapter } from './infra/ws-adapter';
import { BinanceMdService } from './infra/binance-md-service';
import { Arbitrage, ArbitrageParams } from './domain/strategy/arbitrage';

async function main() {
  const eventEmitter = new EventEmitter();
  eventEmitter.on('arbitrageSignal', data => {
    console.log(data);
  });
  const wsFoxbit = new ResilientWsAdapter('wss://api.foxbit.com.br/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit);

  const wsBinance = new ResilientWsAdapter('wss://stream.binance.com:9443/ws');
  const mdBinance = new BinanceMdService(eventEmitter, wsBinance);

  const symbols = [
    'btcbrl',
    'usdtbrl',
    'ethbrl',
    'bnbbrl',
    'dogebrl',
    'ltcbrl'
  ];

  symbols.forEach(symbol => {
    const params: ArbitrageParams = {
      symbolA: symbol,
      exchangeA: 'foxbit',
      symbolB: symbol,
      exchangeB: 'binance',
      spread: 0.1
    };

    mdFoxbit.subscribe(symbol);
    mdBinance.subscribe(symbol);
    new Arbitrage(eventEmitter, params);
  });
}

void main();
