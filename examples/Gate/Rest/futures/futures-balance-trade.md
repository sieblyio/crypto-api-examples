Easily start calling Gate's futures REST APIs in JavaScript.

- Install the Gate.com (previously Gate.io) JavaScript SDK via NPM: `npm install gateio-api`.
- Import the RestClient class (REST API wrapper for Gate's APIs).
- Create an authenticated RestClient instance with your API credentials.
- Call REST API methods as functions and await the promise containing the response.

In this example, we:

- Create both a REST client and authenticated WebSocket client.
- Subscribe to private futures balance and user trade topics.
- Query futures account balance for `usdt` settlement.
- Calculate 50% of available balance and submit a market futures order on `BTC_USDT`.
- Log API and stream responses for visibility.

This setup demonstrates a practical flow where private WebSocket subscriptions provide live account updates while REST handles account queries and order submission.

For a full map of available REST API methods, check out the endpoint reference below.
