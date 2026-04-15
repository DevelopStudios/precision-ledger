import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    name: 'node-url-polyfill',
    setup(build) {
      // Redirect any import of the Node.js 'url' built-in to a browser-safe stub.
      // WebLLM references it in a Node.js-only code path but esbuild still tries to resolve it.
      build.onResolve({ filter: /^url$/ }, () => ({
        path: resolve(__dirname, 'src/polyfills/url.ts'),
      }));
    },
  },
];
