#!/usr/bin/env ts-node
/**
 * Unified script to sync examples from exchange SDK repos to crypto-api-examples
 *
 * Usage:
 *   npm run sync:binance
 *   npm run sync:bitget
 *   etc.
 *
 * Or directly:
 *   ts-node scripts/sync-examples.ts binance
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Get script directory - works with both CommonJS and ESM
// When running with ts-node --esm, process.argv[1] contains the script path
// eslint-disable-next-line @typescript-eslint/no-var-requires
const scriptPath = (() => {
  if (typeof require !== 'undefined' && require.main) {
    return require.main.filename;
  }
  // For ESM mode (ts-node --esm), use process.argv[1]
  if (process.argv[1]) {
    return process.argv[1];
  }
  // Fallback: assume we're in scripts/ directory relative to process.cwd()
  return path.join(process.cwd(), 'scripts', 'sync-examples.ts');
})();
const __dirname = path.dirname(scriptPath);

// Exchange configuration mapping
interface ExchangeConfig {
  repoName: string; // GitHub repo name (e.g., "binance", "bitget-api")
  packageName: string; // npm package name (e.g., "binance", "bitget-api")
  destFolder: string; // Destination folder name in examples/ (e.g., "Binance", "Bitget")
  excludeFolders: string[]; // Folders to exclude from copying
  repoUrl?: string; // Optional: custom GitHub URL
}

const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  binance: {
    repoName: 'binance',
    packageName: 'binance',
    destFolder: 'Binance',
    excludeFolders: ['apidoc'],
  },
  bitget: {
    repoName: 'bitget-api',
    packageName: 'bitget-api',
    destFolder: 'Bitget',
    excludeFolders: ['apidoc'],
  },
  bitmart: {
    repoName: 'bitmart-api',
    packageName: 'bitmart-api',
    destFolder: 'Bitmart',
    excludeFolders: ['apidoc'],
  },
  bybit: {
    repoName: 'bybit-api',
    packageName: 'bybit-api',
    destFolder: 'Bybit',
    excludeFolders: ['apidoc'],
  },
  coinbase: {
    repoName: 'coinbase-api',
    packageName: 'coinbase-api',
    destFolder: 'Coinbase',
    excludeFolders: ['apidoc'],
  },
  gate: {
    repoName: 'gateio-api',
    packageName: 'gateio-api',
    destFolder: 'Gate',
    excludeFolders: ['apidoc'],
  },
  kraken: {
    repoName: 'kraken-api',
    packageName: '@siebly/kraken-api',
    destFolder: 'Kraken',
    excludeFolders: ['apidoc'],
  },
  kucoin: {
    repoName: 'kucoin-api',
    packageName: 'kucoin-api',
    destFolder: 'Kucoin',
    excludeFolders: ['apidoc'],
  },
  okx: {
    repoName: 'okx-api',
    packageName: 'okx-api',
    destFolder: 'OKX',
    excludeFolders: ['apidoc'],
  },
};

// Get GitHub repo URL (assumes tiagosiebler org, can be overridden)
function getRepoUrl(repoName: string, customUrl?: string): string {
  if (customUrl) return customUrl;
  return `https://github.com/tiagosiebler/${repoName}.git`;
}

// Regex patterns for transformation (same as in individual regex scripts)
const srcImportRegex = /from\s+['"](?:\.\.\/)+src(?:\/[^'"]*)?['"]/g;

// Package-specific comment regexes (simplified - can be enhanced per exchange)
function getPackageCommentRegex(packageName: string): RegExp {
  // Escape special regex characters in package name
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
    'g',
  );
}

const orCommentBlockRegex =
  /\n\s*\/\/\s*or,?\s*with the npm package\s*\n\s*\/\*[\s\S]*?from\s*['"][^'"]*['"];?\s*\*\/\s*\n/g;

function getInlineCommentRegex(packageName: string): RegExp {
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`, 'gm');
}

// OKX-specific: handle "If you cloned" comments
function getClonedRepoCommentRegex(): RegExp {
  return /\n\s*\/\/\s*If you cloned the repo[^\n]*\n(?:\s*\/\/\s*(?:or use the module|or if you're not using typescript)[^\n]*\n\s*\/\/\s*(?:import|const).*?\n)*/g;
}

function transformExampleContent(content: string, packageName: string): string {
  let result = content.replace(srcImportRegex, `from '${packageName}'`);

  // Remove inline comments
  result = result.replace(getInlineCommentRegex(packageName), '');

  // Remove package comment lines
  result = result.replace(getPackageCommentRegex(packageName), '\n\n');

  // Remove block comments
  result = result.replace(orCommentBlockRegex, '\n\n');

  // OKX-specific: remove "If you cloned" comments
  if (packageName === 'okx-api') {
    result = result.replace(getClonedRepoCommentRegex(), '\n');
    result = result.replace(/^\s*\/\/\s*If you cloned the repo[^\n]*\n/gm, '');
  }

  // Clean up multiple newlines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

function getAllFiles(
  dirPath: string,
  excludeFolders: string[],
  arrayOfFiles: string[] = [],
): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeFolders.includes(file)) {
        getAllFiles(fullPath, excludeFolders, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function copyAndTransformExamples(
  config: ExchangeConfig,
  sourceDir: string,
  destDir: string,
): number {
  console.log(`\n📦 Copying examples from ${config.repoName}...`);
  console.log(`   Source: ${sourceDir}`);
  console.log(`   Destination: ${destDir}`);
  console.log(`   Excluding folders: ${config.excludeFolders.join(', ')}`);

  const allFiles = getAllFiles(sourceDir, config.excludeFolders);
  console.log(`   Found ${allFiles.length} files to process`);

  let copiedCount = 0;

  allFiles.forEach((sourceFile) => {
    const relativePath = path.relative(sourceDir, sourceFile);
    const destFile = path.join(destDir, relativePath);
    const destDirPath = path.dirname(destFile);

    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    const content = fs.readFileSync(sourceFile, 'utf-8');
    const ext = path.extname(sourceFile);
    let transformedContent = content;

    if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
      transformedContent = transformExampleContent(content, config.packageName);
    }

    fs.writeFileSync(destFile, transformedContent, 'utf-8');
    copiedCount++;
  });

  console.log(`\n✅ Copied ${copiedCount} files\n`);
  return copiedCount;
}

function cloneOrUpdateRepo(
  repoName: string,
  repoUrl: string,
  targetDir: string,
): void {
  const parentDir = path.dirname(targetDir);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  if (fs.existsSync(targetDir)) {
    console.log(`📥 Updating existing repo: ${repoName}`);
    try {
      execSync('git fetch origin && git reset --hard origin/main', {
        cwd: targetDir,
        stdio: 'inherit',
      });
    } catch {
      console.log('⚠️  Failed to update, trying origin/master...');
      try {
        execSync('git fetch origin && git reset --hard origin/master', {
          cwd: targetDir,
          stdio: 'inherit',
        });
      } catch (e) {
        console.error(`❌ Failed to update repo: ${e}`);
        throw e;
      }
    }
  } else {
    console.log(`📥 Cloning repo: ${repoName}`);
    execSync(`git clone ${repoUrl} ${targetDir}`, {
      cwd: parentDir,
      stdio: 'inherit',
    });
  }
}

function createBranch(branchName: string, repoRoot: string): void {
  try {
    execSync(`git checkout -b ${branchName}`, {
      stdio: 'inherit',
      cwd: repoRoot,
    });
  } catch {
    // Branch might already exist
    execSync(`git checkout ${branchName}`, {
      stdio: 'inherit',
      cwd: repoRoot,
    });
  }
}

function commitChanges(
  exchange: string,
  config: ExchangeConfig,
  repoRoot: string,
): void {
  // Only add changes in the specific exchange examples directory
  const exchangeExamplesPath = `examples/${config.destFolder}/`;

  // Check if there are any changes in the examples directory
  try {
    const status = execSync(`git status --porcelain ${exchangeExamplesPath}`, {
      encoding: 'utf-8',
      cwd: repoRoot,
    });

    if (!status.trim()) {
      console.log(`⚠️  No changes detected in ${exchangeExamplesPath}`);
      return;
    }

    execSync(`git add ${exchangeExamplesPath}`, {
      stdio: 'inherit',
      cwd: repoRoot,
    });

    // Verify something was staged before committing
    const stagedStatus = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
      cwd: repoRoot,
    });

    if (!stagedStatus.trim()) {
      console.log('⚠️  No files were staged for commit');
      return;
    }

    execSync(`git commit -m "chore: sync ${exchange} examples from SDK"`, {
      stdio: 'inherit',
      cwd: repoRoot,
    });
  } catch (error) {
    console.error(`❌ Failed to commit changes: ${error}`);
    throw error;
  }
}

function pushBranch(branchName: string, repoRoot: string): void {
  execSync(`git push -u origin ${branchName}`, {
    stdio: 'inherit',
    cwd: repoRoot,
  });
}

function createPullRequest(exchange: string, branchName: string): void {
  const title = `Sync ${exchange} examples from SDK`;
  const body = `This PR syncs examples from the ${exchange} SDK repository.

Automatically generated by sync-examples script.`;

  try {
    // Try using gh CLI if available
    execSync(`gh pr create --title "${title}" --body "${body}" --base main`, {
      stdio: 'inherit',
    });
  } catch {
    console.log('\n⚠️  GitHub CLI not available. Please create PR manually:');
    console.log(`   Branch: ${branchName}`);
    console.log(`   Title: ${title}`);
  }
}

async function syncExchange(
  exchange: string,
  options: { skipBuild?: boolean; skipPR?: boolean } = {},
): Promise<void> {
  const config = EXCHANGE_CONFIGS[exchange.toLowerCase()];

  if (!config) {
    console.error(`❌ Unknown exchange: ${exchange}`);
    console.error(
      `   Available exchanges: ${Object.keys(EXCHANGE_CONFIGS).join(', ')}`,
    );
    process.exit(1);
  }

  // __dirname is scripts/, so repoRoot is one level up
  const repoRoot = path.join(__dirname, '..');
  // SDK repos are siblings of crypto-api-examples
  const sdkRoot = path.join(repoRoot, '..');
  const sourceDir = path.join(sdkRoot, config.repoName, 'examples');
  const destDir = path.join(repoRoot, 'examples', config.destFolder);
  const repoUrl = getRepoUrl(config.repoName, config.repoUrl);

  console.log(`\n🚀 Syncing ${exchange} examples`);
  console.log(`   Repo: ${config.repoName}`);
  console.log(`   Package: ${config.packageName}`);
  console.log(`   Destination: ${config.destFolder}\n`);

  // Step 1: Clone or update the SDK repo
  const sdkRepoDir = path.join(sdkRoot, config.repoName);
  cloneOrUpdateRepo(config.repoName, repoUrl, sdkRepoDir);

  // Step 2: Copy and transform examples
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  copyAndTransformExamples(config, sourceDir, destDir);

  // Step 3: Run build/lint if not skipped
  if (!options.skipBuild) {
    console.log('🔨 Running build and lint checks...\n');
    try {
      execSync('npm run lint:fix', { cwd: repoRoot, stdio: 'inherit' });
      execSync('npm run format', { cwd: repoRoot, stdio: 'inherit' });
      execSync('npm run lint', { cwd: repoRoot, stdio: 'inherit' });
      console.log('\n✅ Build checks passed!\n');
    } catch {
      console.error(
        '\n❌ Build checks failed. Please fix errors before creating PR.',
      );
      process.exit(1);
    }
  }

  // Step 4: Check for changes and create PR if needed
  if (!options.skipPR) {
    // Check specifically for changes in the exchange examples directory
    const exchangeExamplesPath = `examples/${config.destFolder}/`;
    let hasChanges = false;

    try {
      const status = execSync(
        `git status --porcelain ${exchangeExamplesPath}`,
        {
          encoding: 'utf-8',
          cwd: repoRoot,
        },
      );
      hasChanges = status.trim().length > 0;
    } catch {
      // If git status fails, check if directory exists and has files
      hasChanges = fs.existsSync(destDir);
    }

    if (hasChanges) {
      console.log('📝 Changes detected. Creating PR...\n');
      const branchName = `sync/${exchange}-examples-${Date.now()}`;

      createBranch(branchName, repoRoot);
      commitChanges(exchange, config, repoRoot);
      pushBranch(branchName, repoRoot);
      createPullRequest(exchange, branchName);

      console.log(`\n✅ PR created: ${branchName}\n`);
    } else {
      console.log('✅ No changes detected. Nothing to commit.\n');
    }
  }
}

// Main execution
const args = process.argv.slice(2);
const exchange = args.find((arg) => !arg.startsWith('--'));
const skipBuild = args.includes('--skip-build');
const skipPR = args.includes('--skip-pr');

if (!exchange) {
  console.error(
    'Usage: ts-node scripts/sync-examples.ts <exchange> [--skip-build] [--skip-pr]',
  );
  console.error(
    `\nAvailable exchanges: ${Object.keys(EXCHANGE_CONFIGS).join(', ')}`,
  );
  console.error('\nOptions:');
  console.error('  --skip-build    Skip running lint/format checks');
  console.error(
    '  --skip-pr       Skip creating PR (useful for local testing)',
  );
  process.exit(1);
}

syncExchange(exchange, { skipBuild, skipPR }).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
