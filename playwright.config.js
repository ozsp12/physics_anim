const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './rollercoster_loop/tests/browser',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true
  },
  webServer: {
    command: 'python -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/vertical-loop/',
    reuseExistingServer: false
  }
});
