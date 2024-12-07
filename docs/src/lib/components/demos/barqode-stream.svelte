<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from "barqode";
	import { DemoContainer } from "@svecodocs/kit";

	let loading = $state(true);
	let result: string | null = $state(null);

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

<DemoContainer>
	<div class="title">Detecting QR-codes</div>

	<div style="width: 100%; aspect-ratio: 4/3;">
		<BarqodeStream {onCameraOn} {onDetect} {track}>
			{#if loading}
				<div class="loading-indicator">Loading...</div>
			{/if}
		</BarqodeStream>
	</div>

	<div class="result">
		Last detected: {result}
	</div>
</DemoContainer>

<style>
	.title {
		margin-bottom: 1.25rem;
	}

	.loading-indicator {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 2rem;
	}

	.result {
		margin-top: 1.25rem;
	}
</style>
