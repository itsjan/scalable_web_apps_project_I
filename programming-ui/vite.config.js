// vite.config.js
const config = {
  //...
  optimizeDeps: {
    exclude: [
      "prism-code-editor/web-component",
      "cprism-code-editor",
    ],
  },
  //...
};

export default config;