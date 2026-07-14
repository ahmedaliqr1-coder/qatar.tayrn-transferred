import react from "@vitejs/plugin-react";
189	import path from "node:path";
190	import { defineConfig } from "vite";
191	
192	export default defineConfig({
193	  plugins: [react()],
194	  resolve: {
195	    alias: {
196	      "@": path.resolve(import.meta.dirname, "client", "src"),
197	      "@shared": path.resolve(import.meta.dirname, "shared"),
198	      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
199	    },
200	  },
201	  envDir: path.resolve(import.meta.dirname),
202	  root: path.resolve(import.meta.dirname, "client"),
203	  publicDir: path.resolve(import.meta.dirname, "client", "public"),
204	  build: {
205	    outDir: path.resolve(import.meta.dirname, "dist/public"),
206	    emptyOutDir: true,
207	  },
208	});
209	
