# FrozenCookies Changelogs

This file contains a chronological record of all changes made to the FrozenCookies mod for Cookie Clicker. For mod information and installation instructions, please see the [README](README.md).

## What's new?

2025 May 26 (2)

-   Version bumped to 2.052.8
-   Performance improvements throughout the codebase. For more information, see [PERFORMANCE_UPDATE.md](PERFORMANCE_UPDATE.md).

2025 May 26

-   Version bumped to 2.052.7
-   Changed autoGodzamok rebuy to be more dependable
-   Some tweaks to the auto 100% combo to make it hopefully fail less
-   Split up the code from fc_main.js to sub files for easier editing
-   Added current Frenzy multiplier to the bottom of the milk
-   Added some ticker messages
-   Made the options display for toggles look the same as other options

2025 May 22

-   Version bumped to 2.052.6
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