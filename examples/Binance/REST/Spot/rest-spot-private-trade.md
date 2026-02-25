Using Binance's REST APIs in JavaScript is easy!

- Import the MainClient (REST API wrapper for Binance's spot & margin APIs)
- Create an instance with your API credentials.
- Call the desired REST API methods as functions and await the promise containing the response.

In this example, we:

- Query stablecoin balance
- Run a small calculation on the asset quantity to trade.
- Submit a new spot order to open a position for that symbol.

Finally, we demonstrate how to:

- Process the order response to determine the filled quantity.
- Send a sell order to exit the spot position in full.

For a full map of available REST API methods, check out the endpoint reference below.
