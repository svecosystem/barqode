<script lang="ts">
	import { dev } from "$app/environment";
	import { siteConfig } from "$lib/site-config";
	import "../app.css";
	import { useSiteConfig } from "@svecodocs/kit";

	let { children } = $props();

	useSiteConfig(() => siteConfig);
</script>

<svelte:head>
	{#if !dev}
		<script
			defer
			data-domain="barqode.sveco.dev"
			src="https://server.hj.run/js/script.js"
		></script>
	{/if}
</svelte:head>

{@render children?.()}
