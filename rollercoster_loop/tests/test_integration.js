'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

test('browser application loads the tested physics core', () => {
  assert.match(html, /<script src="physics-model\.js"><\/script>/);
  assert.match(html, /<script src="simulation-core\.js"><\/script>/);
  assert.match(html, /window\.VerticalLoopPhysics/);
  assert.match(html, /window\.VerticalLoopSimulation/);
});

test('loop integration delegates physical calculations to physics-model.js', () => {
  assert.match(html, /stepLoopState\(\{/);
  assert.match(html, /VerticalLoopPhysics\.shouldDetach\(\{/);
  assert.doesNotMatch(html, /q < 2\.5 - 1e-7 && sim\.normal <= 0/);
});

test('critical-height control uses the shared analytical model', () => {
  assert.match(html, /criticalHeight\(Number\(el\.r\.value\)\)/);
});


test('presentation styles are externalized', () => {
  assert.match(html, /<link rel="stylesheet" href="styles\.css">/);
  assert.doesNotMatch(html, /<style>/);
});
