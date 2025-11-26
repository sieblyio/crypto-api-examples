import { glob } from "glob";
import { parse as parseComments } from "comment-parser";
import * as fs from "fs/promises";
import * as path from "path";

interface ExampleFile {
    type: "file";
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
    type: "folder";
    name: string;
    path: string;
    children: (ExampleFile | ExampleFolder)[];
}

async function buildFileTree(basePath: string): Promise<ExampleFolder> {
    const files: string[] = glob.sync(`${basePath}/**/*.ts`);
    const tree: ExampleFolder = { type: "folder", name: basePath, path: basePath, children: [] };

    for (const filePath of files) {
        const parts = filePath.split("/");
        let current = tree;

        // Create folder structure
        for (let i = 1; i < parts.length - 1; i++) {
            let folder = current.children.find(
                (child) => child.type === "folder" && child.name === parts[i]
            ) as ExampleFolder;

            if (!folder) {
                folder = {
                    type: "folder",
                    name: parts[i],
                    path: parts.slice(0, i + 1).join("/"),
                    children: [],
                };
                current.children.push(folder);
            }
            current = folder;
        }

        // Add file
        const content = await fs.readFile(filePath, "utf-8");
        const comments = parseComments(content);
        const metadata = comments[0]?.tags.reduce(
            (acc: Record<string, string>, tag) => ({
                ...acc,
                [tag.tag]: tag.description,
            }),
            {}
        );

        current.children.push({
            type: "file",
            name: parts[parts.length - 1],
            path: filePath,
            code: content,
            metadata: {
                title: metadata.title,
                description: metadata.description,
                category: metadata.category,
                tags: metadata.tags?.split(",").map((t) => t.trim()),
            },
        });
    }

    return tree;
}

async function buildExamplesIndex(): Promise<void> {
    const tree = await buildFileTree("examples");

    await fs.mkdir("public", { recursive: true });
    await fs.mkdir("public/js", { recursive: true });

    await fs.writeFile("public/examples-index.json", JSON.stringify(tree, null, 2));

    await fs.copyFile("index.html", "public/index.html");
    await fs.copyFile("js/main.js", "public/js/main.js");
}

buildExamplesIndex().catch(console.error);
