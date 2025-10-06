/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/
let tickInterval = 6000; // milliseconds per tick
let activeTickInterval = tickInterval;
let tickCount = 0;
let tickStartTs = 0;
let animationId = 0;

let running = false;

// --- Core State ---
const energyState = {
	current: 10, // units
	capacity: 10, // units (max)
	consPerTick: 1, // units per tick
};

const outputState = {
	current: 0, // tokens
	capacity: 10, // max tokens
	prodPerTick: 2, // tokens per tick
};

let wear = 0; // 0..1
const WEAR_DELTA = 0.02;

// --- DOM refs ---
const energyEls = {
	fill: document.querySelector(".tile.energy .fill"),
	val: document.querySelector(".tile.energy [data-energy]"),
	cap: document.querySelector(".tile.energy [data-capacity]"),
	cons: document.querySelector(".tile.energy .consumption [data-consumption]"),
};

const wearEls = {
	fill: document.querySelector(".tile.wear .fill"),
	val: document.querySelector(".tile.wear [data-wear]"),
	cons: document.querySelector(".tile.wear .consumption [data-consumption]"),
};

const outputEls = {
	fill: document.querySelector(".tile.output .fill"),
	val: document.querySelector(".tile.output [data-output]"),
	cap: document.querySelector(".tile.output [data-output-capacity]"),
	prod: document.querySelector(".tile.output .consumption [data-production]"),
};

const tickEls = {
	dial: document.querySelector(".tile.tick .dial"),
	count: document.querySelector(".tile.tick [data-tick-count]"),
	duration: document.querySelector(".tile.tick [data-tick-duration]"),
};

/* --------------------------------------------------------------------------------------------------
functions
---------------------------------------------------------------------------------------------------*/
function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

function fmt2(n) {
	const s = n.toFixed(2);
	return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function renderEnergy() {
	const { current, capacity, consPerTick } = energyState;
	const p = capacity > 0 ? clamp01(current / capacity) : 0;
	if (energyEls.fill) energyEls.fill.style.setProperty("--p", p);
	if (energyEls.val) energyEls.val.textContent = current;
	if (energyEls.cap) energyEls.cap.textContent = capacity;
	if (energyEls.cons) energyEls.cons.textContent = consPerTick;
}

function renderWear() {
	if (wearEls.fill) wearEls.fill.style.setProperty("--p", wear);
	if (wearEls.val) wearEls.val.textContent = (wear * 100).toFixed(1);
	if (wearEls.cons) wearEls.cons.textContent = (WEAR_DELTA * 100).toFixed(1);
}

function renderOutput() {
	const { current, capacity, prodPerTick } = outputState;
	const p = capacity > 0 ? clamp01(current / capacity) : 0;
	if (outputEls.fill) outputEls.fill.style.setProperty("--p", p);
	if (outputEls.val) outputEls.val.textContent = fmt2(current);
	if (outputEls.cap) outputEls.cap.textContent = capacity;
	// Show effective production (reduced by wear)
	const effProd = Math.max(0, prodPerTick * (1 - wear));
	if (outputEls.prod) outputEls.prod.textContent = effProd.toFixed(2);
}

function renderTickStatic() {
	if (tickEls.duration) {
		tickEls.duration.textContent = (activeTickInterval / 1000).toString();
	}
	document.documentElement.style.setProperty("--tick-duration", `${activeTickInterval}ms`);
	if (tickEls.count) tickEls.count.textContent = tickCount;
	if (tickEls.dial) tickEls.dial.style.setProperty("--p", 1);
}

function animateTick(ts) {
	if (!running) return;
	if (!tickStartTs) tickStartTs = ts;
	const elapsed = ts - tickStartTs;
	const p = Math.max(0, Math.min(1, 1 - (elapsed / activeTickInterval))); // run downwards: 1 → 0
	if (tickEls.dial) tickEls.dial.style.setProperty("--p", p);
	animationId = requestAnimationFrame(animateTick);
}

function applyTick() {
	// Produce tokens up to capacity (reduced by wear)
	const eff = Math.max(0, 1 - wear);
	const produced = Math.max(0, outputState.prodPerTick * eff);
	outputState.current = Math.min(
		outputState.capacity,
		outputState.current + produced,
	);
	// Snap to exact cap if very close to avoid FP noise in UI
	if (Math.abs(outputState.capacity - outputState.current) < 1e-9) {
		outputState.current = outputState.capacity;
	}
	// Energy drains by integer units per tick
	energyState.current = Math.max(0, energyState.current - energyState.consPerTick);
	// Wear increases by percentage per tick
	wear = clamp01(wear + WEAR_DELTA);
}

function startTicks() {
	if (running) return;
	running = true;
	console.log("Tick system started");
	// prepare dial & start animation
	tickStartTs = performance.now();
	activeTickInterval = tickInterval;
	animationId = requestAnimationFrame(animateTick);
	setTimeout(tick, tickInterval);
}

function stopTicks() {
	running = false;
	console.log("Tick system stopped");
	cancelAnimationFrame(animationId);
	animationId = 0;
	if (tickEls.dial) tickEls.dial.style.setProperty("--p", 0);
}

function tick() {
	if (!running) return;

	tickCount++;
	if (tickEls.count) tickEls.count.textContent = tickCount;
	// reset dial sweep for next cycle
	tickStartTs = performance.now();
	// latch the duration for this new cycle so mid-tick changes only apply next time
	activeTickInterval = tickInterval;
	if (tickEls.dial) tickEls.dial.style.setProperty("--p", 1);

	applyTick();
	renderTickStatic();
	renderEnergy();
	renderWear();
	renderOutput();

	// stop when energy empty or wear full
	if (energyState.current <= 0 || wear >= 1) {
		stopTicks();
		return;
	}

	if (running) setTimeout(tick, tickInterval);
}

function init() {
	// The following touchstart event listener was used as a workaround for older iOS devices
	// to prevent a 300ms delay in touch interactions. It is likely not necessary anymore
	// on modern devices and browsers, especially in Progressive Web Apps.
	// If you experience issues with touch interactions, you can uncomment it again.
	// document.addEventListener("touchstart", function() {}, false);

	renderEnergy();
	renderWear();
	renderOutput();
	renderTickStatic();
	startTicks();
}

function setEnergyCapacity(n) {
	n = Math.max(1, Math.floor(n));
	energyState.capacity = n;
	energyState.current = Math.min(energyState.current, n);
	renderEnergy();
}

function setEnergyFill(n) {
	n = Math.max(0, Math.min(n, energyState.capacity));
	energyState.current = n;
	renderEnergy();
}

function setEnergyConsumption(unitsPerTick) {
	unitsPerTick = Math.max(0, Math.floor(unitsPerTick));
	energyState.consPerTick = unitsPerTick;
	renderEnergy();
}

function setTickInterval(ms) {
	ms = Math.max(0, Math.floor(ms));
	tickInterval = ms;
}

function setOutputCapacity(n) {
	n = Math.max(0, Math.floor(n));
	outputState.capacity = n;
	outputState.current = Math.min(outputState.current, n);
	renderOutput();
}
function setOutputFill(n) {
	n = Math.max(0, Math.min(Math.floor(n), outputState.capacity));
	outputState.current = n;
	renderOutput();
}
function setOutputProduction(perTick) {
	perTick = Math.max(0, Math.floor(perTick));
	outputState.prodPerTick = perTick;
	renderOutput();
}

/* --------------------------------------------------------------------------------------------------
public members, exposed with return statement
---------------------------------------------------------------------------------------------------*/
globalThis.machine = {
	init,
	setEnergyCapacity,
	setEnergyFill,
	setEnergyConsumption,
	setTickInterval,
	setOutputCapacity,
	setOutputFill,
	setOutputProduction,
};

globalThis.machine.init();

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
