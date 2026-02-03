# Siebly.io Crypto API Examples

This repository contains comprehensive example code for using the Siebly.io Crypto API SDKs with various cryptocurrency exchanges. All examples are written in TypeScript and demonstrate REST API, WebSocket, and authentication patterns.

## Supported Exchanges

- **Binance** - Spot, Futures, Portfolio Margin, WebSockets
- **Bitget** - V2 Classic & V3 UTA, Spot, Futures, WebSockets
- **Bitmart** - Spot, Futures, WebSockets
- **Bybit** - V5 API, Spot, Futures, WebSockets
- **Coinbase** - Advanced Trade, Coinbase App, Institutional APIs
- **Gate.io** - Spot, Futures, WebSockets
- **Kraken** - Spot, Derivatives, WebSockets
- **Kucoin** - Spot, Futures, WebSockets (V1 & Pro V2)
- **OKX** - Spot, Futures, WebSockets, Multiple Markets (Global/EEA/US)

## Repository Structure

```
examples/
├── Binance/
│   ├── Auth/              # Authentication examples (RSA, Ed25519)
│   ├── Rest/              # REST API examples
│   │   ├── Spot/
│   │   ├── Futures/
│   │   ├── Portfolio Margin/
│   │   └── misc/
│   └── WebSockets/         # WebSocket examples
│       ├── Public/
│       ├── Private(userdata)/
│       ├── WS-API/
│       ├── Demo/
│       └── Misc/
├── Bitget/
│   ├── Auth/
│   ├── V2 - Classic/      # V2 Classic API examples
│   │   ├── Rest/
│   │   └── Websocket/
│   └── V3 - UTA/          # V3 Unified Trading Account examples
│       ├── Rest/
│       ├── Websocket/
│       └── WS-API/
├── Bitmart/
│   ├── Auth/
│   ├── Rest/
│   │   ├── Spot/
│   │   └── Futures/
│   └── Websocket/
├── Bybit/
│   ├── Auth/
│   ├── Rest/              # V5 REST API examples
│   └── Websocket/
│       ├── Public/
│       ├── Private/
│       └── WS-API/
├── Coinbase/
│   ├── AdvancedTrade/     # Advanced Trade API
│   ├── CoinbaseApp/       # Coinbase App API
│   └── Institutional/     # Institutional APIs
│       ├── CBExchange/
│       └── CBInternationalExchange/
├── Gate/
│   ├── Rest/
│   │   ├── spot/
│   │   └── futures/
│   └── Websocket/
│       └── WS-API/
├── Kraken/
│   ├── Spot/
│   │   ├── Public/
│   │   ├── Private/
│   │   └── WebSockets/
│   └── Derivatives/
│       ├── Public/
│       ├── Private/
│       └── WebSockets/
├── Kucoin/
│   ├── Auth/
│   ├── Rest/
│   └── WebSockets/        # V1 & Pro V2 examples
│       └── WS-API/
└── OKX/
    ├── Auth/
    ├── Rest/
    └── Websocket/
        └── WS-API/
```

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd crypto-api-examples
```

2. Install dependencies:

```bash
npm install
```

This will install all required SDK packages:

- `binance`
- `bitget-api`
- `bitmart-api`
- `bybit-api`
- `coinbase-api`
- `gateio-api`
- `@siebly/kraken-api`
- `kucoin-api`
- `okx-api`

## Usage

### Running Examples

Each example file is a standalone TypeScript file that can be executed directly. Examples use environment variables for API credentials.

**Set up environment variables:**

```bash
export API_KEY="your-api-key"
export API_SECRET="your-api-secret"
export API_PASS="your-api-passphrase"  # If required by exchange
```

**Run an example:**

```bash
npx ts-node examples/Binance/Rest/Spot/rest-spot-public.ts
```

### Example Categories

- **Public APIs**: Examples that don't require authentication (market data, tickers, etc.)
- **Private APIs**: Examples requiring API keys (trading, account management, etc.)
- **WebSockets**: Real-time data streaming examples
- **Auth**: Authentication method examples (HMAC, RSA, Ed25519)
- **WS-API**: WebSocket API client examples for advanced use cases

### Code Structure

All examples follow a consistent pattern:

- Import the SDK client from the npm package
- Initialize the client with credentials (if needed)
- Make API calls or set up WebSocket connections
- Handle responses and errors

Example:

```typescript
import { RestClient } from 'binance';

const client = new RestClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
});

// Make API calls
const result = await client.getAccountInfo();
console.log(result);
```

## Development

### Scripts

- `npm run lint` - Run ESLint on all example files
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run build` - Update latest SDK versions and build examples
- `npm run buildfast` - Build examples without updating SDKs

### Contributing

When adding new examples:

1. Follow the existing directory structure
2. Use environment variables for credentials
3. Include clear comments explaining the example
4. Ensure code passes linting: `npm run lint`
5. Format code: `npm run format`

## SDK Documentation

For detailed SDK documentation and API reference, visit:

- [Binance SDK](https://github.com/tiagosiebler/binance)
- [Bitget SDK](https://github.com/tiagosiebler/bitget-api)
- [Bitmart SDK](https://github.com/tiagosiebler/bitmart-api)
- [Bybit SDK](https://github.com/tiagosiebler/bybit-api)
- [Coinbase SDK](https://github.com/tiagosiebler/coinbase-api)
- [Gate.io SDK](https://github.com/tiagosiebler/gateio-api)
- [Kraken SDK](https://github.com/tiagosiebler/kraken-api)
- [Kucoin SDK](https://github.com/tiagosiebler/kucoin-api)
- [OKX SDK](https://github.com/tiagosiebler/okx-api)

## License

ISC
