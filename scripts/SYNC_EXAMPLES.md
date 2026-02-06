# Sync Examples Script

This script automates the process of syncing example files from exchange SDK repositories to the `crypto-api-examples` repository.

## Usage

### Local Usage

Run the sync script for a specific exchange:

```bash
npm run sync:binance
npm run sync:bitget
npm run sync:bitmart
npm run sync:bybit
npm run sync:coinbase
npm run sync:gate
npm run sync:kraken
npm run sync:kucoin
npm run sync:okx
```

Or use the generic command:

```bash
npm run sync <exchange>
```

### Options

- `--skip-build`: Skip running lint/format checks (useful for testing)
- `--skip-pr`: Skip creating PR (useful for local testing)

Example:

```bash
npm run sync binance --skip-build --skip-pr
```

## What It Does

1. **Clones/Updates SDK Repo**: Clones the exchange SDK repository (if not already present) or updates it to the latest version
2. **Copies Examples**: Copies all example files from the SDK's `examples/` folder to `crypto-api-examples/examples/<Exchange>/`
3. **Transforms Imports**:
   - Replaces relative `src` imports with package imports (e.g., `from '../../../src/index'` → `from 'binance'`)
   - Removes comment lines containing package names
   - Removes "or" comment patterns
   - Handles exchange-specific comment patterns (e.g., OKX's "If you cloned" comments)
4. **Runs Build Checks**: Runs linting and formatting to ensure code quality
5. **Creates PR**: If changes are detected, creates a new branch, commits changes, and opens a pull request

## GitHub Actions

The script can also be run via GitHub Actions workflow:

### Manual Trigger

1. Go to the Actions tab in GitHub
2. Select "Sync Examples from SDKs"
3. Click "Run workflow"
4. Select the exchange to sync
5. Click "Run workflow"

### Scheduled Runs

The workflow runs daily at 2 AM UTC and syncs all exchanges automatically.

### Workflow Behavior

- For manual triggers: Syncs only the selected exchange
- For scheduled runs: Syncs all exchanges sequentially
- Creates separate PRs for each exchange that has changes
- Only creates PRs if there are actual changes

## Exchange Configuration

Each exchange is configured in `scripts/sync-examples.ts`:

```typescript
{
  repoName: 'binance',           // GitHub repo name
  packageName: 'binance',        // npm package name
  destFolder: 'Binance',         // Destination folder name
  excludeFolders: ['apidoc'],    // Folders to exclude
}
```

## Troubleshooting

### "Source directory not found"

Make sure the SDK repository exists in the parent directory of `crypto-api-examples`. The script expects:

```
GITHUB_REPOS/
├── crypto-api-examples/
└── binance/          (or other SDK repo)
```

### Build checks fail

If linting/formatting fails:

1. Fix the errors manually
2. Run `npm run lint:fix` and `npm run format`
3. Commit the fixes
4. Re-run the sync script

### PR creation fails

If PR creation fails:

1. Check that GitHub CLI (`gh`) is installed and authenticated
2. Verify you have write permissions to the repository
3. Check if a PR with the same changes already exists

## Adding a New Exchange

To add a new exchange:

1. Add the configuration to `EXCHANGE_CONFIGS` in `scripts/sync-examples.ts`
2. Add the npm script to `package.json`:
   ```json
   "sync:newexchange": "npm run sync newexchange"
   ```
3. Update the GitHub Action workflow to include the new exchange in the options
