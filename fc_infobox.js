// Color and layout constants
const COLORS = {
    t_b: [
        "rgba(170, 170, 170, 1)",
        "rgba(187, 187, 187, 1)",
        "rgba(204, 204, 204, 1)",
        "rgba(221, 221, 221, 1)",
        "rgba(238, 238, 238, 1)",
        "rgba(255, 255, 255, 1)",
    ],
    chain: "rgba(51, 51, 51, 1)",
    next: "rgba(17, 17, 17, 1)",
    bank: "rgba(252, 212, 0, 1)",
    gc_max: "rgba(255, 155, 0, 1)",
    gc_est: "rgba(255, 222, 95, 1)",
    gc_min: "rgba(255, 235, 0, 1)",
    building_special: "rgba(218, 165, 32, 1)",
    infobox_bg: "rgba(153, 153, 153, 0.6)",
    buffs: {
        // Buff colors
        // Match with const SPELL_NAMES in fc_spells.js
        frenzy: "rgba(255, 222, 95, 1)",
        click_frenzy: "rgba(0, 196, 255, 1)",
        cookie_storm: "rgb(31, 44, 94)",
        clot: "rgba(255, 54, 5, 1)",
        cursed_finger: "rgba(23, 79, 1, 1)",
        elder_frenzy: "rgba(79, 0, 7, 1)",
        dragon_harvest: "rgba(206, 180, 49, 1)",
        dragonflight: "rgba(183, 206, 49, 1)",
    }
};

const LAYOUT = {
    maxRadiusBase: 10,
    maxRadiusStep: 10,
    arcOffset: 5,
    textFontSize: "12px",
    textFontFamily: "Arial",
    textYOffset: 15,
    textPadding: 20,
    infoboxPadding: 20,
    infoboxXOffset: 35,
    infoboxYOffset: 5,
    arcStrokeWidth: 10,
    arcInnerStrokeWidth: 1,
    arcMainStrokeWidth: 7,
    arcInnerOffset: 5,
    infoboxBgYOffset: 5,
    infoboxBgExtra: 20,
    canvasHeightOffset: 140,
};

let lastDrawData = null;

function drawCircles(t_d, x, y) {
    const c = $("#backgroundLeftCanvas");
    const isFancyUI = FrozenCookies.fancyui > 1;
    const isTextUI = FrozenCookies.fancyui % 2 === 1;

    // Skip if unchanged
    const t_d_str = JSON.stringify(t_d);
    if (t_d_str === lastDrawData) return;
    lastDrawData = t_d_str;

    if (typeof c.measureText !== "function") return;

    const nonOverlayCount = t_d.reduce((sum, item) => item.overlay ? sum : sum + 1, 0);
    const maxRadius = LAYOUT.maxRadiusBase + LAYOUT.maxRadiusStep * nonOverlayCount;
    const heightOffset = maxRadius + LAYOUT.arcOffset - (LAYOUT.textYOffset * (t_d.length - 1)) / 2;

    const maxText = _.max(
        t_d.map(o => o.name ? o.name + (o.display ? ": " + o.display : "") : ""),
        str => str.length
    );
    const maxMeasure = c.measureText({
        fontSize: LAYOUT.textFontSize,
        fontFamily: LAYOUT.textFontFamily,
        maxWidth: c.width,
        text: maxText,
    });
    const maxWidth = maxMeasure.width;
    const maxHeight = maxMeasure.height * t_d.length;

    if (isTextUI) {
        c.drawRect({
            fillStyle: COLORS.infobox_bg,
            x: x + maxRadius * 2 + maxWidth / 2 + LAYOUT.infoboxXOffset,
            y: y + maxRadius + LAYOUT.infoboxBgYOffset,
            width: maxWidth + LAYOUT.infoboxPadding,
            height: maxHeight + LAYOUT.infoboxBgExtra,
        });
    }

    let i_c = 0, i_tc = 0;
    t_d.forEach(o_draw => {
        if (o_draw.overlay) {
            i_c--;
        } else if (isFancyUI) {
            const arcX = x + maxRadius + LAYOUT.arcOffset;
            const arcY = y + maxRadius + LAYOUT.arcOffset;
            const radius = maxRadius - i_c * LAYOUT.maxRadiusStep;
            c.drawArc({
                strokeStyle: COLORS.t_b[i_c % COLORS.t_b.length],
                strokeWidth: LAYOUT.arcStrokeWidth,
                x: arcX,
                y: arcY,
                radius,
            });
            c.drawArc({
                strokeStyle: COLORS.t_b[(i_c + 2) % COLORS.t_b.length],
                strokeWidth: LAYOUT.arcInnerStrokeWidth,
                x: arcX,
                y: arcY,
                radius: radius - LAYOUT.arcInnerOffset,
            });
        }
        if (isFancyUI) {
            c.drawArc({
                strokeStyle: o_draw.c1,
                x: x + maxRadius + LAYOUT.arcOffset,
                y: y + maxRadius + LAYOUT.arcOffset,
                radius: maxRadius - i_c * LAYOUT.maxRadiusStep,
                strokeWidth: LAYOUT.arcMainStrokeWidth,
                start: 0,
                end: 360 * o_draw.f_percent,
            });
        }
        if (isTextUI && o_draw.name) {
            c.drawText({
                fontSize: LAYOUT.textFontSize,
                fontFamily: LAYOUT.textFontFamily,
                fillStyle: o_draw.c1,
                x: x + maxRadius * 2 + maxWidth / 2 + LAYOUT.infoboxXOffset,
                y: y + heightOffset + LAYOUT.textYOffset * i_tc,
                text: o_draw.name + (o_draw.display ? ": " + o_draw.display : ""),
            });
            i_tc++;
        }
        i_c++;
    });
}

// ... rest of the code remains unchanged, but replace color/layout values with constants ...

function updateTimers() {
    // update infobox calculations and assemble output -- called every draw tick
    const gcTime = Game.shimmerTypes.golden.time;
    const maxTime = maxCookieTime();
    const getDelay = (prob, time = gcTime) => (probabilitySpan("golden", time, prob) - time) / maxTime;
    const getBuffDelay = name => buffDuration(name) / maxTime;

    const gc_delay = getDelay(0.5);
    const gc_max_delay = getDelay(0.99);
    const gc_min_delay = getDelay(0.01);

    const delays = {
        clot: getBuffDelay("Clot"),
        elder_frenzy: getBuffDelay("Elder frenzy"),
        frenzy: getBuffDelay("Frenzy"),
        dragon_harvest: getBuffDelay("Dragon Harvest"),
        click_frenzy: getBuffDelay("Click frenzy"),
        dragonflight: getBuffDelay("Dragonflight"),
        cursed_finger: getBuffDelay("Cursed finger"),
        building_special: hasBuildingSpecialBuff() / maxTime,
        cookie_storm: getBuffDelay("Cookie storm"),
    };

    const bankTotal = delayAmount();
    const purchase = nextPurchase();
    const purchaseTotal = purchase.cost;
    const purchaseCompletion = Game.cookies / (bankTotal + purchaseTotal);
    const bankPercent = Math.min(Game.cookies, bankTotal) / (bankTotal + purchaseTotal);
    const bankMax = bankTotal / (purchaseTotal + bankTotal);
    const actualCps = Game.cookiesPs + Game.mouseCps() * FrozenCookies.cookieClickSpeed;

    let chainTotal = 0, chainCompletion = 0, chainPurchase;
    if (nextChainedPurchase().cost > purchase.cost) {
        chainPurchase = nextChainedPurchase().purchase;
        chainTotal = upgradePrereqCost(chainPurchase, true) - chainPurchase.getPrice();
        const chainFinished = chainTotal - (upgradePrereqCost(chainPurchase) - chainPurchase.getPrice());
        chainCompletion = (chainFinished + Math.max(Game.cookies - bankTotal, 0)) / (bankTotal + chainTotal);
    }

    const t_draw = [];

    if (chainTotal) {
        t_draw.push({
            f_percent: chainCompletion,
            c1: COLORS.chain,
            name: "Chain to: " + decodeHtml(chainPurchase.name),
            display: timeDisplay(divCps(Math.max(chainTotal + bankTotal - Game.cookies - (chainTotal - (upgradePrereqCost(chainPurchase) - chainPurchase.getPrice())), 0), actualCps)),
        });
    }

    if (purchaseTotal > 0 && purchase.type === "building" && Game.season === "fools") {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: COLORS.next,
            name: "Next: " + decodeHtml(Game.foolObjects[purchase.purchase.name].name),
            display: timeDisplay(divCps(Math.max(purchaseTotal + bankTotal - Game.cookies, 0), actualCps)),
        });
    } else {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: COLORS.next,
            name: "Next: " + decodeHtml(purchase.purchase.name),
            display: timeDisplay(divCps(Math.max(purchaseTotal + bankTotal - Game.cookies, 0), actualCps)),
        });
    }

    if (bankMax > 0 && bankPercent > 0 && Game.cookies < bankTotal) {
        t_draw.push({
            f_percent: bankPercent,
            c1: COLORS.bank,
            name: "Bank Completion",
            display: timeDisplay(divCps(Math.max(bankTotal - Game.cookies, 0), actualCps)),
            overlay: true,
        });
    }

    if (gc_delay > 0) {
        t_draw.push({
            f_percent: gc_max_delay,
            c1: COLORS.gc_max,
            name: "GC Maximum (99%)",
            display: timeDisplay((gc_max_delay * maxTime) / Game.fps),
        });
        t_draw.push({
            f_percent: gc_delay,
            c1: COLORS.gc_est,
            name: "GC Estimate (50%)",
            display: timeDisplay((gc_delay * maxTime) / Game.fps),
            overlay: true,
        });
        t_draw.push({
            f_percent: gc_min_delay,
            c1: COLORS.gc_min,
            name: "GC Minimum (1%)",
            display: timeDisplay((gc_min_delay * maxTime) / Game.fps),
            overlay: true,
        });
    }

    const buffConfigs = [
        { key: "clot", color: COLORS.buffs.clot, name: "Clot", mult: "multCpS" },
        { key: "elder_frenzy", color: COLORS.buffs.elder_frenzy, name: "Elder frenzy", mult: "multCpS" },
        { key: "frenzy", color: COLORS.buffs.frenzy, name: "Frenzy", mult: "multCpS" },
        { key: "dragon_harvest", color: COLORS.buffs.dragon_harvest, name: "Dragon Harvest", mult: "multCpS" },
        { key: "click_frenzy", color: COLORS.buffs.click_frenzy, name: "Click frenzy", mult: "multClick" },
        { key: "dragonflight", color: COLORS.buffs.dragonflight, name: "Dragonflight", mult: "multClick" },
        { key: "cursed_finger", color: COLORS.buffs.cursed_finger, name: "Cursed finger" },
        { key: "cookie_storm", color: COLORS.buffs.cookie_storm, name: "Cookie storm" },
    ];

    buffConfigs.forEach(cfg => {
        const delay = delays[cfg.key];
        if (delay > 0) {
            let displayName = cfg.name;
            if (cfg.mult && Game.buffs[cfg.name]) {
                displayName += " (x" + Game.buffs[cfg.name][cfg.mult] + ")";
            }
            t_draw.push({
                f_percent: delay,
                c1: cfg.color,
                name: displayName + " Time",
                display: timeDisplay(buffDuration(cfg.name) / Game.fps),
            });
        }
    });

    if (delays.building_special > 0) {
        t_draw.push({
            f_percent: delays.building_special,
            c1: COLORS.building_special,
            name: "Building Special (x" + buildingSpecialBuffValue() + ") Time",
            display: timeDisplay(hasBuildingSpecialBuff() / Game.fps),
        });
    }

    const height = $("#backgroundLeftCanvas").height() - LAYOUT.canvasHeightOffset;
    drawCircles(t_draw, 20, height);
}
