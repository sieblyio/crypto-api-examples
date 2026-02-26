Connecting to Gate's private spot WebSocket streams is straightforward with the WebsocketClient.

- Install the Gate JavaScript SDK via NPM: `npm install gateio-api`.
- Import the WebsocketClient and create an authenticated instance with your API credentials.
- Configure event handlers for key events such as `open`, `update`, `response`, `reconnect`, `reconnected`, `close`, `authenticated`, and `exception`.
- Subscribe to private spot topics and process incoming updates in real time.

In this example, we:

- Subscribe to private spot topics including balances, orders, user trades, and price orders.
- Demonstrate both single-topic and batched multi-topic subscription patterns.
- Show that duplicate subscriptions are filtered by the client.

This setup lets you track account-level spot activity without polling REST endpoints.
