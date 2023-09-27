import { MdService } from '../../src/domain/market-data/md.service';
import { FoxbitProvider } from '../../src/infra/foxbit-provider';
import EventEmitter from 'events';

test('', () => {
  const provider = new FoxbitProvider();
  const eventEmmiter = new EventEmitter();
  const mdService = new MdService(provider, eventEmmiter);
  //mdService.subscribe('btcbrl');
});
