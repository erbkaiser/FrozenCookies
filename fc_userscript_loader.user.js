// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies
// @author         Icehawk78 / erbkaiser
// @homepage       https://github.erbkaiser.com/FrozenCookies/
// @include        http://orteil.dashnet.org/cookieclicker/
// @include        https://orteil.dashnet.org/cookieclicker/
// @updateURL      https://github.erbkaiser.com/FrozenCookies/fc_userscript_loader.user.js
// @downloadURL    https://github.erbkaiser.com/FrozenCookies/fc_userscript_loader.user.js
// ==/UserScript==

// Source:    https://github.com/erbkaiser/FrozenCookies/main/
// Github.io: https://erbkaiser.github.io/FrozenCookies/
var loadInterval = setInterval(function () {
    const Game = unsafeWindow.Game;
    if (Game && Game.ready) {
        clearInterval(loadInterval);
        Game.LoadMod(
            "https://github.erbkaiser.com/FrozenCookies/frozen_cookies.js"
        );
    }
}, 1000);
