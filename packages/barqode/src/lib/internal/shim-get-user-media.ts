// based on vue-qrcode-reader by Niklas Gruhn
// see https://github.com/gruhn/vue-qrcode-reader

// @ts-expect-error no types available
import { shimGetUserMedia as chromeShim } from "webrtc-adapter/dist/chrome/getusermedia";
// @ts-expect-error no types available
import { shimGetUserMedia as firefoxShim } from "webrtc-adapter/dist/firefox/getusermedia";
// @ts-expect-error no types available
import { shimGetUserMedia as safariShim } from "webrtc-adapter/dist/safari/safari_shim";
// @ts-expect-error no types available
import { detectBrowser } from "webrtc-adapter/dist/utils";

import { StreamApiNotSupportedError } from "./errors.js";
import { idempotent } from "./util.js";

export default idempotent(() => {
	const browserDetails = detectBrowser(window);

	switch (browserDetails.browser) {
		case "chrome":
			chromeShim(window, browserDetails);
			break;
		case "firefox":
			firefoxShim(window, browserDetails);
			break;
		case "safari":
			safariShim(window, browserDetails);
			break;
		default:
			throw new StreamApiNotSupportedError();
	}
});
