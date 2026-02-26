Connecting to Kucoin's private spot WebSocket streams is straightforward with the WebsocketClient.

- Install the Kucoin JavaScript SDK via NPM: `npm install kucoin-api`.
- Import the WebsocketClient and create an authenticated instance with your API credentials.
- Configure event handlers for key events such as `open`, `update`, `response`, `reconnect`, `reconnected`, `close`, and `exception`.
- Subscribe to private topics on the `spotPrivateV1` connection key.

In this example, we:

- Subscribe to private spot topics such as trade order updates, balances, and advanced orders.
- Subscribe to private margin topics (including isolated margin position updates) on the same private ws key.
- Demonstrate grouped topic subscription in batched requests.

This setup lets you track private account activity in real time without polling REST endpoints.
