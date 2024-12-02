<script lang="ts">
	import { keepScanning, setScanningFormats } from "./scanner.js";
	import * as cameraController from "./camera.js";
	import { assert } from "./util.js";
	import type { StreamProps, DetectedBarcode, BarcodeFormat, Point2D } from "./types.js";
	import { watch } from "runed";
	import { onDestroy, onMount } from "svelte";

	let {
		constraints = { facingMode: "environment" },
		formats = ["qr_code"] as BarcodeFormat[],
		paused = $bindable(false),
		torch = false,
		track,
		onCameraOn,
		onError,
		onCameraOff,
		onDetect,
		children,
	}: StreamProps = $props();

	// declare refs that we bind to
	// TODO: is this best practice in Svelte 5?
	// or should you use $state<HTMLVideoElement | undefined>(undefined)?
	let videoRef: HTMLVideoElement;
	let pauseFrameRef: HTMLCanvasElement;
	let trackingLayerRef: HTMLCanvasElement;
	let cameraActive = $state(false);
	let isMounted = $state(false);

	// derived camera settings based on props and state
	let cameraSettings = $derived({
		torch,
		constraints: constraints,
		shouldStream: isMounted && !paused,
	});

	// watch camera settings, start/stop camera accordingly
	watch(
		() => cameraSettings,
		() => {
			const settings = cameraSettings;

			assert(videoRef !== undefined, "Video element must be defined");
			assert(pauseFrameRef !== undefined, "Canvas must be defined");
			const ctx = pauseFrameRef.getContext("2d");
			assert(ctx !== null, "Canvas 2d context must be non-null");

			if (settings.shouldStream) {
				cameraController.stop();
				cameraActive = false;

				try {
					cameraController
						.start(videoRef, settings)
						.then((capabilities) => {
							if (isMounted) {
								cameraActive = true;
								onCameraOn?.(capabilities);
							} else {
								cameraController.stop();
							}
						})
						.catch((error) => {
							onError?.(error);
						});
				} catch (error) {
					onError?.(error as Error);
				}
			} else {
				pauseFrameRef.width = videoRef.videoWidth;
				pauseFrameRef.height = videoRef.videoHeight;
				ctx.drawImage(videoRef, 0, 0, videoRef.videoWidth, videoRef.videoHeight);

				cameraController.stop();
				cameraActive = false;
				onCameraOff?.();
			}
		}
	);

	// watch format, update without interrupting scanning if needed
	watch([() => isMounted, () => formats], () => {
		if (isMounted) {
			setScanningFormats(formats);
		}
	});

	// derived shouldScan based on camera settings and state
	let shouldScan = $derived(cameraSettings.shouldStream && cameraActive);

	// watch shouldScan, start/stop scanning accordingly
	watch(
		() => shouldScan,
		() => {
			if (shouldScan) {
				assert(pauseFrameRef !== undefined, "Pause frame canvas must be defined");
				clearCanvas(pauseFrameRef);

				assert(trackingLayerRef !== undefined, "Tracking canvas must be defined");
				clearCanvas(trackingLayerRef);

				const scanInterval = track === undefined ? 500 : 40;

				assert(videoRef !== undefined, "Video element must be defined");
				keepScanning(videoRef, {
					detectHandler: (detectedCodes: DetectedBarcode[]) => onDetect?.(detectedCodes),
					formats: formats,
					locateHandler: onLocate,
					minDelay: scanInterval,
				});
			}
		}
	);

	/**
	 * Clear canvas.
	 *
	 * @param canvas
	 */
	function clearCanvas(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext("2d");
		assert(ctx !== null, "Canvas 2d context should be non-null");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	/**
	 * Callback for the scanner.
	 *
	 * This function adjusts the coordinates of the detected codes to account for
	 * the difference between the resolution of the video stream and the resolution
	 * and aspect ratio of what is displayed on the screen, based on object-fit: cover.
	 *
	 * @param detectedCodes
	 */
	function onLocate(detectedCodes: DetectedBarcode[]) {
		assert(trackingLayerRef !== undefined, "Tracking canvas must be defined");
		assert(videoRef !== undefined, "Video element must be defined");

		if (detectedCodes.length === 0 || track === undefined) {
			clearCanvas(trackingLayerRef);
		} else {
			const displayWidth = videoRef.offsetWidth;
			const displayHeight = videoRef.offsetHeight;
			const resolutionWidth = videoRef.videoWidth;
			const resolutionHeight = videoRef.videoHeight;

			const largerRatio = Math.max(
				displayWidth / resolutionWidth,
				displayHeight / resolutionHeight
			);
			const uncutWidth = resolutionWidth * largerRatio;
			const uncutHeight = resolutionHeight * largerRatio;

			const xScalar = uncutWidth / resolutionWidth;
			const yScalar = uncutHeight / resolutionHeight;
			const xOffset = (displayWidth - uncutWidth) / 2;
			const yOffset = (displayHeight - uncutHeight) / 2;

			const scale = ({ x, y }: Point2D) => ({
				x: Math.floor(x * xScalar),
				y: Math.floor(y * yScalar),
			});

			const translate = ({ x, y }: Point2D) => ({
				x: Math.floor(x + xOffset),
				y: Math.floor(y + yOffset),
			});

			const adjustedCodes = detectedCodes.map((detectedCode) => {
				const { boundingBox, cornerPoints } = detectedCode;
				const { x, y } = translate(scale({ x: boundingBox.x, y: boundingBox.y }));
				const { x: width, y: height } = scale({
					x: boundingBox.width,
					y: boundingBox.height,
				});

				return {
					...detectedCode,
					cornerPoints: cornerPoints.map((point: Point2D) => translate(scale(point))) as [
						Point2D,
						Point2D,
						Point2D,
						Point2D,
					],
					boundingBox: DOMRectReadOnly.fromRect({ x, y, width, height }),
				};
			});

			trackingLayerRef.width = videoRef.offsetWidth;
			trackingLayerRef.height = videoRef.offsetHeight;
			const ctx = trackingLayerRef.getContext("2d") as CanvasRenderingContext2D;
			track?.(adjustedCodes, ctx);
		}
	}

	// mount and unmount lifecycle
	onMount(() => {
		isMounted = true;
	});

	onDestroy(() => {
		cameraController.stop();
	});
</script>

<div class="wrapper">
	<video
		bind:this={videoRef}
		class="camera"
		class:hidden={!shouldScan}
		autoplay
		muted
		playsinline
	>
	</video>

	<canvas
		id="qrcode-stream-pause-frame"
		bind:this={pauseFrameRef}
		class="camera"
		class:hidden={shouldScan}
	>
	</canvas>

	<canvas id="qrcode-stream-tracking-layer" bind:this={trackingLayerRef} class="overlay"></canvas>

	<div class="overlay">
		{@render children?.()}
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 0;
	}

	.camera {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hidden {
		visibility: hidden;
		position: absolute;
	}

	.overlay {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
