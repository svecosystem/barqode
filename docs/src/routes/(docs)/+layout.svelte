<script lang="ts">
	import LogoDark from "$lib/components/logos/logo-dark.svelte";
	import LogoLight from "$lib/components/logos/logo-light.svelte";
	import { DocsLayout } from "@svecodocs/kit";
	import { navigation } from "$lib/navigation";

	let { children } = $props();
</script>

<DocsLayout {navigation}>
	{#snippet logo()}
		<LogoDark class="hidden w-7 dark:block" />
		<LogoLight class="block w-7 dark:hidden" />
		<span class="sr-only">Svecodocs</span>
	{/snippet}

	{@render children?.()}
</DocsLayout>
