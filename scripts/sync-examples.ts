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
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';

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

// Exchange-specific transformation functions
// Each exchange has slightly different patterns, so we use the exact same logic as individual scripts

interface ExchangeTransformConfig {
  srcImportRegex: RegExp;
  packageCommentRegex: RegExp;
  inlineCommentRegex: RegExp;
  blockCommentRegex?: RegExp;
  orCommentBlockRegex?: RegExp;
  clonedRepoCommentRegex?: RegExp;
}

function getExchangeTransformConfig(
  exchange: string,
  packageName: string,
): ExchangeTransformConfig {
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const scopedEscaped = escaped.replace(/\//g, '\\/');

  switch (exchange.toLowerCase()) {
    case 'binance':
      return {
        srcImportRegex: /from\s+['"](?:\.\.\/)+src(?:\/[^'"]*)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
        orCommentBlockRegex: new RegExp(
          `\\n\\s*\\/\\/\\s*or,?\\s*with the npm package\\s*\\n\\s*\\/\\*[\\s\\S]*?from\\s*['"]${escaped}['"];?\\s*\\*\\/\\s*\\n`,
          'g',
        ),
      };

    case 'okx':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*(?:If you cloned|or|or if you're not using typescript|or use the module installed)[^\\n]*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const|If you cloned|or use the module|or if you're not).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
        blockCommentRegex: new RegExp(
          `\\n\\s*\\/\\*\\*\\s*\\n\\s*\\*\\s*(?:import|const).*?['"]${escaped}['"][\\s\\S]*?\\*\\/\\s*\\n`,
          'g',
        ),
        clonedRepoCommentRegex: new RegExp(
          "\\n\\s*\\/\\/\\s*If you cloned the repo[^\\n]*\\n(?:\\s*\\/\\/\\s*(?:or use the module|or if you're not using typescript)[^\\n]*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)*",
          'g',
        ),
      };

    case 'kraken':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const|normally you should install).*?${scopedEscaped}.*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*(?:from\\s*['"]${scopedEscaped}['"]|normally you should install[^\\n]*${scopedEscaped}[^\\n]*);?\\s*$`,
          'gm',
        ),
        blockCommentRegex: new RegExp(
          `\\n\\s*\\/\\*\\*\\s*\\n\\s*\\*\\s*(?:import|const).*?${scopedEscaped}[\\s\\S]*?\\*\\/\\s*\\n`,
          'g',
        ),
      };

    case 'gate':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*(?:For an easy demonstration[^\\n]*|Import the[^\\n]*from the published version[^\\n]*|normally you should install[^\\n]*|.*${escaped}[^\\n]*)$`,
          'gm',
        ),
      };

    case 'kucoin':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.(?:js|ts))?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const|normally you should install).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*(?:from\\s*['"]${escaped}['"]|normally you should install[^\\n]*${escaped}[^\\n]*);?\\s*$`,
          'gm',
        ),
        blockCommentRegex: new RegExp(
          `\\n\\s*\\/\\*\\*\\s*\\n\\s*\\*\\s*(?:import|const).*?['"]${escaped}['"][\\s\\S]*?\\*\\/\\s*\\n`,
          'g',
        ),
      };

    case 'bitget':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
      };

    case 'bitmart':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import\\s*from\\s*npm[^\\n]*\\n\\s*)?\\/\\/\\s*(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
      };

    case 'bybit':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
        orCommentBlockRegex: new RegExp(
          `\\n\\s*\\/\\/\\s*or,?\\s*with the npm package\\s*\\n\\s*\\/\\*[\\s\\S]*?from\\s*['"]${escaped}['"];?\\s*\\*\\/\\s*\\n`,
          'g',
        ),
      };

    case 'coinbase':
      return {
        srcImportRegex:
          /from\s+['"](?:\.\.\/)+src(?:\/\/?[^'"]*)?(?:\.js)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
        blockCommentRegex: new RegExp(
          `\\n\\s*\\/\\*\\*\\s*\\n\\s*\\*\\s*(?:import|const).*?['"]${escaped}['"][\\s\\S]*?\\*\\/\\s*\\n`,
          'g',
        ),
      };

    default:
      // Fallback to basic patterns
      return {
        srcImportRegex: /from\s+['"](?:\.\.\/)+src(?:\/[^'"]*)?['"]/g,
        packageCommentRegex: new RegExp(
          `(?:\\n\\s*\\/\\/\\s*or\\s*\\n\\s*\\/\\/\\s*(?:import|const).*?\\n)+|\\n\\s*\\/\\/\\s*(?:\\/\\/\\s*)?(?:import|const).*?['"]${escaped}['"].*?\\n`,
          'g',
        ),
        inlineCommentRegex: new RegExp(
          `\\s*\\/\\/\\s*from\\s*['"]${escaped}['"];?\\s*$`,
          'gm',
        ),
      };
  }
}

function transformExampleContent(
  content: string,
  packageName: string,
  exchange: string,
): string {
  const config = getExchangeTransformConfig(exchange, packageName);

  // Step 1: Replace relative src imports with package import
  let result = content.replace(config.srcImportRegex, `from '${packageName}'`);

  // Step 2: Remove inline comments on import lines
  result = result.replace(config.inlineCommentRegex, '');

  // Step 3: Remove block comments with package imports (if applicable)
  if (config.blockCommentRegex) {
    result = result.replace(config.blockCommentRegex, '\n\n');
  }

  // Step 4: Remove "If you cloned the repo" comment lines (OKX-specific)
  if (config.clonedRepoCommentRegex) {
    result = result.replace(config.clonedRepoCommentRegex, '\n');
    result = result.replace(/^\s*\/\/\s*If you cloned the repo[^\n]*\n/gm, '');
  }

  // Step 5: Remove any comment lines containing the package name
  result = result.replace(config.packageCommentRegex, '\n\n');

  // Step 6: Remove the "// or, with the npm package" block comment patterns (if applicable)
  if (config.orCommentBlockRegex) {
    result = result.replace(config.orCommentBlockRegex, '\n\n');
  }

  // Clean up any double newlines created by removals
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
  exchange: string,
): number {
  console.log(`\n📦 Copying examples from ${config.repoName}...`);
  console.log(`   Source: ${sourceDir}`);
  console.log(`   Destination: ${destDir}`);
  console.log(`   Excluding folders: ${config.excludeFolders.join(', ')}`);

  // Clean up destination directory to avoid case-sensitivity issues
  // Delete the entire destination directory first to ensure clean state
  if (fs.existsSync(destDir)) {
    console.log('   Cleaning existing destination directory...');
    fs.rmSync(destDir, { recursive: true, force: true });
  }

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
      transformedContent = transformExampleContent(
        content,
        config.packageName,
        exchange,
      );
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
  // Add changes in the specific exchange examples directory
  const exchangeExamplesPath = `examples/${config.destFolder}/`;
  const filesToAdd: string[] = [];

  // Check if there are any changes in the examples directory
  try {
    const examplesStatus = execSync(
      `git status --porcelain ${exchangeExamplesPath}`,
      {
        encoding: 'utf-8',
        cwd: repoRoot,
      },
    );

    if (examplesStatus.trim()) {
      filesToAdd.push(exchangeExamplesPath);
    }
  } catch {
    // If status check fails, try adding anyway
    if (fs.existsSync(path.join(repoRoot, exchangeExamplesPath))) {
      filesToAdd.push(exchangeExamplesPath);
    }
  }

  // Also add built files (public/ directory) if they exist and have changes
  const publicPath = path.join(repoRoot, 'public');
  if (fs.existsSync(publicPath)) {
    try {
      const publicStatus = execSync('git status --porcelain public/', {
        encoding: 'utf-8',
        cwd: repoRoot,
      });

      if (publicStatus.trim()) {
        filesToAdd.push('public/');
      }
    } catch {
      // If status check fails, try adding anyway
      filesToAdd.push('public/');
    }
  }

  if (filesToAdd.length === 0) {
    console.log('⚠️  No changes detected to commit');
    return;
  }

  // Add all changed files
  for (const filePath of filesToAdd) {
    try {
      execSync(`git add ${filePath}`, {
        stdio: 'inherit',
        cwd: repoRoot,
      });
    } catch {
      // Skip if file doesn't exist or can't be added
    }
  }

  // Verify something was staged before committing
  const stagedStatus = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
    cwd: repoRoot,
  });

  if (!stagedStatus.trim()) {
    console.log('⚠️  No files were staged for commit');
    return;
  }

  execSync(
    `git commit -m "chore: sync ${exchange} examples from SDK and rebuild"`,
    {
      stdio: 'inherit',
      cwd: repoRoot,
    },
  );
}

function pushBranch(branchName: string, repoRoot: string): void {
  execSync(`git push -u origin ${branchName}`, {
    stdio: 'inherit',
    cwd: repoRoot,
  });
}

function createPullRequest(
  exchange: string,
  branchName: string,
  repoRoot: string,
): void {
  const title = `Sync ${exchange} examples from SDK`;
  const body = `This PR syncs examples from the ${exchange} SDK repository.

Automatically generated by sync-examples script.`;

  // Get repo info from git
  let repoOwner = '';
  let repoName = '';
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', {
      encoding: 'utf-8',
      cwd: repoRoot,
    }).trim();
    // Parse git@github.com:owner/repo.git or https://github.com/owner/repo.git
    const match = remoteUrl.match(
      /(?:github\.com[:/]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/,
    );
    if (match) {
      repoOwner = match[1];
      repoName = match[2];
    }
  } catch {
    // Fallback if git config fails
  }

  const prUrl =
    repoOwner && repoName
      ? `https://github.com/${repoOwner}/${repoName}/compare/main...${branchName}?expand=1`
      : `https://github.com/YOUR_ORG/YOUR_REPO/compare/main...${branchName}?expand=1`;

  // Try using GitHub API directly if GITHUB_TOKEN is available
  if (process.env.GITHUB_TOKEN && repoOwner && repoName) {
    try {
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;
      const postData = JSON.stringify({
        title,
        body,
        head: branchName,
        base: 'main',
      });

      const parsedUrl = url.parse(apiUrl);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'sync-examples-script',
        },
      };

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 201) {
            const pr = JSON.parse(data);
            console.log('\n✅ PR created successfully!');
            console.log(`   ${pr.html_url}\n`);
            return;
          } else {
            // API failed, fall through to output link
            outputPRLink(exchange, branchName, title, prUrl);
          }
        });
      });

      req.on('error', () => {
        // API failed, fall through to output link
        outputPRLink(exchange, branchName, title, prUrl);
      });

      req.write(postData);
      req.end();
      return; // Exit early if API call succeeds
    } catch {
      // API call failed, fall through to output link
    }
  }

  // Fallback: Try gh CLI or output link
  try {
    execSync(`gh pr create --title "${title}" --body "${body}" --base main`, {
      stdio: 'inherit',
      cwd: repoRoot,
      env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
    });
    console.log('\n✅ PR created successfully!\n');
  } catch {
    outputPRLink(exchange, branchName, title, prUrl);
  }
}

function outputPRLink(
  exchange: string,
  branchName: string,
  title: string,
  prUrl: string,
): void {
  console.log('\n⚠️  Could not create PR automatically. Create PR manually:');
  console.log('\n🔗 PR Creation Link:');
  console.log(`   ${prUrl}\n`);
  console.log(`   Branch: ${branchName}`);
  console.log(`   Title: ${title}\n`);

  // Output to GitHub Actions summary if running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = `
## 🔗 Create Pull Request

Click the button below to create a pull request:

[**👉 Create PR: ${title}**](${prUrl})

**Branch:** \`${branchName}\`  
**Exchange:** ${exchange}

---
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
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

  // Clean up any case-duplicate directories in git before copying
  // This fixes issues where git tracks both "Binance" and "binance" on case-sensitive filesystems
  const examplesDir = path.join(repoRoot, 'examples');
  if (fs.existsSync(examplesDir)) {
    try {
      // Find all directories in examples/ that match the exchange name case-insensitively
      const entries = fs.readdirSync(examplesDir, { withFileTypes: true });
      const matchingDirs = entries
        .filter((entry) => entry.isDirectory())
        .filter(
          (entry) =>
            entry.name.toLowerCase() === config.destFolder.toLowerCase(),
        )
        .map((entry) => entry.name);

      // Remove all matching directories from git and filesystem
      for (const dirName of matchingDirs) {
        const dirPath = path.join(examplesDir, dirName);
        console.log(
          `   Removing old directory (case cleanup): examples/${dirName}`,
        );
        try {
          // Remove from git index
          execSync(
            `git rm -r --cached "examples/${dirName}" 2>/dev/null || true`,
            {
              cwd: repoRoot,
              stdio: 'pipe',
            },
          );
        } catch {
          // Ignore errors - directory might not be in git yet
        }
        // Remove from filesystem
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    } catch (error) {
      console.log(
        `   ⚠️  Could not clean up old directories: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  copyAndTransformExamples(config, sourceDir, destDir, exchange);

  // Step 3: Run build/lint if not skipped
  if (!options.skipBuild) {
    console.log('🔨 Running lint and format checks...\n');
    try {
      console.log('  → Running lint:fix...');
      execSync('npm run lint:fix', { cwd: repoRoot, stdio: 'inherit' });
      console.log('  → Running format...');
      execSync('npm run format', { cwd: repoRoot, stdio: 'inherit' });
      console.log('  → Running lint...');
      execSync('npm run lint', { cwd: repoRoot, stdio: 'inherit' });
      console.log('\n✅ Lint checks passed!\n');
    } catch (error) {
      console.error(
        '\n❌ Lint checks failed. Please fix errors before creating PR.',
      );
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      process.exit(1);
    }

    console.log('🔨 Building examples...\n');
    try {
      console.log('  → Running buildfast...');
      execSync('npm run buildfast', { cwd: repoRoot, stdio: 'inherit' });
      console.log('\n✅ Build completed!\n');
    } catch (error) {
      console.error('\n❌ Build failed. Please fix errors before creating PR.');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      process.exit(1);
    }
  }

  // Step 4: Check for changes and create PR if needed
  if (!options.skipPR) {
    // Check for changes in examples directory and built files
    const exchangeExamplesPath = `examples/${config.destFolder}/`;
    let hasChanges = false;

    try {
      // Check for changes in examples
      const examplesStatus = execSync(
        `git status --porcelain ${exchangeExamplesPath}`,
        {
          encoding: 'utf-8',
          cwd: repoRoot,
        },
      );
      hasChanges = examplesStatus.trim().length > 0;

      // Also check for changes in built files (public/ directory)
      if (!hasChanges) {
        try {
          const publicStatus = execSync('git status --porcelain public/', {
            encoding: 'utf-8',
            cwd: repoRoot,
          });
          hasChanges = publicStatus.trim().length > 0;
        } catch {
          // public/ might not exist or have changes, that's ok
        }
      }
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
      createPullRequest(exchange, branchName, repoRoot);

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
