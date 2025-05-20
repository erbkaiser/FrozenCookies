// Various stats-related functions moved from the main script to keep it clean
// and organized. This file is loaded after the main script, so it can access all variables and functions.

// Improved statSpeed: clearer, supports 0 (off), and uses a lookup table for maintainability
function statSpeed(trackStats = FrozenCookies.trackStats) {
    // Map trackStats values to milliseconds
    const speeds = {
        0: 0, // Off
        1: 60 * 1000, // 60s
        2: 30 * 60 * 1000, // 30m
        3: 60 * 60 * 1000, // 1h
        4: 24 * 60 * 60 * 1000, // 24h
    };
    return speeds[trackStats] || 0;
}

// Improved saveStats: avoids duplicate entries, keeps stats array size reasonable, and is more robust
function saveStats(fromGraph) {
    // Only push if time has changed (avoid duplicate entries)
    const now = Date.now() - Game.startDate;
    const last =
        FrozenCookies.trackedStats[FrozenCookies.trackedStats.length - 1];
    if (!last || last.time !== now) {
        FrozenCookies.trackedStats.push({
            time: now,
            baseCps: baseCps(),
            effectiveCps: effectiveCps(),
            hc: Game.HowMuchPrestige(
                Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
            ),
            actualClicks: Game.cookieClicks,
        });
        // Limit trackedStats to last 1000 entries to avoid memory bloat
        if (FrozenCookies.trackedStats.length > 1000) {
            FrozenCookies.trackedStats =
                FrozenCookies.trackedStats.slice(-1000);
        }
    }
    // Only update graph if visible and not called from graph
    if (
        $("#statGraphContainer").length > 0 &&
        !$("#statGraphContainer").is(":hidden") &&
        !fromGraph
    ) {
        viewStatGraphs();
    }
}

// Improved viewStatGraphs: more robust, handles empty stats, resizes dynamically, and avoids unnecessary redraws
function viewStatGraphs() {
    saveStats(true);
    let containerDiv = $("#statGraphContainer");
    if (!containerDiv.length) {
        containerDiv = $("<div>")
            .attr("id", "statGraphContainer")
            .html($("<div>").attr("id", "statGraphs"))
            .appendTo("body")
            .dialog({
                modal: true,
                title: "Frozen Cookies Tracked Stats",
                width: Math.floor($(window).width() * 0.8),
                height: Math.floor($(window).height() * 0.8),
                resize: function () {
                    // Redraw on resize
                    FrozenCookies.lastGraphDraw = 0;
                    viewStatGraphs();
                },
            });
    }
    if (containerDiv.is(":hidden")) containerDiv.dialog("open");
    // Only redraw if enough time has passed and there is data
    if (
        FrozenCookies.trackedStats.length > 0 &&
        Date.now() - (FrozenCookies.lastGraphDraw || 0) > 1000
    ) {
        FrozenCookies.lastGraphDraw = Date.now();
        $("#statGraphs").empty();
        // Prepare data for jqplot: three series (baseCps, effectiveCps, hc)
        const data = [[], [], []];
        FrozenCookies.trackedStats.forEach((s) => {
            data[0].push([s.time / 1000, s.baseCps]);
            data[1].push([s.time / 1000, s.effectiveCps]);
            data[2].push([s.time / 1000, s.hc]);
        });
        // Defensive: if all series are empty, skip plotting
        if (data.every((series) => series.length === 0)) return;
        $.jqplot("statGraphs", data, {
            legend: { show: true },
            height: containerDiv.height() - 50,
            axes: {
                xaxis: {
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                    tickOptions: {
                        angle: -30,
                        fontSize: "10pt",
                        showGridline: false,
                        formatter: function (_, val) {
                            return timeDisplay(val);
                        },
                    },
                },
                yaxis: {
                    padMin: 0,
                    renderer: $.jqplot.LogAxisRenderer,
                    tickDistribution: "even",
                    tickOptions: {
                        formatter: function (_, val) {
                            return Beautify(val);
                        },
                    },
                },
                y2axis: {
                    padMin: 0,
                    tickOptions: {
                        showGridline: false,
                        formatter: function (_, val) {
                            return Beautify(val);
                        },
                    },
                },
            },
            highlighter: {
                show: true,
                sizeAdjust: 15,
            },
            series: [
                { label: "Base CPS" },
                { label: "Effective CPS" },
                { label: "Earned HC", yaxis: "y2axis" },
            ],
        });
    }
}
