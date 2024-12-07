---
title: BarqodeStream
description: Continuously scans frames from a camera stream.
section: Components
---

<script>
  import Demo from '$lib/components/demos/barqode-stream.svelte';
  import { Callout } from '@svecodocs/kit';
</script>

The `BarqodeStream` component continuously scans frames from a camera stream and detects barcodes in real-time.

## Demo

<Demo />

## Usage

```svelte
<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from "barqode";

	let loading = $state(true);
	let result: string | null = $state(null);

	function onCameraOn() {
		loading = false;
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		result = detectedCode.map((code) => detectedCode.rawValue).join(", ");
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

<div style="width: 100%; aspect-ratio: 4/3;">
	<BarqodeStream {onCameraOn} {onDetect} {track}>
		{#if loading}
			<div class="loading-indicator">Loading...</div>
		{/if}
	</BarqodeStream>
</div>

Last detected: {result}
```

## Props

### `constraints`

Type: [`MediaTrackConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)

Default: `{ video: { facingMode: "environment" } }`

Configure the the various camera options, for example whether to use front or rear camera.

The object must be of type `MediaTrackConstraints`.

The object is passed as-is to `getUserMedia`, which is the API call for requesting a camera stream:

```js
navigator.mediaDevices.getUserMedia({
	audio: false,
	video: the_constraint_object_you_provide,
});
```

When `constraints` is updated, a new camera stream is requested which triggers the `onCameraOn` callback again. You can catch errors with the `onError` callback. An error can occur when you try to use the front camera on a device that doesn't have one for example.

### `formats`

Type: [`BarcodeFormat[]`](https://github.com/Sec-ant/barcode-detector?tab=readme-ov-file#barcode-detector)

Default: `["qr_code"]`

Configure the barcode formats to detect. By default, only QR codes are detected.

If you want to detect multiple formats, pass an array of formats:

```svelte
<BarqodeStream formats={["qr_code", "ean_8", "ean_13"]} />
```

<Callout type="warning" title="Warning">

Don't select more barcode formats than needed.

Scanning becomes more expensive the more formats you select.

</Callout>

Under the hood, the standard [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) is used. Support varies across devices, operating systems and browsers. All components will prefer to use the native implementation if available and otherwise falls back to a polyfill implementation.

Note that even if the native implementation is available, the component still might use the polyfill. For example, if the native implementation only supports the format `'qr_code'` but the you select the formats `['qr_code', 'aztec']`.

### `paused`

Type: `boolean` (bindable)

Default: `false`

Whether the camera stream is or should be paused. Bindable, which means that you can pause/unpause the stream from outside the component.

Pausing the stream by setting `paused` to `true` is useful if you want to show some microinteraction after successful scans. When the you set it to `false`, the camera stream will be restarted and the `onCameraOn` callback function will be triggered again.

### `torch`

Type: `boolean`

Default: `false`

Turn the camera flashlight on or off.

This is not consistently supported by all devices and browsers. Support can even vary on the same device with the same browser. For example the rear camera often has a flashlight but the front camera does not.

We can only tell if flashlight control is supported once the camera is loaded and the `onCameraOn` callback has been called. At the moment, enabling the torch may silently fail on unsupported devices, but in the `onCameraOn` callback payload you can access the `MediaTrackCapabilities` object, from which you can determine if the torch is supported.

The camera stream must be reloaded when turning the torch on or off. That means the `onCameraOn` event will be emitted again.

### `track`

Type: `(detectedCodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) => void`

Callback function that can be used to visually highlight detected barcodes.

A transparent canvas is overlaid on top of the camera stream. The `track` function is used to draw on this canvas.

It receives an array of [detected barcodes](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value) and a [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) as the second argument.

Note that when `track` is set the scanning frequency has to be increased. So if you want to go easy on your target device you might not want to enable tracking.

<Callout type="warning" title="Warning">

The `track` function is called for every frame. It is important to keep the function as performant as possible.

This can lead to performance issues on low-end devices and memory leaks if not handled correctly.

</Callout>

### `onCameraOn`

Type: `(capabilities: MediaTrackCapabilities) => void`

Callback function that is called when the camera stream is successfully loaded.

It might take a while before the component is ready and the scanning process starts. The user has to be asked for camera access permission first and the camera stream has to be loaded.

If you want to show a loading indicator, you can wait for this callback to be called. It is called as soon as the camera start streaming.

The callback receives the a promise which resolves with the cameras [`MediaTrackCapabilities`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackCapabilities) when everything is ready.

### `onError`

Type: `(error: Error) => void`

Callback function that is called when an error occurs.

TODO: insert link to errors.

### `onCameraOff`

Type: `() => void`

Callback function that is called when the camera stream is stopped.

This can happen when the camera constraints are modified, for example when switching between front and rear camera or when turning the torch on or off.

### `onDetect`

Type: `(detectedCodes: DetectedBarcode[]) => void`

Callback function that is called when a barcode is detected.

It receives an array of [detected barcodes](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector/detect#return_value).

<Callout type="note" title="None">

If you scan the same barcode multiple times in a row, `onDetect` is still only called once. When you hold a barcode in the camera, frames are actually decoded multiple times a second but you don't want to be flooded with callbacks that often. That's why the last decoded QR code is always cached and only new results are propagated. However, changing the value of `paused` resets this internal cache.

</Callout>

## Browser Support

This component depends on the [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) which is widely supported in modern browsers.
