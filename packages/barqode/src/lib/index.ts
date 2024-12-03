export { default as BarqodeCapture } from "./components/barqode-capture.svelte";
export { default as BarqodeDropzone } from "./components/barqode-dropzone.svelte";
export { default as BarqodeStream } from "./components/barqode-stream.svelte";

export type {
	DetectedBarcode,
	BarcodeFormat,
	Point2D,
	CaptureProps,
	DropZoneProps,
	StreamProps,
} from "./components/types.js";
