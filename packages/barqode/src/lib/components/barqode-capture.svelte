<script lang="ts">
	import { processFile } from "./scanner.js";
	import type { CaptureProps, BarcodeFormat } from "./types.js";

	let {
		formats = ["qr_code"] as BarcodeFormat[],
		onDetect,
		...restProps
	}: CaptureProps = $props();

	async function onChangeInput(event: Event) {
		if (!(event.target instanceof HTMLInputElement) || !event.target.files) return;

		for (const file of Array.from(event.target.files)) {
			const detectedCodes = await processFile(file, formats);
			onDetect?.(detectedCodes);
		}
	}
</script>

<input
	onchange={onChangeInput}
	type="file"
	name="image"
	accept="image/*"
	capture="environment"
	multiple
	{...restProps}
/>
