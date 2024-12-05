---
title: Introduction
description: What is Barqode?
section: Overview
---

Barqode provides a set of Svelte components for detecting and decoding QR codes and various other barcode formats right in the browser. It's a comprehensive solution that supports both camera streams and static image processing.

Barqode started out as a port of [`vue-qrcode-reader`](https://github.com/gruhn/vue-qrcode-reader).

## Components

- **`BarqodeStream`** - continuously scans frames from a camera stream.
- **`BarqodeDropzone`** - drag & drop, click to upload or capture images from camera.

## Features

- **Real-time scanning**. Detect codes from live camera stream.
- **Multiple formats**. Support for QR codes and various barcode standards.
- **Visual feedback**. Customizable canvas based tracking of detected codes.
- **Cross-browser**. Works across modern browsers with a [WebAssembly-based polyfill](https://github.com/Sec-ant/barcode-detector) if needed.
- **Camera selection**. Choose between front/rear cameras.
- **Torch control**. Control device flashlight where supported.
- **Responsive**. Components adapt to fill available space.
- **Error handling**. Comprehensive error handling for camera/detection issues.

## Usage Example

```svelte
<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from "barqode";

	function onDetect(detectedCodes: DetectedBarcode[]) {
		console.log(detectedCodes.map((detectedCode) => detectedCode.rawValue));
	}
</script>

<div class="barqode">
	<BarqodeStream {onDetect} />
</div>

<style>
	.barqode {
		width: 100%;
		max-width: 600px;
		aspect-ratio: 4/3;
	}
</style>
```

## Browser Support

The components rely primarily on the [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API) and [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API), with fallbacks where possible.

While the core scanning functionality uses the native `BarcodeDetector` where available, it falls back to a [WebAssembly-based polyfill](https://github.com/Sec-ant/barcode-detector) to ensure consistent behavior across browsers.

For a detailed compatibility overview, check each component's documentation.
