<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from "barqode";
	import { DemoContainer } from "@svecodocs/kit";
	import SpinnerBall from "phosphor-svelte/lib/SpinnerBall";

	let loading = $state(true);
	let result = $state<string | null>(null);

	function onCameraOn() {
		loading = false;
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}

	function track(detectedCodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) {
		for (const detectedCode of detectedCodes) {
			const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

			ctx.strokeStyle = "#2563eb";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(firstPoint.x, firstPoint.y);

			for (const { x, y } of otherPoints) {
				ctx.lineTo(x, y);
			}

			ctx.lineTo(firstPoint.x, firstPoint.y);
			ctx.closePath();
			ctx.stroke();
		}
	}
</script>

<DemoContainer class="flex flex-col gap-5">
	<div>Detecting QR-codes</div>

	<div class="aspect-[4/3] w-full">
		<BarqodeStream {onCameraOn} {onDetect} {track}>
			{#if loading}
				<div class="flex h-full w-full items-center justify-center text-4xl font-semibold">
					<SpinnerBall class="size-20 animate-spin " />
				</div>
			{/if}
		</BarqodeStream>
	</div>

	<div>
		Last detected: {result}
	</div>
</DemoContainer>
