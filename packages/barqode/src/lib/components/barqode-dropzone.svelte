<script lang="ts">
	import { processFile, processUrl } from "$lib/internal/scanner.js";
	import type { DropzoneProps, DetectedBarcode } from "./types.js";

	let {
		formats = ["qr_code"],
		onDetect,
		onDragover,
		onError,
		children,
		inputRef = $bindable(null),
		wrapperRef = $bindable(null),
		...restProps
	}: DropzoneProps = $props();

	async function onDetectFile(promise: Promise<DetectedBarcode[]>) {
		try {
			const detectedCodes = await promise;
			onDetect?.(detectedCodes);
		} catch (error) {
			onError?.(error as Error);
		}
	}

	async function onDragOverChange(isDraggingOver: boolean) {
		onDragover?.(isDraggingOver);
	}

	async function onDrop(event: DragEvent) {
		if (!event.dataTransfer) return;

		onDragOverChange(false);

		const droppedFiles = [...Array.from(event.dataTransfer.files)];
		const droppedUrl = event.dataTransfer.getData("text/uri-list");

		for (const file of droppedFiles) {
			onDetectFile(processFile(file, formats));
		}

		if (droppedUrl !== "") {
			onDetectFile(processUrl(droppedUrl, formats));
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		onDrop(e);
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		onDragOverChange(true);
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		onDragOverChange(false);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	async function onChangeInput(event: Event) {
		if (!(event.target instanceof HTMLInputElement) || !event.target.files) return;

		for (const file of Array.from(event.target.files)) {
			const detectedCodes = await processFile(file, formats);
			onDetect?.(detectedCodes);
		}
	}

	function onClick() {
		inputRef?.click();
	}
</script>

<div
	class="dropzone"
	role="button"
	tabindex="0"
	aria-label="barcode detector drop zone"
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondragover={handleDragOver}
	onclick={onClick}
	onkeydown={onClick}
	bind:this={wrapperRef}
>
	<input
		class="hidden"
		onchange={onChangeInput}
		type="file"
		name="image"
		accept="image/*"
		capture="environment"
		multiple
		{...restProps}
		bind:this={inputRef}
	/>

	{@render children?.()}
</div>

<style>
	.dropzone {
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 0;
		cursor: pointer;
	}

	.hidden {
		display: none;
	}
</style>
