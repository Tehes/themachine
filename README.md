# The Machine

**The Machine** is an experimental, real-time survival simulation and engine-building game,
developed as a Progressive Web App (PWA).\
The player manages a single abstract machine that continuously produces tokens, consumes energy, and
inevitably wears down over time.\
The goal: survive as long as possible before the system collapses.

---

## ⚠️ Status

This project is **in active prototype phase**.  
Core systems (energy, wear, and tick cycle) are implemented and running.  
UI layout and live updates are functional, but modules, economy, and event logic are still in design.

---

## 🧰 Current Prototype Features

- Real-time tick cycle with live updates
- Dynamic **energy**, **output**, and **wear** meters
- Interactive **action buttons**:
  - **Buy Energy** (costs tokens, refills energy)
  - **Repair Wear** (costs tokens, reduces wear)
- Automatic enable/disable logic based on current state
- Visual icons via Material Symbols for consistent UI

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

- Produces tokens (`+🪙`)
- Consumes energy (`−⚡`)
- Increases wear (`+💥`)

The player can take actions (buy energy, repair, activate or upgrade modules) at any time —\
but time and deterioration never stop.\
When energy reaches **0** or damage hits **100%**, the machine fails.

---

## ⚙️ System Overview

All key systems are connected through one feedback triangle:

```
Tokens ↑ → Energy ↓ → Wear ↑
     ↖---------------↙
```

- **Tokens** funds upgrades and repairs, but upgrades increase consumption.
- **Energy** keeps the system alive but drains constantly.
- **Wear** rises each tick — faster when the machine runs hot.
- **Tick speed** accelerates over time, intensifying the cycle.

Balancing these three axes is the heart of survival: every optimization pushes another part closer to collapse.

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

**Wear** increases each tick, scaling dynamically with time survived.  
As the machine ages, each cycle adds slightly more damage than the last — creating inevitable decay.

Each installed module contributes to wear in unique proportions.  
**Cooling** and **Durability** modules mitigate this buildup and can delay system collapse.

**Repairs** reduce accumulated damage but cost money — they buy time, not safety.  
Repairs become more frequent and expensive the longer the machine runs.

**Overflow penalty:** if token storage reaches capacity, the system overheats,  
immediately adding a bonus wear of **+5 %** that tick.  
This encourages spending or upgrading before hitting maximum output.

---

## ⚡ Events & Market Dynamics

Occasional events and market shifts add unpredictability to the system:

- **Energy price drift:** trends upward over time, with small fluctuations per tick.
- **Instability events:** temporary modifiers to tick speed, wear, or consumption.
- **Emergency actions:** one-time relief options (e.g., temporary battery injection).

Events are rare but impactful — designed to disrupt routines and force adaptive play.

---

## 🧮 Balancing (initial draft values)

- Base production: **+2 🪙/tick** (reduced slightly as wear increases)
- Base consumption: **−1 ⚡/tick**
- Base wear rate: **+2 %/tick**, increases gradually with time survived  
  `wearDelta = 0.02 + (tickCount / 10000)`
- Overflow penalty: **+5 % wear** when output storage is full  
- Energy capacity: **10 ⚡**
- Starting wear: **0 %**
- Energy price: **3 🪙 for +5 ⚡**
- Repair cost: **5 🪙 for −10 % wear**
- Tick duration: **6 s**


---

## 🎨 Interface & Experience

- Minimal, abstract interface resembling a machine control panel.
- Each element of the machine — from stats to modules — appears as a **Bento card** within a unified
  grid.
- The entire layout acts as a single, dynamic dashboard where every tile represents part of the
  machine’s system.
- Tiles can vary in size and purpose, depending on the information or interaction they represent.
- As the machine evolves, new tiles activate and fill the grid, making progress visually tangible.
- Visual and audio feedback communicate system stress (tick pulse, alerts, color shifts).
- Designed for clarity under pressure, adaptable to both mobile and desktop.
- Style: sleek, high-tech, industrial — no decorative illustrations.


---

## 🎮 Controls

- **Buy Energy** → increases ⚡ energy by amount shown on the button.  
- **Repair Wear** → reduces wear by the shown percentage.  
- Buttons disable automatically when insufficient tokens or caps reached.

---

## 📌 Roadmap

- [x] UI prototype (modular tiles, HUD, live feedback)
- [x] Core state engine (energy, wear, tick)
- [x] Interactive action system (buttons, costs, enable/disable logic)
- [ ] Token system (income, purchases)
- [ ] Bay system (activation, upgrades, interactions)
- [ ] Event & market system
- [ ] Visual feedback: alerts, color shifts, animations
- [ ] Balancing iterations & playtest loops


---

## 📖 License

TBD – project is in an early stage.
