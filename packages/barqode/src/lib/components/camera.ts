// based on vue-qrcode-reader by Niklas Gruhn
// see https://github.com/gruhn/vue-qrcode-reader

import {
	StreamApiNotSupportedError,
	InsecureContextError,
	StreamLoadTimeoutError,
} from "./errors.js";
import { eventOn, timeout } from "./callforth.js";
import shimGetUserMedia from "./shimGetUserMedia.js";
import { assertNever } from "./util.js";

type StartTaskResult = {
	type: "start";
	data: {
		video: HTMLVideoElement;
		stream: MediaStream;
		capabilities: Partial<MediaTrackCapabilities>;
		constraints: MediaTrackConstraints;
		isTorchOn: boolean;
	};
};

type StopTaskResult = {
	type: "stop";
	data: null;
};

type FailedTask = {
	type: "failed";
	error: Error;
};

type TaskResult = StartTaskResult | StopTaskResult | FailedTask;

let taskQueue: Promise<TaskResult> = Promise.resolve({ type: "stop", data: null });

type CreateObjectURLCompat = (obj: MediaSource | Blob | MediaStream) => string;

/**
 * Starts the camera with the given constraints and attaches the stream to the provided video element.
 *
 * @param video - The HTML video element to which the camera stream will be attached.
 * @param constraints - The media track constraints to apply when starting the camera.
 * @param torch - A boolean indicating whether the torch (flashlight) should be enabled if supported.
 *
 * @returns A promise that resolves to a `StartTaskResult` object containing details about the started camera stream.
 *
 * @throws InsecureContextError - If the page is not loaded in a secure context (HTTPS).
 * @throws StreamApiNotSupportedError - If the Stream API is not supported by the browser.
 * @throws StreamLoadTimeoutError - If the video element fails to load the camera stream within a 6-second timeout.
 */
async function runStartTask(
	video: HTMLVideoElement,
	constraints: MediaTrackConstraints,
	torch: boolean
): Promise<StartTaskResult> {
	console.debug("[barqode] starting camera with constraints: ", JSON.stringify(constraints));

	// at least in Chrome `navigator.mediaDevices` is undefined when the page is
	// loaded using HTTP rather than HTTPS. thus `STREAM_API_NOT_SUPPORTED` is
	// initialized with `false` although the API might actually be supported.
	// so although `getUserMedia` already should have a built-in mechanism to
	// detect insecure context (by throwing `NotAllowedError`), we have to do a
	// manual check before even calling `getUserMedia`.
	if (window.isSecureContext !== true) {
		throw new InsecureContextError();
	}

	if (navigator?.mediaDevices?.getUserMedia === undefined) {
		throw new StreamApiNotSupportedError();
	}

	// this is a browser API only shim. tt patches the global window object which
	// is not available during SSR. So we lazily apply this shim at runtime.
	shimGetUserMedia();

	console.debug("[barqode] calling getUserMedia");
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: constraints,
	});

	if (video.srcObject !== undefined) {
		video.srcObject = stream;
	} else if (video.mozSrcObject !== undefined) {
		video.mozSrcObject = stream;
	} else if (window.URL.createObjectURL) {
		video.src = (window.URL.createObjectURL as CreateObjectURLCompat)(stream);
	} else if (window.webkitURL) {
		video.src = (window.webkitURL.createObjectURL as CreateObjectURLCompat)(stream);
	} else {
		video.src = stream.id;
	}

	// in the WeChat browser on iOS, 'loadeddata' event won't get fired unless video is explicitly triggered by play()
	video.play();

	console.debug("[barqode] waiting for video element to load");
	await Promise.race([
		eventOn(video, "loadeddata"),

		// on iOS devices in PWA mode, BarqodeStream works initially, but after killing and restarting the PWA,
		// all video elements fail to load camera streams and never emit the `loadeddata` event.
		// looks like this is related to a WebKit issue (see #298). no workarounds at the moment.
		// to at least detect this situation, we throw an error if the event has not been emitted after a 6 second timeout.
		timeout(6_000).then(() => {
			throw new StreamLoadTimeoutError();
		}),
	]);
	console.debug("[barqode] video element loaded");

	// according to: https://oberhofer.co/mediastreamtrack-and-its-capabilities/#queryingcapabilities
	// on some devices, getCapabilities only returns a non-empty object after some delay.
	// there is no appropriate event so we have to add a constant timeout
	await timeout(500);

	const [track] = stream.getVideoTracks();

	const capabilities: Partial<MediaTrackCapabilities> = track?.getCapabilities?.() ?? {};

	let isTorchOn = false;
	// @ts-expect-error torch is not in the MediaTrackConstraints type but it should be?
	if (torch && capabilities.torch) {
		// @ts-expect-error torch is not in the MediaTrackConstraints type but it should be?
		await track.applyConstraints({ advanced: [{ torch: true }] });
		isTorchOn = true;
	}

	console.debug("[barqode] camera ready");

	return {
		type: "start",
		data: {
			video,
			stream,
			capabilities,
			constraints,
			isTorchOn,
		},
	};
}

/**
 * Starts the camera with the given video element and settings.
 *
 * @param video - The HTML video element to which the camera stream will be attached.
 * @param options.constraints - The media track constraints to apply when starting the camera.
 * @param options.torch - A boolean indicating whether the torch (flashlight) should be enabled if supported.
 * @param options.restart - A boolean indicating whether to restart the camera even if no settings changed. Defaults to false.
 *
 * @returns A promise that resolves to a `MediaTrackCapabilities` object containing the camera capabilities.
 *
 * @throws Error - If something goes wrong with the camera task queue.
 */
export async function start(
	video: HTMLVideoElement,
	{
		constraints,
		torch,
		restart = false,
	}: {
		constraints: MediaTrackConstraints;
		torch: boolean;
		restart?: boolean;
	}
): Promise<Partial<MediaTrackCapabilities>> {
	// update the task queue synchronously
	taskQueue = taskQueue
		.then((prevTaskResult) => {
			if (prevTaskResult.type === "start") {
				// previous task is a start task
				// we'll check if we can reuse the previous result
				const {
					data: {
						video: prevVideo,
						stream: prevStream,
						constraints: prevConstraints,
						isTorchOn: prevIsTorchOn,
					},
				} = prevTaskResult;
				// TODO: should we keep this object comparison
				// this code only checks object sameness not equality
				// deep comparison requires snapshots and value by value check
				// which seem too much
				if (
					!restart &&
					video === prevVideo &&
					constraints === prevConstraints &&
					torch === prevIsTorchOn
				) {
					// things didn't change, reuse the previous result
					return prevTaskResult;
				}
				// something changed, restart (stop then start)
				return runStopTask(prevVideo, prevStream, prevIsTorchOn).then(() =>
					runStartTask(video, constraints, torch)
				);
			} else if (prevTaskResult.type === "stop" || prevTaskResult.type === "failed") {
				// previous task is a stop/error task
				// we can safely start
				return runStartTask(video, constraints, torch);
			}

			assertNever(prevTaskResult);
		})
		.catch((error: Error) => {
			console.debug(`[barqode] starting camera failed with "${error}"`);
			return { type: "failed", error };
		});

	// await the task queue asynchronously
	const taskResult = await taskQueue;

	if (taskResult.type === "stop") {
		// we just synchronously updated the task above
		// to make the latest task a start task
		// so this case shouldn't happen
		throw new Error("Something went wrong with the camera task queue (start task).");
	} else if (taskResult.type === "failed") {
		throw taskResult.error;
	} else if (taskResult.type === "start") {
		// return the data we want
		return taskResult.data.capabilities;
	}

	assertNever(taskResult);
}

/**
 * Stops the camera stream and cleans up associated resources.
 *
 * @param video - The HTML video element displaying the camera stream.
 * @param stream - The MediaStream object representing the active camera stream.
 * @param isTorchOn - A boolean indicating whether the torch is currently enabled.
 *
 * @returns A promise that resolves to a `StopTaskResult` when the camera is fully stopped.
 */
async function runStopTask(
	video: HTMLVideoElement,
	stream: MediaStream,
	isTorchOn: boolean
): Promise<StopTaskResult> {
	console.debug("[barqode] stopping camera");

	video.src = "";
	video.srcObject = null;
	video.load();

	// wait for load() to emit error
	// because src and srcObject are empty
	await eventOn(video, "error");

	for (const track of stream.getTracks()) {
		// @ts-expect-error torch is not in the MediaTrackConstraints type but it should be?
		isTorchOn ?? (await track.applyConstraints({ advanced: [{ torch: false }] }));
		stream.removeTrack(track);
		track.stop();
	}

	return {
		type: "stop",
		data: null,
	};
}

/**
 * Stops any active camera stream and ensures proper cleanup.
 *
 * @returns A promise that resolves when the camera is fully stopped.
 *
 * @throws Error - If something goes wrong with the camera task queue.
 */
export async function stop() {
	// update the task queue synchronously
	taskQueue = taskQueue.then((prevTaskResult) => {
		if (prevTaskResult.type === "stop" || prevTaskResult.type === "failed") {
			// previous task is a stop task
			// no need to stop again
			return prevTaskResult;
		}
		const {
			data: { video, stream, isTorchOn },
		} = prevTaskResult;
		return runStopTask(video, stream, isTorchOn);
	});
	// await the task queue asynchronously
	const taskResult = await taskQueue;
	if (taskResult.type === "start") {
		// we just synchronously updated the task above
		// to make the latest task a stop task
		// so this case shouldn't happen
		throw new Error("Something went wrong with the camera task queue (stop task).");
	}
}
