/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/

/* --------------------------------------------------------------------------------------------------
functions
---------------------------------------------------------------------------------------------------*/

function init() {
	// The following touchstart event listener was used as a workaround for older iOS devices
	// to prevent a 300ms delay in touch interactions. It is likely not necessary anymore
	// on modern devices and browsers, especially in Progressive Web Apps.
	// If you experience issues with touch interactions, you can uncomment it again.
	// document.addEventListener("touchstart", function() {}, false);
}

/* --------------------------------------------------------------------------------------------------
public members, exposed with return statement
---------------------------------------------------------------------------------------------------*/
globalThis.app = {
	init,
};

globalThis.app.init();

/* --------------------------------------------------------------------------------------------------
Service Worker configuration. Toggle 'useServiceWorker' to enable or disable the Service Worker.
---------------------------------------------------------------------------------------------------*/
const useServiceWorker = false; // Set to "true" if you want to register the Service Worker, "false" to unregister
const serviceWorkerVersion = "2025-09-20-v1"; // Increment this version to force browsers to fetch a new service-worker.js

async function registerServiceWorker() {
	try {
		// Force bypassing the HTTP cache so even Safari checks for a new
		// service-worker.js on every load.
		const registration = await navigator.serviceWorker.register(
			`./service-worker.js?v=${serviceWorkerVersion}`,
			{
				scope: "./",
				// updateViaCache is ignored by Safari but helps other browsers
				updateViaCache: "none",
			},
		);
		// Immediately ping for an update to catch fresh versions that may
		// have been cached by the browser.
		registration.update();
		console.log(
			"Service Worker registered with scope:",
			registration.scope,
		);
	} catch (error) {
		console.log("Service Worker registration failed:", error);
	}
}

async function unregisterServiceWorkers() {
	const registrations = await navigator.serviceWorker.getRegistrations();
	if (registrations.length === 0) return;

	await Promise.all(registrations.map((r) => r.unregister()));
	console.log("All service workers unregistered – reloading page…");
	// Hard reload to ensure starting without cache
	globalThis.location.reload();
}

if ("serviceWorker" in navigator) {
	globalThis.addEventListener("DOMContentLoaded", async () => {
		if (useServiceWorker) {
			await registerServiceWorker();
		} else {
			await unregisterServiceWorkers();
		}
	});
}
