// @name         Cookie Clicker Predict Spell
// @version      0.1
// @author       Random Reddit Guy (SamNosliw, 3pLm1zf1rMD_Xkeo6XHl)
// @match        http://orteil.dashnet.org/cookieclicker/
// @source       https://www.reddit.com/r/CookieClicker/comments/6v2lz3/predict_next_hands_of_faith/
(function () {
    if (Game.ObjectsById[7].minigameLoaded) {
        var lookup = setInterval(function () {
            if (typeof Game.ready !== "undefined" && Game.ready) {
                var CastSpell = document.getElementById("grimoireSpell1");
                CastSpell.onmouseover = function () {
                    Game.tooltip.dynamic = 1;
                    Game.tooltip.draw(
                        this,
                        Game.ObjectsById[7].minigame.spellTooltip(1)() +
                            '<div class="line"></div><div class="description">' +
                            ["First", "Second", "Third", "Fourth"].map((n, i) =>
                                `<b>${n} Spell:</b> ${nextSpell(i)}<br />`
                            ).join("") +
                            "</div>",
                        "this"
                    );
                    Game.tooltip.wobble();
                };
                clearInterval(lookup);
            }
        }, 1000);
    }
})();

// Match colors with fc_infobox.js
const SPELL_NAMES = {
    '<small><b style="color:#FF9B00">Lucky</b></small>': "Lucky", // rgba(255, 155, 0, 1)
    '<small><b style="color:#FFDE5F">Frenzy</b></small>': "Frenzy", // rgba(255, 222, 95, 1)
    '<small><b style="color:#00C4FF">Click Frenzy</b></small>': "Click Frenzy", // rgba(0, 196, 255, 1)
    '<small><b style="color:#FFDE5F">Cookie Chain</b></small>': "Cookie Chain", // rgba(255, 222, 95, 1)
    '<small><b style="color:#1F2C5E">Cookie Storm</b></small>': "Cookie Storm", // rgba(31, 44, 94, 1)
    "<small>Cookie Storm (Drop)</b></small>": "Cookie Storm (Drop)",
    '<small><b style="color:#CF3B79">Building Special</b></small>': "Building Special", // rgba(207, 59, 121, 1)
    "<small>Blab</b></small>": "Blab",
    '<small><b style="color:#FF886B">Ruin Cookies</b></small>': "Ruin Cookies", // rgba(255, 136, 107, 1)
    '<small><b style="color:#FF3605">Clot</b></small>': "Clot", // rgba(255, 54, 5, 1)
    '<small><b style="color:#174F01">Cursed Finger</b></small>': "Cursed Finger", // rgba(23, 79, 1, 1)
    '<small><b style="color:#4F0007">Elder Frenzy</b></small>': "Elder Frenzy", // rgba(79, 0, 7, 1)
    '<small><b style="color:#93E3FB">Sugar Lump</b></small>': "Sugar Lump" // rgba(147, 227, 251, 1)
};

function nextSpell(i) {
    if (!Game.ObjectsById[7].minigameLoaded) return;
    let M = Game.ObjectsById[7].minigame;
    let spell = M.spellsById[1];
    let failChance = M.getFailChance(spell);
    Math.seedrandom(Game.seed + "/" + (M.spellsCastTotal + i));
    let choices = [];
    if (!spell.fail || Math.random() < 1 - failChance) {
        Math.random(); Math.random();
        if (["valentines", "easter"].includes(Game.season)) Math.random();
        choices.push('<b style="color:#FFDE5F">Frenzy', '<b style="color:#FFDE5F">Lucky');
        if (!Game.hasBuff("Dragonflight")) choices.push('<b style="color:#00C4FF">Click Frenzy');
        if (Math.random() < 0.1) choices.push('<b style="color:#FFDE5F">Cookie Chain', '<b style="color:#00C4FF">Cookie Storm', "Blab");
        if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('<b style="color:#DAA520">Building Special');
        if (Math.random() < 0.15) choices = ["Cookie Storm (Drop)"];
        if (Math.random() < 0.0001) choices.push('<b style="color:#5FFFFC">Sugar Lump');
    } else {
        Math.random(); Math.random();
        if (["valentines", "easter"].includes(Game.season)) Math.random();
        choices.push('<b style="color:#FF3605">Clot', '<b style="color:#FF3605">Ruin Cookies');
        if (Math.random() < 0.1) choices.push('<b style="color:#174F01">Cursed Finger', '<b style="color:#4F0007">Elder Frenzy');
        if (Math.random() < 0.003) choices.push('<b style="color:#5FFFFC">Sugar Lump');
        if (Math.random() < 0.1) choices = ["Blab"];
    }
    let ret = choose(choices);
    Math.seedrandom();
    return "<small>" + ret + "</b></small>";
}

function nextSpellName(i) {
    if (!Game.ObjectsById[7].minigameLoaded) return;
    return SPELL_NAMES[nextSpell(i)];
}

function BuildingSpecialBuff() {
    const buffs = [
        "High-five", "Congregation", "Luxuriant harvest", "Ore vein", "Oiled-up",
        "Juicy profits", "Fervent adoration", "Manabloom", "Delicious lifeforms",
        "Breakthrough", "Righteous cataclysm", "Golden ages", "Extra cycles",
        "Solar flare", "Winning streak", "Macrocosm", "Refactoring", "Cosmic nursery",
        "Brainstorm", "Deduplication"
    ];
    return buffs.some(Game.hasBuff) ? 1 : 0;
}

function BuildingBuffTime() {
    for (var i in Game.buffs) {
        if (Game.buffs[i].type && Game.buffs[i].type.name == "building buff") {
            return Game.buffs[i].time / 30;
        }
    }
    return 0;
}

function BuffTimeFactor() {
    let durMod = 1;
    if (Game.Has("Get lucky")) durMod *= 2;
    if (Game.Has("Lasting fortune")) durMod *= 1.1;
    if (Game.Has("Lucky digit")) durMod *= 1.01;
    if (Game.Has("Lucky number")) durMod *= 1.01;
    if (Game.Has("Green yeast digestives")) durMod *= 1.01;
    if (Game.Has("Lucky payout")) durMod *= 1.01;
    durMod *= 1 + Game.auraMult("Epoch Manipulator") * 0.05;
    if (typeof Game.hasGod === "function") {
        const godLvl = Game.hasGod("decadence");
        if (godLvl === 1) durMod *= 1.07;
        else if (godLvl === 2) durMod *= 1.05;
        else if (godLvl === 3) durMod *= 1.02;
    }
    return durMod;
}

/**
 * Automatically casts spells in the Grimoire minigame based on user settings and game state.
 * Handles all auto-casting logic for Conjure Baked Goods, Force the Hand of Fate, Spontaneous Edifice, and Haggler's Charm.
 */
function autoCast() {
    if (!M || FrozenCookies.autoCasting === 0) return;

    // Disable auto-casting if a combo or Sweet is active
    if (
        FrozenCookies.autoFTHOFCombo === 1 ||
        FrozenCookies.auto100ConsistencyCombo === 1 ||
        FrozenCookies.autoSweet === 1
    ) {
        FrozenCookies.autoCasting = 0;
        return;
    }

    // Helper to check if enough magic for a spell
    function canCastSpell(spellId) {
        const spell = M.spellsById[spellId];
        return (
            M.magicM >= Math.floor(spell.costMin + spell.costPercent * M.magicM)
        );
    }

    // Only cast when magic is full (or nearly full if not towerLimit)
    const magicReady =
        (FrozenCookies.towerLimit && M.magic >= M.magicM) ||
        (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1);

    if (!magicReady) return;

    // Priority 1: Free lump from FTHOF
    if (canCastSpell(1) && nextSpellName(0) === "Sugar Lump") {
        M.castSpell(M.spellsById[1]);
        logEvent("autoCasting", "Cast Force the Hand of Fate for a free lump");
        return;
    }

    // Priority 2: Shorten negative buffs with Stretch Time
    if (
        canCastSpell(2) &&
        ((cpsBonus() < 7 &&
            (Game.hasBuff("Loan 1 (interest)") ||
                Game.hasBuff("Loan 2 (interest)") ||
                Game.hasBuff("Loan 3 (interest)"))) ||
            cpsBonus() < 1) &&
        (nextSpellName(0) === "Clot" || nextSpellName(0) === "Ruin Cookies")
    ) {
        M.castSpell(M.spellsById[2]);
        logEvent("autoCasting", "Cast Stretch Time to shorten debuff");
        return;
    }

    // Priority 3: Avoid backfire with Haggler's Charm
    if (
        canCastSpell(4) &&
        cpsBonus() >= FrozenCookies.minCpSMult &&
        (nextSpellName(0) === "Clot" || nextSpellName(0) === "Ruin Cookies")
    ) {
        M.castSpell(M.spellsById[4]);
        logEvent("autoCasting", "Cast Haggler's Charm to avoid backfire");
        return;
    }

    // Main auto-casting logic based on user setting
    switch (FrozenCookies.autoCasting) {
        case 1: // Conjure Baked Goods
            if (!canCastSpell(0)) return;
            M.castSpell(M.spellsById[0]);
            logEvent("autoCasting", "Cast Conjure Baked Goods");
            break;

        case 2: // Force the Hand of Fate (FTHOF) when in a good state
            if (!canCastSpell(1)) return;
            if (cpsBonus() >= FrozenCookies.minCpSMult) {
                M.castSpell(M.spellsById[1]);
                logEvent("autoCasting", "Cast Force the Hand of Fate");
            }
            break;

        case 3: // Smart FTHOF casting for combos
            if (!canCastSpell(1)) return;

            // Avoid bad outcomes by casting Haggler's Charm
            if (
                !Game.hasBuff("Dragonflight") &&
                (nextSpellName(0) === "Blab" ||
                    nextSpellName(0) === "Cookie Storm (Drop)")
            ) {
                M.castSpell(M.spellsById[4]);
                logEvent(
                    "autoCasting",
                    "Cast Haggler's Charm instead of Force the Hand of Fate"
                );
                return;
            }

            if (cpsBonus() >= FrozenCookies.minCpSMult) {
                // Lucky
                if (
                    !Game.hasBuff("Dragonflight") &&
                    nextSpellName(0) === "Lucky"
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                }

                // Combo spells
                if (
                    [
                        "Cookie Chain",
                        "Cookie Storm",
                        "Frenzy",
                        "Building Special",
                    ].includes(nextSpellName(0))
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }

                // Click Frenzy combo
                if (
                    nextSpellName(0) === "Click Frenzy" &&
                    (((Game.hasAura("Reaper of Fields") ||
                        Game.hasAura("Reality Bending")) &&
                        Game.hasBuff("Dragon Harvest") &&
                        Game.hasBuff("Frenzy") &&
                        Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 &&
                        Game.hasBuff("Frenzy").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1) ||
                        (!Game.hasAura("Reaper of Fields") &&
                            (Game.hasBuff("Dragon Harvest") ||
                                Game.hasBuff("Frenzy")) &&
                            (Game.hasBuff("Dragon Harvest").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Frenzy").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                    BuildingSpecialBuff() === 1 &&
                    BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }

                // Elder Frenzy logic
                if (nextSpellName(0) === "Elder Frenzy") {
                    if (Game.Upgrades["Elder Pact"].bought === 1) {
                        if (
                            (Game.hasBuff("Click frenzy") ||
                                Game.hasBuff("Dragonflight")) &&
                            (Game.hasBuff("Click frenzy").time / 30 >=
                                Math.ceil(6 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Dragonflight").time / 30 >=
                                    Math.ceil(6 * BuffTimeFactor()) - 1)
                        ) {
                            M.castSpell(M.spellsById[1]);
                            logEvent(
                                "autoCasting",
                                "Cast Force the Hand of Fate"
                            );
                        }
                    } else if (Game.Upgrades["Elder Pact"].bought === 0) {
                        if (
                            (((Game.hasAura("Reaper of Fields") ||
                                Game.hasAura("Reality Bending")) &&
                                Game.hasBuff("Dragon Harvest") &&
                                Game.hasBuff("Frenzy") &&
                                Game.hasBuff("Dragon Harvest").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1 &&
                                Game.hasBuff("Frenzy").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1) ||
                                (!Game.hasAura("Reaper of Fields") &&
                                    (Game.hasBuff("Dragon Harvest") ||
                                        Game.hasBuff("Frenzy")) &&
                                    (Game.hasBuff("Dragon Harvest").time / 30 >=
                                        Math.ceil(13 * BuffTimeFactor()) - 1 ||
                                        Game.hasBuff("Frenzy").time / 30 >=
                                            Math.ceil(13 * BuffTimeFactor()) -
                                                1))) &&
                            (Game.hasBuff("Click frenzy") ||
                                Game.hasBuff("Dragonflight")) &&
                            (Game.hasBuff("Click frenzy").time / 30 >=
                                Math.ceil(6 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Dragonflight").time / 30 >=
                                    Math.ceil(6 * BuffTimeFactor()) - 1)
                        ) {
                            M.castSpell(M.spellsById[1]);
                            logEvent(
                                "autoCasting",
                                "Cast Force the Hand of Fate"
                            );
                        }
                    }
                    return;
                }

                // Cursed Finger combo
                if (
                    nextSpellName(0) === "Cursed Finger" &&
                    (Game.hasBuff("Click frenzy") ||
                        Game.hasBuff("Dragonflight")) &&
                    (Game.hasBuff("Click frenzy").time / 30 >=
                        Math.ceil(10 * BuffTimeFactor()) - 1 ||
                        Game.hasBuff("Dragonflight").time / 30 >=
                            Math.ceil(6 * BuffTimeFactor()) - 1)
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }
            }
            break;

        case 4: // Only cast FTHOF for Building Special, otherwise Haggler's Charm for bad outcomes
            if (!canCastSpell(1)) return;

            if (
                !Game.hasBuff("Dragonflight") &&
                [
                    "Blab",
                    "Cookie Storm (Drop)",
                    "Cookie Chain",
                    "Cookie Storm",
                    "Frenzy",
                    "Lucky",
                ].includes(nextSpellName(0))
            ) {
                M.castSpell(M.spellsById[4]);
                logEvent(
                    "autoCasting",
                    "Cast Haggler's Charm instead of Force the Hand of Fate"
                );
                return;
            }

            if (cpsBonus() >= FrozenCookies.minCpSMult) {
                if (nextSpellName(0) === "Building Special") {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }

                // Click Frenzy combo (same as above)
                if (
                    nextSpellName(0) === "Click Frenzy" &&
                    (((Game.hasAura("Reaper of Fields") ||
                        Game.hasAura("Reality Bending")) &&
                        Game.hasBuff("Dragon Harvest") &&
                        Game.hasBuff("Frenzy") &&
                        Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 &&
                        Game.hasBuff("Frenzy").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1) ||
                        (!Game.hasAura("Reaper of Fields") &&
                            (Game.hasBuff("Dragon Harvest") ||
                                Game.hasBuff("Frenzy")) &&
                            (Game.hasBuff("Dragon Harvest").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Frenzy").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                    BuildingSpecialBuff() === 1 &&
                    BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }

                // Elder Frenzy logic (same as above)
                if (nextSpellName(0) === "Elder Frenzy") {
                    if (Game.Upgrades["Elder Pact"].bought === 1) {
                        if (
                            (Game.hasBuff("Click frenzy") ||
                                Game.hasBuff("Dragonflight")) &&
                            (Game.hasBuff("Click frenzy").time / 30 >=
                                Math.ceil(6 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Dragonflight").time / 30 >=
                                    Math.ceil(6 * BuffTimeFactor()) - 1)
                        ) {
                            M.castSpell(M.spellsById[1]);
                            logEvent(
                                "autoCasting",
                                "Cast Force the Hand of Fate"
                            );
                        }
                    } else if (Game.Upgrades["Elder Pact"].bought === 0) {
                        if (
                            (((Game.hasAura("Reaper of Fields") ||
                                Game.hasAura("Reality Bending")) &&
                                Game.hasBuff("Dragon Harvest") &&
                                Game.hasBuff("Frenzy") &&
                                Game.hasBuff("Dragon Harvest").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1 &&
                                Game.hasBuff("Frenzy").time / 30 >=
                                    Math.ceil(13 * BuffTimeFactor()) - 1) ||
                                (!Game.hasAura("Reaper of Fields") &&
                                    (Game.hasBuff("Dragon Harvest") ||
                                        Game.hasBuff("Frenzy")) &&
                                    (Game.hasBuff("Dragon Harvest").time / 30 >=
                                        Math.ceil(13 * BuffTimeFactor()) - 1 ||
                                        Game.hasBuff("Frenzy").time / 30 >=
                                            Math.ceil(13 * BuffTimeFactor()) -
                                                1))) &&
                            (Game.hasBuff("Click frenzy") ||
                                Game.hasBuff("Dragonflight")) &&
                            (Game.hasBuff("Click frenzy").time / 30 >=
                                Math.ceil(6 * BuffTimeFactor()) - 1 ||
                                Game.hasBuff("Dragonflight").time / 30 >=
                                    Math.ceil(6 * BuffTimeFactor()) - 1)
                        ) {
                            M.castSpell(M.spellsById[1]);
                            logEvent(
                                "autoCasting",
                                "Cast Force the Hand of Fate"
                            );
                        }
                    }
                    return;
                }

                // Cursed Finger combo
                if (
                    nextSpellName(0) === "Cursed Finger" &&
                    (Game.hasBuff("Click frenzy") ||
                        Game.hasBuff("Dragonflight")) &&
                    (Game.hasBuff("Click frenzy").time / 30 >=
                        Math.ceil(10 * BuffTimeFactor()) - 1 ||
                        Game.hasBuff("Dragonflight").time / 30 >=
                            Math.ceil(6 * BuffTimeFactor()) - 1)
                ) {
                    M.castSpell(M.spellsById[1]);
                    logEvent("autoCasting", "Cast Force the Hand of Fate");
                    return;
                }
            }
            break;

        case 5: // Spontaneous Edifice (SE) logic
            // Only cast if you have at least one You and enough magic
            if (Game.Objects["You"].amount === 0 || !canCastSpell(3)) {
                return;
            }
            // Sell down to 399 Yous or until you have enough cookies to cast SE
            while (
                Game.Objects["You"].amount >= 400 ||
                Game.cookies < Game.Objects["You"].price / 2
            ) {
                Game.Objects["You"].sell(1);
                logEvent(
                    "Store",
                    "Sold 1 You for " +
                        Beautify(
                            Game.Objects["You"].price *
                                Game.Objects["You"].getSellMultiplier()
                        ) +
                        " cookies"
                );
            }
            M.castSpell(M.spellsById[3]);
            logEvent("autoCasting", "Cast Spontaneous Edifice");
            break;

        case 6: // Haggler's Charm
            if (!canCastSpell(4)) return;
            M.castSpell(M.spellsById[4]);
            logEvent("autoCasting", "Cast Haggler's Charm");
            break;
    }
}

// autoFTHOFCombo, performs complex logic to automatically cast spells in the Grimoire minigame.
function autoFTHOFComboAction() {
    if (!M) return;
    if (FrozenCookies.autoFTHOFCombo === 0) return;

    // Prerequisite: Only works with Wizard tower level <= 10
    if (Game.Objects["Wizard tower"].level > 10) {
        FrozenCookies.autoFTHOFCombo = 0;
        logEvent(
            "autoFTHOFCombo",
            "Combo disabled, wizard tower level too high"
        );
        return;
    }

    // Disable if overridden by other combos
    if (
        FrozenCookies.auto100ConsistencyCombo === 1 ||
        FrozenCookies.autoSweet === 1
    ) {
        FrozenCookies.autoFTHOFCombo = 0;
        return;
    }

    // Static variables for state and count
    if (typeof autoFTHOFComboAction.state === "undefined")
        autoFTHOFComboAction.state = 0;
    if (typeof autoFTHOFComboAction.count === "undefined")
        autoFTHOFComboAction.count = 0;

    // Reset if combo failed or lost buffs
    if (
        autoFTHOFComboAction.state > 3 ||
        (autoFTHOFComboAction.state > 2 &&
            ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)) &&
            !Game.hasBuff("Click frenzy") &&
            nextSpellName(0) !== "Click Frenzy" &&
            nextSpellName(1) !== "Click Frenzy")
    ) {
        if (autoFTHOFComboAction.autobuyyes === 1) {
            FrozenCookies.autoBuy = 1;
            autoFTHOFComboAction.autobuyyes = 0;
        }
        autoFTHOFComboAction.state = 0;
        logEvent("autoFTHOFCombo", "Soft fail, spell combo is gone");
        return;
    }

    // Detect combo start conditions
    if (
        !autoFTHOFComboAction.state &&
        ((nextSpellName(0) === "Click Frenzy" &&
            nextSpellName(1) === "Building Special") ||
            (nextSpellName(1) === "Click Frenzy" &&
                nextSpellName(0) === "Building Special") ||
            (nextSpellName(0) === "Click Frenzy" &&
                nextSpellName(1) === "Elder Frenzy") ||
            (nextSpellName(1) === "Click Frenzy" &&
                nextSpellName(0) === "Elder Frenzy"))
    ) {
        autoFTHOFComboAction.state = 1;
    } else if (
        !autoFTHOFComboAction.state &&
        nextSpellName(0) === "Building Special" &&
        nextSpellName(1) === "Building Special"
    ) {
        autoFTHOFComboAction.state = 2;
    }

    // Default: keep casting Haggler's Charm unless something special is up
    if (
        !autoFTHOFComboAction.state &&
        ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
            (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1))
    ) {
        if (nextSpellName(0) === "Sugar Lump") {
            M.castSpell(M.spellsById[1]);
            logEvent("autoFTHOFCombo", "Cast Force the Hand of Fate");
        } else if (
            cpsBonus() < 1 &&
            (nextSpellName(0) === "Clot" || nextSpellName(0) === "Ruin Cookies")
        ) {
            M.castSpell(M.spellsById[2]);
            logEvent("autoFTHOFCombo", "Cast Stretch Time instead of FTHOF");
        } else {
            M.castSpell(M.spellsById[4]);
            logEvent("autoFTHOFCombo", "Cast Haggler's Charm instead of FTHOF");
        }
        return;
    }

    const SugarLevel = Game.Objects["Wizard tower"].level;

    switch (autoFTHOFComboAction.state) {
        case 0:
            return;

        case 1: {
            // Only proceed if Click Frenzy is still in spell queue
            if (
                nextSpellName(0) !== "Click Frenzy" &&
                nextSpellName(1) !== "Click Frenzy"
            ) {
                autoFTHOFComboAction.state = 0;
                return;
            }
            // Check all combo conditions
            if (
                ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                    (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)) &&
                cpsBonus() >= FrozenCookies.minCpSMult &&
                (((Game.hasAura("Reaper of Fields") ||
                    Game.hasAura("Reality Bending")) &&
                    Game.hasBuff("Dragon Harvest") &&
                    Game.hasBuff("Frenzy") &&
                    Game.hasBuff("Dragon Harvest").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1 &&
                    Game.hasBuff("Frenzy").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1) ||
                    (!Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") ||
                            Game.hasBuff("Frenzy")) &&
                        (Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 ||
                            Game.hasBuff("Frenzy").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                BuildingSpecialBuff() === 1 &&
                BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
            ) {
                // Wizard tower level-specific logic
                const wt = Game.Objects["Wizard tower"];
                const amount = wt.amount;
                let minMagic = 0,
                    sellCount = 0;
                switch (
                    SugarLevel // Calculated with https://lookas123.github.io/CCGrimoireCalculator/
                ) {
                    case 1:
                        minMagic = 81;
                        sellCount = amount - 21;
                        break;
                    case 2:
                        minMagic = 81;
                        sellCount = amount - 14;
                        break;
                    case 3:
                        minMagic = 81;
                        sellCount = amount - 8;
                        break;
                    case 4:
                        minMagic = 81;
                        sellCount = amount - 3;
                        break;
                    case 5:
                        minMagic = 83;
                        sellCount = amount - 1;
                        break;
                    case 6:
                        minMagic = 88;
                        sellCount = amount - 1;
                        break;
                    case 7:
                        minMagic = 91;
                        sellCount = amount - 1;
                        break;
                    case 8:
                        minMagic = 93;
                        sellCount = amount - 1;
                        break;
                    case 9:
                        minMagic = 96;
                        sellCount = amount - 1;
                        break;
                    case 10:
                        minMagic = 98;
                        sellCount = amount - 1;
                        break;
                    default:
                        return;
                }
                if (M.magic >= minMagic) {
                    autoFTHOFComboAction.count = sellCount;
                    M.castSpell(M.spellsById[1]);
                    logEvent(
                        "autoFTHOFCombo",
                        "Cast first Force the Hand of Fate"
                    );
                    autoFTHOFComboAction.state = 3;
                }
            }
            return;
        }

        case 2: {
            // Only proceed if Building Special is still in spell queue
            if (
                nextSpellName(0) !== "Building Special" &&
                nextSpellName(1) !== "Building Special"
            ) {
                autoFTHOFComboAction.state = 0;
                return;
            }
            // Check all combo conditions for Building Special + Click Frenzy
            if (
                ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                    (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)) &&
                cpsBonus() >= FrozenCookies.minCpSMult &&
                (((Game.hasAura("Reaper of Fields") ||
                    Game.hasAura("Reality Bending")) &&
                    Game.hasBuff("Dragon Harvest") &&
                    Game.hasBuff("Frenzy") &&
                    Game.hasBuff("Dragon Harvest").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1 &&
                    Game.hasBuff("Frenzy").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1) ||
                    (!Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") ||
                            Game.hasBuff("Frenzy")) &&
                        (Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 ||
                            Game.hasBuff("Frenzy").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                (Game.hasBuff("Click frenzy") ||
                    Game.hasBuff("Dragonflight")) &&
                ((Game.hasBuff("Click frenzy") &&
                    Game.hasBuff("Click frenzy").time / 30 >=
                        Math.ceil(10 * BuffTimeFactor()) - 1) ||
                    (Game.hasBuff("Dragonflight") &&
                        Game.hasBuff("Dragonflight").time / 30 >=
                            Math.ceil(6 * BuffTimeFactor()) - 1))
            ) {
                // Wizard tower level-specific logic
                const wt = Game.Objects["Wizard tower"];
                const amount = wt.amount;
                let minMagic = 0,
                    sellCount = 0;
                switch (SugarLevel) {
                    case 1:
                        minMagic = 81;
                        sellCount = amount - 21;
                        break;
                    case 2:
                        minMagic = 81;
                        sellCount = amount - 14;
                        break;
                    case 3:
                        minMagic = 81;
                        sellCount = amount - 8;
                        break;
                    case 4:
                        minMagic = 81;
                        sellCount = amount - 3;
                        break;
                    case 5:
                        minMagic = 83;
                        sellCount = amount - 1;
                        break;
                    case 6:
                        minMagic = 88;
                        sellCount = amount - 1;
                        break;
                    case 7:
                        minMagic = 91;
                        sellCount = amount - 1;
                        break;
                    case 8:
                        minMagic = 93;
                        sellCount = amount - 1;
                        break;
                    case 9:
                        minMagic = 96;
                        sellCount = amount - 1;
                        break;
                    case 10:
                        minMagic = 98;
                        sellCount = amount - 1;
                        break;
                    default:
                        return;
                }
                if (M.magic >= minMagic) {
                    autoFTHOFComboAction.count = sellCount;
                    M.castSpell(M.spellsById[1]);
                    logEvent(
                        "autoFTHOFCombo",
                        "Cast first Force the Hand of Fate"
                    );
                    autoFTHOFComboAction.state = 3;
                }
            }
            return;
        }

        case 3: {
            // Turn off autoBuy and ensure buy mode
            if (FrozenCookies.autoBuy === 1) {
                autoFTHOFComboAction.autobuyyes = 1;
                FrozenCookies.autoBuy = 0;
            } else {
                autoFTHOFComboAction.autobuyyes = 0;
            }
            if (Game.buyMode === -1) Game.buyMode = 1;

            // Sell Wizard towers, recalc magic, double-cast FTHOF, then rebuy
            const wt = Game.Objects["Wizard tower"];
            wt.sell(autoFTHOFComboAction.count);
            M.computeMagicM();
            M.castSpell(M.spellsById[1]);
            logEvent("autoFTHOFCombo", "Double cast Force the Hand of Fate");

            // Rebuy logic
            let rebuyCount = autoFTHOFComboAction.count;
            if (
                FrozenCookies.towerLimit &&
                FrozenCookies.manaMax <= 100 &&
                rebuyCount <= 497
            ) {
                safeBuy(wt, rebuyCount);
            } else if (
                FrozenCookies.towerLimit &&
                FrozenCookies.manaMax <= 100 &&
                SugarLevel === 10
            ) {
                safeBuy(wt, 486);
            } else {
                safeBuy(wt, rebuyCount);
            }
            FrozenCookies.autobuyCount += 1;

            // Restore autoBuy if it was on before
            if (autoFTHOFComboAction.autobuyyes === 1) {
                FrozenCookies.autoBuy = 1;
                autoFTHOFComboAction.autobuyyes = 0;
            }
            autoFTHOFComboAction.count = 0;
            autoFTHOFComboAction.state = 0;
            return;
        }
    }
}

// Advanced combo combining use of grimoire spells and the garden
function auto100ConsistencyComboAction() {
    if (!M || !G) return;
    if (FrozenCookies.auto100ConsistencyCombo === 0) return;

    // Only works with wizard towers level 10
    if (Game.Objects["Wizard tower"].level !== 10) {
        FrozenCookies.auto100ConsistencyCombo = 0;
        logEvent("auto100ConsistencyCombo", "Combo disabled, impossible");
        return;
    }

    // Autosweet overrides
    if (FrozenCookies.autoSweet === 1) {
        FrozenCookies.auto100ConsistencyCombo = 0;
        return;
    }

    // Prerequisites: fully upgraded dragon, can plant whiskerbloom, whiskerbloom unlocked
    if (
        Game.dragonLevel < 27 ||
        !G.canPlant(G.plantsById[14]) ||
        !G.plantsById[14].unlocked
    ) {
        return;
    }

    // State initialization
    auto100ConsistencyComboAction.state ??= 0;
    auto100ConsistencyComboAction.countFarm ??= 0;
    auto100ConsistencyComboAction.countMine ??= 0;
    auto100ConsistencyComboAction.countFactory ??= 0;
    auto100ConsistencyComboAction.countBank ??= 0;
    auto100ConsistencyComboAction.countTemple ??= 0;
    auto100ConsistencyComboAction.countWizard ??= 0;
    auto100ConsistencyComboAction.countShipment ??= 0;
    auto100ConsistencyComboAction.countAlchemy ??= 0;
    auto100ConsistencyComboAction.countTimeMach ??= 0;
    auto100ConsistencyComboAction.countAntiMatter ??= 0;

    // Soft fail recovery
    if (
        auto100ConsistencyComboAction.state > 20 ||
        (((auto100ConsistencyComboAction.state < 2 &&
            (auto100ConsistencyComboAction.autobuyyes === 1 ||
                auto100ConsistencyComboAction.autogcyes === 1 ||
                auto100ConsistencyComboAction.autogsyes === 1 ||
                auto100ConsistencyComboAction.autogodyes === 1 ||
                auto100ConsistencyComboAction.autodragonyes === 1 ||
                auto100ConsistencyComboAction.autoworshipyes === 1)) ||
            (auto100ConsistencyComboAction.state > 1 &&
                !BuildingSpecialBuff() &&
                !hasClickBuff())) &&
            ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)))
    ) {
        [
            ["autobuyyes", "autoBuy"],
            ["autogcyes", "autoGC"],
            ["autogsyes", "autoGS"],
            ["autogodyes", "autoGodzamok"],
            ["autodragonyes", "autoDragonToggle"],
            ["autoworshipyes", "autoWorshipToggle"],
        ].forEach(([flag, prop]) => {
            if (auto100ConsistencyComboAction[flag] === 1) {
                FrozenCookies[prop] = 1;
                auto100ConsistencyComboAction[flag] = 0;
            }
        });
        auto100ConsistencyComboAction.state = 0;
        logEvent("auto100ConsistencyCombo", "Trying to recover from soft fail");
    }

    // Combo trigger
    if (
        !auto100ConsistencyComboAction.state &&
        M.magicM >= 98 &&
        ((nextSpellName(0) === "Click Frenzy" &&
            nextSpellName(1) === "Building Special") ||
            (nextSpellName(1) === "Click Frenzy" &&
                nextSpellName(0) === "Building Special") ||
            (nextSpellName(0) === "Click Frenzy" &&
                nextSpellName(1) === "Elder Frenzy") ||
            (nextSpellName(1) === "Click Frenzy" &&
                nextSpellName(0) === "Elder Frenzy"))
    ) {
        auto100ConsistencyComboAction.state = 1;
    }

    // Record building counts for rebuying
    auto100ConsistencyComboAction.countFarm = Game.Objects["Farm"].amount - 1;
    auto100ConsistencyComboAction.countMine = Game.Objects["Mine"].amount;
    auto100ConsistencyComboAction.countFactory = Game.Objects["Factory"].amount;
    auto100ConsistencyComboAction.countBank = Game.Objects["Bank"].amount - 1;
    auto100ConsistencyComboAction.countTemple =
        Game.Objects["Temple"].amount - 1;
    auto100ConsistencyComboAction.countWizard =
        Game.Objects["Wizard tower"].amount - 1;
    auto100ConsistencyComboAction.countShipment =
        Game.Objects["Shipment"].amount;
    auto100ConsistencyComboAction.countAlchemy =
        Game.Objects["Alchemy lab"].amount;
    auto100ConsistencyComboAction.countTimeMach =
        Game.Objects["Time machine"].amount;
    auto100ConsistencyComboAction.countAntiMatter =
        Game.Objects["Antimatter condenser"].amount;

    // Default: cast Haggler's Charm unless something special is up
    if (
        !auto100ConsistencyComboAction.state &&
        ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
            (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1))
    ) {
        if (nextSpellName(0) === "Sugar Lump") {
            M.castSpell(M.spellsById[1]);
            logEvent("auto100ConsistencyCombo", "Cast Force the Hand of Fate");
        } else if (
            cpsBonus() < 1 &&
            (nextSpellName(0) === "Clot" || nextSpellName(0) === "Ruin Cookies")
        ) {
            M.castSpell(M.spellsById[2]);
            logEvent(
                "auto100ConsistencyCombo",
                "Cast Stretch Time instead of FTHOF"
            );
        } else {
            M.castSpell(M.spellsById[4]);
            logEvent(
                "auto100ConsistencyCombo",
                "Cast Haggler's Charm instead of FTHOF"
            );
        }
    }

    switch (auto100ConsistencyComboAction.state) {
        case 0:
            return;

        case 1: // Start combo: turn off autoBuy, autoDragon, autoPantheon
            if (
                ((FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                    (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)) &&
                cpsBonus() >= FrozenCookies.minCpSMult &&
                (((Game.hasAura("Reaper of Fields") ||
                    Game.hasAura("Reality Bending")) &&
                    Game.hasBuff("Dragon Harvest") &&
                    Game.hasBuff("Frenzy") &&
                    Game.hasBuff("Dragon Harvest").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1 &&
                    Game.hasBuff("Frenzy").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1) ||
                    (!Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") ||
                            Game.hasBuff("Frenzy")) &&
                        (Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 ||
                            Game.hasBuff("Frenzy").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                BuildingSpecialBuff() === 1 &&
                BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
            ) {
                // Turn off autoBuy
                if (FrozenCookies.autoBuy === 1) {
                    auto100ConsistencyComboAction.autobuyyes = 1;
                    FrozenCookies.autoBuy = 0;
                } else {
                    auto100ConsistencyComboAction.autobuyyes = 0;
                }
                // Turn off Auto Dragon Auras
                if (FrozenCookies.autoDragonToggle === 1) {
                    auto100ConsistencyComboAction.autodragonyes = 1;
                    FrozenCookies.autoDragonToggle = 0;
                } else {
                    auto100ConsistencyComboAction.autodragonyes = 0;
                }
                // Turn off Auto Pantheon
                if (FrozenCookies.autoWorshipToggle === 1) {
                    auto100ConsistencyComboAction.autoworshipyes = 1;
                    FrozenCookies.autoWorshipToggle = 0;
                } else {
                    auto100ConsistencyComboAction.autoworshipyes = 0;
                }
                logEvent("auto100ConsistencyCombo", "Starting combo");
                auto100ConsistencyComboAction.state = 2;
            }
            return;

        case 2: // Turn off autoGC and autoGS
            if (FrozenCookies.autoGC > 0) {
                auto100ConsistencyComboAction.autogcyes = 1;
                FrozenCookies.autoGC = 0;
            } else {
                auto100ConsistencyComboAction.autogcyes = 0;
            }
            if (FrozenCookies.autoGS > 0) {
                auto100ConsistencyComboAction.autogsyes = 1;
                FrozenCookies.autoGS = 0;
            } else {
                auto100ConsistencyComboAction.autogsyes = 0;
            }
            auto100ConsistencyComboAction.state = 3;
            return;

        case 3: {
            // Plant whiskerbloom if not present
            let found = false;
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 6; j++) {
                    if (G.plot[i][j][0] - 1 === 14) found = true;
                }
            }
            if (!found) {
                G.harvestAll();
                for (let y = 0; y <= 5; y++) {
                    for (let x = 0; x <= 5; x++) {
                        G.seedSelected = G.plants["whiskerbloom"].id;
                        G.clickTile(x, y);
                    }
                }
            }
            auto100ConsistencyComboAction.state = 4;
            return;
        }

        case 4: // Set dragon auras: Radiant Appetite & Dragon's Fortune
            if (Game.dragonAura !== 16 || Game.dragonAura2 !== 15) {
                if (Game.dragonAura !== 16) {
                    Game.specialTab = "dragon";
                    Game.SetDragonAura(16, 0);
                    Game.ConfirmPrompt();
                }
                if (Game.dragonAura2 !== 15) {
                    Game.specialTab = "dragon";
                    Game.SetDragonAura(15, 1);
                    Game.ConfirmPrompt();
                }
            }
            auto100ConsistencyComboAction.state = 5;
            return;

        case 5: // Activate Golden Switch
            if (
                Game.Upgrades["Golden switch [off]"].unlocked &&
                !Game.Upgrades["Golden switch [off]"].bought
            ) {
                Game.Upgrades["Golden switch [off]"].buy();
            }
            auto100ConsistencyComboAction.state = 6;
            return;

        case 6: // Cast FTHOF 1
            if (
                (FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)
            ) {
                M.castSpell(M.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 1");
                auto100ConsistencyComboAction.state = 7;
            }
            return;

        case 7: // Cast FTHOF 2, rebuy towers
            Game.Objects["Wizard tower"].sell(
                auto100ConsistencyComboAction.countWizard
            );
            M.computeMagicM();
            if (M.magic >= 30) {
                M.castSpell(M.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 2");
                Game.Objects["Wizard tower"].buy(
                    auto100ConsistencyComboAction.countWizard
                );
                FrozenCookies.autobuyCount += 1;
                auto100ConsistencyComboAction.state = 8;
            }
            return;

        case 8: // Use sugar lump to refill magic
            M.lumpRefill.click();
            Game.ConfirmPrompt();
            auto100ConsistencyComboAction.state = 9;
            return;

        case 9: // Cast FTHOF 3
            if (
                (FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1)
            ) {
                M.castSpell(M.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 3");
                auto100ConsistencyComboAction.state = 10;
            }
            return;

        case 10: // Cast FTHOF 4, rebuy towers
            Game.Objects["Wizard tower"].sell(
                auto100ConsistencyComboAction.countWizard
            );
            M.computeMagicM();
            if (M.magic >= 30) {
                M.castSpell(M.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 4");
                Game.Objects["Wizard tower"].buy(
                    auto100ConsistencyComboAction.countWizard
                );
                FrozenCookies.autobuyCount += 1;
                auto100ConsistencyComboAction.state = 11;
            }
            return;

        case 11: // Disable autoGodzamok if on
            if (FrozenCookies.autoGodzamok > 0) {
                auto100ConsistencyComboAction.autogodyes = 1;
                FrozenCookies.autoGodzamok = 0;
            } else {
                auto100ConsistencyComboAction.autogodyes = 0;
            }
            auto100ConsistencyComboAction.state = 12;
            return;

        case 12: // Pop two golden cookies
            if (Game.shimmers[0]) Game.shimmers[0].pop();
            if (Game.shimmers[0]) Game.shimmers[0].pop();
            auto100ConsistencyComboAction.state = 13;
            return;

        case 13: // Sell buildings for Devastation
            if (!Game.hasGod("ruin") && T.swaps >= 1) swapIn(2, 0);
            [
                ["Farm", "countFarm"],
                ["Mine", "countMine"],
                ["Factory", "countFactory"],
                ["Bank", "countBank"],
                ["Temple", "countTemple"],
                ["Shipment", "countShipment"],
                ["Alchemy lab", "countAlchemy"],
                ["Time machine", "countTimeMach"],
                ["Antimatter condenser", "countAntiMatter"],
            ].forEach(([name, countKey]) => {
                Game.Objects[name].sell(
                    auto100ConsistencyComboAction[countKey]
                );
            });
            auto100ConsistencyComboAction.state = 14;
            return;

        case 14: // Swap Mokalsium to ruby slot
            if (!Game.hasGod("mother") && T.swaps >= 1) swapIn(8, 1);
            auto100ConsistencyComboAction.state = 15;
            return;

        case 15: // Buy back buildings
            [
                ["Farm", "countFarm"],
                ["Mine", "countMine"],
                ["Factory", "countFactory"],
                ["Bank", "countBank"],
                ["Temple", "countTemple"],
                ["Shipment", "countShipment"],
                ["Alchemy lab", "countAlchemy"],
                ["Time machine", "countTimeMach"],
                ["Antimatter condenser", "countAntiMatter"],
            ].forEach(([name, countKey]) => {
                safeBuy(
                    Game.Objects[name],
                    auto100ConsistencyComboAction[countKey]
                );
            });
            FrozenCookies.autobuyCount += 1;
            auto100ConsistencyComboAction.state = 16;
            return;

        case 16: // Pop any other golden cookies (not wrath)
            for (let i in Game.shimmers) {
                if (
                    Game.shimmers[i].type === "golden" &&
                    Game.shimmer.wrath !== 1
                ) {
                    Game.shimmers[i].pop();
                }
            }
            auto100ConsistencyComboAction.state = 17;
            return;

        case 17: // Custom Godzamok: sell and rebuy buildings for buff
            if (
                !Game.hasBuff("Devastation") &&
                !Game.hasBuff("Cursed finger") &&
                hasClickBuff()
            ) {
                if (Game.Objects["Farm"].amount >= 10) {
                    [
                        ["Farm", "countFarm"],
                        ["Mine", "countMine"],
                        ["Factory", "countFactory"],
                        ["Bank", "countBank"],
                        ["Temple", "countTemple"],
                        ["Shipment", "countShipment"],
                        ["Alchemy lab", "countAlchemy"],
                        ["Time machine", "countTimeMach"],
                        ["Antimatter condenser", "countAntiMatter"],
                    ].forEach(([name, countKey]) => {
                        Game.Objects[name].sell(
                            auto100ConsistencyComboAction[countKey]
                        );
                    });
                }
                if (Game.Objects["Farm"].amount < 10) {
                    [
                        ["Farm", "countFarm"],
                        ["Mine", "countMine"],
                        ["Factory", "countFactory"],
                        ["Bank", "countBank"],
                        ["Temple", "countTemple"],
                        ["Shipment", "countShipment"],
                        ["Alchemy lab", "countAlchemy"],
                        ["Time machine", "countTimeMach"],
                        ["Antimatter condenser", "countAntiMatter"],
                    ].forEach(([name, countKey]) => {
                        safeBuy(
                            Game.Objects[name],
                            auto100ConsistencyComboAction[countKey] -
                                Game.Objects[name].amount
                        );
                    });
                    FrozenCookies.autobuyCount += 1;
                }
            }
            if (Game.hasBuff("Devastation") && hasClickBuff()) {
                [
                    ["Farm", "countFarm"],
                    ["Mine", "countMine"],
                    ["Factory", "countFactory"],
                    ["Bank", "countBank"],
                    ["Temple", "countTemple"],
                    ["Shipment", "countShipment"],
                    ["Alchemy lab", "countAlchemy"],
                    ["Time machine", "countTimeMach"],
                    ["Antimatter condenser", "countAntiMatter"],
                ].forEach(([name, countKey]) => {
                    if (
                        Game.Objects[name].amount <
                        auto100ConsistencyComboAction[countKey]
                    ) {
                        safeBuy(
                            Game.Objects[name],
                            auto100ConsistencyComboAction[countKey] -
                                Game.Objects[name].amount
                        );
                    }
                });
                FrozenCookies.autobuyCount += 1;
            }
            if (!hasClickBuff()) auto100ConsistencyComboAction.state = 18;
            return;

        case 18: // Restore autoGC/autoGS, turn on Golden Switch
            if (!Game.hasBuff("Click frenzy") && !goldenCookieLife()) {
                if (
                    Game.Upgrades["Golden switch [on]"].unlocked &&
                    !Game.Upgrades["Golden switch [on]"].bought
                ) {
                    Game.CalculateGains();
                    Game.Upgrades["Golden switch [on]"].buy();
                }
                if (auto100ConsistencyComboAction.autogcyes === 1) {
                    FrozenCookies.autoGC = 1;
                    auto100ConsistencyComboAction.autogcyes = 0;
                }
                if (auto100ConsistencyComboAction.autogsyes === 1) {
                    FrozenCookies.autoGS = 1;
                    auto100ConsistencyComboAction.autogsyes = 0;
                }
                auto100ConsistencyComboAction.state = 19;
            }
            return;

        case 19: // Final rebuy of buildings
            [
                ["Farm", "countFarm"],
                ["Mine", "countMine"],
                ["Factory", "countFactory"],
                ["Bank", "countBank"],
                ["Temple", "countTemple"],
                ["Shipment", "countShipment"],
                ["Alchemy lab", "countAlchemy"],
                ["Time machine", "countTimeMach"],
                ["Antimatter condenser", "countAntiMatter"],
            ].forEach(([name, countKey]) => {
                if (
                    Game.Objects[name].amount <
                    auto100ConsistencyComboAction[countKey]
                ) {
                    safeBuy(
                        Game.Objects[name],
                        auto100ConsistencyComboAction[countKey] -
                            Game.Objects[name].amount
                    );
                }
            });
            FrozenCookies.autobuyCount += 1;
            auto100ConsistencyComboAction.state = 20;
            return;

        case 20: // Restore all toggles, finish
            [
                ["autobuyyes", "autoBuy"],
                ["autogodyes", "autoGodzamok"],
                ["autodragonyes", "autoDragonToggle"],
                ["autoworshipyes", "autoWorshipToggle"],
            ].forEach(([flag, prop]) => {
                if (auto100ConsistencyComboAction[flag] === 1) {
                    FrozenCookies[prop] = 1;
                    auto100ConsistencyComboAction[flag] = 0;
                }
            });
            logEvent("auto100ConsistencyCombo", "Combo completed");
            auto100ConsistencyComboAction.state = 0;
            return;
    }
}

// Auto Sweet action: Keep ascending if no "Sweet" spell is detected
function autoSweetAction() {
    if (!FrozenCookies.autoSweet) return;

    // Save and disable autoBuy if enabled
    if (FrozenCookies.autoBuy === 1) {
        autoSweetAction.autobuyyes = 1;
        FrozenCookies.autoBuy = 0;
    } else {
        autoSweetAction.autobuyyes = 0;
    }

    // Only proceed if the game is ready
    if (Game.ready) {
        autoSweetAction.state ??= 0;

        // Check if any of the next 10 spells is "Sugar Lump"
        if (
            !autoSweetAction.state &&
            Array.from({ length: 10 }).some(
                (_, i) => nextSpellName(i) === "Sugar Lump"
            )
        ) {
            autoSweetAction.state = 1;
        }

        // If not in combo state and not ascending, force ascend to reroll spells
        if (!autoSweetAction.state && !Game.OnAscend && !Game.AscendTimer) {
            logEvent("autoSweet", 'No "Sweet" detected, ascending');
            Game.ClosePrompt();
            Game.Ascend(1);
            setTimeout(() => {
                Game.ClosePrompt();
                Game.Reincarnate(1);
            }, 10000);
            return;
        }

        // Combo state: wait for magic, cast Haggler's Charm until "Sugar Lump" appears, then cast FTHOF
        if (autoSweetAction.state === 1) {
            // Lower manaMax for more spell casts if towerLimit is enabled
            if (FrozenCookies.towerLimit) {
                autoSweetAction.manaPrev ??= FrozenCookies.manaMax;
                FrozenCookies.manaMax = 37;
            }
            const magicReady =
                (FrozenCookies.towerLimit && M.magic >= M.magicM) ||
                (!FrozenCookies.towerLimit && M.magic >= M.magicM - 1);

            if (magicReady) {
                if (nextSpellName(0) !== "Sugar Lump") {
                    M.castSpell(M.spellsById[4]);
                    logEvent(
                        "autoSweet",
                        "Cast Haggler's Charm while waiting for 'Sweet'"
                    );
                } else {
                    M.castSpell(M.spellsById[1]);
                    logEvent(
                        "autoSweet",
                        "Sugar Lump Get! Disabling Auto Sweet"
                    );
                    autoSweetAction.state = 0;
                    // Restore manaMax if changed
                    if (autoSweetAction.manaPrev !== undefined) {
                        FrozenCookies.manaMax = autoSweetAction.manaPrev;
                        autoSweetAction.manaPrev = undefined;
                    }
                    // Restore autoBuy if it was on before
                    if (autoSweetAction.autobuyyes === 1) {
                        FrozenCookies.autoBuy = 1;
                        autoSweetAction.autobuyyes = 0;
                    }
                    FrozenCookies.autoSweet = 0;
                }
            }
        }
    }
}
