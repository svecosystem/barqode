import type { BarcodeFormat, DetectedBarcode, Point2D } from "barcode-detector/pure";
import type { Snippet } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";

export type { DetectedBarcode, BarcodeFormat, Point2D };

export type DropzoneProps = {
	/**
	 * The formats of the barcodes to detect.
	 *
	 * @default ['qr_code']
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
	 */
	formats?: BarcodeFormat[];

	/**
	 * A callback function called when the user drops an image file.
	 *
	 * @param codes - The detected barcodes.
	 */
	onDetect?: (detectedCodes: DetectedBarcode[]) => void;

	/**
	 * A callback function called when the user drags an image file over the drop zone.
	 *
	 * @param isDraggingOver - Whether the user is dragging an image file over the drop zone.
	 */
	onDragover?: (isDraggingOver: boolean) => void;

	/**
	 * A callback function called when the user drags an image file out of the drop zone.
	 *
	 * @param error - The error that occurred.
	 */
	onError?: (error: Error) => void;

	/**
	 * Optional prop for content to be overlayed on top of the drop zone.
	 */
	children?: Snippet;
} & HTMLInputAttributes;

export type StreamProps = {
	/**
	 * The MediaTrackConstraints specifying the desired media types and their constraints.
	 *
	 * @default { video: { facingMode: 'environment' } }
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
	 */
	constraints?: MediaTrackConstraints;

	/**
	 * The formats of the barcodes to detect.
	 *
	 * @default ['qr_code']
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
	 */
	formats?: BarcodeFormat[];

	/**
	 * Whether the camera stream is paused. Bindable.
	 *
	 * @default false
	 *
	 * Can also be set to `true` to pause the camera stream, which is useful when you want to show
	 * some microinteraction after successful scans. When the you set it to `false`, the camera
	 * stream will be restarted and the `onCameraOn` callback function will be triggered again.
	 */
	paused?: boolean;

	/**
	 * Whether the torch is enabled.
	 *
	 * @default false
	 *
	 * Not consistently supported across devices.
	 */
	torch?: boolean;

	/**
	 * Function to visually highlight the detected barcodes.
	 *
	 * @param codes - The detected barcodes with their adjusted corner points.
	 * @param ctx - The canvas rendering context.
	 */
	track?: (detectedCodes: DetectedBarcode[], ctx: CanvasRenderingContext2D) => void;

	/**
	 * A callback function called when the camera stream is turned on.
	 *
	 * @param capabilities - The MediaTrackCapabilities of the camera stream.
	 */
	onCameraOn?: (capabilities: MediaTrackCapabilities) => void;

	/**
	 * A callback function called when the camera stream encounters an error.
	 *
	 * @param error - The error that occurred.
	 */
	onError?: (error: Error) => void;

	/**
	 * A callback function called when the camera stream is turned off.
	 */
	onCameraOff?: () => void;

	/**
	 * A callback function called a detection is made.
	 *
	 * Note: if you scan the same barcode code multiple times in a row, onDetect is still called once.
	 * When you hold a barcode in the camera, frames are actually decoded multiple times a second
	 * but you don't want to be flooded with onDetect callbacks that often.
	 * That's why the last decoded barcode is always cached and only new results are propagated.
	 * However changing the value of `paused` resets this internal cache.
	 */
	onDetect?: (detectedCodes: DetectedBarcode[]) => void;

	/**
	 * Optional prop for content to be overlayed on top of the camera stream.
	 */
	children?: Snippet;
};
