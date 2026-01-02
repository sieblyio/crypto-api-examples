/* eslint-disable @typescript-eslint/no-unused-vars */
import { USDMClient } from 'binance';

const key = process.env.API_KEY_COM || 'APIKEY';
const secret = process.env.API_SECRET_COM || 'APISECRET';

const client = new USDMClient({
  api_secret: secret,
  api_key: key,
  beautifyResponses: true,
});

const symbol = 'BTCUSDT';

async function start() {
  try {
    // ### This is for Hedge Mode Only ###
    // assuming you currently have a open position, and you want to modify the SL order.

    /**
     * first we get all long and short positions status
     * the result of this method in hedge mode is array of two objects
     * first index for LONG and second index for SHORT
     */
    const [
      { positionAmt: longAmount, ...long },
      { positionAmt: shortAmount, ...short },
    ]: any = await client.getPositionsV3({ symbol });

    // if longAmount is bigger than 0 means we have open long position and if shortAmount is below 0 means we have open short position
    const hasLong = parseFloat(longAmount) > 0;
    const hasShort = parseFloat(shortAmount) < 0;
    const hasOpen = hasLong || hasShort;

    // if we have any open position then we continue
    if (hasOpen) {
      // we get ourstop loss here
      const orders = await client.getAllOpenOrders({ symbol });
      const stopOrders =
        orders.filter(({ type }) => type === 'STOP_MARKET') ?? [];

      // we want to modify our long position SL here
      if (hasLong) {
        // we get the StopLoss order which is realted to long
        const { orderId }: any = stopOrders.find(
          ({ positionSide: ps }) => ps == 'LONG',
        );

        // if it exists, cancel it.
        if (orderId) {
          await client.cancelOrder({ symbol, orderId });
        }

        const { markPrice }: any = long;

        // creating SL order
        const result = await client.submitNewAlgoOrder({
          positionSide: 'SHORT',
          priceProtect: 'true',
          side: 'SELL',
          triggerPrice: '0.123',
          symbol: 'BTCUSDT',
          type: 'STOP_MARKET',
          algoType: 'CONDITIONAL',
          closePosition: 'true',
        });
        console.log('SL Modifiled sell result: ', result);
      }
    } else {
      console.log('No Open position found');
    }
  } catch (e) {
    console.error('market sell failed: ', e);
  }
}

start();
