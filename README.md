![A single round cookie with a soft, slightly crumbly texture, topped with blue candy pieces and silver sprinkles. The cookie rests on a bed of shredded coconut, creating a wintry, festive atmosphere. No text is present. The overall tone alludes to winter, a frozen atmosphere.](https://user-images.githubusercontent.com/6014923/165900996-4726d38f-3c7c-4932-8d2e-f98bed93a836.png)

![Version](https://img.shields.io/badge/version-2.052.6-blue)
![License](https://img.shields.io/github/license/erbkaiser/FrozenCookies)
[![GitHub issues](https://img.shields.io/github/issues/erbkaiser/FrozenCookies?label=issues)](https://github.com/erbkaiser/FrozenCookies/issues)
[![Last commit](https://img.shields.io/github/last-commit/erbkaiser/FrozenCookies?label=last%20commit)](https://github.com/erbkaiser/FrozenCookies/commits/main)

> ⚠️ **WARNING:**  
> **Auto Sweet** and **Auto Cast 100% Consistency Combo** are _experimental_ features.  
> Enabling them can ruin your game or cause irreversible changes.  
> Use at your own risk!
> 
# FrozenCookies

An automated Cookie Clicker tool.

## Quick Start

-   **Steam:** Subscribe on [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2816199538)
-   **Web:** Paste this in the console:  
    `Game.LoadMod("https://github.erbkaiser.com/FrozenCookies/frozen_cookies.js");`
-   **Bookmarklet/Userscript:** See 'How to use' below for details.

## Table of Contents

-   [Compatibility](#compatibility)
-   [How to use](#how-to-use)
-   [What can Frozen Cookies do?](#what-can-frozen-cookies-do)
-   [Changelogs](#whats-new)
-   [Planned Features and Known Issues](#planned-features-and-known-issues)
-   [All Options Explained](#what-do-these-options-actually-do-in-detail)
-   [Auto Cast and Combos](#auto-cast-and-combos)
-   [Efficiency Explained](#efficiency-what-does-it-mean)
-   [Frozen Cookies Data](#information-about-frozen-cookies-data)
-   [Original FC Credits](#original-contact-info-and-credits)

## Compatibility

**Current version:** erb-2.052.6  
Supports: Cookie Clicker web version 2.052 and Steam version 2.053

FrozenCookies works with most other mods, including [CCSE](https://github.com/klattmose/klattmose.github.io/tree/master/CookieClicker).  
It is likely **not compatible** with other automation mods or auto-clickers.

> **Note:** Some users have reported conflicts when using [Cookie Monster](https://github.com/CookieMonsterTeam/CookieMonster) together with FrozenCookies. For more information, see [issue #1193](https://github.com/CookieMonsterTeam/CookieMonster/issues/1193).

## How to use

If you see the **FrozenCookies** button at the top right of Cookie Clicker (replacing the **Info** button), the mod is installed and ready to use.

Click the button to open the FrozenCookies menu, where you can configure settings or use the Recommended Settings for a quick start. See below for installation instructions if you do not see the button.

### Steam

-   **Workshop: (Recommended)**  
     Subscribe at [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2816199538).
-   **Manual Install:**
    1.  Download the Steam folder from [here](https://erbkaiser.github.io/FrozenCookies/Steam/).
    2.  Place the `FrozenCookies` folder into your `mods/local` directory.
    3.  Remove or disable any other FrozenCookies variants.
    4.  Restart or refresh Cookie Clicker.
    5.  Enable Frozen Cookies in 'Manage mods' under Options.

### Web Version

1. Open your browser's developer tools (usually F12).
2. Go to the Console tab.
3. Paste and run:
    ```js
    Game.LoadMod("https://github.erbkaiser.com/FrozenCookies/frozen_cookies.js");
    ```
4. You should see a confirmation message in the console.
5. You might need to enable pasting in the browser console first, it will tell you if that is the case
6. Some net nanny programs may block my website. In that case, try to load from
   **Game.LoadMod("https://erbkaiser.github.io/FrozenCookies/frozen_cookies.js");**. If
   that also fails, contact your internet administrator and ask them to unblock
   github.erbkaiser.com

### Bookmarklet

1. Copy the **contents** (not the URL) of
   [fc_bookmarklet_loader.js](https://github.erbkaiser.com/FrozenCookies/fc_bookmarklet_loader.js).
2. Create a new bookmark and paste the code as its URL.
3. Open Cookie Clicker and click the bookmark.

### Userscript

1. Install [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) or [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
2. Visit [fc_userscript_loader.user.js](https://github.erbkaiser.com/FrozenCookies/fc_userscript_loader.user.js).
3. Click 'Install' in the upper right.
4. Open Cookie Clicker.

## What can Frozen Cookies do?

-   Shortens large numbers for readability (e.g., 1,234,567,890 becomes 1.235 billion)
-   Calculates what the next most efficient purchase should be\*
-   Can automatically buy the most efficient purchase for you\*
-   Analyzes Golden Cookies and can auto-click them as soon as they appear
-   Tracks and analyzes Heavenly Chips
-   Shows timers for: next Golden Cookie, time left in Frenzy, and time until next Heavenly Chip
-   Shows additional timers for: time to Golden Cookie Bank, time to next purchase, and time to complete a purchase chain
-   Provides detailed efficiency information for buildings and upgrades
-   Automates nearly every possible action in Cookie Clicker
-   Automatically updates to the latest version when loaded
-   May not eat all of your cookies

\*Note: "Most efficient" means the best option according to the script's current calculations, which may not always be perfect.

## What's new?

<details>
<summary>Click to expand!</summary>

2025 May 22

-   Reduced over-all lag a bit by changing timer intervals
-   Reduced lag for auto-Cyclius by only checking values once per minute
-   Rewrote the options menu

2025 May 20

-   Possibly, finally, fixed issue #19: Raw cookies per second is set to a very high value on initial load
-   FC Button now opens the original game Info Button and the FC Readme with buttons at the top of the page
-   Begun a full code rewrite which may or may not materialize. Goal is to optimize everything and reduce lag

2024 Mar 08

-   Significantly speed up Autosweet, thanks to dsf3449 for the PR

2024 Jan 24

-   Stop buying other upgrades if a no-upgrades blacklist (hardcore) is used

2024 Jan 23

-   Prevent Auto Dragon Orbs from running before temple is unlocked
-   Document issue with autoCast

2023 Aug 16

-   Some improvements to auto Rigidel by @mithrandi

2023 Jun 15

-   Add toggles in preferences for Auto-ascend and default season to make switching these
    more convenient

2023 May 15

-   Add new auto-ascend option to ascend when prestige is doubled
    ([Issue #137](https://github.com/erbkaiser/FrozenCookies/issues/137))
-   Add option to block ascending during active combo (#137)

2023 May 09

-   Autofrenzy will now kick in for Cursed Finger as well
    ([Issue #135](https://github.com/erbkaiser/FrozenCookies/issues/135))

2023 May 07

-   Updated for version 2.052 (final building)
-   Re-implemented 'simple' FTHOF autocasting method by request. Re-ordered autoCasting
options in Preferences **WARNING**: as part of this change, the spell options have
been changed. Existing settings should transfer 1:1.
</details>

### Older Changelogs

<details>
  <summary>Click to expand!</summary>

2022 Dec 30

-   Added 'Free Season' option to remain in the game base season

2022 Nov 30

-   Auto 100% Consistency Combo will no longer remove planted whiskerblooms to plant more
    whiskerblooms

2022 Nov 29

-   Added Game Seed to the Other Information section of the FC Menu
-   Moved current frenzy value to Golden Cookie Info section

2022 Nov 21

-   Implemented Ronna (R) and Quetta (Q) SI prefixes for 10^27 and 10^30.

2022 Nov 20

-   Hopefully finally fixed Rigidel failures
-   Removed 'Combo Cast' since it was too buggy

2022 Nov 08

-   Add new spell combo 'Combo Cast' which works like 'Double Cast', but instead of using
    HagC it will single cast spells until a combo is found

2022 Oct 04

-   Implement [Issue #55](https://github.com/erbkaiser/FrozenCookies/issues/55) 'Add a buy
    all upgrades function'
-   Fixed a bug that hid the Auto Bulk Buy option

2022 Sep 22

-   AutoSpell's minimum frenzy is now also applied to the double cast and 100% Consistency
    Combos
-   If a minimum frenzy is set for Auto-Loan and an active loan is being paid back
    (interest), no loan will be taken even if the total frenzy exceeds the value

2022 Sep 14

-   Restored auto dragon settings that were temporarily disabled behind the hood
-   Fixed a long standing bug with auto-Rigidel that could stop the entire mod from
    working and sugar lump harvesting to fail

2022 Sep 10

-   Auto-Halloween will no longer swap out of Valentines early, as all cookies for it can
    be gotten really quickly.
-   Removed Autobuy's double duty as an on/off switch for other options
-   Changed the Auto Dragon Aura system: if an aura is being set, it will first check if
    already is set in the other slot before doing so, to prevent needless swapping.
    **WARNING**: as an unintended consequence of this change, any existing automatic
    dragon aura may be cleared in the FC options.

2022 Sep 04

-   Add Auto-Dragon's Curve option (#93)

2022 Aug 30

-   Added a frenzy modifier check to the Auto Sugar Frenzy so you can make sure it only
    fires for big combos
-   The Current Frenzy (combination of all effects) is displayed on the Frozen Cookies
    button
-   Beautified the Frenzy Times so large numbers take the Number Display format
-   Add a one click option to set all recommended\* settings

2022 Aug 23

-   Updated auto-Cyclius to work with Supreme Intellect and to allow it to set all gods
    properly when activated.

2022 Aug 22

-   Auto-Pantheon could not set Holobore. Now, it can. An unfortunate side-effect of this
    fix is that any existing setups which have 'No god' selected for any of the three
    auto-Pantheon slots will now show Holobore set instead. This will not affect new
    installs of FC.

2022 Aug 21

-   Extended Auto Loan to also take loan 3, if desired
-   Completed documentation of the options
-   Add Auto-Cyclius to automate swapping Cyclius god throughout the day

2022 Aug 1

-   Any spell casting method that checks for a frenzy will now also check for a Dragon
    Harvest, _if_ Reaper of Fields or Reality Bending is an active aura

2022 Jul 29

-   Add a fifth auto cast option (#75). This works like the existing FTHOF auto cast but
    will only cast click and building specials.
-   Rewrote the 100% Consistency Combo again. Should actually work now.

2022 Jul 26

-   Auto-Godzamok now limits itself to the mine and factory cap (if set) and no longer is
    capped at 500. If you have more buildings than the cap, it will rebuy up to that cap.
-   Renamed a few preferences to make what they do more clear
-   Split the auto banking in two separate options, one to upgrade the bank level (to
    unlock loans and more storage) and one to automatically buy brokers.

2022 Jul 20

-   New feature: Auto-Dragon Orbs, with accompanying Cortex bakers Limit.
-   Reduced dragon petting speed for less visual spam

2022 Jul 18

-   Added an in-game link to this readme page
-   Added dedicated toggles for setting dragon auras and pantheon gods, if turned off
    auras and gods will not be set.

2022 Jul 17

-   Extended auto FTHOF and auto 100% consistency combos to also work with natural click
    frenzies, if two building buffs are stored
-   Changed autoBroker so it will only buy brokers if the next recommendation is a
    building, this should stop it from interfering too much with efficiency

2022 Jul 12

-   Fix some old issues with smart Auto cast and simplify the code; and finally documented
    how it works

2022 Jul 09

-   Putting an upgrade in the vault (once **Inspired checklist** is unlocked) will now
    prevent it from being auto-bought

2022 Jul 07

-   Returned Frozen Cookies ticker messages (now less common)
-   Changed auto-cast behaviour: Frenzy minimum is only checked for FTHOF, more chances
    are taken to shorten debuffs, and sugar lumps are always taken
-   (Hopefully) fixed a long standing issue with autobuying overshooting building limits
    (#25)

2022 Jul 02

-   Completed the Shiny Wrinkler protection code so you can now keep your shinies.
-   Frozen Cookies will now buy upgrades that don't give an immediate CpS benefit such as
    Omelette, offline cookie production upgrades, and the Sacrificial rolling pins
-   Tweaked the infobox text
-   Improved season switching logic
-   Disabled purchase logging by default to keep log more useful, can be re-enabled with a
    new option

2022 Jun 30

-   Add option to toggle display of missed golden cookie clicks (and turn off by default)
-   Add **experimental** autoSweet option to continually ascend until a grimoire seed with
    Sweet (free Sugar Lump) is found - once activated, it can only be disabled in the console
    with _FrozenCookies.autosweet = 0_

2022 Jun 21

-   Add automatic Sugar Frenzy
-   Add Sugar Baking protection so the mod will only auto-spend sugar lumps if you have
    101 or more stored
-   Added options to automatically set dragon auras
-   Added options to automatically set the pantheon
-   Turn the autobuy option into an on/off toggle for various automated actions like
    autoBroker, autoDragon. This allows changing the values without the game immediately
    buying.

2022 Jun 20

-   Once again rewrote auto FTHOF and 100% consistency combo + updated documentation.
    Should now work better.

2022 Jun 19

-   Add autoHalloween option
-   Rewrote auto FTHOF combo

2022 Jun 18

-   Revert FTHOF combo (mostly) to original method where only the combo is cast. Exception
    is made for the sugar lump spell.

2022 Jun 16

-   Removed not really working overflow for Frenzy Times
-   Edited Frozen Cookies menu layout
-   Tweaked smart FTHOF behaviour (should no longer waste a click frenzy if Dragonflight
    is active)

2022 Jun 06

-   Prevent rebuy spam if autoGodz is enabled but there is no building limit set, and over
    500 buildings are owned
-   Turn keyboard shortcuts into an option
-   Add autoLoan function: take loans 1 and 2 if a big click frenzy starts

2022 Jun 02

-   Reverted the Apr 14 change to automatically take loans during normal double casting as
    the gains aren't guaranteed to be worth it.

2022 May 19

-   Rebalanced the auto FTHOF combo and updated the readme with info about it

2022 May 13

-   Automatic dragon upgrading and dragon petting

2022 May 12

-   Updated for version 2.046 (beta)
-   Rigisell (used in Autoharvest SL with Rigidel) will now sell the cheapest building
    instead of always going for cursors, to keep Rigidel happy (from heshammourad)

2022 May 03

-   Change the smart FTHOF behaviour to cast a negative Stretch Time spell, if the next
    FTHOF spell would be Ruin or Clot and a timed debuff like a Clot or loan repayment is
    the only active effect

2022 Apr 29

-   Add an option to automatically buy stock brokers and upgrade bank office levels

2022 Apr 14

-   Automatically take Stock Market loans during FTHOF combo

2022 Mar 25

-   Extended safe buy mechanism to smart FTHOF and 100% consistency combos

2022 Jan 25

-   Changed auto-Godmazok to mines and factories as farms will get a synergy boost once
    the beta goes into live
-   Changed buy back behaviour for auto-G to stop at 500 max, so that enabling it won't
    devastate existing games where you have more mines and factories. Recommended to still
    enable the mine and factory limit once you can get over 600 of each, to keep them
    useful
-   Hid the Frenzy Times on the FC stats/settings page behind an overflow scrollbar

2022 Jan 16

-   Changed auto-Godzamok to farms and mines instead of cursors and farms since cursor
    synergies and aura gloves can earn more cookies than mines ever could.

2022 Jan 10 (bootleg DarkRoman version)

-   Copied the smart FTHOF behaviour from DarkRoman's variant:
    https://github.com/Darkroman/FrozenCookies
-   Copied the AutoComboFinder and smart Easter from DarkRoman
-   Fixed the broken auto-Godmazok behaviour that sold mines and factories instead of
    cursors

\*Note: Recommended for a late stage game only. Don't like these values? Don't use it.

</details>

### Changelogs from upstream
<details>
  <summary>Click to expand!</summary>

2020 Nov 2

-   Version 1.10.0
-   Add version check
-   Removed unused variables
-   Removed unused function
-   Update CookieClicker 2.031
-   New Building upgrades
-   New Grandma upgrades
-   New Synergy upgrades

2020 Oct 26

-   Version 1.9.0
-   Fix autoAscend number entry.
    ([Issue #49](https://github.com/Mtarnuhal/FrozenCookies/pull/49))
-   Fix recommendation list to show accurate efficiency percentages even when AutoBuy
    excludes the purchase of some buildings (like when they've hit their max).
    ([Issue #47](https://github.com/Mtarnuhal/FrozenCookies/pull/47))
-   Simplified Auto-Godzamok: Now just on or off. When on, it will wait until Dragonflight
    or Click Frenzy and sell all the cursors and farms to get the Devastation buff. Then,
    if AutoBuy is turned on, it will immediately buy the buildings back (stopping at the
    max for those buildings if a max has been set).
-   Fix autoharvest of sugar lump.
    ([Issue #18](https://github.com/Mtarnuhal/FrozenCookies/pull/18))
-   Show correct buff value on Devastation tooltip, even if additional buildings have been
    sold after the buff has started.
    ([Issue #46](https://github.com/Mtarnuhal/FrozenCookies/pull/46))
-   Fix Auto Bulkbuy to only actually kick in after a reincarnation instead of all the
    time.
-   Other minor fixes

2020 Sept 28

-   Version 1.8.0
-   Move preferences to their own file
-   Rearrange preferences into sections
-   Reword preferences for consistency
-   Fix autoCast() to correctly consider CPS
-   Update autoCast SE to javascript console
-   Display next purchase and chain name in timers

2020 Sept 15

-   Add function to make sure game is in buymode when autobuying
-   Fixed achievement not showing.

2018 Oct 27

-   Added Shimmering veil blacklists
-   Updated SE auto cast strategy to use new fractal engine instead of chancemaker.
-   Added farms to godzamok sold buildings as they contribute barely synergy. Sells all
    farms except 1 for the garden. Added a new option to limit farms just like cursors
-   Added Fractal engine related upgrade values

2018 Aug 6

-   New "Harvest Bank" option to select a higher Bank than for Frenzy/Clicking Frenzy if
    you want to get the maximum return from harvesting Bakeberries, Chocoroots, White
    Chocoroots, Queenbeets or Duketaters
-   Scenario selection for harvesting

2018 Aug 4

-   Automatically blacklists Sugar Frenzy and Chocolate Egg

2018 Mar 2:

-   Updated to work in patch 2.0045
-   More auto-Godzamok behavior options
-   Auto Spell Casting (Conj. Baked Goods, Force the Hand of Fate, Spontaneous Edifice,
    and Haggler's Charm [the fastest to spam for spell achievements])
-   Wizard Tower purchase limit toggle to stay at 100 mana
-   Auto Sugar Lump Harvesting
-   Cursor Autobuy limit option to keep Godzamok efficient at very high cursor counts
-   Auto bulk purchase on reincarnation (option to automatically buy in 10s or 100s after
    reincarnation to speed up early run

2017 Apr 14:

-   New option: FPS modifier

2017 Apr 12:

-   Wrinklers can now be popped efficiently or instantly

2017 Mar 31:

-   New option: Auto-ascension
-   Scientific notation changed a fair bit

2016 Dec 1:

-   New option: Default Season

2016 Nov 19:

-   Update discount calc with new discounts
-   Fix problem with lucky bank targeting during wrath
-   Add Earth Shatterer option to Chocolate Egg calc and display
-   Fix 'HC After Reset' stat
-   Fix: Auto-GS waited for Frenzy to end but incurred 7x cost anyway
-   Removed 'No GS' blacklists
-   Added label to Auto-GS option
-   Auto-GS no longer cheats

2016 Nov 13:

-   Fixed auto-buying of Santa upgrades
-   Fixed Lucky calc
-   Add support for new GC buffs
-   Internal Information: delta-CPS for Bank targets now compares to current bank
-   Golden Switch excluded from auto-buy (no blacklist necessary)

2016 Aug 11:

-   Added Golden Switch blacklists

2016 Jul 24:

-   Updated for Cookie Clicker 2.002

2014 May 27:

-   Time to Recoup Chocolate stat added
-   Chocolate Egg benefits being included in the HC stats section
-   Wrath Stage information added to the Internal Information section

2014 May 23:

-   Google Chrome updated, blocks invalid MIME-type scripts from running, forcing all
    users to switch to the gh-pages branch hosted on
    http://icehaw78.github.io/FrozenCookies; No local code changes were needed for this

2014 May 20:

-   Wrinklers will autopop if turned on, in Easter or Halloween, and don't have all
    seasonal cookies for that season unlocked. Will autobuy and value Faberge Egg, Golden
    Goose Egg, and Wrinklerspawn.
-   Century Egg doesn't cause the browser to freeze (note: It's still broken in beta;
    won't be fixed)
-   "Manual Seasons" blacklist removed (this is now integrated with the core autobuy - if
    you're in a season and don't have all related cookies, autobuy won't buy another
    season upgrade)
-   Wrinkler Saving functionality removed entirely, due to that working with the core game
    now
-   "No Buildings" blacklist added (for use with all of your Chocolate Egg hoarding
    needs - will maintain a Pledge if deemed valuable, as well as maintaining seasons)
-   Resetting while FC is loaded will now pop all wrinklers, sell all buildings, and
    finally buy the Chocolate Egg (if available) before actually resetting, without any
    manual interaction needed.
-   Console logging cleaned up quite a bit (now condenses HC reports by either 'In Frenzy'
    or 'Out of Frenzy', rather than spamming 100x "You gained 1 HC!" when not in a frenzy)
-   Added more granular Frenzy timing info in the Golden Cookie Info section
-   Keyboard shortcuts now include 'e' to pop up your save export string in a handy
    copyable window.
-   "Pastemode" added, to reverse the efficiency calculations

2014 May 18:

-   Updated to work with Easter beta (Major issue of Century Egg causing an infinite loop
    will freeze FC)

2014 Apr 28:

-   Found and fixed a major bug that was valuing autoclicking for wrinklers, which
    reverted the general consensus of "Never leave One Mind" for high-automation players
-   Started a cross-community strategy optimization Holy War

2014 Apr 8:

-   Rewrite cache recalculations with the design from @Bryanarby
-   Autopop wrinklers is season-aware and cost-efficiency-aware
-   Prevent negative-efficiency upgrades from being prioritized/existing
-   Provided number-shortening-code to Orteil for use in core CC

2014 Mar 18:

-   Chained Upgrades accurately simulate all prerequisites' benefits as well as costs
-   Wrinkler valuation updated to prevent exiting of One Mind if it shouldn't
-   Autobuy won't switch seasons during the first hour of that season (to avoid constant
    back and forth before unlocking anything in a given season).
-   A beta Wrinkler-saver (that is off by default) which will simply hook into the game's
    built in Save function, will store your wrinklers upon save, and when FC is first
    loaded, will restore them entirely (including amount sucked, life, and even position
    around the cookie). Use at your own risk.
-   A new "smart tracking" for the graphing stats, which introduces a delay between
    tracking times, and will increase the reporting during times of increased purchasing,
    and will decrease the reporting during times of saving. This is currently the
    recommended tracking method, if you plan on using the graphs. (Thanks to /u/bryanarby
    for the initial idea of a modulated tracking function.)
-   Even fewer bugs than before.
-   Possibly more bugs, as well?

2014 Mar 12:

-   Graphs!
-   Actually working with the most recent update
-   An attempt to model Reindeer/Wrinklers for efficiency calculation purposes (not quite
    working yet)
-   Maybe other stuff that I forgot?

2013 Dec 31:

-   Reindeer Autoclicker [technically not new, since someone else added this earlier]
-   Automatic Santa stage upgrading
-   Fixed a bug in the chained upgrade cost code that was calculating the cumulative cost
    of buildings very very wrong

2013 Nov 15:

-   Auto Blacklist Disabler - this will allow you to set a blacklist, but once its goal is
    reached, it will return to no blacklist. (This allows you to, among other things, turn
    on Grandmapocalypse Mode to acquire all halloween cookies, without having to monitor
    whether they're all gotten or not, and then it returns to normal buy all.) Without
    this turned on, blacklists will work how they previously did.
-   Grandmapocalypse Mode Blacklist - this will now stop you at Wrath:1, rather than
    Wrath:3, as this seems likely to be far more effective for wrinklers. After you've
    bought the Elder Pact, of course, you can't go back, but for those who want to run in
    the earlier mode, this will allow you to do so.
-   Beautified numbers now round properly. This includes a bug that surfaced last week,
    where thousands were displaying as millions, as well as the much older bug where
    999,999,999 would display as 1000 million, rather than 1 billion.
-   Golden cookie double-clicking bugs and buying Elder Covenant bugs - these should not
    be happening any more; if they are, please let me know.

2013 Oct 28:

-   Chain timer no longer resets after the purchase of each item in the chain (the total
    value of the chain is the cost of every prerequisite, the amount completed of the
    timer is the cost of all purchased prereqs + cookies on hand).
-   You can now change how numbers are shortened, with many different formatting options
    to choose from.
-   The giant efficiency table now marks Chained upgrades as such with a (C) in the list.
-   Clicking CPS is now included in any calculations involving time delays when autoclick
    is turned on.
-   Click Frenzy Autoclick (should) override the base autoclick speed if both are turned
    on and set.
-   Frenzy Power now shown when active (x7, x666, or x0.5)
-   Efficiency Table should now be slightly less terribly formatted (though likely not by
    much).
-   Numerous bugs from the previous versions should be fixed (I forget what all they are,
    though.)

2013 Oct 23:

-   Improved code stability, added large cookie autoclicker, clicking frenzy autoclicker,
    and blacklists for Speedrun/Hardcore achievements

2013 Oct 22:

-   Fixed multiple problems with the previous changes

2013 Oct 21:

-   Updated GC valuation code

2013 Oct 17:

-   Timers are much smoother and not on the FC page
-   Many stability improvements
-   Newer GC valuation code
-   Moved the hosting URL to one that won't cause script-type warnings when you load it.
    (http://icehawk78.github.io/FrozenCookies)

2013 Oct 03:

-   Finally getting around to updating this file.
-   Lots of other changes have been added in the meantime.

2013 Sep 23:

-   Added Chained Upgrade purchases
</details>

## Planned Features and Known Issues

### Planned Features

-   General code and performance improvements
-   Redesign of the options menu to make settings easier to adjust and changes less immediate
-   Increased customization for user preferences

### Known Issues

-   **Lag:** Frozen Cookies can cause noticeable lag due to its complexity. Lower the auto-click speed if performance drops.
-   **Golden Cookie timers:** Occasionally, Golden Cookie timers may disappear from the infobox. They will reappear with the next Golden Cookie spawn.
-   **Autocasting:** If Frozen Cookies loads before Wizard Towers are unlocked, autocasting may not activate automatically, even after unlocking them. Reload the game and mod to enable autocasting. This may also affect other minigame features like banks.
-   **Auto-Godzamok rebuy:** Sometimes, after an auto-Godzamok failure, buildings are rebought one at a time instead of all at once.

For more issues or feature requests, see the [GitHub issues page](https://github.com/erbkaiser/FrozenCookies/issues). Contributions and suggestions are welcome!

# What do these options actually do, in detail?

## Auto Clicking Options

| Option                | Description |
|-----------------------|-------------|
| **Autoclick**         | Simulates clicking the big cookie automatically. Value sets clicks per second (e.g., 250 for web, up to 1000 for fast Steam PCs). Increase until issues appear, then lower. May prevent manual wrinkler popping. |
| **Autofrenzy**        | Like Autoclick, but only during click frenzies. Allows higher value if system can't handle high-speed Autoclick always. |
| **Autoclick GC**      | Automatically clicks all golden and wrath cookies as soon as they appear. |
| **Autoclick Reindeer**| Instantly clicks reindeer when they appear. |
| **Auto Fortune**      | Instantly clicks fortunes in the news ticker. Consider disabling during active play, as some fortunes are best saved for later. |

## Auto Buying Options

| Option                | Description |
|-----------------------|-------------|
| **Autobuy**           | Automates all purchases except upgrades in the vault or buildings above set limits. Blacklists/research may pause purchases for optimal play. |
| **Other Upgrades**    | Buys upgrades that don’t directly boost CpS (which Autobuy would otherwise skip). |
| **Auto Blacklist**    | Disables the selected blacklist once its goal is achieved. |
| **Blacklist**         | Choose restrictions for Speedrun/Hardcore achievements, Grandmapocalypse, or to block all building purchases. |
| **Mine/Factory Limit**| Caps mines/factories (used by Auto-Godzamok). Recommended: ~500 for mid-game, 800+ for late game (factories usually 50–100 less than mines). |
| **Pastemode**         | Ignores efficiency and buys as many buildings as possible. Not recommended. |

## Other Automation Options

| Option                | Description |
|-----------------------|-------------|
| **Auto Bulkbuy**      | Sets bulk buy mode after ascending (does not persist after reload). |
| **Auto Buy All Upgrades** | Repeatedly buys all upgrades until at least one prestige level is earned. |
| **Auto-ascend**       | Automatically ascends when reaching a set number of new HCs or when prestige doubles. |
| **Ascending during combo** | Prevents auto-ascend during large combos (above minimum Frenzy). |
| **Autopop Wrinklers** | Pops wrinklers automatically, except during Halloween/Easter if you still need event drops. |
| **Save Shiny Wrinklers** | Protects shiny wrinklers from being popped and prevents ending the Grandmapocalypse. |
| **Autoharvest Sugar Lump** | Harvests ripe sugar lumps automatically, with optional Rigidel swap for early harvest. |
| **Auto-Dragon's Curve** | Swaps to Dragon's Curve aura (and optionally Reality Bending) when harvesting lumps for a higher chance of unusual lumps. |
| **Sugar Baking Guard** | Prevents automated lump spending if it would drop your lump count below 100 (to preserve Sugar Baking bonus). |
| **Auto-Golden Switch** | Toggles Golden Switch on for click frenzies and off afterward. |
| **Auto-Godzamok**     | Sells mines/factories during click frenzies if Godzamok is slotted, then rebuys up to the cap. |
| **Auto-Banking**      | Upgrades bank office level as soon as possible. |
| **Auto-Broker**       | Hires stock brokers if the next Autobuy is a building and funds allow. |
| **Auto-Loans**        | Takes loans automatically during click frenzies if certain conditions are met. |

## Pantheon Options

| Option                | Description |
|-----------------------|-------------|
| **Auto Pantheon**     | Automatically slots selected gods. If a god is set for multiple slots, only the highest slot is used. |
| **Auto-Cyclius**      | Periodically swaps Cyclius between slots for maximum bonus. Works best if other Pantheon slots are filled with different gods. If Supreme Intellect aura is active, uses a modified schedule. |

## Grimoire Options

| Option                | Description |
|-----------------------|-------------|
| **Wizard Tower Cap**  | Sets a mana cap for spellcasting. 37 is best for single FTHOF casting; 81–100 for double casting. Values above 100 waste mana. |
| **Auto Cast / Double Cast FTHOF / 100% Consistency Combo** | Choose one auto-casting method (see details elsewhere in the README). Only the lowest enabled option is active. |
| **Auto Sugar Frenzy** | Buys Sugar Frenzy with a lump during the first big combo of an ascension (if you have 101+ lumps and Sugar Baking Guard is active). You can set a minimum frenzy threshold. |
| **Auto Sweet**        | Experimental: rapidly ascends and casts spells to farm sugar lumps. Only disable via console. Do not use unless you know how. |

## Dragon Options

| Option                | Description |
|-----------------------|-------------|
| **Dragon Upgrading**  | Buys dragon upgrades as soon as possible, ignoring chains. |
| **Dragon Petting**    | Rapidly pets the dragon until all drops are unlocked for the ascension. |
| **Dragon Auras**      | Sets desired auras in order (Aura 1 in slot 1, Aura 2 in slot 2). |
| **Auto Dragon Orbs**  | If Dragon Orbs aura is active and Godzamok is not slotted, repeatedly sells Yous to spawn golden cookies. |
| **You Limit**         | Caps the number of Yous bought to avoid losing all cookies to Auto Dragon Orbs. |

## Season Options

| Option                | Description |
|-----------------------|-------------|
| **Default Season**    | Sets the default season if all drops from other seasons are unlocked. Disables Auto-Buy to avoid overpaying. |
| **Free Season**       | Overrides Default Season to stay in the base season (Christmas/Business Day or all seasons). |
| **Auto-Easter Switch**| Switches to Easter during Cookie Storms if you still need eggs. |
| **Auto-Halloween Switch** | Switches to Halloween if you still need spooky biscuits and wrinklers are present. |

## Bank Options

_All bank options add a reserve to the next Autobuy purchase, so you never drop below the set amount. The highest active bank is used._

| Option                | Description |
|-----------------------|-------------|
| **SE Bank**           | Keeps half the cost of your most expensive building in reserve (always on if auto-casting SE). |
| **Harvesting bank**   | Keeps enough cookies in reserve to maximize plant harvests (e.g., Bakeberries). |
| **Harvesting during CpS multiplier** | Increases the harvesting bank if you want to harvest during frenzies or other multipliers. |

## Other Options

| Option                | Description |
|-----------------------|-------------|
| **Shortcuts**         | Enables keyboard shortcuts:<br>• 'a': toggle autobuy<br>• 'b': show building spread<br>• 'c': toggle auto-GC<br>• 'e': show export string<br>• 'r': reset window<br>• 's': manual save<br>• 'w': wrinkler info |
| **GC Clicked percentage** | Sets the assumed percentage of golden cookies clicked for efficiency calculations. Leave at default unless you know what you’re doing. |

## Display Options

| Option                | Description |
|-----------------------|-------------|
| **Show Missed GCs**   | Displays missed golden cookie clicks in the info panel. |
| **Number Display**    | Choose how numbers are shown:<br>• RAW: plain numbers<br>• FULL: full names (e.g., "3.753 trillion")<br>• INITIALS: short names (e.g., "3.753T")<br>• SI Units: SI prefixes (up to 1e33)<br>• SCIENTIFIC: scientific notation (e.g., 6.3e12) |
| **Infobox**           | Shows next purchase and active frenzies in the milk window (as text, graphics, or both). |
| **Logging**           | Logs mod actions to the console (except Autobuy purchases). Disabling may improve performance. |
| **Purchase Log**      | Logs every purchase and resulting CpS. |
| **Frame Rate**        | Adjusts the game’s speed. |
| **Tracking**          | Tracks stats over time for graphing. May slow the game or use lots of memory if left on. |
| **Recommended**       | Sets all options to recommended defaults for mid/late game. Forces a save and reload. **Warning:** Resets all options. |

# Auto Cast and Combos

Frozen Cookies offers several ways to automate spell casting in the Grimoire minigame. The available methods range from simple auto-casting to advanced combos that maximize cookie gains. Combo methods always take priority over simpler auto-cast options.

**General Spellcasting Logic:**

-   If the next spell is _'Sweet'_ (free Sugar Lump), Frozen Cookies will always cast _Force the Hand of Fate_ (FTHOF) next, if you have enough mana.
-   If the next spell is _Clot_ or _Ruin cookies_ and you are under a timed debuff (like Clot), it will cast _Stretch Time_ to shorten the debuff.
-   If the next spell is _Clot_ or _Ruin cookies_ and you are **not** under a timed debuff, it will cast _Haggler's Charm_ instead, to avoid a negative effect.
-   If a Golden Cookie is on screen and the next FTHOF spell is a backfire, it will wait until the cookie is clicked or expires before casting.

## Auto Cast Options

-   **Conjure Baked Goods:**
     Automatically casts Conjure Baked Goods whenever possible.

-   **Force the Hand of Fate (Simple):**
     Casts FTHOF as soon as you have enough mana. If a minimum Frenzy is set, it waits for that Frenzy before casting.

-   **Force the Hand of Fate (Smart):**
     Like the simple method, but with extra logic: - If the next spell is _Click Frenzy_, it waits for a _Frenzy_ or _Dragon Harvest_ (plus a _Building Special_) to be active for the full duration. - If _Reaper of Fields_ aura is active, both _Frenzy_ and _Dragon Harvest_ must be active. - If the next spell is _Elder Frenzy_ or _Cursed Finger_, it waits for a _Click Frenzy_ or _Dragonflight_ to be active for the full duration.

-   **FTHOF (Click and Building Specials Only):**
     Like the smart method, but only casts when the next spell is a Click or Building Special. All other spells are replaced with _Haggler's Charm_.

-   **Spontaneous Edifice:**
     Sells one You, then casts Spontaneous Edifice to try for a free building. Not useful after 400+ of each building.

-   **Haggler's Charm:**
     Always casts Haggler's Charm, regardless of outcome. Useful for rapid spell casting.

## Combo Options

-   **Double Cast FTHOF:**
     Replaces all other auto-cast methods. Looks for a combo of click frenzies and building specials, then double-casts FTHOF for a huge boost. If no combo is available, casts _Haggler's Charm_ instead.

    **Possible combos include:** - Stored _Click Frenzy_ and _Elder Frenzy_ plus a natural _Frenzy_ or _Dragon Harvest_ and a _Building Special_. - Stored _Click Frenzy_ and a _Building Special_ plus a natural _Frenzy_ or _Dragon Harvest_ and another _Building Special_. - Two stored _Building Specials_ plus a natural _Frenzy_ or _Dragon Harvest_ and any click frenzy (_Click Frenzy_, _Dragonflight_, or _Elder Frenzy_). - With _Reaper of Fields_ aura, both _Frenzy_ and _Dragon Harvest_ must be active.

    **Mana requirements for double casting (by Wizard Tower level):** - Level 1–4: 81 mana - Level 5: 83 mana - Level 6: 88 mana - Level 7: 91 mana - Level 8: 93 mana - Level 9: 96 mana - Level 10: 98 mana

    Setting max mana to 100 is recommended for all levels. Do not upgrade Wizard Towers beyond level 10 for this combo.

-   **100% Consistency Combo:**
     An advanced endgame combo that automates the FTHOF double cast and adds extra steps for maximum effect. Requires: - Wizard Towers at level 10 with at least 98 max mana - At least 1 sugar lump (101+ recommended for Sugar Baking bonus) - Fully upgraded dragon (two aura slots) - At least 1 god swap, or Godzamok in Diamond and Mokalsium in Ruby - Whiskerblooms unlocked in the garden (all plants will be harvested, including Juicy Queenbeets)

    For best results, disable mine and factory caps in Frozen Cookies settings. While active, the combo will ignore wrath cookies (they are likely to be clots).

    [Reference: 100% Consistency combo details](https://pastebin.com/raw/bMHEJ3R9)

## Auto Sweet

Not a spell combo, but an experimental feature. When enabled, Auto Sweet will repeatedly ascend until a grimoire seed with _'Sweet'_ (free Sugar Lump) appears in the first 10 spells, then cast _Haggler's Charm_ until _Sweet_ is cast. It then disables itself.

**Warning:**
Once Auto Sweet is enabled, it can only be turned off in the browser console with the following code:
```js
FrozenCookies.autosweet = 0
```
It will auto-disable after casting _Sweet_.
**Note:** On Steam, there is no way to disable Auto Sweet once enabled except by waiting for it to finish.

# Efficiency: What Does It Mean?

Frozen Cookies uses a custom efficiency formula to decide what your next optimal purchase should be. The goal is to maximize your progress by balancing cost and the resulting increase in cookies per second (CpS).

The current efficiency formula is:

```

                     cost    cost
Efficiency = 1.15 \* ----- + -----
                     CpS     ΔCpS

```

Where:

-   **cost** = price of the item (building or upgrade)
-   **CpS** = your current cookies per second
-   **ΔCpS** = the increase in CpS from the purchase

This formula is based on the idea that, given two possible purchases (A and B), purchase A is better if:

```

a.cost    b.cost        b.cost    a.cost
------- + ----------- < ------- + -----------
CpS       a.CpS+CpS     CpS       b.CpS+CpS

```

Originally, the formula was simply `(cost/CpS + cost/ΔCpS)`. However, after extensive simulations (thanks to Vandalite), it was found that multiplying the first term by 1.15 slightly improves long-term efficiency.

For Golden Cookies, a simpler `cost/ΔCpS` formula is used to determine when to start saving up a "bank" for Lucky payouts, since building up the bank itself increases your effective CpS over time.

These formulas may be updated if better algorithms are discovered. There is also ongoing work to simplify efficiency values into easy-to-understand percentages for users.

![Comparison chart: Cookie Monster uses the simpler (cost/ΔCpS) formula, which is less efficient than either Frozen Cookies method.](http://i.imgur.com/BvVRadm.png)

# Information about Frozen Cookies Data

This section explains the data shown in the Frozen Cookies menu:

## Autobuy Information

-   **Next Purchase**: The item (building or upgrade) that Frozen Cookies recommends as your next optimal purchase. If autobuy is enabled, this is what will be bought next.
-   **Building Chain to**: Shown only if the optimal purchase is an upgrade with unmet prerequisites. This displays the final upgrade, while "Next Purchase" shows the prerequisite to buy first.
-   **Time until completion**: How long it will take, at your current CpS (cookies per second), to afford the Next Purchase. This includes any required Golden Cookie bank.
-   **Time until chain completion**: If building toward a chain, this shows the time needed to buy all prerequisites and the target upgrade.
-   **Cost**: The price of the Next Purchase.
-   **Golden Cookie Bank**: The amount of cookies Frozen Cookies recommends keeping on hand to maximize Golden Cookie rewards.
-   **Base Δ CpS**: The raw increase in displayed CpS from the Next Purchase, including all bonuses.
-   **Full Δ CpS**: The estimated effective CpS increase, combining the Base Δ CpS and the change in Golden Cookie value.
-   **Purchase Efficiency**: The calculated efficiency of the Next Purchase, based on Frozen Cookies’ formula. This may look worse for chains until all prerequisites are bought.
-   **Chain Efficiency**: The efficiency of the entire chain (if applicable). Note: This does not account for CpS increases from buying prerequisites, so it may underestimate true efficiency.
-   **Golden Cookie Efficiency**: The efficiency of saving a bank of 10× the maximum Golden Cookie value, to maximize gains from Golden Cookie clicks.

## Golden Cookie Information

-   **Current Average Cookie Value**: The average value of Golden Cookies with your current CpS, bank, and upgrades. If this is at its maximum, it will be marked as _(Max)_.
-   **Max Lucky Cookie Value**: The highest possible value from a Lucky! Golden Cookie, based on your upgrades (typically 8400× CpS with Get Lucky, or 1200× CpS without).
-   **Cookie Bank Required for Max Lucky**: The number of cookies you need to have on hand to get the maximum Lucky! payout (Max Lucky Cookie Value × 10).
-   **Estimated Cookie CpS**: An estimate of the effective CpS you’d gain by clicking every Golden Cookie. If Autoclick GC is off, this will be 0.
-   **Golden Cookie Clicks**: The total number of Golden Cookies you’ve clicked.
-   **Missed Golden Cookie Clicks**: The number of Golden Cookies that appeared but were not clicked before disappearing.
-   **Last Golden Cookie Effect**: The internal name of the last Golden Cookie effect you received.
-   **Total Recorded Frenzy Time**: The total time (while Frozen Cookies was loaded) spent in a Frenzy.
-   **Total Recorded Non-Frenzy Time**: The total time (while Frozen Cookies was loaded) spent not in a Frenzy.

## Heavenly Chips Information

-   **HC Now**: The number of Heavenly Chips you currently own.
-   **HC After Reset**: The number of Heavenly Chips you would have if you reset now.
-   **Cookies to next HC**: The number of cookies needed to earn one more Heavenly Chip after reset.
-   **Estimated time to next HC**: How long it will take, at your current CpS, to earn another Heavenly Chip after reset.
-   **Time since last HC**: How long it has been since you last gained a Heavenly Chip.
-   **Time to get last HC**: The actual time it took to earn your most recent Heavenly Chip (including bonuses and frenzies).
-   **Average HC Gain/hr**: Your average rate of earning Heavenly Chips per hour since the last reset.
-   **Previous Average HC Gain/hr**: The average rate for the previous Heavenly Chip, for comparison.

## Other Information

-   **Base CpS**: Your CpS when no Frenzy is active. Marked with (\*) if this is your current CpS.
-   **Frenzy CpS**: Your CpS during a Frenzy. Marked with (\*) if this is your current CpS.
-   **Estimated Effective CpS**: An estimate of your average CpS over time, including Golden Cookie effects. If Autoclick GC is off, this matches Base CpS.
-   **Game Started**: Time since your most recent reset.

## Internal Information

This table lists every purchase Frozen Cookies is currently considering.

-   **Efficiency**: The calculated efficiency value for each purchase. If Δ CpS is negative, this will be Infinity. Lower numbers are better.
-   **Cost**: The price of the purchase or the total cost for a chain.
-   **Δ CpS**: The total CpS change from the purchase, including estimated changes from Golden Cookies. This can be negative for some upgrades (like Elder Covenant).

---

# Original Contact info and credits

<span title="This section is from the original Frozen Cookies mod by icehawk78, which this project is based on.">The below info is from upstream.</span>

## Discord

For developers / code intended behavior purposes only. https://discord.gg/Cpw8csuypT
_(link invalid as of 2023)_

## Contact Us!

Everyone who is contributing to this project can be found at some time or another on the
Cookie Clicker IRC.

Server: irc.gamesurge.net

Channel: #ccdev or #dashnet

## Special Thanks

From the Cookie Clicker IRC, thanks to the following users:

-   Bryanarby, for continuing development and update compatibility
-   Vandalite, for tons of calculations and other general help with the underlying math
-   Code14715, for excessively helpful amounts of testing
-   Eearslya, for constantly nagging me to add more non-cheat-y features
-   Saeldur, for helping make the timers suck less
-   Icehawk78, for writing this section and being a conceited ass
-   Other people who I've temporarily forgotten and will add later
