// Browser stub for Node.js 'url' built-in.
// WebLLM references this module in a Node.js-only code path (ENVIRONMENT_IS_NODE),
// but esbuild still tries to resolve it for the browser bundle.
// These stubs prevent the runtime crash — they will never actually be called in browser context.

export const pathToFileURL = (path: string): { href: string } => ({ href: path });
export const fileURLToPath = (url: string): string => url;

export default { pathToFileURL, fileURLToPath };
