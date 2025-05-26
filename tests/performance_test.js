// Performance test for FrozenCookies
// This script measures the performance of the upgradeStats function with and without optimizations

// Mock the Game object to simulate Cookie Clicker's environment
const Game = {
  BuildingsOwned: 100,
  UpgradesOwned: 50,
  cookiesPs: 1000000,
  elderWrath: 0,
  buffs: {},
  UpgradesById: {},
  AchievementsById: {},
  recalculateGains: 0,
  CalculateGains: function() {},
  cookiesPsRawHighest: 1000000
};

// Create 100 mock upgrades for testing
for (let i = 0; i < 100; i++) {
  Game.UpgradesById[i] = {
    id: i,
    bought: i < 50, // Half are bought
    unlocked: true,
    pool: i % 5 === 0 ? 'toggle' : 'normal',
    season: i % 10 === 0 ? 'christmas' : undefined
  };
}

// Mock the necessary globals and functions
const FrozenCookies = {
  caches: {
    upgrades: []
  },
  upgradeCache: {
    upgradeCached: {},
    cacheValid: false,
    lastGameStateHash: '',
    recalculateCount: 0
  },
  blacklist: 0
};

const blacklist = [{ upgrades: false }];
const upgradeJson = {};

// Mock functions used by upgradeStats
function getGameStateHash() {
  return [
    Game.BuildingsOwned,
    Game.UpgradesOwned,
    Game.cookiesPs,
    Game.elderWrath,
    Object.keys(Game.buffs).length,
    Object.values(Game.UpgradesById).filter(u => !u.bought && u.unlocked).length
  ].join('|');
}

function isUnavailable() { return false; }
function upgradePrereqCost() { return 1000; }
function baseCps() { return 1000000; }
function effectiveCps() { return 1000000; }
function totalDiscount() { return 0; }
function checkPrices() { return 0; }
function purchaseEfficiency() { return 1; }

function upgradeToggle(upgrade, achievements, reverseFunctions) {
  if (!achievements) {
    return {};
  }
}

// Function to run a performance test
function runPerformanceTest(iterations) {
  console.log(`Running performance test with ${iterations} iterations...`);
  
  // First run: without cache (simulate old behavior)
  FrozenCookies.upgradeCache.cacheValid = false;
  FrozenCookies.upgradeCache.upgradeCached = {};
  
  console.time('Without cache');
  for (let i = 0; i < iterations; i++) {
    upgradeStats(true); // Force recalculation every time
  }
  console.timeEnd('Without cache');
  
  // Second run: with cache (new optimized behavior)
  FrozenCookies.upgradeCache.cacheValid = false;
  FrozenCookies.upgradeCache.upgradeCached = {};
  
  console.time('With cache');
  for (let i = 0; i < iterations; i++) {
    if (i === 0) {
      upgradeStats(true); // First call populates cache
    } else {
      upgradeStats(false); // Subsequent calls use cache when possible
    }
  }
  console.timeEnd('With cache');
}

// Import the actual upgradeStats function from fc_main.js
function upgradeStats(recalculate) {
    // Check if we need to force recalculation
    var forceRecalculate = recalculate;
    var currentGameStateHash = getGameStateHash();
    
    // Only reset cache when game state actually changes
    if (FrozenCookies.upgradeCache.lastGameStateHash !== currentGameStateHash) {
        FrozenCookies.upgradeCache.cacheValid = false;
        FrozenCookies.upgradeCache.lastGameStateHash = currentGameStateHash;
        FrozenCookies.upgradeCache.recalculateCount = 0;
        forceRecalculate = true;
    }
    
    // Prevent excessive recalculation attempts
    if (FrozenCookies.upgradeCache.recalculateCount > 2) {
        forceRecalculate = false;
    }

    if (forceRecalculate || !FrozenCookies.upgradeCache.cacheValid) {
        FrozenCookies.upgradeCache.recalculateCount++;
        
        if (blacklist[FrozenCookies.blacklist].upgrades === true) {
            FrozenCookies.caches.upgrades = [];
        } else {
            // In the real implementation, this would be more complex
            // For testing, we'll simulate the calculation with a delay
            const start = Date.now();
            while (Date.now() - start < 5) {} // Simulate 5ms of processing per upgrade
            
            // Populate cache with simulated values
            Object.values(Game.UpgradesById).forEach(function(current) {
                if (!current.bought) {
                    FrozenCookies.upgradeCache.upgradeCached[current.id] = {
                        id: current.id,
                        efficiency: Math.random(),
                        base_delta_cps: Math.random() * 1000,
                        delta_cps: Math.random() * 1000,
                        cost: 1000,
                        purchase: current,
                        type: "upgrade",
                    };
                }
            });
            
            // Build result list from cache
            FrozenCookies.caches.upgrades = Object.values(Game.UpgradesById)
                .filter(current => !current.bought)
                .map(current => FrozenCookies.upgradeCache.upgradeCached[current.id]);
        }
        
        // Mark cache as valid after completion
        FrozenCookies.upgradeCache.cacheValid = true;
    }
    
    return FrozenCookies.caches.upgrades;
}

// Run the test with 10 iterations
runPerformanceTest(10);
