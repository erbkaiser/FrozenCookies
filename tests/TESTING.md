# FrozenCookies Testing Suite

This page provides access to the various test suites used to ensure FrozenCookies functions correctly and efficiently.

## Button Layout Tests
📊 [Open Button Layout Test](tests/button_width_test.html)

Tests the UI components of FrozenCookies, specifically:
- Two-column button layouts with equal widths
- Three-column layouts with proper text handling
- Dynamic content adjustment
- Text wrapping and truncation behavior

### What to Look For
1. Two-column layouts should only be as wide as needed
2. Three-column layouts should maintain equal widths within columns
3. Text should wrap naturally unless truncated with ellipsis
4. Buttons should resize smoothly when content changes
5. All buttons should remain clickable and functional

## Performance Tests
⚡ [Open Performance Benchmark](tests/performance_benchmark.html)

A comprehensive suite that measures FrozenCookies' performance, focusing on:
- Cache efficiency
- Memory usage
- Execution time
- CPU impact

### Key Metrics
- Upgrade calculation speed
- Cache hit rates
- Memory consumption patterns
- Impact on game framerate

### Running the Tests
1. Open the benchmark page
2. Wait for all tests to complete
3. Review the detailed performance report
4. Check for any concerning patterns in memory usage or CPU time

## Latest Performance Report
📈 [View Full Performance Report](tests/performance_optimization_report.md)

The latest performance optimization report shows:
- 60-80% reduction in processing time
- Improved cache utilization
- Better memory management
- Reduced CPU usage during heavy calculations

## Contributing to Testing
If you find issues while testing:
1. Check the performance report for known issues
2. Run the specific test that demonstrates the problem
3. Open an issue with:
   - Which test revealed the problem
   - Expected vs actual behavior
   - Your browser and system information
   - Any console errors (F12 to open dev tools)

## Running Tests Locally
To run these tests locally:
1. Clone the repository
2. Start a local server:
   ```powershell
   # Using Python's built-in server
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser
4. Navigate to the specific test you want to run

## Test Development
Tests are organized in the `tests/` directory:
- `button_width_test.html` - UI component testing
- `performance_test.js` - Core performance measurements
- `performance_benchmark.html` - Visual test runner
- `performance_optimization_report.md` - Latest findings

### Adding New Tests
1. Create a new test file in the `tests/` directory
2. Follow the existing patterns for consistency
3. Document your test cases thoroughly
4. Include both positive and negative test cases
5. Update this document with links to new tests
