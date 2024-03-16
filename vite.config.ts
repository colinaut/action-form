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
					"action-fieldset": resolve(__dirname, "src/action-fieldset.ts"),
					"form-step": resolve(__dirname, "src/form-step.ts"),
					"form-progress": resolve(__dirname, "src/form-progress.ts"),
					"error-msg": resolve(__dirname, "src/error-msg.ts"),
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
