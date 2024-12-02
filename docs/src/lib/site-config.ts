import { defineSiteConfig } from "@svecodocs/kit";

export const siteConfig = defineSiteConfig({
	name: "Barqode",
	url: "https://barqode.sveco.dev",
	ogImage: {
		url: "https://barqode.sveco.dev/og.png",
		height: "630",
		width: "1200",
	},
	description: "QR and barcode detection for Svelte.",
	author: "ollema",
	keywords: [
		"svelte qr code reader",
		"svelte barcodes",
		"svelte qr",
		"svelte qr scanner",
		"svelte qr code scanner",
		"svelte qr codes",
		"svecosystem",
		"sveltekit",
		"documentation",
		"docs",
	],
	license: {
		name: "MIT",
		url: "https://github.com/svecosystem/barqode/blob/main/LICENSE",
	},
	links: {
		github: "https://github.com/svecosystem/barqode",
	},
});
