import { FoxbitMdService } from './infra/foxbit-md-service';
import EventEmitter from 'events';

async function main() {
  const eventEmiter = new EventEmitter();
  const md = new FoxbitMdService(eventEmiter);
  md.subscribe('btcbrl');
  await new Promise(r => setTimeout(r, 10000));
  md.unsubscribe('btcbrl');
}

main();
