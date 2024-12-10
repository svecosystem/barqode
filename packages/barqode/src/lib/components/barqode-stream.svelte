<script lang="ts">
	import { keepScanning, setScanningFormats } from "$lib/internal/scanner.js";
	import * as cameraController from "$lib/internal/camera.js";
	import type { StreamProps, DetectedBarcode, Point2D } from "./types.js";
	import { watch } from "runed";
	import { onMount } from "svelte";

	let {
		constraints = { facingMode: "environment" },
		formats = ["qr_code"],
		paused = $bindable(false),
		torch = false,
		track,
		onCameraOn,
		onError,
		onCameraOff,
		onDetect,
		children,
		videoRef = $bindable(null),
		pauseRef = $bindable(null),
		trackingRef = $bindable(null),
	}: StreamProps = $props();

	// state
	let cameraActive = $state(false);
	let isMounted = $state(false);

	// derived camera settings based on props and state
	const cameraSettings = $derived({
		torch,
		constraints: constraints,
		shouldStream: isMounted && !paused,
	});

	// watch camera settings, start/stop camera accordingly
	watch(
		() => cameraSettings,
		() => {
			const settings = cameraSettings;

			const ctx = pauseRef!.getContext("2d")!;

			if (!settings.shouldStream) {
				pauseRef!.width = videoRef!.videoWidth;
				pauseRef!.height = videoRef!.videoHeight;
				ctx.drawImage(videoRef!, 0, 0, videoRef!.videoWidth, videoRef!.videoHeight);

				cameraController.stop();
				cameraActive = false;
				onCameraOff?.();
				return;
			}

			cameraController.stop();
			cameraActive = false;

			try {
				cameraController
					.start(videoRef!, settings)
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
		}
	);

	// watch format, update without interrupting scanning if needed
	watch([() => isMounted, () => formats], () => {
		if (isMounted) {
			setScanningFormats(formats);
		}
	});

	// derived shouldScan based on camera settings and state
	const shouldScan = $derived(cameraSettings.shouldStream && cameraActive);

	// watch shouldScan, start/stop scanning accordingly
	watch(
		() => shouldScan,
		() => {
			if (shouldScan) {
				clearCanvas(pauseRef!);
				clearCanvas(trackingRef!);

				const scanInterval = track === undefined ? 500 : 40;

				keepScanning(videoRef!, {
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
		const ctx = canvas.getContext("2d")!;
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
		if (detectedCodes.length === 0 || track === undefined) {
			clearCanvas(trackingRef!);
		} else {
			const displayWidth = videoRef!.offsetWidth;
			const displayHeight = videoRef!.offsetHeight;
			const resolutionWidth = videoRef!.videoWidth;
			const resolutionHeight = videoRef!.videoHeight;

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

			trackingRef!.width = videoRef!.offsetWidth;
			trackingRef!.height = videoRef!.offsetHeight;
			const ctx = trackingRef!.getContext("2d") as CanvasRenderingContext2D;
			track?.(adjustedCodes, ctx);
		}
	}

	onMount(() => {
		isMounted = true;

		return () => {
			cameraController.stop();
		};
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
		bind:this={pauseRef}
		class="camera"
		class:hidden={shouldScan}
	>
	</canvas>

	<canvas id="qrcode-stream-tracking-layer" bind:this={trackingRef} class="overlay"></canvas>

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
