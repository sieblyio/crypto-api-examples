Connecting to Bitmart's private spot WebSocket streams is straightforward with the WebsocketClient.

- Install the Bitmart JavaScript SDK via NPM: `npm install bitmart-api`.
- Import the WebsocketClient and (optionally) a custom logger.
- Create an authenticated WebsocketClient instance with your API credentials (`apiKey`, `apiSecret`, `apiMemo`).
- Configure event handlers for key events such as `open`, `update`, `response`, `reconnect`, `reconnected`, `close`, `authenticated`, and `exception`.
- Subscribe to private spot topics and process incoming updates in real time.

In this example, we:

- Open an authenticated private WebSocket connection for spot.
- Subscribe to order progress updates for `BTC_USDT`.
- Demonstrate an additional (commented) private balance update topic.

This setup allows you to consume live account-level trading events without polling REST endpoints. 
