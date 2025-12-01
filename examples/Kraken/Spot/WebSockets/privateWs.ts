// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  DefaultLogger,
  LogParams,
  WebsocketClient,
  WS_KEY_MAP,
  WSSpotTopic,
  WSTopicRequest,
} from '@siebly/kraken-api';

const customLogger: DefaultLogger = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trace: (...params: LogParams): void => {
    // console.log('trace', ...params);
  },
  info: (...params: LogParams): void => {
    console.log('info', ...params);
  },
  error: (...params: LogParams): void => {
    console.error('error', ...params);
  },
};

async function start() {
  const account = {
    key: process.env.API_SPOT_KEY || 'keyHere',
    secret: process.env.API_SPOT_SECRET || 'secretHere',
  };

  /**
   * The WebsocketClient is the core class to manage WebSocket subscriptions. Give it the topics you want to subscribe to, and it will handle the rest:
   * - Connection management (connect, disconnect, reconnect)
   * - Authentication for private topics
   * - Subscription management (subscribe, unsubscribe, resubscribe on reconnect)
   * - Message handling (dispatch messages to appropriate handlers)
   *
   * All you need to do is provide the topics you want to subscribe to when calling `subscribe()`, and the client will take care of the rest.
   *
   * Here we create a WebsocketClient instance with API key/secret for private topic subscriptions.
   *
   * In terms of product groups such as Spot, Derivatives, etc., the WebsocketClient understand the product group from the WsKey you provide when subscribing. For example, using `WS_KEY_MAP.spotPrivateV2` indicates that the subscription is for Spot private topics, as shown below.
   *
   * Refer to WS_KEY_MAP in the source code for all available WsKey options.
   */
  const client = new WebsocketClient(
    {
      apiKey: account.key,
      apiSecret: account.secret,
    },
    customLogger,
  );

  client.on('open', (data) => {
    console.log('connected ', data?.wsKey);
  });

  // Data received
  client.on('message', (data) => {
    console.info('data received: ', JSON.stringify(data));
  });

  // Something happened, attempting to reconnect
  client.on('reconnecting', (data) => {
    console.log('reconnect: ', data);
  });

  // Reconnect successful
  client.on('reconnected', (data) => {
    console.log('reconnected: ', data);
  });

  // Connection closed. If unexpected, expect reconnect -> reconnected.
  client.on('close', (data) => {
    console.error('close: ', data);
  });

  // Reply to a request, e.g. "subscribe"/"unsubscribe"/"authenticate"
  client.on('response', (data) => {
    console.info('server reply: ', JSON.stringify(data), '\n');
  });

  client.on('exception', (data) => {
    console.error('exception: ', data);
  });

  client.on('authenticated', (data) => {
    console.error('authenticated: ', data);
  });

  /**
   * The below examples demonstrate how you can subscribe to private topics.
   *
   * Note: while the documentation specifies "token" as a required parameter, the SDK will automatically:
   * - fetch the token using your API key/secret,
   * - manage token caching/refreshing,
   * - include the token in the request for you.
   *
   * So you do NOT need to manually fetch or provide the token when subscribing to private topics.
   *
   * Do note that all of these include the "spotPrivateV2" WsKey reference. This tells the WebsocketClient to use the private "wss://ws-auth.kraken.com/v2" endpoint for these private subscription requests.
   */

  try {
    // Balances, requires auth: https://docs.kraken.com/api/docs/websocket-v2/executions
    const executionsRequestWithParams: WSTopicRequest<WSSpotTopic> = {
      topic: 'executions',
      payload: {
        // below params are optional:
        snap_trades: true, // default: false
        snap_orders: true, // default: true
        order_status: true, // default: true
        // rebased: false, // default: true
        ratecounter: true, // default: false
        // users: 'all', // default: undefined
        // snapshot: true, // default: false, deprecated, use 'snap_orders' or 'snap_trades' instead
      },
    };
    client.subscribe(executionsRequestWithParams, WS_KEY_MAP.spotPrivateV2);

    // Balances, requires auth: https://docs.kraken.com/api/docs/websocket-v2/balances
    const balancesRequestWithParams: WSTopicRequest<WSSpotTopic> = {
      topic: 'balances',
      payload: {
        // below params are optional:
        // snapshot: true, // default: true
        // rebased: false, // default: true
        // users: 'all',
      },
    };
    client.subscribe(balancesRequestWithParams, WS_KEY_MAP.spotPrivateV2);

    // Orders Level 3, requires auth: https://docs.kraken.com/api/docs/websocket-v2/level3
    const ordersRequestWithParams: WSTopicRequest<WSSpotTopic> = {
      // topic: 'level3',
      topic: 'level3',
      payload: {
        symbol: ['ALGO/USD', 'BTC/USD'],
        // below params are optional:
        // depth: 10, // default: 10, Possible values: [10, 100, 1000]
        // snapshot: true, // default: true
      },
    };

    client.subscribe(ordersRequestWithParams, WS_KEY_MAP.spotPrivateV2);
  } catch (e) {
    console.error('Req error: ', e);
  }
}

start();
