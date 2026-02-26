Easily start calling Bybit's V5 REST APIs in JavaScript.

- Install the Bybit JavaScript SDK via NPM: `npm install bybit-api`.
- Import the RestClientV5 class (REST API wrapper for Bybit's V5 REST APIs).
- Create an instance with your API credentials (different key types are automatically detected & handled).
- Call the desired REST API methods as functions and await the promise containing the response.

In this example, we:

- Call the endpoint to query a list of linear perpetual futures positions on your Bybit account, and log the response to console.
- Submit a basic linear futures market buy order, and log the result to console.
- Submit a basic linear futurse market sell order, and log the results to console.
- Note: the example assumes one-way position mode. For hedge-mode, you will need to indicate the position side with your order (via positionIdx:1 for the long side or positionIdx:2 for the short side).

For a full map of available REST API methods, check out the endpoint reference below.
