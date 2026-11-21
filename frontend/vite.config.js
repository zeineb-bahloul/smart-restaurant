import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to transpile JSX syntax inside standard .js files
const transformJsxInJs = () => ({
  name: "transform-jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    if (!id.match(/.*\.js$/)) return null;
    if (id.includes("node_modules")) return null;
    return await transformWithOxc(code, id, { lang: "jsx" });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    transformJsxInJs(),
    react({
      include: /\.(jsx|js)$/,
    }),
  ],
})
