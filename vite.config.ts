import { defineConfig } from "vite";
import { resolve } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals-v3";
import { defaultShouldMinify } from "minify-html-literals";
import eslint from "vite-plugin-eslint";

// TODO: auto remove console.log from build
// TODO: improve how docs are generated

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		esbuild: {
			// drop: mode === "production" ? ["console", "debugger"] : [],
		},
		build: {
			sourcemap: true,
			modulePreload: {
				polyfill: false,
			},
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					index: resolve(__dirname, "src/main.ts"),
					"action-form": resolve(__dirname, "src/action-form.ts"),
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
					minifyHTML({
						options: {
							shouldMinify(template) {
								return (
									defaultShouldMinify(template) ||
									template.parts.some((part) => {
										// Matches Polymer templates that are not tagged
										return part.text.includes("<style");
									})
								);
							},
						},
					}),
				],
			},
		},
	};
});
