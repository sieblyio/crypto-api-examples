Kraken's Spot WebSocket API (WS-API) lets you send commands & requests over a persistent authenticated WebSocket connection, reducing overhead compared to opening separate REST requests. If you're building a latency sensitive system this is the ideal way to avoid the overhead seen while making REST API calls.

This Kraken JavaScript SDK's `WebsocketAPIClient` wraps these WS-API requests with promise-based helper methods so each command can be awaited similarly to a REST call. All the power & benefits of WebSocket API integration without the complexity of asynchronous messaging over WebSockets.

To use the WebSocket API:

- Install the Kraken JavaScript SDK via NPM: `npm install @siebly/kraken-api`.
- Import the dedicated `WebsocketAPIClient`.
- Create an authenticated `WebsocketAPIClient` instance with your API credentials.
- Optionally inject a custom logger for request and connection diagnostics.
- Call the dedicated helper methods and await each response.

In this example, we:

- Submit spot orders including a basic limit order, a conditional order, and a trigger-based stop-loss order.
- Amend existing spot orders using either `cl_ord_id` or `order_id`.
- Cancel specific orders, cancel all spot orders, and configure a cancel-all-after timeout.
- Batch submit and batch cancel spot orders.

Note that:

- The SDK automatically fetches, caches, and refreshes the private WS token required for authenticated spot WS-API requests.
- The SDK will automatically handle any connection issues. Any midflight commands during a connection drop will see a rejected promise / throw, allowing you to easily handle and resubmit any failed requests as part of your standard error handling.
- The script includes placeholder order IDs and example order values that should be replaced before live use.
