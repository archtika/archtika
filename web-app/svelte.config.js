import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["none"],
        "script-src": ["self"],
        "style-src": ["self", "https:", "unsafe-inline"],
        "img-src": ["self", "data:", "https:"],
        "font-src": ["self", "https:"],
        "connect-src": ["self"],
        "frame-src": ["self", "https:"],
        "object-src": ["none"],
        "base-uri": ["self"],
        "frame-ancestors": ["none"],
        "form-action": ["self"]
      }
    }
  }
};

export default config;
