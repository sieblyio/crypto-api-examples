Easily start calling Bitget's V2 spot REST APIs in JavaScript.

- Install the Bitget JavaScript SDK via NPM: `npm install bitget-api`.
- Import the RestClientV2 class (REST API wrapper for Bitget's V2 APIs) and WebsocketClientV2.
  - Note: for Bitget's V3 (UTA) APIs, you can use RestClientV3 and WebsocketClientV3 instead. Examples can be found on GitHub.
- Create client instances with your API credentials (different key types are automatically detected & handled).
- Call REST API methods as functions and await the promise containing the response.

In this example, we:

- Open a private WebSocket connection and subscribe to account and order updates for spot.
- Query account spot balances and find the available BTC balance.
- Query symbol trading rules for `BTCUSDT` and select the minimum trade quantity.
- Submit a market sell order using that quantity and log the response.

This setup demonstrates using REST and private WebSocket streams together, so you can place trades while receiving live account updates at the same time.

For a full map of available REST API methods, check out the endpoint reference below.
