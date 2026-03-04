Connecting to Coinbase Advanced Trade private WebSocket streams is straightforward with the WebsocketClient.

- Install the Coinbase JavaScript SDK via NPM: `npm install coinbase-api`.
- Import the WebsocketClient and create an authenticated instance with your API credentials.
- Configure event handlers for key events such as `open`, `update`, `response`, `reconnect`, `reconnected`, `close`, and `exception`.
- Subscribe to private Advanced Trade user-data topics on the `advTradeUserData` connection key.

In this example, we:

- Subscribe to `futures_balance_summary`.
- Subscribe to the `user` channel for account-level private updates.
- Demonstrate topic subscription using both simple strings and a structured `WsTopicRequest` object.

This example focuses on the Advanced Trade private group (`advTradeUserData`). The same `WebsocketClient` also supports:

- Advanced Trade public market data via `advTradeMarketData` (for topics such as heartbeats, ticker, level2, candles, and trades).
- Other Coinbase websocket groups used by the SDK (including institutional websocket examples in this repository).
- `WS_KEY_MAP` as a helper enum for choosing valid websocket connection keys.

Built-in websocket behavior includes automatic connection management per wsKey, reconnect handling, and automatic resubscribe of tracked topics after reconnect.

Any subscriptions sent on `advTradeUserData` are automatically authenticated when API credentials are available, making it easy to receive real-time private account updates.
