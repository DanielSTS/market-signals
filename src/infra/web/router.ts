import UseCaseFactory from '../../use-case-factory';
import HttpServer from './http-server';

export default class Router {
  constructor(http: HttpServer) {
    http.on('post', '/backtests', async function (params: any, body: any) {
      const createBacktest = await UseCaseFactory.CreateBacktest();
      return createBacktest.execute({ ...body });
    });

    http.on('get', '/backtests', async function (params: any, body: any) {
      const getBacktests = await UseCaseFactory.GetBacktests();
      return getBacktests.execute();
    });

    http.on('get', '/backtests/:id', async function (params: any, body: any) {
      const getBacktests = await UseCaseFactory.GetBacktestById();
      return getBacktests.execute(params);
    });
  }
}
