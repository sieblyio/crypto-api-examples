import { FuturesClientV2 } from 'bitmart-api';

const client = new FuturesClientV2();

async function getFuturesTickers() {
  try {
    const tickers = await client.getFuturesContractDetails();

    console.log('Tickers: ', JSON.stringify(tickers, null, 2));
  } catch (e) {
    console.error('Req error: ', e);
  }
}

getFuturesTickers();
