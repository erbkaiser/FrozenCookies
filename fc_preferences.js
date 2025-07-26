FrozenCookies.preferenceValues = {
    // clicking options
    clickingOptions: {
        hint: "Auto clicking:",
    },
    autoClick: {
        hint: "Auto-click big cookie and set speed.",
        display: ["Autoclick OFF", "Autoclick ON"],
        default: 0,
        extras: '<a class="option" id="cookieClickSpeed" onclick="updateSpeed(\'cookieClickSpeed\');">${cookieClickSpeed} clicks/sec</a>',
    },
    autoFrenzy: {
        hint: "Auto-click for click frenzies.",
        display: ["Autofrenzy OFF", "Autofrenzy ON"],
        default: 0,
        extras: '<a class="option" id="frenzyClickSpeed" onclick="updateSpeed(\'frenzyClickSpeed\');">${frenzyClickSpeed} clicks/sec</a>',
    },
    autoGC: {
        hint: "Auto-click golden/wrath cookies.",
        display: ["Autoclick GC OFF", "Autoclick GC ON"],
        default: 0,
    },
    autoReindeer: {
        hint: "Auto-click reindeer.",
        display: ["Autoclick Reindeer OFF", "Autoclick Reindeer ON"],
        default: 0,
    },
    autoFortune: {
        hint: "Auto-click fortunes in news ticker.",
        display: ["Auto Fortune OFF", "Auto Fortune ON"],
        default: 0,
    },

    // autobuy options
    buyingOptions: {
        hint: "Auto-buying:",
    },
    autoBuy: {
        hint: "Auto-buy most efficient building/upgrade.",
        display: ["AutoBuy OFF", "AutoBuy ON"],
        default: 0,
    },
    otherUpgrades: {
        hint: "Buy upgrades that don't boost CpS directly.",
        display: ["Other Upgrades OFF", "Other Upgrades ON"],
        default: 1,
    },
    autoBlacklistOff: {
        hint: "Turn off blacklist when goal is met.",
        display: ["Auto Blacklist OFF", "Auto Blacklist ON"],
        default: 0,
    },
    blacklist: {
        hint: "Blacklist: Restrict purchases for achievements or challenges.",
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
        hint: "Buy least efficient option (⚠️ not recommended).",
        display: ["Pastemode OFF", "Pastemode ON"],
        default: 0,
    },

    // other auto options
    autoOtherOptions: {
        hint: "Other automation:",
    },
    autoBulk: {
        hint: "Set bulk buy after ascension.",
        display: ["Auto Bulkbuy OFF", "Auto Bulkbuy x10", "Auto Bulkbuy x100"],
        default: 0,
    },
    autoBuyAll: {
        hint: "Auto-buy all upgrades until a chip is earned.",
        display: ["Auto Buy All Upgrades OFF", "Auto Buy All Upgrades ON"],
        default: 0,
    },
    autoAscendToggle: {
        hint: "Auto-ascend at target chips (⚠️ skips upgrade screen).",
        display: ["Auto Ascend OFF", "Auto Ascend ON"],
        default: 0,
    },
    autoAscend: {
        hint: "Choose auto-ascend method.",
        display: [
            "Auto-ascend OFF",
            "Auto-ascend at SET amount",
            "Auto-ascend when prestige is DOUBLED",
        ],
        default: 0,
        extras: '<a class="option" id="chipsToAscend" onclick="updateAscendAmount(\'HCAscendAmount\');">${HCAscendAmount} heavenly chips</a>',
    },
    comboAscend: {
        hint: "Block auto-ascend when you have X Frenzy or higher.",
        display: ["Ascend during combo OFF", "Ascend during combo ON"],
        default: 0,
        extras: '<a class="option" id="minCpSMult" onclick="updateCpSMultMin(\'minCpSMult\');">x${minCpSMult} minimum Frenzy</a>',
    },
    autoWrinkler: {
        hint: "Auto-pop wrinklers.",
        display: [
            "Autopop Wrinklers OFF",
            "Autopop Wrinklers EFFICIENTLY",
            "Autopop Wrinklers INSTANTLY",
        ],
        default: 0,
    },
    shinyPop: {
        hint: "Protect shiny wrinklers (⚠️ disables Elder Pledge).",
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
        hint: "Swap in Dragon's Curve (and Reality Bending) for lump harvest.",
        display: [
            "Auto-Dragon's Curve OFF",
            "Auto-Dragon's Curve ON",
            "Auto-Dragon's Curve ON + REALITY BENDING",
        ],
        default: 0,
    },
    sugarBakingGuard: {
        hint: "Don't spend lumps below 101 (keep Sugar Baking bonus).",
        display: ["Sugar Baking Guard OFF", "Sugar Baking Guard ON"],
        default: 0,
    },
    autoGS: {
        hint: "Auto-toggle Golden Switch for click buffs.",
        display: ["Auto-Golden Switch OFF", "Auto-Golden Switch ON"],
        default: 0,
    },
    autoGodzamok: {
        hint: "Auto-sell mines/factories for Godzamok during click buffs.",
        display: ["Auto-Godzamok OFF", "Auto-Godzamok ON"],
        default: 0,
    },
    autoBank: {
        hint: "Auto-upgrade bank office.",
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
        hint: "Pantheon:",
    },
    autoWorshipToggle: {
        hint: "Auto-slot selected gods (can't select same god twice).",
        display: ["Auto Pantheon OFF", "Auto Pantheon ON"],
        default: 0,
    },
    autoWorship0: {
        hint: "Auto-slot god in DIAMOND slot.",
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
        hint: "Auto-slot god in RUBY slot.",
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
        hint: "Auto-slot god in JADE slot.",
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
        hint: "Auto-swap Cyclius for max CpS (set gods above, do not use Cyclius).",
        display: [
            "Auto-Cyclius OFF",
            "Auto-Cyclius in RUBY and JADE",
            "Auto-Cyclius in all slots",
        ],
        default: 0,
    },

    // Spell options
    spellOptions: {
        hint: "Grimoire:",
    },
    towerLimit: {
        hint: "Stop buying Wizard Towers at set max mana.",
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
        hint: "Only one combo can be active at a time. See readme.",
    },
    autoFTHOFCombo: {
        hint: "Auto double-cast FTHOF combos (needs enough mana).",
        display: ["Double Cast FTHOF OFF", "Double Cast FTHOF ON"],
        default: 0,
    },
    auto100ConsistencyCombo: {
        hint: "⚠️ EXPERIMENTAL: Auto-cast 100% Consistency Combo.",
        display: [
            "Auto Cast 100% Consistency Combo OFF",
            "Auto Cast 100% Consistency Combo ON",
        ],
        default: 0,
    },
    autoSugarFrenzy: {
        hint: "Auto-buy Sugar Frenzy during first combo of X Frenzy.",
        display: [
            "Auto Sugar Frenzy OFF",
            "ASF for 100% Consistency Combo",
            "ASF also for Double Cast Combo",
        ],
        default: 0,
        extras: '<a class="option" id="minASFMult" onclick="updateASFMultMin(\'minASFMult\');">x${minASFMult} minimum Frenzy</a>',
    },
    autoSweet: {
        hint: "⚠️ EXPERIMENTAL: Ascend until 'Sweet' spell appears. No manual shutdown.",
        display: ["Auto Sweet OFF", "Auto Sweet ON"],
        default: 0,
    },

    //Dragon options
    dragonOptions: {
        hint: "Dragon:",
    },
    autoDragon: {
        hint: "Auto-upgrade dragon.",
        display: ["Dragon Upgrading OFF", "Dragon Upgrading ON"],
        default: 0,
    },
    petDragon: {
        hint: "Auto-pet dragon for drops.",
        display: ["Dragon Petting OFF", "Dragon Petting ON"],
        default: 0,
    },
    autoDragonToggle: {
        hint: "Auto-set dragon auras.",
        display: ["Dragon Auras OFF", "Dragon Auras ON"],
        default: 0,
    },
    dragonNotes: {
        hint: "Set desired auras. Can't set same aura twice.",
    },
    autoDragonAura0: {
        hint: "Auto-set FIRST dragon aura.",
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
        hint: "Auto-set SECOND dragon aura.",
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
        hint: "Auto-sell Yous for GC if Dragon Orbs aura is set and Godzamok is not.",
        display: ["Auto-Dragon Orbs OFF", "Auto-Dragon Orbs ON"],
        default: 0,
    },
    orbLimit: {
        hint: "Limit Yous for Dragon Orbs combos.",
        display: ["You Limit OFF", "You Limit ON"],
        default: 0,
        extras: '<a class="option" id="orbMax" onclick="updateOrbMax(\'orbMax\');">${orbMax} Yous</a>',
    },

    // Season options
    seasonOptions: {
        hint: "Season:",
    },
    defaultSeasonToggle: {
        hint: "Auto-switch to selected season if no upgrades needed.",
        display: ["Autobuy Seasons OFF", "Autobuy Seasons ON"],
        default: 0,
    },
    defaultSeason: {
        hint: "Select default season.",
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
        hint: "Stay in free base season if no upgrades needed.",
        display: [
            "Free Season OFF",
            "Free Season for CHRISTMAS and BUSINESS DAY",
            "Free Season for ALL",
        ],
        default: 1,
    },
    autoEaster: {
        hint: "Switch to Easter during Cookie Storm if eggs missing.",
        display: ["Auto-Easter Switch OFF", "Auto-Easter Switch ON"],
        default: 0,
    },
    autoHalloween: {
        hint: "Switch to Halloween if wrinklers present and cookies missing.",
        display: ["Auto-Halloween Switch OFF", "Auto-Halloween Switch ON"],
        default: 0,
    },

    //Bank options
    bankOptions: {
        hint: "Bank: (delays autobuy until bank is full)",
    },
    manualBank: {
        hint: "Manual minimum bank (minutes of base CpS)",
        display: ["Manual Bank OFF", "Manual Bank ON"],
        extras: '<a class="option" id="manBankMins" onclick="updateManBank(\'manBankMins\');">${manBankMins} Minutes</a>',
    },
    holdSEBank: {
        hint: "Keep bank for Spontaneous Edifice.",
        display: ["SE Bank OFF", "SE Bank ON"],
        default: 0,
    },
    setHarvestBankPlant: {
        hint: "Keep bank for harvesting selected plant.",
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
        hint: "Increase bank for plant harvest during CpS buffs.",
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
        hint: "Other:",
    },
    FCshortcuts: {
        hint: "Enable keyboard shortcuts (see readme).",
        display: ["Shortcuts OFF", "Shortcuts ON"],
        default: 1,
    },
    simulatedGCPercent: {
        hint: "Assume % of GCs clicked for efficiency (100% recommended).",
        display: ["GC clicked 0%", "GC clicked 100%"],
        default: 1,
    },

    //Display options
    displayOptions: {
        hint: "Display:",
    },
    showMissedCookies: {
        hint: "Show missed golden cookies in info panel.",
        display: ["Show Missed GCs OFF", "Show Missed GCs ON"],
        default: 0,
    },
    numberDisplay: {
        hint: "Change number formatting style.",
        display: [
            "Number Display RAW",
            "Number Display FULL (million, billion)",
            "Number Display INITIALS (M, B)",
            "Number Display SI PREFIXES (M, G, T)",
            "Number Display SCIENTIFIC (6.3e12)",
        ],
        default: 1,
    },
    fancyui: {
        hint: "Infobox style (text, wheel, or both).",
        display: [
            "Infobox OFF",
            "Infobox TEXT ONLY",
            "Infobox WHEEL ONLY",
            "Infobox WHEEL & TEXT",
        ],
        default: 0,
    },
    logging: {
        hint: "Log actions to console.",
        display: ["Logging OFF", "Logging ON"],
        default: 1,
    },
    purchaseLog: {
        hint: "Log all auto-purchases.",
        display: ["Purchase Log OFF", "Purchase Log ON"],
        default: 0,
    },

    slowOptions: {
        hint: "Warning: These options may slow the game.",
    },
    fpsModifier: {
        hint: "Set game frame rate (default 30).",
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
        hint: "Track CpS/HC for graphs (may slow game).",
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
        hint: "Set all recommended options (⚠️ reloads game instantly).",
        display: ["Recommended OFF", "Recommended ON"],
        default: 0,
    },
};
