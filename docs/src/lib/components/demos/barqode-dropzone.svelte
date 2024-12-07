<script lang="ts">
	import { BarqodeDropzone, type DetectedBarcode } from "barqode";
	import { DemoContainer } from "@svecodocs/kit";

	let result = $state("");
	let dragover = $state(false);

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}

	function onDragover(isDraggingOver: boolean) {
		dragover = isDraggingOver;
	}
</script>

<DemoContainer>
	<div class="title">Detecting QR-codes</div>

	<div class:dragover style="width: 100%; aspect-ratio: 4/3; border: 2px solid #2563eb;">
		<BarqodeDropzone {onDetect} {onDragover}>
			<div class="instructions">
				<p>Click to upload or drop an image here</p>
			</div>
		</BarqodeDropzone>
	</div>

	<div class="result">
		Last detected: {result}
	</div>
</DemoContainer>

<style>
	.title {
		margin-bottom: 1.25rem;
	}

	.dragover {
		border-color: white;
	}

	.instructions {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.result {
		margin-top: 1.25rem;
	}
</style>
