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

	<BarqodeDropzone {onDetect} {onDragover}>
		<div class="dropzone" class:dragover>Drop an image here to detect QR-codes</div>
	</BarqodeDropzone>

	<div class="result">
		Last detected: {result}
	</div>
</DemoContainer>

<style>
	.title {
		margin-bottom: 1.25rem;
	}

	.dropzone {
		width: 100%;
		height: 200px;
		border: 2px solid #2563eb;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dragover {
		border-color: white;
	}

	.result {
		margin-top: 1.25rem;
	}
</style>
