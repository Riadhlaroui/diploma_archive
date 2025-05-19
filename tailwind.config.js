/* eslint-disable @typescript-eslint/no-require-imports */
const dir = require("tailwindcss-dir");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [
		require("tailwindcss-dir")(),
		// ...other plugins
	],
};
