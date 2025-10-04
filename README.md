# The Machine

**The Machine** is an experimental, real-time survival simulation and engine-building game,
developed as a Progressive Web App (PWA).\
The player manages a single abstract machine that continuously produces money, consumes energy, and
inevitably wears down over time.\
The goal: survive as long as possible before the system collapses.

---

## ⚠️ Status

This project is **under development**.\
It is currently a design prototype — not yet a finished, playable game.\
This README describes the concept and planned features.

---

## 🎯 Core Goal

- Survive as long as possible → **score = time survived**
- Keep the machine alive by:
  - Managing **energy**
  - Repairing **wear**
  - Installing and upgrading **modules**

---

## 🔁 Core Loop

The machine runs in continuous **ticks** — short real-time intervals that represent system cycles.

Each tick:

- Produces money (`+💰`)
- Consumes energy (`−⚡`)
- Increases wear (`+💥`)

The player can take actions (buy energy, repair, activate or upgrade modules) at any time —\
but time and deterioration never stop.\
When energy reaches **0** or damage hits **100%**, the machine fails.

---

## ⚙️ System Overview

All key systems are connected through one feedback triangle:

```
Money ↑ → Energy ↓ → Wear ↑
     ↖---------------↙
```

- **Money** funds upgrades and repairs, but upgrades increase consumption.
- **Energy** keeps the system alive but drains constantly.
- **Wear** rises each tick — faster when the machine runs hot.
- **Tick speed** accelerates over time, intensifying the cycle.

Balancing these three axes is the heart of survival: every optimization pushes another part closer
to collapse.

---

## 🔩 Modules & Bays – Building the Machine

The machine consists of multiple **bays** arranged in a fixed layout.\
All bays exist from the start — but most are inactive until the player installs them.

- **Fixed structure:** no random shop or rerolling. All potential modules are visible.
- **Start state:** only core modules (e.g. Generator + Battery) are active.
- **Activation:** inactive bays can be installed anytime for a cost, adding their effects to the
  system.
- **Upgrading:** installed bays can be enhanced, increasing benefits and drawbacks.
- **Categories:**
  - **Generator** – increases production but raises energy use & wear
  - **Battery** – expands energy capacity but raises consumption
  - **Cooling** – slows wear & tick rate but reduces output
  - **Durability / Stabilizer** – reduces wear permanently
  - **Overclock** – boosts output, speeds up ticks, adds stress
- **Persistence:** bays remain consistent throughout a run; no RNG churn.
- **Emergent variety:** runs diverge through activation order, upgrade timing, and risk management —
  not through randomness.

---

## 💥 Wear & Repairs

- **Wear** increases each tick, based on tick speed and system stress.
- Each installed module adds to wear in unique proportions.
- **Cooling** and **Durability** modules mitigate wear buildup.
- **Repairs** reduce accumulated damage but cost money — they buy time, not safety.
- Over time, wear accelerates faster than repairs can offset it.

---

## ⚡ Events & Market Dynamics

Occasional events and market shifts add unpredictability to the system:

- **Energy price drift:** trends upward over time, with small fluctuations per tick.
- **Instability events:** temporary modifiers to tick speed, wear, or consumption.
- **Emergency actions:** one-time relief options (e.g., temporary battery injection).

Events are rare but impactful — designed to disrupt routines and force adaptive play.

---

## 🧮 Balancing (initial draft values)

- Start money: **5**
- Base production: **+1💰/tick**
- Base consumption: **−1⚡/tick**
- Battery capacity: **10⚡**
- Starting damage: **0%**
- Energy price: **1.20💰/⚡**, increases by ~**1.5% per tick** (light fluctuation)
- Starting tick duration: **10 seconds** (accelerates over time)

---

## 🎨 Interface & Experience

- Minimal, abstract interface resembling a machine control panel.
- Each bay represented as a **tile** showing live metrics and upgrade states.
- The machine visibly **grows** as modules activate.
- Visual and audio feedback communicate system stress (tick pulse, alerts, color shifts).
- Designed for clarity under pressure, adaptable to both mobile and desktop.
- Style: sleek, high-tech, industrial — no decorative illustrations.

---

## 📌 Roadmap

- [ ] Core state engine (energy, money, wear, tick)
- [ ] Bay system (activation, upgrades, interactions)
- [ ] Event & market system
- [ ] UI prototype (modular tiles, HUD, live feedback)
- [ ] Balancing iterations & test runs

---

## 📖 License

TBD – project is in an early stage.
