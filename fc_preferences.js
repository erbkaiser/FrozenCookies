FrozenCookies.preferenceValues = {
    // Clicking options
    clickingOptions: {
        hint: "Auto clicking options:",
    },
    autoClick: {
        hint: "Auto-click the big cookie.",
        display: ["Autoclick OFF", "Autoclick ON"],
        default: 0,
        extras: '<a class="option" id="cookieClickSpeed" onclick="updateSpeed(\'cookieClickSpeed\');">${cookieClickSpeed} clicks/sec</a>',
    },
    autoFrenzy: {
        hint: "Auto-click only during click frenzies.",
        display: ["Autofrenzy OFF", "Autofrenzy ON"],
        default: 0,
        extras: '<a class="option" id="frenzyClickSpeed" onclick="updateSpeed(\'frenzyClickSpeed\');">${frenzyClickSpeed} clicks/sec</a>',
    },
    autoGC: {
        hint: "Auto-click golden and wrath cookies.",
        display: ["Autoclick GC OFF", "Autoclick GC ON"],
        default: 0,
    },
    autoReindeer: {
        hint: "Auto-click reindeer.",
        display: ["Autoclick Reindeer OFF", "Autoclick Reindeer ON"],
        default: 0,
    },
    autoFortune: {
        hint: "Auto-click fortunes in the news ticker.",
        display: ["Auto Fortune OFF", "Auto Fortune ON"],
        default: 0,
    },

    // Autobuy options
    buyingOptions: {
        hint: "Auto buying options:",
    },
    autoBuy: {
        hint: "Auto-buy the most efficient building.",
        display: ["AutoBuy OFF", "AutoBuy ON"],
        default: 0,
    },
    otherUpgrades: {
        hint: "Auto-buy upgrades that don’t directly boost CpS.",
        display: ["Other Upgrades OFF", "Other Upgrades ON"],
        default: 1,
    },
    autoBlacklistOff: {
        hint: "Disable blacklist when its goal is reached.",
        display: ["Auto Blacklist OFF", "Auto Blacklist ON"],
        default: 0,
    },
    blacklist: {
        hint: "Restrict purchases for achievements or events.",
        display: [
            "Blacklist OFF",
            "Blacklist Mode SPEEDRUN",
            "Blacklist Mode HARDCORE",
            "Blacklist Mode GRANDMAPOCALYPSE",
            "Blacklist Mode NO BUILDINGS",
        ],
        default: 0,
    },
    mineLimit: {
        hint: "Limit mines for Godzamok combos.",
        display: ["Mine Limit OFF", "Mine Limit ON"],
        default: 0,
        extras: '<a class="option" id="mineMax" onclick="updateMineMax(\'mineMax\');">${mineMax} Mines</a>',
    },
    factoryLimit: {
        hint: "Limit factories for Godzamok combos.",
        display: ["Factory Limit OFF", "Factory Limit ON"],
        default: 0,
        extras: '<a class="option" id="factoryMax" onclick="updateFactoryMax(\'factoryMax\');">${factoryMax} Factories</a>',
    },
    pastemode: {
        hint: "Buy as many buildings as possible (not recommended).",
        display: ["Pastemode OFF", "Pastemode ON"],
        default: 0,
    },

    // Other auto options
    autoOtherOptions: {
        hint: "Other automation options:",
    },
    autoBulk: {
        hint: "Set bulk buy mode after ascension.",
        display: ["Auto Bulkbuy OFF", "Auto Bulkbuy x10", "Auto Bulkbuy x100"],
        default: 0,
    },
    autoBuyAll: {
        hint: "Auto-buy all upgrades until a prestige level is earned.",
        display: ["Auto Buy All Upgrades OFF", "Auto Buy All Upgrades ON"],
        default: 0,
    },
    autoAscendToggle: {
        hint: "Auto-ascend at a set number of new HCs or when prestige doubles.",
        display: ["Auto Ascend OFF", "Auto Ascend ON"],
        default: 0,
    },
    autoAscend: {
        hint: "Choose auto-ascend method.",
        display: [
            "Auto-ascend OFF",
            "Auto-ascend at set amount",
            "Auto-ascend when prestige amount will be doubled",
        ],
        default: 0,
        extras: '<a class="option" id="chipsToAscend" onclick="updateAscendAmount(\'HCAscendAmount\');">${HCAscendAmount} heavenly chips</a>',
    },
    comboAscend: {
        hint: "Block auto-ascend during large combos.",
        display: ["Ascend during combo OFF", "Ascend during combo ON"],
        default: 0,
        extras: '<a class="option" id="minCpSMult" onclick="updateCpSMultMin(\'minCpSMult\');">x${minCpSMult} minimum Frenzy</a>',
    },
    autoWrinkler: {
        hint: "Auto-pop wrinklers (efficiently or instantly).",
        display: [
            "Autopop Wrinklers OFF",
            "Autopop Wrinklers EFFICIENTLY",
            "Autopop Wrinklers INSTANTLY",
        ],
        default: 0,
    },
    shinyPop: {
        hint: "Protect shiny wrinklers from being popped.",
        display: ["Save Shiny Wrinklers OFF", "Save Shiny Wrinklers ON"],
        default: 0,
    },
    autoSL: {
        hint: "Auto-harvest sugar lumps (optionally with Rigidel).",
        display: [
            "Autoharvest SL OFF",
            "Autoharvest SL ON",
            "Autoharvest SL ON + AUTO RIGIDEL",
        ],
        default: 0,
    },
    dragonsCurve: {
        hint: "Auto-swap Dragon's Curve aura for lump harvests.",
        display: [
            "Auto-Dragon's Curve OFF",
            "Auto-Dragon's Curve ON",
            "Auto-Dragon's Curve ON + REALITY BENDING",
        ],
        default: 0,
    },
    sugarBakingGuard: {
        hint: "Prevent lump spending below 101 for Sugar Baking.",
        display: ["Sugar Baking Guard OFF", "Sugar Baking Guard ON"],
        default: 0,
    },
    autoGS: {
        hint: "Auto-toggle Golden Switch for click frenzies.",
        display: ["Auto-Golden Switch OFF", "Auto-Golden Switch ON"],
        default: 0,
    },
    autoGodzamok: {
        hint: "Auto-sell mines/factories for Godzamok, then rebuy.",
        display: ["Auto-Godzamok OFF", "Auto-Godzamok ON"],
        default: 0,
    },
    autoBank: {
        hint: "Auto-upgrade bank office level.",
        display: ["Auto-Banking OFF", "Auto-Banking ON"],
        default: 0,
    },
    autoBroker: {
        hint: "Auto-hire stock brokers.",
        display: ["Auto-Broker OFF", "Auto-Broker ON"],
        default: 0,
    },
    autoLoan: {
        hint: "Auto-take loans during click frenzies.",
        display: ["Auto-Loans OFF", "Take loans 1 and 2", "Take all 3 loans"],
        default: 0,
        extras: '<a class="option" id="minLoanMult" onclick="updateLoanMultMin(\'minLoanMult\');">x${minLoanMult} minimum Frenzy</a>',
    },

    // Pantheon options
    worshipOptions: {
        hint: "Pantheon options:",
    },
    autoWorshipToggle: {
        hint: "Auto-slot selected gods in Pantheon.",
        display: ["Auto Pantheon OFF", "Auto Pantheon ON"],
        default: 0,
    },
    autoWorship0: {
        hint: "God for DIAMOND slot.",
        display: [
            "No god",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
        ],
        default: 0,
    },
    autoWorship1: {
        hint: "God for RUBY slot.",
        display: [
            "No god",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
        ],
        default: 0,
    },
    autoWorship2: {
        hint: "God for JADE slot.",
        display: [
            "No god",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
        ],
        default: 0,
    },
    autoCyclius: {
        hint: "Auto-swap Cyclius for max bonus.",
        display: [
            "Auto-Cyclius OFF",
            "Auto-Cyclius in RUBY and JADE",
            "Auto-Cyclius in all slots",
        ],
        default: 0,
    },

    // Spell options
    spellOptions: {
        hint: "Grimoire options:",
    },
    towerLimit: {
        hint: "Limit Wizard Towers for max mana.",
        display: ["Wizard Tower Cap OFF", "Wizard Tower Cap ON"],
        default: 0,
        extras: '<a class="option" id="manaMax" onclick="updateManaMax(\'manaMax\');">${manaMax} max Mana</a>',
    },
    autoCasting: {
        hint: "Auto-cast selected spell when mana is full.",
        display: [
            "Auto Cast OFF",
            "Auto Cast CONJURE BAKED GOODS",
            "Auto Cast FORCE THE HAND OF FATE (simple)",
            "Auto Cast FORCE THE HAND OF FATE (smart)",
            "Auto Cast FTHOF (Click and Building Specials only)",
            "Auto Cast SPONTANEOUS EDIFICE",
            "Auto Cast HAGGLER'S CHARM",
        ],
        default: 0,
        extras: '<a class="option" id="minCpSMult" onclick="updateCpSMultMin(\'minCpSMult\');">x${minCpSMult} minimum Frenzy</a>',
    },
    spellNotes: {
        hint: "Only one combo is active at a time. See readme for details.",
    },
    autoFTHOFCombo: {
        hint: "Auto double-cast FTHOF combos.",
        display: ["Double Cast FTHOF OFF", "Double Cast FTHOF ON"],
        default: 0,
    },
    auto100ConsistencyCombo: {
        hint: "Auto 100% Consistency Combo (⚠️ Experimental!).",
        display: [
            "Auto Cast 100% Consistency Combo OFF",
            "Auto Cast 100% Consistency Combo ON",
        ],
        default: 0,
    },
    autoSugarFrenzy: {
        hint: "Auto-buy Sugar Frenzy during first big combo.",
        display: [
            "Auto Sugar Frenzy OFF",
            "ASF for 100% Consistency Combo",
            "ASF also for Double Cast Combo",
        ],
        default: 0,
        extras: '<a class="option" id="minASFMult" onclick="updateASFMultMin(\'minASFMult\');">x${minASFMult} minimum Frenzy</a>',
    },
    autoSweet: {
        hint: "Auto-ascend for Sweet spell (⚠️ Experimental!).",
        display: ["Auto Sweet OFF", "Auto Sweet ON"],
        default: 0,
    },

    // Dragon options
    dragonOptions: {
        hint: "Dragon options:",
    },
    autoDragon: {
        hint: "Auto-upgrade the dragon.",
        display: ["Dragon Upgrading OFF", "Dragon Upgrading ON"],
        default: 0,
    },
    petDragon: {
        hint: "Auto-pet the dragon.",
        display: ["Dragon Petting OFF", "Dragon Petting ON"],
        default: 0,
    },
    autoDragonToggle: {
        hint: "Auto-set dragon auras.",
        display: ["Dragon Auras OFF", "Dragon Auras ON"],
        default: 0,
    },
    dragonNotes: {
        hint: "Select desired auras. Cannot set the same aura to both slots.",
    },
    autoDragonAura0: {
        hint: "Aura for FIRST dragon slot.",
        display: [
            "No Aura",
            "Breath of Milk",
            "Dragon Cursor",
            "Elder Battalion",
            "Reaper of Fields",
            "Earth Shatterer",
            "Master of the Armory",
            "Fierce Hoarder",
            "Dragon God",
            "Arcane Aura",
            "Dragonflight",
            "Ancestral Metamorphosis",
            "Unholy Dominion",
            "Epoch Manipulator",
            "Mind Over Matter",
            "Radiant Appetite",
            "Dragon's Fortune",
            "Dragon's Curve",
            "Reality Bending",
            "Dragon Orbs",
            "Supreme Intellect",
            "Dragon Guts",
        ],
        default: 0,
    },
    autoDragonAura1: {
        hint: "Aura for SECOND dragon slot.",
        display: [
            "No Aura",
            "Breath of Milk",
            "Dragon Cursor",
            "Elder Battalion",
            "Reaper of Fields",
            "Earth Shatterer",
            "Master of the Armory",
            "Fierce Hoarder",
            "Dragon God",
            "Arcane Aura",
            "Dragonflight",
            "Ancestral Metamorphosis",
            "Unholy Dominion",
            "Epoch Manipulator",
            "Mind Over Matter",
            "Radiant Appetite",
            "Dragon's Fortune",
            "Dragon's Curve",
            "Reality Bending",
            "Dragon Orbs",
            "Supreme Intellect",
            "Dragon Guts",
        ],
        default: 0,
    },
    autoDragonOrbs: {
        hint: "Auto-sell Yous for Dragon Orbs if Godzamok not slotted.",
        display: ["Auto-Dragon Orbs OFF", "Auto-Dragon Orbs ON"],
        default: 0,
    },
    orbLimit: {
        hint: "Limit Yous for Dragon Orbs.",
        display: ["You Limit OFF", "You Limit ON"],
        default: 0,
        extras: '<a class="option" id="orbMax" onclick="updateOrbMax(\'orbMax\');">${orbMax} Yous</a>',
    },

    // Season options
    seasonOptions: {
        hint: "Season options:",
    },
    defaultSeasonToggle: {
        hint: "Auto-switch to default season when others are done.",
        display: ["Autobuy Seasons OFF", "Autobuy Seasons ON"],
        default: 0,
    },
    defaultSeason: {
        hint: "Set default season if all drops are unlocked.",
        display: [
            "Default Season OFF",
            "Default Season BUSINESS DAY",
            "Default Season CHRISTMAS",
            "Default Season EASTER",
            "Default Season HALLOWEEN",
            "Default Season VALENTINE'S DAY",
        ],
        default: 0,
    },
    freeSeason: {
        hint: "Stay in base season if no upgrades needed.",
        display: [
            "Free Season OFF",
            "Free Season for CHRISTMAS and BUSINESS DAY",
            "Free Season for ALL",
        ],
        default: 1,
    },
    autoEaster: {
        hint: "Switch to Easter during Cookie Storm if eggs needed.",
        display: ["Auto-Easter Switch OFF", "Auto-Easter Switch ON"],
        default: 0,
    },
    autoHalloween: {
        hint: "Switch to Halloween if wrinklers and biscuits needed.",
        display: ["Auto-Halloween Switch OFF", "Auto-Halloween Switch ON"],
        default: 0,
    },

    // Bank options
    bankOptions: {
        hint: "Bank options (delay autobuy until bank is ready):",
    },
    holdSEBank: {
        hint: "Keep bank for Spontaneous Edifice.",
        display: ["SE Bank OFF", "SE Bank ON"],
        default: 0,
    },
    setHarvestBankPlant: {
        hint: "Keep bank for plant harvests.",
        display: [
            "Harvesting Bank OFF",
            "Harvesting Bank BAKEBERRY",
            "Harvesting Bank CHOCOROOT",
            "Harvesting Bank WHITE CHOCOROOT",
            "Harvesting Bank QUEENBEET",
            "Harvesting Bank DUKETATER",
            "Harvesting Bank CRUMBSPORE",
            "Harvesting Bank DOUGHSHROOM",
        ],
        default: 0,
    },
    setHarvestBankType: {
        hint: "Increase bank for harvests during CpS multipliers.",
        display: [
            "Harvesting during NO CpS MULTIPLIER",
            "Harvesting during FRENZY",
            "Harvesting during BUILDING SPECIAL",
            "Harvesting during FRENZY + BUILDING SPECIAL",
        ],
        default: 0,
        extras: '<a class="option" id="maxSpecials" onclick="updateMaxSpecials(\'maxSpecials\');">${maxSpecials} Building specials</a>',
    },

    // Other options
    otherOptions: {
        hint: "Other options:",
    },
    FCshortcuts: {
        hint: "Enable keyboard shortcuts.",
        display: ["Shortcuts OFF", "Shortcuts ON"],
        default: 1,
    },
    simulatedGCPercent: {
        hint: "Assumed % of golden cookies clicked for efficiency.",
        display: ["GC clicked 0%", "GC clicked 100%"],
        default: 1,
    },

    // Display options
    displayOptions: {
        hint: "Display options:",
    },
    showMissedCookies: {
        hint: "Show missed golden cookie clicks.",
        display: ["Show Missed GCs OFF", "Show Missed GCs ON"],
        default: 0,
    },
    numberDisplay: {
        hint: "Number display format.",
        display: [
            "Number Display RAW",
            "Number Display FULL (million, billion)",
            "Number Display INITIALS (M, B)",
            "Number Display SI UNITS (M, G, T)",
            "Number Display SCIENTIFIC (6.3e12)",
        ],
        default: 1,
    },
    fancyui: {
        hint: "Infobox display type.",
        display: [
            "Infobox OFF",
            "Infobox TEXT ONLY",
            "Infobox WHEEL ONLY",
            "Infobox WHEEL & TEXT",
        ],
        default: 0,
    },
    logging: {
        hint: "Log mod actions to the console.",
        display: ["Logging OFF", "Logging ON"],
        default: 1,
    },
    purchaseLog: {
        hint: "Log every purchase and CpS change.",
        display: ["Purchase Log OFF", "Purchase Log ON"],
        default: 0,
    },

    slowOptions: {
        hint: "Options that may slow the game:",
    },
    fpsModifier: {
        hint: "Set game frame rate.",
        display: [
            "Frame Rate 15 fps",
            "Frame Rate 24 fps",
            "Frame Rate 30 fps",
            "Frame Rate 48 fps",
            "Frame Rate 60 fps",
            "Frame Rate 72 fps",
            "Frame Rate 88 fps",
            "Frame Rate 100 fps",
            "Frame Rate 120 fps",
            "Frame Rate 144 fps",
            "Frame Rate 200 fps",
            "Frame Rate 240 fps",
            "Frame Rate 300 fps",
            "Frame Rate 5 fps",
            "Frame Rate 10 fps",
        ],
        default: 2,
    },
    trackStats: {
        hint: "Track CpS/HC for graphing.",
        display: [
            "Tracking OFF",
            "Tracking EVERY 60s",
            "Tracking EVERY 30m",
            "Tracking EVERY 1h",
            "Tracking EVERY 24h",
            "Tracking ON UPGRADES",
            "Tracking SMART TIMING",
        ],
        default: 0,
        extras: '<a class="option" id="viewStats" onclick="viewStatGraphs();">View Stat Graphs</a>',
    },
    recommendedSettings: {
        hint: "Set all options to recommended defaults. (⚠️ Reloads the game!)",
        display: ["Recommended OFF", "Recommended ON"],
        default: 0,
    },
};
