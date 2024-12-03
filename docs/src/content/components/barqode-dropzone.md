---
title: BarqodeDropzone
description: File input with camera support on mobile.
section: Components
---

<script>
  import Demo from '$lib/components/demos/barqode-dropzone.svelte';
</script>

You can drag-and-drop image files from your desktop or images embedded into other web pages anywhere in the area the component occupies. The images are directly scanned and positive results are indicated by the `onDetect` callback.

## Demo

<Demo />

## Usage

```svelte
<script lang="ts">
	import { BarqodeDropZone, type DetectedBarcode } from "barqode";

	let result = $state("");
	let dragover = $state(false);

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}

	function onDragover(isDraggingOver: boolean) {
		dragover = isDraggingOver;
	}
</script>

<BarqodeDropZone {onDetect} {onDragover}>
	<div class="dropzone" class:dragover>Drop an image here to detect QR-codes</div>
</BarqodeDropZone>

Last detected: {result}

<style>
	.dragover {
		border-color: white;
	}
</style>
```

## Props

### `formats`

Type: [`BarcodeFormat[]`](https://github.com/Sec-ant/barcode-detector?tab=readme-ov-file#barcode-detector)

Default: `["qr_code"]`

Configure the barcode formats to detect. By default, only QR codes are detected.

If you want to detect multiple formats, pass an array of formats:

```svelte
<BarqodeStream formats={["qr_code", "ean_8", "ean_13"]} />
```

Under the hood, the standard [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) is used. Support varies across devices, operating systems and browsers. All components will prefer to use the native implementation if available and otherwise falls back to a polyfill implementation.

Note that even if the native implementation is available, the component still might use the polyfill. For example, if the native implementation only supports the format `'qr_code'` but the you select the formats `['qr_code', 'aztec']`.

### `onDetect`

Type: `(detectedCodes: DetectedBarcode[]) => void`

Callback function that is called when a barcode is detected.

It receives an array of [detected barcodes](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value), one callback per image dropped.

If not barcode is detected, the array will be empty.

### `onDragover`

Type: `(isDraggingOver: boolean) => void`

Callback function that is called when a file is dragged over the drop zone.

### `onError`

Type: `(error: Error) => void`

Callback function that is called when an error occurs.

TODO: insert link to errors.

## Browser Support

This component depends on the [File Reader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) which is widely supported in modern browsers.
