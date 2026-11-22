import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// El build produce un único dist/index.html (JS, CSS y fuentes incrustados)
// para poder abrir la presentación con doble clic, sin servidor ni internet.
export default defineConfig({
  plugins: [tailwindcss(), viteSingleFile()],
  server: { port: 5173, strictPort: true },
})
