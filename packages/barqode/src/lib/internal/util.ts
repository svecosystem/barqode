// based on vue-qrcode-reader by Niklas Gruhn
// see https://github.com/gruhn/vue-qrcode-reader

/**
 * Creates a function that ensures the given action is only executed once.
 * Subsequent calls to the returned function will return the result of the first call.
 *
 * @template T - The return type of the action.
 * @template U - The type of the arguments passed to the action.
 * @param {function(U[]): T} action - The action to be executed idempotently.
 * @returns {function(...U[]): T | undefined} A function that, when called, will execute the action only once and return the result.
 */
export const idempotent = <T, U>(action: (x: U[]) => T) => {
	let called = false;
	let result: T | undefined = undefined;

	return (...args: U[]) => {
		if (called) {
			return result;
		} else {
			result = action(args);
			called = true;

			return result;
		}
	};
};

/**
 * Asserts that a given value is of type `never`, indicating that this code path should be unreachable.
 * Throws an error if called, signaling a logic error in the code.
 *
 * @param _witness - The value that should be of type `never`.
 * @throws {Error} Always throws an error to indicate unreachable code.
 */
export function assertNever(_witness: never): never {
	throw new Error("this code should be unreachable");
}
