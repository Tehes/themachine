/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
let tickInterval = 2000; // 2 seconds per tick
let tickCount = 0;
let running = false;
let energy = 1;
let wear = 0;

const energyFill = document.querySelector(".tile.energy .fill");
const energyVal = document.querySelector("[data-energy]");
const wearFill = document.querySelector(".tile.wear .fill");
const wearVal = document.querySelector("[data-wear]");

/* --------------------------------------------------------------------------------------------------
functions
---------------------------------------------------------------------------------------------------*/

function startTicks() {
	if (running) return;
	running = true;
	console.log("Tick system started");
	tick();
}

function stopTicks() {
	running = false;
	console.log("Tick system stopped");
}

function tick() {
	if (!running) return;

	tickCount++;
	console.log(`Tick ${tickCount}`);

	if (energyFill && wearFill) {
		energy = Math.max(0, Math.round((energy - 0.1) * 1000) / 1000);
		wear = Math.min(1, Math.round((wear + 0.02) * 1000) / 1000);

		// reflect to DOM (fill + numbers)
		energyFill.style.setProperty("--p", energy);
		wearFill.style.setProperty("--p", wear);

		if (energyVal) energyVal.textContent = Math.round(energy * 10);
		if (wearVal) wearVal.textContent = Math.round(wear * 100);
	}

	// stop when energy = 0 or wear = 100%
	if (energy <= 0 || wear >= 1) {
		stopTicks();
		return;
	}

	// schedule next tick only if still running
	if (running) setTimeout(tick, tickInterval);
}

function init() {
	// The following touchstart event listener was used as a workaround for older iOS devices
	// to prevent a 300ms delay in touch interactions. It is likely not necessary anymore
	// on modern devices and browsers, especially in Progressive Web Apps.
	// If you experience issues with touch interactions, you can uncomment it again.
	// document.addEventListener("touchstart", function() {}, false);

	startTicks();
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
