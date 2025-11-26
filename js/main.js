function createTreeNode(item) {
    const div = document.createElement("div");
    div.className = "ml-4";

    if (item.type === "folder") {
        div.innerHTML = `
            <div class="flex items-center py-2">
                <button class="flex items-center focus:outline-none" onclick="toggleFolder(this)">
                    <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <span class="ml-2 font-medium">${item.name}</span>
                </button>
            </div>
            <div class="hidden ml-4">
                ${item.children.map((child) => createTreeNode(child).outerHTML).join("")}
            </div>
        `;
    } else {
        const safeItem = {
            name: item.name,
            code: item.code,
            metadata: item.metadata,
            path: item.path,
        };

        div.innerHTML = `
            <div class="py-2 cursor-pointer hover:bg-gray-100 rounded px-2" 
                onclick='showExample(${JSON.stringify(safeItem).replace(/'/g, "&apos;")})'>
                <span class="text-blue-600">${item.name}</span>
            </div>
        `;
    }

    return div;
}

function toggleFolder(button) {
    const content = button.parentElement.nextElementSibling;
    const arrow = button.querySelector("svg");
    content.classList.toggle("hidden");
    arrow.classList.toggle("rotate-90");
}

function showExample(example) {
    const content = document.getElementById("example-content");
    const escapedCode = example.code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    content.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold mb-2">${example.metadata.title || example.name}</h2>
            <p class="text-gray-600 mb-4">${example.metadata.description || ""}</p>
            <div class="mb-4">
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                    Category: ${example.metadata.category || "N/A"}
                </span>
                ${
                    example.metadata.tags
                        ? example.metadata.tags
                              .map(
                                  (tag) =>
                                      `<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">${tag}</span>`
                              )
                              .join("")
                        : ""
                }
            </div>
            <div class="relative">
                <button onclick="copyCode(this)" class="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">
                    Copy
                </button>
                <pre class="bg-gray-900 p-4 rounded overflow-x-auto"><code class="language-typescript">${escapedCode}</code></pre>
            </div>
        </div>
    `;

    // Highlight the code
    Prism.highlightAll();
}

function copyCode(button) {
    const pre = button.parentElement.querySelector("pre");
    const code = pre.textContent;

    navigator.clipboard.writeText(code).then(() => {
        button.textContent = "Copied!";
        setTimeout(() => {
            button.textContent = "Copy";
        }, 2000);
    });
}

async function loadExamples() {
    try {
        const response = await fetch("/examples-index.json");
        const tree = await response.json();

        const examplesList = document.getElementById("examples-list");
        examplesList.appendChild(createTreeNode(tree));
    } catch (error) {
        console.error("Error loading examples:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadExamples);
