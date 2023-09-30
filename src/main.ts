import FoxbitMdService from './infra/foxbit-md-service';
import EventEmitter from 'events';
import WsAdapter from './infra/ws-adapter';
import AxiosAdapter from './infra/axios-adapter';

async function main() {
  const eventEmitter = new EventEmitter();
  eventEmitter.on('arbitrageSignal', data => {
    console.log(data);
  });

  /*  eventEmitter.on('onCandlestick.foxbit.btcbrl', data => {
    console.log(data);
  });

  eventEmitter.on('onCandlestick.binance.btcbrl', data => {
    console.log(data);
  });*/

  const wsFoxbit = new WsAdapter('wss://api.foxbit.com.br/');
  const restFoxbit = new AxiosAdapter('https://api.foxbit.com.br/rest/v3/');
  const mdFoxbit = new FoxbitMdService(eventEmitter, wsFoxbit, restFoxbit);

  /*  mdFoxbit.subscribeCandlestick(
     'btcbrl',
     '1h',
     new Date('2022-07-18T00:00'),
     new Date('2022-08-19T12:00')
   );*/

  /*  console.log(
    await mdFoxbit.getCandlestick(
      'btcbrl',
      '1h',
      new Date('2022-07-18T00:00'),
      new Date('2022-08-19T12:00')
    )
  );*/

  /*  const wsBinance = new WsAdapter('wss://stream.binance.com:9443/ws');
  const restBinance = new AxiosAdapter('https://api.binance.com/api/v3/');
  const mdBinance = new BinanceMdService(eventEmitter, wsBinance, restBinance);*/

  // const bt = new Backtest(
  //   new Date('2022-07-18T00:00'),
  //   new Date('2022-08-20T12:00'),
  //   mdFoxbit,
  //   '1h',
  //   'btcbrl',
  //   'bb',
  //   {}
  // );

  bt.start();
  /*
   mdBinance.subscribeCandlestick('btcbrl', '1h');
   console.log(
    await mdBinance.getCandlestick(
      'btcbrl',
      '1h',
      new Date('2022-07-18T00:00'),
      new Date('2022-08-19T12:00')
    )
  );*/

  /*  const symbols = [
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
   });*/
}

void main();
