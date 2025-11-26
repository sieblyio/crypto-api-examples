import { USDMClient } from 'binance';

const client = new USDMClient({
  testnet: true,
  // keepAlive: true,
  // ... any other params,
});

client
  .getRecentTrades({
    symbol: 'BTCUSDT',
    limit: 2,
  })
  .then((r) => console.log('results: ', r))
  .catch((e) => console.error('exception: ', e));
