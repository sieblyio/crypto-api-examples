Connecting to Bitget's V3 (UTA) private WebSocket streams is straightforward with the WebsocketClientV3.

- Install the Bitget JavaScript SDK via NPM: `npm install bitget-api`.
- Import the WebsocketClientV3 and WS_KEY_MAP utilities.
- Create an authenticated WebsocketClientV3 instance with your API credentials.
- Configure event handlers for key events such as `update`, `response`, `reconnect`, `reconnected`, and `exception`.
- Subscribe to private topics and handle incoming account events in real time.

In this example, we:

- Subscribe to private account events on the UTA connection.
- Subscribe to `account`, `position`, `fill`, and `order` topics in a single batched request.
- Inspect currently tracked private subscriptions after a short delay.

This setup allows you to receive real-time account activity updates without polling REST endpoints.
