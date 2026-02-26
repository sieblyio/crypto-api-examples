Bitget's V3 (UTA) WebSocket API (WS-API) lets you send trading commands over a persistent, authenticated WebSocket connection, reducing overhead compared to separate REST requests.

The SDK's WebsocketAPIClient wraps this flow in promise-based helper methods, so each WS-API request can be awaited like a regular API call.

To use the WebSocket API:

- Install the Bitget JavaScript SDK via NPM: `npm install bitget-api`.
- Import the dedicated WebsocketAPIClient.
- Create an authenticated WebsocketAPIClient instance with your API credentials.
- Optionally call `connectWSAPI()` before submitting commands to warm up the connection.
- Call dedicated WS-API methods and await their responses.

In this example, we:

- Submit a new spot order.
- Submit a batch of spot orders.
- Cancel a single order.
- Cancel a batch of orders.

Note that:

- This requires Bitget V3/UTA API credentials.
- Responses are logged per operation, with errors handled in separate `try/catch` blocks.
- For batch endpoints, inspect per-order result codes in the response payload.
