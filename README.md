# The Machine

**The Machine** is an experimental, turn-based engine-building survival game, developed as a Progressive Web App (PWA).  
The player manages a single abstract machine that produces money, consumes energy, and inevitably wears down.  
The goal is simple: survive as many rounds as possible before the machine collapses.

---

## ⚠️ Status

This project is **under development**.  
It is currently a design prototype and not a finished, playable game.  
The README describes the concept and planned features.

Feedback and contributions are welcome once a first prototype is running.

---

## 🎯 Core Goal

- Survive as long as possible → **score = number of rounds reached**
- Keep the machine running by:
  - Buying and managing **energy**
  - Repairing **damage**
  - Installing and upgrading **modules**

---

## ⚙️ Game Loop

Each round consists of:

1. The machine produces money (`+💰`).  
2. Energy is consumed (`−⚡`).  
3. Wear increases (`+% damage`).  
4. Energy price adjusts (long-term upward drift, short-term fluctuations).  
5. The player chooses **one action**: buy energy, repair, or build/upgrade a module.

The run ends when:
- Energy reaches **0** → the machine stops.  
- Damage reaches **100%** → the machine breaks.  

---

## 🔩 Modules

Modules are **permanent machine parts** with clear trade-offs.  
Each module type improves the machine in one area while introducing new pressure in another:

- **Generators** → increase money production, but raise energy use and wear  
- **Batteries** → increase energy capacity, but add to energy consumption  
- **Improvements** → reduce wear or stabilize the machine, but usually increase consumption  

All modules can be upgraded. Upgrades strengthen their effect but always come with a downside.

## 🔀 Randomization & Fairness

- **Random Shop** each round with 3 slots:  
  - 1 × **Income option** (e.g. generator)  
  - 1 × **Control option** (e.g. battery, improvements)  
  - 1 × **Wildcard** (special module, event, etc.)  
- Ensures variety between runs while always offering survival tools.  
- No single fixed path – every game plays out differently.

---

## 🧮 Balancing (initial draft values)

- Start money: **5**  
- Base production: **+1💰/round**  
- Base consumption: **−1⚡/round**  
- Battery capacity: **10⚡**  
- Starting damage: **0%**  
- Energy price: **1.20💰/⚡**, grows by ~**1.5% per round** (with light random fluctuation)  

---

## 🚀 Vision

- Minimalist, abstract UI (no illustrations; bars, chips, HUD only).  
- Playable on both smartphones and desktop browsers (PWA).  
- Runs should be short, tense, and different every time.  
- No “fixed winning strategy” – decisions depend on random shop offers and market swings.  

---

## 📌 Roadmap

- [ ] Basic UI (HUD, machine, shop, actions)  
- [ ] Core state engine (energy, money, wear, price)  
- [ ] Random shop logic  
- [ ] Module design & upgrades  
- [ ] Event system (e.g. emergency battery, energy crisis)  
- [ ] Balancing & test runs  

---

## 📖 License

TBD – project is in an early stage.
