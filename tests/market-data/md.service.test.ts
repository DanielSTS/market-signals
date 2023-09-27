import { FoxbitMdService } from '../../src/infra/foxbit-md-service';
import EventEmitter from 'events';

test('', () => {
  const eventEmiter = new EventEmitter();
  const mdService = new FoxbitMdService(eventEmiter);
  //mdService.subscribe('btcbrl');
});
