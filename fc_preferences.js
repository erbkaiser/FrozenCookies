FrozenCookies.preferenceValues = {
    // clicking options
    clickingOptions: {
        hint: "Auto clicking options:",
    },
    autoClick: {
        hint: "Click the large cookie",
        display: ["Autoclick OFF", "Autoclick ON"],
        default: 0,
        extras: '<a class="option" id="cookieClickSpeed" onclick="updateSpeed(\'cookieClickSpeed\');">${cookieClickSpeed} clicks/sec</a>',
    },
    autoFrenzy: {
        hint: "Click the large cookie during Clicking Frenzies",
        display: ["Autofrenzy OFF", "Autofrenzy ON"],
        default: 0,
        extras: '<a class="option" id="frenzyClickSpeed" onclick="updateSpeed(\'frenzyClickSpeed\');">${frenzyClickSpeed} clicks/sec</a>',
    },
    autoGC: {
        hint: "Automatically click Golden Cookies when they appear",
        display: ["Autoclick GC OFF", "Autoclick GC ON"],
        default: 0,
    },
    autoReindeer: {
        hint: "Automatically click reindeer",
        display: ["Autoclick Reindeer OFF", "Autoclick Reindeer ON"],
        default: 0,
    },
    autoFortune: {
        hint: "Automatically click the news ticker when Fortune News appears",
        display: ["Auto Fortune OFF", "Auto Fortune ON"],
        default: 0,
    },

    // autobuy options
    buyingOptions: {
        hint: "Auto buying options:",
    },
    autoBuy: {
        hint: "Automatically buy the most efficient building when you've met its cost. Also controls some other automated purchases",
        display: ["AutoBuy OFF", "AutoBuy ON"],
        default: 0,
    },
    otherUpgrades: {
        hint: "Automatically buy upgrades that don't provide a direct CpS boost. This includes eggs and idle upgrades",
        display: ["Other Upgrades OFF", "Other Upgrades ON"],
        default: 1,
    },
    autoBulk: {
        hint: "Automatically set buildings to be bought in bulk after reincarnation",
        display: ["Auto Bulkbuy OFF", "Auto Bulkbuy x10", "Auto Bulkbuy x100"],
        default: 0,
    },
    autoBlacklistOff: {
        hint: "Automatically turn off a blacklist once the goal for that blacklist is achieved",
        display: ["Auto Blacklist OFF", "Auto Blacklist ON"],
        default: 0,
    },
    blacklist: {
        hint: "Blacklist purchases from the efficiency calculations",
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
        hint: "Limit max number of mines to keep Godzamok useful",
        display: ["Mine Limit OFF", "Mine Limit ON"],
        default: 0,
        extras: '<a class="option" id="mineMax" onclick="updateMineMax(\'mineMax\');">${mineMax} Mines</a>',
    },
    factoryLimit: {
        hint: "Limit max number of factories to keep Godzamok useful",
        display: ["Factory Limit OFF", "Factory Limit ON"],
        default: 0,
        extras: '<a class="option" id="factoryMax" onclick="updateFactoryMax(\'factoryMax\');">${factoryMax} Factories</a>',
    },
    pastemode: {
        hint: "Always autobuy the least efficient purchase. This is a stupid idea, you should never turn this on",
        display: ["Pastemode OFF", "Pastemode ON"],
        default: 0,
    },

    // other auto options
    autoOtherOptions: {
        hint: "Other automatic actions:",
    },
    autoAscend: {
        hint: "Automatically ascend when your heavenly chip count hits a certain number. Note: this will skip the upgrade screen",
        display: ["Autoascend OFF", "Autoascend ON"],
        default: 0,
        extras: '<a class="option" id="chipsToAscend" onclick="updateAscendAmount(\'HCAscendAmount\');">${HCAscendAmount} heavenly chips</a>',
    },
    autoWrinkler: {
        hint: "Automatically pop wrinklers efficiently (calculated timing to balance cookies vs. upgrades) or instantly",
        display: [
            "Autopop Wrinklers OFF",
            "Autopop Wrinklers EFFICIENTLY",
            "Autopop Wrinklers INSTANTLY",
        ],
        default: 0,
    },
    shinyPop: {
        hint: "Protect the endangered Shiny Wrinkler from being auomatically popped. Note: this disables buying the Elder Pledge",
        display: ["Save Shiny Wrinklers OFF", "Save Shiny Wrinklers ON"],
        default: 0,
    },
    autoSL: {
        hint: "Automatically harvest sugar lumps when ripe, with option to automatically swap in Rigidel",
        display: [
            "Autoharvest SL OFF",
            "Autoharvest SL ON",
            "Autoharvest SL ON + AUTO RIGIDEL",
        ],
        default: 0,
    },
    sugarBakingGuard: {
        hint: "Ignore options that spend a sugar lump until you have 101 stored, to keep max Sugar Baking boost",
        display: ["Sugar Baking Guard OFF", "Sugar Baking Guard ON"],
        default: 0,
    },
    autoGS: {
        hint: "Automatically turn on the Golden Switch during Dragonflight and Click Frenzy (and turn back off at the end)",
        display: ["Auto-GS-Switch OFF", "Auto-GS-Switch ON"],
        default: 0,
    },
    autoGodzamok: {
        hint: "Automatically sell mines and factories during Dragonflight and Click Frenzy if you worship Godzamok",
        display: ["Auto-Godzamok OFF", "Auto-Godzamok ON"],
        default: 0,
    },
    autoBroker: {
        hint: "Automatically buy stock brokers and upgrade the market",
        display: ["Auto-Broker OFF", "Auto-Broker ON"],
        default: 0,
    },
    autoLoan: {
        hint: "Automatically take loans 1 and 2 during click buffs with frenzies",
        display: ["Auto-Loan OFF", "Auto-Loan ON"],
        default: 0,
        extras: '<a class="option" id="minLoanMult" onclick="updateLoanMultMin(\'minLoanMult\');">x${minLoanMult} minimum Frenzy</a>',
    },

    // Pantheon options
    pantheonOptions: {
        hint: "Pantheon options:",
    },
    pantheonNotes: {
        hint: "(Turn off autobuy while setting. Do not slot the same god in multiple slots)",
    },
    autoWorship0: {
        hint: "Automatically slots desired god in DIAMOND slot",
        display: [
            "No God",
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
            "Holobore",
        ],
        default: 0,
    },
    autoWorship1: {
        hint: "Automatically slots desired god in RUBY slot",
        display: [
            "No God",
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
            "Holobore",
        ],
        default: 0,
    },
    autoWorship2: {
        hint: "Automatically slots desired god in JADE slot",
        display: [
            "No God",
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
            "Holobore",
        ],
        default: 0,
    },

    // Spell options
    spellOptions: {
        hint: "Grimoire options:",
    },
    spellNotes: {
        hint: "(Only one combo is active at the same time, with the last one winning. See the readme for more info)",
    },
    towerLimit: {
        hint: "Stop autobuying Wizard Towers at selected Max Mana. 37 for max single casting FTHOF. Not recommended to set over 100",
        display: ["Wizard Tower Cap OFF", "Wizard Tower Cap ON"],
        default: 0,
        extras: '<a class="option" id="manaMax" onclick="updateManaMax(\'manaMax\');">${manaMax} max Mana</a>',
    },
    autoSpell: {
        hint: "Automatically cast selected spell when your mana is full",
        display: [
            "Auto Cast OFF",
            "Auto Cast CONJURE BAKED GOODS",
            "Auto Cast FORCE THE HAND OF FATE",
            "Auto Cast SPONTANEOUS EDIFICE",
            "Auto Cast HAGGLER'S CHARM (cheapest)",
        ],
        default: 0,
        extras: '<a class="option" id="minCpSMult" onclick="updateCpSMultMin(\'minCpSMult\');">x${minCpSMult} minimum Frenzy</a>',
    },
    autoSugarFrenzy: {
        hint: "Buy Sugar Frenzy during the first 100% Consistency and/or FTHOF combo",
        display: [
            "Auto Sugar Frenzy OFF",
            "ASF for 100% Consistency Combo",
            "ASF also for Auto FTHOF Combo",
        ],
        default: 0,
    },
    autoFTHOFCombo: {
        hint: "Perform FTHOF double cast combos - needs enough mana! Disables Auto Cast",
        display: ["Auto FTHOF Combo OFF", "Auto FTHOF Combo ON"],
        default: 0,
    },
    auto100ConsistencyCombo: {
        hint: "EXPERIMENTAL: Does the 100% Consistency Combo. Disables autocast and auto FTHOF Combo",
        display: [
            "Auto 100% Consistency Combo OFF",
            "Auto 100% Consistency Combo ON",
        ],
        default: 0,
    },
    autoSweet: {
        hint: "EXPERIMENTAL: Automatically ascend until 'Sweet' is in the next ten spells. Disables other combos. No manual shutdown!",
        display: ["Auto Sweet OFF", "Auto Sweet ON"],
        default: 0,
    },

    //Dragon options
    dragonOptions: {
        hint: "Dragon options:",
    },
    autoDragon: {
        hint: "Automatically upgrade the dragon",
        display: ["Auto-Dragon OFF", "Auto-Dragon ON"],
        default: 0,
    },
    petDragon: {
        hint: "Automatically pet the dragon",
        display: ["Auto-Petting OFF", "Auto-Petting ON"],
        default: 0,
    },
    dragonNotes: {
        hint: "(Select your desired aura from the list. Turn off autoBuy option while changing. Cannot set the same aura to both slots)",
    },
    autoDragonAura1: {
        hint: "Automatically set FIRST dragon aura",
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
        ],
        default: 0,
    },
    autoDragonAura2: {
        hint: "Automatically set SECOND dragon aura",
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
        ],
        default: 0,
    },

    // Season options
    seasonOptions: {
        hint: "Season options:",
    },
    seasonNotes: {
        hint: "(Turn off autoBuy option while changing default season)",
    },
    defaultSeason: {
        hint: "Autobuy a selected season when no others have needed upgrades",
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
    autoEaster: {
        hint: "Switch to Easter season if Cookie Storm is active and you do not have all eggs yet",
        display: ["Auto Easter OFF", "Auto Easter ON"],
        default: 0,
    },
    autoHalloween: {
        hint: "Switch to Halloween season if you have wrinklers and you do not have all spooky biscuits yet",
        display: ["Auto Halloween OFF", "Auto Halloween ON"],
        default: 0,
    },

    //Display options
    displayOptions: {
        hint: "Display options:",
    },
    numberDisplay: {
        hint: "Change how numbers are shortened",
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
        hint: "Infobox type (can be slow)",
        display: [
            "Infobox OFF",
            "Infobox TEXT ONLY",
            "Infobox WHEEL ONLY",
            "Infobox WHEEL & TEXT",
        ],
        default: 0,
    },

    //Other options
    otherOptions: {
        hint: "Other options:",
    },
    FCshortcuts: {
        hint: "Use a variety of helpful keyboard shortcuts. See the readme for info",
        display: ["Shortcuts OFF", "Shortcuts ON"],
        default: 1,
    },
    otherOptions: {
        hint: "Setting a bank delays autobuy until the bank is complete",
    },
    holdSEBank: {
        hint: "Maintain a bank for Spontaneous Edifice (already enabled if Auto Casting SE)",
        display: ["SE Bank OFF", "SE Bank ON"],
        default: 0,
    },
    setHarvestBankPlant: {
        hint: "Maintain a bank for a specific plant you are going to harvest/let explode",
        display: [
            "Harvesting Bank OFF",
            "Harvesting Bank BAKEBERRY",
            "Harvesting Bank CHOCOROOT",
            "Harvesting Bank WHITE CHOCOROOT",
            "Harvesting Bank QUEEENBEET",
            "Harvesting Bank DUKETATER",
            "Harvesting Bank CRUMBSPORE",
            "Harvesting Bank DOUGHSHROOM",
        ],
        default: 0,
    },
    setHarvestBankType: {
        hint: "Calculate the needed harvesting bank based on whether a CPS multiplier is in effect when you intend to harvest (no effect if no plant was selected above)",
        display: [
            "Harvesting during NO CPS MULTIPLER",
            "Harvesting during FRENZY",
            "Harvesting during BUILDING SPECIAL",
            "Harvesting during FRENZY + BUILDING SPECIAL",
        ],
        default: 0,
        extras: '<a class="option" id="maxSpecials" onclick="updateMaxSpecials(\'maxSpecials\');">${maxSpecials} Building specials</a>',
    },
    /*
      timeTravelMethod:{
        hint: "Time travel is unstable. This determines how time travel works. If you're unsure, don't touch this",
        display: [
            Time Travel DISABLED"],
            "Purchases by Estimated Effective CPS",
            "Purchases by Simulated Real Time",
            "Heavenly Chips by Estimated Effective CPS",
            "Heavenly Chips by Simulated Real Time"
        ],
        default: 0,
        extras: '<a class="option" id="timeTravelPurchases" onclick="updateTimeTravelAmount();">Set Time Travel Amount</a>',
      },
    */
    simulatedGCPercent: {
        hint: 'Assume a percentage of Golden Cookies as "clicked" for GC efficiency calculations (100% recommended)',
        display: ["GC clicked 0%", "GC clicked 100%"],
        default: 1,
    },
    showMissedCookies: {
        hint: "Display the number of missed Golden Cookie clicks under Golden Cookie Information",
        display: ["Show Missed GCs OFF", "Show Missed GCs ON"],
        default: 0,
    },
    otherNotes2: {
        hint: "(The following options can drastically slow down the game. Do not touch unless you know what you're doing)",
    },
    fpsModifier: {
        hint: "Run the game at the selected frame rate (browser default is 30). 60 is twice as fast, 15 is half as fast, etc.",
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
    logging: {
        hint: "Display detailed logs in the javascript console",
        display: ["Logging OFF", "Logging ON"],
        default: 1,
    },
    purchaseLog: {
        hint: "Log all automatic purchases as well",
        display: ["Purchase Log OFF", "Purchase Log ON"],
        default: 0,
    },
    trackStats: {
        hint: "Track your CpS / HC earned over time during a single session to enable graphing",
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

    /* Doesnt work
    showAchievements :{
        hint: "Show achievement popups (Kind of broken early game)",
        display: ["Achievement Popups OFF", "Achievement Popups ON"],
        default: 0
    },
    */
};
