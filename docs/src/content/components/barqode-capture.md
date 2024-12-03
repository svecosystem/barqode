---
title: BarqodeCapture
description: File input with camera support on mobile.
section: Components
---

<script>
  import Demo from '$lib/components/demos/barqode-capture.svelte';
</script>

The `BarqodeCapture` component is a simple file input with the `capture` attribute set to `environment` which allows users to take a picture with their camera.

## Demo

<Demo />

## Usage

```svelte
<script lang="ts">
	import { BarqodeCapture, type DetectedBarcode } from "barqode";

	let result = $state("");

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCodes.map((detectedCode) => detectedCode.rawValue).join(", ");
	}
</script>

<BarqodeCapture {onDetect} />

Last detected: {result}
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

It receives an array of [detected barcodes](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value), one callback per image uploaded.

If not barcode is detected, the array will be empty.

### Other props

The `BarqodeCapture` component accepts all attributes that a standard `input` element accepts.

By default, the following attributes are set:

- `type="file"`. This is required to make the input a file input. You should not change this.
- `name="image"`. This is the name of the file input.
- `accept="image/*"`. This restricts the file types that can be uploaded to images.
- `capture="environment"`. This tells the browser to open the camera when the input is clicked on mobile devices. You can choose between `user` and `environment`, which opens the front and back camera respectively. You can also disable this functionality by setting it to `null`.
- `multiple`. This allows the user to upload multiple files at once. You can disable this by settings this to `false`.

## Browser Support

This component depends on the [File Reader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) which is widely supported in modern browsers.
