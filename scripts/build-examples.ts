import { parse as parseComments } from 'comment-parser';
import * as fs from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

interface ExampleFile {
  type: 'file';
  name: string;
  path: string;
  code: string;
  metadata: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  };
}

interface ExampleFolder {
  type: 'folder';
  name: string;
  path: string;
  children: (ExampleFile | ExampleFolder)[];
}

async function buildFileTree(basePath: string): Promise<ExampleFolder> {
  const files: string[] = glob.sync(`${basePath}/**/*.ts`);
  const tree: ExampleFolder = {
    type: 'folder',
    name: 'examples',
    path: 'examples',
    children: [],
  };

  for (const filePath of files) {
    // Get relative path from basePath (examples directory)
    const relativePath = path.relative(basePath, filePath);
    const parts = relativePath.split(path.sep);
    let current = tree;

    // Create folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      let folder = current.children.find(
        (child) => child.type === 'folder' && child.name === parts[i],
      ) as ExampleFolder;

      if (!folder) {
        const folderPath = path.join('examples', ...parts.slice(0, i + 1));
        folder = {
          type: 'folder',
          name: parts[i],
          path: folderPath.replace(/\\/g, '/'), // Normalize to forward slashes
          children: [],
        };
        current.children.push(folder);
      }
      current = folder;
    }

    // Add file
    const content = await fs.readFile(filePath, 'utf-8');
    const comments = parseComments(content);
    const metadata =
      comments[0]?.tags.reduce(
        (acc: Record<string, string>, tag) => ({
          ...acc,
          [tag.tag]: tag.description,
        }),
        {},
      ) || {};

    const fileRelativePath = path.join('examples', relativePath);
    current.children.push({
      type: 'file',
      name: parts[parts.length - 1],
      path: fileRelativePath.replace(/\\/g, '/'), // Normalize to forward slashes
      code: content,
      metadata: {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags?.split(',').map((t) => t.trim()),
      },
    });
  }

  return tree;
}

async function buildExamplesIndex(): Promise<void> {
  // Ensure we're working from the repo root
  const repoRoot = process.cwd();
  const examplesPath = path.join(repoRoot, 'examples');
  const tree = await buildFileTree(examplesPath);

  const publicDir = path.join(repoRoot, 'public');
  const publicJsDir = path.join(publicDir, 'js');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(publicJsDir, { recursive: true });

  await fs.writeFile(
    path.join(publicDir, 'examples-index.json'),
    JSON.stringify(tree, null, 2),
  );

  console.log('✓ Examples index built successfully');
  console.log(`✓ Processed ${countFiles(tree)} example files`);
}

function countFiles(node: ExampleFolder | ExampleFile): number {
  if (node.type === 'file') return 1;
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

async function checkTypeScriptErrors(): Promise<void> {
  console.log('\nChecking TypeScript compilation errors...');

  // Ensure we're working from the repo root
  const repoRoot = process.cwd();
  const examplesPattern = path.join(repoRoot, 'examples', '**', '*.ts');
  const files = glob.sync(examplesPattern);
  console.log(`Checking ${files.length} example files...`);

  const configPath = ts.findConfigFile(
    repoRoot,
    ts.sys.fileExists,
    'tsconfig.json',
  );

  if (!configPath) {
    console.error('Could not find tsconfig.json');
    process.exit(1);
  }

  console.log(`Using tsconfig: ${configPath}`);

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    console.error('Error reading tsconfig.json:', configFile.error);
    process.exit(1);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    repoRoot,
  );

  if (parsedConfig.errors && parsedConfig.errors.length > 0) {
    console.error('Errors parsing tsconfig.json:');
    for (const error of parsedConfig.errors) {
      const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
      console.error(`  ${message}`);
    }
    process.exit(1);
  }

  const program = ts.createProgram(files, parsedConfig.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length === 0) {
    console.log('✓ All example files compile successfully!');
    return;
  }

  console.log(`\n❌ Found ${diagnostics.length} compilation error(s):\n`);

  const errorsByFile = new Map<string, ts.Diagnostic[]>();
  const errorsWithoutFile: ts.Diagnostic[] = [];

  for (const diagnostic of diagnostics) {
    if (diagnostic.file) {
      const fileName = diagnostic.file.fileName;
      if (!errorsByFile.has(fileName)) {
        errorsByFile.set(fileName, []);
      }
      errorsByFile.get(fileName)!.push(diagnostic);
    } else {
      errorsWithoutFile.push(diagnostic);
    }
  }

  // Show errors with files
  for (const [fileName, fileDiagnostics] of errorsByFile.entries()) {
    console.log(`\n📁 ${fileName}`);
    for (const diagnostic of fileDiagnostics) {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        );
        console.log(`   Line ${line + 1}:${character + 1} - ${message}`);
      } else {
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        );
        console.log(`   ${message}`);
      }
    }
  }

  // Show errors without files (configuration errors, etc.)
  if (errorsWithoutFile.length > 0) {
    console.log(
      `\n⚠️  ${errorsWithoutFile.length} error(s) without file location:`,
    );
    for (const diagnostic of errorsWithoutFile) {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      );
      const code = diagnostic.code;
      console.log(`   [${code}] ${message}`);
    }
  }

  console.log(`\n❌ ${errorsByFile.size} file(s) with errors`);
  if (errorsWithoutFile.length > 0) {
    console.log(`   ${errorsWithoutFile.length} configuration/global error(s)`);
  }
  console.log('');
  process.exit(1);
}

async function main(): Promise<void> {
  await buildExamplesIndex();
  await checkTypeScriptErrors();
}

main().catch(console.error);
