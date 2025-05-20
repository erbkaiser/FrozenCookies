// Various UI/DOM-related functions moved from the main script to keep it clean and organized.
// This file is loaded after the main script, so it can access all variables and functions.

function toggleFrozen(setting) {
    FrozenCookies[setting] = FrozenCookies[setting] ? 0 : 1;
    FCStart();
}

function scientificNotation(value) {
    if (typeof value !== "number" || !isFinite(value)) return "NaN";
    if (value === 0) return "0";
    const absValue = Math.abs(value);
    if (absValue >= 1 && absValue < 1000) return rawFormatter(value);
    // Use 3 significant digits for better readability
    return value
        .toExponential(3)
        .replace(
            /e\+?(-?)(0*)(\d+)/,
            (m, sign, zeros, digits) => "e" + sign + digits
        );
}

// Number formatters for displaying large numbers in various styles
function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const numberFormatters = [
    memoize(rawFormatter),
    memoize(formatEveryThirdPower([
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
    ])),
    memoize(formatEveryThirdPower([
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
    ])),
    memoize(formatEveryThirdPower([
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
    ])),
    memoize(scientificNotation),
];

function fcBeautify(value) {
    if (typeof value !== "number" || isNaN(value)) return "NaN";
    const negative = value < 0;
    value = Math.abs(value);
    const idx = Math.max(
        0,
        Math.min(FrozenCookies.numberDisplay, numberFormatters.length - 1)
    );
    let output = numberFormatters[idx](value);
    if (
        typeof output === "number" ||
        (/^\d+$/.test(output) && !/e[\+\-]?\d+$/i.test(output))
    ) {
        output = output.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return negative ? "-" + output : output;
}

function beautifyUpgradesAndAchievements() {
    function beautifyAllNumbers(str) {
        return str.replace(/\b\d{1,3}(?:,\d{3})*\b/g, (match) => {
            if (/[a-zA-Z]/.test(match)) return match;
            return Beautify(parseInt(match.replace(/,/g, ""), 10));
        });
    }
    Object.values(Game.AchievementsById).forEach((ach) => {
        if (typeof ach.desc === "string")
            ach.desc = beautifyAllNumbers(ach.desc);
    });
    Object.values(Game.UpgradesById).forEach((upg) => {
        if (typeof upg.desc === "string")
            upg.desc = beautifyAllNumbers(upg.desc);
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
    if (typeof text === "string" && text.includes("Devastation")) {
        text = text.replace(
            /\+\d+\%/,
            "+" +
                Math.round((Game.hasBuff("Devastation").multClick - 1) * 100) +
                "%"
        );
    }
    Game.tooltip.oldDraw(from, text, origin);
}

function getBuildingSpread() {
    return Game.ObjectsById.map((obj) => `${obj.name}: ${obj.amount}`).join(
        " / "
    );
}

// Keyboard shortcuts
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
    const confirm = () =>
        callback(document.getElementById("fcGenericInput").value);
    document.getElementById("promptOption0").onclick = confirm;
    const input = document.getElementById("fcGenericInput");
    input.focus();
    input.select();
    input.onkeydown = function (e) {
        if (e.key === "Enter") {
            confirm();
            Game.ClosePrompt();
        }
    };
}

function validateNumber(value, minValue = null, maxValue = null) {
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
    if (!display?.length || !button) return;
    let current = Number(FrozenCookies[preferenceName]) || 0;
    let next = (current + 1) % display.length;
    FrozenCookies[preferenceName] = next;
    button.innerText = display[next];
    FrozenCookies.recalculateCaches = true;
    Game.RefreshStore();
    Game.RebuildUpgrades();
    FCStart();
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
            () => Game.Notify("Copied!", "Text copied to clipboard.", [16, 5]),
        );
    }
}
