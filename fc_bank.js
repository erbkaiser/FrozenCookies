
function autoBankAction() {
    if (!B || hasClickBuff()) return;

    //Upgrade bank level
    let currentOffice = B.offices[B.officeLevel];
    if (
        currentOffice.cost &&
        Game.Objects["Cursor"].amount >= currentOffice.cost[0] &&
        Game.Objects["Cursor"].level >= currentOffice.cost[1]
    ) {
        var countBankCursor = currentOffice.cost[0];
        l("bankOfficeUpgrade").click();
        safeBuy(Game.Objects["Cursor"], countBankCursor);
        FrozenCookies.autobuyCount += 1;
        logEvent(
            "AutoBank",
            "Upgrade bank level for " + countBankCursor + " cursors"
        );
        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
    }
}

function autoBrokerAction() {
    if (!B) return; // Just leave if you don't have the stock market

    //Hire brokers
    var delay = delayAmount(); //GC or harvest bank
    var recommendation = nextPurchase();
    if (
        recommendation.type == "building" && // Don't hire when saving for upgrade
        B.brokers < B.getMaxBrokers() &&
        Game.cookies >= delay + B.getBrokerPrice()
    ) {
        l("bankBrokersBuy").click();
        logEvent(
            "AutoBroker",
            "Hired a broker for " + Beautify(B.getBrokerPrice()) + " cookies"
        );
        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
    }
}

function autoLoanBuy() {
    if (!B || B.officelevel < 2) return;

    if (
        hasClickBuff() &&
        !Game.hasBuff("Cursed finger") &&
        cpsBonus() >= FrozenCookies.minLoanMult
    ) {
        if (B.officeLevel >= 2) B.takeLoan(1);
        if (B.officeLevel >= 4) B.takeLoan(2);
        if (B.officeLevel >= 5 && FrozenCookies.autoLoan == 2) B.takeLoan(3);
    }
}
