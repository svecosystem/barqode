<script lang="ts">
	import { BarqodeCapture, type DetectedBarcode } from "barqode";
	import { DemoContainer } from "@svecodocs/kit";

	let result = $state("");

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}
</script>

<DemoContainer>
	<div class="title">Detecting QR-codes</div>

	<BarqodeCapture
		{onDetect}
		class="bg-background dark:bg-muted ring-muted-foreground/20 inset-shadow-xs inset-shadow-muted-foreground/5 flex h-10 w-full rounded-lg px-3 py-2.5 text-sm shadow-sm ring file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
	/>

	<div class="result">
		Last detected: {result}
	</div>
</DemoContainer>

<style>
	.title {
		margin-bottom: 1.25rem;
	}

	.result {
		margin-top: 1.25rem;
	}
</style>
