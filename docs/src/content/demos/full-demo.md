---
title: Full demo
description: Kitchen sink demo of the BarqodeStream component.
section: Demos
---

<script>
  import Demo from '$lib/components/demos/full-demo.svelte';
</script>

Modern mobile phones often have a variety of different cameras installed (e.g. front, rear,
wide-angle, infrared, desk-view). The one picked by default is sometimes not the best
choice. For more fine-grained control, you can select a camera by device constraints or by
the device ID.

Detected codes are visually highlighted in real-time. In this demo you can use the track function dropdown to change the flavor.

By default only QR-codes are detected but a variety of other barcode formats are also supported.
You can select one or multiple but the more you select the more expensive scanning becomes.

## Demo

<Demo />

## Usage

```svelte
<script lang="ts">
	import { BarqodeStream, type BarcodeFormat, type DetectedBarcode } from "barqode";

	let result = $state("");
	let error = $state("");

	let selectedConstraints = $state({ facingMode: "environment" });

	let barcodeFormats: {
		[key in BarcodeFormat]: boolean;
	} = $state({
		aztec: false,
		code_128: false,
		code_39: false,
		code_93: false,
		codabar: false,
		databar: false,
		databar_expanded: false,
		databar_limited: false,
		data_matrix: false,
		dx_film_edge: false,
		ean_13: false,
		ean_8: false,
		itf: false,
		maxi_code: false,
		micro_qr_code: false,
		pdf417: false,
		qr_code: true,
		rm_qr_code: false,
		upc_a: false,
		upc_e: false,
		linear_codes: false,
		matrix_codes: false,
		unknown: false,
	});

	// computed value for selected formats
	let selectedBarcodeFormats: BarcodeFormat[] = $derived(
		Object.keys(barcodeFormats).filter(
			(format: string) => barcodeFormats[format]
		) as BarcodeFormat[]
	);

	// track function options
	const trackFunctionOptions = [
		{ text: "nothing (default)", value: undefined },
		{ text: "outline", value: paintOutline },
		{ text: "centered text", value: paintCenterText },
		{ text: "bounding box", value: paintBoundingBox },
	];

	let trackFunctionSelected = $state(trackFunctionOptions[1]);

	// camera constraint options
	const defaultConstraintOptions: { label: string; constraints: MediaTrackConstraints }[] = [
		{ label: "rear camera", constraints: { facingMode: "environment" } },
		{ label: "front camera", constraints: { facingMode: "user" } },
	];

	let constraintOptions = $state(defaultConstraintOptions);

	async function onCameraOn() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices.filter(({ kind }) => kind === "videoinput");

			constraintOptions = [
				...defaultConstraintOptions,
				...videoDevices.map(({ deviceId, label }) => ({
					label: `${label}`,
					constraints: { deviceId },
				})),
			];

			error = "";
		} catch (e) {
			console.error(e);
		}
	}

	function onError(err: { name: string; message: string }) {
		error = `[${err.name}]: `;

		if (err.name === "NotAllowedError") {
			error += "you need to grant camera access permission";
		} else if (err.name === "NotFoundError") {
			error += "no camera on this device";
		} else if (err.name === "NotSupportedError") {
			error += "secure context required (HTTPS, localhost)";
		} else if (err.name === "NotReadableError") {
			error += "is the camera already in use?";
		} else if (err.name === "OverconstrainedError") {
			error += "installed cameras are not suitable";
		} else if (err.name === "StreamApiNotSupportedError") {
			error += "Stream API is not supported in this browser";
		} else {
			error += err.message;
		}
	}

	function onDetect(detectedCodes: DetectedBarcode[]) {
		console.log(detectedCodes);
		result = JSON.stringify(detectedCodes.map((code) => code.rawValue));
	}

	// track functions
	function paintOutline(
		detectedCodes: {
			cornerPoints: { x: number; y: number }[];
			boundingBox: DOMRectReadOnly;
			rawValue: string;
			format: Exclude<BarcodeFormat, "linear_codes" | "matrix_codes">;
		}[],
		ctx: CanvasRenderingContext2D
	) {
		for (const detectedCode of detectedCodes) {
			const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

			ctx.strokeStyle = "red";
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

	function paintBoundingBox(
		detectedCodes: {
			cornerPoints: { x: number; y: number }[];
			boundingBox: DOMRectReadOnly;
			rawValue: string;
			format: Exclude<BarcodeFormat, "linear_codes" | "matrix_codes">;
		}[],
		ctx: CanvasRenderingContext2D
	) {
		for (const detectedCode of detectedCodes) {
			const {
				boundingBox: { x, y, width, height },
			} = detectedCode;

			ctx.lineWidth = 2;
			ctx.strokeStyle = "#007bff";
			ctx.strokeRect(x, y, width, height);
		}
	}

	function paintCenterText(
		detectedCodes: {
			cornerPoints: { x: number; y: number }[];
			boundingBox: DOMRectReadOnly;
			rawValue: string;
			format: Exclude<BarcodeFormat, "linear_codes" | "matrix_codes">;
		}[],
		ctx: CanvasRenderingContext2D
	) {
		for (const detectedCode of detectedCodes) {
			const { boundingBox, rawValue } = detectedCode;

			const centerX = boundingBox.x + boundingBox.width / 2;
			const centerY = boundingBox.y + boundingBox.height / 2;

			const fontSize = Math.max(12, (50 * boundingBox.width) / ctx.canvas.width);

			ctx.font = `bold ${fontSize}px sans-serif`;
			ctx.textAlign = "center";

			ctx.lineWidth = 3;
			ctx.strokeStyle = "#35495e";
			ctx.strokeText(detectedCode.rawValue, centerX, centerY);

			ctx.fillStyle = "#5cb984";
			ctx.fillText(rawValue, centerX, centerY);
		}
	}
</script>

<label for="camera-constraints">Camera constraints:</label>
<select id="camera-constraints" bind:value={selectedConstraints}>
	{#each constraintOptions as option}
		<option value={option.constraints}>
			{option.label}
		</option>
	{/each}
</select>

<label for="track-function">Track function:</label>
<select id="track-function" bind:value={trackFunctionSelected}>
	{#each trackFunctionOptions as option}
		<option value={option}>
			{option.text}
		</option>
	{/each}
</select>

<label>Barcode formats:</label>
{#each Object.keys(barcodeFormats) as option}
	{@const barcodeOption = option as BarcodeFormat}
	<div>
		<input type="checkbox" id={option} bind:checked={barcodeFormats[barcodeOption]} />
		<label for={option}>{option}</label>
	</div>
{/each}

{#if error}
	{error}
{/if}

<div style="width: 100%; aspect-ratio: 4/3;">
	<BarqodeStream
		constraints={selectedConstraints}
		track={trackFunctionSelected.value}
		formats={selectedBarcodeFormats}
		{onCameraOn}
		{onError}
		{onDetect}
	/>
</div>

Last result: {result}
```
