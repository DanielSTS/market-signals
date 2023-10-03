import 'dotenv/config';
import ExpressAdapter from './infra/web/express-adapter';
import Router from './infra/web/router';

async function main() {
  const expressAdapter = new ExpressAdapter();
  new Router(expressAdapter);
  expressAdapter.listen(Number(process.env.EXPRESS_PORT) || 3000);
}

main();
