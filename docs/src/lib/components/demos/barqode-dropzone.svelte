<script lang="ts">
	import { BarqodeDropzone, type DetectedBarcode } from "barqode";
	import { cn, DemoContainer } from "@svecodocs/kit";

	let result = $state("");
	let dragover = $state(false);

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}

	function onDragover(isDraggingOver: boolean) {
		dragover = isDraggingOver;
	}
</script>

<DemoContainer class="flex flex-col gap-5">
	<div>Detecting QR-codes</div>

	<div
		class={cn(
			"border-foreground/15 aspect-[4/3] w-full rounded-lg border-[2px] border-dashed",
			dragover && "border-brand"
		)}
	>
		<BarqodeDropzone {onDetect} {onDragover}>
			<div class="flex h-full w-full items-center justify-center">
				<p>Click to upload or drop an image here</p>
			</div>
		</BarqodeDropzone>
	</div>

	<div>
		Last detected: {result}
	</div>
</DemoContainer>
