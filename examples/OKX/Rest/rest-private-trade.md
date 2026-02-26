Easily start calling OKX's REST APIs in JavaScript.

- Install the OKX JavaScript SDK via NPM: `npm install okx-api`.
- Import the RestClient class (REST API wrapper for OKX's REST APIs).
- Create an instance with your API credentials (different key types are automatically detected & handled).
- Call the desired REST API methods as functions and await the promise containing the response.

In this example, we:

- Query account balances and find the available stablecoin balance (USDT).
- Prepare & submit a simple market buy, using 50% of the available balance.
- Log the responses of both REST API calls to console.

For a full map of available REST API methods, check out the endpoint reference below.
