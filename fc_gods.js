function swapIn(godId, targetSlot) {
    //mostly code copied from minigamePantheon.js, tweaked to avoid references to "dragging"
    if (!T.swaps) return;
    T.useSwap(1);
    T.lastSwapT = 0;
    var div = l("templeGod" + godId);
    var prev = T.slot[targetSlot]; //id of God currently in slot
    if (prev != -1) {
        //when something's in there already
        prev = T.godsById[prev]; //prev becomes god object
        var prevDiv = l("templeGod" + prev.id);
        if (T.godsById[godId].slot != -1)
            l("templeSlot" + T.godsById[godId].slot).appendChild(prevDiv);
        else {
            var other = l("templeGodPlaceholder" + prev.id);
            other.parentNode.insertBefore(prevDiv, other);
        }
    }
    l("templeSlot" + targetSlot).appendChild(l("templeGod" + godId));
    T.slotGod(T.godsById[godId], targetSlot);

    PlaySound("snd/tick.mp3");
    PlaySound("snd/spirit.mp3");

    var rect = l("templeGod" + godId).getBoundingClientRect();
    Game.SparkleAt(
        (rect.left + rect.right) / 2,
        (rect.top + rect.bottom) / 2 - 24
    );
}

function autoWorship0Action() {
    if (
        !T ||
        T.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        !FrozenCookies.autoWorship0 ||
        FrozenCookies.autoCyclius ||
        T.slot[0] == FrozenCookies.autoWorship0
    ) {
        return;
    }

    if (T.swaps > 0) swapIn(FrozenCookies.autoWorship0, 0);
}

function autoWorship1Action() {
    if (
        !T ||
        T.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        !FrozenCookies.autoWorship1 ||
        FrozenCookies.autoCyclius ||
        T.slot[1] == FrozenCookies.autoWorship1
    ) {
        return;
    }

    if (T.slot[0] == FrozenCookies.autoWorship1) {
        FrozenCookies.autoworship1 = 0;
        logEvent(
            "autoWorship",
            "Can't worship the same god in Diamond and Ruby slots!"
        );
        return;
    }

    if (T.swaps > 0) swapIn(FrozenCookies.autoWorship1, 1);
}

function autoWorship2Action() {
    if (
        !T ||
        T.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        !FrozenCookies.autoWorship2 ||
        FrozenCookies.autoCyclius ||
        T.slot[2] == FrozenCookies.autoWorship2
    ) {
        return;
    }

    if (T.slot[0] == FrozenCookies.autoWorship2) {
        FrozenCookies.autoworship2 = 0;
        logEvent(
            "autoWorship",
            "Can't worship the same god in Diamond and Jade slots!"
        );
        return;
    }
    if (T.slot[1] == FrozenCookies.autoWorship2) {
        FrozenCookies.autoworship2 = 0;
        logEvent(
            "autoWorship",
            "Can't worship the same god in Ruby and Jade slots!"
        );
        return;
    }

    if (T.swaps > 0) swapIn(FrozenCookies.autoWorship2, 2);
}

function autoCycliusAction() {
    if (!T || T.swaps < 1 || !FrozenCookies.autoCyclius) return;

    // Disable auto-Pantheon if enabled
    if (FrozenCookies.autoWorshipToggle === 1) {
        FrozenCookies.autoWorshipToggle = 0;
        logEvent("autoCyclius", "Turning off Auto-Pantheon");
    }

    // Switch to special two-slots mode if Supreme Intellect is detected
    // Third slot is not used by Cyclius in this mode
    // autoCyclius == 1 is two-slots mode
    // autoCyclius == 2 is three-slots mode
    if (FrozenCookies.autoCyclius === 2 && Game.hasAura("Supreme Intellect")) {
        FrozenCookies.autoCyclius = 1;
        logEvent(
            "autoCyclius",
            "Supreme Intellect detected! Swapping Cyclius to two slot mode"
        );
    }

    // Time constants (in minutes)
    // See https://cookieclicker.fandom.com/wiki/Pantheon#Cyclius,_Spirit_of_Ages
    // SI ignores Diamond slot since it doesn't matter
    const times = {
        Ruby1: 1 * 60 + 12, //1:12 UTC: Ruby
        Jade1: 4 * 60, // 4:00 UTC: Jade
        SIJade: 6 * 60, // 6:00 UTC: SI Ruby-as-Diamond
        SIRuby: 7 * 60 + 30, // 7:30 UTC: SI Jade-as-Ruby
        Diamond2: 9 * 60 + 19, // 9:19 UTC: Diamond
        Jade2: 10 * 60 + 20, // 10:20 UTC: Jade
        Diamond3: 12 * 60, // 12:00 UTC: Diamond
        Ruby2: 13 * 60 + 12, // 13:12 UTC: Ruby
        Diamond4: 18 * 60, // 18:00 UTC: Diamond
        CycNone1: 19 * 60 + 30, // 19:30 UTC: No Cyclius
        Diamond5: 21 * 60, // 21:00 UTC: Diamond
        CycNone2: 22 * 60 + 30, // 22:30 UTC: No Cyclius
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

    // Main logic for two slots mode - never uses Diamond slot
    if (FrozenCookies.autoCyclius === 1 && !Game.hasAura("Supreme Intellect")) {
        if (T.slot[1] !== 3 && currentTime < times.Jade1) {
            // 1:12 UTC to 4:00 UTC, RUBY
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            T.slot[2] !== 3 &&
            currentTime >= times.Jade1 &&
            currentTime < times.Diamond3
        ) {
            // 4:00 UTC to 12:00 UTC, JADE
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            // 12:00 UTC to 19:30 UTC, RUBY
            T.slot[1] !== 3 &&
            currentTime >= times.Diamond3 &&
            currentTime < times.Diamond4
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (currentTime >= times.Diamond4) {
            // 19:30 UTC to 1:12 UTC, no Cyclius
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
            removeCyclius();
        }
    }

    // Main logic for three slots mode)
    if (FrozenCookies.autoCyclius === 2 && !Game.hasAura("Supreme Intellect")) {
        if (T.slot[0] !== 3 && currentTime < times.Ruby1) {
            // 1:12 UTC to 4:00 UTC, DIAMOND
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 4:00 UTC to 9:19 UTC, RUBY
            T.slot[1] !== 3 &&
            currentTime >= times.Ruby1 &&
            currentTime < times.Jade1
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 9:19 UTC to 10:20 UTC, JADE
            T.slot[2] !== 3 &&
            currentTime >= times.Jade1 &&
            currentTime < times.Diamond2
        ) {
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            // 10:20 UTC to 12:00 UTC, DIAMOND
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond2 &&
            currentTime < times.Jade2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 12:00 UTC to 13:12 UTC, RUBY
            T.slot[2] !== 3 &&
            currentTime >= times.Jade2 &&
            currentTime < times.Diamond3
        ) {
            swapIn(3, 2);
            logEvent("autoCyclius", "Putting Cyclius in JADE");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
        } else if (
            //  13:12 UTC to 18:00 UTC, DIAMOND
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond3 &&
            currentTime < times.Ruby2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 13:12 UTC to 18:00 UTC, RUBY
            T.slot[1] !== 3 &&
            currentTime >= times.Ruby2 &&
            currentTime < times.Diamond4
        ) {
            swapIn(3, 1);
            logEvent("autoCyclius", "Putting Cyclius in RUBY");
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 18:00 UTC to 19:30 UTC, DIAMOND
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond4 &&
            currentTime < times.CycNone1
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (
            // 19:30 UTC to 21:00 UTC, no Cyclius
            currentTime >= times.CycNone1 &&
            currentTime < times.Diamond5
        ) {
            swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
            removeCyclius();
        } else if (
            // 21:00 UTC to 22:30 UTC, DIAMOND
            T.slot[0] !== 3 &&
            currentTime >= times.Diamond5 &&
            currentTime < times.CycNone2
        ) {
            swapIn(3, 0);
            logEvent("autoCyclius", "Putting Cyclius in DIAMOND");
            swapIfNeeded(FrozenCookies.autoWorship0, 1, "RUBY");
            swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
        } else if (currentTime >= times.CycNone2) {
            // // 22:30 UTC to 1:12 UTC, no Cyclius
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
                // 1:12 UTC to 4:00 UTC, RUBY
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                // 4:00 UTC to 6:00 UTC, JADE
                T.slot[2] !== 3 &&
                currentTime >= times.Ruby1 &&
                currentTime < times.SIJade
            ) {
                swapIn(3, 2);
                logEvent("autoCyclius", "Putting Cyclius in JADE (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            } else if (
                // 6:00 UTC to 7:30 UTC, RUBY
                T.slot[1] !== 3 &&
                currentTime >= times.SIJade &&
                currentTime < times.SIRuby
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                // 7:30 UTC to 12:00 UTC, no Cyclius
                currentTime >= times.SI730 &&
                currentTime < times.Diamond2
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND (SI)");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                // 12:00 UTC to 13:12 UTC, RUBY
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond2 &&
                currentTime < times.Jade2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                // 13:12 UTC to 18:00 UTC, no Cyclius
                currentTime >= times.Jade2 &&
                currentTime < times.Diamond3
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                // 18:00 UTC to 19:30 UTC, RUBY
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond3 &&
                currentTime < times.Ruby2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                // 13:12 UTC to 18:00 UTC, JADE
                T.slot[2] !== 3 &&
                currentTime >= times.Ruby2 &&
                currentTime < times.Diamond4
            ) {
                swapIn(3, 2);
                logEvent("autoCyclius", "Putting Cyclius in JADE (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
            } else if (
                // 18:00 UTC to 19:30 UTC, RUBY
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond4 &&
                currentTime < times.CycNone1
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (
                // 19:30 UTC to 21:00 UTC, no Cyclius
                currentTime >= times.CycNone1 &&
                currentTime < times.Diamond5
            ) {
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            } else if (
                // 21:00 UTC to 22:30 UTC, RUBY
                T.slot[1] !== 3 &&
                currentTime >= times.Diamond5 &&
                currentTime < times.CycNone2
            ) {
                swapIn(3, 1);
                logEvent("autoCyclius", "Putting Cyclius in RUBY (SI)");
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 2, "JADE");
            } else if (currentTime >= times.CycNone2) {
                // // 22:30 UTC to 1:12 UTC, no Cyclius
                swapIfNeeded(FrozenCookies.autoWorship0, 0, "DIAMOND");
                swapIfNeeded(FrozenCookies.autoWorship1, 1, "RUBY");
                swapIfNeeded(FrozenCookies.autoWorship2, 2, "JADE");
                removeCyclius();
            }
        }
    }
}

function lumpIn(mins) {
    //For debugging, set minutes until next lump is *ripe*
    Game.lumpT = Date.now() - Game.lumpRipeAge + 60000 * mins;
}

function rigiSell() {
    //Sell enough of the cheapest building to enable Rigidels effect
    if (Game.BuildingsOwned % 10) {
        var cheapest;
        Game.ObjectsById.forEach(function (b) {
            if (!cheapest || b.price < cheapest.price) {
                cheapest = b;
            }
        });
        cheapest.sell(Game.BuildingsOwned % 10);
    }
    return;
}

function autoRigidel() {
    if (!T) return; // Exit if Pantheon doesn't exist

    const started = Game.lumpT;
    const timeToRipe =
        (Math.ceil(Game.lumpRipeAge) - (Date.now() - started)) / 60000; // Minutes until sugar lump ripens
    const orderLvl = Game.hasGod("order") ? Game.hasGod("order") : 0;
    let prevGod = -1;
    let tryHarvest = false;

    // Only proceed if we have swaps available
    if (T.swaps < 1) return;

    // Determine if Rigidel is in a slot and act accordingly
    if (orderLvl === 0) {
        // Rigidel isn't in a slot
        if (T.swaps < (T.slot[0] === -1 ? 1 : 2)) return; // Not enough swaps to proceed
        if (timeToRipe < 60) {
            prevGod = T.slot[0]; // Cache current god in diamond slot
            swapIn(10, 0); // Swap in Rigidel to diamond slot
            tryHarvest = true;
        }
    } else if (orderLvl === 1) {
        // Rigidel is in diamond slot
        if (timeToRipe < 55) tryHarvest = true;
    } else if (orderLvl === 2) {
        // Rigidel is in ruby slot
        if (timeToRipe < 35) tryHarvest = true;
    } else if (orderLvl === 3) {
        // Rigidel is in jade slot
        if (timeToRipe < 15) tryHarvest = true;
    }

    if (tryHarvest) {
        rigiSell();
        Game.computeLumpTimes();
        // Use a variable for ripe check for clarity
        const lumpIsRipe = Date.now() - started >= Math.ceil(Game.lumpRipeAge);
        if (lumpIsRipe) {
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

    // Restore previous god if we swapped Rigidel in
    if (prevGod !== -1) swapIn(prevGod, 0);
}

function autoDragonsCurve() {
    //Swap dragon auras to try for unusual lumps
    if (Game.dragonLevel < 21 || FrozenCookies.dragonsCurve < 1) return;

    if (FrozenCookies.autoDragonToggle == 1) {
        autoDragonsCurve.autodragonyes = 1;
        FrozenCookies.autoDragonToggle = 0;
    } else {
        autoDragonsCurve.autodragonyes = 0;
    }

    if (
        Game.dragonLevel > 26 &&
        Game.dragonAura == 18 && //RB
        !Game.dragonAura2 == 17 // DC
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
    return;
}

function autoDragonAction() {
    if (
        !Game.HasUnlocked("A crumbly egg") ||
        Game.dragonLevel > 26 ||
        hasClickBuff()
    ) {
        return;
    }

    if (Game.HasUnlocked("A crumbly egg") && !Game.Has("A crumbly egg")) {
        Game.Upgrades["A crumbly egg"].buy();
        logEvent("autoDragon", "Bought an egg");
    }

    if (
        Game.dragonLevel < Game.dragonLevels.length - 1 &&
        Game.dragonLevels[Game.dragonLevel].cost()
    ) {
        Game.specialTab = "dragon";
        Game.UpgradeDragon();
        if (Game.dragonLevel + 1 >= Game.dragonLevels.length)
            Game.ToggleSpecialMenu();
        logEvent(
            "autoDragon",
            "Upgraded the dragon to level " + Game.dragonLevel
        );
    }
}

function petDragonAction() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 4 ||
        !Game.Has("Pet the dragon") ||
        hasClickBuff()
    ) {
        return;
    }

    //Calculate current pet drop and if we have it
    Math.seedrandom(Game.seed + "/dragonTime");
    let drops = [
        "Dragon scale",
        "Dragon claw",
        "Dragon fang",
        "Dragon teddy bear",
    ];
    drops = shuffle(drops);
    Math.seedrandom();
    let currentDrop =
        drops[Math.floor((new Date().getMinutes() / 60) * drops.length)];

    //Pet the dragon
    if (!Game.Has(currentDrop) && !Game.HasUnlocked(currentDrop)) {
        Game.specialTab = "dragon";
        Game.ToggleSpecialMenu(1);
        Game.ClickSpecialPic();
        Game.ToggleSpecialMenu(0);
        //logEvent("autoDragon", "Who's a good dragon? You are!");
    }
}

function autoDragonAura0Action() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 5 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonToggle ||
        Game.dragonAura == FrozenCookies.autoDragonAura0 ||
        Game.dragonAura2 == FrozenCookies.autoDragonAura0
    ) {
        return;
    }

    if (FrozenCookies.autoDragonAura0 == FrozenCookies.autoDragonAura1) {
        FrozenCookies.autoDragonAura1 = 0;
        logEvent("autoDragon", "Can't set both auras to the same one!");
        return;
    }

    if (
        Game.dragonLevel > 26 &&
        Game.dragonAura == FrozenCookies.autoDragonAura1 &&
        Game.dragonAura2 != FrozenCookies.autoDragonAura0
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 1);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set first dragon aura");
        return;
    } else if (Game.dragonLevel >= FrozenCookies.autoDragonAura0 + 4) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 0);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set first dragon aura");
        return;
    }
}

function autoDragonAura1Action() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 27 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonAura1 ||
        !FrozenCookies.autoDragonToggle ||
        Game.dragonAura == FrozenCookies.autoDragonAura1 ||
        Game.dragonAura2 == FrozenCookies.autoDragonAura1
    ) {
        return;
    }

    if (
        Game.dragonAura2 == FrozenCookies.autoDragonAura0 &&
        Game.dragonAura != FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 0);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set second dragon aura");
        return;
    } else if (
        Game.dragonAura == FrozenCookies.autoDragonAura0 &&
        Game.dragonAura2 != FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 1);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set second dragon aura");
        return;
    }
}

function autoDragonOrbsAction() {
    if (!T) return;
    if (
        FrozenCookies.autoDragonOrbs == 1 &&
        (!Game.hasAura("Dragon Orbs") ||
            Game.hasGod("ruin") ||
            Game.Objects["You"].amount < 1)
    ) {
        FrozenCookies.autoDragonOrbs = 0;
        logEvent("autoDragonOrbs", "Not currently possible to use Dragon Orbs");
    }

    var buffsN = 0;
    for (var ii in Game.buffs) {
        buffsN++;
    }
    if (!goldenCookieLife() && Game.hasAura("Dragon Orbs") && !buffsN) {
        Game.Objects["You"].sell(1);
        logEvent(
            "autoDragonOrbs",
            "Sold 1 You for " +
                (Beautify(
                    Game.Objects["You"].price *
                        Game.Objects["You"].getSellMultiplier()
                ) +
                    " cookies and a wish")
        );
    }
}
