import { defineConfig } from "vite";
import { resolve } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals";
import eslint from "vite-plugin-eslint";

// TODO: auto remove console.log from build
// TODO: improve how docs are generated

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		esbuild: {
			drop: mode === "production" ? ["console", "debugger"] : [],
		},
		build: {
			sourcemap: true,
			modulePreload: {
				polyfill: false,
			},
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					"action-form": resolve(__dirname, "src/action-form.ts"),
					"af-step": resolve(__dirname, "src/af-step.ts"),
					"af-progress": resolve(__dirname, "src/af-progress.ts"),
					"af-error": resolve(__dirname, "src/af-error.ts"),
					"af-text-count": resolve(__dirname, "src/af-text-count.ts"),
					"af-group-count": resolve(__dirname, "src/af-group-count.ts"),
				},
				output: [
					{
						entryFileNames: `[name].js`,
						assetFileNames: `assets/[name].[ext]`,
						dir: "dist",
					},
				],
				plugins: [
					eslint(),
					minifyHTML.default({
						options: {
							shouldMinify(template) {
								return template.parts.some((part) => {
									// Matches Polymer templates that are not tagged
									return part.text.includes("<style") || part.text.includes("<div");
								});
							},
						},
					}),
				],
			},
		},
	};
});
