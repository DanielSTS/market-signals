import { FoxbitProvider } from './infra/foxbit-provider';
import EventEmitter from 'events';
import { MdService } from './domain/market-data/md.service';

async function main() {
  const ws = new FoxbitProvider();
  const eventEmmiter = new EventEmitter();
  const md = new MdService(ws, eventEmmiter);
  md.subscribe('btcbrl');
  await new Promise(r => setTimeout(r, 10000));
  md.unsubscribe('btcbrl');
}

main();
