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
	current: 5,
	capacity: 10,
	consPerTick: 1,
	costGrowth: 0.02,
};

const outputState = {
	current: 0, // tokens
	capacity: 10, // max tokens
	prodPerTick: 1.5, // tokens per tick
};

const wearState = {
	current: 0,
	perTick: 0.02,
};

const heatState = {
	current: 0,
	maxHeat: 100,
	wearMultiplier: 0.13,
};

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

const heatEls = {
	fill: document.querySelector(".tile.heat .fill"),
	temp: document.querySelector(".tile.heat [data-heat-temp]"),
	multiplier: document.querySelector(".tile.heat [data-heat-multiplier]"),
};

const buttons = Array.from(document.querySelectorAll(".actions .btn"));

const UNIT_TPL = {
	"bolt": '<span class="icon">bolt</span>',
	"token": '<span class="icon">token</span>',
	"warning": '<span class="icon">warning</span>',
	"timelapse": '<span class="icon">timelapse</span>',
	"heat": '<span class="icon">mode_heat</span>',
};

const modules = {
	vault: {
		id: "vault",
		name: "Vault",
		level: 0,
		maxLevel: 3,
		cost: 10,
		costIncrease: 10,
		labels: {
			install: "Install",
			upgrade: (level) => `Level ${level + 1}`,
			maxLevel: "Max Level",
		},
		effects: [
			{
				type: "outputCapacity",
				value: 10,
				perLevel: true,
				positive: true,
				label: (val) => `Token Cap +${val}${UNIT_TPL.token}`,
			},
			{
				type: "energyCost",
				value: 0.01,
				perLevel: true,
				positive: false,
				label: (val) =>
					`consumption +${val.toFixed(2)}${UNIT_TPL.bolt}/${UNIT_TPL.timelapse}`,
			},
		],
	},
	generator: {
		id: "generator",
		name: "Generator",
		level: 0,
		maxLevel: 3,
		cost: 7,
		costIncrease: 7,
		labels: {
			install: "Install",
			upgrade: (level) => `Level ${level + 1}`,
			maxLevel: "Max Level",
		},
		effects: [
			{
				type: "outputProduction",
				value: 3,
				perLevel: true,
				positive: true,
				label: (val) => `output +${val}${UNIT_TPL.token}/${UNIT_TPL.timelapse}`,
			},
			{
				type: "scaleBuyEnergy",
				value: { factor: 1.5, discount: 10 },
				perLevel: false,
				positive: true,
				label: (val) => `Buy ×${val.factor}${UNIT_TPL.bolt} for less ${UNIT_TPL.token}`,
			},
			{
				type: "heatGeneration",
				value: 30,
				perLevel: true,
				positive: false,
				label: (val) => `+${val}${UNIT_TPL.heat}`,
			},
		],
	},
	cooling: {
		id: "cooling",
		name: "Cooling",
		level: 0,
		maxLevel: 3,
		cost: 12,
		costIncrease: 12,
		labels: {
			install: "Install",
			upgrade: (level) => `Level ${level + 1}`,
			maxLevel: "Max Level",
		},
		effects: [
			{
				type: "heatGeneration",
				value: -20,
				perLevel: true,
				positive: true,
				label: (val) => `${val}${UNIT_TPL.heat}`,
			},
			{
				type: "scaleRepairWear",
				value: { factor: 1.5, discount: 12 },
				perLevel: false,
				positive: true,
				label: (val) =>
					`Repair ×${val.factor}${UNIT_TPL.warning} for less ${UNIT_TPL.token}`,
			},
			{
				type: "outputProduction",
				value: -0.5,
				perLevel: true,
				positive: false,
				label: (v) =>
					`output ${v >= 0 ? "+" : ""}${fmt2(v)}${UNIT_TPL.token}/${UNIT_TPL.timelapse}`,
			},
		],
	},
	battery: {
		id: "battery",
		name: "Battery",
		level: 0,
		maxLevel: 3,
		cost: 9,
		costIncrease: 9,
		labels: {
			install: "Install",
			upgrade: (level) => `Level ${level + 1}`,
			maxLevel: "Max Level",
		},
		effects: [
			{
				type: "energyCapacity",
				value: 10,
				perLevel: true,
				positive: true,
				label: (v) => `Energy Cap +${v}${UNIT_TPL.bolt}`,
			},
			{
				type: "energyCost",
				value: 0.01,
				perLevel: true,
				positive: false,
				label: (val) =>
					`consumption +${val.toFixed(2)}${UNIT_TPL.bolt}/${UNIT_TPL.timelapse}`,
			},
		],
	},
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

const effectHandlers = {
	outputCapacity: (value) => {
		outputState.capacity += value;
	},
	wearRate: (value) => {
		wearState.perTick = Math.min(1, Math.max(0, wearState.perTick + value));
	},
	energyCapacity: (value) => {
		energyState.capacity += value;
	},
	energyCost: (value) => {
		energyState.costGrowth += value;
	},
	heatGeneration: (value) => {
		heatState.current = Math.min(heatState.maxHeat, Math.max(0, heatState.current + value));
	},
	outputProduction: (value) => {
		outputState.prodPerTick += value;
	},
	scaleBuyEnergy: (value) => {
		const { factor, discount } = value;
		const btn = document.querySelector('.btn[data-action="buy-energy"]');
		if (!btn) return;
		btn.dataset.amount = Math.round(Number(btn.dataset.amount || 0) * factor);
		btn.dataset.cost = Math.floor(
			Number(btn.dataset.cost || 0) * (factor * 1 - discount / 100),
		);
		renderButtons();
	},
	scaleRepairWear: (value) => {
		const { factor, discount } = value;
		const btn = document.querySelector('.btn[data-action="repair-wear"]');
		if (!btn) return;
		btn.dataset.amount = Math.round(Number(btn.dataset.amount || 0) * factor);
		btn.dataset.cost = Math.floor(
			Number(btn.dataset.cost || 0) * (factor * 1 - discount / 100),
		);
		renderButtons();
	},
};

function getModuleElements(moduleId) {
	const tile = document.querySelector(`[data-module="${moduleId}"]`);
	return {
		tile: tile,
		name: tile?.querySelector("[data-module-name]"),
		level: tile?.querySelector("[data-module-level]"),
		effects: tile?.querySelector("[data-module-effects]"),
		nextEffects: tile?.querySelector("[data-module-next-effects]"),
	};
}

function upgradeModule(moduleId) {
	const module = modules[moduleId];
	if (!module || module.level >= module.maxLevel) return false;

	const cost = module.cost;
	if (outputState.current < cost) return false;

	// Pay cost
	outputState.current -= cost;

	// Apply effects
	for (const effect of module.effects) {
		const handler = effectHandlers[effect.type];
		if (handler) {
			handler(effect.value);
		}
	}

	// Update module state
	module.level++;
	module.cost += module.costIncrease;

	return true;
}

function renderModule(moduleId) {
	const module = modules[moduleId];
	const els = getModuleElements(moduleId); // DOM refs per module

	if (els.name) els.name.textContent = module.name;
	if (els.level) els.level.textContent = module.level;
	if (els.tile) els.tile.dataset.locked = module.level === 0 ? "true" : "false";

	// Active effects
	if (els.effects) {
		if (module.level === 0) {
			els.effects.innerHTML = '<span class="inactive">—</span>';
		} else {
			const effectsHtml = module.effects.map((eff) => {
				const totalValue = eff.perLevel ? eff.value * module.level : eff.value;
				const cssClass = eff.positive ? "positive" : "negative";
				const icon = eff.positive ? "✓" : "✗";
				return `<div class="effect-item ${cssClass}">${icon} ${
					eff.label(totalValue)
				}</div>`;
			}).join("");
			els.effects.innerHTML = effectsHtml;
		}
	}

	// Next level preview
	if (els.nextEffects) {
		if (module.level >= module.maxLevel) {
			els.nextEffects.innerHTML = '<span class="inactive">—</span>';
		} else {
			const nextHtml = module.effects.map((eff) => {
				const cssClass = eff.positive ? "positive" : "negative";
				const nextTotalValue = eff.perLevel ? eff.value * (module.level + 1) : eff.value;
				return `<div class="effect-item ${cssClass}">→ ${eff.label(nextTotalValue)}</div>`;
			}).join("");
			els.nextEffects.innerHTML = nextHtml;
		}
	}
}

function renderEnergy() {
	const { current, capacity, consPerTick } = energyState;
	const p = capacity > 0 ? clamp01(current / capacity) : 0;
	if (energyEls.fill) energyEls.fill.style.setProperty("--p", p);
	if (energyEls.val) energyEls.val.textContent = fmt2(current);
	if (energyEls.cap) energyEls.cap.textContent = capacity;
	if (energyEls.cons) energyEls.cons.textContent = fmt2(consPerTick);
}

function renderWear() {
	const hueStart = 220; // blue (0% wear)
	const hueEnd = 280; // purple (100% wear)
	const hue = hueStart + (wearState.current * (hueEnd - hueStart));

	document.documentElement.style.setProperty("--hue", Math.round(hue));

	if (wearEls.fill) wearEls.fill.style.setProperty("--p", wearState.current);
	if (wearEls.val) wearEls.val.textContent = (wearState.current * 100).toFixed(1);
	const totalPerTick = wearState.perTick + (heatState.current * heatState.wearMultiplier) / 100;
	if (wearEls.cons) wearEls.cons.textContent = (totalPerTick * 100).toFixed(2);
}

function renderOutput() {
	const { current, capacity, prodPerTick } = outputState;
	const p = capacity > 0 ? clamp01(current / capacity) : 0;
	if (outputEls.fill) outputEls.fill.style.setProperty("--p", p);
	if (outputEls.val) outputEls.val.textContent = fmt2(current);
	if (outputEls.cap) outputEls.cap.textContent = capacity;
	// Show raw production (no reduction by wear)
	if (outputEls.prod) outputEls.prod.textContent = prodPerTick.toFixed(2);
}

function renderHeat() {
	const { current, maxHeat } = heatState;
	const p = Math.max(0, Math.min(1, current / maxHeat));

	if (heatEls.fill) heatEls.fill.style.setProperty("--p", p);
	if (heatEls.temp) heatEls.temp.textContent = Math.round(current);
	if (heatEls.multiplier) {
		heatEls.multiplier.textContent = heatState.wearMultiplier.toFixed(2);
	}
}

function renderButtons() {
	for (const btn of buttons) {
		const amountEl = btn.querySelector(".amount");
		const unitEl = btn.querySelector(".unit");
		const costEl = btn.querySelector(".cost-val");

		if (amountEl) amountEl.textContent = btn.dataset.amount || "";

		if (unitEl) {
			const key = btn.dataset.unit || "";
			if (UNIT_TPL[key] !== undefined) {
				unitEl.innerHTML = UNIT_TPL[key];
			} else {
				unitEl.textContent = key;
			}
		}

		if (costEl) costEl.textContent = btn.dataset.cost || "";
	}
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
	// Produce tokens up to capacity
	const produced = outputState.prodPerTick;

	outputState.current = Math.min(
		outputState.capacity,
		outputState.current + produced,
	);

	// Snap to exact cap if very close to avoid FP noise in UI
	if (Math.abs(outputState.capacity - outputState.current) < 1e-9) {
		outputState.current = outputState.capacity;
	}

	// Increase energy consumption per tick
	energyState.consPerTick += energyState.costGrowth;

	// Energy drains by integer units per tick
	energyState.current = Math.max(0, energyState.current - energyState.consPerTick);

	// Wear increases (base + heat-amplified)
	const heatWear = (heatState.current * heatState.wearMultiplier) / 100;
	wearState.current = clamp01(wearState.current + wearState.perTick + heatWear);
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
	renderHeat();
	renderWear();
	renderOutput();
	renderButtons();
	refreshButtons();

	// stop when energy empty or wear full
	if (energyState.current <= 0 || wearState.current >= 1) {
		stopTicks();
		return;
	}

	if (running) setTimeout(tick, tickInterval);
}

function refreshButtons() {
	for (const btn of buttons) {
		const action = btn.dataset.action;
		const cost = Number(btn.dataset.cost ?? btn.querySelector(".cost-val")?.textContent ?? 0);
		const amount = Number(btn.dataset.amount ?? btn.querySelector(".amount")?.textContent ?? 0);
		let moduleRef = null;

		let enabled = false;

		switch (action) {
			case "buy-energy": {
				enabled = outputState.current >= cost && // enough Tokens
					energyState.current < energyState.capacity && // not full
					amount > 0;
				break;
			}
			case "repair-wear": {
				enabled = outputState.current >= cost && wearState.current > 0 && amount > 0;
				break;
			}
			case "upgrade-vault": {
				moduleRef = modules.vault;
				break;
			}
			case "upgrade-generator": {
				moduleRef = modules.generator;
				break;
			}
			case "upgrade-battery": {
				moduleRef = modules.battery;
				break;
			}
			case "upgrade-cooling": {
				moduleRef = modules.cooling;
				break;
			}

			default:
				enabled = false;
		}

		if (moduleRef) {
			enabled = moduleRef.level < moduleRef.maxLevel && outputState.current >= moduleRef.cost;
			const labelEl = btn.querySelector("[data-module-action]");
			if (labelEl) {
				labelEl.textContent = moduleRef.level === 0
					? moduleRef.labels.install
					: moduleRef.level >= moduleRef.maxLevel
					? moduleRef.labels.maxLevel
					: moduleRef.labels.upgrade(moduleRef.level);
			}

			if (moduleRef.level >= moduleRef.maxLevel) {
				btn.querySelector(".cost").hidden = true;
			} else {
				btn.querySelector(".cost").hidden = false;
				btn.dataset.cost = moduleRef.cost;
				const costEl = btn.querySelector(".cost-val");
				if (costEl) costEl.textContent = moduleRef.cost;
			}
		}

		btn.disabled = !enabled;
	}
}

function executeAction(btn) {
	const action = btn.dataset.action;
	const cost = Number(btn.dataset.cost ?? 0);
	const amount = Number(btn.dataset.amount ?? 0);

	if (btn.disabled) return;
	if (outputState.current < cost) return; // sanity check

	switch (action) {
		case "buy-energy": {
			outputState.current = Math.max(0, outputState.current - cost);
			energyState.current = Math.min(energyState.capacity, energyState.current + amount);
			renderEnergy();
			renderOutput();
			break;
		}
		case "repair-wear": {
			outputState.current = Math.max(0, outputState.current - cost);
			wearState.current = clamp01(wearState.current - amount / 100); // amount is given in percent
			renderWear();
			renderOutput();
			break;
		}
		case "upgrade-vault": {
			if (upgradeModule("vault")) {
				renderModule("vault");
				renderWear();
				renderOutput();
			}
			break;
		}
		case "upgrade-generator": {
			if (upgradeModule("generator")) {
				renderModule("generator");
				renderHeat();
				renderOutput();
				renderWear();
			}
			break;
		}
		case "upgrade-battery": {
			if (upgradeModule("battery")) {
				renderModule("battery");
				renderOutput();
				renderEnergy();
			}
			break;
		}
		case "upgrade-cooling": {
			if (upgradeModule("cooling")) {
				renderModule("cooling");
				renderHeat();
				renderWear();
				renderOutput();
			}
			break;
		}

		default:
			console.warn("Unhandled action:", action);
	}

	refreshButtons();
}

function init() {
	// The following touchstart event listener was used as a workaround for older iOS devices
	// to prevent a 300ms delay in touch interactions. It is likely not necessary anymore
	// on modern devices and browsers, especially in Progressive Web Apps.
	// If you experience issues with touch interactions, you can uncomment it again.
	// document.addEventListener("touchstart", function() {}, false);

	renderEnergy();
	renderWear();
	renderHeat();
	renderOutput();
	renderModule("vault");
	renderModule("generator");
	renderModule("battery");
	renderModule("cooling");
	renderTickStatic();
	startTicks();
	renderButtons();
	refreshButtons();

	document.addEventListener("click", (ev) => {
		const btn = ev.target.closest(".actions .btn[data-action]");
		if (!btn) return;
		executeAction(btn);
	});
}

/* --------------------------------------------------------------------------------------------------
public members, exposed with return statement
---------------------------------------------------------------------------------------------------*/
globalThis.machine = {
	init,
	startTicks,
	stopTicks,
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
