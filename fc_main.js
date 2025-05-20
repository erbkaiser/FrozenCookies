// Add polyfills:
(function (global) {
    var global_isFinite = global.isFinite;
    Object.defineProperty(Number, "isFinite", {
        value: function isFinite(value) {
            return typeof value === "number" && global_isFinite(value);
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });
})(this);

function registerMod(mod_id = "frozen_cookies") {
    // Register with the modding API
    Game.registerMod(mod_id, {
        init: function () {
            // Set bulk buy mode after reincarnation
            Game.registerHook("reincarnate", function () {
                if (!FrozenCookies.autoBulk) return;
                const bulkBtn =
                    FrozenCookies.autoBulk == 1
                        ? document.getElementById("storeBulk10")
                        : document.getElementById("storeBulk100");
                if (bulkBtn) bulkBtn.click();
            });

            // Update timers every draw tick
            Game.registerHook("draw", updateTimers);

            // Add custom news ticker messages
            Game.registerHook("ticker", function () {
                const isFools = Game.season == "fools";
                const rand = Math.random();
                if (Game.cookiesEarned >= 1000 && rand < 0.3 && !isFools) {
                    return [
                        "News : debate about whether using Frozen Cookies constitutes cheating continues to rage. Violence escalating.",
                        "News : Supreme Court rules Frozen Cookies not unauthorized cheating after all.",
                        "News : Frozen Cookies considered 'cool'. Pun-haters heard groaning.",
                    ];
                }
                if (
                    bestBank(nextChainedPurchase().efficiency).cost > 0 &&
                    rand < 0.3 &&
                    !isFools
                ) {
                    return [
                        "You wonder if those " +
                            Beautify(
                                bestBank(nextChainedPurchase().efficiency).cost
                            ) +
                            " banked cookies are still fresh.",
                    ];
                }
                if (nextPurchase().cost > 0 && rand < 0.3 && !isFools) {
                    return [
                        "You should buy " +
                            nextPurchase().purchase.name +
                            " next.",
                    ];
                }
                if (rand < 0.3 && isFools) {
                    return [
                        "Investigation into potential cheating with Frozen Cookies is blocked by your lawyers.",
                        "Your Frozen Cookies are now available in stores everywhere.",
                        "Movie studio suit against your use of 'Frozen' dismissed with prejudice.",
                    ];
                }
                if (
                    bestBank(nextChainedPurchase().efficiency).cost > 0 &&
                    rand < 0.3 &&
                    isFools
                ) {
                    return [
                        "You have " +
                            Beautify(
                                bestBank(nextChainedPurchase().efficiency)
                                    .cost * 0.08
                            ) +
                            " cookie dollars just sitting in your wallet.",
                    ];
                }
                if (
                    nextPurchase().cost > 0 &&
                    nextPurchase().type != "building" &&
                    rand < 0.3 &&
                    isFools
                ) {
                    return [
                        "Your next investment: " +
                            nextPurchase().purchase.name +
                            ".",
                    ];
                }
                if (
                    nextPurchase().cost > 0 &&
                    nextPurchase().type == "building" &&
                    rand < 0.3 &&
                    isFools
                ) {
                    return [
                        "Your next investment: " +
                            Game.foolObjects[nextPurchase().purchase.name]
                                .name +
                            ".",
                    ];
                }
            });

            // Clear caches on hard reset
            Game.registerHook("reset", function (hard) {
                if (hard) emptyCaches();
            });
        },
        save: saveFCData,
        load: setOverrides,
    });

    // Ensure initialization if no previous data
    if (!FrozenCookies.loadedData) setOverrides();
    logEvent(
        "Load",
        "Initial Load of Frozen Cookies v " +
            FrozenCookies.branch +
            "." +
            FrozenCookies.version +
            ". (You should only ever see this once.)"
    );
}

function setOverrides(gameSaveData) {
    // load settings and initialize variables
    // If gameSaveData wasn't passed to this function, it means that there was nothing for this mod in the game save when the mod was loaded
    // In that case, set the "loadedData" var to an empty object. When the loadFCData() function runs and finds no data from the game save,
    // it pulls data from local storage or sets default values
    FrozenCookies.loadedData = gameSaveData ? JSON.parse(gameSaveData) : {};
    loadFCData();
    FrozenCookies.frequency = 100;
    FrozenCookies.efficiencyWeight = 1.0;
    FrozenCookies.timeTravelAmount = 0; // Becomes 0 almost immediately after user input, so default to 0
    FrozenCookies.autobuyCount = 0; // Force redraw every 10 purchases

    // Set default values for calculations
    FrozenCookies.hc_gain = 0;
    FrozenCookies.hc_gain_time = Date.now();
    FrozenCookies.last_gc_state =
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) *
        clickBuffBonus();
    FrozenCookies.last_gc_time = Date.now();
    FrozenCookies.lastCPS = Game.cookiesPs;
    FrozenCookies.lastBaseCPS = Game.cookiesPs;
    FrozenCookies.lastCookieCPS = 0;
    FrozenCookies.lastUpgradeCount = 0;
    FrozenCookies.currentBank = { cost: 0, efficiency: 0 };
    FrozenCookies.targetBank = { cost: 0, efficiency: 0 };
    FrozenCookies.disabledPopups = true;
    FrozenCookies.trackedStats = [];
    FrozenCookies.lastGraphDraw = 0;
    FrozenCookies.calculatedCpsByType = {};

    // Allow autoCookie to run
    FrozenCookies.processing = false;
    FrozenCookies.priceReductionTest = false;

    // Timers
    [
        "cookieBot",
        "autoclickBot",
        "autoFrenzyBot",
        "frenzyClickBot",
        "smartTrackingBot",
    ].forEach((k) => (FrozenCookies[k] = 0));

    FrozenCookies.minDelay = 10000; // 10s minimum reporting between purchases with "smart tracking" on
    FrozenCookies.delayPurchaseCount = 0;
    emptyCaches(); // Caching
    FrozenCookies.showAchievements = true; //Whether to currently display achievement popups
    if (!blacklist[FrozenCookies.blacklist]) FrozenCookies.blacklist = 0;
    if (!window.App) window.App = undefined; // Set `App`, on older version of CC it's not set to anything, so default it to `undefined`
    Beautify = fcBeautify;
    Game.sayTime = (time) => timeDisplay(time / Game.fps);

    if (typeof Game.tooltip.oldDraw !== "function") {
        Game.tooltip.oldDraw = Game.tooltip.draw;
        Game.tooltip.draw = fcDraw;
    }
    if (typeof Game.oldReset !== "function") {
        Game.oldReset = Game.Reset;
        Game.Reset = fcReset;
    }
    Game.Win = fcWin;

    // Pre-calc recommendations and UI
    nextPurchase(true);
    Game.RefreshStore();
    Game.RebuildUpgrades();
    beautifyUpgradesAndAchievements();

    // Replace Game.Popup with logEvent in golden cookie and wrinkler pop
    eval(
        "Game.shimmerTypes.golden.popFunc = " +
            Game.shimmerTypes.golden.popFunc
                .toString()
                .replace(/Game\.Popup\((.+)\)\;/g, 'logEvent("GC", $1, true);')
    );
    eval(
        "Game.UpdateWrinklers = " +
            Game.UpdateWrinklers.toString().replace(
                /Game\.Popup\((.+)\)\;/g,
                'logEvent("Wrinkler", $1, true);'
            )
    );

    eval(
        "FrozenCookies.safeGainsCalc = " +
            Game.CalculateGains.toString()
                .replace(/eggMult\+=\(1.+/, "eggMult++; // CENTURY EGGS SUCK")
                .replace(/Game\.cookiesPs/g, "FrozenCookies.calculatedCps")
                .replace(/Game\.globalCpsMult/g, "mult")
    );

    if (!Game.HasAchiev("Third-party")) Game.Win("Third-party"); // Give free achievement!

    function loadFCData() {
        // Helper to parse and assign preferences
        function assignPrefs(keys, def = 0) {
            keys.forEach((k) => {
                FrozenCookies[k] = preferenceParse(k, def);
            });
        }

        // Set all cycleable preferences
        Object.keys(FrozenCookies.preferenceValues).forEach((preference) => {
            FrozenCookies[preference] = preferenceParse(
                preference,
                FrozenCookies.preferenceValues[preference].default
            );
        });

        // User-input values
        assignPrefs([
            "cookieClickSpeed",
            "frenzyClickSpeed",
            "HCAscendAmount",
            "minCpSMult",
            "maxSpecials",
            "minLoanMult",
            "minASFMult",
            "mineMax",
            "factoryMax",
            "manaMax",
            "orbMax",
        ]);

        // Restore some possibly broken settings from combo/autosweet actions
        [
            { flag: "autoSweet", prop: "autobuyyes", target: "autoBuy" },
            { flag: "autoFTHOFCombo", prop: "autobuyyes", target: "autoBuy" },
            {
                flag: "auto100ConsistencyCombo",
                prop: "autobuyyes",
                target: "autoBuy",
            },
            {
                flag: "auto100ConsistencyCombo",
                prop: "autogcyes",
                target: "autoGC",
            },
            {
                flag: "auto100ConsistencyCombo",
                prop: "autogodyes",
                target: "autoGodzamok",
            },
            {
                flag: "auto100ConsistencyCombo",
                prop: "autoworshipyes",
                target: "autoWorshipToggle",
            },
            {
                flag: "auto100ConsistencyCombo",
                prop: "autodragonyes",
                target: "autoDragonToggle",
            },
        ].forEach(({ flag, prop, target }) => {
            let actionObj =
                flag === "autoSweet"
                    ? autoSweetAction
                    : flag === "autoFTHOFCombo"
                    ? autoFTHOFComboAction
                    : auto100ConsistencyComboAction;
            if (!FrozenCookies[flag] && actionObj[prop] == 1) {
                FrozenCookies[target] = 1;
                actionObj[prop] = 0;
            }
        });

        // Get historical data
        try {
            FrozenCookies.frenzyTimes =
                JSON.parse(
                    FrozenCookies.loadedData["frenzyTimes"] ||
                        localStorage.getItem("frenzyTimes")
                ) || {};
        } catch {
            FrozenCookies.frenzyTimes = {};
        }
        assignPrefs([
            "lastHCAmount",
            "lastHCTime",
            "prevLastHCTime",
            "maxHCPercent",
        ]);

        if (Object.keys(FrozenCookies.loadedData).length > 0) {
            logEvent(
                "Load",
                "Restored Frozen Cookies settings from previous save"
            );
        }
    }

    function preferenceParse(setting, defaultVal) {
        if (setting in FrozenCookies.loadedData) {
            return Number(FrozenCookies.loadedData[setting]);
        } else if (localStorage.getItem(setting)) {
            return Number(localStorage.getItem(setting));
        }
        return Number(defaultVal);
    }

    FCStart();
}

function emptyCaches() {
    FrozenCookies.recalculateCaches = true;
    // Reset all relevant cache properties to their initial state
    FrozenCookies.caches = {
        nextPurchase: null,
        nextChainedPurchase: null,
        recommendationList: [],
        buildings: [],
        upgrades: [],
    };
}

function scientificNotation(value) {
    if (typeof value !== "number" || !isFinite(value)) return "NaN";
    if (value === 0) return "0";
    const absValue = Math.abs(value);
    if (absValue >= 1 && absValue < 1000) return rawFormatter(value);

    // Use 3 significant digits for better readability
    let expStr = value.toExponential(3);
    // Remove unnecessary "+" in exponent and leading zeros
    expStr = expStr.replace(/e\+?(-?)(0*)(\d+)/, (m, sign, zeros, digits) => {
        return "e" + sign + digits;
    });
    return expStr;
}

// Number formatters for displaying large numbers in various styles
var numberFormatters = [
    // Raw number, no formatting
    rawFormatter,

    // Long scale: million, billion, trillion, etc.
    formatEveryThirdPower([
        "",
        " million",
        " billion",
        " trillion",
        " quadrillion",
        " quintillion",
        " sextillion",
        " septillion",
        " octillion",
        " nonillion",
        " decillion",
        " undecillion",
        " duodecillion",
        " tredecillion",
        " quattuordecillion",
        " quindecillion",
        " sexdecillion",
        " septendecillion",
        " octodecillion",
        " novemdecillion",
        " vigintillion",
        " unvigintillion",
        " duovigintillion",
        " trevigintillion",
        " quattuorvigintillion",
        " quinvigintillion",
        " sexvigintillion",
        " septenvigintillion",
        " octovigintillion",
        " novemvigintillion",
        " trigintillion",
        " untrigintillion",
        " duotrigintillion",
        " tretrigintillion",
        " quattuortrigintillion",
        " quintrigintillion",
        " sextrigintillion",
        " septentrigintillion",
        " octotrigintillion",
        " novemtrigintillion",
    ]),

    // Short scale: M, B, T, Qa, etc.
    formatEveryThirdPower([
        "",
        " M",
        " B",
        " T",
        " Qa",
        " Qi",
        " Sx",
        " Sp",
        " Oc",
        " No",
        " De",
        " UnD",
        " DoD",
        " TrD",
        " QaD",
        " QiD",
        " SxD",
        " SpD",
        " OcD",
        " NoD",
        " Vg",
        " UnV",
        " DoV",
        " TrV",
        " QaV",
        " QiV",
        " SxV",
        " SpV",
        " OcV",
        " NoV",
        " Tg",
        " UnT",
        " DoT",
        " TrT",
        " QaT",
        " QiT",
        " SxT",
        " SpT",
        " OcT",
        " NoT",
    ]),

    // Scientific SI prefixes: M, G, T, P, etc.
    formatEveryThirdPower([
        "",
        " M",
        " G",
        " T",
        " P",
        " E",
        " Z",
        " Y",
        " R",
        " Q",
    ]),

    // Scientific notation (e.g., 1.23e12)
    scientificNotation,
];

function fcBeautify(value) {
    // Handle non-numeric or null/undefined values gracefully
    if (typeof value !== "number" || isNaN(value)) return "NaN";
    const negative = value < 0;
    value = Math.abs(value);

    // Clamp numberDisplay to valid range
    const idx = Math.max(
        0,
        Math.min(FrozenCookies.numberDisplay, numberFormatters.length - 1)
    );
    const formatter = numberFormatters[idx];

    let output = formatter(value);

    // Add thousands separators for plain numbers, but not for scientific notation or already formatted
    if (
        typeof output === "number" ||
        (/^\d+$/.test(output) && !/e[\+\-]?\d+$/i.test(output))
    ) {
        output = output.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return negative ? "-" + output : output;
}

// Beautify all numbers in upgrades and achievements descriptions
function beautifyUpgradesAndAchievements() {
    // Helper: beautify all numbers in a string, but avoid double-formatting
    function beautifyAllNumbers(str) {
        // Replace numbers not already formatted (skip those with letters after)
        return str.replace(/\b\d{1,3}(?:,\d{3})*\b/g, (match) => {
            // Don't beautify if already contains a suffix or is part of a word
            if (/[a-zA-Z]/.test(match)) return match;
            return Beautify(parseInt(match.replace(/,/g, ""), 10));
        });
    }

    Object.values(Game.AchievementsById).forEach((ach) => {
        if (typeof ach.desc === "string") {
            ach.desc = beautifyAllNumbers(ach.desc);
        }
    });

    Object.values(Game.UpgradesById).forEach((upg) => {
        if (typeof upg.desc === "string") {
            upg.desc = beautifyAllNumbers(upg.desc);
        }
    });
}

function timeDisplay(seconds) {
    if (seconds === "---" || seconds === 0) return "Done!";
    if (seconds === Number.POSITIVE_INFINITY) return "Never!";
    seconds = Math.floor(seconds);

    const units = [
        { label: "y", value: 365.25 * 24 * 60 * 60 },
        { label: "d", value: 24 * 60 * 60 },
        { label: "h", value: 60 * 60 },
        { label: "m", value: 60 },
        { label: "s", value: 1 },
    ];

    let result = [];
    for (const { label, value } of units) {
        if (seconds >= value) {
            const amount = Math.floor(seconds / value);
            result.push((label === "y" ? Beautify(amount) : amount) + label);
            seconds %= value;
        }
    }
    return result.length ? result.join(" ") : "0s";
}

function fcDraw(from, text, origin) {
    if (typeof text == "string") {
        if (text.includes("Devastation")) {
            text = text.replace(
                /\+\d+\%/,
                "+" +
                    Math.round(
                        (Game.hasBuff("Devastation").multClick - 1) * 100
                    ) +
                    "%"
            );
        }
    }
    Game.tooltip.oldDraw(from, text, origin);
}

function fcReset() {
    // Pop all wrinklers before reset
    Game.CollectWrinklers();

    // Sell all stock in the Bank minigame if available
    if (B) {
        B.goodsById.forEach((_, i) => B.sellGood(i, 10000));
    }

    // Harvest all plants in the Garden minigame if available
    if (G) G.harvestAll();

    // Handle Chocolate egg purchase with Earth Shatterer aura if possible
    const canEarthShatter =
        Game.dragonLevel > 5 &&
        !Game.hasAura("Earth Shatterer") &&
        Game.HasUnlocked("Chocolate egg") &&
        !Game.Has("Chocolate egg");

    if (canEarthShatter) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(5, 0); // Set Earth Shatterer aura
        Game.ConfirmPrompt();
    }

    // Sell all buildings and buy Chocolate egg if unlocked and not owned
    if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        Game.ObjectsById.forEach((b) => b.sell(-1));
        Game.Upgrades["Chocolate egg"].buy();
    }

    // Call the original reset function
    Game.oldReset();

    // Reset FrozenCookies tracking variables
    FrozenCookies.frenzyTimes = {};
    FrozenCookies.last_gc_state =
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) *
        clickBuffBonus();
    FrozenCookies.last_gc_time = Date.now();
    FrozenCookies.lastHCAmount = Game.HowMuchPrestige(
        Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
    );
    FrozenCookies.lastHCTime = Date.now();
    FrozenCookies.maxHCPercent = 0;
    FrozenCookies.prevLastHCTime = Date.now();
    FrozenCookies.lastCps = 0;
    FrozenCookies.lastBaseCps = 0;
    FrozenCookies.trackedStats = [];

    // Recalculate recommendations after reset
    recommendationList(true);
}

function saveFCData() {
    const saveString = {};

    // Save all preference values
    Object.keys(FrozenCookies.preferenceValues).forEach((preference) => {
        saveString[preference] = FrozenCookies[preference];
    });

    // Save additional user settings
    // nonFrenzyTime/non_gc_time and frenzyTime/gc_time are currently not being tracked here
    [
        "frenzyClickSpeed",
        "cookieClickSpeed",
        "HCAscendAmount",
        "mineMax",
        "factoryMax",
        "minCpSMult",
        "minLoanMult",
        "minASFMult",
        "lastHCAmount",
        "maxHCPercent",
        "lastHCTime",
        "manaMax",
        "maxSpecials",
        "orbMax",
        "prevLastHCTime",
    ].forEach((key) => {
        saveString[key] = FrozenCookies[key];
    });

    // Save frenzyTimes as a JSON string for compatibility
    saveString.frenzyTimes = JSON.stringify(FrozenCookies.frenzyTimes);

    // Save version for future compatibility
    saveString.saveVersion = FrozenCookies.version;

    return JSON.stringify(saveString);
}

function divCps(value, cps) {
    // Returns the time (in seconds) to earn 'value' cookies at 'cps' rate.
    // Handles edge cases: zero/negative cps returns Infinity, zero/negative value returns 0.
    if (typeof value !== "number" || value <= 0) return 0;
    if (typeof cps !== "number" || cps <= 0) return Number.POSITIVE_INFINITY;
    return value / cps;
}

// Returns the cookies needed or time remaining until the next heavenly chip
function nextHC(returnCookies) {
    // Calculate the next whole prestige level (heavenly chip)
    const currentHC = Math.floor(
        Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)
    );
    const nextHC = currentHC + 1;
    const cookiesForNext = Game.HowManyCookiesReset(nextHC);
    const cookiesToGo = Math.max(
        0,
        cookiesForNext - (Game.cookiesEarned + Game.cookiesReset)
    );
    if (returnCookies) return cookiesToGo;
    // Avoid division by zero
    const cps = Math.max(1, Game.cookiesPs);
    return timeDisplay(divCps(cookiesToGo, cps));
}

function copyToClipboard(text) {
    // Use the modern Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
            () => {
                Game.Notify("Copied!", "Text copied to clipboard.", [16, 5]);
            },
            () => {
                fallbackCopyToClipboard(text);
            }
        );
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    // Create a temporary textarea to select and copy
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        Game.Notify("Copied!", "Text copied to clipboard.", [16, 5]);
    } catch (err) {
        window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
    document.body.removeChild(textarea);
}

function getBuildingSpread() {
    // Returns a string with building names and their amounts, e.g. "Cursor: 100 / Grandma: 50 / ..."
    return Game.ObjectsById.map((obj) => `${obj.name}: ${obj.amount}`).join(
        " / "
    );
}

// todo: add bind for autoascend
// Press 'a' to toggle autoBuy.
// Press 'b' to pop up a copyable window with building spread.
// Press 'c' to toggle auto-GC
// Press 'e' to pop up a copyable window with your export string
// Press 'r' to pop up the reset window
// Press 's' to do a manual save
// Press 'w' to display a wrinkler-info window
document.addEventListener("keydown", function (event) {
    if (!Game.promptOn && FrozenCookies.FCshortcuts) {
        switch (event.code) {
            case "KeyA":
                Game.Toggle(
                    "autoBuy",
                    "autobuyButton",
                    "Autobuy OFF",
                    "Autobuy ON"
                );
                toggleFrozen("autoBuy");
                break;
            case "KeyB":
                copyToClipboard(getBuildingSpread());
                break;
            case "KeyC":
                Game.Toggle(
                    "autoGC",
                    "autogcButton",
                    "Autoclick GC OFF",
                    "Autoclick GC ON"
                );
                toggleFrozen("autoGC");
                break;
            case "KeyE":
                copyToClipboard(Game.WriteSave(true));
                break;
            case "KeyR":
                Game.Reset();
                break;
            case "KeyS":
                Game.WriteSave();
                break;
            case "KeyW":
                Game.Notify(
                    "Wrinkler Info",
                    "Popping all wrinklers will give you " +
                        Beautify(wrinklerValue()) +
                        ' cookies. <input type="button" value="Click here to pop all wrinklers" onclick="Game.CollectWrinklers()"></input>',
                    [19, 8],
                    7
                );
                break;
        }
    }
});

function userInputPrompt(title, description, existingValue, callback) {
    Game.Prompt(
        `<h3>${title}</h3>
        <div class="block" style="text-align:center;">${description}</div>
        <div class="block">
            <input type="text" style="text-align:center;width:100%;" id="fcGenericInput" value="${existingValue}" autocomplete="off"/>
        </div>`,
        ["Confirm", "Cancel"]
    );
    // Confirm on button click or Enter key
    const confirm = () => {
        callback(l("fcGenericInput").value);
    };
    $("#promptOption0").off("click").on("click", confirm);
    $("#fcGenericInput")
        .focus()
        .select()
        .off("keydown")
        .on("keydown", function (e) {
            if (e.key === "Enter") {
                confirm();
                Game.ClosePrompt();
            }
        });
}

function validateNumber(value, minValue = null, maxValue = null) {
    if (value === undefined || value === null) return false;
    const numericValue = Number(value);
    if (isNaN(numericValue)) return false;
    if (minValue !== null && numericValue < minValue) return false;
    if (maxValue !== null && numericValue > maxValue) return false;
    return true;
}

function storeNumberCallback(base, min, max) {
    return (result) => {
        if (!validateNumber(result, min, max)) result = FrozenCookies[base];
        FrozenCookies[base] = Number(result);
        FCStart();
    };
}

function updateNumberSetting({
    title,
    description,
    base,
    min = 0,
    max = null,
}) {
    userInputPrompt(
        title,
        description,
        FrozenCookies[base],
        storeNumberCallback(base, min, max)
    );
}

function cyclePreference(preferenceName) {
    const pref = FrozenCookies.preferenceValues[preferenceName];
    if (!pref) return;

    const display = pref.display;
    const button = document.getElementById(preferenceName + "Button");
    if (!display || !display.length || !button) return;

    let current = Number(FrozenCookies[preferenceName]) || 0;
    let next = (current + 1) % display.length;
    FrozenCookies[preferenceName] = next;
    button.innerText = display[next];

    FrozenCookies.recalculateCaches = true;
    Game.RefreshStore();
    Game.RebuildUpgrades();
    FCStart();
}

function toggleFrozen(setting) {
    FrozenCookies[setting] = FrozenCookies[setting] ? 0 : 1;
    FCStart();
}

// Helper references to minigames, safely handles missing minigames (e.g., not unlocked yet)
function getMinigame(objName) {
    const obj = Game.Objects[objName];
    return obj && obj.minigame ? obj.minigame : null;
}
var G = getMinigame("Farm"); // Garden
var B = getMinigame("Bank"); // Stock Market
var T = getMinigame("Temple"); // Pantheon
var M = getMinigame("Wizard tower"); // Grimoire

/**
 * Sells enough of the cheapest building to make BuildingsOwned a multiple of 10 for Rigidel's effect.
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
 */
function lumpIn(mins) {
    mins = Math.max(0, Number(mins) || 0);
    Game.lumpT = Date.now() - Game.lumpRipeAge + mins * 60000;
}

/**
 * Swaps a god into a Pantheon slot.
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

function autoTicker() {
    if (Game.TickerEffect && Game.TickerEffect.type == "fortune")
        Game.tickerL.click();
}

// Used in autoCast() for some maths in the smart Force The Hand of Fate subroutine
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

// Improved autoFTHOFComboAction for clarity, maintainability, and reliability
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

function autoEasterAction() {
    // Only act if autoEaster is enabled, not already in Easter, and not all Easter cookies collected
    // Also require that the season switcher is unlocked (Upgrade ID 181)
    if (
        !FrozenCookies.autoEaster ||
        Game.season === "easter" ||
        haveAll("easter") ||
        !Game.UpgradesById[181] ||
        Game.UpgradesById[181].unlocked !== 1
    ) {
        return;
    }

    // If a Cookie Storm is active and not in Easter, switch to Easter season to maximize egg drops
    if (
        Game.hasBuff("Cookie storm") &&
        Game.season !== "easter" &&
        !haveAll("easter")
    ) {
        Game.UpgradesById[209].buy();
        logEvent("autoEaster", "Swapping to Easter season for Cookie Storm");
    }
}

function autoHalloweenAction() {
    // Only act if autoHalloween is enabled, not in Valentines/Easter/Halloween, and not all Halloween cookies collected
    // Also require that the season switcher is unlocked (Upgrade ID 181)
    if (
        !FrozenCookies.autoHalloween ||
        ["valentines", "easter", "halloween"].includes(Game.season) ||
        haveAll("halloween") ||
        !Game.UpgradesById[181] ||
        Game.UpgradesById[181].unlocked !== 1
    ) {
        return;
    }

    // If there are live wrinklers and not in Easter/Halloween, switch to Halloween for wrinkler drops
    const living = liveWrinklers();
    if (
        living.length > 0 &&
        Game.season !== "easter" &&
        Game.season !== "halloween" &&
        !haveAll("halloween")
    ) {
        Game.UpgradesById[183].buy();
        logEvent(
            "autoHalloween",
            "Swapping to Halloween season to use wrinklers"
        );
    }
}

function autoBlacklistOff() {
    // Automatically disables the selected blacklist when its condition is met
    switch (FrozenCookies.blacklist) {
        case 1: // SPEEDRUN: disable after 1 million cookies earned
            if (Game.cookiesEarned >= 1e6) FrozenCookies.blacklist = 0;
            break;
        case 2: // HARDCORE: disable after 1 billion cookies earned
            if (Game.cookiesEarned >= 1e9) FrozenCookies.blacklist = 0;
            break;
        case 3: // GRANDMAPOCALYPSE: disable after all Halloween and Easter cookies collected
            if (haveAll("halloween") && haveAll("easter"))
                FrozenCookies.blacklist = 0;
            break;
    }
}
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
function autoSugarFrenzyAction() {
    // Only proceed if autoSugarFrenzy is enabled, enough sugar lumps, and Sugar Craving is unlocked but Sugar Frenzy not yet bought
    const canBuy =
        ((FrozenCookies.autoSugarFrenzy === 1 &&
            auto100ConsistencyComboAction.state === 2) ||
            (FrozenCookies.autoSugarFrenzy === 2 &&
                (autoFTHOFComboAction.state === 3 ||
                    auto100ConsistencyComboAction.state === 2))) &&
        ((!FrozenCookies.sugarBakingGuard && Game.lumps > 0) ||
            Game.lumps > 100) &&
        cpsBonus() >= FrozenCookies.minASFMult &&
        Game.UpgradesById[450] &&
        Game.UpgradesById[450].unlocked === 1 &&
        Game.UpgradesById[452] &&
        Game.UpgradesById[452].bought === 0 &&
        ((!Game.hasBuff("Loan 1 (interest)") &&
            !Game.hasBuff("Loan 2 (interest)") &&
            !Game.hasBuff("Loan 3 (interest)")) ||
            !FrozenCookies.minLoanMult);

    if (canBuy) {
        Game.UpgradesById[452].buy();
        Game.ConfirmPrompt();
        logEvent("autoSugarFrenzy", "Started a Sugar Frenzy this ascension");
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

function buyOtherUpgrades() {
    if (blacklist[FrozenCookies.blacklist].upgrades === true) return true;

    // List of upgrades to auto-buy, with optional conditions
    var upgradesToBuy = [
        "Faberge egg",
        "Wrinklerspawn",
        "Omelette",
        '"egg"',
        "Weighted sleighs",
        "Santa's bottomless bag",
        "Dragon fang",
        "Dragon teddy bear",
        "Sacrificial rolling pins",
        "Green yeast digestives",
        "Fern tea",
        "Ichor syrup",
        "Fortune #102",
    ];

    upgradesToBuy.forEach((name) => {
        var upg = Game.Upgrades[name];
        if (!upg) return;

        // Special conditions for some upgrades
        if (
            (name === "Weighted sleighs" ||
                name === "Santa's bottomless bag") &&
            Game.season !== "christmas"
        )
            return;
        if (
            (name === "Dragon fang" || name === "Dragon teddy bear") &&
            Game.dragonLevel <= 26
        )
            return;
        if (
            name === "Sacrificial rolling pins" &&
            Game.Upgrades["Elder Pact"].bought !== 1
        )
            return;

        if (
            upg.unlocked === 1 &&
            !upg.bought &&
            Game.cookies > upg.getPrice()
        ) {
            upg.buy();
        }
    });
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
function recommendedSettingsAction() {
    if (FrozenCookies.recommendedSettings !== 1) return;

    // Clicking options
    Object.assign(FrozenCookies, {
        autoClick: 1,
        cookieClickSpeed: 250,
        autoFrenzy: 1,
        frenzyClickSpeed: 1000,
        autoGC: 1,
        autoReindeer: 1,
        autoFortune: 1,
        // Autobuy options
        autoBuy: 1,
        otherUpgrades: 1,
        autoBlacklistOff: 0,
        blacklist: 0,
        mineLimit: 1,
        mineMax: 500,
        factoryLimit: 1,
        factoryMax: 500,
        pastemode: 0,
        // Other auto options
        autoAscendToggle: 0,
        autoAscend: 2,
        comboAscend: 0,
        HCAscendAmount: 0,
        autoBulk: 2,
        autoBuyAll: 1,
        autoWrinkler: 1,
        shinyPop: 0,
        autoSL: 2,
        dragonsCurve: 2,
        sugarBakingGuard: 1,
        autoGS: 1,
        autoGodzamok: 1,
        autoBank: 1,
        autoBroker: 1,
        autoLoan: 1,
        minLoanMult: 777,
        // Pantheon options
        autoWorshipToggle: 1,
        autoWorship0: 2, // Godzamok
        autoWorship1: 8, // Mokalsium
        autoWorship2: 6, // Muridal
        autoCyclius: 0,
        // Spell options
        towerLimit: 1,
        manaMax: 37,
        autoCasting: 3,
        minCpSMult: 7,
        autoFTHOFCombo: 0,
        auto100ConsistencyCombo: 0,
        autoSugarFrenzy: 0,
        minASFMult: 7777,
        autoSweet: 0,
        // Dragon options
        autoDragon: 1,
        petDragon: 1,
        autoDragonToggle: 1,
        autoDragonAura0: 3, // Elder Battalion
        autoDragonAura1: 15, // Radiant Appetite
        autoDragonOrbs: 0,
        orbLimit: 0,
        orbMax: 200,
        // Season options
        defaultSeasonToggle: 1,
        defaultSeason: 1,
        freeSeason: 1,
        autoEaster: 1,
        autoHalloween: 1,
        // Bank options
        holdSEBank: 0,
        setHarvestBankPlant: 0,
        setHarvestBankType: 3,
        maxSpecials: 1,
        // Other options
        FCshortcuts: 1,
        simulatedGCPercent: 1,
        // Display options
        showMissedCookies: 0,
        numberDisplay: 1,
        fancyui: 1,
        logging: 1,
        purchaseLog: 0,
        fpsModifier: 2,
        trackStats: 0,
    });

    logEvent("recommendedSettings", "Set all options to recommended values");
    FrozenCookies.recommendedSettings = 0;
    Game.toSave = true;
    Game.toReload = true;
}
// Probability utilities for golden cookies and reindeer
function generateProbabilities(mult, minBase, maxMult) {
    const minTime = minBase * mult;
    const maxTime = maxMult * minTime;
    const spanTime = maxTime - minTime;
    let remaining = 1;
    const cumProb = [];
    for (let i = 0; i < maxTime; i++) {
        const thisFrame =
            remaining * Math.pow(Math.max(0, (i - minTime) / spanTime), 5);
        remaining -= thisFrame;
        cumProb.push(1 - remaining);
    }
    return cumProb;
}

const cumulativeProbabilityList = {
    golden: [1, 0.95, 0.5, 0.475, 0.25, 0.2375].reduce((r, x) => {
        r[x] = generateProbabilities(x, 5 * 60 * Game.fps, 3);
        return r;
    }, {}),
    reindeer: [1, 0.5].reduce((r, x) => {
        r[x] = generateProbabilities(x, 3 * 60 * Game.fps, 2);
        return r;
    }, {}),
};

function getProbabilityModifiers(type) {
    if (type === "golden") {
        return (
            (Game.Has("Lucky day") ? 0.5 : 1) *
            (Game.Has("Serendipity") ? 0.5 : 1) *
            (Game.Has("Golden goose egg") ? 0.95 : 1)
        );
    }
    if (type === "reindeer") {
        return Game.Has("Reindeer baking grounds") ? 0.5 : 1;
    }
    return 1;
}

function getProbabilityList(type) {
    return cumulativeProbabilityList[type][getProbabilityModifiers(type)];
}

function cumulativeProbability(type, start, stop) {
    const list = getProbabilityList(type);
    return 1 - (1 - list[stop]) / (1 - list[start]);
}

function probabilitySpan(type, start, endProb) {
    const list = getProbabilityList(type);
    const startProb = list[start];
    // Find the index where cumulative probability reaches the target
    const target = startProb + endProb - startProb * endProb;
    for (let i = start; i < list.length; i++) {
        if (list[i] >= target) return i;
    }
    return list.length - 1;
}

function clickBuffBonus() {
    // Returns the total click multiplier from all active buffs except Devastation (Godzamok), which is too variable.
    let multiplier = 1;
    for (const buff of Object.values(Game.buffs)) {
        if (typeof buff.multClick === "number" && buff.name !== "Devastation") {
            multiplier *= buff.multClick;
        }
    }
    return multiplier;
}

// Returns the current total CpS multiplier from all active buffs.
// Ignores click buffs (handled separately).
// @returns {number} The combined CpS multiplier (>= 1).
function cpsBonus() {
    let multiplier = 1;
    for (const buff of Object.values(Game.buffs)) {
        if (typeof buff.multCpS === "number") {
            multiplier *= buff.multCpS;
        }
    }
    return multiplier;
}

function hasClickBuff() {
    // Returns true if any click-based buff is active (Click frenzy, Dragonflight, Cursed finger, etc.)
    // Cursed finger is a click buff, but disables clicking, so treat it as a click buff for logic
    // Also checks for any buff that increases click multiplier
    return (
        Game.hasBuff("Click frenzy") ||
        Game.hasBuff("Dragonflight") ||
        Game.hasBuff("Cursed finger") ||
        clickBuffBonus() > 1
    );
}
// --- Improved CpS and Value Calculation Utilities ---

/**
 * Returns the base CpS (cookies per second) without buffs.
 * Uses cached value if all CpS buffs are disabled.
 */
function baseCps() {
    let buffMod = 1;
    for (const buff of Object.values(Game.buffs)) {
        if (typeof buff.multCpS === "number") buffMod *= buff.multCpS;
    }
    if (buffMod === 0) return FrozenCookies.lastBaseCPS;
    const baseCPS = Game.cookiesPs / buffMod;
    FrozenCookies.lastBaseCPS = baseCPS;
    return baseCPS;
}

/**
 * Returns the effective CpS from clicking, factoring out click and frenzy buffs.
 * @param {number} clickSpeed - Clicks per second.
 */
function baseClickingCps(clickSpeed) {
    const clickFrenzyMod = clickBuffBonus();
    const frenzyMod = Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1;
    const cpc = Game.mouseCps() / (clickFrenzyMod * frenzyMod);
    return clickSpeed * cpc;
}

/**
 * Returns the total effective CpS, including base, golden cookie, clicking, and reindeer.
 * @param {number} [delay] - Banked cookies for golden cookie value.
 * @param {number} [wrathValue] - Elder Wrath value.
 * @param {number} [wrinklerCount] - Number of wrinklers.
 */
function effectiveCps(delay, wrathValue, wrinklerCount) {
    wrathValue = wrathValue ?? Game.elderWrath;
    wrinklerCount = wrinklerCount ?? (wrathValue ? 10 : 0);
    const wrinkler = wrinklerMod(wrinklerCount);
    delay = delay ?? delayAmount();
    return (
        baseCps() * wrinkler +
        gcPs(cookieValue(delay, wrathValue, wrinklerCount)) +
        baseClickingCps(
            FrozenCookies.cookieClickSpeed * FrozenCookies.autoClick
        ) +
        reindeerCps(wrathValue)
    );
}

/**
 * Returns the probability of a Frenzy golden cookie for the given wrath value.
 */
function frenzyProbability(wrathValue) {
    wrathValue = wrathValue ?? Game.elderWrath;
    return cookieInfo.frenzy.odds[wrathValue];
}

/**
 * Returns the probability of a Clot golden cookie for the given wrath value.
 */
function clotProbability(wrathValue) {
    wrathValue = wrathValue ?? Game.elderWrath;
    return cookieInfo.clot.odds[wrathValue];
}

/**
 * Returns the probability of a Blood Frenzy golden cookie for the given wrath value.
 */
function bloodProbability(wrathValue) {
    wrathValue = wrathValue ?? Game.elderWrath;
    return cookieInfo.blood.odds[wrathValue];
}

/**
 * Calculates the expected value of a golden cookie, given a bank amount and game state.
 * @param {number} bankAmount - Cookies banked.
 * @param {number} [wrathValue] - Elder Wrath value.
 * @param {number} [wrinklerCount] - Number of wrinklers.
 */
function cookieValue(bankAmount, wrathValue, wrinklerCount) {
    const cps = baseCps();
    const clickCps = baseClickingCps(
        FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed
    );
    const frenzyCps = FrozenCookies.autoFrenzy
        ? baseClickingCps(
              FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed
          )
        : clickCps;
    const luckyMod = Game.Has("Get lucky") ? 2 : 1;
    wrathValue = wrathValue ?? Game.elderWrath;
    wrinklerCount = wrinklerCount ?? (wrathValue ? 10 : 0);
    const wrinkler = wrinklerMod(wrinklerCount);

    let value = 0;
    // Clot
    value -=
        cookieInfo.clot.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        66 *
        0.5;
    // Frenzy
    value +=
        cookieInfo.frenzy.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        77 *
        6;
    // Blood
    value +=
        cookieInfo.blood.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        6 *
        665;
    // Chain
    value +=
        cookieInfo.chain.odds[wrathValue] *
        calculateChainValue(bankAmount, cps, 7 - wrathValue / 3);
    // Ruin
    value -=
        cookieInfo.ruin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13);
    // Frenzy + Ruin
    value -=
        cookieInfo.frenzyRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13);
    // Clot + Ruin
    value -=
        cookieInfo.clotRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13);
    // Lucky
    value +=
        cookieInfo.lucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15) + 13);
    // Frenzy + Lucky
    value +=
        cookieInfo.frenzyLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 7) + 13);
    // Clot + Lucky
    value +=
        cookieInfo.clotLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 0.5) + 13);
    // Click
    value +=
        cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
    // Frenzy + Click
    value +=
        cookieInfo.frenzyClick.odds[wrathValue] *
        frenzyCps *
        luckyMod *
        13 *
        777 *
        7;
    // Clot + Click
    value +=
        cookieInfo.clotClick.odds[wrathValue] *
        frenzyCps *
        luckyMod *
        13 *
        777 *
        0.5;
    // Blah
    return value;
}

/**
 * Returns a breakdown of expected golden cookie values by effect.
 */
function cookieStats(bankAmount, wrathValue, wrinklerCount) {
    const cps = baseCps();
    const clickCps = baseClickingCps(
        FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed
    );
    const frenzyCps = FrozenCookies.autoFrenzy
        ? baseClickingCps(
              FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed
          )
        : clickCps;
    const luckyMod = Game.Has("Get lucky") ? 2 : 1;
    wrathValue = wrathValue ?? Game.elderWrath;
    wrinklerCount = wrinklerCount ?? (wrathValue ? 10 : 0);
    const wrinkler = wrinklerMod(wrinklerCount);

    return {
        clot:
            -cookieInfo.clot.odds[wrathValue] *
            (wrinkler * cps + clickCps) *
            luckyMod *
            66 *
            0.5,
        frenzy:
            cookieInfo.frenzy.odds[wrathValue] *
            (wrinkler * cps + clickCps) *
            luckyMod *
            77 *
            7,
        blood:
            cookieInfo.blood.odds[wrathValue] *
            (wrinkler * cps + clickCps) *
            luckyMod *
            666 *
            6,
        chain:
            cookieInfo.chain.odds[wrathValue] *
            calculateChainValue(bankAmount, cps, 7 - wrathValue / 3),
        ruin:
            -cookieInfo.ruin.odds[wrathValue] *
            (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13),
        frenzyRuin:
            -cookieInfo.frenzyRuin.odds[wrathValue] *
            (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13),
        clotRuin:
            -cookieInfo.clotRuin.odds[wrathValue] *
            (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13),
        lucky:
            cookieInfo.lucky.odds[wrathValue] *
            (Math.min(bankAmount * 0.15, cps * 60 * 15) + 13),
        frenzyLucky:
            cookieInfo.frenzyLucky.odds[wrathValue] *
            (Math.min(bankAmount * 0.15, cps * 60 * 15 * 7) + 13),
        clotLucky:
            cookieInfo.clotLucky.odds[wrathValue] *
            (Math.min(bankAmount * 0.15, cps * 60 * 15 * 0.5) + 13),
        click:
            cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777,
        frenzyClick:
            cookieInfo.frenzyClick.odds[wrathValue] *
            frenzyCps *
            luckyMod *
            13 *
            777 *
            7,
        clotClick:
            cookieInfo.clotClick.odds[wrathValue] *
            frenzyCps *
            luckyMod *
            13 *
            777 *
            0.5,
        blah: 0,
    };
}

/**
 * Returns the expected value of a reindeer, based on current season and buffs.
 */
function reindeerValue(wrathValue) {
    if (Game.season !== "christmas") return 0;
    wrathValue = wrathValue ?? Game.elderWrath;
    const remaining =
        1 -
        (frenzyProbability(wrathValue) +
            clotProbability(wrathValue) +
            bloodProbability(wrathValue));
    const outputMod = Game.Has("Ho ho ho-flavored frosting") ? 2 : 1;
    const base = baseCps() * outputMod * 60;

    return (
        Math.max(25, base * 7) * frenzyProbability(wrathValue) +
        Math.max(25, base * 0.5) * clotProbability(wrathValue) +
        Math.max(25, base * 666) * bloodProbability(wrathValue) +
        Math.max(25, base) * remaining
    );
}

/**
 * Returns the effective CpS from reindeer, averaged over spawn time.
 */
function reindeerCps(wrathValue) {
    const averageTime = probabilitySpan("reindeer", 0, 0.5) / Game.fps;
    return (
        (reindeerValue(wrathValue) / averageTime) *
        FrozenCookies.simulatedGCPercent
    );
}

/**
 * Calculates the value of a Cookie Chain golden cookie.
 */
function calculateChainValue(bankAmount, cps, digit) {
    const x = Math.min(bankAmount, cps * 60 * 60 * 6 * 4);
    const n = Math.floor(Math.log((9 * x) / (4 * digit)) / Math.LN10);
    return 125 * Math.pow(9, n - 3) * digit;
}

/**
 * Returns the value of a chocolate egg, if available and not yet bought.
 * @param {number} [bankAmount] - Cookies banked.
 * @param {boolean} [earthShatter] - Whether Earth Shatterer aura is active.
 */
function chocolateValue(bankAmount, earthShatter) {
    if (!Game.HasUnlocked("Chocolate egg") || Game.Has("Chocolate egg"))
        return 0;
    bankAmount = bankAmount ?? Game.cookies;
    let sellRatio = 0.25;
    let highestBuilding = 0;
    if (earthShatter == null) {
        if (Game.hasAura("Earth Shatterer")) sellRatio = 0.5;
    } else if (earthShatter) {
        sellRatio = 0.5;
        if (!Game.hasAura("Earth Shatterer")) {
            for (const i in Game.Objects) {
                if (Game.Objects[i].amount > 0)
                    highestBuilding = Game.Objects[i];
            }
        }
    }
    return (
        0.05 *
        (wrinklerValue() +
            bankAmount +
            Game.ObjectsById.reduce((s, b) => {
                return (
                    s +
                    cumulativeBuildingCost(
                        b.basePrice,
                        1,
                        (b === highestBuilding ? b.amount : b.amount + 1) -
                            b.free
                    ) *
                        sellRatio
                );
            }, 0))
    );
}

/**
 * Returns the total value of all wrinklers if popped.
 */
function wrinklerValue() {
    return Game.wrinklers.reduce((s, w) => s + popValue(w), 0);
}

/**
 * Returns the cookies needed to reach a target building amount.
 */
function buildingRemaining(building, amount) {
    const cost = cumulativeBuildingCost(
        building.basePrice,
        building.amount,
        amount
    );
    let availableCookies =
        Game.cookies +
        wrinklerValue() +
        Game.ObjectsById.reduce((s, b) => {
            return (
                s +
                (b.name === building.name
                    ? 0
                    : cumulativeBuildingCost(b.basePrice, 1, b.amount + 1) / 2)
            );
        }, 0);
    if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        availableCookies *= 1.05;
    }
    return Math.max(0, cost - availableCookies);
}

/**
 * Returns the cookies needed to reach a total earned value.
 */
function earnedRemaining(total) {
    return Math.max(
        0,
        total - (Game.cookiesEarned + wrinklerValue() + chocolateValue())
    );
}

/**
 * Returns a formatted string for the estimated time to earn the given cookies.
 */
function estimatedTimeRemaining(cookies) {
    return timeDisplay(cookies / effectiveCps());
}
/**
 * Returns true if Spontaneous Edifice (SE) can be cast:
 * - Magic meter is at least 80
 * - At least 1 "You" building is owned
 */
function canCastSE() {
    return M && M.magicM >= 80 && Game.Objects["You"].amount > 0;
}

/**
 * Returns the bank required to cast Spontaneous Edifice (SE).
 * Takes into account the "Everything must go" buff for discount.
 * Returns 0 if SE cannot be cast.
 */
function edificeBank() {
    if (!canCastSE()) return 0;
    const youObj = Game.Objects["You"];
    const baseCost = youObj.price;
    // If "Everything must go" buff is active, building prices are reduced by 5%
    const cost = Game.hasBuff("Everything must go")
        ? baseCost / 0.95 / 2
        : baseCost / 2;
    return cost;
}

// --- Improved Bank Calculation and Efficiency Utilities ---

/**
 * Returns the minimum cookies required for a "Lucky" golden cookie payout.
 * @returns {number}
 */
function luckyBank() {
    // 60 seconds * 100 = 6000 seconds of base CpS
    return baseCps() * 60 * 100;
}

/**
 * Returns the minimum cookies required for a "Lucky" golden cookie payout during Frenzy.
 * Includes the price of "Get lucky" if not already owned.
 * @returns {number}
 */
function luckyFrenzyBank() {
    let bank = baseCps() * 60 * 100 * 7;
    // Add price of "Get lucky" if not owned (upgrade id 86)
    if (!Game.Has("Get lucky")) {
        bank += Game.UpgradesById[86].getPrice();
    }
    return bank;
}

/**
 * Returns the minimum cookies required for a Cookie Chain golden cookie payout.
 * @returns {number}
 */
function chainBank() {
    // More exact calculation based on digit and CpS
    const digit = 7 - Math.floor(Game.elderWrath / 3);
    const maxChain = Math.floor(
        Math.log((194400 * baseCps()) / digit) / Math.LN10
    );
    return 4 * Math.floor((digit / 9) * Math.pow(10, maxChain));
    // Fallback: baseCps() * 60 * 60 * 6 * 4;
}

/**
 * Calculates the bank required for optimal plant harvesting (e.g., Bakeberry, Queenbeet, etc.).
 * Returns 0 if not enabled.
 * @returns {number}
 */
function harvestBank() {
    if (!FrozenCookies.setHarvestBankPlant) return 0;

    // Reset harvest parameters
    FrozenCookies.harvestMinutes = 0;
    FrozenCookies.harvestMaxPercent = 0;
    FrozenCookies.harvestFrenzy = 1;
    FrozenCookies.harvestBuilding = 1;
    FrozenCookies.harvestPlant = "";

    // Set frenzy multiplier for certain bank types
    if (
        FrozenCookies.setHarvestBankType == 1 ||
        FrozenCookies.setHarvestBankType == 3
    )
        FrozenCookies.harvestFrenzy = 7;

    // Set building multiplier for certain bank types
    if (
        FrozenCookies.setHarvestBankType == 2 ||
        FrozenCookies.setHarvestBankType == 3
    ) {
        // Get building amounts, sort descending, multiply top N
        const amounts = Game.ObjectsById.map((obj) => obj.amount).sort(
            (a, b) => b - a
        );
        FrozenCookies.harvestBuilding = 1;
        for (let i = 0; i < (FrozenCookies.maxSpecials || 1); i++) {
            FrozenCookies.harvestBuilding *= amounts[i] || 1;
        }
    }

    // Set plant-specific parameters
    switch (FrozenCookies.setHarvestBankPlant) {
        case 1: // Bakeberry
            FrozenCookies.harvestPlant = "Bakeberry";
            FrozenCookies.harvestMinutes = 30;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
        case 2: // Chocoroot
            FrozenCookies.harvestPlant = "Chocoroot";
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
        case 3: // White Chocoroot
            FrozenCookies.harvestPlant = "White Chocoroot";
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
        case 4: // Queenbeet
            FrozenCookies.harvestPlant = "Queenbeet";
            FrozenCookies.harvestMinutes = 60;
            FrozenCookies.harvestMaxPercent = 0.04;
            break;
        case 5: // Duketater
            FrozenCookies.harvestPlant = "Duketater";
            FrozenCookies.harvestMinutes = 120;
            FrozenCookies.harvestMaxPercent = 0.08;
            break;
        case 6: // Crumbspore
            FrozenCookies.harvestPlant = "Crumbspore";
            FrozenCookies.harvestMinutes = 1;
            FrozenCookies.harvestMaxPercent = 0.01;
            break;
        case 7: // Doughshroom
            FrozenCookies.harvestPlant = "Doughshroom";
            FrozenCookies.harvestMinutes = 5;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
    }

    if (!FrozenCookies.maxSpecials) FrozenCookies.maxSpecials = 1;

    // Calculate required bank
    return (
        (baseCps() *
            60 *
            FrozenCookies.harvestMinutes *
            FrozenCookies.harvestFrenzy *
            FrozenCookies.harvestBuilding) /
        Math.pow(10, FrozenCookies.maxSpecials) /
        FrozenCookies.harvestMaxPercent
    );
}

/**
 * Calculates the efficiency of banking cookies for golden cookie value.
 * @param {number} startingPoint - Current cookies.
 * @param {number} bankAmount - Target bank amount.
 * @returns {number}
 */
function cookieEfficiency(startingPoint, bankAmount) {
    let result = Number.MAX_VALUE;
    const currentValue = cookieValue(startingPoint);
    const bankValue = cookieValue(bankAmount);
    const bankCps = gcPs(bankValue);
    if (bankCps > 0) {
        if (bankAmount <= startingPoint) {
            result = 0;
        } else {
            const cost = Math.max(0, bankAmount - startingPoint);
            const deltaCps = gcPs(bankValue - currentValue);
            result = divCps(cost, deltaCps);
        }
    } else if (bankAmount <= startingPoint) {
        result = 0;
    }
    return result;
}

/**
 * Returns the best bank to use for golden cookie value, SE, or plant harvests.
 * @param {number} minEfficiency - Minimum efficiency to consider.
 * @returns {{cost: number, efficiency: number}}
 */
function bestBank(minEfficiency) {
    const edifice =
        FrozenCookies.autoCasting == 5 || FrozenCookies.holdSEBank
            ? edificeBank()
            : 0;
    // Consider 0, lucky, lucky frenzy, and harvest banks
    const bankLevels = [0, luckyBank(), luckyFrenzyBank(), harvestBank()]
        .sort((a, b) => b - a)
        .map((bank) => ({
            cost: bank,
            efficiency: cookieEfficiency(Game.cookies, bank),
        }))
        .filter(
            (bank) =>
                (bank.efficiency >= 0 && bank.efficiency <= minEfficiency) ||
                FrozenCookies.setHarvestBankPlant
        );
    if (
        bankLevels.length &&
        (bankLevels[0].cost > edifice || FrozenCookies.setHarvestBankPlant)
    )
        return bankLevels[0];
    return {
        cost: edifice,
        efficiency: 1,
    };
}

// Improved weightedCookieValue: more readable, accurate, and comments added
function weightedCookieValue(useCurrent) {
    const cps = baseCps();
    const luckyMod = Game.Has("Get lucky");
    // Base values for golden and wrath cookies (from game formulas)
    let baseWrath = luckyMod ? 401.835 * cps : 396.51 * cps;
    let baseGolden = luckyMod ? 2804.76 * cps : 814.38 * cps;

    // Add Cookie Chain expected value if enough cookies earned
    if (Game.cookiesEarned >= 100000) {
        let remainingProb = 1;
        let chainValue = 6666;
        let rollingEstimate = 0;
        // Estimate expected value of Cookie Chain (up to 12 digits)
        for (
            let i = 5;
            i < Math.min(Math.floor(Game.cookies).toString().length, 12);
            i++
        ) {
            chainValue = chainValue * 10 + 6; // e.g. 66666, 666666, etc.
            rollingEstimate += 0.1 * remainingProb * chainValue;
            remainingProb -= remainingProb * 0.1;
        }
        rollingEstimate += remainingProb * chainValue;
        // Add expected chain value to golden/wrath cookies (empirical multipliers)
        baseGolden += rollingEstimate * 0.0033;
        baseWrath += rollingEstimate * 0.0595;
    }

    // Adjust for current bank if below max Lucky payout
    if (useCurrent && Game.cookies < maxLuckyBank()) {
        const luckyValue = maxLuckyValue();
        const cookies = Game.cookies;
        if (luckyMod) {
            // Golden cookies: subtract expected value lost due to not being at max Lucky
            baseGolden -=
                (900 * cps - Math.min(900 * cps, cookies * 0.15)) * 0.245 +
                (luckyValue - cookies * 0.15) * 0.245;
        } else {
            baseGolden -= (luckyValue - cookies * 0.15) * 0.49;
            baseWrath -= (luckyValue - cookies * 0.15) * 0.29;
        }
    }

    // Weighted average based on Elder Wrath state
    return (
        (Game.elderWrath / 3) * baseWrath +
        ((3 - Game.elderWrath) / 3) * baseGolden
    );
}

// Returns the maximum possible Lucky golden cookie payout value based on current CpS and upgrades.
function maxLuckyValue() {
    // "Get lucky" doubles the payout cap from 900 to 6300 CpS.
    const luckyMultiplier = Game.Has("Get lucky") ? 6300 : 900;
    return baseCps() * luckyMultiplier;
}

// Returns the minimum bank required to guarantee max Lucky payout (with or without "Get lucky").
function maxLuckyBank() {
    // If "Get lucky" is owned, use the Lucky Frenzy bank; otherwise, use the normal Lucky bank.
    return Game.Has("Get lucky") ? luckyFrenzyBank() : luckyBank();
}

// Returns the maximum time (in frames) a golden cookie can stay on screen.
function maxCookieTime() {
    return Game.shimmerTypes.golden.maxTime;
}

// Returns the effective CpS from golden cookies, averaged over spawn time and adjusted for user simulation percent.
function gcPs(gcValue) {
    // Calculate the average time (in seconds) between golden cookies for a 50% cumulative probability.
    const averageGCTime = probabilitySpan("golden", 0, 0.5) / Game.fps;
    // Avoid division by zero.
    if (averageGCTime <= 0) return 0;
    // Normalize value per second and scale by simulatedGCPercent.
    return (gcValue / averageGCTime) * FrozenCookies.simulatedGCPercent;
}

// Returns the efficiency (time to bank) for reaching max Lucky value via golden cookies.
function gcEfficiency() {
    const gcPsValue = gcPs(weightedCookieValue());
    if (gcPsValue <= 0) return Number.POSITIVE_INFINITY;
    // Cost to reach 10x max Lucky payout, or 0 if already above.
    const cost = Math.max(0, maxLuckyValue() * 10 - Game.cookies);
    // Delta CpS is the difference in golden cookie value between max and current bank.
    const deltaCps = gcPs(weightedCookieValue() - weightedCookieValue(true));
    // Avoid division by zero or negative delta.
    if (deltaCps <= 0) return Number.POSITIVE_INFINITY;
    return divCps(cost, deltaCps);
}

// Returns the amount of cookies to delay purchases for optimal banking.
// If no valid bank is found, returns 0.
function delayAmount() {
    const bank = bestBank(nextChainedPurchase().efficiency);
    return bank && isFinite(bank.cost) && bank.cost > 0 ? bank.cost : 0;
}

/**
 * Returns true if all holiday cookies for the given holiday are unlocked.
 * @param {string} holiday - The holiday name ("easter", "halloween", etc.)
 * @returns {boolean}
 */
function haveAll(holiday) {
    if (!holidayCookies[holiday]) return false;
    return holidayCookies[holiday].every((id) => {
        const upg = Game.UpgradesById[id];
        return upg && upg.unlocked === 1;
    });
}

// Improved checkPrices: clearer logic, better variable names, robust handling
function checkPrices(currentUpgrade) {
    let value = 0;
    const recList = FrozenCookies.caches.recommendationList;
    if (recList && recList.length > 0) {
        // Find the next recommendation that isn't the current upgrade
        let nextRec = recList.find((rec) => rec.id !== currentUpgrade.id);
        if (!nextRec) return 0;

        // If nextRec is an upgrade with prerequisites, find the first unmet prereq in the list
        if (nextRec.type === "upgrade") {
            const prereqs = unfinishedUpgradePrereqs(nextRec.purchase);
            if (prereqs && prereqs.length > 0) {
                // Find the first prereq that is also in the recommendation list
                const nextPrereqRec = recList.find((a) =>
                    prereqs.some((b) => b.id === a.id && b.type === a.type)
                );
                if (nextPrereqRec) nextRec = nextPrereqRec;
            }
        }

        // Calculate the price reduction from discounts
        if (typeof nextRec.cost === "number") {
            const discount = totalDiscount(nextRec.type === "building");
            value = nextRec.cost / discount - nextRec.cost;
        }
    }
    return value;
}

// Optimized purchase efficiency calculation
function purchaseEfficiency(price, deltaCps, baseDeltaCps, currentCps) {
    if (deltaCps <= 0) return Number.POSITIVE_INFINITY;
    // Use weighted sum of time to afford and time to recoup investment
    return (
        FrozenCookies.efficiencyWeight * divCps(price, currentCps) +
        divCps(price, deltaCps)
    );
}

// Returns a sorted, scored list of all available purchases (upgrades, buildings, santa)
function recommendationList(recalculate) {
    if (recalculate) {
        FrozenCookies.showAchievements = false;
        let list = [
            ...upgradeStats(true),
            ...buildingStats(true),
            ...santaStats(),
        ].sort((a, b) =>
            a.efficiency !== b.efficiency
                ? a.efficiency - b.efficiency
                : b.delta_cps - a.delta_cps || a.cost - b.cost
        );
        if (FrozenCookies.pastemode) list.reverse();
        FrozenCookies.caches.recommendationList = addScores(list);
        FrozenCookies.showAchievements = true;
    }
    return FrozenCookies.caches.recommendationList;
}

// Assigns a normalized efficiencyScore to each recommendation for UI
function addScores(recommendations) {
    const filtered = recommendations.filter((a) => isFinite(a.efficiency));
    if (filtered.length > 0) {
        const min = Math.log(filtered[0].efficiency);
        const max = Math.log(filtered[filtered.length - 1].efficiency);
        const spread = max - min || 1;
        recommendations.forEach((rec, i) => {
            if (isFinite(rec.efficiency)) {
                recommendations[i].efficiencyScore =
                    1 - (Math.log(rec.efficiency) - min) / spread;
            } else {
                recommendations[i].efficiencyScore = 0;
            }
        });
    } else {
        recommendations.forEach((rec, i) => {
            recommendations[i].efficiencyScore = 0;
        });
    }
    return recommendations;
}

// Returns the next recommended purchase, considering prerequisites
function nextPurchase(recalculate) {
    if (recalculate) {
        FrozenCookies.showAchievements = false;
        const recList = recommendationList(true);
        let purchase = null,
            target = null;
        for (let i = 0; i < recList.length; ++i) {
            target = recList[i];
            if (
                target.type === "upgrade" &&
                unfinishedUpgradePrereqs(Game.UpgradesById[target.id])
            ) {
                const prereqList = unfinishedUpgradePrereqs(
                    Game.UpgradesById[target.id]
                );
                purchase = recList.find((a) =>
                    prereqList.some((b) => b.id === a.id && b.type === a.type)
                );
            } else {
                purchase = target;
            }
            if (purchase) {
                FrozenCookies.caches.nextPurchase = purchase;
                FrozenCookies.caches.nextChainedPurchase = target;
                break;
            }
        }
        if (!purchase) {
            FrozenCookies.caches.nextPurchase = defaultPurchase();
            FrozenCookies.caches.nextChainedPurchase = defaultPurchase();
        }
        FrozenCookies.showAchievements = true;
    }
    return FrozenCookies.caches.nextPurchase;
}

function nextChainedPurchase(recalculate) {
    nextPurchase(recalculate);
    return FrozenCookies.caches.nextChainedPurchase;
}

// Returns stats for all buildings, skipping blacklisted or capped ones
function buildingStats(recalculate) {
    if (recalculate) {
        if (blacklist[FrozenCookies.blacklist].buildings === true) {
            FrozenCookies.caches.buildings = [];
        } else {
            let buildingBlacklist = Array.from(
                blacklist[FrozenCookies.blacklist].buildings
            );
            // Block "You" if SE combo, Wizard tower if mana capped, etc.
            if (
                M &&
                FrozenCookies.autoCasting == 5 &&
                Game.Objects["You"].amount >= 399
            )
                buildingBlacklist.push(19);
            if (
                M &&
                FrozenCookies.towerLimit &&
                M.magicM >= FrozenCookies.manaMax
            )
                buildingBlacklist.push(7);
            if (
                FrozenCookies.mineLimit &&
                Game.Objects["Mine"].amount >= FrozenCookies.mineMax
            )
                buildingBlacklist.push(3);
            if (
                FrozenCookies.factoryLimit &&
                Game.Objects["Factory"].amount >= FrozenCookies.factoryMax
            )
                buildingBlacklist.push(4);
            if (
                FrozenCookies.autoDragonOrbs &&
                FrozenCookies.orbLimit &&
                Game.Objects["You"].amount >= FrozenCookies.orbMax
            )
                buildingBlacklist.push(19);

            FrozenCookies.caches.buildings = Game.ObjectsById.map((current) => {
                if (buildingBlacklist.includes(current.id)) return null;
                const currentBank = bestBank(0).cost;
                const baseCpsOrig = baseCps();
                const cpsOrig = effectiveCps(
                    Math.min(Game.cookies, currentBank)
                );
                const achievements = Object.values(Game.AchievementsById).map(
                    (a) => a.won
                );
                buildingToggle(current);
                const baseCpsNew = baseCps();
                const cpsNew = effectiveCps(currentBank);
                buildingToggle(current, achievements);
                const deltaCps = cpsNew - cpsOrig;
                const baseDeltaCps = baseCpsNew - baseCpsOrig;
                const efficiency = purchaseEfficiency(
                    current.getPrice(),
                    deltaCps,
                    baseDeltaCps,
                    cpsOrig
                );
                return {
                    id: current.id,
                    efficiency,
                    base_delta_cps: baseDeltaCps,
                    delta_cps: deltaCps,
                    cost: current.getPrice(),
                    purchase: current,
                    type: "building",
                };
            }).filter(Boolean);
        }
    }
    return FrozenCookies.caches.buildings;
}

// Returns stats for all upgrades, skipping blacklisted or unavailable ones
function upgradeStats(recalculate) {
    if (recalculate) {
        if (blacklist[FrozenCookies.blacklist].upgrades === true) {
            FrozenCookies.caches.upgrades = [];
        } else {
            const upgradeBlacklist =
                blacklist[FrozenCookies.blacklist].upgrades;
            FrozenCookies.caches.upgrades = Object.values(Game.UpgradesById)
                .map((current) => {
                    if (
                        !current.bought &&
                        !isUnavailable(current, upgradeBlacklist)
                    ) {
                        const currentBank = bestBank(0).cost;
                        const cost = upgradePrereqCost(current);
                        const baseCpsOrig = baseCps();
                        const cpsOrig = effectiveCps(
                            Math.min(Game.cookies, currentBank)
                        );
                        const achievements = Object.values(
                            Game.AchievementsById
                        ).map((a) => a.won);
                        const existingWrath = Game.elderWrath;
                        const discounts = totalDiscount() + totalDiscount(true);
                        const reverseFunctions = upgradeToggle(current);
                        const baseCpsNew = baseCps();
                        const cpsNew = effectiveCps(currentBank);
                        const priceReduction =
                            discounts === totalDiscount() + totalDiscount(true)
                                ? 0
                                : checkPrices(current);
                        upgradeToggle(current, achievements, reverseFunctions);
                        Game.elderWrath = existingWrath;
                        const deltaCps = cpsNew - cpsOrig;
                        const baseDeltaCps = baseCpsNew - baseCpsOrig;
                        let efficiency;
                        if (
                            current.season &&
                            FrozenCookies.defaultSeasonToggle == 1 &&
                            current.season ==
                                seasons[FrozenCookies.defaultSeason]
                        ) {
                            efficiency = cost / baseCpsOrig;
                        } else if (priceReduction > cost) {
                            efficiency = 1;
                        } else {
                            efficiency = purchaseEfficiency(
                                cost,
                                deltaCps,
                                baseDeltaCps,
                                cpsOrig
                            );
                        }
                        return {
                            id: current.id,
                            efficiency,
                            base_delta_cps: baseDeltaCps,
                            delta_cps: deltaCps,
                            cost,
                            purchase: current,
                            type: "upgrade",
                        };
                    }
                    return null;
                })
                .filter(Boolean);
        }
    }
    return FrozenCookies.caches.upgrades;
}

// Returns true if the upgrade should not be recommended
function isUnavailable(upgrade, upgradeBlacklist) {
    if (upgradeBlacklist === true) return true;
    if ([...upgradeBlacklist, ...recommendationBlacklist].includes(upgrade.id))
        return true;
    if (Game.Has("Inspired checklist") && Game.vault.includes(upgrade.id))
        return true;
    if (
        upgrade.id == 74 &&
        (Game.season == "halloween" || Game.season == "easter") &&
        !haveAll(Game.season)
    )
        return true;
    if (upgrade.id == 74 && FrozenCookies.shinyPop == 1) return true;
    if (App && upgrade.id == 816) return true;
    if (!App && upgrade.id == 817) return true;
    // Don't leave base season if it's desired
    if (
        [182, 183, 184, 185, 209].includes(upgrade.id) &&
        Game.baseSeason &&
        Game.UpgradesById[181].unlocked &&
        ((upgrade.id == 182 && haveAll("christmas")) ||
            (upgrade.id == 183 && haveAll("halloween")) ||
            (upgrade.id == 184 && haveAll("valentines")) ||
            (upgrade.id == 209 && haveAll("easter"))) &&
        (FrozenCookies.freeSeason == 2 ||
            (FrozenCookies.freeSeason == 1 &&
                ((Game.baseSeason == "christmas" && upgrade.id == 182) ||
                    (Game.baseSeason == "fools" && upgrade.id == 185))))
    )
        return true;

    // Prereqs
    const needed = unfinishedUpgradePrereqs(upgrade);
    if (!upgrade.unlocked && !needed) return true;
    if (needed && needed.some((a) => a.type == "wrinklers")) return true;
    if (
        needed &&
        needed.some((a) => a.type == "santa") &&
        "christmas" != Game.season &&
        !Game.UpgradesById[181].unlocked &&
        !Game.prestige
    )
        return true;
    if (
        upgrade.season &&
        (!haveAll(Game.season) ||
            (upgrade.season != seasons[FrozenCookies.defaultSeason] &&
                haveAll(upgrade.season)))
    )
        return true;

    return false;
}

// Returns a "purchase" object for the next Santa level, or [] if maxed
function santaStats() {
    if (
        Game.Has("A festive hat") &&
        Game.santaLevel + 1 < Game.santaLevels.length
    ) {
        return [
            {
                id: 0,
                efficiency: Infinity,
                base_delta_cps: 0,
                delta_cps: 0,
                cost: cumulativeSantaCost(1),
                type: "santa",
                purchase: {
                    id: 0,
                    name:
                        "Santa Stage Upgrade (" +
                        Game.santaLevels[
                            (Game.santaLevel + 1) % Game.santaLevels.length
                        ] +
                        ")",
                    buy: buySanta,
                    getCost: () => cumulativeSantaCost(1),
                },
            },
        ];
    }
    return [];
}

// Returns a dummy purchase object if nothing is available
function defaultPurchase() {
    return {
        id: 0,
        efficiency: Infinity,
        delta_cps: 0,
        base_delta_cps: 0,
        cost: Infinity,
        type: "other",
        purchase: {
            id: 0,
            name: "No valid purchases!",
            buy: function () {},
            getCost: () => Infinity,
        },
    };
}

// Returns the total discount multiplier for buildings or upgrades
function totalDiscount(building) {
    let price = 1;
    if (building) {
        if (Game.Has("Season savings")) price *= 0.99;
        if (Game.Has("Santa's dominion")) price *= 0.99;
        if (Game.Has("Faberge egg")) price *= 0.99;
        if (Game.Has("Divine discount")) price *= 0.99;
        if (Game.hasAura("Fierce Hoarder")) price *= 0.98;
        if (Game.hasBuff("Everything must go")) price *= 0.95;
    } else {
        if (Game.Has("Toy workshop")) price *= 0.95;
        if (Game.Has("Five-finger discount"))
            price *= Math.pow(0.99, Game.Objects["Cursor"].amount / 100);
        if (Game.Has("Santa's dominion")) price *= 0.98;
        if (Game.Has("Faberge egg")) price *= 0.99;
        if (Game.Has("Divine sales")) price *= 0.99;
        if (Game.hasAura("Master of the Armory")) price *= 0.98;
    }
    return price;
}

// Returns the total cost to buy buildings from startingNumber to endingNumber (exclusive)
function cumulativeBuildingCost(basePrice, startingNumber, endingNumber) {
    return (
        (basePrice *
            totalDiscount(true) *
            (Math.pow(Game.priceIncrease, endingNumber) -
                Math.pow(Game.priceIncrease, startingNumber))) /
        (Game.priceIncrease - 1)
    );
}

// Returns the total cost to buy the next N Santa levels
function cumulativeSantaCost(amount) {
    let total = 0;
    if (!amount) return 0;
    if (Game.santaLevel + amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= Game.santaLevel + amount; ++i)
            total += Math.pow(i, i);
    } else if (amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= amount; ++i)
            total += Math.pow(i, i);
    } else {
        total = Infinity;
    }
    return total;
}

// Returns the total cost to buy an upgrade and all its prerequisites
function upgradePrereqCost(upgrade, full) {
    let cost = upgrade.getPrice();
    if (upgrade.unlocked) return cost;
    const prereqs = upgradeJson[upgrade.id];
    if (prereqs) {
        cost += prereqs.buildings.reduce((sum, item, idx) => {
            const building = Game.ObjectsById[idx];
            if (item && full) {
                sum += cumulativeBuildingCost(building.basePrice, 0, item);
            } else if (item && building.amount < item) {
                sum += cumulativeBuildingCost(
                    building.basePrice,
                    building.amount,
                    item
                );
            }
            return sum;
        }, 0);
        cost += prereqs.upgrades.reduce((sum, item) => {
            const reqUpgrade = Game.UpgradesById[item];
            if (!upgrade.bought || full)
                sum += upgradePrereqCost(reqUpgrade, full);
            return sum;
        }, 0);
        cost += cumulativeSantaCost(prereqs.santa);
    }
    return cost;
}

// Returns a list of unmet prerequisites for an upgrade, or null if none
function unfinishedUpgradePrereqs(upgrade) {
    if (upgrade.unlocked) return null;
    let needed = [];
    const prereqs = upgradeJson[upgrade.id];
    if (prereqs) {
        prereqs.buildings.forEach((a, b) => {
            if (a && Game.ObjectsById[b].amount < a) {
                needed.push({ type: "building", id: b });
            }
        });
        prereqs.upgrades.forEach((a) => {
            if (!Game.UpgradesById[a].bought) {
                const recursiveUpgrade = Game.UpgradesById[a];
                const recursivePrereqs =
                    unfinishedUpgradePrereqs(recursiveUpgrade);
                if (recursiveUpgrade.unlocked) {
                    needed.push({ type: "upgrade", id: a });
                } else if (!recursivePrereqs) {
                    // Research is being done.
                } else {
                    recursivePrereqs.forEach((x) => {
                        if (
                            !needed.some(
                                (b) => b.id === x.id && b.type === x.type
                            )
                        )
                            needed.push(x);
                    });
                }
            }
        });
        if (prereqs.santa) needed.push({ type: "santa", id: 0 });
        if (prereqs.wrinklers && !Game.elderWrath)
            needed.push({ type: "wrinklers", id: 0 });
    }
    return needed.length ? needed : null;
}

// Simulates buying/unbuying an upgrade for efficiency calculation
function upgradeToggle(upgrade, achievements, reverseFunctions) {
    if (!achievements) {
        reverseFunctions = {};
        if (!upgrade.unlocked) {
            const prereqs = upgradeJson[upgrade.id];
            if (prereqs) {
                reverseFunctions.prereqBuildings = [];
                prereqs.buildings.forEach((a, b) => {
                    const building = Game.ObjectsById[b];
                    if (a && building.amount < a) {
                        const diff = a - building.amount;
                        reverseFunctions.prereqBuildings.push({
                            id: b,
                            amount: diff,
                        });
                        building.amount += diff;
                        building.bought += diff;
                        Game.BuildingsOwned += diff;
                    }
                });
                reverseFunctions.prereqUpgrades = [];
                if (prereqs.upgrades.length > 0) {
                    prereqs.upgrades.forEach((id) => {
                        const upg = Game.UpgradesById[id];
                        if (!upg.bought) {
                            reverseFunctions.prereqUpgrades.push({
                                id,
                                reverseFunctions: upgradeToggle(upg),
                            });
                        }
                    });
                }
            }
        }
        upgrade.bought = 1;
        Game.UpgradesOwned += 1;
        reverseFunctions.current = buyFunctionToggle(upgrade);
    } else {
        if (reverseFunctions.prereqBuildings) {
            reverseFunctions.prereqBuildings.forEach((b) => {
                const building = Game.ObjectsById[b.id];
                building.amount -= b.amount;
                building.bought -= b.amount;
                Game.BuildingsOwned -= b.amount;
            });
        }
        if (reverseFunctions.prereqUpgrades) {
            reverseFunctions.prereqUpgrades.forEach((u) => {
                const upg = Game.UpgradesById[u.id];
                upgradeToggle(upg, [], u.reverseFunctions);
            });
        }
        upgrade.bought = 0;
        Game.UpgradesOwned -= 1;
        buyFunctionToggle(reverseFunctions.current);
        Game.AchievementsOwned = 0;
        achievements.forEach((won, idx) => {
            const ach = Game.AchievementsById[idx];
            ach.won = won;
            if (won && ach.pool != "shadow") Game.AchievementsOwned += 1;
        });
    }
    Game.recalculateGains = 1;
    Game.CalculateGains();
    return reverseFunctions;
}

// Simulates buying/unbuying a building for efficiency calculation
function buildingToggle(building, achievements) {
    if (!achievements) {
        building.amount += 1;
        building.bought += 1;
        Game.BuildingsOwned += 1;
    } else {
        building.amount -= 1;
        building.bought -= 1;
        Game.BuildingsOwned -= 1;
        Game.AchievementsOwned = 0;
        achievements.forEach((won, idx) => {
            const ach = Game.AchievementsById[idx];
            ach.won = won;
            if (won && ach.pool != "shadow") Game.AchievementsOwned += 1;
        });
    }
    Game.recalculateGains = 1;
    Game.CalculateGains();
}

// Simulates the buyFunction of an upgrade for efficiency calculation
function buyFunctionToggle(upgrade) {
    if (upgrade && upgrade.id == 452) return null;
    if (upgrade && !upgrade.length) {
        if (!upgrade.buyFunction) return null;
        const ignorePatterns = [
            /Game\.Earn\('.*\)/,
            /Game\.Lock\('.*'\)/,
            /Game\.Unlock\(.*\)/,
            /Game\.Objects\['.*'\]\.drawFunction\(\)/,
            /Game\.Objects\['.*'\]\.redraw\(\)/,
            /Game\.SetResearch\('.*'\)/,
            /Game\.Upgrades\['.*'\]\.basePrice=.*/,
            /Game\.CollectWrinklers\(\)/,
            /Game\.RefreshBuildings\(\)/,
            /Game\.storeToRefresh=1/,
            /Game\.upgradesToRebuild=1/,
            /Game\.Popup\(.*\)/,
            /Game\.Notify\(.*\)/,
            /var\s+.+\s*=.+/,
            /Game\.computeSeasonPrices\(\)/,
            /Game\.seasonPopup\.reset\(\)/,
            /\S/,
        ];
        let buyFunctions = upgrade.buyFunction
            .toString()
            .replace(/[\n\r\s]+/g, " ")
            .replace(/function\s*\(\)\s*{(.+)\s*}/, "$1")
            .replace(/for\s*\(.+\)\s*\{.+\}/, "")
            .replace(
                /if\s*\(this\.season\)\s*Game\.season=this\.season\;/,
                'Game.season="' + upgrade.season + '";'
            )
            .replace(/if\s*\(.+\)\s*[^{}]*?\;/, "")
            .replace(/if\s*\(.+\)\s*\{.+\}/, "")
            .replace(/else\s+\(.+\)\s*\;/, "")
            .replace("++", "+=1")
            .replace("--", "-=1")
            .split(";")
            .map((a) => a.trim())
            .filter((a) => {
                ignorePatterns.forEach((b) => {
                    a = a.replace(b, "");
                });
                return a != "";
            });

        if (buyFunctions.length == 0) return null;

        let reversedFunctions = buyFunctions.map((a) => {
            let reversed = "";
            let achievementMatch = /Game\.Win\('(.*)'\)/.exec(a);
            if (a.indexOf("+=") > -1) {
                reversed = a.replace("+=", "-=");
            } else if (a.indexOf("-=") > -1) {
                reversed = a.replace("-=", "+=");
            } else if (
                achievementMatch &&
                Game.Achievements[achievementMatch[1]].won == 0
            ) {
                reversed =
                    "Game.Achievements['" + achievementMatch[1] + "'].won=0";
            } else if (a.indexOf("=") > -1) {
                let expression = a.split("=");
                let expressionResult = eval(expression[0]);
                let isString = typeof expressionResult === "string";
                reversed =
                    expression[0] +
                    "=" +
                    (isString ? "'" : "") +
                    expressionResult +
                    (isString ? "'" : "");
            }
            return reversed;
        });
        buyFunctions.forEach((f) => {
            try {
                eval(f);
            } catch {}
        });
        return reversedFunctions;
    } else if (upgrade && upgrade.length) {
        upgrade.forEach((f) => {
            try {
                eval(f);
            } catch {}
        });
    }
    return null;
}

// Buys the next Santa level
function buySanta() {
    Game.specialTab = "santa";
    Game.UpgradeSanta();
    if (Game.santaLevel + 1 >= Game.santaLevels.length)
        Game.ToggleSpecialMenu();
}

// Improved statSpeed: clearer, supports 0 (off), and uses a lookup table for maintainability
function statSpeed(trackStats = FrozenCookies.trackStats) {
    // Map trackStats values to milliseconds
    const speeds = {
        0: 0, // Off
        1: 60 * 1000, // 60s
        2: 30 * 60 * 1000, // 30m
        3: 60 * 60 * 1000, // 1h
        4: 24 * 60 * 60 * 1000, // 24h
    };
    return speeds[trackStats] || 0;
}

// Improved saveStats: avoids duplicate entries, keeps stats array size reasonable, and is more robust
function saveStats(fromGraph) {
    // Only push if time has changed (avoid duplicate entries)
    const now = Date.now() - Game.startDate;
    const last =
        FrozenCookies.trackedStats[FrozenCookies.trackedStats.length - 1];
    if (!last || last.time !== now) {
        FrozenCookies.trackedStats.push({
            time: now,
            baseCps: baseCps(),
            effectiveCps: effectiveCps(),
            hc: Game.HowMuchPrestige(
                Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
            ),
            actualClicks: Game.cookieClicks,
        });
        // Limit trackedStats to last 1000 entries to avoid memory bloat
        if (FrozenCookies.trackedStats.length > 1000) {
            FrozenCookies.trackedStats =
                FrozenCookies.trackedStats.slice(-1000);
        }
    }
    // Only update graph if visible and not called from graph
    if (
        $("#statGraphContainer").length > 0 &&
        !$("#statGraphContainer").is(":hidden") &&
        !fromGraph
    ) {
        viewStatGraphs();
    }
}

// Improved viewStatGraphs: more robust, handles empty stats, resizes dynamically, and avoids unnecessary redraws
function viewStatGraphs() {
    saveStats(true);
    let containerDiv = $("#statGraphContainer");
    if (!containerDiv.length) {
        containerDiv = $("<div>")
            .attr("id", "statGraphContainer")
            .html($("<div>").attr("id", "statGraphs"))
            .appendTo("body")
            .dialog({
                modal: true,
                title: "Frozen Cookies Tracked Stats",
                width: Math.floor($(window).width() * 0.8),
                height: Math.floor($(window).height() * 0.8),
                resize: function () {
                    // Redraw on resize
                    FrozenCookies.lastGraphDraw = 0;
                    viewStatGraphs();
                },
            });
    }
    if (containerDiv.is(":hidden")) containerDiv.dialog("open");
    // Only redraw if enough time has passed and there is data
    if (
        FrozenCookies.trackedStats.length > 0 &&
        Date.now() - (FrozenCookies.lastGraphDraw || 0) > 1000
    ) {
        FrozenCookies.lastGraphDraw = Date.now();
        $("#statGraphs").empty();
        // Prepare data for jqplot: three series (baseCps, effectiveCps, hc)
        const data = [[], [], []];
        FrozenCookies.trackedStats.forEach((s) => {
            data[0].push([s.time / 1000, s.baseCps]);
            data[1].push([s.time / 1000, s.effectiveCps]);
            data[2].push([s.time / 1000, s.hc]);
        });
        // Defensive: if all series are empty, skip plotting
        if (data.every((series) => series.length === 0)) return;
        $.jqplot("statGraphs", data, {
            legend: { show: true },
            height: containerDiv.height() - 50,
            axes: {
                xaxis: {
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                    tickOptions: {
                        angle: -30,
                        fontSize: "10pt",
                        showGridline: false,
                        formatter: function (_, val) {
                            return timeDisplay(val);
                        },
                    },
                },
                yaxis: {
                    padMin: 0,
                    renderer: $.jqplot.LogAxisRenderer,
                    tickDistribution: "even",
                    tickOptions: {
                        formatter: function (_, val) {
                            return Beautify(val);
                        },
                    },
                },
                y2axis: {
                    padMin: 0,
                    tickOptions: {
                        showGridline: false,
                        formatter: function (_, val) {
                            return Beautify(val);
                        },
                    },
                },
            },
            highlighter: {
                show: true,
                sizeAdjust: 15,
            },
            series: [
                { label: "Base CPS" },
                { label: "Effective CPS" },
                { label: "Earned HC", yaxis: "y2axis" },
            ],
        });
    }
}

function updateCaches() {
    // Updates key FrozenCookies caches and recalculates recommendations if needed.
    // Limits recalculation to avoid infinite loops.
    let recalcCount = 0;
    let recommendation,
        currentBank,
        targetBank,
        currentCookieCPS,
        currentUpgradeCount;

    do {
        recommendation = nextPurchase(FrozenCookies.recalculateCaches);
        FrozenCookies.recalculateCaches = false;

        currentBank = bestBank(0);
        targetBank = bestBank(recommendation.efficiency);
        currentCookieCPS = gcPs(cookieValue(currentBank.cost));
        currentUpgradeCount = Game.UpgradesInStore.length;

        FrozenCookies.safeGainsCalc();

        // If any tracked value has changed, mark caches for recalculation
        if (FrozenCookies.lastCPS !== FrozenCookies.calculatedCps) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastCPS = FrozenCookies.calculatedCps;
        }
        if (FrozenCookies.currentBank.cost !== currentBank.cost) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.currentBank = currentBank;
        }
        if (FrozenCookies.targetBank.cost !== targetBank.cost) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.targetBank = targetBank;
        }
        if (FrozenCookies.lastCookieCPS !== currentCookieCPS) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastCookieCPS = currentCookieCPS;
        }
        if (FrozenCookies.lastUpgradeCount !== currentUpgradeCount) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastUpgradeCount = currentUpgradeCount;
        }

        recalcCount++;
    } while (FrozenCookies.recalculateCaches && recalcCount < 10);
}

// Improved fcWin: robust, avoids duplicate unlocks, logs clearly, handles arrays, and prevents popup spam
function fcWin(what) {
    // Handle array input: unlock each achievement recursively
    if (Array.isArray(what)) {
        what.forEach(fcWin);
        return;
    }

    // Only process string achievement names
    if (typeof what !== "string" || !Game.Achievements[what]) return;

    const ach = Game.Achievements[what];
    if (ach.won) return; // Already unlocked

    ach.won = 1;
    if (ach.pool !== "shadow") Game.AchievementsOwned++;

    // Log and notify if not disabled
    if (!FrozenCookies.disabledPopups) {
        logEvent(
            "Achievement",
            `Achievement unlocked :<br>${ach.name}<br> `,
            true
        );
    }
    if (FrozenCookies.showAchievements) {
        Game.Notify(
            "Achievement unlocked",
            `<div class="title" style="font-size:18px;margin-top:-2px;">${
                ach.shortName || ach.name
            }</div>`,
            ach.icon
        );
        if (App && ach.vanilla) App.gotAchiev(ach.id);
    }
    Game.recalculateGains = 1;
}

// Improved logEvent: consistent formatting, optional popup, supports arrays, and logs to in-game log if available
function logEvent(event, text, popup) {
    const time = "[" + timeDisplay((Date.now() - Game.startDate) / 1000) + "]";
    let message =
        time +
        " " +
        event +
        ": " +
        (Array.isArray(text) ? text.join(" ") : text);

    // Log to console if enabled
    if (FrozenCookies.logging) {
        console.log(message);
    }

    // Log to in-game log if available (e.g., FCLog)
    if (typeof FCLog === "function") {
        FCLog(message);
    }

    // Show popup if requested and not disabled
    if (popup && !FrozenCookies.disabledPopups) {
        Game.Popup(Array.isArray(text) ? text.join("<br>") : text);
    }
}

// Utility: Check if a point (x, y) is inside a rotated rectangle
function inRect(x, y, rect) {
    // This duplicates an internal method from the game, needed for wrinkler logic.
    // rect: {x, y, w, h, r, o}
    // x, y: point to test
    // r: rotation (radians), o: offset
    // Returns true if (x, y) is inside the rectangle.
    const dx = x + Math.sin(-rect.r) * -(rect.h / 2 - rect.o);
    const dy = y + Math.cos(-rect.r) * -(rect.h / 2 - rect.o);
    const h1 = Math.sqrt(dx * dx + dy * dy);
    const currA = Math.atan2(dy, dx);
    const newA = currA - rect.r;
    const x2 = Math.cos(newA) * h1;
    const y2 = Math.sin(newA) * h1;
    return (
        x2 > -0.5 * rect.w &&
        x2 < 0.5 * rect.w &&
        y2 > -0.5 * rect.h &&
        y2 < 0.5 * rect.h
    );
}

// Smart stat tracking: dynamically adjusts delay based on purchase activity
function smartTrackingStats(delay) {
    saveStats();
    if (FrozenCookies.trackStats === 6) {
        // If no purchases, increase delay (up to minDelay), else halve delay (down to minDelay)
        if (FrozenCookies.delayPurchaseCount === 0) {
            delay = Math.max(FrozenCookies.minDelay, delay * 1.5);
        } else if (delay > FrozenCookies.minDelay) {
            delay = Math.max(FrozenCookies.minDelay, delay / 2);
        }
        FrozenCookies.smartTrackingBot = setTimeout(() => {
            smartTrackingStats(delay);
        }, delay);
        FrozenCookies.delayPurchaseCount = 0;
    }
}

// Returns an array of live wrinklers, sorted by most cookies sucked (descending)
function liveWrinklers() {
    // Use Array.prototype.filter and sort for clarity and performance
    return Game.wrinklers
        .filter((w) => w.sucked > 0.5 && w.phase > 0)
        .sort((a, b) => b.sucked - a.sucked);
}

// Calculates the wrinkler CpS multiplier for a given number of wrinklers
function wrinklerMod(num) {
    // 1.1 * n^2 * 0.05 * (Wrinklerspawn bonus) + (1 - 0.05 * n)
    let mod = 1.1 * num * num * 0.05;
    if (Game.Has("Wrinklerspawn")) mod *= 1.05;
    mod += 1 - 0.05 * num;
    return mod;
}

// Returns the cookie value of a single wrinkler, including all bonuses
function popValue(w) {
    let toSuck = 1.1;
    if (Game.Has("Sacrilegious corruption")) toSuck *= 1.05;
    if (w.type === 1) toSuck *= 3; // Shiny wrinkler bonus
    let sucked = w.sucked * toSuck;
    if (Game.Has("Wrinklerspawn")) sucked *= 1.05;
    return sucked;
}

// Determines which wrinklers should be popped for optimal play
function shouldPopWrinklers() {
    const living = liveWrinklers();
    if (living.length === 0) return [];

    // Pop all if in Halloween/Easter and not all cookies collected
    if (
        (Game.season === "halloween" || Game.season === "easter") &&
        !haveAll(Game.season)
    ) {
        return living.map((w) => w.id);
    }

    // Only pop enough to afford next purchase if it improves effectiveCps
    const delay = delayAmount();
    const nextPurchaseObj = nextPurchase();
    const neededCookies = nextPurchaseObj.cost + delay - Game.cookies;
    const nextRecCps = nextPurchaseObj.delta_cps;

    let total = 0;
    let ids = [];
    // Already sorted by most sucked first
    for (let i = 0; i < living.length; i++) {
        if (total >= neededCookies) break;
        // Simulate popping this wrinkler
        const futureWrinklers = living.length - (ids.length + 1);
        const futureCps =
            effectiveCps(delay, Game.elderWrath, futureWrinklers) + nextRecCps;
        if (futureCps > effectiveCps()) {
            ids.push(living[i].id);
            total += popValue(living[i]);
        } else {
            break;
        }
    }
    return total > neededCookies ? ids : [];
}

function autoFrenzyClick() {
    // Handles switching between normal and frenzy autoclicking based on click buffs.
    const isFrenzy = hasClickBuff();
    // If a click buff is active and not already running the frenzy clicker
    if (isFrenzy && !FrozenCookies.autoFrenzyBot) {
        if (FrozenCookies.autoclickBot) {
            clearInterval(FrozenCookies.autoclickBot);
            FrozenCookies.autoclickBot = 0;
        }
        FrozenCookies.autoFrenzyBot = setInterval(
            fcClickCookie,
            Math.max(1, 1000 / FrozenCookies.frenzyClickSpeed)
        );
    }
    // If click buff is gone, stop frenzy clicker and restore normal autoclick
    else if (!isFrenzy && FrozenCookies.autoFrenzyBot) {
        clearInterval(FrozenCookies.autoFrenzyBot);
        FrozenCookies.autoFrenzyBot = 0;
        if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
            FrozenCookies.autoclickBot = setInterval(
                fcClickCookie,
                Math.max(1, 1000 / FrozenCookies.cookieClickSpeed)
            );
        }
    }
}

function autoGSBuy() {
    // Automatically toggles Golden Switch based on click buffs.
    const gsOff = Game.Upgrades["Golden switch [off]"];
    const gsOn = Game.Upgrades["Golden switch [on]"];
    if (!gsOff.unlocked && !gsOn.unlocked) return;

    const clickBuff = hasClickBuff();
    const cursedFinger = Game.hasBuff("Cursed finger");

    // Turn ON Golden Switch if no click buff and it's not already on
    if (!clickBuff && gsOn.unlocked && !gsOn.bought) {
        Game.CalculateGains();
        gsOn.buy();
    }
    // Turn OFF Golden Switch if click buff is active (except Cursed finger) and it's not already off
    else if (clickBuff && !cursedFinger && gsOff.unlocked && !gsOff.bought) {
        gsOff.buy();
    }
}

function safeBuy(bldg, count = 1) {
    // Buys a building safely, temporarily switching to Buy mode if needed.
    count = Math.max(1, Math.floor(Number(count) || 1));
    const wasSellMode = Game.buyMode === -1;
    if (wasSellMode) Game.buyMode = 1;
    bldg.buy(count);
    if (wasSellMode) Game.buyMode = -1;
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

function goldenCookieLife() {
    const shimmer = Game.shimmers.find((s) => s.type === "golden");
    return shimmer ? shimmer.life : null;
}

function reindeerLife() {
    const shimmer = Game.shimmers.find((s) => s.type === "reindeer");
    return shimmer ? shimmer.life : null;
}

function fcClickCookie() {
    // Clicks the big cookie if not ascending or in a special tab
    if (!Game.OnAscend && !Game.AscendTimer && !Game.specialTabHovered) {
        Game.ClickCookie();
    }
}

function autoCookie() {
    // Main autobuy/autopop loop, runs every FrozenCookies.frequency ms
    if (FrozenCookies.processing || Game.OnAscend || Game.AscendTimer) {
        // If already processing or ascending, reschedule and exit
        if (FrozenCookies.frequency) {
            FrozenCookies.cookieBot = setTimeout(
                autoCookie,
                FrozenCookies.frequency
            );
        }
        return;
    }
    FrozenCookies.processing = true;

    // Track heavenly chips gain
    const currentHCAmount = Game.HowMuchPrestige(
        Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
    );
    if (Math.floor(FrozenCookies.lastHCAmount) < Math.floor(currentHCAmount)) {
        const changeAmount = currentHCAmount - FrozenCookies.lastHCAmount;
        FrozenCookies.lastHCAmount = currentHCAmount;
        FrozenCookies.prevLastHCTime = FrozenCookies.lastHCTime;
        FrozenCookies.lastHCTime = Date.now();
        const currHCPercent =
            (60 * 60 * (FrozenCookies.lastHCAmount - Game.heavenlyChips)) /
            ((FrozenCookies.lastHCTime - Game.startDate) / 1000);
        if (
            Game.heavenlyChips < currentHCAmount - changeAmount &&
            currHCPercent > FrozenCookies.maxHCPercent
        ) {
            FrozenCookies.maxHCPercent = currHCPercent;
        }
        FrozenCookies.hc_gain += changeAmount;
    }

    updateCaches();
    const recommendation = nextPurchase();
    const delay = delayAmount();

    // Sugar lump auto-harvest/auto-Rigidel
    if (FrozenCookies.autoSL) {
        const started = Game.lumpT;
        const ripeAge = Math.ceil(Game.lumpRipeAge);
        if (Date.now() - started >= ripeAge) {
            if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                autoDragonsCurve();
            } else {
                Game.clickLump();
            }
        }
    }
    if (FrozenCookies.autoSL == 2) autoRigidel();

    // Wrinkler popping logic
    if (FrozenCookies.autoWrinkler == 1) {
        let popCount = 0;
        const popList = shouldPopWrinklers();
        Game.wrinklers.forEach((w) => {
            if (
                popList.includes(w.id) &&
                (FrozenCookies.shinyPop != 1 || w.type !== 1)
            ) {
                w.hp = 0;
                popCount++;
            }
        });
        if (popCount > 0) logEvent("Wrinkler", `Popped ${popCount} wrinklers.`);
    } else if (FrozenCookies.autoWrinkler == 2) {
        let popCount = 0;
        Game.wrinklers.forEach((w) => {
            if (w.close && (FrozenCookies.shinyPop != 1 || w.type !== 1)) {
                w.hp = 0;
                popCount++;
            }
        });
        if (popCount > 0) logEvent("Wrinkler", `Popped ${popCount} wrinklers.`);
    }

    let itemBought = false;

    // Autobuy logic
    if (
        FrozenCookies.autoBuy &&
        (Game.cookies >= delay + recommendation.cost ||
            recommendation.purchase.name == "Elder Pledge") &&
        (FrozenCookies.pastemode || isFinite(nextChainedPurchase().efficiency))
    ) {
        recommendation.time = Date.now() - Game.startDate;
        recommendation.purchase.clickFunction = null;
        disabledPopups = false;

        // Buy all upgrades if possible and appropriate
        if (
            Math.floor(
                Game.HowMuchPrestige(Game.cookiesReset + Game.cookiesEarned)
            ) -
                Math.floor(Game.HowMuchPrestige(Game.cookiesReset)) <
                1 &&
            Game.Has("Inspired checklist") &&
            FrozenCookies.autoBuyAll &&
            nextPurchase().type == "upgrade" &&
            Game.cookies >= nextPurchase().cost &&
            ![
                "Bingo center/Research facility",
                "Specialized chocolate chips",
                "Designer cocoa beans",
                "Ritual rolling pins",
                "Underworld ovens",
                "One mind",
                "Exotic nuts",
                "Communal brainsweep",
                "Arcane sugar",
                "Elder Pact",
            ].includes(nextPurchase().purchase.name)
        ) {
            document.getElementById("storeBuyAllButton").click();
            logEvent("Autobuy", "Bought all upgrades!");
        }
        // Handle bulk buy logic for buildings
        else if (
            recommendation.type == "building" &&
            Game.buyBulk == 100 &&
            ((FrozenCookies.autoSpell == 3 &&
                recommendation.purchase.name == "You" &&
                Game.Objects["You"].amount >= 299) ||
                (M &&
                    FrozenCookies.towerLimit &&
                    recommendation.purchase.name == "Wizard tower" &&
                    M.magic >= FrozenCookies.manaMax - 10) ||
                (FrozenCookies.mineLimit &&
                    recommendation.purchase.name == "Mine" &&
                    Game.Objects["Mine"].amount >=
                        FrozenCookies.mineMax - 100) ||
                (FrozenCookies.factoryLimit &&
                    recommendation.purchase.name == "Factory" &&
                    Game.Objects["Factory"].amount >=
                        FrozenCookies.factoryMax - 100) ||
                (FrozenCookies.autoDragonOrbs &&
                    FrozenCookies.orbLimit &&
                    recommendation.purchase.name == "You" &&
                    Game.Objects["You"].amount >= FrozenCookies.orbMax - 100))
        ) {
            document.getElementById("storeBulk10").click();
            safeBuy(recommendation.purchase);
            document.getElementById("storeBulk100").click();
        } else if (
            recommendation.type == "building" &&
            Game.buyBulk == 10 &&
            ((FrozenCookies.autoSpell == 3 &&
                recommendation.purchase.name == "You" &&
                Game.Objects["You"].amount >= 389) ||
                (M &&
                    FrozenCookies.towerLimit &&
                    recommendation.purchase.name == "Wizard tower" &&
                    M.magic >= FrozenCookies.manaMax - 2) ||
                (FrozenCookies.mineLimit &&
                    recommendation.purchase.name == "Mine" &&
                    Game.Objects["Mine"].amount >=
                        FrozenCookies.mineMax - 10) ||
                (FrozenCookies.factoryLimit &&
                    recommendation.purchase.name == "Factory" &&
                    Game.Objects["Factory"].amount >=
                        FrozenCookies.factoryMax - 10) ||
                (FrozenCookies.autoDragonOrbs &&
                    FrozenCookies.orbLimit &&
                    recommendation.purchase.name == "You" &&
                    Game.Objects["You"].amount >= FrozenCookies.orbMax - 10))
        ) {
            document.getElementById("storeBulk1").click();
            safeBuy(recommendation.purchase);
            document.getElementById("storeBulk10").click();
        } else if (recommendation.type == "building") {
            safeBuy(recommendation.purchase);
        } else {
            recommendation.purchase.buy();
        }

        FrozenCookies.autobuyCount++;
        if (FrozenCookies.trackStats == 5 && recommendation.type == "upgrade") {
            saveStats();
        } else if (FrozenCookies.trackStats == 6) {
            FrozenCookies.delayPurchaseCount++;
        }
        if (FrozenCookies.purchaseLog == 1) {
            logEvent(
                "Store",
                `Autobought ${recommendation.purchase.name} for ${Beautify(
                    recommendation.cost
                )}, resulting in ${Beautify(recommendation.delta_cps)} CPS.`
            );
        }
        disabledPopups = true;
        if (FrozenCookies.autobuyCount >= 10) {
            Game.Draw();
            FrozenCookies.autobuyCount = 0;
        }
        FrozenCookies.recalculateCaches = true;
        itemBought = true;
    }

    // Auto-ascend logic
    function shouldAscend(type) {
        return (
            FrozenCookies.autoAscendToggle == 1 &&
            FrozenCookies.autoAscend == type &&
            !Game.OnAscend &&
            !Game.AscendTimer &&
            Game.prestige > 0 &&
            FrozenCookies.HCAscendAmount > 0 &&
            (FrozenCookies.comboAscend == 1 ||
                cpsBonus() < FrozenCookies.minCpSMult)
        );
    }
    if (shouldAscend(1)) {
        const resetPrestige = Game.HowMuchPrestige(
            Game.cookiesReset +
                Game.cookiesEarned +
                wrinklerValue() +
                chocolateValue()
        );
        if (resetPrestige - Game.prestige >= FrozenCookies.HCAscendAmount) {
            Game.ClosePrompt();
            Game.Ascend(1);
            setTimeout(() => {
                Game.ClosePrompt();
                Game.Reincarnate(1);
            }, 10000);
        }
    }
    if (shouldAscend(2)) {
        const resetPrestige = Game.HowMuchPrestige(
            Game.cookiesReset +
                Game.cookiesEarned +
                wrinklerValue() +
                chocolateValue()
        );
        if (resetPrestige >= Game.prestige * 2) {
            Game.ClosePrompt();
            Game.Ascend(1);
            setTimeout(() => {
                Game.ClosePrompt();
                Game.Reincarnate(1);
            }, 10000);
        }
    }

    // FPS adjustment
    const fps_amounts = [
        "15",
        "24",
        "30",
        "48",
        "60",
        "72",
        "88",
        "100",
        "120",
        "144",
        "200",
        "240",
        "300",
        "5",
        "10",
    ];
    const desiredFps = parseInt(fps_amounts[FrozenCookies["fpsModifier"]]);
    if (desiredFps != Game.fps) Game.fps = desiredFps;

    // Golden cookie/reindeer auto-click
    if (goldenCookieLife() && FrozenCookies.autoGC) {
        Game.shimmers.forEach((s) => {
            if (s.type == "golden") s.pop();
        });
    }
    if (reindeerLife() > 0 && FrozenCookies.autoReindeer) {
        Game.shimmers.forEach((s) => {
            if (s.type == "reindeer") s.pop();
        });
    }

    // Auto-blacklist-off
    if (FrozenCookies.autoBlacklistOff) autoBlacklistOff();

    // Frenzy tracking and logging
    const currentFrenzy = cpsBonus() * clickBuffBonus();
    if (currentFrenzy != FrozenCookies.last_gc_state) {
        if (FrozenCookies.last_gc_state != 1 && currentFrenzy == 1) {
            logEvent("GC", "Frenzy ended, cookie production x1");
            if (FrozenCookies.hc_gain) {
                logEvent(
                    "HC",
                    `Won ${
                        FrozenCookies.hc_gain
                    } heavenly chips during Frenzy. Rate: ${
                        (FrozenCookies.hc_gain * 1000) /
                        (Date.now() - FrozenCookies.hc_gain_time)
                    } HC/s.`
                );
                FrozenCookies.hc_gain_time = Date.now();
                FrozenCookies.hc_gain = 0;
            }
        } else {
            if (FrozenCookies.last_gc_state != 1) {
                logEvent(
                    "GC",
                    `Previous Frenzy x${FrozenCookies.last_gc_state} interrupted.`
                );
            } else if (FrozenCookies.hc_gain) {
                logEvent(
                    "HC",
                    `Won ${
                        FrozenCookies.hc_gain
                    } heavenly chips outside of Frenzy. Rate: ${
                        (FrozenCookies.hc_gain * 1000) /
                        (Date.now() - FrozenCookies.hc_gain_time)
                    } HC/s.`
                );
                FrozenCookies.hc_gain_time = Date.now();
                FrozenCookies.hc_gain = 0;
            }
            logEvent(
                "GC",
                `Starting ${
                    hasClickBuff() ? "Clicking " : ""
                }Frenzy x${currentFrenzy}`
            );
        }
        if (FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] == null)
            FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] = 0;
        FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] +=
            Date.now() - FrozenCookies.last_gc_time;
        FrozenCookies.last_gc_state = currentFrenzy;
        FrozenCookies.last_gc_time = Date.now();
    }

    FrozenCookies.processing = false;
    if (FrozenCookies.frequency) {
        FrozenCookies.cookieBot = setTimeout(
            autoCookie,
            itemBought ? 0 : FrozenCookies.frequency
        );
    }
}

function FCStart() {
    // Helper to clear an interval if it exists
    function clearFCInterval(name) {
        if (FrozenCookies[name]) {
            clearInterval(FrozenCookies[name]);
            FrozenCookies[name] = 0;
        }
    }

    // Helper to clear a timeout if it exists
    function clearFCTimeout(name) {
        if (FrozenCookies[name]) {
            clearTimeout(FrozenCookies[name]);
            FrozenCookies[name] = 0;
        }
    }

    // List of all interval/timer bot names to clear
    const botsToClear = [
        "cookieBot",
        "autoclickBot",
        "statBot",
        "autoGSBot",
        "autoGodzamokBot",
        "autoCastingBot",
        "autoFortuneBot",
        "autoFTHOFComboBot",
        "auto100ConsistencyComboBot",
        "autoSweetBot",
        "autoEasterBot",
        "autoHalloweenBot",
        "autoBankBot",
        "autoBrokerBot",
        "autoLoanBot",
        "autoDragonBot",
        "petDragonBot",
        "autoDragonAura0Bot",
        "autoDragonAura1Bot",
        "autoDragonOrbsBot",
        "autoSugarFrenzyBot",
        "autoWorship0Bot",
        "autoWorship1Bot",
        "autoWorship2Bot",
        "otherUpgradesBot",
        "autoCycliusBot",
        "recommendedSettingsBot",
    ];

    // Clear all intervals/timeouts
    botsToClear.forEach(clearFCInterval);
    clearFCTimeout("smartTrackingBot");

    // Set intervals for various actions
    function setFCBot(condition, name, fn, mult = 1) {
        if (condition) {
            FrozenCookies[name] = setInterval(
                fn,
                FrozenCookies.frequency * mult
            );
        }
    }

    if (FrozenCookies.frequency) {
        FrozenCookies.cookieBot = setTimeout(
            autoCookie,
            FrozenCookies.frequency
        );
    }

    setFCBot(
        FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed,
        "autoclickBot",
        () => fcClickCookie(),
        1000 / FrozenCookies.cookieClickSpeed / FrozenCookies.frequency
    );
    setFCBot(
        FrozenCookies.autoFrenzy && FrozenCookies.frenzyClickSpeed,
        "frenzyClickBot",
        autoFrenzyClick
    );
    setFCBot(FrozenCookies.autoGS, "autoGSBot", autoGSBuy);
    setFCBot(FrozenCookies.autoGodzamok, "autoGodzamokBot", autoGodzamokAction);
    setFCBot(FrozenCookies.autoCasting, "autoCastingBot", autoCast, 10);
    setFCBot(FrozenCookies.autoFortune, "autoFortuneBot", autoTicker, 10);
    setFCBot(
        FrozenCookies.autoFTHOFCombo,
        "autoFTHOFComboBot",
        autoFTHOFComboAction,
        2
    );
    setFCBot(
        FrozenCookies.auto100ConsistencyCombo,
        "auto100ConsistencyComboBot",
        auto100ConsistencyComboAction,
        2
    );
    setFCBot(FrozenCookies.autoSweet, "autoSweetBot", autoSweetAction, 2);
    setFCBot(FrozenCookies.autoEaster, "autoEasterBot", autoEasterAction);
    setFCBot(
        FrozenCookies.autoHalloween,
        "autoHalloweenBot",
        autoHalloweenAction
    );
    setFCBot(FrozenCookies.autoBank, "autoBankBot", autoBankAction);
    setFCBot(FrozenCookies.autoBroker, "autoBrokerBot", autoBrokerAction);
    setFCBot(FrozenCookies.autoLoan, "autoLoanBot", autoLoanBuy);
    setFCBot(FrozenCookies.autoDragon, "autoDragonBot", autoDragonAction);
    setFCBot(FrozenCookies.petDragon, "petDragonBot", petDragonAction, 2);
    setFCBot(
        FrozenCookies.autoDragonAura0,
        "autoDragonAura0Bot",
        autoDragonAura0Action
    );
    setFCBot(
        FrozenCookies.autoDragonAura1,
        "autoDragonAura1Bot",
        autoDragonAura1Action
    );
    setFCBot(
        FrozenCookies.autoDragonOrbs,
        "autoDragonOrbsBot",
        autoDragonOrbsAction,
        10
    );
    setFCBot(
        FrozenCookies.autoSugarFrenzy,
        "autoSugarFrenzyBot",
        autoSugarFrenzyAction,
        2
    );
    setFCBot(FrozenCookies.autoWorship0, "autoWorship0Bot", autoWorship0Action);
    setFCBot(FrozenCookies.autoWorship1, "autoWorship1Bot", autoWorship1Action);
    setFCBot(FrozenCookies.autoWorship2, "autoWorship2Bot", autoWorship2Action);
    setFCBot(FrozenCookies.otherUpgrades, "otherUpgradesBot", buyOtherUpgrades);
    setFCBot(FrozenCookies.autoCyclius, "autoCycliusBot", autoCycliusAction);
    setFCBot(
        FrozenCookies.recommendedSettings,
        "recommendedSettingsBot",
        recommendedSettingsAction
    );

    if (statSpeed(FrozenCookies.trackStats) > 0) {
        FrozenCookies.statBot = setInterval(
            saveStats,
            statSpeed(FrozenCookies.trackStats)
        );
    } else if (
        FrozenCookies.trackStats == 6 &&
        !FrozenCookies.smartTrackingBot
    ) {
        FrozenCookies.smartTrackingBot = setTimeout(function () {
            smartTrackingStats(FrozenCookies.minDelay * 8);
        }, FrozenCookies.minDelay);
    }

    FCMenu();
}
