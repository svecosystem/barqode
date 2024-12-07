---
title: BarqodeDropzone
description: Click to upload images, drag & drop or use your camera to scan.
section: Components
---

<script>
  import Demo from '$lib/components/demos/barqode-dropzone.svelte';
</script>

This component functions as a file input with the `capture` attribute set to `environment` which allows users to take a picture with their camera. You can also drag-and-drop image files from your desktop or images embedded into other web pages anywhere in the area the component occupies. The images are directly scanned and positive results are indicated by the `onDetect` callback.

## Demo

<Demo />

## Usage

```svelte
<script lang="ts">
	import { BarqodeDropzone, type DetectedBarcode } from "barqode";

	let result = $state("");
	let dragover = $state(false);

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}

	function onDragover(isDraggingOver: boolean) {
		dragover = isDraggingOver;
	}
</script>

<div class:dragover style="width: 100%; aspect-ratio: 4/3">
	<BarqodeDropzone {onDetect} {onDragover}>
		<p>Click to upload or drop an image here</p>
	</BarqodeDropzone>
</div>

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

It receives an array of [detected barcodes](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value), one callback per image.

If not barcode is detected, the array will be empty.

### `onDragover`

Type: `(isDraggingOver: boolean) => void`

Callback function that is called when a file is dragged over the drop zone.

### `onError`

Type: `(error: Error) => void`

Callback function that is called when an error occurs.

TODO: insert link to errors.

### Other props

The `BarqodeDropzone` component accepts all attributes that a standard `input` element accepts.

By default, the following attributes are set:

- `type="file"`. This is required to make the input a file input. You should not change this.
- `name="image"`. This is the name of the file input.
- `accept="image/*"`. This restricts the file types that can be uploaded to images.
- `capture="environment"`. This tells the browser to open the camera when the input is clicked on mobile devices. You can choose between `user` and `environment`, which opens the front and back camera respectively. You can also disable this functionality by setting it to `null`.
- `multiple`. This allows the user to upload multiple files at once. You can disable this by settings this to `false`.

## Browser Support

This component depends on the [File Reader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) which is widely supported in modern browsers.
