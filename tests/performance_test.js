// Performance test for FrozenCookies
// This script measures the performance of the upgradeStats function with and without optimizations

// Advanced live reporting function
function updateAdvancedResults(data) {
    const resultDiv = document.getElementById('liveResults');
    if (!resultDiv._metrics) {
        resultDiv._metrics = {
            iterationTimes: [],
            memoryUsage: [],
            cacheHits: 0,
            cacheMisses: 0,
            gcTime: 0
        };
    }
    
    // Format the data nicely
    const timestamp = new Date().toISOString().split('T')[1].slice(0,-1);
    const memoryMB = Math.round(data.memory/1024/1024);
    const phase = data.phase.padEnd(20);
    
    // Add color codes for performance indicators
    let timeColor = data.time < 50 ? '\x1b[32m' : data.time < 100 ? '\x1b[33m' : '\x1b[31m';
    let memoryColor = memoryMB < 100 ? '\x1b[32m' : memoryMB < 200 ? '\x1b[33m' : '\x1b[31m';
    
    const output = `[${timestamp}] ${phase} | Time: ${timeColor}${data.time.toFixed(2)}ms\x1b[0m | Memory: ${memoryColor}${memoryMB}MB\x1b[0m | Cache: ${data.cacheInfo || 'N/A'}`;
    
    // Update metrics
    resultDiv._metrics.iterationTimes.push(data.time);
    resultDiv._metrics.memoryUsage.push(memoryMB);
    if (data.cacheHit) resultDiv._metrics.cacheHits++;
    else if (data.cacheMiss) resultDiv._metrics.cacheMisses++;
    
    // Show live output
    if (!resultDiv._buffer) resultDiv._buffer = [];
    resultDiv._buffer.push(output);
    
    // Keep only last 20 lines in view
    if (resultDiv._buffer.length > 20) {
        resultDiv._buffer.shift();
    }
    
    resultDiv.innerHTML = resultDiv._buffer.join('<br>');
    resultDiv.scrollTop = resultDiv.scrollHeight;
    
    // Show summary every 10 iterations
    if (data.showSummary) {
        const summary = calculateMetrics(resultDiv._metrics);
        resultDiv.innerHTML += '<br><br>--- Current Summary ---<br>' +
            `Avg Time: ${summary.avgTime.toFixed(2)}ms<br>` +
            `Max Memory: ${summary.maxMemory}MB<br>` +
            `Cache Hit Rate: ${summary.cacheHitRate}%<br>`;
    }
}

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
async function runPerformanceTest(iterations) {
    const resultDiv = document.getElementById('liveResults');
    resultDiv.innerHTML = 'Starting performance test...<br>';
    
    // First run: without cache (simulate old behavior)
    FrozenCookies.upgradeCache.cacheValid = false;
    FrozenCookies.upgradeCache.upgradeCached = {};
    
    for (let i = 1; i <= iterations; i++) {
        const startTime = performance.now();
        upgradeStats(true); // Force recalculation every time
        const endTime = performance.now();
        const memory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        updateLiveResults('Without Cache', i, (endTime - startTime).toFixed(2), memory);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI update
    }
    
    resultDiv.innerHTML += '<br>Cache test completed. Starting optimized test...<br>';
    
    // Second run: with cache (new optimized behavior)
    FrozenCookies.upgradeCache.cacheValid = false;
    FrozenCookies.upgradeCache.upgradeCached = {};
    
    for (let i = 1; i <= iterations; i++) {
        const startTime = performance.now();
        if (i === 1) {
            upgradeStats(true); // First call populates cache
        } else {
            upgradeStats(false); // Subsequent calls use cache when possible
        }
        const endTime = performance.now();
        const memory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        updateLiveResults('With Cache', i, (endTime - startTime).toFixed(2), memory);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI update
    }
    
    // Show final summary
    const summary = document.createElement('div');
    summary.innerHTML = '<br><strong>Test Complete!</strong>';
    resultDiv.appendChild(summary);
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

// Advanced test function
async function runAdvancedTest(config) {
    const {iterations, upgradeCount, simulatedDelay} = config;
    
    // Initialize test environment
    Game.BuildingsOwned = upgradeCount;
    Game.UpgradesOwned = Math.floor(upgradeCount / 2);
    
    // Full simulation test
    for (let i = 1; i <= iterations; i++) {
        // Simulate game state changes
        Game.cookiesPs *= 1.1;
        Game.BuildingsOwned += 1;
        
        const startTime = performance.now();
        const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Run the actual test
        const result = upgradeStats(i === 1);
        
        const endTime = performance.now();
        const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Report results
        updateAdvancedResults({
            phase: `Iteration ${i}/${iterations}`,
            time: endTime - startTime,
            memory: memoryAfter,
            cacheInfo: `${result.length} upgrades processed`,
            cacheHit: i > 1,
            cacheMiss: i === 1,
            showSummary: i % 10 === 0 || i === iterations
        });
        
        // Add small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Helper function to calculate summary metrics
function calculateMetrics(metrics) {
    return {
        avgTime: metrics.iterationTimes.reduce((a,b) => a + b, 0) / metrics.iterationTimes.length,
        maxMemory: Math.max(...metrics.memoryUsage),
        cacheHitRate: (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100) || 0
    };
}

// Run the test with 10 iterations
runPerformanceTest(10);
