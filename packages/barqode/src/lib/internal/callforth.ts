// based on vue-qrcode-reader by Niklas Gruhn
// see https://github.com/gruhn/vue-qrcode-reader

/**
 * Creates a Promise that resolves when a specified event is triggered on the given EventTarget.
 *
 * @param eventTarget - The target to listen for events on.
 * @param successEvent - The name of the event that will resolve the Promise.
 * @param errorEvent - The name of the event that will reject the Promise. Defaults to 'error'.
 *
 * @returns A Promise that resolves with the event object when the successEvent is
 *  triggered, or rejects with the event object when the errorEvent is triggered.
 */
export function eventOn(
	eventTarget: EventTarget,
	successEvent: string,
	errorEvent = "error"
): Promise<Event> {
	let $resolve: (value: Event) => void;
	let $reject: (reason?: Event) => void;

	const promise = new Promise(
		(resolve: (value: Event) => void, reject: (reason?: Event) => void) => {
			$resolve = resolve;
			$reject = reject;

			eventTarget.addEventListener(successEvent, $resolve);
			eventTarget.addEventListener(errorEvent, $reject);
		}
	);

	promise.finally(() => {
		eventTarget.removeEventListener(successEvent, $resolve);
		eventTarget.removeEventListener(errorEvent, $reject);
	});

	return promise;
}

/**
 * Creates a promise that resolves after a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait before the promise resolves.
 *
 * @returns A promise that resolves after the specified delay.
 */
export function sleep(ms: number) {
	return new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, ms));
}
