// Various minigames-related functions moved from the main script to keep it clean
// and organized. This file is loaded after the main script, so it can access all variables and functions.
// Spells (Grimoire) are in fc_spells.js.

// GODS

/**
 * @returns {number} - The number of buildings owned.
 * Used in autoRigidel() to check if Rigidel's effect is active.
 */
function rigiSell() {
    const remainder = Game.BuildingsOwned % 10;
    if (remainder === 0) return;

    // Find the cheapest building with enough amount to sell
    let cheapest = null;
    for (const b of Game.ObjectsById) {
        if (b.amount > 0 && (!cheapest || b.getPrice() < cheapest.getPrice())) {
            cheapest = b;
        }
    }

    if (!cheapest) return;
    const sellAmount = Math.min(remainder, cheapest.amount);
    if (sellAmount > 0) cheapest.sell(sellAmount);
}

/**
 * Sets the sugar lump timer so the next lump will be ripe in the specified number of minutes.
 * @param {number} mins - Minutes until the next lump is ripe. Must be >= 0.
 * Used in autoRigidel() to set the timer for the next sugar lump.
 */
function lumpIn(mins) {
    mins = Math.max(0, Number(mins) || 0);
    Game.lumpT = Date.now() - Game.lumpRipeAge + mins * 60000;
}

/**
 * Swaps a god into a Pantheon slot.
 * Used in autoRigidel() to swap in Rigidel.
 * @param {number} godId - The ID of the god to swap in.
 * @param {number} targetSlot - The Pantheon slot index (0=diamond, 1=ruby, 2=jade).
 */
function swapIn(godId, targetSlot) {
    if (!T.swaps) return;
    T.useSwap(1);
    T.lastSwapT = 0;
    const div = l("templeGod" + godId);
    let prev = T.slot[targetSlot];
    if (prev != -1) {
        prev = T.godsById[prev];
        const prevDiv = l("templeGod" + prev.id);
        if (T.godsById[godId].slot != -1) {
            l("templeSlot" + T.godsById[godId].slot).appendChild(prevDiv);
        } else {
            const other = l("templeGodPlaceholder" + prev.id);
            other.parentNode.insertBefore(prevDiv, other);
        }
    }
    l("templeSlot" + targetSlot).appendChild(div);
    T.slotGod(T.godsById[godId], targetSlot);

    PlaySound("snd/tick.mp3");
    PlaySound("snd/spirit.mp3");

    const rect = div.getBoundingClientRect();
    Game.SparkleAt(
        (rect.left + rect.right) / 2,
        (rect.top + rect.bottom) / 2 - 24
    );
}

/**
 * Handles automatic Rigidel swaps and sugar lump harvesting for optimal Rigidel effect.
 */
function autoRigidel() {
    if (!T) return;
    const started = Game.lumpT;
    const timeToRipe =
        (Math.ceil(Game.lumpRipeAge) - (Date.now() - started)) / 60000;
    const orderLvl = Game.hasGod("order") || 0;
    let prevGod = -1;
    let tryHarvest = false;

    switch (orderLvl) {
        case 0:
            if (T.swaps < (T.slot[0] == -1 ? 1 : 2)) break;
            if (timeToRipe < 60) {
                prevGod = T.slot[0];
                swapIn(10, 0);
                tryHarvest = true;
            }
        // fallthrough
        case 1:
            if (timeToRipe < 55 && Game.BuildingsOwned % 10) tryHarvest = true;
        // fallthrough
        case 2:
            if (timeToRipe < 35 && Game.BuildingsOwned % 10) tryHarvest = true;
        // fallthrough
        case 3:
            if (timeToRipe < 15 && Game.BuildingsOwned % 10) tryHarvest = true;
    }

    if (tryHarvest) {
        rigiSell();
        Game.computeLumpTimes();
        if (Date.now() - started >= Math.ceil(Game.lumpRipeAge)) {
            if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                autoDragonsCurve();
            } else {
                Game.clickLump();
            }
            logEvent("autoRigidel", "Sugar lump harvested early");
        } else {
            logEvent(
                "autoRigidel",
                "Suppressed early harvest of unripe sugar lump"
            );
        }
    }
    if (prevGod != -1) swapIn(prevGod, 0);
}

/**
 * Swaps dragon auras to manipulate sugar lump type, then harvests the lump.
 * Used in autoRigidel() when the dragon level is 21 or higher.
 */
function autoDragonsCurve() {
    if (Game.dragonLevel < 21 || FrozenCookies.dragonsCurve < 1) return;

    if (FrozenCookies.autoDragonToggle == 1) {
        autoDragonsCurve.autodragonyes = 1;
        FrozenCookies.autoDragonToggle = 0;
    } else {
        autoDragonsCurve.autodragonyes = 0;
    }

    // Set Dragon's Curve as an aura if not already set
    if (
        Game.dragonLevel > 26 &&
        Game.dragonAura == 18 &&
        Game.dragonAura2 != 17
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(17, 1);
        Game.ConfirmPrompt();
        logEvent(
            "autoDragonsCurve",
            "Dragon auras swapped to manipulate new Sugar Lump"
        );
    } else if (!Game.hasAura("Dragon's Curve")) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(17, 0);
        Game.ConfirmPrompt();
        logEvent(
            "autoDragonsCurve",
            "Dragon auras swapped to manipulate new Sugar Lump"
        );
    }

    // Optionally set Reality Bending as secondary aura
    if (
        FrozenCookies.dragonsCurve == 2 &&
        Game.dragonLevel > 26 &&
        !Game.hasAura("Reality Bending")
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(18, 1);
        Game.ConfirmPrompt();
    }

    Game.clickLump();

    if (autoDragonsCurve.autodragonyes == 1) {
        FrozenCookies.autoDragonToggle = 1;
        autoDragonsCurve.autodragonyes = 0;
    }
}

function autoWorshipAction(slot) {
    if (
        !T ||
        T.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        ![0, 1, 2].includes(slot) ||
        FrozenCookies.autoCyclius
    ) {
        return;
    }

    const godId = FrozenCookies[`autoWorship${slot}`];
    if (!godId || T.slot[slot] === godId) return;

    // Prevent duplicate gods in other slots
    for (let i = 0; i < 3; i++) {
        if (i !== slot && T.slot[i] === godId) {
            logEvent(
                "autoWorship",
                "Can't worship the same god in multiple slots!"
            );
            return;
        }
    }

    swapIn(godId, slot);
}

function autoCycliusAction() {
    if (!T || T.swaps < 1 || !FrozenCookies.autoCyclius) return;

    // Only run once per minute to reduce CPU usage
    if (
        typeof autoCycliusAction._lastMinute !== "undefined" &&
        autoCycliusAction._lastMinute === new Date().getUTCMinutes()
    ) {
        return;
    }
    autoCycliusAction._lastMinute = new Date().getUTCMinutes();

    // Disable auto-Pantheon if enabled
    if (FrozenCookies.autoWorshipToggle === 1) {
        FrozenCookies.autoWorshipToggle = 0;
        logEvent("autoCyclius", "Turning off Auto-Pantheon");
    }

    // Switch to two-slot mode if Supreme Intellect is detected
    if (FrozenCookies.autoCyclius === 2 && Game.hasAura("Supreme Intellect")) {
        FrozenCookies.autoCyclius = 1;
        logEvent(
            "autoCyclius",
            "Supreme Intellect detected! Swapping Cyclius to two slot mode"
        );
    }

    // Time constants (in minutes)
    const times = {
        Ruby1: 1 * 60 + 12,
        Jade1: 4 * 60,
        Diamond2: 9 * 60 + 19,
        Jade2: 10 * 60 + 20,
        Diamond3: 12 * 60,
        Ruby2: 13 * 60 + 12,
        Diamond4: 18 * 60,
        CycNone1: 19 * 60 + 30,
        Diamond5: 21 * 60,
        CycNone2: 22 * 60 + 30,
        SI6: 6 * 60,
        SI730: 7 * 60 + 30,
    };

    // Get current UTC time in minutes
    const now = new Date();
    const currentTime = now.getUTCHours() * 60 + now.getUTCMinutes();

    // Helper to swap gods if needed
    function swapIfNeeded(godId, slot, label) {
        if (
            godId !== 11 &&
            godId !== 3 &&
            T.slot[slot] !== godId &&
            T.swaps > 0
        ) {
            swapIn(godId, slot);
            logEvent("autoCyclius", `set desired god to ${label}`);
        }
    }

    // Helper to remove Cyclius if present
    function removeCyclius() {
        if (Game.hasGod("ages")) {
            Game.forceUnslotGod("ages");
            logEvent("autoCyclius", "Removing Cyclius");
        }
    }

    // Main logic for autoCyclius == 1 (default mode)
    if (FrozenCookies.autoCyclius === 1 && !Game.hasAura("Supreme Intellect")) {
        if (T.slot[1] !== 3 && currentTime < times.Jade1) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[2] !== 3 &&
            currentTime >= times.Jade1 &&
            currentTime < times.Diamond3
        ) {
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            T.slot[1] !== 3 &&
            currentTime >= times.Diamond3 &&
            currentTime < times.Diamond4
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (currentTime >= times.Diamond4) {
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
            removeCyclius();
        }
    }

    // Main logic for autoCyclius == 2 (three-slot mode)
    if (FrozenCookies.autoCyclius === 2 && !Game.hasAura("Supreme Intellect")) {
        if (T.slot[0] !== 3 && currentTime < times.Ruby1) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[1] !== 3 &&
            currentTime >= times.Ruby1 &&
            currentTime < times.Jade1
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[2] !== 3 &&
            currentTime >= times.Jade1 &&
            currentTime < times.Diamond2
        ) {
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond2 &&
            currentTime < times.Jade2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[2] !== 3 &&
            currentTime >= times.Jade2 &&
            currentTime < times.Diamond3
        ) {
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond3 &&
            currentTime < times.Ruby2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[1] !== 3 &&
            currentTime >= times.Ruby2 &&
            currentTime < times.Diamond4
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond4 &&
            currentTime < times.CycNone1
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            currentTime >= times.CycNone1 &&
            currentTime < times.Diamond5
        ) {
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
            removeCyclius();
        } else if (
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond5 &&
            currentTime < times.CycNone2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (currentTime >= times.CycNone2) {
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
            removeCyclius();
        }
    }

    // Supreme Intellect: Ruby acts as Diamond, Jade as Ruby
    if (Game.hasAura("Supreme Intellect")) {
        if (FrozenCookies.autoCyclius === 1) {
            if (T.slot[1] !== 3 && currentTime < times.Ruby1) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                T.slot[2] !== 3 &&
                currentTime >= times.Ruby1 &&
                currentTime < times.SI6
            ) {
                swapIn(3, 2);
                logEvent("autoCyclius", "Putting Cyclius in JADE");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            } else if (
                T.slot[1] !== 3 &&
                currentTime >= times.SI6 &&
                currentTime < times.SI730
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                currentTime >= times.SI730 &&
                currentTime < times.Diamond2
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond2 &&
                currentTime < times.Jade2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                currentTime >= times.Jade2 &&
                currentTime < times.Diamond3
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond3 &&
                currentTime < times.Ruby2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                T.slot[2] !== 3 &&
                currentTime >= times.Ruby2 &&
                currentTime < times.Diamond4
            ) {
                swapIn(3, 2);
                logEvent("autoCyclius", "Putting Cyclius in JADE");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            } else if (
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond4 &&
                currentTime < times.CycNone1
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                currentTime >= times.CycNone1 &&
                currentTime < times.Diamond5
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond5 &&
                currentTime < times.CycNone2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (currentTime >= times.CycNone2) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            }
        }
    }
}

function autoGodzamokAction() {
    if (!T) return;

    // Only proceed if Godzamok is slotted and autoGodzamok is enabled
    if (Game.hasGod("ruin") && FrozenCookies.autoGodzamok) {
        const mine = Game.Objects["Mine"];
        const factory = Game.Objects["Factory"];
        const countMine = mine.amount;
        const countFactory = factory.amount;

        // Only trigger if Devastation and Cursed finger are not active, but a click buff is
        if (
            !Game.hasBuff("Devastation") &&
            !Game.hasBuff("Cursed finger") &&
            hasClickBuff()
        ) {
            // Sell all mines and factories
            mine.sell(countMine);
            factory.sell(countFactory);

            // Helper to buy and log
            function buyAndLog(obj, target, label) {
                if (target > 0) {
                    safeBuy(obj, target);
                    FrozenCookies.autobuyCount += 1;
                    logEvent("AutoGodzamok", `Bought ${target} ${label}`);
                }
            }

            // Rebuy mines
            if (FrozenCookies.mineLimit) {
                buyAndLog(mine, FrozenCookies.mineMax, "mines");
            } else {
                buyAndLog(mine, countMine, "mines");
            }

            // Rebuy factories
            if (FrozenCookies.factoryLimit) {
                buyAndLog(factory, FrozenCookies.factoryMax, "factories");
            } else {
                buyAndLog(factory, countFactory, "factories");
            }
        }
    }
}

// BANK

function autoBankAction() {
    if (!B || hasClickBuff()) return;

    // Upgrade bank level if possible
    const currentOffice = B.offices[B.officeLevel];
    if (
        currentOffice.cost &&
        Game.Objects["Cursor"].amount >= currentOffice.cost[0] &&
        Game.Objects["Cursor"].level >= currentOffice.cost[1]
    ) {
        const cursorsNeeded = currentOffice.cost[0];
        // Click the upgrade button if available
        const upgradeBtn = l("bankOfficeUpgrade");
        if (upgradeBtn) upgradeBtn.click();
        // Ensure we have enough cursors (should always be true here)
        safeBuy(Game.Objects["Cursor"], cursorsNeeded);
        FrozenCookies.autobuyCount += 1;
        logEvent(
            "AutoBank",
            `Upgraded bank level for ${cursorsNeeded} cursors`
        );
        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
    }
}

function autoBrokerAction() {
    if (!B) return; // Exit if Stock Market is not available

    // Only hire brokers when saving for a building (not an upgrade)
    const delay = delayAmount();
    const recommendation = nextPurchase();

    // Only hire if not at max, have enough cookies, and not saving for an upgrade
    if (
        recommendation.type === "building" &&
        B.brokers < B.getMaxBrokers() &&
        Game.cookies >= delay + B.getBrokerPrice()
    ) {
        const brokerBtn = l("bankBrokersBuy");
        if (brokerBtn) {
            brokerBtn.click();
            logEvent(
                "AutoBroker",
                `Hired a broker for ${Beautify(B.getBrokerPrice())} cookies`
            );
            Game.recalculateGains = 1;
            Game.upgradesToRebuild = 1;
        }
    }
}

function autoLoanBuy() {
    // Ensure Stock Market minigame is available and office level is sufficient
    if (!B || B.officeLevel < 2) return;

    // Only take loans if a click buff is active (but not Cursed finger) and CPS bonus is high enough
    if (
        hasClickBuff() &&
        !Game.hasBuff("Cursed finger") &&
        cpsBonus() >= FrozenCookies.minLoanMult
    ) {
        // Take loans in order of availability and user setting
        if (B.officeLevel >= 2 && !B.loans[0].taken) {
            B.takeLoan(1);
            logEvent("AutoLoan", "Took Loan 1");
        }
        if (B.officeLevel >= 4 && !B.loans[1].taken) {
            B.takeLoan(2);
            logEvent("AutoLoan", "Took Loan 2");
        }
        if (
            B.officeLevel >= 5 &&
            FrozenCookies.autoLoan == 2 &&
            !B.loans[2].taken
        ) {
            B.takeLoan(3);
            logEvent("AutoLoan", "Took Loan 3");
        }
    }
}

// DRAGON

function autoDragonAction() {
    // Only proceed if dragon is available, not fully upgraded, and no click buff is active
    if (
        !Game.HasUnlocked("A crumbly egg") ||
        Game.dragonLevel > 26 ||
        hasClickBuff()
    ) {
        return;
    }

    // Buy the crumbly egg if unlocked and not yet owned
    if (!Game.Has("A crumbly egg")) {
        const egg = Game.Upgrades["A crumbly egg"];
        if (
            egg &&
            egg.unlocked &&
            !egg.bought &&
            Game.cookies >= egg.getPrice()
        ) {
            egg.buy();
            logEvent("autoDragon", "Bought an egg");
        }
        return; // Wait for next tick to upgrade dragon after buying egg
    }

    // Upgrade dragon if possible and not at max level
    if (
        Game.dragonLevel < Game.dragonLevels.length - 1 &&
        typeof Game.dragonLevels[Game.dragonLevel].cost === "function" &&
        Game.dragonLevels[Game.dragonLevel].cost() &&
        Game.cookies >= Game.dragonLevels[Game.dragonLevel].cost()
    ) {
        Game.specialTab = "dragon";
        Game.UpgradeDragon();
        if (Game.dragonLevel + 1 >= Game.dragonLevels.length) {
            Game.ToggleSpecialMenu();
        }
        logEvent(
            "autoDragon",
            "Upgraded the dragon to level " + Game.dragonLevel
        );
    }
}
function petDragonAction() {
    // Only proceed if dragon is available, at least level 4, "Pet the dragon" is unlocked, and no click buff is active
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 4 ||
        !Game.Has("Pet the dragon") ||
        hasClickBuff()
    ) {
        return;
    }

    // Determine which pet drop is available this hour
    Math.seedrandom(Game.seed + "/dragonTime");
    const drops = shuffle([
        "Dragon scale",
        "Dragon claw",
        "Dragon fang",
        "Dragon teddy bear",
    ]);
    Math.seedrandom();
    const now = new Date();
    const dropIndex = Math.floor((now.getMinutes() / 60) * drops.length);
    const currentDrop = drops[dropIndex];

    // Pet the dragon if the drop is not yet owned or unlocked
    if (!Game.Has(currentDrop) && !Game.HasUnlocked(currentDrop)) {
        Game.specialTab = "dragon";
        Game.ToggleSpecialMenu(1);
        Game.ClickSpecialPic();
        Game.ToggleSpecialMenu(0);
        // logEvent("autoDragon", `Petted the dragon for drop: ${currentDrop}`);
    }
}
function autoDragonAura0Action() {
    // Preconditions: must have egg, be high enough level, and toggles enabled
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 5 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonToggle
    ) {
        return;
    }

    // Prevent setting both auras to the same value
    if (
        FrozenCookies.autoDragonAura0 === FrozenCookies.autoDragonAura1 &&
        FrozenCookies.autoDragonAura1 !== 0
    ) {
        FrozenCookies.autoDragonAura1 = 0;
        logEvent("autoDragon", "Can't set both auras to the same one!");
        return;
    }

    // Already set, nothing to do
    if (
        Game.dragonAura === FrozenCookies.autoDragonAura0 ||
        Game.dragonAura2 === FrozenCookies.autoDragonAura0
    ) {
        return;
    }

    // If second aura is set, set first aura in slot 1
    if (
        Game.dragonLevel > 26 &&
        Game.dragonAura === FrozenCookies.autoDragonAura1 &&
        Game.dragonAura2 !== FrozenCookies.autoDragonAura0
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 1);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set first dragon aura (slot 2 already set)");
        return;
    }

    // Otherwise, set first aura in slot 0 if possible
    if (Game.dragonLevel >= FrozenCookies.autoDragonAura0 + 4) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 0);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set first dragon aura");
    }
}

function autoDragonAura1Action() {
    // Preconditions: must have egg, be max level, and toggles enabled
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 27 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonAura1 ||
        !FrozenCookies.autoDragonToggle
    ) {
        return;
    }

    // Prevent setting both auras to the same value
    if (FrozenCookies.autoDragonAura0 === FrozenCookies.autoDragonAura1) {
        logEvent("autoDragon", "Can't set both auras to the same one!");
        return;
    }

    // Already set, nothing to do
    if (
        Game.dragonAura === FrozenCookies.autoDragonAura1 ||
        Game.dragonAura2 === FrozenCookies.autoDragonAura1
    ) {
        return;
    }

    // If slot 1 is set to aura0, set slot 0 to aura1
    if (
        Game.dragonAura2 === FrozenCookies.autoDragonAura0 &&
        Game.dragonAura !== FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 0);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set second dragon aura (slot 2 was aura0)");
        return;
    }

    // If slot 0 is set to aura0, set slot 1 to aura1
    if (
        Game.dragonAura === FrozenCookies.autoDragonAura0 &&
        Game.dragonAura2 !== FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 1);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set second dragon aura");
    }
}

function autoDragonOrbsAction() {
    if (!T) return;

    // Disable if not possible to use Dragon Orbs
    if (
        FrozenCookies.autoDragonOrbs === 1 &&
        (!Game.hasAura("Dragon Orbs") ||
            Game.hasGod("ruin") ||
            Game.Objects["You"].amount < 1)
    ) {
        FrozenCookies.autoDragonOrbs = 0;
        logEvent("autoDragonOrbs", "Not currently possible to use Dragon Orbs");
        return;
    }

    // Only act if Dragon Orbs aura is active, no buffs, and no golden cookie on screen
    const hasNoBuffs = Object.keys(Game.buffs).length === 0;
    if (
        Game.hasAura("Dragon Orbs") &&
        hasNoBuffs &&
        !goldenCookieLife() &&
        Game.Objects["You"].amount > 0
    ) {
        const youObj = Game.Objects["You"];
        const sellValue = Beautify(youObj.price * youObj.getSellMultiplier());
        youObj.sell(1);
        logEvent(
            "autoDragonOrbs",
            `Sold 1 You for ${sellValue} cookies and a wish`
        );
    }
}
