// Add polyfills:
(function (global) {
  if (typeof Number.isFinite !== 'function') {
    Number.isFinite = value =>
      typeof value === "number" && global.isFinite(value);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);


function registerMod(modId = "frozen_cookies") {
  Game.registerMod(modId, {
    init() {
      // 🧙 Reincarnate Hook
      Game.registerHook("reincarnate", () => {
        if (!FrozenCookies.autoBulk) return;
        const buttonId = FrozenCookies.autoBulk === 1 ? "storeBulk10" : "storeBulk100";
        const button = document.getElementById(buttonId);
        if (button) button.click();
      });

      // ⏱️ Draw Hook
      Game.registerHook("draw", updateTimers);

      // 📰 Ticker Hook
      Game.registerHook("ticker", () => {
        const isFools = Game.season === "fools";
        const cookieThreshold = Game.cookiesEarned >= 1000;
        const purchase = nextPurchase();
        const bankCost = bestBank(nextChainedPurchase().efficiency).cost;

        const tickerMessages = [];

        const chance = Math.random();
        if (!isFools && chance < 0.3) {
          if (cookieThreshold) {
            tickerMessages.push(
              "News : debate about whether using Frozen Cookies constitutes cheating continues to rage. Violence escalating.",
              "News : Supreme Court rules Frozen Cookies not unauthorized cheating after all.",
              "News : Frozen Cookies considered 'cool'. Pun-haters heard groaning.",
              "News : Scientists baffled as cookies are now measured in 'efficiency' instead of calories.",
              "News : Cookie clickers debate: is it cheating if the bot is more efficient than you?",
              "News : Famous movie studio lets it go: no grounds found to freeze out Frozen Cookies."
            );
          }

          if (bankCost > 0) {
            tickerMessages.push(
              `You wonder if those ${Beautify(bankCost)} banked cookies are still fresh.`
            );
          }

          if (M) {
            tickerMessages.push(
              "News : Local wizards claim they can predict the next golden cookie, while munching on Frozen Cookies."
            );
          }

          if (T) {
            tickerMessages.push(
              "News : Cookie gods issue statement: 'Stop swapping us so much, we're getting dizzy!'"
            );
          }

          if (purchase.cost > 0) {
            tickerMessages.push(`You should buy ${purchase.purchase.name} next.`);
          }

        } else if (isFools && chance < 0.3) {
          tickerMessages.push(
            "Investigation into potential cheating with Frozen Cookies is blocked by your lawyers.",
            "Your Frozen Cookies are now available in stores everywhere.",
            "Cookie banks report record deposits, but nobody knows what a 'Lucky Bank' actually is.",
            "Cookie banks now offering 'Harvest Bank' accounts with 0% interest and infinite cookies.",
            "Cookie economy destabilized by mysterious entity known only as 'FrozenCookies'.",
            "Cookie market analysts confused by sudden spike in 'Purchase Efficiency'."
          );

          if (bankCost > 0) {
            tickerMessages.push(
              `You have ${Beautify(bankCost * 0.08)} cookie dollars just sitting in your wallet.`
            );
          }

          if (M) {
            tickerMessages.push(
              "Analyst report: Current business relation between Memes and spells is 'complicated'."
            );
          }

          if (T) {
            tickerMessages.push(
              "Likes and shares of Cookie Gods' social media accounts are at an all-time high."
            );
          }

          if (purchase.cost > 0) {
            const name =
              purchase.type === "building"
                ? Game.foolObjects[purchase.purchase.name].name
                : purchase.purchase.name;
            tickerMessages.push(`Your next investment: ${name}.`);
          }
        }

        return tickerMessages.length ? [tickerMessages[Math.floor(Math.random() * tickerMessages.length)]] : undefined;
      });

      // 🔄 Reset Hook
      Game.registerHook("reset", (hard) => {
        if (hard) emptyCaches();
      });
    },

    save: saveFCData,
    load: setOverrides,
  });

  if (!FrozenCookies.loadedData) setOverrides();

  logEvent(
    "Load",
    `Initial Load of Frozen Cookies v ${FrozenCookies.branch}.${FrozenCookies.version}. (You should only ever see this once.)`
  );
    // Only for now
    logEvent("Load", "Performance test loaded.");
}

// Initialize caches
if (!FrozenCookies.caches) FrozenCookies.caches = {};
// Track the game state to determine when our caches are invalid
FrozenCookies.upgradeCache = {
    upgradeCached: {}, // Store calculations for each upgrade ID
    cacheValid: false, // Whether cache is currently valid
    lastGameStateHash: "", // Hash representation of relevant game state
    recalculateCount: 0, // Number of consecutive recalculations (to prevent infinite loops)
};

// Initialize building efficiency cache with the same structure
FrozenCookies.buildingCache = {
    buildingCached: {}, // Store calculations for each building ID
    cacheValid: false, // Whether cache is currently valid
    lastGameStateHash: "", // Hash representation of relevant game state
    recalculateCount: 0, // Number of consecutive recalculations
};

function invalidateUpgradeCache() {
    // Mark the upgrade cache as invalid to force recalculation on next call
    if (FrozenCookies.upgradeCache) {
        FrozenCookies.upgradeCache.cacheValid = false;
    }
}

function invalidateBuildingCache() {
    // Mark the building cache as invalid to force recalculation on next call
    if (FrozenCookies.buildingCache) {
        FrozenCookies.buildingCache.cacheValid = false;
    }
}

// Helper function to generate a "hash" of the current game state that affects upgrade calculations
function getGameStateHash() {
    // Key aspects that would affect upgrade values
    return [
        Game.BuildingsOwned,
        Game.UpgradesOwned,
        Game.cookiesPs,
        Game.elderWrath,
        Object.keys(Game.buffs).length,
        // Track only unlocked upgrades for cache invalidation
        Object.values(Game.UpgradesById).filter((u) => !u.bought && u.unlocked)
            .length,
    ].join("|");
}


function setOverrides(gameSaveData) {
  FrozenCookies.loadedData = gameSaveData ? JSON.parse(gameSaveData) : {};
  initializeDefaults();
  applyPreferences();
  overrideGameFunctions();
  FCStart();
}

function initializeDefaults() {
  FrozenCookies.frequency = 100;
  FrozenCookies.efficiencyWeight = 1.0;
  FrozenCookies.timeTravelAmount = 0;
  FrozenCookies.autobuyCount = 0;
  FrozenCookies.hc_gain = 0;
  FrozenCookies.hc_gain_time = Date.now();
  FrozenCookies.last_gc_state =
    (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) * clickBuffBonus();
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
  FrozenCookies.processing = false;
  FrozenCookies.priceReductionTest = false;
  FrozenCookies.cookieBot = 0;
  FrozenCookies.autoclickBot = 0;
  FrozenCookies.autoFrenzyBot = 0;
  FrozenCookies.frenzyClickBot = 0;
  FrozenCookies.smartTrackingBot = 0;
  FrozenCookies.minDelay = 10000;
  FrozenCookies.delayPurchaseCount = 0;
  FrozenCookies.showAchievements = true;
  FrozenCookies.blacklist = blacklist[FrozenCookies.blacklist] ? FrozenCookies.blacklist : 0;
  if (!window.App) window.App = undefined;
  emptyCaches();
}

function applyPreferences() {
  const loadFCData = () => {
    for (const key of Object.keys(FrozenCookies.preferenceValues)) {
      FrozenCookies[key] = preferenceParse(key, FrozenCookies.preferenceValues[key].default);
    }

    Object.assign(FrozenCookies, {
      cookieClickSpeed: preferenceParse("cookieClickSpeed", 0),
      frenzyClickSpeed: preferenceParse("frenzyClickSpeed", 0),
      HCAscendAmount: preferenceParse("HCAscendAmount", 0),
      minCpSMult: preferenceParse("minCpSMult", 1),
      maxSpecials: preferenceParse("maxSpecials", 1),
      minLoanMult: preferenceParse("minLoanMult", 1),
      minASFMult: preferenceParse("minASFMult", 1),
      mineMax: preferenceParse("mineMax", 0),
      factoryMax: preferenceParse("factoryMax", 0),
      manaMax: preferenceParse("manaMax", 0),
      orbMax: preferenceParse("orbMax", 0),
      frenzyTimes: JSON.parse(FrozenCookies.loadedData.frenzyTimes || localStorage.getItem("frenzyTimes")) || {},
      lastHCAmount: preferenceParse("lastHCAmount", 0),
      lastHCTime: preferenceParse("lastHCTime", 0),
      prevLastHCTime: preferenceParse("prevLastHCTime", 0),
      maxHCPercent: preferenceParse("maxHCPercent", 0),
    });

    restoreLegacySettings();

    if (Object.keys(FrozenCookies.loadedData).length > 0) {
      logEvent("Load", "Restored Frozen Cookies settings from previous save");
    }
  };

  const preferenceParse = (setting, defaultVal) =>
    setting in FrozenCookies.loadedData
      ? Number(FrozenCookies.loadedData[setting])
      : Number(localStorage.getItem(setting) || defaultVal);

  const restoreLegacySettings = () => {
    const actions = [
      { key: "autoSweet", action: autoSweetAction },
      { key: "autoFTHOFCombo", action: autoFTHOFComboAction },
      { key: "auto100ConsistencyCombo", action: auto100ConsistencyComboAction },
    ];

    for (const { key, action } of actions) {
      if (!FrozenCookies[key]) {
        if (action.autobuyyes) {
          FrozenCookies.autoBuy = 1;
          action.autobuyyes = 0;
        }
        if (action.autogcyes) {
          FrozenCookies.autoGC = 1;
          action.autogcyes = 0;
        }
        if (action.autogodyes) {
          FrozenCookies.autoGodzamok = 1;
          action.autogodyes = 0;
        }
        if (action.autoworshipyes) {
          FrozenCookies.autoWorshipToggle = 1;
          action.autoworshipyes = 0;
        }
        if (action.autodragonyes) {
          FrozenCookies.autoDragonToggle = 1;
          action.autodragonyes = 0;
        }
      }
    }
  };

  loadFCData();
}

function overrideGameFunctions() {
  Beautify = fcBeautify;

  Game.sayTime = (time, detail) => timeDisplay(time / Game.fps);

  if (typeof Game.tooltip.oldDraw !== "function") {
    Game.tooltip.oldDraw = Game.tooltip.draw;
    Game.tooltip.draw = fcDraw;
  }

  if (typeof Game.oldReset !== "function") {
    Game.oldReset = Game.Reset;
    Game.Reset = fcReset;
  }

  Game.Win = fcWin;

  nextPurchase(true);
  Game.RefreshStore();
  Game.RebuildUpgrades();
  beautifyUpgradesAndAchievements();

  // Replace Game.Popup references
  Game.shimmerTypes.golden.popFunc = new Function(
    Game.shimmerTypes.golden.popFunc
      .toString()
      .replace(/Game\.Popup\((.+?)\);/g, 'logEvent("GC", $1, true);')
  );

  Game.UpdateWrinklers = new Function(
    Game.UpdateWrinklers.toString().replace(/Game\.Popup\((.+?)\);/g, 'logEvent("Wrinkler", $1, true);')
  );

  FrozenCookies.safeGainsCalc = new Function(
    Game.CalculateGains.toString()
      .replace(/eggMult\+=\(1.+/, "eggMult++; // CENTURY EGGS SUCK")
      .replace(/Game\.cookiesPs/g, "FrozenCookies.calculatedCps")
      .replace(/Game\.globalCpsMult/g, "mult")
  );

  if (!Game.HasAchiev("Third-party")) Game.Win("Third-party");
}

const decoder = document.createElement("textarea");

function decodeHtml(html) {
  decoder.innerHTML = html;
  const decoded = decoder.value;

  // Strip <script>, <iframe>, <img onerror>, and other potentially dangerous tags/attributes
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = decoded;

  // Remove script-like tags
  const dangerousTags = tempDiv.querySelectorAll("script, iframe, object, embed");
  dangerousTags.forEach(tag => tag.remove());

  // Remove dangerous attributes
  tempDiv.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || name === "href" && el.tagName === "BASE") {
        el.removeAttribute(attr.name);
      }
    });
  });

  return tempDiv.textContent || "";
}

function emptyCaches() {
  FrozenCookies.recalculateCaches = true;

  FrozenCookies.caches = {
    nextPurchase: {},
    recommendationList: [],
    buildings: [],
    upgrades: []
  };

    // Reset the upgrade cache
    FrozenCookies.upgradeCache = {
        upgradeCached: {}, // Store calculations for each upgrade ID
        cacheValid: false, // Whether cache is currently valid
        lastGameStateHash: "", // Hash representation of relevant game state
        recalculateCount: 0, // Number of consecutive recalculations
    };

    // Reset the building cache too
    FrozenCookies.buildingCache = {
        buildingCached: {}, // Store calculations for each building ID
        cacheValid: false, // Whether cache is currently valid
        lastGameStateHash: "", // Hash representation of relevant game state
        recalculateCount: 0, // Number of consecutive recalculations
    };
}


function fcDraw(from, text, origin) {
  if (typeof text === "string" && text.includes("Devastation")) {
    const devastationBuff = Game.hasBuff("Devastation") && Game.buffs["Devastation"];
    if (devastationBuff && devastationBuff.multClick) {
      const percentBoost = Math.round((devastationBuff.multClick - 1) * 100);
      text = text.replace(/\+\d+%/, `+${percentBoost}%`);
    }
  }
  Game.tooltip.oldDraw(from, text, origin);
}


function fcReset() {
  Game.CollectWrinklers();

  // 📉 Sell all stock market goods
  if (B?.goodsById?.length) {
    B.goodsById.forEach((_, index) => B.sellGood(index, 10000));
  }

  // 🌱 Harvest all plants
  G?.harvestAll?.();

  // 🍫 Handle Chocolate Egg logic
  const hasChocoEgg = Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg");

  if (Game.dragonLevel > 5 && hasChocoEgg && !Game.hasAura("Earth Shatterer")) {
    Game.specialTab = "dragon";
    Game.SetDragonAura(5, 0);
    Game.ConfirmPrompt();
    Game.ObjectsById.forEach(b => b.sell(-1));
    Game.Upgrades["Chocolate egg"].buy();
  } else if (hasChocoEgg) {
    Game.ObjectsById.forEach(b => b.sell(-1));
    Game.Upgrades["Chocolate egg"].buy();
  }

  // 🔄 Perform actual game reset
  Game.oldReset();

  // 🧠 Reset FrozenCookies tracking data
  const now = Date.now();
  const frenzyMult = Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1;

  Object.assign(FrozenCookies, {
    frenzyTimes: {},
    last_gc_state: frenzyMult * clickBuffBonus(),
    last_gc_time: now,
    lastHCAmount: Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset + wrinklerValue()),
    lastHCTime: now,
    prevLastHCTime: now,
    maxHCPercent: 0,
    lastCps: 0,
    lastBaseCps: 0,
    trackedStats: []
  });

  recommendationList(true);
}


function saveFCData() {
  const keysToSave = [
    ...Object.keys(FrozenCookies.preferenceValues),
    "frenzyClickSpeed",
    "cookieClickSpeed",
    "HCAscendAmount",
    "mineMax",
    "factoryMax",
    "manaMax",
    "orbMax",
    "minCpSMult",
    "minLoanMult",
    "minASFMult",
    "maxSpecials",
    "lastHCAmount",
    "maxHCPercent",
    "lastHCTime",
    "prevLastHCTime",
    "saveVersion"
  ];

  const saveString = {};

  keysToSave.forEach(key => {
    saveString[key] = FrozenCookies[key];
  });

  // Handle serialized fields separately
  saveString.frenzyTimes = JSON.stringify(FrozenCookies.frenzyTimes);

  return JSON.stringify(saveString);
}


function divCps(value = 0, cps = 0) {
  if (typeof value !== "number" || typeof cps !== "number") return NaN;
  if (!value) return 0;
  return cps ? value / cps : Number.POSITIVE_INFINITY;
}


function nextHC(showRaw = false) {
  const totalCookies = Game.cookiesEarned + Game.cookiesReset;
  const futureHC = Math.ceil(Game.HowMuchPrestige(totalCookies));
  const requiredCookies = Game.HowManyCookiesReset(futureHC);
  const cookiesToGo = requiredCookies - totalCookies;

  return showRaw ? cookiesToGo : timeDisplay(divCps(cookiesToGo, Game.cookiesPs));
}


function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {
    Game.promptOn = 1;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    Game.promptOn = 0;
  });
}

function getBuildingSpread() {
  return Game.ObjectsById.map(obj => obj.amount).join("/");
}

// 🔥 Keyboard Shortcut Map
const keyBindings = {
  65: () => {
    Game.Toggle("autoBuy", "autobuyButton", "Autobuy OFF", "Autobuy ON");
    toggleFrozen("autoBuy");
  },
  66: () => copyToClipboard(getBuildingSpread()),
  67: () => {
    Game.Toggle("autoGC", "autogcButton", "Autoclick GC OFF", "Autoclick GC ON");
    toggleFrozen("autoGC");
  },
  69: () => copyToClipboard(Game.WriteSave(true)),
  82: () => Game.Reset(),
  83: () => Game.WriteSave(),
  87: () => {
    Game.Notify(
      "Wrinkler Info",
      `Popping all wrinklers will give you ${Beautify(wrinklerValue())} cookies. 
      <input type="button" value="Click here to pop all wrinklers" onclick="Game.CollectWrinklers()">`,
      [19, 8],
      7
    );
  }
};

// 🎹 Shortcut Listener
document.addEventListener("keydown", event => {
  if (!Game.promptOn && FrozenCookies.FCshortcuts && keyBindings[event.keyCode]) {
    keyBindings[event.keyCode]();
  }
});


function writeFCButton(setting) {
  const current = FrozenCookies[setting];
  // Could use this to visually update buttons based on state later
}

// 📥 Generic input prompt with confirmation
function userInputPrompt(title, description, existingValue, callback) {
  Game.Prompt(
    `<h3>${title}</h3>
     <div class="block" style="text-align:center;">${description}</div>
     <div class="block">
       <input type="text" id="fcGenericInput" style="text-align:center;width:100%;" value="${existingValue}" />
     </div>`,
    ["Confirm", "Cancel"]
  );

  const input = document.getElementById("fcGenericInput");
  document.getElementById("promptOption0").addEventListener("click", () => {
    callback(input.value);
  });

  input.focus();
  input.select();
}

// 🛡️ Validate numerical input with optional bounds
function validateNumber(value, min = null, max = null) {
  const num = Number(value);
  return (
    !isNaN(num) &&
    (min === null || num >= min) &&
    (max === null || num <= max)
  );
}

// 🔄 Store validated number and restart
function storeNumberCallback(setting, min, max) {
  return (input) => {
    FrozenCookies[setting] = validateNumber(input, min, max)
      ? Number(input)
      : FrozenCookies[setting];
    FCStart();
  };
}

// 🧩 Unified update function
function createUpdatePrompt(setting, title, description, min, max) {
  userInputPrompt(title, description, FrozenCookies[setting], storeNumberCallback(setting, min, max));
}

// 🎯 Specific updates
function updateSpeed(base) {
  createUpdatePrompt(base, "Autoclicking!", "How many times per second do you want to click? (250 recommended, 1000 max)", 0, 1000);
}

function updateCpSMultMin(base) {
  createUpdatePrompt(base, "Autocasting!", 'What CpS multiplier should trigger Auto Casting? (e.g. "7" for Frenzy, "1" for clot)', 0, null);
}

function updateAscendAmount(base) {
  createUpdatePrompt(base, "Autoascending!", "How many heavenly chips do you want to auto-ascend at?", 1, null);
}

function updateManaMax(base) {
  createUpdatePrompt(base, "Mana Cap!", "Choose a maximum mana amount (100 max recommended)", 0, null);
}

function updateMaxSpecials(base) {
  createUpdatePrompt(base, "Harvest Bank!", "Set amount of stacked Building specials for Harvest Bank", 0, null);
}

function updateMineMax(base) {
  createUpdatePrompt(base, "Mine Cap!", "How many Mines should autoBuy stop at?", 0, null);
}

function updateFactoryMax(base) {
  createUpdatePrompt(base, "Factory Cap!", "How many Factories should autoBuy stop at?", 0, null);
}

function updateOrbMax(base) {
  createUpdatePrompt(base, "You Cap!", "How many Yous should autoBuy stop at?", 0, null);
}

function updateLoanMultMin(base) {
  createUpdatePrompt(base, "Loans!", 'What CpS multiplier should trigger loan use? (e.g. "7" for Frenzy, "500" for big buff)', 0, null);
}

function updateASFMultMin(base) {
  createUpdatePrompt(base, "Sugar Frenzy!", 'What CpS multiplier should trigger buying Sugar Frenzy? (e.g. "100", "1000")', 0, null);
}


function cyclePreference(preferenceName) {
  const preference = FrozenCookies.preferenceValues?.[preferenceName];
  if (!preference?.display?.length) return;

  const currentIndex = FrozenCookies[preferenceName] ?? 0;
  const newIndex = (currentIndex + 1) % preference.display.length;

  const button = document.getElementById(`${preferenceName}Button`);
  if (button) button.innerText = preference.display[newIndex];

  FrozenCookies[preferenceName] = newIndex;
  FrozenCookies.recalculateCaches = true;

  Game.RefreshStore();
  Game.RebuildUpgrades();
  FCStart();
}


function toggleFrozen(setting) {
  FrozenCookies[setting] = FrozenCookies[setting] ? 0 : 1;
  FCStart();
}


const {
  Farm: { minigame: G },
  Bank: { minigame: B },
  Temple: { minigame: T },
  "Wizard tower": { minigame: M }
} = Game.Objects;


function autoTicker() {
  const ticker = Game.TickerEffect;
  if (ticker?.type === "fortune") {
    Game.tickerL?.click?.();
  }
}

function autoEasterAction() {
  if (!FrozenCookies.autoEaster || Game.season === "easter" || haveAll("easter")) return;

  const switchUpgrade = Game.UpgradesById[209]; // Easter switch
  const seasonSwitchUnlocked = Game.UpgradesById[181]?.unlocked;

  if (Game.hasBuff("Cookie storm") && switchUpgrade && seasonSwitchUnlocked) {
    switchUpgrade.buy();
  }
}

function autoHalloweenAction() {
  if (
    !FrozenCookies.autoHalloween ||
    ["valentines", "easter", "halloween"].includes(Game.season) ||
    haveAll("halloween")
  ) return;

  const livingWrinks = liveWrinklers();
  const switchUpgrade = Game.UpgradesById[183]; // Halloween switch
  const seasonSwitchUnlocked = Game.UpgradesById[181]?.unlocked;

  if (livingWrinks.length > 0 && switchUpgrade && seasonSwitchUnlocked) {
    switchUpgrade.buy();
    logEvent("autoHalloween", "Swapping to Halloween season to use wrinklers");
  }
}

function autoBlacklistOff() {
  setTimeout(() => {
    switch (FrozenCookies.blacklist) {
      case 1:
        FrozenCookies.blacklist = Game.cookiesEarned >= 1_000_000 ? 0 : 1;
        break;
      case 2:
        FrozenCookies.blacklist = Game.cookiesEarned >= 1_000_000_000 ? 0 : 2;
        break;
      case 3:
        FrozenCookies.blacklist = haveAll("halloween") && haveAll("easter") ? 0 : 3;
        break;
    }
  }, 1000);
}


function recommendedSettingsAction() {
  if (FrozenCookies.recommendedSettings !== 1) return;

  const recommended = {
    // 🍪 Clicking options
    autoClick: 1,
    cookieClickSpeed: 250,
    autoFrenzy: 1,
    frenzyClickSpeed: 1000,
    autoGC: 1,
    autoReindeer: 1,
    autoFortune: 1,

    // 🛒 Autobuy options
    autoBuy: 1,
    otherUpgrades: 1,
    autoBlacklistOff: 0,
    blacklist: 0,
    mineLimit: 1,
    mineMax: 500,
    factoryLimit: 1,
    factoryMax: 500,
    pastemode: 0,

    // 🔄 Ascension and bulk purchasing
    autoAscendToggle: 0,
    autoAscend: 2,
    comboAscend: 0,
    HCAscendAmount: 0,
    autoBulk: 2,
    autoBuyAll: 1,

    // 🧟 Wrinkler & soul options
    autoWrinkler: 1,
    shinyPop: 0,
    autoSL: 2,
    dragonsCurve: 2,
    sugarBakingGuard: 1,
    autoGS: 1,
    autoGodzamok: 1,

    // 🏦 Stock market
    autoBank: 1,
    autoBroker: 1,
    autoLoan: 1,
    minLoanMult: 777,

    // ⛪ Pantheon options
    autoWorshipToggle: 1,
    autoWorship0: 2,
    autoWorship1: 8,
    autoWorship2: 6,
    autoCyclius: 0,

    // 🔮 Spellcasting
    towerLimit: 1,
    manaMax: 37,
    autoCasting: 3,
    minCpSMult: 7,
    autoFTHOFCombo: 0,
    auto100ConsistencyCombo: 0,
    autoSugarFrenzy: 0,
    minASFMult: 7777,
    autoSweet: 0,

    // 🐲 Dragon options
    autoDragon: 1,
    petDragon: 1,
    autoDragonToggle: 1,
    autoDragonAura0: 3,
    autoDragonAura1: 15,
    autoDragonOrbs: 0,
    orbLimit: 0,
    orbMax: 200,

    // 🎁 Seasons
    defaultSeasonToggle: 1,
    defaultSeason: 1,
    freeSeason: 1,
    autoEaster: 1,
    autoHalloween: 1,

    // 🌱 Bank & Harvest
    holdSEBank: 0,
    setHarvestBankPlant: 0,
    setHarvestBankType: 3,
    maxSpecials: 1,

    // 🔧 Other
    FCshortcuts: 1,
    simulatedGCPercent: 1,

    // 🖥️ Display
    showMissedCookies: 0,
    numberDisplay: 1,
    fancyui: 1,
    logging: 1,
    purchaseLog: 0,
    fpsModifier: 2,
    trackStats: 0
  };

  // 🧩 Apply recommended settings
  for (const [key, value] of Object.entries(recommended)) {
    FrozenCookies[key] = value;
  }

  // 📣 Log and flag reload
  logEvent("recommendedSettings", "Set all options to recommended values");
  FrozenCookies.recommendedSettings = 0;
  Game.toSave = true;
  Game.toReload = true;
}

function generateProbabilities(upgradeMult = 1, minBase = 1, maxMult = 2) {
  if (upgradeMult <= 0 || minBase <= 0 || maxMult < 1) return [];

  const minTime = Math.floor(minBase * upgradeMult);
  const maxTime = Math.floor(minTime * maxMult);
  const spanTime = maxTime - minTime;

  if (spanTime <= 0) return [];

  const probabilities = [];
  let remaining = 1;

  for (let t = 0; t < maxTime; t++) {
    const decayRate = Math.pow(Math.max(0, (t - minTime) / spanTime), 5);
    const frameProb = remaining * decayRate;
    remaining -= frameProb;
    probabilities.push(1 - remaining);
  }

  return probabilities;
}

const cumulativeProbabilityList = {
  golden: [1, 0.95, 0.5, 0.475, 0.25, 0.2375].reduce((acc, modifier) => {
    acc[modifier] = generateProbabilities(modifier, 5 * 60 * Game.fps, 3);
    return acc;
  }, {}),
  reindeer: [1, 0.5].reduce((acc, modifier) => {
    acc[modifier] = generateProbabilities(modifier, 3 * 60 * Game.fps, 2);
    return acc;
  }, {})
};

function getProbabilityModifiers(listType) {
  switch (listType) {
    case "golden":
      return (
        (Game.Has("Lucky day") ? 0.5 : 1) *
        (Game.Has("Serendipity") ? 0.5 : 1) *
        (Game.Has("Golden goose egg") ? 0.95 : 1)
      );
    case "reindeer":
      return Game.Has("Reindeer baking grounds") ? 0.5 : 1;
    default:
      return 1;
  }
}

function getProbabilityList(listType) {
  const modifier = getProbabilityModifiers(listType);
  const probList = cumulativeProbabilityList[listType]?.[modifier];
  return Array.isArray(probList) ? probList : [];
}

function cumulativeProbability(listType, start = 0, stop = 0) {
  const list = getProbabilityList(listType);
  const startVal = list[start] ?? 0;
  const stopVal = list[stop] ?? 0;

  if (startVal >= 1) return 0; // Avoid divide-by-zero

  return 1 - (1 - stopVal) / (1 - startVal);
}

function probabilitySpan(listType, start = 0, targetProb = 0) {
  const list = getProbabilityList(listType);
  const startVal = list[start] ?? 0;
  const targetVal = startVal + targetProb - startVal * targetProb;

  return _.sortedIndex(list, targetVal);
}

function clickBuffBonus() {
  return Object.values(Game.buffs)
    .filter(buff => typeof buff.multClick !== "undefined" && buff.name !== "Devastation")
    .reduce((mult, buff) => mult * buff.multClick, 1);
}

function cpsBonus() {
  return Object.values(Game.buffs)
    .filter(buff => typeof buff.multCpS !== "undefined")
    .reduce((mult, buff) => mult * buff.multCpS, 1);
}

function hasClickBuff() {
  return Game.hasBuff("Cursed finger") || clickBuffBonus() > 1;
}

function baseCps() {
  const buffMod = cpsBonus();
  if (buffMod === 0) return FrozenCookies.lastBaseCPS;

  const baseCPS = Game.cookiesPs / buffMod;
  FrozenCookies.lastBaseCPS = baseCPS;
  return baseCPS;
}

function baseClickingCps(clickSpeed) {
  const clickMod = clickBuffBonus();
  const frenzyMod = Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"]?.multCpS || 1 : 1;
  const cpc = Game.mouseCps() / (clickMod * frenzyMod);

  return clickSpeed * cpc;
}

function effectiveCps(delay = delayAmount(), wrathValue = Game.elderWrath, wrinklerCount = null) {
  const wrinks = wrinklerCount !== null ? wrinklerCount : wrathValue ? 10 : 0;
  const wrinkler = wrinklerMod(wrinks);

  return (
    baseCps() * wrinkler +
    gcPs(cookieValue(delay, wrathValue, wrinks)) +
    baseClickingCps(FrozenCookies.cookieClickSpeed * FrozenCookies.autoClick) +
    reindeerCps(wrathValue)
  );
}

function frenzyProbability(wrathValue = Game.elderWrath) {
  return cookieInfo?.frenzy?.odds?.[wrathValue] ?? 0;
}

function clotProbability(wrathValue = Game.elderWrath) {
  return cookieInfo?.clot?.odds?.[wrathValue] ?? 0;
}

function bloodProbability(wrathValue = Game.elderWrath) {
  return cookieInfo?.blood?.odds?.[wrathValue] ?? 0;
}

function cookieValue(bankAmount, wrathValue, wrinklerCount) {
    var cps = baseCps();
    var clickCps = baseClickingCps(
        FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed
    );
    var frenzyCps = FrozenCookies.autoFrenzy
        ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed)
        : clickCps;
    var luckyMod = Game.Has("Get lucky") ? 2 : 1;
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    wrinklerCount = wrinklerCount != null ? wrinklerCount : wrathValue ? 10 : 0;
    var wrinkler = wrinklerMod(wrinklerCount);

    var value = 0;
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
    value += cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
    // Frenzy + Click
    value +=
        cookieInfo.frenzyClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
    // Clot + Click
    value +=
        cookieInfo.clotClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
    // Blah
    value += 0;
    return value;
}

function cookieStats(bankAmount, wrathValue, wrinklerCount) {
    var cps = baseCps();
    var clickCps = baseClickingCps(
        FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed
    );
    var frenzyCps = FrozenCookies.autoFrenzy
        ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed)
        : clickCps;
    var luckyMod = Game.Has("Get lucky") ? 2 : 1;
    var clickFrenzyMod = clickBuffBonus();
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    wrinklerCount = wrinklerCount != null ? wrinklerCount : wrathValue ? 10 : 0;
    var wrinkler = wrinklerMod(wrinklerCount);

    var result = {};
    // Clot
    result.clot =
        -1 *
        cookieInfo.clot.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        66 *
        0.5;
    // Frenzy
    result.frenzy =
        cookieInfo.frenzy.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        77 *
        7;
    // Blood
    result.blood =
        cookieInfo.blood.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        666 *
        6;
    // Chain
    result.chain =
        cookieInfo.chain.odds[wrathValue] *
        calculateChainValue(bankAmount, cps, 7 - wrathValue / 3);
    // Ruin
    result.ruin =
        -1 *
        cookieInfo.ruin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13);
    // Frenzy + Ruin
    result.frenzyRuin =
        -1 *
        cookieInfo.frenzyRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13);
    // Clot + Ruin
    result.clotRuin =
        -1 *
        cookieInfo.clotRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13);
    // Lucky
    result.lucky =
        cookieInfo.lucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15) + 13);
    // Frenzy + Lucky
    result.frenzyLucky =
        cookieInfo.frenzyLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 7) + 13);
    // Clot + Lucky
    result.clotLucky =
        cookieInfo.clotLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 0.5) + 13);
    // Click
    result.click = cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
    // Frenzy + Click
    result.frenzyClick =
        cookieInfo.frenzyClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
    // Clot + Click
    result.clotClick =
        cookieInfo.clotClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
    // Blah
    result.blah = 0;
    return result;
}

function reindeerValue(wrathValue) {
    var value = 0;
    if (Game.season == "christmas") {
        var remaining =
            1 -
            (frenzyProbability(wrathValue) +
                clotProbability(wrathValue) +
                bloodProbability(wrathValue));
        var outputMod = Game.Has("Ho ho ho-flavored frosting") ? 2 : 1;

        value +=
            Math.max(25, baseCps() * outputMod * 60 * 7) * frenzyProbability(wrathValue);
        value +=
            Math.max(25, baseCps() * outputMod * 60 * 0.5) * clotProbability(wrathValue);
        value +=
            Math.max(25, baseCps() * outputMod * 60 * 666) * bloodProbability(wrathValue);
        value += Math.max(25, baseCps() * outputMod * 60) * remaining;
    }
    return value;
}

function reindeerCps(wrathValue) {
    var averageTime = probabilitySpan("reindeer", 0, 0.5) / Game.fps;
    return (reindeerValue(wrathValue) / averageTime) * FrozenCookies.simulatedGCPercent;
}

function calculateChainValue(bankAmount, cps, digit) {
    x = Math.min(bankAmount, cps * 60 * 60 * 6 * 4);
    n = Math.floor(Math.log((9 * x) / (4 * digit)) / Math.LN10);
    return 125 * Math.pow(9, n - 3) * digit;
}

function chocolateValue(bankAmount, earthShatter) {
    var value = 0;
    if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        bankAmount = bankAmount != null && bankAmount !== 0 ? bankAmount : Game.cookies;
        var sellRatio = 0.25;
        var highestBuilding = 0;
        if (earthShatter == null) {
            if (Game.hasAura("Earth Shatterer")) sellRatio = 0.5;
        } else if (earthShatter) {
            sellRatio = 0.5;
            if (!Game.hasAura("Earth Shatterer")) {
                for (var i in Game.Objects) {
                    if (Game.Objects[i].amount > 0) highestBuilding = Game.Objects[i];
                }
            }
        }
        value =
            0.05 *
            (wrinklerValue() +
                bankAmount +
                Game.ObjectsById.reduce(function (s, b) {
                    return (
                        s +
                        cumulativeBuildingCost(
                            b.basePrice,
                            1,
                            (b == highestBuilding ? b.amount : b.amount + 1) - b.free
                        ) *
                            sellRatio
                    );
                }, 0));
    }
    return value;
}

function wrinklerValue() {
    return Game.wrinklers.reduce(function (s, w) {
        return s + popValue(w);
    }, 0);
}

function buildingRemaining(building, amount) {
    var cost = cumulativeBuildingCost(building.basePrice, building.amount, amount);
    var availableCookies =
        Game.cookies +
        wrinklerValue() +
        Game.ObjectsById.reduce(function (s, b) {
            return (
                s +
                (b.name == building.name
                    ? 0
                    : cumulativeBuildingCost(b.basePrice, 1, b.amount + 1) / 2)
            );
        }, 0);
    availableCookies *=
        Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg") ? 1.05 : 1;
    return Math.max(0, cost - availableCookies);
}

function earnedRemaining(total) {
    return Math.max(0, total - (Game.cookiesEarned + wrinklerValue() + chocolateValue()));
}

function estimatedTimeRemaining(cookies) {
    return timeDisplay(cookies / effectiveCps());
}

function canCastSE() {
    if (M.magicM >= 80 && Game.Objects["You"].amount > 0) return 1;
    return 0;
}

function edificeBank() {
    if (!canCastSE) return 0;
    var cmCost = Game.Objects["You"].price;
    return Game.hasBuff("everything must go") ? (cmCost * (100 / 95)) / 2 : cmCost / 2;
}

function luckyBank() {
    return baseCps() * 60 * 100;
}

function luckyFrenzyBank() {
    var bank = baseCps() * 60 * 100 * 7;
    // Adds the price of Get Lucky (with discounts) since that would need to be
    // purchased in order for this bank to make sense.
    bank += Game.Has("Get lucky") ? 0 : Game.UpgradesById[86].getPrice();
    return bank;
}

function chainBank() {
    //  More exact
    var digit = 7 - Math.floor(Game.elderWrath / 3);
    return (
        4 *
        Math.floor(
            (digit / 9) *
                Math.pow(
                    10,
                    Math.floor(Math.log((194400 * baseCps()) / digit) / Math.LN10)
                )
        )
    );
    //  return baseCps() * 60 * 60 * 6 * 4;
}

function harvestBank() {
    if (!FrozenCookies.setHarvestBankPlant) return 0;

    FrozenCookies.harvestMinutes = 0;
    FrozenCookies.harvestMaxPercent = 0;
    FrozenCookies.harvestFrenzy = 1;
    FrozenCookies.harvestBuilding = 1;
    FrozenCookies.harvestPlant = "";

    if (FrozenCookies.setHarvestBankType == 1 || FrozenCookies.setHarvestBankType == 3)
        FrozenCookies.harvestFrenzy = 7;

    if (FrozenCookies.setHarvestBankType == 2 || FrozenCookies.setHarvestBankType == 3) {
        var harvestBuildingArray = [
            Game.Objects["Cursor"].amount,
            Game.Objects["Grandma"].amount,
            Game.Objects["Farm"].amount,
            Game.Objects["Mine"].amount,
            Game.Objects["Factory"].amount,
            Game.Objects["Bank"].amount,
            Game.Objects["Temple"].amount,
            Game.Objects["Wizard tower"].amount,
            Game.Objects["Shipment"].amount,
            Game.Objects["Alchemy lab"].amount,
            Game.Objects["Portal"].amount,
            Game.Objects["Time machine"].amount,
            Game.Objects["Antimatter condenser"].amount,
            Game.Objects["Prism"].amount,
            Game.Objects["Chancemaker"].amount,
            Game.Objects["Fractal engine"].amount,
            Game.Objects["Javascript console"].amount,
            Game.Objects["Idleverse"].amount,
            Game.Objects["Cortex baker"].amount,
            Game.Objects["You"].amount,
        ];
        harvestBuildingArray.sort(function (a, b) {
            return b - a;
        });

        for (
            var buildingLoop = 0;
            buildingLoop < FrozenCookies.maxSpecials;
            buildingLoop++
        ) {
            FrozenCookies.harvestBuilding *= harvestBuildingArray[buildingLoop];
        }
    }

    switch (FrozenCookies.setHarvestBankPlant) {
        case 1:
            FrozenCookies.harvestPlant = "Bakeberry";
            FrozenCookies.harvestMinutes = 30;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case 2:
            FrozenCookies.harvestPlant = "Chocoroot";
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case 3:
            FrozenCookies.harvestPlant = "White Chocoroot";
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case 4:
            FrozenCookies.harvestPlant = "Queenbeet";
            FrozenCookies.harvestMinutes = 60;
            FrozenCookies.harvestMaxPercent = 0.04;
            break;

        case 5:
            FrozenCookies.harvestPlant = "Duketater";
            FrozenCookies.harvestMinutes = 120;
            FrozenCookies.harvestMaxPercent = 0.08;
            break;

        case 6:
            FrozenCookies.harvestPlant = "Crumbspore";
            FrozenCookies.harvestMinutes = 1;
            FrozenCookies.harvestMaxPercent = 0.01;
            break;

        case 7:
            FrozenCookies.harvestPlant = "Doughshroom";
            FrozenCookies.harvestMinutes = 5;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
    }

    if (!FrozenCookies.maxSpecials) FrozenCookies.maxSpecials = 1;

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

function cookieEfficiency(startingPoint, bankAmount) {
    var results = Number.MAX_VALUE;
    var currentValue = cookieValue(startingPoint);
    var bankValue = cookieValue(bankAmount);
    var bankCps = gcPs(bankValue);
    if (bankCps > 0) {
        if (bankAmount <= startingPoint) {
            results = 0;
        } else {
            var cost = Math.max(0, bankAmount - startingPoint);
            var deltaCps = gcPs(bankValue - currentValue);
            results = divCps(cost, deltaCps);
        }
    } else if (bankAmount <= startingPoint) {
        results = 0;
    }
    return results;
}

function bestBank(minEfficiency) {
    var results = {};
    var edifice =
        FrozenCookies.autoCasting == 5 || FrozenCookies.holdSEBank ? edificeBank() : 0;
    var bankLevels = [0, luckyBank(), luckyFrenzyBank(), harvestBank()]
        .sort(function (a, b) {
            return b - a;
        })
        .map(function (bank) {
            return {
                cost: bank,
                efficiency: cookieEfficiency(Game.cookies, bank),
            };
        })
        .filter(function (bank) {
            return (bank.efficiency >= 0 && bank.efficiency <= minEfficiency) ||
                FrozenCookies.setHarvestBankPlant
                ? bank
                : null;
        });
    if (bankLevels[0].cost > edifice || FrozenCookies.setHarvestBankPlant)
        return bankLevels[0];
    return {
        cost: edifice,
        efficiency: 1,
    };
}

function weightedCookieValue(useCurrent) {
    var cps = baseCps();
    var lucky_mod = Game.Has("Get lucky");
    var base_wrath = lucky_mod ? 401.835 * cps : 396.51 * cps;
    //  base_wrath += 192125500000;
    var base_golden = lucky_mod ? 2804.76 * cps : 814.38 * cps;
    if (Game.cookiesEarned >= 100000) {
        var remainingProbability = 1;
        var startingValue = "6666";
        var rollingEstimate = 0;
        for (
            var i = 5;
            i < Math.min(Math.floor(Game.cookies).toString().length, 12);
            i++
        ) {
            startingValue += "6";
            rollingEstimate += 0.1 * remainingProbability * startingValue;
            remainingProbability -= remainingProbability * 0.1;
        }
        rollingEstimate += remainingProbability * startingValue;
        //    base_golden += 10655700000;
        base_golden += rollingEstimate * 0.0033;
        base_wrath += rollingEstimate * 0.0595;
    }
    if (useCurrent && Game.cookies < maxLuckyBank()) {
        if (lucky_mod) {
            base_golden -=
                (900 * cps - Math.min(900 * cps, Game.cookies * 0.15)) * 0.49 * 0.5 +
                (maxLuckyValue() - Game.cookies * 0.15) * 0.49 * 0.5;
        } else {
            base_golden -= (maxLuckyValue() - Game.cookies * 0.15) * 0.49;
            base_wrath -= (maxLuckyValue() - Game.cookies * 0.15) * 0.29;
        }
    }
    return (
        (Game.elderWrath / 3.0) * base_wrath + ((3 - Game.elderWrath) / 3.0) * base_golden
    );
}

function maxLuckyValue() {
    var gcMod = Game.Has("Get lucky") ? 6300 : 900;
    return baseCps() * gcMod;
}

function maxLuckyBank() {
    return Game.Has("Get lucky") ? luckyFrenzyBank() : luckyBank();
}

function maxCookieTime() {
    return Game.shimmerTypes.golden.maxTime;
}

function gcPs(gcValue) {
    var averageGCTime = probabilitySpan("golden", 0, 0.5) / Game.fps;
    gcValue /= averageGCTime;
    gcValue *= FrozenCookies.simulatedGCPercent;
    return gcValue;
}

function gcEfficiency() {
    if (gcPs(weightedCookieValue()) <= 0) return Number.MAX_VALUE;
    var cost = Math.max(0, maxLuckyValue() * 10 - Game.cookies);
    var deltaCps = gcPs(weightedCookieValue() - weightedCookieValue(true));
    return divCps(cost, deltaCps);
}

function delayAmount() {
    return bestBank(nextChainedPurchase().efficiency).cost;
    /*
        if (nextChainedPurchase().efficiency > gcEfficiency() || (Game.frenzy && Game.Has('Get lucky'))) {
          return maxLuckyValue() * 10;
        } else if (weightedCookieValue() > weightedCookieValue(true)) {
          return Math.min(maxLuckyValue() * 10, Math.max(0,(nextChainedPurchase().efficiency - (gcEfficiency() * baseCps())) / gcEfficiency()));
        } else {
         return 0;
        }
      */
}

function haveAll(holiday) {
    return _.every(holidayCookies[holiday], function (id) {
        return Game.UpgradesById[id].unlocked;
    });
}

function checkPrices(currentUpgrade) {
    var value = 0;
    if (FrozenCookies.caches.recommendationList.length > 0) {
        var nextRec = FrozenCookies.caches.recommendationList.filter(function (i) {
            return i.id != currentUpgrade.id;
        })[0];
        var nextPrereq =
            nextRec.type == "upgrade" ? unfinishedUpgradePrereqs(nextRec.purchase) : null;
        nextRec =
            nextPrereq == null ||
            nextPrereq.filter(function (u) {
                return u.cost != null;
            }).length == 0
                ? nextRec
                : FrozenCookies.caches.recommendationList.filter(function (a) {
                      return nextPrereq.some(function (b) {
                          return b.id == a.id && b.type == a.type;
                      });
                  })[0];
        value =
            nextRec.cost == null
                ? 0
                : nextRec.cost / totalDiscount(nextRec.type == "building") - nextRec.cost;
    }
    return value;
}

// Use this for changes to future efficiency calcs
function purchaseEfficiency(price, deltaCps, baseDeltaCps, currentCps) {
    var efficiency = Number.POSITIVE_INFINITY;
    if (deltaCps > 0) {
        efficiency =
            FrozenCookies.efficiencyWeight * divCps(price, currentCps) +
            divCps(price, deltaCps);
    }
    return efficiency;
}

function recommendationList(recalculate) {
    if (recalculate) {
        FrozenCookies.showAchievements = false;
        FrozenCookies.caches.recommendationList = addScores(
            upgradeStats(recalculate)
                .concat(buildingStats(recalculate))
                .concat(santaStats())
                .sort(function (a, b) {
                    return a.efficiency != b.efficiency
                        ? a.efficiency - b.efficiency
                        : a.delta_cps != b.delta_cps
                          ? b.delta_cps - a.delta_cps
                          : a.cost - b.cost;
                })
        );
        if (FrozenCookies.pastemode) FrozenCookies.caches.recommendationList.reverse();
        FrozenCookies.showAchievements = true;
    }
    return FrozenCookies.caches.recommendationList;
}

function addScores(recommendations) {
    var filteredList = recommendations.filter(function (a) {
        return (
            a.efficiency < Number.POSITIVE_INFINITY &&
            a.efficiency > Number.NEGATIVE_INFINITY
        );
    });
    if (filteredList.length > 0) {
        var minValue = Math.log(recommendations[0].efficiency);
        var maxValue = Math.log(recommendations[filteredList.length - 1].efficiency);
        var spread = maxValue - minValue;
        recommendations.forEach(function (purchaseRec, index) {
            if (
                purchaseRec.efficiency < Number.POSITIVE_INFINITY &&
                purchaseRec.efficiency > Number.NEGATIVE_INFINITY
            ) {
                var purchaseValue = Math.log(purchaseRec.efficiency);
                var purchaseSpread = purchaseValue - minValue;
                recommendations[index].efficiencyScore = 1 - purchaseSpread / spread;
            } else {
                recommendations[index].efficiencyScore = 0;
            }
        });
    } else {
        recommendations.forEach(function (purchaseRec, index) {
            recommendations[index].efficiencyScore = 0;
        });
    }
    return recommendations;
}

function nextPurchase(recalculate) {
  if (recalculate) {
    FrozenCookies.showAchievements = false;

    let recList = recommendationList(recalculate);
    const inefficientIDs = FrozenCookies.otherUpgrades
      ? [
          80, 81, 82, 83, 147, 153, 205, 206,
          174, 163, 164, 165, 282 // Inefficient upgrades
        ]
      : [];

    // Inject non-efficient upgrades into the recList if enabled
    if (inefficientIDs.length > 0) {
      const extras = inefficientIDs
        .map(id => Game.UpgradesById[id])
        .filter(upg =>
          upg &&
          !upg.bought &&
          upg.unlocked &&
          !Game.vault.includes(upg.id)
        )
        .map(upg => ({
          id: upg.id,
          type: "upgrade",
          purchase: upg,
          cost: upg.getPrice(),
          efficiency: Infinity, // Marked inefficient
          delta_cps: 0,
          time: Date.now() - Game.startDate
        }));

      // Optionally add extras at end (or start) of list
      recList = recList.concat(extras);
    }

    let purchase = null;
    let target = null;

    for (let i = 0; i < recList.length; i++) {
      target = recList[i];
      if (
        target.type === "upgrade" &&
        unfinishedUpgradePrereqs(Game.UpgradesById[target.id])
      ) {
        const prereqList = unfinishedUpgradePrereqs(Game.UpgradesById[target.id]);
        purchase = recList.find(a =>
          prereqList.some(b => b.id === a.id && b.type === a.type)
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

function buildingStats(recalculate) {
    // Check if we need to force recalculation
    var forceRecalculate = recalculate;
    var currentGameStateHash = getGameStateHash();

    // Only recalculate when game state changes or forced
    if (!FrozenCookies.buildingCache) {
        FrozenCookies.buildingCache = {
            buildingCached: {},
            cacheValid: false,
            lastGameStateHash: "",
            recalculateCount: 0,
        };
    } // Initialize timing trackers if they don't exist
    if (!FrozenCookies.buildingCache.timing) {
        FrozenCookies.buildingCache.timing = {
            lastFullUpdate: 0,
            updateInterval: 10000, // 10 seconds between full recalculations
            lastPartialUpdate: 0,
            partialUpdateInterval: 2000, // 2 seconds between partial updates
        };
    }

    var now = Date.now();
    var timeSinceFullUpdate =
        now - FrozenCookies.buildingCache.timing.lastFullUpdate;
    var timeSincePartialUpdate =
        now - FrozenCookies.buildingCache.timing.lastPartialUpdate;

    // Check if game state has changed
    if (
        FrozenCookies.buildingCache.lastGameStateHash !== currentGameStateHash
    ) {
        FrozenCookies.buildingCache.cacheValid = false;
        FrozenCookies.buildingCache.lastGameStateHash = currentGameStateHash;
        FrozenCookies.buildingCache.recalculateCount = 0;
        forceRecalculate = true;
    }

    // Determine if we should do a full or partial update
    var shouldFullUpdate =
        forceRecalculate ||
        timeSinceFullUpdate >=
            FrozenCookies.buildingCache.timing.updateInterval;
    var shouldPartialUpdate =
        !shouldFullUpdate &&
        timeSincePartialUpdate >=
            FrozenCookies.buildingCache.timing.partialUpdateInterval;

    // Prevent excessive recalculation attempts
    if (FrozenCookies.buildingCache.recalculateCount > 2 && !shouldFullUpdate) {
        return FrozenCookies.caches.buildings;
    }

    if (shouldFullUpdate || !FrozenCookies.buildingCache.cacheValid) {
        FrozenCookies.buildingCache.recalculateCount++;
        FrozenCookies.buildingCache.timing.lastFullUpdate = now;

        if (blacklist[FrozenCookies.blacklist].buildings === true) {
            FrozenCookies.caches.buildings = [];
        } else {
            var buildingBlacklist = Array.from(
                blacklist[FrozenCookies.blacklist].buildings
            );
            //If autocasting Spontaneous Edifice, don't buy any You after 399
            if (M && FrozenCookies.autoCasting == 5 && Game.Objects["You"].amount >= 399)
                buildingBlacklist.push(19);
            //Stop buying wizard towers at max Mana if enabled
            if (M && FrozenCookies.towerLimit && M.magicM >= FrozenCookies.manaMax)
                buildingBlacklist.push(7);
            //Stop buying Mines if at set limit
            if (
                FrozenCookies.mineLimit &&
                Game.Objects["Mine"].amount >= FrozenCookies.mineMax
            )
                buildingBlacklist.push(3);
            //Stop buying Factories if at set limit
            if (
                FrozenCookies.factoryLimit &&
                Game.Objects["Factory"].amount >= FrozenCookies.factoryMax
            )
                buildingBlacklist.push(4);
            //Stop buying Yous if at set limit
            if (
                FrozenCookies.autoDragonOrbs &&
                FrozenCookies.orbLimit &&
                Game.Objects["You"].amount >= FrozenCookies.orbMax
            )
                buildingBlacklist.push(19);
            FrozenCookies.caches.buildings = Game.ObjectsById.map(
                function (current, index) {
                    if (_.contains(buildingBlacklist, current.id)) return null;
                    var currentBank = bestBank(0).cost;
                    var baseCpsOrig = baseCps();
                    var cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank)); // baseCpsOrig + gcPs(cookieValue(Math.min(Game.cookies, currentBank))) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
                    var existingAchievements = Object.values(Game.AchievementsById).map(
                        function (item, i) {
                            return item.won;
                        }
                    );
                    buildingToggle(current);
                    var baseCpsNew = baseCps();
                    var cpsNew = effectiveCps(currentBank); // baseCpsNew + gcPs(cookieValue(currentBank)) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
                    buildingToggle(current, existingAchievements);
                    var deltaCps = cpsNew - cpsOrig;
                    var baseDeltaCps = baseCpsNew - baseCpsOrig;
                    var efficiency = purchaseEfficiency(
                        current.getPrice(),
                        deltaCps,
                        baseDeltaCps,
                        cpsOrig
                    );
                    return {
                        id: current.id,
                        efficiency: efficiency,
                        base_delta_cps: baseDeltaCps,
                        delta_cps: deltaCps,
                        cost: current.getPrice(),
                        purchase: current,
                        type: "building",
                    };
                }
            ).filter(function (a) {
                return a;
            });
        }

        // Mark cache as valid after completion
        FrozenCookies.buildingCache.cacheValid = true;
    }

    return FrozenCookies.caches.buildings;
}

function upgradeStats(recalculate) {
    // Check if we need to force recalculation
    var forceRecalculate = recalculate;
    var currentGameStateHash = getGameStateHash();

    // Initialize cache and timing trackers if they don't exist
    if (!FrozenCookies.upgradeCache) {
        FrozenCookies.upgradeCache = {
            upgradeCached: {},
            priceHistory: {}, // Track price changes
            cacheValid: false,
            lastGameStateHash: "",
            recalculateCount: 0,
            batchSize: 10, // Process upgrades in batches
            timing: {
                lastFullUpdate: 0,
                updateInterval: 10000,
                lastPartialUpdate: 0,
                partialUpdateInterval: 2000,
                lastPriceCheck: 0,
                priceCheckInterval: 1000,
                lastCalculations: {},
            },
        };
    }

    var now = Date.now();
    var timeSinceFullUpdate =
        now - (FrozenCookies.upgradeCache.timing.lastFullUpdate || 0);
    var timeSincePartialUpdate =
        now - (FrozenCookies.upgradeCache.timing.lastPartialUpdate || 0);
    var timeSincePriceCheck =
        now - (FrozenCookies.upgradeCache.timing.lastPriceCheck || 0);

    // Quick price check to detect changes that would invalidate cache
    if (
        timeSincePriceCheck >=
        FrozenCookies.upgradeCache.timing.priceCheckInterval
    ) {
        var priceChanged = false;
        for (var i in Game.UpgradesInStore) {
            var upgrade = Game.UpgradesInStore[i];
            var currentPrice = upgrade.getPrice();
            if (
                FrozenCookies.upgradeCache.priceHistory[upgrade.id] !==
                currentPrice
            ) {
                FrozenCookies.upgradeCache.priceHistory[upgrade.id] =
                    currentPrice;
                priceChanged = true;
            }
        }
        if (priceChanged) {
            FrozenCookies.upgradeCache.cacheValid = false;
        }
        FrozenCookies.upgradeCache.timing.lastPriceCheck = now;
    }

    // Only reset cache when game state actually changes
    if (FrozenCookies.upgradeCache.lastGameStateHash !== currentGameStateHash) {
        FrozenCookies.upgradeCache.cacheValid = false;
        FrozenCookies.upgradeCache.lastGameStateHash = currentGameStateHash;
        FrozenCookies.upgradeCache.recalculateCount = 0;
        forceRecalculate = true;
    }

    // Determine update type
    var shouldFullUpdate =
        forceRecalculate ||
        timeSinceFullUpdate >= FrozenCookies.upgradeCache.timing.updateInterval;
    var shouldPartialUpdate =
        !shouldFullUpdate &&
        timeSincePartialUpdate >=
            FrozenCookies.upgradeCache.timing.partialUpdateInterval;

    // Prevent excessive recalculation attempts
    if (FrozenCookies.upgradeCache.recalculateCount > 2 && !shouldFullUpdate) {
        return FrozenCookies.caches.upgrades;
    }

    if (shouldFullUpdate || !FrozenCookies.upgradeCache.cacheValid) {
        FrozenCookies.upgradeCache.recalculateCount++;
        FrozenCookies.upgradeCache.timing.lastFullUpdate = now;

        if (blacklist[FrozenCookies.blacklist].upgrades === true) {
            FrozenCookies.caches.upgrades = [];
        } else {
            var upgradeBlacklist = blacklist[FrozenCookies.blacklist].upgrades;
            var upgradesToProcess = [];

            // Get all valid upgrades
            var validUpgrades = Object.values(Game.UpgradesById).filter(
                function (upgrade) {
                    return (
                        !upgrade.bought &&
                        !isUnavailable(upgrade, upgradeBlacklist)
                    );
                }
            );

            // Sort upgrades by priority for partial updates
            if (shouldPartialUpdate) {
                validUpgrades.sort(function (a, b) {
                    const aCache =
                        FrozenCookies.upgradeCache.upgradeCached[a.id];
                    const bCache =
                        FrozenCookies.upgradeCache.upgradeCached[b.id];

                    // Prioritize uncached upgrades
                    if (!aCache) return -1;
                    if (!bCache) return 1;

                    // Then prioritize by last calculation time
                    const aTime =
                        FrozenCookies.upgradeCache.timing.lastCalculations[
                            a.id
                        ] || 0;
                    const bTime =
                        FrozenCookies.upgradeCache.timing.lastCalculations[
                            b.id
                        ] || 0;
                    return aTime - bTime;
                });
            }

            // Process only a subset for partial updates
            var upgradesToCheck = shouldPartialUpdate
                ? validUpgrades.slice(0, 5) // Process 5 most important upgrades in partial update
                : validUpgrades;

            // Process upgrades in batches
            const batchSize = FrozenCookies.upgradeCache.batchSize;
            for (let i = 0; i < upgradesToCheck.length; i += batchSize) {
                const batch = upgradesToCheck.slice(i, i + batchSize);

                batch.forEach(function (current) {
                    var currentBank = bestBank(0).cost;
                    var cost = upgradePrereqCost(current);
                    var baseCpsOrig = baseCps();
                    var cpsOrig = effectiveCps(
                        Math.min(Game.cookies, currentBank)
                    );

                    var existingAchievements = Object.values(
                        Game.AchievementsById
                    ).map((item) => item.won);
                        var existingWrath = Game.elderWrath;
                        var discounts = totalDiscount() + totalDiscount(true);
                        var reverseFunctions = upgradeToggle(current);
                        var baseCpsNew = baseCps();
                        var cpsNew = effectiveCps(currentBank);
                        var priceReduction =
                            discounts == totalDiscount() + totalDiscount(true)
                                ? 0
                                : checkPrices(current);
                        upgradeToggle(current, existingAchievements, reverseFunctions);
                        Game.elderWrath = existingWrath;
                        var deltaCps = cpsNew - cpsOrig;
                        var baseDeltaCps = baseCpsNew - baseCpsOrig;
                        var efficiency =
                            current.season &&
                            FrozenCookies.defaultSeasonToggle == 1 &&
                            current.season == seasons[FrozenCookies.defaultSeason]
                                ? cost / baseCpsOrig
                                : priceReduction > cost
                                  ? 1
                                  : purchaseEfficiency(
                                        cost,
                                        deltaCps,
                                        baseDeltaCps,
                                        cpsOrig
                                    );

                    // Cache the calculated values
                    FrozenCookies.upgradeCache.upgradeCached[current.id] = {
                            id: current.id,
                            efficiency: efficiency,
                            base_delta_cps: baseDeltaCps,
                            delta_cps: deltaCps,
                            cost: cost,
                            purchase: current,
                            type: "upgrade",
                        };

                    // Track calculation time
                    FrozenCookies.upgradeCache.timing.lastCalculations[
                        current.id
                    ] = now;
                });

                // Allow browser to process other events between batches
                if (
                    upgradesToCheck.length > batchSize &&
                    i + batchSize < upgradesToCheck.length
                ) {
                    // Could add setTimeout here for smoother performance in future
                }
            }

            // Build final result list from cache
            FrozenCookies.caches.upgrades = validUpgrades
                .map(function (current) {
                    return FrozenCookies.upgradeCache.upgradeCached[current.id];
                })
                .filter(function (a) {
                    return a;
                });
        }

        // Mark cache as valid after completion
        FrozenCookies.upgradeCache.cacheValid = true;
        FrozenCookies.upgradeCache.timing.lastPartialUpdate = now;
    }

    return FrozenCookies.caches.upgrades;
}

function isUnavailable(upgrade, upgradeBlacklist) {
    // should we even recommend upgrades at all?
    if (upgradeBlacklist === true) return true;

    // check if the upgrade is in the selected blacklist, or is an upgrade that shouldn't be recommended
    if (upgradeBlacklist.concat(recommendationBlacklist).includes(upgrade.id))
        return true;

    // Is it vaulted?
    if (Game.Has("Inspired checklist") && Game.vault.includes(upgrade.id)) return true;

    // Don't pledge if Easter or Halloween not complete
    if (
        upgrade.id == 74 &&
        (Game.season == "halloween" || Game.season == "easter") &&
        !haveAll(Game.season)
    ) {
        return true;
    }

    // Don't pledge if we want to protect Shiny Wrinklers
    if (upgrade.id == 74 && FrozenCookies.shinyPop == 1) return true;

    // Web cookies are only on Browser
    if (App && upgrade.id == 816) return true;

    // Steamed cookies are only on Steam
    if (!App && upgrade.id == 817) return true;

    // Don't leave base season if it's desired
    if (
        (upgrade.id == 182 ||
            upgrade.id == 183 ||
            upgrade.id == 184 ||
            upgrade.id == 185 ||
            upgrade.id == 209) &&
        Game.baseSeason &&
        Game.UpgradesById[181].unlocked &&
        upgrade.id == 182 &&
        haveAll("christmas") &&
        upgrade.id == 183 &&
        haveAll("halloween") &&
        upgrade.id == 184 &&
        haveAll("valentines") &&
        upgrade.id == 209 &&
        haveAll("easter") &&
        (FrozenCookies.freeSeason == 2 ||
            (FrozenCookies.freeSeason == 1 &&
                ((Game.baseSeason == "christmas" && upgrade.id == 182) ||
                    (Game.baseSeason == "fools" && upgrade.id == 185))))
    )
        return true;

    var result = false;

    var needed = unfinishedUpgradePrereqs(upgrade);
    result = result || (!upgrade.unlocked && !needed);
    result =
        result ||
        (_.find(needed, function (a) {
            return a.type == "wrinklers";
        }) != null &&
            needed);
    result =
        result ||
        (_.find(needed, function (a) {
            return a.type == "santa";
        }) != null &&
            "christmas" != Game.season &&
            !Game.UpgradesById[181].unlocked &&
            !Game.prestige);
    result =
        result ||
        (upgrade.season &&
            (!haveAll(Game.season) ||
                (upgrade.season != seasons[FrozenCookies.defaultSeason] &&
                    haveAll(upgrade.season))));

    return result;
}

function santaStats() {
    return Game.Has("A festive hat") && Game.santaLevel + 1 < Game.santaLevels.length
        ? {
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
                      Game.santaLevels[(Game.santaLevel + 1) % Game.santaLevels.length] +
                      ")",
                  buy: buySanta,
                  getCost: function () {
                      return cumulativeSantaCost(1);
                  },
              },
          }
        : [];
}

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
            getCost: function () {
                return Infinity;
            },
        },
    };
}

function totalDiscount(building) {
    var price = 1;
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

function cumulativeBuildingCost(basePrice, startingNumber, endingNumber) {
    return (
        (basePrice *
            totalDiscount(true) *
            (Math.pow(Game.priceIncrease, endingNumber) -
                Math.pow(Game.priceIncrease, startingNumber))) /
        (Game.priceIncrease - 1)
    );
}

function cumulativeSantaCost(amount) {
    var total = 0;
    if (!amount) {
    } else if (Game.santaLevel + amount < Game.santaLevels.length) {
        for (var i = Game.santaLevel + 1; i <= Game.santaLevel + amount; i++) {
            total += Math.pow(i, i);
        }
    } else if (amount < Game.santaLevels.length) {
        for (var i = Game.santaLevel + 1; i <= amount; i++) {
            total += Math.pow(i, i);
        }
    } else {
        total = Infinity;
    }
    return total;
}

function upgradePrereqCost(upgrade, full) {
    var cost = upgrade.getPrice();
    if (upgrade.unlocked) return cost;
    var prereqs = upgradeJson[upgrade.id];
    if (prereqs) {
        cost += prereqs.buildings.reduce(function (sum, item, index) {
            var building = Game.ObjectsById[index];
            if (item && full) {
                sum += cumulativeBuildingCost(building.basePrice, 0, item);
            } else if (item && building.amount < item) {
                sum += cumulativeBuildingCost(building.basePrice, building.amount, item);
            }
            return sum;
        }, 0);
        cost += prereqs.upgrades.reduce(function (sum, item) {
            var reqUpgrade = Game.UpgradesById[item];
            if (!upgrade.bought || full) sum += upgradePrereqCost(reqUpgrade, full);
            return sum;
        }, 0);
        cost += cumulativeSantaCost(prereqs.santa);
    }
    return cost;
}

function unfinishedUpgradePrereqs(upgrade) {
    if (upgrade.unlocked) return null;
    var needed = [];
    var prereqs = upgradeJson[upgrade.id];
    if (prereqs) {
        prereqs.buildings.forEach(function (a, b) {
            if (a && Game.ObjectsById[b].amount < a) {
                needed.push({
                    type: "building",
                    id: b,
                });
            }
        });
        prereqs.upgrades.forEach(function (a) {
            if (!Game.UpgradesById[a].bought) {
                var recursiveUpgrade = Game.UpgradesById[a];
                var recursivePrereqs = unfinishedUpgradePrereqs(recursiveUpgrade);
                if (recursiveUpgrade.unlocked) {
                    needed.push({
                        type: "upgrade",
                        id: a,
                    });
                } else if (!recursivePrereqs) {
                    // Research is being done.
                } else {
                    recursivePrereqs.forEach(function (a) {
                        if (
                            !needed.some(function (b) {
                                return b.id == a.id && b.type == a.type;
                            })
                        ) {
                            needed.push(a);
                        }
                    });
                }
            }
        });
        if (prereqs.santa) {
            needed.push({
                type: "santa",
                id: 0,
            });
        }
        if (prereqs.wrinklers && !Game.elderWrath) {
            needed.push({
                type: "wrinklers",
                id: 0,
            });
        }
    }
    return needed.length ? needed : null;
}

function upgradeToggle(upgrade, achievements, reverseFunctions) {
    const oldHighest = Game.cookiesPsRawHighest; // Save current value before simulating
    if (!achievements) {
        reverseFunctions = {};
        if (!upgrade.unlocked) {
            var prereqs = upgradeJson[upgrade.id];
            if (prereqs) {
                reverseFunctions.prereqBuildings = [];
                prereqs.buildings.forEach(function (a, b) {
                    var building = Game.ObjectsById[b];
                    if (a && building.amount < a) {
                        var difference = a - building.amount;
                        reverseFunctions.prereqBuildings.push({
                            id: b,
                            amount: difference,
                        });
                        building.amount += difference;
                        building.bought += difference;
                        Game.BuildingsOwned += difference;
                    }
                });
                reverseFunctions.prereqUpgrades = [];
                if (prereqs.upgrades.length > 0) {
                    prereqs.upgrades.forEach(function (id) {
                        var upgrade = Game.UpgradesById[id];
                        if (!upgrade.bought) {
                            reverseFunctions.prereqUpgrades.push({
                                id: id,
                                reverseFunctions: upgradeToggle(upgrade),
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
            reverseFunctions.prereqBuildings.forEach(function (b) {
                var building = Game.ObjectsById[b.id];
                building.amount -= b.amount;
                building.bought -= b.amount;
                Game.BuildingsOwned -= b.amount;
            });
        }
        if (reverseFunctions.prereqUpgrades) {
            reverseFunctions.prereqUpgrades.forEach(function (u) {
                var upgrade = Game.UpgradesById[u.id];
                upgradeToggle(upgrade, [], u.reverseFunctions);
            });
        }
        upgrade.bought = 0;
        Game.UpgradesOwned -= 1;
        buyFunctionToggle(reverseFunctions.current);
        Game.AchievementsOwned = 0;
        achievements.forEach(function (won, index) {
            var achievement = Game.AchievementsById[index];
            achievement.won = won;
            if (won && achievement.pool != "shadow") {
                Game.AchievementsOwned += 1;
            }
        });
    }

    // Performance optimization: Only call CalculateGains if the upgrade is non-trivial
    // If upgrade is season-related, visual, or achievement-unlocking, we can skip full recalculation
    const needsFullRecalc = !(
        upgrade.pool === "toggle" ||
        upgrade.pool === "debug" ||
        upgrade.pool === "prestige" ||
        upgrade.season !== undefined
    );

    Game.recalculateGains = 1;
    if (needsFullRecalc) {
        Game.CalculateGains();
    }
    Game.cookiesPsRawHighest = oldHighest; // Restore after simulation
    return reverseFunctions;
}

function buildingToggle(building, achievements) {
    const oldHighest = Game.cookiesPsRawHighest; // Save current value before simulating
    if (!achievements) {
        building.amount += 1;
        building.bought += 1;
        Game.BuildingsOwned += 1;
    } else {
        building.amount -= 1;
        building.bought -= 1;
        Game.BuildingsOwned -= 1;
        Game.AchievementsOwned = 0;
        achievements.forEach(function (won, index) {
            var achievement = Game.AchievementsById[index];
            achievement.won = won;
            if (won && achievement.pool != "shadow") Game.AchievementsOwned += 1;
        });
    }

    // Performance optimization: Some buildings might need special handling
    // For now, all buildings require full recalculation, but we can identify
    // special cases in the future to optimize further
    const isSpecialBuilding = false; // Reserved for future optimizations

    Game.recalculateGains = 1;
    Game.CalculateGains();
    Game.cookiesPsRawHighest = oldHighest; // Restore after simulation
}

function buyFunctionToggle(upgrade) {
    if (upgrade && upgrade.id == 452) return null;
    if (upgrade && !upgrade.length) {
        if (!upgrade.buyFunction) return null;

        var ignoreFunctions = [
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
        var buyFunctions = upgrade.buyFunction
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
            .map(function (a) {
                return a.trim();
            })
            .filter(function (a) {
                ignoreFunctions.forEach(function (b) {
                    a = a.replace(b, "");
                });
                return a != "";
            });

        if (buyFunctions.length == 0) return null;

        var reversedFunctions = buyFunctions.map(function (a) {
            var reversed = "";
            var achievementMatch = /Game\.Win\('(.*)'\)/.exec(a);
            if (a.indexOf("+=") > -1) {
                reversed = a.replace("+=", "-=");
            } else if (a.indexOf("-=") > -1) {
                reversed = a.replace("-=", "+=");
            } else if (
                achievementMatch &&
                Game.Achievements[achievementMatch[1]].won == 0
            ) {
                reversed = "Game.Achievements['" + achievementMatch[1] + "'].won=0";
            } else if (a.indexOf("=") > -1) {
                var expression = a.split("=");
                var expressionResult = eval(expression[0]);
                var isString = _.isString(expressionResult);
                reversed =
                    expression[0] +
                    "=" +
                    (isString ? "'" : "") +
                    expressionResult +
                    (isString ? "'" : "");
            }
            return reversed;
        });
        buyFunctions.forEach(function (f) {
            eval(f);
        });
        return reversedFunctions;
    } else if (upgrade && upgrade.length) {
        upgrade.forEach(function (f) {
            eval(f);
        });
    }
    return null;
}

function buySanta() {
    Game.specialTab = "santa";
    Game.UpgradeSanta();
    if (Game.santaLevel + 1 >= Game.santaLevels.length) Game.ToggleSpecialMenu();
}

function statSpeed() {
    var speed = 0;
    switch (FrozenCookies.trackStats) {
        case 1: // 60s
            speed = 1000 * 60;
            break;
        case 2: // 30m
            speed = 1000 * 60 * 30;
            break;
        case 3: // 1h
            speed = 1000 * 60 * 60;
            break;
        case 4: // 24h
            speed = 1000 * 60 * 60 * 24;
            break;
    }
    return speed;
}

function saveStats(fromGraph) {
    FrozenCookies.trackedStats.push({
        time: Date.now() - Game.startDate,
        baseCps: baseCps(),
        effectiveCps: effectiveCps(),
        hc: Game.HowMuchPrestige(
            Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
        ),
        actualClicks: Game.cookieClicks,
    });
    if (
        $("#statGraphContainer").length > 0 &&
        !$("#statGraphContainer").is(":hidden") &&
        !fromGraph
    ) {
        viewStatGraphs();
    }
}

function viewStatGraphs() {
    saveStats(true);
    var containerDiv = $("#statGraphContainer").length
        ? $("#statGraphContainer")
        : $("<div>")
              .attr("id", "statGraphContainer")
              .html($("<div>").attr("id", "statGraphs"))
              .appendTo("body")
              .dialog({
                  modal: true,
                  title: "Frozen Cookies Tracked Stats",
                  width: $(window).width() * 0.8,
                  height: $(window).height() * 0.8,
              });
    if (containerDiv.is(":hidden")) containerDiv.dialog();
    if (
        FrozenCookies.trackedStats.length > 0 &&
        Date.now() - FrozenCookies.lastGraphDraw > 1000
    ) {
        FrozenCookies.lastGraphDraw = Date.now();
        $("#statGraphs").empty();
        var graphs = $.jqplot(
            "statGraphs",
            transpose(
                FrozenCookies.trackedStats.map(function (s) {
                    return [
                        [s.time / 1000, s.baseCps],
                        [s.time / 1000, s.effectiveCps],
                        [s.time / 1000, s.hc],
                    ];
                })
            ), //
            {
                legend: {
                    show: true,
                },
                height: containerDiv.height() - 50,
                axes: {
                    xaxis: {
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            angle: -30,
                            fontSize: "10pt",
                            showGridline: false,
                            formatter: function (ah, ai) {
                                return timeDisplay(ai);
                            },
                        },
                    },
                    yaxis: {
                        padMin: 0,
                        renderer: $.jqplot.LogAxisRenderer,
                        tickDistribution: "even",
                        tickOptions: {
                            formatter: function (ah, ai) {
                                return Beautify(ai);
                            },
                        },
                    },
                    y2axis: {
                        padMin: 0,
                        tickOptions: {
                            showGridline: false,
                            formatter: function (ah, ai) {
                                return Beautify(ai);
                            },
                        },
                    },
                },
                highlighter: {
                    show: true,
                    sizeAdjust: 15,
                },
                series: [
                    {
                        label: "Base CPS",
                    },
                    {
                        label: "Effective CPS",
                    },
                    {
                        label: "Earned HC",
                        yaxis: "y2axis",
                    },
                ],
            }
        );
    }
}

function updateCaches() {
    var recommendation, currentBank, targetBank, currentCookieCPS, currentUpgradeCount;
    var recalcCount = 0;
    var gameStateChanged = false;

    // Check if the game state has changed significantly since our last calculation
    // This helps us avoid expensive recalculations when nothing important has changed
    currentBank = bestBank(0);
    currentCookieCPS = gcPs(cookieValue(currentBank.cost));
    currentUpgradeCount = Game.UpgradesInStore.length;

    // Check for changes that would require recalculation
    if (FrozenCookies.lastCPS != FrozenCookies.calculatedCps) {
        gameStateChanged = true;
        FrozenCookies.lastCPS = FrozenCookies.calculatedCps;
    }

    if (FrozenCookies.currentBank.cost != currentBank.cost) {
        gameStateChanged = true;
        FrozenCookies.currentBank = currentBank;
    }

    if (FrozenCookies.lastCookieCPS != currentCookieCPS) {
        gameStateChanged = true;
        FrozenCookies.lastCookieCPS = currentCookieCPS;
    }

    if (FrozenCookies.lastUpgradeCount != currentUpgradeCount) {
        gameStateChanged = true;
        FrozenCookies.lastUpgradeCount = currentUpgradeCount;
    }
    // Only invalidate caches if something important has changed
    if (gameStateChanged) {
        invalidateUpgradeCache();
        invalidateBuildingCache();
    }

    // Now perform the actual calculations, but limit iterations to prevent freezing
    FrozenCookies.recalculateCaches =
        gameStateChanged || FrozenCookies.recalculateCaches;

    do {
        recommendation = nextPurchase(FrozenCookies.recalculateCaches);
        FrozenCookies.recalculateCaches = false;

        targetBank = bestBank(recommendation.efficiency);
        FrozenCookies.safeGainsCalc();

        if (FrozenCookies.targetBank.cost != targetBank.cost) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.targetBank = targetBank;
        }

        recalcCount += 1;
    } while (FrozenCookies.recalculateCaches && recalcCount < 5); // Reduced from 10 to 5 to prevent freezing
}

//Why the hell is fcWin being called so often? It seems to be getting called repeatedly on the CPS achievements,
//which should only happen when you actually win them?
function fcWin(what) {
    if (typeof what === "string") {
        if (Game.Achievements[what]) {
            if (Game.Achievements[what].won == 0) {
                var achname = Game.Achievements[what].shortName
                    ? Game.Achievements[what].shortName
                    : Game.Achievements[what].name;
                Game.Achievements[what].won = 1;
                //This happens a ton of times on CPS achievements; it seems like they would be CHECKED for, but a debug message placed
                //here gets repeatedly called seeming to indicate that the achievements.won value is 1, even though the achievement isn't
                //being unlocked. This also means that placing a function to log the achievement spams out messages. Are the Achievement.won
                //values being turned off before the game checks again? There must be some reason Game.Win is replaced with fcWin
                if (!FrozenCookies.disabledPopups) {
                    logEvent(
                        "Achievement",
                        "Achievement unlocked :<br>" +
                            Game.Achievements[what].name +
                            "<br> ",
                        true
                    );
                }
                if (FrozenCookies.showAchievements) {
                    Game.Notify(
                        "Achievement unlocked",
                        '<div class="title" style="font-size:18px;margin-top:-2px;">' +
                            achname +
                            "</div>",
                        Game.Achievements[what].icon
                    );
                    if (App && Game.Achievements[what].vanilla)
                        App.gotAchiev(Game.Achievements[what].id);
                }
                if (Game.Achievements[what].pool != "shadow") Game.AchievementsOwned++;
                Game.recalculateGains = 1;
            }
        }
    } else {
        logEvent("fcWin Else condition");
        for (var i in what) {
            Game.Win(what[i]);
        }
    }
}

function logEvent(event, text, popup) {
    var time = "[" + timeDisplay((Date.now() - Game.startDate) / 1000) + "]";
    var output = time + " " + event + ": " + text;
    if (FrozenCookies.logging) console.log(output);
    if (popup) Game.Popup(text);
}

function inRect(x, y, rect) {
    // Duplicate of internally defined method,
    // only needed because I'm modifying the scope of Game.UpdateWrinklers and it can't see this anymore.
    var dx = x + Math.sin(-rect.r) * -(rect.h / 2 - rect.o),
        dy = y + Math.cos(-rect.r) * -(rect.h / 2 - rect.o);
    var h1 = Math.sqrt(dx * dx + dy * dy);
    var currA = Math.atan2(dy, dx);
    var newA = currA - rect.r;
    var x2 = Math.cos(newA) * h1;
    var y2 = Math.sin(newA) * h1;
    return (
        x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h
    );
}

function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return r[c];
        });
    });
}

function smartTrackingStats(delay) {
    saveStats();
    if (FrozenCookies.trackStats == 6) {
        delay /=
            FrozenCookies.delayPurchaseCount == 0
                ? 1 / 1.5
                : delay > FrozenCookies.minDelay
                  ? 2
                  : 1;
        FrozenCookies.smartTrackingBot = setTimeout(function () {
            smartTrackingStats(delay);
        }, delay);
        FrozenCookies.delayPurchaseCount = 0;
    }
}

// Unused
function shouldClickGC() {
    for (var i in Game.shimmers) {
        if (Game.shimmers[i].type == "golden")
            return Game.shimmers[i].life > 0 && FrozenCookies.autoGC;
    }
}

function liveWrinklers() {
    return _.select(Game.wrinklers, function (w) {
        return w.sucked > 0.5 && w.phase > 0;
    }).sort(function (w1, w2) {
        return w1.sucked < w2.sucked;
    });
}

function wrinklerMod(num) {
    return (
        1.1 * num * num * 0.05 * (Game.Has("Wrinklerspawn") ? 1.05 : 1) + (1 - 0.05 * num)
    );
}

function popValue(w) {
    var toSuck = 1.1;
    if (Game.Has("Sacrilegious corruption")) toSuck *= 1.05;
    if (w.type == 1) toSuck *= 3; //shiny wrinklers are an elusive, profitable breed
    var sucked = w.sucked * toSuck; //cookie dough does weird things inside wrinkler digestive tracts
    if (Game.Has("Wrinklerspawn")) sucked *= 1.05;
    return sucked;
}

function shouldPopWrinklers() {
    var toPop = [];
    var living = liveWrinklers();
    if (living.length > 0) {
        if (
            (Game.season == "halloween" || Game.season == "easter") &&
            !haveAll(Game.season)
        ) {
            toPop = living.map(function (w) {
                return w.id;
            });
        } else {
            var delay = delayAmount();
            var wrinklerList = Game.wrinklers;
            var nextRecNeeded = nextPurchase().cost + delay - Game.cookies;
            var nextRecCps = nextPurchase().delta_cps;
            var wrinklersNeeded = wrinklerList
                .sort(function (w1, w2) {
                    return w1.sucked < w2.sucked;
                })
                .reduce(
                    function (current, w) {
                        var futureWrinklers = living.length - (current.ids.length + 1);
                        if (
                            current.total < nextRecNeeded &&
                            effectiveCps(delay, Game.elderWrath, futureWrinklers) +
                                nextRecCps >
                                effectiveCps()
                        ) {
                            current.ids.push(w.id);
                            current.total += popValue(w);
                        }
                        return current;
                    },
                    {
                        total: 0,
                        ids: [],
                    }
                );
            toPop = wrinklersNeeded.total > nextRecNeeded ? wrinklersNeeded.ids : toPop;
        }
    }
    return toPop;
}

function autoFrenzyClick() {
    if (hasClickBuff() && !FrozenCookies.autoFrenzyBot) {
        if (FrozenCookies.autoclickBot) {
            clearInterval(FrozenCookies.autoclickBot);
            FrozenCookies.autoclickBot = 0;
        }
        FrozenCookies.autoFrenzyBot = setInterval(
            fcClickCookie,
            1000 / FrozenCookies.frenzyClickSpeed
        );
    } else if (!hasClickBuff() && FrozenCookies.autoFrenzyBot) {
        clearInterval(FrozenCookies.autoFrenzyBot);
        FrozenCookies.autoFrenzyBot = 0;
        if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
            FrozenCookies.autoclickBot = setInterval(
                fcClickCookie,
                1000 / FrozenCookies.cookieClickSpeed
            );
        }
    }
}

function autoGSBuy() {
    if (hasClickBuff() && !Game.hasBuff("Cursed finger")) {
        if (
            Game.Upgrades["Golden switch [off]"].unlocked &&
            !Game.Upgrades["Golden switch [off]"].bought
        ) {
            Game.Upgrades["Golden switch [off]"].buy();
        }
    } else if (!hasClickBuff()) {
        if (
            Game.Upgrades["Golden switch [on]"].unlocked &&
            !Game.Upgrades["Golden switch [on]"].bought
        ) {
            Game.recalculateGains = 1; // Ensure price is updated since Frenzy ended
            Game.Upgrades["Golden switch [on]"].buy();
        }
    }
}

function safeBuy(bldg, count) {
    const toBuy = Math.max(Math.floor(count ?? 1), 1);
    const initialAmount = bldg.amount;
    const maxAttempts = 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const buyModeWasNegative = Game.buyMode === -1;

        if (buyModeWasNegative) Game.buyMode = 1;
        bldg.buy(toBuy);
        if (buyModeWasNegative) Game.buyMode = -1;

        const newAmount = bldg.amount;
        const actuallyBought = newAmount - initialAmount;

        if (actuallyBought >= toBuy) return; // Full success
        if (actuallyBought > 0) {
            return safeBuy(bldg, toBuy - actuallyBought); // Partial success
        }
        // If nothing bought, loop again
    }

    // Retry in halves if all attempts fail
    if (toBuy > 1) {
        const half = Math.floor(toBuy / 2);
        safeBuy(bldg, half);
        safeBuy(bldg, toBuy - half);
    }
}

function autoGodzamokAction() {
    if (!T) return;

    // if Godz is here and autoGodzamok is set
    if (Game.hasGod("ruin") && FrozenCookies.autoGodzamok) {
        // Need at least 10 of each to be useful
        //if (Game.Objects["Mine"].amount < 10 || Game.Objects["Factory"].amount < 10) return;
        var countMine = Game.Objects["Mine"].amount;
        var countFactory = Game.Objects["Factory"].amount;

        //Automatically sell all mines and factories
        if (
            !Game.hasBuff("Devastation") &&
            !Game.hasBuff("Cursed finger") &&
            hasClickBuff()
        ) {
            Game.Objects["Mine"].sell(countMine);
            Game.Objects["Factory"].sell(countFactory);
            //Rebuy mines
            if (FrozenCookies.mineLimit) {
                safeBuy(Game.Objects["Mine"], FrozenCookies.mineMax);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + FrozenCookies.mineMax + " mines");
            } else {
                safeBuy(Game.Objects["Mine"], countMine);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + countMine + " mines");
            }
            //Rebuy factories
            if (FrozenCookies.factoryLimit) {
                safeBuy(Game.Objects["Factory"], FrozenCookies.factoryMax);
                FrozenCookies.autobuyCount += 1;
                logEvent(
                    "AutoGodzamok",
                    "Bought " + FrozenCookies.factoryMax + " factories"
                );
            } else {
                safeBuy(Game.Objects["Factory"], countFactory);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + countFactory + " factories");
            }
        }
    }
}

function goldenCookieLife() {
    for (var i in Game.shimmers) {
        if (Game.shimmers[i].type == "golden") return Game.shimmers[i].life;
    }
    return null;
}

function reindeerLife() {
    for (var i in Game.shimmers) {
        if (Game.shimmers[i].type == "reindeer") return Game.shimmers[i].life;
    }
    return null;
}

function fcClickCookie() {
    if (!Game.OnAscend && !Game.AscendTimer && !Game.specialTabHovered)
        Game.ClickCookie();
}

// --- Reward cookie handling functions ---
function isRewardCookie(upgrade) {
    if (!upgrade || !upgradeJson[upgrade.id]) return false;
    var prereq = upgradeJson[upgrade.id].buildings;
    if (!prereq || prereq.length < 10) return false;
    var allSame = prereq.every(function (v) {
        return v > 0 && v === prereq[0];
    });
    return allSame;
}

function getRewardCookieBuildingTargets(upgrade) {
    if (!upgrade || !upgradeJson[upgrade.id]) return [];
    var prereq = upgradeJson[upgrade.id].buildings;
    return prereq.map(function (amt, idx) {
        return { id: idx, amount: amt };
    });
}

function restoreBuildingLimits() {
    // Sells excess buildings to return to user limits
    if (FrozenCookies.towerLimit) {
        var obj = Game.Objects["Wizard tower"];
        if (obj.amount > FrozenCookies.manaMax)
            obj.sell(obj.amount - FrozenCookies.manaMax);
    }
    if (FrozenCookies.mineLimit) {
        var obj = Game.Objects["Mine"];
        if (obj.amount > FrozenCookies.mineMax)
            obj.sell(obj.amount - FrozenCookies.mineMax);
    }
    if (FrozenCookies.factoryLimit) {
        var obj = Game.Objects["Factory"];
        if (obj.amount > FrozenCookies.factoryMax)
            obj.sell(obj.amount - FrozenCookies.factoryMax);
    }
    if (FrozenCookies.autoDragonOrbs && FrozenCookies.orbLimit) {
        var obj = Game.Objects["You"];
        if (obj.amount > FrozenCookies.orbMax)
            obj.sell(obj.amount - FrozenCookies.orbMax);
    }
}

function autoCookie() {
    // Skip if we're already processing, or if game is in ascension state
    if (!FrozenCookies.processing && !Game.OnAscend && !Game.AscendTimer) {
        FrozenCookies.processing = true;

        // Track execution time for performance monitoring
        const startTime = Date.now();

        // Check for reward cookies first - these are special cookies that require
        // specific building counts and should be prioritized
        var chainRec = nextChainedPurchase();
        if (
            chainRec &&
            chainRec.type === "upgrade" &&
            isRewardCookie(chainRec.purchase)
        ) {
            // Temporarily ignore limits and buy up to required amount for each building
            var targets = getRewardCookieBuildingTargets(chainRec.purchase);
            targets.forEach(function (t) {
                var obj = Game.ObjectsById[t.id];
                if (obj && obj.amount < t.amount) {
                    obj.buy(t.amount - obj.amount);
                }
            });

            // Try to buy the reward cookie if unlocked and affordable
            if (
                chainRec.purchase.unlocked &&
                !chainRec.purchase.bought &&
                Game.cookies >= chainRec.purchase.getPrice()
            ) {
                chainRec.purchase.buy();
                logEvent(
                    "RewardCookie",
                    "Auto-bought " + chainRec.purchase.name
                );
                // Call the global function to restore building limits after buying special cookies
                restoreBuildingLimits();

                // We need to recalculate caches after this special purchase
                invalidateUpgradeCache();
                invalidateBuildingCache();
            }
        }

        // Use a cached calculation for HC amount if possible
        // Only recalculate every few cycles to avoid expensive calculations
        if (
            !FrozenCookies.nextHCRecalc ||
            Date.now() >= FrozenCookies.nextHCRecalc
        ) {
            var currentHCAmount = Game.HowMuchPrestige(
                Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
            );

        if (Math.floor(FrozenCookies.lastHCAmount) < Math.floor(currentHCAmount)) {
            var changeAmount = currentHCAmount - FrozenCookies.lastHCAmount;
            FrozenCookies.lastHCAmount = currentHCAmount;
            FrozenCookies.prevLastHCTime = FrozenCookies.lastHCTime;
            FrozenCookies.lastHCTime = Date.now();
            var currHCPercent =
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

            // Set next recalculation time (every 10 seconds is usually sufficient for HC tracking)
            FrozenCookies.nextHCRecalc = Date.now() + 10000;
        } // Track game state to only update caches when necessary
        const gameStateChanged =
            !FrozenCookies.lastCookiesEarned ||
            Game.cookiesEarned !== FrozenCookies.lastCookiesEarned ||
            Game.UpgradesInStore.length !== FrozenCookies.lastUpgradeCount ||
            Game.BuildingsOwned !== FrozenCookies.lastBuildingsOwned ||
            Game.shimmerTypes.golden.n !== FrozenCookies.lastGCState || // Track golden cookie count
            Game.shimmerTypes.reindeer.n !== FrozenCookies.lastReindeerState; // Track reindeer count

        if (gameStateChanged) {
            // Update game state tracking
            FrozenCookies.lastCookiesEarned = Game.cookiesEarned;
            FrozenCookies.lastUpgradeCount = Game.UpgradesInStore.length;
            FrozenCookies.lastBuildingsOwned = Game.BuildingsOwned;
            FrozenCookies.lastGCState = Game.shimmerTypes.golden.n;
            FrozenCookies.lastReindeerState = Game.shimmerTypes.reindeer.n;

            // Only update caches if game state has changed
            updateCaches();
        }

        var recommendation = nextPurchase();
        var delay = delayAmount();

        // Sugar lump handling - only check if it's close to ripening to save calculations
        if (FrozenCookies.autoSL == 1) {
            var started = Game.lumpT;
            var ripeAge = Math.ceil(Game.lumpRipeAge);
            var timeToRipe = ripeAge - (Date.now() - started);

            // Only check if sugar lump is within 5 seconds of ripening or already ripe
            if (timeToRipe <= 5000 || timeToRipe <= 0) {
                if (
                    Date.now() - started >= ripeAge &&
                    Game.dragonLevel >= 21 &&
                    FrozenCookies.dragonsCurve
                ) {
                    autoDragonsCurve();
                } else if (Date.now() - started >= ripeAge) {
                    Game.clickLump();
                }
            }
        }
        if (FrozenCookies.autoSL == 2) autoRigidel(); // Optimize wrinkler handling - only process every few seconds as it's expensive
        if (
            (FrozenCookies.autoWrinkler == 1 ||
                FrozenCookies.autoWrinkler == 2) &&
            (!FrozenCookies.lastWrinklerCheck ||
                Date.now() - FrozenCookies.lastWrinklerCheck > 3000)
        ) {
            // Cache wrinkler check time
            FrozenCookies.lastWrinklerCheck = Date.now();

            var popCount = 0;

            if (FrozenCookies.autoWrinkler == 1) {
                // Mode 1: Pop specific wrinklers based on strategy
                var popList = shouldPopWrinklers();

                // Use more efficient filtering to reduce iterations
                if (popList.length > 0) {
                    var wrinklersToProcess = Game.wrinklers.filter((w) =>
                        popList.includes(w.id)
                    );

                    // Handle regular/shiny wrinklers differently
                    if (FrozenCookies.shinyPop == 1) {
                        wrinklersToProcess.forEach(function (w) {
                            if (w.type !== 1) {
                                // Skip shiny wrinklers
                                w.hp = 0;
                                popCount++;
                            }
                        });
                    } else {
                        wrinklersToProcess.forEach(function (w) {
                            w.hp = 0;
                            popCount++;
                        });
                    }
                }
            } else if (FrozenCookies.autoWrinkler == 2) {
                // Mode 2: Pop all close wrinklers

                // Direct iteration is faster than forEach
                for (var i = 0; i < Game.wrinklers.length; i++) {
                    var w = Game.wrinklers[i];
                    if (w.close) {
                        if (FrozenCookies.shinyPop == 1 && w.type === 1) {
                            // Skip shiny wrinklers if needed
                            continue;
                        }
                        w.hp = 0;
                        popCount++;
                        // Invalidate caches after popping wrinklers
                        invalidateUpgradeCache();
                        invalidateBuildingCache();
                    }
                }
            }

            // Only log if we actually popped something
            if (popCount > 0) {
                logEvent("Wrinkler", "Popped " + popCount + " wrinklers.");
            }
        }
        var itemBought = false;

        // Only calculate expensive nextChainedPurchase() if absolutely needed
        const hasEnoughCookies = Game.cookies >= delay + recommendation.cost;
        const isPledge =
            recommendation.purchase &&
            recommendation.purchase.name == "Elder Pledge";
        const shouldCheckChained = !FrozenCookies.pastemode && hasEnoughCookies;

        // Decide whether to buy based on conditions
        const shouldBuy =
            FrozenCookies.autoBuy &&
            (Game.cookies >= delay + recommendation.cost ||
                recommendation.purchase.name == "Elder Pledge") &&
            (FrozenCookies.pastemode || isFinite(nextChainedPurchase().efficiency))
        ) {
            //    if (FrozenCookies.autoBuy && (Game.cookies >= delay + recommendation.cost)) {
            //console.log('something should get bought');
            recommendation.time = Date.now() - Game.startDate;
            //      full_history.push(recommendation);  // Probably leaky, maybe laggy?
            recommendation.purchase.clickFunction = null;
            disabledPopups = false;
            //      console.log(purchase.name + ': ' + Beautify(recommendation.efficiency) + ',' + Beautify(recommendation.delta_cps));
            if (
                Math.floor(Game.HowMuchPrestige(Game.cookiesReset + Game.cookiesEarned)) -
                    Math.floor(Game.HowMuchPrestige(Game.cookiesReset)) <
                    1 &&
                Game.Has("Inspired checklist") &&
                FrozenCookies.autoBuyAll &&
                nextPurchase().type == "upgrade" &&
                Game.cookies >= nextPurchase().cost &&
                nextPurchase().purchase.name != "Bingo center/Research facility" &&
                nextPurchase().purchase.name != "Specialized chocolate chips" &&
                nextPurchase().purchase.name != "Designer cocoa beans" &&
                nextPurchase().purchase.name != "Ritual rolling pins" &&
                nextPurchase().purchase.name != "Underworld ovens" &&
                nextPurchase().purchase.name != "One mind" &&
                nextPurchase().purchase.name != "Exotic nuts" &&
                nextPurchase().purchase.name != "Communal brainsweep" &&
                nextPurchase().purchase.name != "Arcane sugar" &&
                nextPurchase().purchase.name != "Elder Pact"
            ) {
                document.getElementById("storeBuyAllButton").click();
                logEvent("Autobuy", "Bought all upgrades!");
            } else if (
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
                        Game.Objects["Mine"].amount >= FrozenCookies.mineMax - 100) ||
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
                safeBuy(recommendation.purchase, 1);
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
                        Game.Objects["Mine"].amount >= FrozenCookies.mineMax - 10) ||
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
                safeBuy(recommendation.purchase, 1);
                document.getElementById("storeBulk10").click();
            } else if (recommendation.type == "building") {
                safeBuy(recommendation.purchase, 1);
            } else {
                recommendation.purchase.buy();
            }
            FrozenCookies.autobuyCount += 1;
            if (FrozenCookies.trackStats == 5 && recommendation.type == "upgrade") {
                saveStats();
            } else if (FrozenCookies.trackStats == 6) {
                FrozenCookies.delayPurchaseCount += 1;
            }
            if (FrozenCookies.purchaseLog == 1) {
                logEvent(
                    "Store",
                    "Autobought " +
                        recommendation.purchase.name +
                        " for " +
                        Beautify(recommendation.cost) +
                        ", resulting in " +
                        Beautify(recommendation.delta_cps) +
                        " CPS."
                );
            }
            disabledPopups = true;
            if (FrozenCookies.autobuyCount >= 10) {
                Game.Draw();
                FrozenCookies.autobuyCount = 0;
            }
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.processing = false;
            itemBought = true;
        }

        if (
            FrozenCookies.autoAscendToggle == 1 &&
            FrozenCookies.autoAscend == 1 &&
            !Game.OnAscend &&
            !Game.AscendTimer &&
            Game.prestige > 0 &&
            FrozenCookies.HCAscendAmount > 0 &&
            (FrozenCookies.comboAscend == 1 || cpsBonus() < FrozenCookies.minCpSMult)
        ) {
            var resetPrestige = Game.HowMuchPrestige(
                Game.cookiesReset +
                    Game.cookiesEarned +
                    wrinklerValue() +
                    chocolateValue()
            );
            if (
                resetPrestige - Game.prestige >= FrozenCookies.HCAscendAmount &&
                FrozenCookies.HCAscendAmount > 0
            ) {
                Game.ClosePrompt();
                Game.Ascend(1);
                setTimeout(function () {
                    Game.ClosePrompt();
                    Game.Reincarnate(1);
                }, 10000);
            }
        }

        if (
            FrozenCookies.autoAscendToggle == 1 &&
            FrozenCookies.autoAscend == 2 &&
            !Game.OnAscend &&
            !Game.AscendTimer &&
            Game.prestige > 0 &&
            FrozenCookies.HCAscendAmount > 0 &&
            (FrozenCookies.comboAscend == 1 || cpsBonus() < FrozenCookies.minCpSMult)
        ) {
            var resetPrestige = Game.HowMuchPrestige(
                Game.cookiesReset +
                    Game.cookiesEarned +
                    wrinklerValue() +
                    chocolateValue()
            );
            if (resetPrestige >= Game.prestige * 2 && FrozenCookies.HCAscendAmount > 0) {
                Game.ClosePrompt();
                Game.Ascend(1);
                setTimeout(function () {
                    Game.ClosePrompt();
                    Game.Reincarnate(1);
                }, 10000);
            }
        }

        var fps_amounts = [
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
        if (parseInt(fps_amounts[FrozenCookies["fpsModifier"]]) != Game.fps)
            Game.fps = parseInt(fps_amounts[FrozenCookies["fpsModifier"]]);

        // This apparently *has* to stay here, or else fast purchases will multi-click it.
        if (goldenCookieLife() && FrozenCookies.autoGC) {
            for (var i in Game.shimmers) {
                if (
                    Game.shimmers[i].type == "golden"
                    // && (Game.shimmer.wrath != 1 || FrozenCookies.autoWC)
                )
                    Game.shimmers[i].pop();
            }
        }
        if (reindeerLife() > 0 && FrozenCookies.autoReindeer) {
            for (var i in Game.shimmers) {
                if (Game.shimmers[i].type == "reindeer") Game.shimmers[i].pop();
            }
        }
        if (FrozenCookies.autoBlacklistOff) autoBlacklistOff();
        var currentFrenzy = cpsBonus() * clickBuffBonus();
        if (currentFrenzy != FrozenCookies.last_gc_state) {
            if (FrozenCookies.last_gc_state != 1 && currentFrenzy == 1) {
                logEvent("GC", "Frenzy ended, cookie production x1");
                if (FrozenCookies.hc_gain) {
                    logEvent(
                        "HC",
                        "Won " +
                            FrozenCookies.hc_gain +
                            " heavenly chips during Frenzy. Rate: " +
                            (FrozenCookies.hc_gain * 1000) /
                                (Date.now() - FrozenCookies.hc_gain_time) +
                            " HC/s."
                    );
                    FrozenCookies.hc_gain_time = Date.now();
                    FrozenCookies.hc_gain = 0;
                }
            } else {
                if (FrozenCookies.last_gc_state != 1) {
                    logEvent(
                        "GC",
                        "Previous Frenzy x" + FrozenCookies.last_gc_state + "interrupted."
                    );
                } else if (FrozenCookies.hc_gain) {
                    logEvent(
                        "HC",
                        "Won " +
                            FrozenCookies.hc_gain +
                            " heavenly chips outside of Frenzy. Rate: " +
                            (FrozenCookies.hc_gain * 1000) /
                                (Date.now() - FrozenCookies.hc_gain_time) +
                            " HC/s."
                    );
                    FrozenCookies.hc_gain_time = Date.now();
                    FrozenCookies.hc_gain = 0;
                }
                logEvent(
                    "GC",
                    "Starting " +
                        (hasClickBuff() ? "Clicking " : "") +
                        "Frenzy x" +
                        currentFrenzy
                );
            }
            if (FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] == null)
                FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] = 0;
            FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] +=
                Date.now() - FrozenCookies.last_gc_time;
            FrozenCookies.last_gc_state = currentFrenzy;
            FrozenCookies.last_gc_time = Date.now();
        } // Track performance metrics
        const executionTime = Date.now() - startTime;
        if (!FrozenCookies.perfStats) {
            FrozenCookies.perfStats = {
                count: 0,
                totalTime: 0,
                maxTime: 0,
                lastReset: Date.now(),
            };
        }

        FrozenCookies.perfStats.count++;
        FrozenCookies.perfStats.totalTime += executionTime;
        FrozenCookies.perfStats.maxTime = Math.max(
            FrozenCookies.perfStats.maxTime,
            executionTime
        );

        // Reset stats periodically to keep metrics current
        if (Date.now() - FrozenCookies.perfStats.lastReset > 60000) {
            FrozenCookies.perfStats.count = 0;
            FrozenCookies.perfStats.totalTime = 0;
            FrozenCookies.perfStats.maxTime = 0;
            FrozenCookies.perfStats.lastReset = Date.now();
        }

        // Use adaptive frequency - slow down if we're experiencing lag spikes
        let nextFrequency = FrozenCookies.frequency;
        if (executionTime > 100) {
            // If execution took more than 100ms, increase delay slightly
            const oldFreq = nextFrequency;
            nextFrequency = Math.min(FrozenCookies.frequency + 50, 500);
            if (oldFreq !== nextFrequency) {
                logEvent(
                    "Performance",
                    "Increasing delay to " +
                        nextFrequency +
                        "ms due to lag spike (" +
                        executionTime +
                        "ms execution)"
                );
            }
        } else if (
            executionTime < 10 &&
            nextFrequency > FrozenCookies.frequency
        ) {
            // If we're running fast again, gradually return to normal frequency
            const oldFreq = nextFrequency;
            nextFrequency = Math.max(
                FrozenCookies.frequency,
                nextFrequency - 10
            );
            if (oldFreq !== nextFrequency) {
                logEvent(
                    "Performance",
                    "Decreasing delay back to " + nextFrequency + "ms"
                );
            }
        }

        // Reset processing flag
        FrozenCookies.processing = false;

        // Schedule next call - immediately if we bought something, otherwise after delay
        if (FrozenCookies.frequency) {
            FrozenCookies.cookieBot = setTimeout(
                autoCookie,
                itemBought ? 0 : nextFrequency
            );
        }
    } else if (!FrozenCookies.processing && FrozenCookies.frequency) {
        FrozenCookies.cookieBot = setTimeout(autoCookie, FrozenCookies.frequency);
    }
}

// --- Patch autoCookie for reward cookies ---
var _oldAutoCookie = autoCookie;
autoCookie = function () {
    var chainRec = nextChainedPurchase();
    if (chainRec && chainRec.type === "upgrade" && isRewardCookie(chainRec.purchase)) {
        // Temporarily ignore limits and buy up to required amount for each building
        var targets = getRewardCookieBuildingTargets(chainRec.purchase);
        targets.forEach(function (t) {
            var obj = Game.ObjectsById[t.id];
            if (obj && obj.amount < t.amount) {
                obj.buy(t.amount - obj.amount);
            }
        });
        // Try to buy the reward cookie if unlocked and affordable
        if (
            chainRec.purchase.unlocked &&
            !chainRec.purchase.bought &&
            Game.cookies >= chainRec.purchase.getPrice()
        ) {
            chainRec.purchase.buy();
            restoreBuildingLimits();
        }
        // Continue with normal autobuy for other things
        _oldAutoCookie();
        return;
    }
    // Default behavior
    _oldAutoCookie();
};

function FCStart() {
    //  To allow polling frequency to change, clear intervals before setting new ones.

    if (FrozenCookies.cookieBot) {
        clearInterval(FrozenCookies.cookieBot);
        FrozenCookies.cookieBot = 0;
    }
    if (FrozenCookies.autoclickBot) {
        clearInterval(FrozenCookies.autoclickBot);
        FrozenCookies.autoclickBot = 0;
    }
    if (FrozenCookies.statBot) {
        clearInterval(FrozenCookies.statBot);
        FrozenCookies.statBot = 0;
    }

    if (FrozenCookies.autoGSBot) {
        clearInterval(FrozenCookies.autoGSBot);
        FrozenCookies.autoGSBot = 0;
    }

    if (FrozenCookies.autoGodzamokBot) {
        clearInterval(FrozenCookies.autoGodzamokBot);
        FrozenCookies.autoGodzamokBot = 0;
    }
    if (FrozenCookies.autoCastingBot) {
        clearInterval(FrozenCookies.autoCastingBot);
        FrozenCookies.autoCastingBot = 0;
    }
    if (FrozenCookies.autoFortuneBot) {
        clearInterval(FrozenCookies.autoFortuneBot);
        FrozenCookies.autoFortuneBot = 0;
    }

    if (FrozenCookies.autoFTHOFComboBot) {
        clearInterval(FrozenCookies.autoFTHOFComboBot);
        FrozenCookies.autoFTHOFComboBot = 0;
    }

    if (FrozenCookies.auto100ConsistencyComboBot) {
        clearInterval(FrozenCookies.auto100ConsistencyComboBot);
        FrozenCookies.auto100ConsistencyComboBot = 0;
    }

    if (FrozenCookies.autoEasterBot) {
        clearInterval(FrozenCookies.autoEasterBot);
        FrozenCookies.autoEasterBot = 0;
    }

    if (FrozenCookies.autoHalloweenBot) {
        clearInterval(FrozenCookies.autoHalloweenBot);
        FrozenCookies.autoHalloweenBot = 0;
    }

    if (FrozenCookies.autoBankBot) {
        clearInterval(FrozenCookies.autoBankBot);
        FrozenCookies.autoBankBot = 0;
    }

    if (FrozenCookies.autoBrokerBot) {
        clearInterval(FrozenCookies.autoBrokerBot);
        FrozenCookies.autoBrokerBot = 0;
    }

    if (FrozenCookies.autoLoanBot) {
        clearInterval(FrozenCookies.autoLoanBot);
        FrozenCookies.autoLoanBot = 0;
    }

    if (FrozenCookies.autoDragonBot) {
        clearInterval(FrozenCookies.autoDragonBot);
        FrozenCookies.autoDragonBot = 0;
    }

    if (FrozenCookies.petDragonBot) {
        clearInterval(FrozenCookies.petDragonBot);
        FrozenCookies.petDragonBot = 0;
    }

    if (FrozenCookies.autoDragonAura0Bot) {
        clearInterval(FrozenCookies.autoDragonAura0Bot);
        FrozenCookies.autoDragonAura0Bot = 0;
    }

    if (FrozenCookies.autoDragonAura1Bot) {
        clearInterval(FrozenCookies.autoDragonAura1Bot);
        FrozenCookies.autoDragonAura1Bot = 0;
    }

    if (FrozenCookies.autoDragonOrbsBot) {
        clearInterval(FrozenCookies.autoDragonOrbsBot);
        FrozenCookies.autoDragonOrbsBot = 0;
    }

    if (FrozenCookies.autoSugarFrenzyBot) {
        clearInterval(FrozenCookies.autoSugarFrenzyBot);
        FrozenCookies.autoSugarFrenzyBot = 0;
    }

    if (FrozenCookies.autoWorship0Bot) {
        clearInterval(FrozenCookies.autoWorship0Bot);
        FrozenCookies.autoWorship0Bot = 0;
    }

    if (FrozenCookies.autoWorship1Bot) {
        clearInterval(FrozenCookies.autoWorship1Bot);
        FrozenCookies.autoWorship1Bot = 0;
    }

    if (FrozenCookies.autoWorship2Bot) {
        clearInterval(FrozenCookies.autoWorship2Bot);
        FrozenCookies.autoWorship2Bot = 0;
    }

    if (FrozenCookies.autoCycliusBot) {
        clearInterval(FrozenCookies.autoCycliusBot);
        FrozenCookies.autoCycliusBot = 0;
    }

    if (FrozenCookies.recommendedSettingsBot) {
        clearInterval(FrozenCookies.recommendedSettingsBot);
        FrozenCookies.recommendedSettingsBot = 0;
    } // Now create new intervals with their specified frequencies.
    // Default frequency is 100ms = 1/10th of a second

    // Initialize performance monitoring variables
    FrozenCookies.perfStats = {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        lastReset: Date.now(),
    };

    // Initialize cache timer tracking
    FrozenCookies.nextHCRecalc = 0;
    FrozenCookies.lastWrinklerCheck = 0;
    FrozenCookies.lastCookiesEarned = 0;
    FrozenCookies.lastBuildingsOwned = 0;

    if (FrozenCookies.frequency) {
        FrozenCookies.cookieBot = setTimeout(autoCookie, FrozenCookies.frequency);
    }

    if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
        FrozenCookies.autoclickBot = setInterval(
            fcClickCookie,
            1000 / FrozenCookies.cookieClickSpeed
        );
    }

    if (FrozenCookies.autoFrenzy && FrozenCookies.frenzyClickSpeed) {
        FrozenCookies.frenzyClickBot = setInterval(
            autoFrenzyClick,
            FrozenCookies.frequency
        );
    }

    if (FrozenCookies.autoGS) {
        FrozenCookies.autoGSBot = setInterval(autoGSBuy, FrozenCookies.frequency);
    }

    if (FrozenCookies.autoGodzamok) {
        FrozenCookies.autoGodzamokBot = setInterval(
            autoGodzamokAction,
            FrozenCookies.frequency
        );
    }

    if (FrozenCookies.autoCasting) {
        FrozenCookies.autoCastingBot = setInterval(
            autoCast,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoFortune) {
        FrozenCookies.autoFortuneBot = setInterval(
            autoTicker,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoFTHOFCombo) {
        FrozenCookies.autoFTHOFComboBot = setInterval(
            autoFTHOFComboAction,
            FrozenCookies.frequency * 2
        );
    }

    if (FrozenCookies.auto100ConsistencyCombo) {
        FrozenCookies.auto100ConsistencyComboBot = setInterval(
            auto100ConsistencyComboAction,
            FrozenCookies.frequency * 2
        );
    }

    if (FrozenCookies.autoSweet) {
        FrozenCookies.autoSweetBot = setInterval(
            autoSweetAction,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoEaster) {
        FrozenCookies.autoEasterBot = setInterval(
            autoEasterAction,
            FrozenCookies.frequency * 5
        );
    }

    if (FrozenCookies.autoHalloween) {
        FrozenCookies.autoHalloweenBot = setInterval(
            autoHalloweenAction,
            FrozenCookies.frequency * 5
        );
    }

    if (FrozenCookies.autoBank) {
        FrozenCookies.autoBankBot = setInterval(
            autoBankAction,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoBroker) {
        FrozenCookies.autoBrokerBot = setInterval(
            autoBrokerAction,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoLoan) {
        FrozenCookies.autoLoanBot = setInterval(autoLoanBuy, FrozenCookies.frequency * 2);
    }

    if (FrozenCookies.autoDragon) {
        FrozenCookies.autoDragonBot = setInterval(
            autoDragonAction,
            FrozenCookies.frequency
        );
    }

    if (FrozenCookies.petDragon) {
        FrozenCookies.petDragonBot = setInterval(
            petDragonAction,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoDragonAura0) {
        FrozenCookies.autoDragonAura0Bot = setInterval(
            autoDragonAura0Action,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoDragonAura1) {
        FrozenCookies.autoDragonAura1Bot = setInterval(
            autoDragonAura1Action,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoDragonOrbs) {
        FrozenCookies.autoDragonOrbsBot = setInterval(
            autoDragonOrbsAction,
            FrozenCookies.frequency * 10
        );
    }

    if (FrozenCookies.autoSugarFrenzy) {
        FrozenCookies.autoSugarFrenzyBot = setInterval(
            autoSugarFrenzyAction,
            FrozenCookies.frequency * 2
        );
    }

    if (FrozenCookies.autoWorship0) {
        FrozenCookies.autoWorship0Bot = setInterval(
            autoWorship0Action,
            FrozenCookies.frequency * 5
        );
    }

    if (FrozenCookies.autoWorship1) {
        FrozenCookies.autoWorship1Bot = setInterval(
            autoWorship1Action,
            FrozenCookies.frequency * 5
        );
    }

    if (FrozenCookies.autoWorship2) {
        FrozenCookies.autoWorship2Bot = setInterval(
            autoWorship2Action,
            FrozenCookies.frequency * 5
        );
    }

    if (FrozenCookies.autoCyclius) {
        FrozenCookies.autoCycliusBot = setInterval(
            autoCycliusAction,
            FrozenCookies.frequency * 600 // 1 minute
        );
    }

    if (FrozenCookies.recommendedSettings) {
        FrozenCookies.recommendedSettingsBot = setInterval(
            recommendedSettingsAction,
            FrozenCookies.frequency
        );
    }

    if (statSpeed(FrozenCookies.trackStats) > 0) {
        FrozenCookies.statBot = setInterval(
            saveStats,
            statSpeed(FrozenCookies.trackStats)
        );
    } else if (FrozenCookies.trackStats == 6 && !FrozenCookies.smartTrackingBot) {
        FrozenCookies.smartTrackingBot = setTimeout(function () {
            smartTrackingStats(FrozenCookies.minDelay * 8);
        }, FrozenCookies.minDelay);
    }
    FCMenu();
}
