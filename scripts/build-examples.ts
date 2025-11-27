import { parse as parseComments } from 'comment-parser';
import * as fs from 'fs/promises';
import { glob } from 'glob';
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
    name: basePath,
    path: basePath,
    children: [],
  };

  for (const filePath of files) {
    const parts = filePath.split('/');
    let current = tree;

    // Create folder structure
    for (let i = 1; i < parts.length - 1; i++) {
      let folder = current.children.find(
        (child) => child.type === 'folder' && child.name === parts[i],
      ) as ExampleFolder;

      if (!folder) {
        folder = {
          type: 'folder',
          name: parts[i],
          path: parts.slice(0, i + 1).join('/'),
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

    current.children.push({
      type: 'file',
      name: parts[parts.length - 1],
      path: filePath,
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
  const tree = await buildFileTree('examples');

  await fs.mkdir('public', { recursive: true });
  await fs.mkdir('public/js', { recursive: true });

  await fs.writeFile(
    'public/examples-index.json',
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

  const files = glob.sync('examples/**/*.ts');
  const configPath = ts.findConfigFile(
    './',
    ts.sys.fileExists,
    'tsconfig.json',
  );

  if (!configPath) {
    console.error('Could not find tsconfig.json');
    return;
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const compilerOptions = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    './',
  );

  const program = ts.createProgram(files, compilerOptions.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length === 0) {
    console.log('✓ All example files compile successfully!');
    return;
  }

  console.log(`\n❌ Found ${diagnostics.length} compilation error(s):\n`);

  const errorsByFile = new Map<string, ts.Diagnostic[]>();

  for (const diagnostic of diagnostics) {
    if (diagnostic.file) {
      const fileName = diagnostic.file.fileName;
      if (!errorsByFile.has(fileName)) {
        errorsByFile.set(fileName, []);
      }
      errorsByFile.get(fileName)!.push(diagnostic);
    }
  }

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
      }
    }
  }

  console.log(`\n❌ ${errorsByFile.size} file(s) with errors\n`);
  process.exit(1);
}

async function main(): Promise<void> {
  await buildExamplesIndex();
  await checkTypeScriptErrors();
}

main().catch(console.error);
