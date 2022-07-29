![frozen](https://user-images.githubusercontent.com/6014923/165900996-4726d38f-3c7c-4932-8d2e-f98bed93a836.png)

# FrozenCookies

An automated Cookie Clicker tool.

## Warning

NOT currently compatible with **CCSE**: https://github.com/klattmose/klattmose.github.io/issues/47

CCSE changes base game functions that break the switches like the season switch and the elder pledge. This problem exists in version **2.033** of CCSE and older, when used with Cookie Clicker version 2.048.

## How to use

## Steam Install
Get it from the Workshop: https://steamcommunity.com/sharedfiles/filedetails/?id=2816199538

If you want to manually install it:
1. Download the Steam folder at https://erbkaiser.github.io/FrozenCookies/Steam/ and put the FrozenCookies folder in your mods/local folder. Remove or disable any other variants of FC.
2. Close Cookie Clicker if it is running, or refresh it
3. Load up Cookie Clicker via Steam
4. Enable Frozen Cookies at 'Manage mods' on the Options page

## Web version
1. Open the browser dev tools by whatever works for your browser. F12 might do it.
2. Go to the Console tab.
3. Type the following on the commandline and press enter after: 
**Game.LoadMod("https://github.erbkaiser.com/FrozenCookies/frozen_cookies.js");**
4. Frozen Cookies should tell you it's loaded in the console now. Feel free to close the browser console, or keep it open. If you keep it open, you'll get some detailed info whenever FC does its thing.

## Bookmarklet install

1. Paste the **contents** (not the url) of https://github.erbkaiser.com/FrozenCookies/fc_bookmarklet_loader.js into a bookmark.
2. Load up Cookie Clicker.
3. Load the recently created bookmark.

## Userscript install

0. If you don't already have it, install the required browser add-on. [Tampermonkey (Chrome)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) or [Greasemonkey (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
1. Go to https://github.erbkaiser.com/FrozenCookies/fc_userscript_loader.user.js
2. Click the 'install' button in the upper right corner.
3. Load up Cookie Clicker.

## What can Frozen Cookies do?

- Long number shortening. (convert 1,234,567,890 to 1.235 billion)
- Calculates the most efficient\* next purchase.
- Optionally, will automatically buy that most efficient\* next purchase.
- Calculates all sorts of stuff having to do with Golden Cookies.
- Optionally, will automatically click Golden Cookies when they appear.
- Calculates all sorts of stuff having to do with Heavenly Chips.
- Displays a timer for the following items: Next Golden Cookie, Time left in Frenzy, Time until next Heavenly Chip.
- Displays a second timer for the time to completion of Golden Cookie Bank, Next Purchase, and the end of a Chain of Purchases.
- Calculates far more building/upgrade efficiency information that any person ever wants to know, and displays it in a not extremely user friendly manner.
- Automates just about everything that can be automated.
- Automatically updates to the most recent version upon load. Regardless of if that version is better or not.
- Might not eat all of your cookies.

\*Note: Not guaranteed to actually be the most efficient purchase. Just the most efficient that I currently know of.

## What's new?
<details>
<summary>Click to expand!</summary>

2022 Jul 29
- Add a fifth auto cast option (#75). This works like the existing FTHOF auto cast but will only cast click and building specials.

2022 Jul 26
- Auto-Godzamok now limits itself to the mine and factory cap (if set) and no longer is capped at 500. If you have more buildings than the cap, it will rebuy up to that cap.
- Renamed a few preferences to make what they do more clear
- Split the auto banking in two separate options, one to upgrade the bank level (to unlock loans and more storage) and one to automatically buy brokers.

2022 Jul 20
- New feature: Auto-Dragon Orbs, with accompanying Cortex bakers Limit.
- Reduced dragon petting speed for less visual spam

2022 Jul 18
- Added an in-game link to this readme page
- Added dedicated toggles for setting dragon auras and pantheon gods, if turned off auras and gods will not be set.

2022 Jul 17
- Extended auto FTHOF and auto 100% consistency combos to also work with natural click frenzies, if two building buffs are stored
- Changed autoBroker so it will only buy brokers if the next recommendation is a building, this should stop it from interfering too much with efficiency

2022 Jul 12
- Fix some old issues with smart Auto cast and simplify the code; and finally documented how it works

2022 Jul 09
- Putting an upgrade in the vault (once **Inspired checklist** is unlocked) will now prevent it from being auto-bought

2022 Jul 07
- Returned Frozen Cookies ticker messages (now less common)
- Changed auto-cast behaviour: Frenzy minimum is only checked for FTHOF, more chances are taken to shorten debuffs, and sugar lumps are always taken
- (Hopefully) fixed a long standing issue with autobuying overshooting building limits (#25)

2022 Jul 02
- Completed the Shiny Wrinkler protection code so you can now keep your shinies.
- Frozen Cookies will now buy upgrades that don't give an immediate CpS benefit such as Omelette, offline cookie production upgrades, and the Sacrificial rolling pins
- Tweaked the infobox text
- Improved season switching logic
- Disabled purchase logging by default to keep log more useful, can be re-enabled with a new option

2022 Jun 30
- Add option to toggle display of missed golden cookie clicks (and turn off by default)
- Add **experimental** autoSweet option to continually ascend until a grimoire seed with Sweet (free Sugar Lump) is found - once activated, it can only disabled in the console with *FrozenCookies.autosweet = 0*

2022 Jun 21

- Add automatic Sugar Frenzy
- Add Sugar Baking protection so the mod will only auto-spend sugar lumps if you have 101 or more stored
- Added options to automatically set dragon auras
- Added options to automatically set the pantheon
- Turn the autobuy option into an on/off toggle for various automated actions like autoBroker, autoDragon. This allows changing the values without the game immediately buying.

2022 Jun 20

- Once again rewrote auto FTHOF and 100% consistency combo + updated documentation. Should now work better.

2022 Jun 19

- Add autoHalloween option
- Rewrote auto FTHOF combo

2022 Jun 18

- Revert FTHOF combo (mostly) to original method where only the combo is cast. Exception is made for the sugar lump spell.

2022 Jun 16

- Removed not really working overflow for Frenzy Times
- Edited Frozen Cookies menu layout
- Tweaked smart FTHOF behaviour (should no longer waste a click frenzy if Dragonflight is active)

2022 Jun 06

- Prevent rebuy spam if autoGodz is enabled but there is no building limit set, and over 500 buildings are owned
- Turn keyboard shortcuts into an option
- Add autoLoan function: take loans 1 and 2 if a big click frenzy starts

2022 Jun 02

- Reverted the Apr 14 change to automatically take loans during normal double casting as the gains aren't guaranteed to be worth it.

2022 May 19

- Rebalanced the auto FTHOF combo and updated the readme with info about it

2022 May 13

- Automatic dragon upgrading and dragon petting

2022 May 12

- Updated for version 2.046 (beta)
- Rigisell (used in Autoharvest SL with Rigidel) will now sell the cheapest building instead of always going for cursors, to keep Rigidel happy (from heshammourad)

2022 May 03

- Change the smart FTHOF behaviour to cast a negative Stretch Time spell, if the next FTHOF spell would be Ruin or Clot and a timed debuff like a Clot or loan repayment is the only active effect

2022 Apr 29

- Add an option to automatically buy stock brokers and upgrade bank office levels

2022 Apr 14

- Automatically take Stock Market loans during FTHOF combo

2022 Mar 25

- Extended safe buy mechanism to smart FTHOF and 100% consistency combos

2022 Jan 25

- Changed auto-Godmazok to mines and factories as farms will get a synergy boost once the beta goes into live
- Changed buy back behaviour for auto-G to stop at 500 max, so that enabling it won't devastate existing games where you have more mines and factories. Recommended to still enable the mine and factory limit once you can get over 600 of each, to keep them useful
- Hid the Frenzy Times on the FC stats/settings page behind an overflow scrollbar

2022 Jan 16

- Changed auto-Godzamok to farms and mines instead of cursors and farms since cursor sinergies and aura gloves can earn more cookies than mines ever could.

2022 Jan 10 (bootleg DarkRoman version)

- Copied the smart FTHOF behaviour from DarkRoman's variant: https://github.com/Darkroman/FrozenCookies
- Copied the AutoComboFinder and smart Easter from DarkRoman
- Fixed the broken auto-Godmazok behaviour that sold mines and factories instead of cursors
</details>
  
## Older changelogs 
<details>
  <summary>Click to expand!</summary>
  
2020 Nov 2

- Version 1.10.0
- Add version check
- Removed unused variables
- Removed unused function
- Update CookieClicker 2.031
- New Building upgrades
- New Grandma upgrades
- New Synergie upgrades

2020 Oct 26

- Version 1.9.0
- Fix autoAscend number entry. ([Issue #49](https://github.com/Mtarnuhal/FrozenCookies/pull/49))
- Fix recommendation list to show accurate efficiency percentages even when AutoBuy excludes the purchase of some buildings (like when they've hit their max). ([Issue #47](https://github.com/Mtarnuhal/FrozenCookies/pull/47))
- Simplified Auto-Godzamok: Now just on or off. When on, it will wait until Dragonflight or Click Frenzy and sell all the cursors and farms to get the Devastation buff. Then, if AutoBuy is turned on, it will immediately buy the buildings back (stopping at the max for those buildings if a max has been set).
- Fix autoharvest of sugar lump. ([Issue #18](https://github.com/Mtarnuhal/FrozenCookies/pull/18))
- Show correct buff value on Devastation tooltip, even if additional buildings have been sold after the buff has started. ([Issue #46](https://github.com/Mtarnuhal/FrozenCookies/pull/46))
- Fix Auto Bulkbuy to only actually kick in after a reincarnation instead of all the time.
- Other minor fixes

2020 Sept 28

- Version 1.8.0
- Move preferences to their own file
- Rearange preferences into sections
- Reword preferences for consistency
- Fix autoCast() to correctly consider CPS
- Update autoCast SE to javascript console
- Display next purchase and chain name in timers

2020 Sept 15

- Add function to make sure game is in buymode when autobuying
- Fixed achievement not showing.

2018 Oct 27

- Added Shimmering veil blacklists
- Updated SE auto cast strategy to use new fractal engine instead of chancemaker.
- Added farms to godzamok sold buildings as they contribute barely synergy. Sells all farms except 1 for the garden. Added a new option to limit farms just like cursors
- Added Fractal engine related upgrade values

2018 Aug 6

- New "Harvest Bank" option to select a higher Bank than for Frenzy/Clicking Frenzy if you want to get the maximum return from harvesting Bakeberries, Chocoroots, White Chocoroots, Queenbeets or Duketaters
- Scenario selection for harvesting

2018 Aug 4

- Automatically blacklists Sugar Frenzy and Chocolate Egg

2018 Mar 2:

- Updated to work in patch 2.0045
- More auto-Godzamok behavior options
- Auto Spell Casting (Conj. Baked Goods, Force the Hand of Fate, Spontaneous Edifice, and Haggler's Charm [the fastest to spam for spell achievements])
- Wizard Tower purchase limit toggle to stay at 100 mana
- Auto Sugar Lump Harvesting
- Cursor Autobuy limit option to keep Godzamok efficient at very high cursor counts
- Auto bulk purchase on reincarnation (option to automatically buy in 10s or 100s after reincarnation to speed up early run

2017 Apr 14:

- New option: FPS modifier

2017 Apr 12:

- Wrinklers can now be popped efficiently or instantly

2017 Mar 31:

- New option: Auto-ascension
- Scientific notation changed a fair bit

2016 Dec 1:

- New option: Default Season

2016 Nov 19:

- Update discount calc with new discounts
- Fix problem with lucky bank targeting during wrath
- Add Earth Shatterer option to Chocolate Egg calc and display
- Fix 'HC After Reset' stat
- Fix: Auto-GS waited for Frenzy to end but incurred 7x cost anyway
- Removed 'No GS' blacklists
- Added label to Auto-GS option
- Auto-GS no longer cheats

2016 Nov 13:

- Fixed auto-buying of Santa upgrades
- Fixed Lucky calc
- Add support for new GC buffs
- Internal Information: delta-CPS for Bank targets now compares to current bank
- Golden Switch excluded from auto-buy (no blacklist necessary)

2016 Aug 11:

- Added Golden Switch blacklists

2016 Jul 24:

- Updated for Cookie Clicker 2.002

2014 May 27:

- Time to Recoup Chocolate stat added
- Chocolate Egg benefits being included in the HC stats section
- Wrath Stage information added to the Internal Information section

2014 May 23:

- Google Chrome updated, blocks invalid MIME-type scripts from running, forcing all users to switch to the gh-pages branch hosted on http://icehaw78.github.io/FrozenCookies; No local code changes were needed for this

2014 May 20:

- Wrinklers will autopop if turned on, in Easter or Halloween, and don't have all seasonal cookies for that season unlocked
  Will autobuy and value Faberge Egg, Golden Goose Egg, and Wrinklerspawn
- Century Egg doesn't cause the browser to freeze (note: It's still broken in beta; won't be fixed)
- "Manual Seasons" blacklist removed (this is now integrated with the core autobuy - if you're in a season and don't have all related cookies, autobuy won't buy another season upgrade)
- Wrinkler Saving functionality removed entirely, due to that working with the core game now
- "No Buildings" blacklist added (for use with all of your Chocolate Egg hoarding needs - will maintain a Pledge if deemed valuable, as well as maintaining seasons)
- Resetting while FC is loaded will now pop all wrinklers, sell all buildings, and finally buy the Chocolate Egg (if available) before actually resetting, without any manual interaction needed.
- Console logging cleaned up quite a bit (now condenses HC reports by either 'In Frenzy' or 'Out of Frenzy', rather than spamming 100x "You gained 1 HC!" when not in a frenzy)
- Added more granular Frenzy timing info in the Golden Cookie Info section
- Keyboard shortcuts now include 'e' to pop up your save export string in a handy copyable window.
- "Pastemode" added, to reverse the efficiency calculations

2014 May 18:

- Updated to work with Easter beta (Major issue of Century Egg causing an infinite loop will freeze FC)

2014 Apr 28:

- Found and fixed a major bug that was valuing autoclicking for wrinklers, which reverted the general consensus of "Never leave One Mind" for high-automation players
- Started a cross-community strategy optimization Holy War

2014 Apr 8:

- Rewrite cache recalculations with the design from @Bryanarby
- Autopop wrinklers is season-aware and cost-efficiency-aware
- Prevent negative-efficiency upgrades from being prioritized/existing
- Provided number-shortening-code to Orteil for use in core CC

2014 Mar 18:

- Chained Upgrades accurately simulate all prerequisites' benefits as well as costs
- Wrinkler valuation updated to prevent exiting of One Mind if it shouldn't
- Autobuy won't switch seasons during the first hour of that season (to avoid constant back and forth before unlocking anything in a given season).
- A beta Wrinkler-saver (that is off by default) which will simply hook into the game's built in Save function, will store your wrinklers upon save, and when FC is first loaded, will restore them entirely (including amount sucked, life, and even position around the cookie). Use at your own risk.
- A new "smart tracking" for the graphing stats, which introduces a delay between tracking times, and will increase the reporting during times of increased purchasing, and will decrease the reporting during times of saving. This is currently the recommended tracking method, if you plan on using the graphs. (Thanks to /u/bryanarby for the initial idea of a modulated tracking function.)
- Even fewer bugs than before.
- Possibly more bugs, as well?

2014 Mar 12:

- Graphs!
- Actually working with the most recent update
- An attempt to model Reindeer/Wrinklers for efficiency calculation purposes (not quite working yet)
- Maybe other stuff that I forgot?

2013 Dec 31:

- Reindeer Autoclicker [technically not new, since someone else added this earlier]
- Automatic Santa stage upgrading
- Fixed a bug in the chained upgrade cost code that was calculating the cumulative cost of buildings very very wrong

2013 Nov 15:

- Auto Blacklist Disabler - this will allow you to set a blacklist, but once its goal is reached, it will return to no blacklist. (This allows you to, among other things, turn on Grandmapocalypse Mode to acquire all halloween cookies, without having to monitor whether they're all gotten or not, and then it returns to normal buy all.) Without this turned on, blacklists will work how they previously did.
- Grandmapocalypse Mode Blacklist - this will now stop you at Wrath:1, rather than Wrath:3, as this seems likely to be far more effective for wrinklers. After you've bought the Elder Pact, of course, you can't go back, but for those who want to run in the earlier mode, this will allow you to do so.
- Beautified numbers now round properly. This includes a bug that surfaced last week, where thousands were displaying as millions, as well as the much older bug where 999,999,999 would display as 1000 million, rather than 1 billion.
- Golden cookie double-clicking bugs and buying Elder Covenant bugs - these should not be happening any more; if they are, please let me know.

2013 Oct 28:

- Chain timer no longer resets after the purchase of each item in the chain (the total value of the chain is the cost of every prerequisite, the amount completed of the timer is the cost of all purchased prereqs + cookies on hand).
- You can now change how numbers are shortened, with many different formatting options to choose from.
- The giant efficiency table now marks Chained upgrades as such with a (C) in the list.
- Clicking CPS is now included in any calculations involving time delays when autoclick is turned on.
- Click Frenzy Autoclick (should) override the base autoclick speed if both are turned on and set.
- Frenzy Power now shown when active (x7, x666, or x0.5)
- Efficiency Table should now be slightly less terribly formatted (though likely not by much).
- Numerous bugs from the previous versions should be fixed (I forget what all they are, though.)

2013 Oct 23:

- Improved code stability, added large cookie autoclicker, clicking frenzy autoclicker, and blacklists for Speedrun/Hardcore achievements

2013 Oct 22:

- Fixed multiple problems with the previous changes

2013 Oct 21:

- Updated GC valuation code

2013 Oct 17:

- Timers are much smoother and not on the FC page
- Many stability improvements
- Newer GC valuation code
- Moved the hosting URL to one that won't cause script-type warnings when you load it. (http://icehawk78.github.io/FrozenCookies)

2013 Oct 03:

- Finally getting around to updating this file.
- Lots of other changes have been added in the meantime.

2013 Sep 23:

- Added Chained Upgrade purchases
</details>

## Planned Features and Known Issues

- See the Github issues

# Efficiency? What's that?

Frozen Cookies uses a custom tweaked Efficiency calculation to determine what the optimal purchase at the current point in time is. The current raw efficiency formula is the following:

               cost         cost
    1.15 * ----------- + ---------
           current cps   delta cps

This originated from the assertion that, for any purchases A and B, purchase A is superior if and only if the following inequality is true:

    a.cost     b.cost       b.cost     a.cost
    ------ + -----------  < ------ + -----------
     CPS     a.CPS + CPS     CPS     b.CPS + CPS

Initially, this was just simplified down to (cost/cps + cost/Δ cps), but thanks to a number of repeated simulations by Vandalite, it was found that adding a modifier to the (cost/cps) section very slightly increased the optimal build speed, as can be seen here:

![Cookie Monster uses the more naïve (cost/Δ CPS) formula, which is far less efficient than either of the Frozen Cookie efficiency algorithms.](http://i.imgur.com/BvVRadm.png)

For Golden Cookies, it was determined that using the naïve cost/Δ cps to determine when it is optimal to begin building a bank for Golden Cookies is superior to our primary efficiency algorithm, since you actually gain effective CPS increases continually while building bank (from increased Lucky payouts).

All of these calculations are subject to change if it is revealed that a different algorithm will build (and maintain) a CPS base faster than the current one. Additionally, there is uncompleted code that will simplify these numbers to a simple percentage-based system for easier user reference.

# Special casting combos

This fork includes some different auto casting combo mechanics. Brief documentation and setup guides follow.

## Smart Auto cast

Auto cast will cast the selected spell when max mana is reached, with some exceptions:

- If the next detected spell is *'Sweet'* (free Sugar lump), it will always cast *Force the Hand of Fate* (FTHOF) next, if it has enough mana
- If the next detected spell is either *Clot* or *Ruin cookies* AND you are currently under a timed debuff like a clot, it will cast *Stretch Time* to shorten the timer
- If the next detected spell is either *Clot* or *Ruin cookies* and you are not currently under a timed debuff, it will cast *Haggler's Charm*  instead of the selected spell, to avoid a backfire
- If there is an unclicked cookie on screen and the next FTHOF spell is a backfire, it will wait until the unclicked cookie has been or has expired

If the selected spell is FTHOF, there are some additional checks:

- If the next detected spell is *Click Frenzy*, it will not cast the spell unless either a *Frenzy* or *Dragon Harvest* is active for long enough to last the entire spell
- If the next detected spell is either *Elder Frenzy* or *Cursed Finger*, it will not cast this spell unless a *Click Frenzy* or *Dragon Frenzy* is active for long enough to last the entire spell

## Double Cast FTHOF

Double Cast FTHOF replaces Auto Cast. If the combo is enabled, it will look for a clicking frenzy and two building specials before casting, for a massive boost. Any other spell will be replaced by *Haggler's Charm*, with the same exceptions as the Smart Auto cast system above.

The possible combos are:
- Stored *Click Frenzy* and *Elder Frenzy* and a natural *Frenzy* or *Dragon Harvest*, plus a *Building Special*
- Stored *Click Frenzy* and a *Building Special* and a natural *Frenzy* or *Dragon Harvest*, plus a *Building Special*
- Two stored *Building Special*s and a natural *Frenzy* or *Dragon Harvest*, plus any clicking frenzy (*Click Frenzy*, *Dragonflight*, or *Elder Frenzy*)

If such a combo is detected, it will quickly cast the first spell, sell enough wizard towers for dualcasting, then cast the second spell, for a four way boost in total. This can earn decades of cookies in a single combo.

Dualcasting does require a set level of minimum mana, depending on your Wizard Tower levels:

* WT level 1-4: 81 min mana
* WT level   5: 83 min mana
* WT level   6: 88 min mana
* WT level   7: 91 min mana
* WT level   8: 93 min mana
* WT level   9: 96 min mana
* WT level  10: 98 min mana

(Calculated with https://lookas123.github.io/CCGrimoireCalculator/ and https://www.desmos.com/calculator/r9mywixego)

For convenience sake, you can just set max mana to 100 for all WT levels. The code will work with any value equal to or higher than the minimum, but because of how the mana refueling system works setting having any higher than 100 mana is not recommended.

The combo will not work if you upgrade Wizard Towers beyond level 10.

## 100% Consistency Combo

Based on the 100% Consistency endgame click combo\*, this is basically the FTHOF Double Casting Combo on steroids. It will only work with Wizard Towers on level 10 and a max mana of 100 (or higher). The 100% combo will completely automate almost every system and use a sugar lump to cast up to four spells in succession to get a maximum possible combo.

It follows the same rules as the FTHOF Double Casting Combo until it detects the next combo can be cast.

In order to use this, you must meet the following requirements: 

* Have 98 or higher max mana
* Have at least 1 sugar lump in reserve (101 recommended to keep the Sugar baking bonus)
* The dragon must be fully upgraded, so you can have two auras
* Have at least 1 god swap in reserve, OR have both Godzamok in Diamond and Mokalsium in Ruby already
* Have whiskerblooms unlocked in the garden (any current plants will be harvested -- this includes growing Juicy queenbeets!)

For optimal use, also turn off any mine and factory building caps in Frozen Cookies settings before enabling the combo.

\*https://pastebin.com/raw/bMHEJ3R9

## Auto Sweet

Not technically a spell combo. If enabled, Auto Sweet will continually rapidly ascend until a grimoire seed with *'Sweet'* (free Sugar Lump) in the first 10 spells is found, then it will cast *Haggler's Charm* until 'Sweet' has been cast. After that, it turns itself off.

WARNING: once activated, it can only disabled in the console with *FrozenCookies.autosweet = 0* or if it has actually cast *'Sweet'*. There is currently no way to turn it off on Steam.

# Information about Frozen Cookies' Data

This is an explanation of each piece of data contained in the Frozen Cookie menu screen:

## Autobuy Information

- **Next Purchase**: This is what FC's formulas have determined is the optimal next purchase, and if autobuy is turned on, is _what_ FC will buy next.
- **Building Chain to**: This is only visible if FC has calculated that the best purchase is an upgrade that has prerequisites that are not yet met. In that case, this is that upgrade (whereas the "Next Purchase" will be the recommended prerequisite to purchase).
- **Time til completion**: This is how long, at your current CPS, it will take to purchase the Next Purchase. This includes any calculated needed GC Bank.
- **Time til Chain completion**: Only visible if building to a chain, this is how long, at your current CPS, it will take to purchase all prerequisites and the target upgrade.
- **Cost**: The cost of the Next Purchase.
- **Golden Cookie Bank**: The amount of cookies that FC has calculated you should keep on hand as a bank to maximise the value from Golden Cookies.
- **Base Δ CPS**: The total amount of displayed CPS that will increase from the Next Purchase. (This includes all bonuses, regardless of what items they're on - it's just the raw amount that your CPS will increase above the Big Cookie.)
- **Full Δ CPS**: The amount of estimated effective CPS that will increase from the Next Purchase. This is the Base Δ CPS + the amount of change in the estimated CPS value of Golden Cookies.
- **Purchase Efficiency**: This is the efficiency calculation for the next purchase. If building to a chain, this may temporarily appear much worse than other options. If the recommendation engine formula changes, this number will too.
- **Chain Efficiency**: Only visible if building to a chain. This is the efficiency calculation for the entire chain. (This currently does not take into account CPS increases from the purchase of prerequisites, and thus is actually under-estimating how efficient the full chain will be, to simplify calculations. This may be changed at a later date.)
- **Golden Cookie Efficiency**: This the efficiency calculation of holding on to a bank of 10x Max Golden Cookie Value (and thus maximize the amount of Cookies earned across all Golden Cookie clicks).

## Golden Cookie Information

- **Current Average Cookie Value**: This is the average value of Golden Cookies with your current CPS, Cookie Bank, and upgrades. This is the idealised equivalent to clicking 1000 Golden Cookies with your current CPS/Bank/Upgrades, and then dividing the total amount of Cookies gained by 1000. If your GC Average is currently maxed out, then this will be marked as _(Max)_.
- **Max Lucky Cookie Value**: This is the absolute maximum value that you can get from a Lucky! Golden Cookie, with the upgrades you have purchased. (Specifically, if you have Get Lucky, it's 8400 _ Current CPS; Otherwise, it's 1200 _ Current CPS).
- **Cookie Bank Required for Max Lucky**: This is the amount of cookies needed to maximise a Lucky! Golden Cookie. It's just the previous value \* 10.
- **Estimated Cookie CPS**: This is a rough estimate of how much CPS you'd effectively add by clicking every Golden Cookie. Currently, with the Autoclick GC turned off, this will return 0.
- **Golden Cookie Clicks**: The number of times you've clicked a Golden Cookie.
- **Missed Golden Cookie Clicks**: The number of times you've _not_ clicked a Golden Cookie before it faded from view.
- **Last Golden Cookie Effect**: The internal name of the last Golden Cookie effect.
- **Total Recorded Frenzy Time**: The total amount of time (while FC was loaded) that has been spent in a Frenzy.
- **Total Recorded Non-Frenzy Time**: The total amount of time (while FC was loaded) that has been spent not in a Frenzy.

## Heavenly Chips Information

- **HC Now**: The number of HC currently owned.
- **HC After Reset**: The number of HC you'll have if you reset right now.
- **Cookies to next HC**: The number of cookies needed to gain one more HC after reset.
- **Estimated time to next HC**: This is how long, at your current CPS, it will take to make enough cookies to gain one more HC after reset.
- **Time since last HC**: This is how long it has been since the last time you gained an HC.
- **Time to get last HC**: This is how long it actually took (including lucky bonuses, frenzy time, etc) to gain the last HC.
- **Average HC Gain/hr**: When the last HC was gained, this was the total number of HC that have been gained (ever) since the last reset, divided by the total amount of play time. Used in conjunction with the next value, this provides a (very) rough estimate of when you should begin to think about resetting. (When Average HC/hr is constantly less than Prev HC/hr.)
- **Previous Average HC Gain/hr**: This is the same calculation as the previous, but for the HC prior to the last one. (Yes, it's confusing. Sorry.)

## Other Information

- **Base CPS**: This is how many cookies you create every second, when a Frenzy is not active. (Marked with (\*) when this is the current CPS.)
- **Frenzy CPS**: This is how many cookies you create every second, when a Frenzy is active. (Marked with (\*) when this is the current CPS.)
- **Estimated Effective CPS**: This is an estimate (over time) of roughly how many cookies you create every second, when including the effects of clicking Golden Cookies. This will currently be the same as the Base CPS if Autoclick GC is turned off.
- **Game Started**: How long it's been since the most recent reset.

## Internal Information

This is actually a table of literally every purchase that Frozen Cookies is currently considering buying.

- **Efficiency**: The calculated Efficiency value of that purchase. This returns Infinity if the Δ CPS is negative. Smaller numbers are better.
- **Cost**: The cost of either the individual purchase, or the entire chain, for chained upgrades.
- **Δ CPS**: The full CPS change that buying this purchase would have. Includes estimated Golden Cookie CPS changes, meaning that it may be negative (especially for Elder Covenant.)

# Contact info and credits
Below info is for the official Frozen Cookies.

## Discord

For developers / code intended behavior purposes only.
https://discord.gg/Cpw8csuypT

## Contact Us!

Everyone who is contributing to this project can be found at some time or another on the Cookie Clicker IRC.

Server: irc.gamesurge.net

Channel: #ccdev or #dashnet

## Special Thanks

From the Cookie Clicker IRC, thanks to the following users:

- Bryanarby, for continuing development and update compatibility
- Vandalite, for tons of calculations and other general help with the underlying math
- Code14715, for excessively helpful amounts of testing
- Eearslya, for constantly nagging me to add more non-cheat-y features
- Saeldur, for helping make the timers suck less
- Icehawk78, for writing this section and being a conceited ass
- Other people who I've temporarily forgotten and will add later
